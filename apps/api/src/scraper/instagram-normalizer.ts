import { Injectable } from '@nestjs/common';
import type { NormalizedPost, NormalizedProfile, PostType } from '@pulsetrack/shared-types';
import { RawInstagramItem, RawInstagramPost } from './apify.client';
import { computeEngagementRate } from './engagement';

@Injectable()
export class InstagramNormalizer {
  /**
   * The IG actor in `resultsType: 'details'` mode returns one item per profile
   * URL with the profile metadata at the top level and `latestPosts[]` inline.
   * Per discovery/FIELD_MAP.md: shares + saves are MISSING (always null), views
   * is null on photos and present on videos/reels, joinedAt is MISSING.
   */
  normalize(items: RawInstagramItem[]): { profile: NormalizedProfile; posts: NormalizedPost[] } | null {
    const first = items[0];
    if (!first || !first.username) return null;

    const profile: NormalizedProfile = {
      platform: 'instagram',
      username: first.username,
      displayName: first.fullName ?? first.username,
      avatarUrl: first.profilePicUrlHD ?? first.profilePicUrl ?? '',
      bio: first.biography ?? '',
      isVerified: Boolean(first.verified),
      joinedAt: null,
      followersCount: first.followersCount ?? 0,
      followingCount: first.followsCount ?? 0,
      postsCount: first.postsCount ?? 0,
    };

    const followers = profile.followersCount;
    const posts: NormalizedPost[] = (first.latestPosts ?? []).map((raw) =>
      this.normalizePost(raw, followers),
    );

    return { profile, posts };
  }

  private normalizePost(raw: RawInstagramPost, followers: number): NormalizedPost {
    const postType = this.mapPostType(raw);
    const likes = raw.likesCount ?? 0;
    const comments = raw.commentsCount ?? 0;
    const views = postType === 'photo' ? null : raw.videoViewCount ?? raw.videoPlayCount ?? null;
    return {
      platform: 'instagram',
      platformPostId: raw.id,
      postType,
      caption: raw.caption ?? null,
      thumbnailUrl: raw.displayUrl ?? null,
      mediaUrls: raw.images && raw.images.length > 0 ? raw.images : raw.displayUrl ? [raw.displayUrl] : [],
      likesCount: likes,
      commentsCount: comments,
      sharesCount: null,
      savesCount: null,
      viewsCount: views,
      hashtags: raw.hashtags ?? [],
      postedAt: raw.timestamp ?? new Date().toISOString(),
      videoDurationSeconds: raw.videoDuration ?? null,
      rawData: raw,
    };
  }

  private mapPostType(raw: RawInstagramPost): PostType {
    if (raw.type === 'Sidecar') return 'carousel';
    if (raw.type === 'Image') return 'photo';
    if (raw.type === 'Video') {
      return raw.productType === 'clips' ? 'reel' : 'video';
    }
    return 'photo';
  }
}

export { computeEngagementRate };
