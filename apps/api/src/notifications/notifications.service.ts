import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  NotificationEventType,
  NotificationItem,
  NotificationsResponse,
  Platform,
} from '@pulsetrack/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import { MarkReadDto } from './dto/mark-read.dto';

const NOTIFIABLE_EVENT_TYPES: readonly NotificationEventType[] = [
  'new_post',
  'follower_spike',
  'trending_hashtag',
  'scrape_complete',
  'scrape_failed',
];

interface NotificationsJson {
  new_post?: boolean;
  follower_spike?: boolean;
  trending_hashtag?: boolean;
  weekly_report?: boolean;
  scrape_complete?: boolean;
  scrape_failed?: boolean;
}

interface ActivityRow {
  id: string;
  event_type: NotificationEventType;
  platform: Platform | null;
  message: string;
  tracked_account_id: string | null;
  metadata: { post_id?: string | null } | null;
  created_at: string;
  read_at: string | null;
  tracked_accounts: { username: string } | null;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly supabase: SupabaseService) {}

  async list(userId: string, jwt: string, limit = 20): Promise<NotificationsResponse> {
    const enabledTypes = await this.enabledEventTypes(userId, jwt);
    if (enabledTypes.length === 0) {
      return { items: [], unreadCount: 0 };
    }

    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('activity_log')
      .select(
        'id, event_type, platform, message, tracked_account_id, metadata, created_at, read_at, tracked_accounts ( username )',
      )
      .eq('user_id', userId)
      .in('event_type', enabledTypes)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new BadRequestException(error.message);

    const items: NotificationItem[] = ((data as unknown as ActivityRow[]) ?? []).map((row) => ({
      id: row.id,
      type: row.event_type as NotificationEventType,
      platform: row.platform,
      profileUsername: row.tracked_accounts?.username ?? null,
      trackedAccountId: row.tracked_account_id,
      postId: row.metadata?.post_id ?? null,
      message: row.message,
      createdAt: row.created_at,
      readAt: row.read_at,
    }));

    const unreadCount = await this.unreadCount(userId, jwt, enabledTypes);
    return { items, unreadCount };
  }

  async getUnreadCount(userId: string, jwt: string): Promise<{ unreadCount: number }> {
    const enabledTypes = await this.enabledEventTypes(userId, jwt);
    if (enabledTypes.length === 0) return { unreadCount: 0 };
    const unreadCount = await this.unreadCount(userId, jwt, enabledTypes);
    return { unreadCount };
  }

  async markRead(userId: string, jwt: string, dto: MarkReadDto): Promise<{ unreadCount: number }> {
    const client = this.supabase.forUser(jwt);
    const enabledTypes = await this.enabledEventTypes(userId, jwt);
    const nowIso = new Date().toISOString();

    if (dto.all) {
      let q = client
        .from('activity_log')
        .update({ read_at: nowIso })
        .eq('user_id', userId)
        .is('read_at', null);
      if (enabledTypes.length > 0) q = q.in('event_type', enabledTypes);
      const { error } = await q;
      if (error) throw new BadRequestException(error.message);
    } else if (dto.ids && dto.ids.length > 0) {
      const { error } = await client
        .from('activity_log')
        .update({ read_at: nowIso })
        .eq('user_id', userId)
        .in('id', dto.ids);
      if (error) throw new BadRequestException(error.message);
    }

    const unreadCount =
      enabledTypes.length === 0 ? 0 : await this.unreadCount(userId, jwt, enabledTypes);
    return { unreadCount };
  }

  private async enabledEventTypes(
    userId: string,
    jwt: string,
  ): Promise<NotificationEventType[]> {
    const client = this.supabase.forUser(jwt);
    const { data } = await client
      .from('profiles')
      .select('notifications')
      .eq('id', userId)
      .maybeSingle<{ notifications: NotificationsJson | null }>();
    const prefs = data?.notifications ?? {};
    return NOTIFIABLE_EVENT_TYPES.filter((t) => prefs[t] !== false);
  }

  private async unreadCount(
    userId: string,
    jwt: string,
    enabledTypes: NotificationEventType[],
  ): Promise<number> {
    const client = this.supabase.forUser(jwt);
    const { count, error } = await client
      .from('activity_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
      .in('event_type', enabledTypes);
    if (error) throw new BadRequestException(error.message);
    return count ?? 0;
  }
}
