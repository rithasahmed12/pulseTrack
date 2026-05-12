import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AppUser,
  Connection,
  StatTone,
  WorkspaceStat,
} from '@pulsetrack/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateAppProfileDto } from './dto/update-app-profile.dto';

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface AuthUserRow {
  email: string | null;
}

export interface AppProfileResponse {
  user: AppUser;
  stats: WorkspaceStat[];
  connections: Connection[];
}

@Injectable()
export class AppProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string, jwt: string): Promise<AppProfileResponse> {
    const client = this.supabase.forUser(jwt);
    const profileRes = await client
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', userId)
      .maybeSingle<ProfileRow>();
    if (profileRes.error || !profileRes.data) {
      throw new NotFoundException('Profile not found');
    }

    const authRes = await this.supabase.admin.auth.admin.getUserById(userId);
    const email = ((authRes.data?.user as { email?: string } | null)?.email ?? '');

    const [trackedRes, postsRes] = await Promise.all([
      client
        .from('tracked_accounts')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      client.from('posts').select('id', { count: 'exact', head: true }),
    ]);

    const trackedCount = trackedRes.count ?? 0;
    const postsCount = postsRes.count ?? 0;
    const joinedAt = profileRes.data.created_at;

    const stats: WorkspaceStat[] = [
      {
        id: 'member-since',
        label: 'Member since',
        value: formatJoined(joinedAt),
        footnote: relativeMembership(joinedAt),
        icon: 'calendar',
        tone: 'violet' as StatTone,
      },
      {
        id: 'tracked',
        label: 'Tracked profiles',
        value: trackedCount.toString(),
        footnote: trackedCount === 1 ? '1 active' : `${trackedCount} active`,
        icon: 'users',
        tone: 'cyan' as StatTone,
      },
      {
        id: 'posts',
        label: 'Posts scraped',
        value: formatCount(postsCount),
        footnote: 'Across all tracked profiles',
        icon: 'image',
        tone: 'amber' as StatTone,
      },
    ];

    return {
      user: {
        id: profileRes.data.id,
        displayName: profileRes.data.display_name ?? 'Analyst',
        email,
        bio: profileRes.data.bio ?? '',
        avatarUrl: profileRes.data.avatar_url ?? '',
        joinedAt,
      },
      stats,
      connections: defaultConnections(),
    };
  }

  async updateProfile(userId: string, jwt: string, dto: UpdateAppProfileDto): Promise<AppUser> {
    const client = this.supabase.forUser(jwt);
    const patch: Record<string, string | null> = {};
    if (typeof dto.displayName === 'string') patch.display_name = dto.displayName.trim();
    if (typeof dto.bio === 'string') patch.bio = dto.bio.trim();
    if (typeof dto.avatarUrl === 'string') patch.avatar_url = dto.avatarUrl || null;

    if (Object.keys(patch).length === 0) {
      const fresh = await this.getProfile(userId, jwt);
      return fresh.user;
    }

    const { data, error } = await client
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select('id, display_name, avatar_url, bio, created_at')
      .single<ProfileRow>();
    if (error || !data) throw new BadRequestException(error?.message ?? 'Update failed');

    const authRes = await this.supabase.admin.auth.admin.getUserById(userId);
    const email = ((authRes.data?.user as AuthUserRow | null)?.email ?? '');

    return {
      id: data.id,
      displayName: data.display_name ?? 'Analyst',
      email,
      bio: data.bio ?? '',
      avatarUrl: data.avatar_url ?? '',
      joinedAt: data.created_at,
    };
  }
}

function defaultConnections(): Connection[] {
  return [
    {
      platform: 'instagram',
      label: 'Instagram',
      isConnected: false,
      connectedHandle: null,
      lastSyncedAt: null,
      hint: 'Linking your own Instagram account unlocks first-party analytics — story views, reel plays, audience demographics. v0.1 ships with public-scrape only.',
    },
    {
      platform: 'tiktok',
      label: 'TikTok',
      isConnected: false,
      connectedHandle: null,
      lastSyncedAt: null,
      hint: 'Linking your own TikTok account unlocks duets, stitches, and creator-fund data. Public-scrape covers the basics in the meantime.',
    },
  ];
}

function formatJoined(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function relativeMembership(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const days = Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)));
  if (days < 1) return 'Welcome aboard';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} in`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} in`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} in`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
