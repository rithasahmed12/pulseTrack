import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import pLimit from 'p-limit';
import type { NormalizedPost, NormalizedProfile, Platform } from '@pulsetrack/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import { ApifyService } from './apify.client';
import { computeEngagementRate, meanEngagementRate } from './engagement';
import { InstagramNormalizer } from './instagram-normalizer';
import { MediaRehosterService } from './media-rehoster.service';
import { TikTokNormalizer } from './tiktok-normalizer';

interface TrackedAccountRow {
  id: string;
  user_id: string;
  platform: Platform;
  username: string;
  followers_count: number | null;
}

export interface ScrapeResult {
  jobId: string;
  postsScraped: number;
  newPostsCount: number;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly apify: ApifyService,
    private readonly igNormalizer: InstagramNormalizer,
    private readonly tiktokNormalizer: TikTokNormalizer,
    private readonly rehoster: MediaRehosterService,
  ) {}

  /**
   * Scrape a single tracked account end-to-end. Inserts a scrape_jobs row,
   * fetches the Apify dataset, upserts posts, updates the tracked_accounts row,
   * appends a follower snapshot, updates hashtag aggregates, and emits activity
   * events. Errors mark the job failed and emit a scrape_failed event but do
   * not throw (the caller is usually a webhook or batch loop).
   */
  async scrape(trackedAccountId: string): Promise<ScrapeResult> {
    const { data: account, error: accountError } = await this.supabase.admin
      .from('tracked_accounts')
      .select('id, user_id, platform, username, followers_count')
      .eq('id', trackedAccountId)
      .single<TrackedAccountRow>();
    if (accountError || !account) {
      throw new NotFoundException(`tracked_accounts/${trackedAccountId} not found`);
    }

    const jobId = await this.createJob(account.id);
    await this.markAccountScraping(account.id);

    try {
      const normalized = await this.fetchAndNormalize(account);
      if (!normalized) {
        throw new Error('Scraper returned no data');
      }
      const { profile, posts } = normalized;

      await this.rehostMedia(profile, posts);

      const followers = profile.followersCount || account.followers_count || 0;
      const postEngagementRates = posts.map((p) =>
        computeEngagementRate(p.likesCount, p.commentsCount, p.sharesCount, followers),
      );
      const accountEngagement = meanEngagementRate(postEngagementRates);

      const existingIds = await this.fetchExistingPostIds(
        account.id,
        posts.map((p) => p.platformPostId),
      );
      const newPosts = posts.filter((p) => !existingIds.has(p.platformPostId));

      await this.upsertPosts(account.id, posts, postEngagementRates);
      await this.updateAccount(account.id, profile, accountEngagement);
      await this.snapshotFollowers(account.id, followers);
      await this.emitNewPostEvents(account, newPosts);
      await this.completeJob(jobId, posts.length);
      await this.emitActivity(account, 'scrape_complete', `Scrape complete — ${posts.length} posts`);

      this.logger.log(
        `Scraped ${account.platform}/${account.username} → ${posts.length} posts (${newPosts.length} new)`,
      );

      return { jobId, postsScraped: posts.length, newPostsCount: newPosts.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Scrape failed for ${account.platform}/${account.username}: ${message}`);
      await this.failJob(jobId, message);
      await this.markAccountFailed(account.id, message);
      await this.emitActivity(account, 'scrape_failed', `Scrape failed: ${message}`);
      return { jobId, postsScraped: 0, newPostsCount: 0 };
    }
  }

  private async fetchAndNormalize(
    account: TrackedAccountRow,
  ): Promise<{ profile: NormalizedProfile; posts: NormalizedPost[] } | null> {
    if (account.platform === 'instagram') {
      const items = await this.apify.runInstagramScraper(account.username);
      return this.igNormalizer.normalize(items);
    }
    const items = await this.apify.runTikTokScraper(account.username);
    return this.tiktokNormalizer.normalize(items);
  }

  /**
   * Download each CDN URL (avatar, thumbnails, video files) and upload to the
   * Supabase Storage `media` bucket. Mutates the normalized objects in place,
   * replacing CDN URLs with Supabase public URLs. Failures fall back to the
   * original CDN URL so a partial outage doesn't fail the whole scrape.
   *
   * TODO: nightly sweep of storage objects against current posts.platform_post_id
   * to reclaim space when posts drop out of the latest-25 window.
   */
  private async rehostMedia(profile: NormalizedProfile, posts: NormalizedPost[]): Promise<void> {
    const avatarKey = `tracked-avatars/${profile.platform}/${profile.username}.jpg`;
    profile.avatarUrl = (await this.rehoster.rehostImage(profile.avatarUrl, avatarKey)) ?? profile.avatarUrl;

    const limit = pLimit(4);
    await Promise.all(
      posts.map((post) =>
        limit(async () => {
          const base = `posts/${post.platform}/${post.platformPostId}`;
          post.thumbnailUrl =
            (await this.rehoster.rehostImage(post.thumbnailUrl, `${base}.jpg`)) ?? post.thumbnailUrl;
          if (post.videoUrl) {
            post.videoUrl =
              (await this.rehoster.rehostVideo(post.videoUrl, `${base}.mp4`)) ?? post.videoUrl;
          }
          if (post.mediaUrls.length > 1) {
            const inner = pLimit(3);
            const rehosted = await Promise.all(
              post.mediaUrls.map((url, idx) =>
                inner(async () =>
                  (await this.rehoster.rehostImage(url, `${base}-c${idx}.jpg`)) ?? url,
                ),
              ),
            );
            post.mediaUrls = rehosted;
          }
        }),
      ),
    );
  }

  private async createJob(trackedAccountId: string): Promise<string> {
    const { data, error } = await this.supabase.admin
      .from('scrape_jobs')
      .insert({
        tracked_account_id: trackedAccountId,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single<{ id: string }>();
    if (error || !data) {
      throw new Error(`Failed to create scrape job: ${error?.message ?? 'unknown'}`);
    }
    return data.id;
  }

  private async completeJob(jobId: string, postsScraped: number): Promise<void> {
    await this.supabase.admin
      .from('scrape_jobs')
      .update({
        status: 'completed',
        posts_scraped: postsScraped,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }

  private async failJob(jobId: string, error: string): Promise<void> {
    await this.supabase.admin
      .from('scrape_jobs')
      .update({
        status: 'failed',
        error_message: error.slice(0, 1000),
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }

  private async markAccountScraping(trackedAccountId: string): Promise<void> {
    await this.supabase.admin
      .from('tracked_accounts')
      .update({ scrape_status: 'scraping', scrape_error: null })
      .eq('id', trackedAccountId);
  }

  private async markAccountFailed(trackedAccountId: string, error: string): Promise<void> {
    await this.supabase.admin
      .from('tracked_accounts')
      .update({ scrape_status: 'failed', scrape_error: error.slice(0, 500) })
      .eq('id', trackedAccountId);
  }

  private async fetchExistingPostIds(
    trackedAccountId: string,
    platformPostIds: string[],
  ): Promise<Set<string>> {
    if (platformPostIds.length === 0) return new Set();
    const { data } = await this.supabase.admin
      .from('posts')
      .select('platform_post_id')
      .eq('tracked_account_id', trackedAccountId)
      .in('platform_post_id', platformPostIds);
    return new Set((data ?? []).map((row) => row.platform_post_id as string));
  }

  private async upsertPosts(
    trackedAccountId: string,
    posts: NormalizedPost[],
    engagementRates: number[],
  ): Promise<void> {
    if (posts.length === 0) return;
    const rows = posts.map((p, i) => ({
      tracked_account_id: trackedAccountId,
      platform: p.platform,
      platform_post_id: p.platformPostId,
      post_type: p.postType,
      caption: p.caption,
      thumbnail_url: p.thumbnailUrl,
      media_urls: p.mediaUrls,
      video_url: p.videoUrl,
      likes_count: p.likesCount,
      comments_count: p.commentsCount,
      shares_count: p.sharesCount,
      saves_count: p.savesCount,
      views_count: p.viewsCount,
      engagement_rate: engagementRates[i] ?? 0,
      hashtags: p.hashtags,
      video_duration_seconds: p.videoDurationSeconds,
      posted_at: p.postedAt,
      scraped_at: new Date().toISOString(),
      raw_data: p.rawData,
    }));
    const { error } = await this.supabase.admin
      .from('posts')
      .upsert(rows, { onConflict: 'platform,platform_post_id' });
    if (error) {
      throw new Error(`upsertPosts failed: ${error.message}`);
    }
  }

  private async updateAccount(
    trackedAccountId: string,
    profile: NormalizedProfile,
    engagementRate: number,
  ): Promise<void> {
    await this.supabase.admin
      .from('tracked_accounts')
      .update({
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        is_verified: profile.isVerified,
        joined_at: profile.joinedAt,
        followers_count: profile.followersCount,
        following_count: profile.followingCount,
        posts_count: profile.postsCount,
        engagement_rate: engagementRate,
        last_scraped_at: new Date().toISOString(),
        scrape_status: 'idle',
        scrape_error: null,
      })
      .eq('id', trackedAccountId);
  }

  private async snapshotFollowers(trackedAccountId: string, followersCount: number): Promise<void> {
    await this.supabase.admin
      .from('follower_snapshots')
      .insert({ tracked_account_id: trackedAccountId, followers_count: followersCount });
  }

  private async emitNewPostEvents(
    account: TrackedAccountRow,
    newPosts: NormalizedPost[],
  ): Promise<void> {
    if (newPosts.length === 0) return;
    // Look up the DB ids of the freshly-upserted posts so the notification bell
    // can deeplink straight to /posts?postId=<id> rather than to the profile page.
    const platformPostIds = newPosts.map((p) => p.platformPostId);
    const { data: postIdRows } = await this.supabase.admin
      .from('posts')
      .select('id, platform_post_id')
      .eq('tracked_account_id', account.id)
      .in('platform_post_id', platformPostIds);
    const idByPlatformPostId = new Map<string, string>();
    for (const row of (postIdRows as Array<{ id: string; platform_post_id: string }> | null) ?? []) {
      idByPlatformPostId.set(row.platform_post_id, row.id);
    }
    const rows = newPosts.map((p) => ({
      user_id: account.user_id,
      tracked_account_id: account.id,
      event_type: 'new_post',
      platform: account.platform,
      message: `New ${p.postType} from @${account.username}`,
      metadata: {
        post_id: idByPlatformPostId.get(p.platformPostId) ?? null,
        platform_post_id: p.platformPostId,
        posted_at: p.postedAt,
      },
    }));
    await this.supabase.admin.from('activity_log').insert(rows);
  }

  private async emitActivity(
    account: TrackedAccountRow,
    eventType: 'scrape_complete' | 'scrape_failed',
    message: string,
  ): Promise<void> {
    await this.supabase.admin.from('activity_log').insert({
      user_id: account.user_id,
      tracked_account_id: account.id,
      event_type: eventType,
      platform: account.platform,
      message,
    });
  }
}
