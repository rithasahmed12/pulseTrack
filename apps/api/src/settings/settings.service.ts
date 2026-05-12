import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  AccentColorId,
  AppearanceState,
  NotificationPreference,
  SecurityState,
} from '@pulsetrack/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdateTwoFactorDto } from './dto/update-two-factor.dto';

interface NotificationsJson {
  new_post?: boolean;
  follower_spike?: boolean;
  trending_hashtag?: boolean;
  weekly_report?: boolean;
}

interface ProfileSettingsRow {
  accent_color: AccentColorId | null;
  sidebar_starts_collapsed: boolean | null;
  notifications: NotificationsJson | null;
  two_factor_enabled: boolean | null;
  last_password_change_at: string | null;
}

const NOTIFICATION_DESCRIPTORS: Array<Pick<NotificationPreference, 'id' | 'label' | 'description' | 'icon'>> = [
  {
    id: 'new_post',
    label: 'New post',
    description: 'Get notified when a tracked profile publishes a new post.',
    icon: 'sparkles',
  },
  {
    id: 'follower_spike',
    label: 'Follower spike',
    description: 'A tracked profile gains followers faster than usual.',
    icon: 'trending-up',
  },
  {
    id: 'trending_hashtag',
    label: 'Trending hashtag',
    description: 'A hashtag in your tracked set crosses your growth threshold.',
    icon: 'hash',
  },
  {
    id: 'weekly_report',
    label: 'Weekly report email',
    description: 'A summary of the past 7 days, delivered to your inbox each Monday.',
    icon: 'mail',
  },
];

export interface SettingsResponse {
  security: SecurityState;
  notifications: NotificationPreference[];
  appearance: AppearanceState;
}

@Injectable()
export class SettingsService {
  constructor(private readonly supabase: SupabaseService) {}

  async get(userId: string, jwt: string): Promise<SettingsResponse> {
    const row = await this.loadRow(userId, jwt);
    return {
      security: {
        twoFactorEnabled: row.two_factor_enabled ?? false,
        lastPasswordChangeAt: row.last_password_change_at ?? '',
      },
      notifications: this.buildPreferences(row.notifications),
      appearance: {
        accentColor: row.accent_color ?? 'violet',
        sidebarStartsCollapsed: row.sidebar_starts_collapsed ?? false,
      },
    };
  }

  async toggleNotification(
    userId: string,
    jwt: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationPreference[]> {
    const row = await this.loadRow(userId, jwt);
    const current = row.notifications ?? {};
    const next: NotificationsJson = { ...current, [dto.id]: dto.enabled };
    const client = this.supabase.forUser(jwt);
    const { error } = await client.from('profiles').update({ notifications: next }).eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    return this.buildPreferences(next);
  }

  async updateAppearance(
    userId: string,
    jwt: string,
    dto: UpdateAppearanceDto,
  ): Promise<AppearanceState> {
    const patch: Record<string, AccentColorId | boolean> = {};
    if (dto.accentColor) patch.accent_color = dto.accentColor;
    if (typeof dto.sidebarStartsCollapsed === 'boolean')
      patch.sidebar_starts_collapsed = dto.sidebarStartsCollapsed;
    if (Object.keys(patch).length === 0) {
      const fresh = await this.get(userId, jwt);
      return fresh.appearance;
    }
    const client = this.supabase.forUser(jwt);
    const { error } = await client.from('profiles').update(patch).eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    const row = await this.loadRow(userId, jwt);
    return {
      accentColor: row.accent_color ?? 'violet',
      sidebarStartsCollapsed: row.sidebar_starts_collapsed ?? false,
    };
  }

  async toggleTwoFactor(
    userId: string,
    jwt: string,
    dto: UpdateTwoFactorDto,
  ): Promise<SecurityState> {
    const client = this.supabase.forUser(jwt);
    const { error } = await client
      .from('profiles')
      .update({ two_factor_enabled: dto.enabled })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    const row = await this.loadRow(userId, jwt);
    return {
      twoFactorEnabled: row.two_factor_enabled ?? false,
      lastPasswordChangeAt: row.last_password_change_at ?? '',
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ ok: true }> {
    const authRes = await this.supabase.admin.auth.admin.getUserById(userId);
    const email = ((authRes.data?.user as { email?: string } | null)?.email ?? '');
    if (!email) throw new InternalServerErrorException('Account email unavailable');

    const verify = await this.supabase.admin.auth.signInWithPassword({
      email,
      password: dto.current,
    });
    if (verify.error) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const update = await this.supabase.admin.auth.admin.updateUserById(userId, {
      password: dto.next,
    });
    if (update.error) throw new BadRequestException(update.error.message);

    await this.supabase.admin
      .from('profiles')
      .update({ last_password_change_at: new Date().toISOString() })
      .eq('id', userId);

    return { ok: true };
  }

  async deleteAccount(userId: string): Promise<{ ok: true }> {
    const { error } = await this.supabase.admin.auth.admin.deleteUser(userId);
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  async exportCsv(userId: string, jwt: string): Promise<string> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('tracked_accounts')
      .select(
        'platform, username, display_name, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, is_active, created_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return rowsToCsv(
      [
        'platform',
        'username',
        'displayName',
        'followersCount',
        'followingCount',
        'postsCount',
        'engagementRate',
        'lastScrapedAt',
        'isActive',
        'createdAt',
      ],
      (data ?? []) as Record<string, unknown>[],
    );
  }

  private async loadRow(userId: string, jwt: string): Promise<ProfileSettingsRow> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('profiles')
      .select(
        'accent_color, sidebar_starts_collapsed, notifications, two_factor_enabled, last_password_change_at',
      )
      .eq('id', userId)
      .maybeSingle<ProfileSettingsRow>();
    if (error || !data) throw new BadRequestException(error?.message ?? 'Profile row missing');
    return data;
  }

  private buildPreferences(notifications: NotificationsJson | null): NotificationPreference[] {
    const json = notifications ?? {};
    return NOTIFICATION_DESCRIPTORS.map((d) => ({
      id: d.id,
      label: d.label,
      description: d.description,
      icon: d.icon,
      enabled: Boolean(json[d.id as keyof NotificationsJson] ?? false),
    }));
  }
}

function rowsToCsv(columns: string[], rows: Record<string, unknown>[]): string {
  const COL_MAP: Record<string, string> = {
    platform: 'platform',
    username: 'username',
    displayName: 'display_name',
    followersCount: 'followers_count',
    followingCount: 'following_count',
    postsCount: 'posts_count',
    engagementRate: 'engagement_rate',
    lastScrapedAt: 'last_scraped_at',
    isActive: 'is_active',
    createdAt: 'created_at',
  };
  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(
      columns
        .map((col) => {
          const dbKey = COL_MAP[col] ?? col;
          const v = row[dbKey];
          if (v === null || v === undefined) return '';
          const s = String(v);
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(','),
    );
  }
  return lines.join('\n');
}
