import { Injectable } from '@nestjs/common';
import type {
  Heatmap,
  HeatmapCell,
  Platform,
  PlatformSeries,
  PlatformSeriesPoint,
  TrendingHashtag,
  TrendingPost,
} from '@pulsetrack/shared-types';
import { TrendingRow, toTrendingPost } from '../posts/posts.mapper';
import { SupabaseService } from '../supabase/supabase.service';

interface PostRowWithAccount {
  id: string;
  platform: Platform;
  platform_post_id: string;
  post_type: 'photo' | 'video' | 'carousel' | 'reel';
  caption: string | null;
  thumbnail_url: string | null;
  likes_count: number | null;
  comments_count: number | null;
  shares_count: number | null;
  saves_count: number | null;
  views_count: number | null;
  engagement_rate: number | null;
  hashtags: string[] | null;
  posted_at: string;
  scraped_at: string;
  tracked_accounts: {
    username: string;
    display_name: string | null;
    engagement_rate: number | null;
  } | null;
}

interface HashtagRow {
  tag: string;
  usage_count: number;
  growth_percent: number | null;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Injectable()
export class TrendingService {
  constructor(private readonly supabase: SupabaseService) {}

  async topPosts(jwt: string): Promise<TrendingPost[]> {
    const client = this.supabase.forUser(jwt);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from('posts')
      .select(
        `id, platform, platform_post_id, post_type, caption, thumbnail_url,
         likes_count, comments_count, shares_count, saves_count, views_count,
         engagement_rate, hashtags, posted_at, scraped_at,
         tracked_accounts!inner ( username, display_name, engagement_rate )`,
      )
      .gte('posted_at', since)
      .order('engagement_rate', { ascending: false })
      .limit(10);
    if (error) return [];
    const rows = (data as unknown as PostRowWithAccount[]) ?? [];
    const trendingRows: TrendingRow[] = rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      platform_post_id: row.platform_post_id,
      post_type: row.post_type,
      caption: row.caption,
      thumbnail_url: row.thumbnail_url,
      video_url: null,
      media_urls: null,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      shares_count: row.shares_count,
      saves_count: row.saves_count,
      views_count: row.views_count,
      engagement_rate: row.engagement_rate,
      hashtags: row.hashtags,
      posted_at: row.posted_at,
      scraped_at: row.scraped_at,
      tracked_accounts: row.tracked_accounts
        ? { username: row.tracked_accounts.username, display_name: row.tracked_accounts.display_name }
        : null,
      account_engagement_rate: row.tracked_accounts?.engagement_rate ?? 0,
    }));
    return trendingRows.map(toTrendingPost);
  }

  async hashtags(): Promise<TrendingHashtag[]> {
    const { data, error } = await this.supabase.admin
      .from('hashtags')
      .select('tag, usage_count, growth_percent')
      .order('usage_count', { ascending: false })
      .limit(20);
    if (error) return [];
    const rows = (data as HashtagRow[]) ?? [];
    const max = rows[0]?.usage_count ?? 1;
    return rows.map((row) => ({
      tag: row.tag,
      usageCount: row.usage_count,
      growthPercent: row.growth_percent ?? 0,
      weight: max > 0 ? Math.min(1, row.usage_count / max) : 0,
    }));
  }

  async platformComparison(jwt: string): Promise<PlatformSeries[]> {
    const client = this.supabase.forUser(jwt);
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from('posts')
      .select('platform, engagement_rate, posted_at')
      .gte('posted_at', since);
    if (error) return [];
    const rows = (data as { platform: Platform; engagement_rate: number | null; posted_at: string }[]) ?? [];

    const splitWindow = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const buckets = new Map<Platform, { recent: number[]; prev: number[]; daily: Map<string, number[]> }>();
    for (const p of ['instagram', 'tiktok'] as Platform[]) {
      buckets.set(p, { recent: [], prev: [], daily: new Map() });
    }

    for (const row of rows) {
      const t = new Date(row.posted_at).getTime();
      const platform = row.platform;
      const bucket = buckets.get(platform);
      if (!bucket) continue;
      const rate = row.engagement_rate ?? 0;
      if (t >= splitWindow) {
        bucket.recent.push(rate);
        const day = row.posted_at.slice(0, 10);
        const arr = bucket.daily.get(day) ?? [];
        arr.push(rate);
        bucket.daily.set(day, arr);
      } else {
        bucket.prev.push(rate);
      }
    }

    const result: PlatformSeries[] = [];
    for (const [platform, bucket] of buckets) {
      const recentAvg = mean(bucket.recent);
      const prevAvg = mean(bucket.prev);
      const series: PlatformSeriesPoint[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        series.push({ day, value: mean(bucket.daily.get(day) ?? []) });
      }
      result.push({
        platform,
        label: platform === 'instagram' ? 'Instagram' : 'TikTok',
        currentAvgEngagement: recentAvg,
        previousAvgEngagement: prevAvg,
        deltaPercent: prevAvg > 0 ? Math.round(((recentAvg - prevAvg) / prevAvg) * 1000) / 10 : 0,
        series,
      });
    }
    return result;
  }

  async bestTimes(jwt: string): Promise<Heatmap> {
    const client = this.supabase.forUser(jwt);
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from('posts')
      .select('engagement_rate, posted_at')
      .gte('posted_at', since);
    if (error) return { weekdays: WEEKDAYS, cells: [] };
    const rows = (data as { engagement_rate: number | null; posted_at: string }[]) ?? [];

    const buckets = new Map<string, number[]>();
    for (const row of rows) {
      const d = new Date(row.posted_at);
      const dayMondayFirst = (d.getUTCDay() + 6) % 7;
      const hour = d.getUTCHours();
      const key = `${dayMondayFirst}-${hour}`;
      const arr = buckets.get(key) ?? [];
      arr.push(row.engagement_rate ?? 0);
      buckets.set(key, arr);
    }

    const cells: HeatmapCell[] = [];
    for (let day = 0; day < 7; day += 1) {
      for (let hour = 0; hour < 24; hour += 1) {
        const values = buckets.get(`${day}-${hour}`) ?? [];
        cells.push({ day, hour, value: mean(values) });
      }
    }
    return { weekdays: WEEKDAYS, cells };
  }
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}
