import type {
  EngagementPoint,
  Platform,
  Post,
  PostType,
  ProfilePost,
  TopPost,
  TrendingPost,
} from '@pulsetrack/shared-types';

export interface PostRow {
  id: string;
  platform: Platform;
  platform_post_id: string;
  post_type: PostType;
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
  tracked_accounts?: {
    username: string;
    display_name: string | null;
  } | null;
}

export function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 360;
}

/**
 * UI EngagementPoint expects 7 days of data. We do not currently snapshot
 * post-level engagement over time, so we return a flat synthetic series at
 * the post's current engagement_rate. The detail-modal chart still renders.
 */
function engagementOverTime(rate: number): EngagementPoint[] {
  return Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: rate }));
}

export function toPost(row: PostRow): Post {
  const rate = row.engagement_rate ?? 0;
  return {
    id: row.id,
    platform: row.platform,
    profileUsername: row.tracked_accounts?.username ?? '',
    profileDisplayName: row.tracked_accounts?.display_name ?? row.tracked_accounts?.username ?? '',
    postType: row.post_type,
    caption: row.caption ?? '',
    hashtags: row.hashtags ?? [],
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    shares: row.shares_count,
    saves: row.saves_count,
    views: row.views_count,
    engagementRate: rate,
    postedAt: row.posted_at,
    thumbnailUrl: row.thumbnail_url,
    thumbnailHue: hueFromId(row.id),
    engagementOverTime: engagementOverTime(rate),
  };
}

export function toTopPost(row: PostRow): TopPost {
  return {
    id: row.id,
    platform: row.platform,
    profileUsername: row.tracked_accounts?.username ?? '',
    profileDisplayName: row.tracked_accounts?.display_name ?? row.tracked_accounts?.username ?? '',
    postType: row.post_type,
    caption: row.caption ?? '',
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    shares: row.shares_count,
    saves: row.saves_count,
    views: row.views_count,
    engagementRate: row.engagement_rate ?? 0,
    postedAt: row.posted_at,
    thumbnailUrl: row.thumbnail_url,
    thumbnailHue: hueFromId(row.id),
  };
}

export function toProfilePost(row: PostRow): ProfilePost {
  return {
    id: row.id,
    platform: row.platform,
    profileUsername: row.tracked_accounts?.username ?? '',
    profileDisplayName: row.tracked_accounts?.display_name ?? row.tracked_accounts?.username ?? '',
    postType: row.post_type,
    caption: row.caption ?? '',
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    shares: row.shares_count,
    saves: row.saves_count,
    views: row.views_count,
    engagementRate: row.engagement_rate ?? 0,
    postedAt: row.posted_at,
    thumbnailUrl: row.thumbnail_url,
    thumbnailHue: hueFromId(row.id),
  };
}

export interface TrendingRow extends PostRow {
  account_engagement_rate?: number;
}

export function toTrendingPost(row: TrendingRow): TrendingPost {
  const postRate = row.engagement_rate ?? 0;
  const baseRate = row.account_engagement_rate ?? 0;
  const velocity = baseRate > 0 ? ((postRate - baseRate) / baseRate) * 100 : 0;
  return {
    id: row.id,
    platform: row.platform,
    profileUsername: row.tracked_accounts?.username ?? '',
    profileDisplayName: row.tracked_accounts?.display_name ?? row.tracked_accounts?.username ?? '',
    caption: row.caption ?? '',
    engagementRate: postRate,
    velocityPercent: Math.round(velocity * 10) / 10,
    thumbnailUrl: row.thumbnail_url,
    thumbnailHue: hueFromId(row.id),
    postedAt: row.posted_at,
  };
}
