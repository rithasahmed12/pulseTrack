import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  DetailedProfile,
  Platform,
  PlatformMetricRow,
  PlatformMetrics,
  PostType,
  PostTypeSlice,
  ProfilePost,
  QuickStat,
  TimePoint,
} from '@pulsetrack/shared-types';
import { toProfilePost, type PostRow } from '../posts/posts.mapper';
import { SupabaseService } from '../supabase/supabase.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface TrackedRow {
  id: string;
  platform: Platform;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  engagement_rate: number | null;
  created_at: string;
}

interface SnapshotRow {
  followers_count: number | null;
  recorded_at: string;
}

interface MetricsPostRow {
  post_type: PostType;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
  saves_count: number | null;
  views_count: number | null;
  engagement_rate: number | null;
  posted_at: string;
}

export interface ProfileDetailResponse {
  profile: DetailedProfile;
  isTracked: boolean;
  engagementSeries: TimePoint[];
  followerSeries: TimePoint[];
  postTypeBreakdown: PostTypeSlice[];
  recentPosts: ProfilePost[];
  topPost: ProfilePost | null;
  quickStats: QuickStat[];
}

@Injectable()
export class ProfileDetailService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDetail(
    platform: Platform,
    username: string,
    userId: string,
    jwt: string,
  ): Promise<ProfileDetailResponse> {
    const client = this.supabase.forUser(jwt);
    const tracked = await client
      .from('tracked_accounts')
      .select(
        'id, platform, username, display_name, avatar_url, bio, is_verified, followers_count, following_count, posts_count, engagement_rate, created_at',
      )
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('username', username)
      .maybeSingle<TrackedRow>();

    if (tracked.error) throw new NotFoundException(tracked.error.message);
    if (!tracked.data) throw new NotFoundException('Profile not tracked');

    const accountId = tracked.data.id;
    const now = Date.now();
    const windowStart = new Date(now - WINDOW_DAYS * DAY_MS);
    const prevWindowStart = new Date(now - 2 * WINDOW_DAYS * DAY_MS);
    const fromIso = windowStart.toISOString();
    const prevFromIso = prevWindowStart.toISOString();

    const [windowPostsRes, prevPostsRes, snapshotsRes, recentRes, topRes] = await Promise.all([
      client
        .from('posts')
        .select(
          'post_type, likes_count, comments_count, shares_count, saves_count, views_count, engagement_rate, posted_at',
        )
        .eq('tracked_account_id', accountId)
        .gte('posted_at', fromIso)
        .order('posted_at', { ascending: true }),
      client
        .from('posts')
        .select(
          'post_type, likes_count, comments_count, shares_count, saves_count, views_count, engagement_rate, posted_at',
        )
        .eq('tracked_account_id', accountId)
        .gte('posted_at', prevFromIso)
        .lt('posted_at', fromIso),
      client
        .from('follower_snapshots')
        .select('followers_count, recorded_at')
        .eq('tracked_account_id', accountId)
        .gte('recorded_at', fromIso)
        .order('recorded_at', { ascending: true }),
      client
        .from('posts')
        .select(
          `id, platform, platform_post_id, post_type, caption, thumbnail_url,
           likes_count, comments_count, shares_count, saves_count, views_count,
           engagement_rate, hashtags, posted_at, scraped_at,
           tracked_accounts!inner ( username, display_name )`,
        )
        .eq('tracked_account_id', accountId)
        .order('posted_at', { ascending: false })
        .limit(5),
      client
        .from('posts')
        .select(
          `id, platform, platform_post_id, post_type, caption, thumbnail_url,
           likes_count, comments_count, shares_count, saves_count, views_count,
           engagement_rate, hashtags, posted_at, scraped_at,
           tracked_accounts!inner ( username, display_name )`,
        )
        .eq('tracked_account_id', accountId)
        .gte('posted_at', fromIso)
        .order('engagement_rate', { ascending: false })
        .limit(1),
    ]);

    const windowPosts = (windowPostsRes.data as MetricsPostRow[] | null) ?? [];
    const prevPosts = (prevPostsRes.data as MetricsPostRow[] | null) ?? [];

    const engagementSeries = buildDailyAverage(
      windowPosts.map((p) => ({ date: p.posted_at, value: p.engagement_rate ?? 0 })),
      windowStart,
      now,
    );

    const followerSeries = buildFollowerSeries(
      (snapshotsRes.data as SnapshotRow[] | null) ?? [],
      tracked.data.followers_count ?? 0,
      windowStart,
      now,
    );

    const postTypeBreakdown = buildPostTypeBreakdown(windowPosts);

    const recentPosts = ((recentRes.data as unknown as PostRow[] | null) ?? []).map(toProfilePost);

    const topPost = topRes.data && topRes.data.length > 0
      ? toProfilePost((topRes.data as unknown as PostRow[])[0])
      : null;

    const platformMetrics = buildPlatformMetrics(platform, windowPosts, prevPosts);

    const profile: DetailedProfile = {
      id: tracked.data.id,
      platform: tracked.data.platform,
      username: tracked.data.username,
      displayName: tracked.data.display_name ?? tracked.data.username,
      avatarUrl: tracked.data.avatar_url ?? '',
      bio: tracked.data.bio ?? '',
      isVerified: tracked.data.is_verified ?? false,
      joinedAt: tracked.data.created_at,
      followersCount: tracked.data.followers_count ?? 0,
      followingCount: tracked.data.following_count ?? 0,
      postsCount: tracked.data.posts_count ?? 0,
      engagementRate: tracked.data.engagement_rate ?? 0,
      platformMetrics,
    };

    return {
      profile,
      isTracked: true,
      engagementSeries,
      followerSeries,
      postTypeBreakdown,
      recentPosts,
      topPost,
      quickStats: buildQuickStats(platform, windowPosts),
    };
  }
}

