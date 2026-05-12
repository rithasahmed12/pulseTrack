import { Injectable } from '@nestjs/common';
import type { NormalizedPost, NormalizedProfile } from '@pulsetrack/shared-types';
import { RawTikTokItem } from './apify.client';

@Injectable()
export class TikTokNormalizer {
  /**
   * The TikTok actor returns an array of video items. The profile metadata
   * lives on each video's `authorMeta`, so we read it from the first item.
   * Per discovery/FIELD_MAP.md, TikTok exposes every metric the UI wants:
   * likes (diggCount), comments, shares (shareCount), saves (collectCount),
   * views (playCount), plus joinedAt (authorMeta.createTime → ISO).
   */
  normalize(items: RawTikTokItem[]): { profile: NormalizedProfile; posts: NormalizedPost[] } | null {
    const first = items[0];
    if (!first || !first.authorMeta?.name) return null;

    const author = first.authorMeta;
    const profile: NormalizedProfile = {
      platform: 'tiktok',
      username: author.name ?? '',
      displayName: author.nickName ?? author.name ?? '',
      avatarUrl: author.avatar ?? '',
      bio: author.signature ?? '',
      isVerified: Boolean(author.verified),
      joinedAt: author.createTime ? new Date(author.createTime * 1000).toISOString() : null,
      followersCount: author.fans ?? 0,
      followingCount: author.following ?? 0,
      postsCount: author.video ?? 0,
    };

    const posts: NormalizedPost[] = items.map((item) => this.normalizePost(item));

    return { profile, posts };
  }

  private normalizePost(raw: RawTikTokItem): NormalizedPost {
    const postType: NormalizedPost['postType'] = raw.isSlideshow ? 'photo' : 'video';
    return {
      platform: 'tiktok',
      platformPostId: raw.id,
      postType,
      caption: raw.text ?? null,
      thumbnailUrl: raw.videoMeta?.coverUrl ?? raw.videoMeta?.originalCoverUrl ?? null,
      mediaUrls: raw.mediaUrls ?? [],
      likesCount: raw.diggCount ?? 0,
      commentsCount: raw.commentCount ?? 0,
      sharesCount: raw.shareCount ?? 0,
      savesCount: raw.collectCount ?? 0,
      viewsCount: raw.playCount ?? 0,
      hashtags: (raw.hashtags ?? []).map((h) => h.name ?? '').filter((s): s is string => s.length > 0),
      postedAt: raw.createTimeISO ?? new Date((raw.createTime ?? 0) * 1000).toISOString(),
      videoDurationSeconds: raw.videoMeta?.duration ?? null,
      rawData: raw,
    };
  }
}
