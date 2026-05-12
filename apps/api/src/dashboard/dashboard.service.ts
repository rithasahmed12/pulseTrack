import { Injectable } from '@nestjs/common';
import type {
  ActivityEvent,
  ActivityEventType,
  DashboardStat,
  DashboardUser,
  Platform,
  StatDelta,
  StatIcon,
  StatTone,
  TimeRange,
  TopPost,
} from '@pulsetrack/shared-types';
import { toTopPost, PostRow } from '../posts/posts.mapper';
import { SupabaseService } from '../supabase/supabase.service';

interface ActivityRow {
  id: string;
  event_type: ActivityEventType;
  platform: Platform | null;
  message: string;
  created_at: string;
  tracked_accounts: { username: string | null } | null;
}

const RANGE_MS: Record<TimeRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  async stats(jwt: string, userId: string, range: TimeRange): Promise<{ stats: DashboardStat[]; user: DashboardUser }> {
    const client = this.supabase.forUser(jwt);
    const ms = RANGE_MS[range];
    const now = Date.now();
    const fromIso = new Date(now - ms).toISOString();
    const prevFromIso = new Date(now - 2 * ms).toISOString();
    const prevToIso = fromIso;

    const [trackedRes, postsCurr, postsPrev, profile] = await Promise.all([
      client.from('tracked_accounts').select('id', { count: 'exact', head: true }).eq('is_active', true),
      client.from('posts').select('engagement_rate, hashtags, posted_at', { count: 'exact' }).gte('posted_at', fromIso),
      client.from('posts').select('engagement_rate, hashtags', { count: 'exact' }).gte('posted_at', prevFromIso).lt('posted_at', prevToIso),
      this.supabase.admin.from('profiles').select('display_name').eq('id', userId).maybeSingle<{ display_name: string | null }>(),
    ]);

    const trackedCount = trackedRes.count ?? 0;
    const currCount = postsCurr.count ?? 0;
    const prevCount = postsPrev.count ?? 0;

    const currRates = (postsCurr.data ?? []).map((r) => (r.engagement_rate as number | null) ?? 0);
    const prevRates = (postsPrev.data ?? []).map((r) => (r.engagement_rate as number | null) ?? 0);
    const currAvg = mean(currRates);
    const prevAvg = mean(prevRates);

    const currTags = new Set<string>();
    for (const row of postsCurr.data ?? []) {
      for (const t of (row.hashtags as string[] | null) ?? []) currTags.add(t.toLowerCase());
    }
    const prevTags = new Set<string>();
    for (const row of postsPrev.data ?? []) {
      for (const t of (row.hashtags as string[] | null) ?? []) prevTags.add(t.toLowerCase());
    }

    const stats: DashboardStat[] = [
      buildStat({
        id: 'tracked',
        label: 'Tracked profiles',
        icon: 'users',
        tone: 'violet',
        value: trackedCount,
        prev: trackedCount,
        prevLabel: 'active now',
        formatter: formatInt,
      }),
      buildStat({
        id: 'posts',
        label: 'Posts scraped',
        icon: 'image',
        tone: 'cyan',
        value: currCount,
        prev: prevCount,
        prevLabel: `vs prev ${range}`,
        formatter: formatInt,
      }),
      buildStat({
        id: 'engagement',
        label: 'Avg engagement',
        icon: 'trending-up',
        tone: 'amber',
        value: currAvg,
        prev: prevAvg,
        prevLabel: `vs prev ${range}`,
        formatter: (n) => `${n.toFixed(2)}%`,
      }),
      buildStat({
        id: 'tags',
        label: 'Trending hashtags',
        icon: 'hash',
        tone: 'rose',
        value: currTags.size,
        prev: prevTags.size,
        prevLabel: `vs prev ${range}`,
        formatter: formatInt,
      }),
    ];

    const displayName = profile.data?.display_name ?? 'analyst';
    const firstName = displayName.split(' ')[0] ?? displayName;
    return { stats, user: { displayName, firstName } };
  }

  async topPosts(jwt: string, range: TimeRange): Promise<TopPost[]> {
    const client = this.supabase.forUser(jwt);
    const fromIso = new Date(Date.now() - RANGE_MS[range]).toISOString();
    const { data, error } = await client
      .from('posts')
      .select(
        `id, platform, platform_post_id, post_type, caption, thumbnail_url,
         likes_count, comments_count, shares_count, saves_count, views_count,
         engagement_rate, hashtags, posted_at, scraped_at,
         tracked_accounts!inner ( username, display_name )`,
      )
      .gte('posted_at', fromIso)
      .order('engagement_rate', { ascending: false })
      .limit(6);
    if (error) return [];
    return ((data as unknown as PostRow[]) ?? []).map(toTopPost);
  }

  async activity(jwt: string): Promise<ActivityEvent[]> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('activity_log')
      .select('id, event_type, platform, message, created_at, tracked_accounts ( username )')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return [];
    return ((data as unknown as ActivityRow[]) ?? []).map((row) => ({
      id: row.id,
      type: row.event_type,
      platform: row.platform,
      profileUsername: row.tracked_accounts?.username ?? null,
      message: row.message,
      createdAt: row.created_at,
    }));
  }
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

function formatInt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatDelta(n: number): string {
  if (Math.abs(n) >= 1000) return formatInt(Math.round(n));
  if (Number.isInteger(n)) return n.toString();
  return (Math.round(n * 100) / 100).toString();
}

interface StatInput {
  id: string;
  label: string;
  icon: StatIcon;
  tone: StatTone;
  value: number;
  prev: number;
  prevLabel: string;
  formatter: (n: number) => string;
}

function buildStat(input: StatInput): DashboardStat {
  const delta = buildDelta(input.value, input.prev, input.prevLabel);
  return {
    id: input.id,
    label: input.label,
    value: input.value,
    formattedValue: input.formatter(input.value),
    icon: input.icon,
    tone: input.tone,
    delta,
  };
}

function buildDelta(value: number, prev: number, prevLabel: string): StatDelta {
  if (prev === 0 && value === 0) {
    return { value: 0, direction: 'flat', label: prevLabel };
  }
  if (prev === 0) {
    return { value: 100, direction: 'up', label: `+${formatDelta(value)} ${prevLabel}` };
  }
  const diff = value - prev;
  const percent = Math.round((diff / prev) * 100);
  const sign = diff >= 0 ? '+' : '−';
  return {
    value: Math.abs(percent),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
    label: `${sign}${formatDelta(Math.abs(diff))} ${prevLabel}`,
  };
}