function buildDailyAverage(
  rows: { date: string; value: number }[],
  windowStart: Date,
  nowMs: number,
): TimePoint[] {
  const buckets = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const key = isoDay(new Date(r.date));
    const bucket = buckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += r.value;
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  const series: TimePoint[] = [];
  let last = 0;
  for (let i = 0; i < WINDOW_DAYS; i += 1) {
    const day = new Date(windowStart.getTime() + i * DAY_MS);
    if (day.getTime() > nowMs) break;
    const key = isoDay(day);
    const bucket = buckets.get(key);
    const value = bucket && bucket.count > 0 ? bucket.sum / bucket.count : last;
    last = value;
    series.push({ date: day.toISOString().slice(0, 10), value: Math.round(value * 100) / 100 });
  }
  return series;
}

function buildFollowerSeries(
  snapshots: SnapshotRow[],
  currentFollowers: number,
  windowStart: Date,
  nowMs: number,
): TimePoint[] {
  const byDay = new Map<string, number>();
  for (const s of snapshots) {
    const key = isoDay(new Date(s.recorded_at));
    byDay.set(key, s.followers_count ?? 0);
  }
  const series: TimePoint[] = [];
  let last = snapshots.length > 0 ? snapshots[0].followers_count ?? currentFollowers : currentFollowers;
  for (let i = 0; i < WINDOW_DAYS; i += 1) {
    const day = new Date(windowStart.getTime() + i * DAY_MS);
    if (day.getTime() > nowMs) break;
    const key = isoDay(day);
    if (byDay.has(key)) last = byDay.get(key) ?? last;
    series.push({ date: day.toISOString().slice(0, 10), value: last });
  }
  if (series.length > 0) series[series.length - 1].value = currentFollowers;
  return series;
}

function buildPostTypeBreakdown(posts: MetricsPostRow[]): PostTypeSlice[] {
  const counts = new Map<PostType, number>();
  for (const p of posts) counts.set(p.post_type, (counts.get(p.post_type) ?? 0) + 1);
  const out: PostTypeSlice[] = [];
  for (const [type, count] of counts) out.push({ type, count });
  out.sort((a, b) => b.count - a.count);
  return out;
}

function buildPlatformMetrics(
  platform: Platform,
  posts: MetricsPostRow[],
  prevPosts: MetricsPostRow[],
): PlatformMetrics {
  if (platform === 'instagram') {
    return {
      label: 'Instagram metrics',
      rows: [
        metricRow('Avg likes', posts, prevPosts, (p) => p.likes_count, formatCount),
        metricRow('Avg saves', posts, prevPosts, (p) => p.saves_count, formatCount),
      ],
    };
  }
  return {
    label: 'TikTok metrics',
    rows: [
      metricRow('Avg views', posts, prevPosts, (p) => p.views_count, formatCount),
      metricRow('Avg shares', posts, prevPosts, (p) => p.shares_count, formatCount),
    ],
  };
}

function metricRow(
  label: string,
  posts: MetricsPostRow[],
  prevPosts: MetricsPostRow[],
  pick: (p: MetricsPostRow) => number | null,
  formatter: (n: number) => string,
): PlatformMetricRow {
  const current = mean(posts.map(pick).filter((v): v is number => v != null));
  const previous = mean(prevPosts.map(pick).filter((v): v is number => v != null));
  const deltaPercent = previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : 0;
  return {
    label,
    value: current,
    formattedValue: formatter(Math.round(current)),
    deltaPercent,
  };
}

function buildQuickStats(platform: Platform, posts: MetricsPostRow[]): QuickStat[] {
  const likes = mean(posts.map((p) => p.likes_count ?? 0));
  const comments = mean(posts.map((p) => p.comments_count ?? 0));
  const views = mean(
    posts.map((p) => p.views_count).filter((v): v is number => v != null && v > 0),
  );

  const dayCounts = new Array(7).fill(0) as number[];
  const hourCounts = new Array(24).fill(0) as number[];
  const dayEng = new Array(7).fill(0) as number[];
  const hourEng = new Array(24).fill(0) as number[];
  for (const p of posts) {
    const d = new Date(p.posted_at);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    dayCounts[day] += 1;
    hourCounts[hour] += 1;
    dayEng[day] += p.engagement_rate ?? 0;
    hourEng[hour] += p.engagement_rate ?? 0;
  }

  let bestDay = 0;
  let bestDayAvg = -1;
  for (let i = 0; i < 7; i += 1) {
    const avg = dayCounts[i] > 0 ? dayEng[i] / dayCounts[i] : -1;
    if (avg > bestDayAvg) {
      bestDayAvg = avg;
      bestDay = i;
    }
  }

  let bestHour = 0;
  let bestHourAvg = -1;
  for (let i = 0; i < 24; i += 1) {
    const avg = hourCounts[i] > 0 ? hourEng[i] / hourCounts[i] : -1;
    if (avg > bestHourAvg) {
      bestHourAvg = avg;
      bestHour = i;
    }
  }

  const stats: QuickStat[] = [
    { label: 'Avg likes', value: likes, formattedValue: formatCount(Math.round(likes)) },
    { label: 'Avg comments', value: comments, formattedValue: formatCount(Math.round(comments)) },
  ];
  if (platform === 'tiktok' || (views > 0)) {
    stats.push({
      label: platform === 'instagram' ? 'Avg reel plays' : 'Avg views',
      value: views,
      formattedValue: formatCount(Math.round(views)),
    });
  }
  if (posts.length > 0 && bestDayAvg >= 0) {
    stats.push({
      label: 'Best posting day',
      value: bestDay,
      formattedValue: WEEKDAY_LABELS[bestDay],
    });
  }
  if (posts.length > 0 && bestHourAvg >= 0) {
    stats.push({
      label: 'Best posting hour',
      value: bestHour,
      formattedValue: `${bestHour.toString().padStart(2, '0')}:00 UTC`,
    });
  }
  return stats;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatCount(n: number): string {
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)
    return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
