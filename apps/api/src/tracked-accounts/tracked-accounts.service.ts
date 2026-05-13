import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Pagination } from '@pulsetrack/shared-types';
import { ScraperService } from '../scraper/scraper.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AddTrackedDto } from './dto/add-tracked.dto';
import { TrackedAccountDto } from './dto/tracked-account-response.dto';
import { TrackedAccountsQueryDto } from './dto/tracked-accounts-query.dto';
import { parseHandle } from './url-parser';

const NEW_BADGE_MS = 24 * 60 * 60 * 1000;

interface TrackedAccountRow {
  id: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  engagement_rate: number | null;
  last_scraped_at: string | null;
  scrape_status: 'idle' | 'scraping' | 'failed' | null;
  scrape_error: string | null;
  is_active: boolean;
  created_at: string;
}

@Injectable()
export class TrackedAccountsService {
  private readonly logger = new Logger(TrackedAccountsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly scraper: ScraperService,
  ) {}

  async list(
    userId: string,
    jwt: string,
    query: TrackedAccountsQueryDto = {},
  ): Promise<{ profiles: TrackedAccountDto[]; pagination: Pagination }> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.limit ?? 8;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const client = this.supabase.forUser(jwt);
    let q = client
      .from('tracked_accounts')
      .select(
        'id, platform, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, scrape_status, scrape_error, is_active, created_at',
        { count: 'exact' },
      )
      .eq('user_id', userId);

    if (query.platform && query.platform !== 'all') {
      q = q.eq('platform', query.platform);
    }
    if (query.q) {
      const term = query.q.trim();
      if (term) {
        const escaped = term.replace(/[,()*]/g, ' ');
        q = q.or(
          `username.ilike.%${escaped}%,display_name.ilike.%${escaped}%,bio.ilike.%${escaped}%`,
        );
      }
    }

    const sort = query.sort ?? 'recently-added';
    switch (sort) {
      case 'most-followers':
        q = q.order('followers_count', { ascending: false, nullsFirst: false });
        break;
      case 'highest-engagement':
        q = q.order('engagement_rate', { ascending: false, nullsFirst: false });
        break;
      case 'last-scraped':
        q = q.order('last_scraped_at', { ascending: false, nullsFirst: false });
        break;
      case 'recently-added':
      default:
        q = q.order('created_at', { ascending: false });
        break;
    }

    q = q.range(from, to);

    const { data, error, count } = await q;
    if (error) throw new BadRequestException(error.message);
    const rows = (data as TrackedAccountRow[]) ?? [];
    const total = count ?? 0;
    const pageCount = total === 0 ? 0 : Math.ceil(total / pageSize);
    return {
      profiles: rows.map((r) => this.toDto(r)),
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
        hasMore: page < pageCount,
      },
    };
  }

  async getById(id: string, jwt: string): Promise<TrackedAccountDto> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('tracked_accounts')
      .select(
        'id, platform, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, scrape_status, scrape_error, is_active, created_at',
      )
      .eq('id', id)
      .single<TrackedAccountRow>();
    if (error || !data) throw new NotFoundException('Tracked account not found');
    return this.toDto(data);
  }

  async add(userId: string, dto: AddTrackedDto): Promise<TrackedAccountDto> {
    const parsed = parseHandle(dto.input, dto.platform);
    if (!parsed) {
      throw new BadRequestException(
        "Couldn't parse a username from `input`. Paste an Instagram or TikTok URL, or pass `@handle` with `platform`.",
      );
    }

    const insert = await this.supabase.admin
      .from('tracked_accounts')
      .insert({
        user_id: userId,
        platform: parsed.platform,
        username: parsed.username,
        scrape_status: 'scraping',
      })
      .select(
        'id, platform, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, scrape_status, scrape_error, is_active, created_at',
      )
      .single<TrackedAccountRow>();
    if (insert.error || !insert.data) {
      if (insert.error?.code === '23505') {
        throw new ConflictException('You already track this account.');
      }
      throw new BadRequestException(insert.error?.message ?? 'Failed to add account');
    }

    void this.scrapeInBackground(insert.data.id);
    return this.toDto(insert.data);
  }

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase.admin
      .from('tracked_accounts')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new BadRequestException(error.message);
  }

  /**
   * Hard-delete a tracked account and cascade its dependents
   * (`posts`, `follower_snapshots`, `scrape_jobs` have ON DELETE CASCADE;
   * `activity_log.tracked_account_id` is ON DELETE SET NULL so history rows
   * survive without an FK reference). Ownership is enforced by the
   * `user_id = ?` clause in addition to admin-client privileges.
   */
  async purge(id: string, userId: string): Promise<void> {
    const { error, count } = await this.supabase.admin
      .from('tracked_accounts')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new BadRequestException(error.message);
    if (!count) throw new NotFoundException('Tracked account not found');
  }

  async triggerScrape(id: string, userId: string): Promise<{ jobId: string | null }> {
    const owned = await this.supabase.admin
      .from('tracked_accounts')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle<{ id: string }>();
    if (!owned.data) throw new NotFoundException('Tracked account not found');
    await this.supabase.admin
      .from('tracked_accounts')
      .update({ scrape_status: 'scraping', scrape_error: null })
      .eq('id', id);
    void this.scrapeInBackground(id);
    return { jobId: null };
  }

  async pause(id: string, userId: string, isActive: boolean): Promise<TrackedAccountDto> {
    const { data, error } = await this.supabase.admin
      .from('tracked_accounts')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', userId)
      .select(
        'id, platform, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, scrape_status, scrape_error, is_active, created_at',
      )
      .single<TrackedAccountRow>();
    if (error || !data) throw new NotFoundException('Tracked account not found');
    return this.toDto(data);
  }

  private async scrapeInBackground(trackedAccountId: string): Promise<void> {
    try {
      await this.scraper.scrape(trackedAccountId);
    } catch (err) {
      this.logger.error(
        `Background scrape error for ${trackedAccountId}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  private toDto(row: TrackedAccountRow): TrackedAccountDto {
    const createdMs = new Date(row.created_at).getTime();
    return {
      id: row.id,
      platform: row.platform,
      username: row.username,
      displayName: row.display_name ?? row.username,
      avatarUrl: row.avatar_url ?? '',
      bio: row.bio ?? '',
      followersCount: row.followers_count ?? 0,
      followingCount: row.following_count ?? 0,
      postsCount: row.posts_count ?? 0,
      engagementRate: row.engagement_rate ?? 0,
      lastScrapedAt: row.last_scraped_at,
      scrapeStatus: row.scrape_status ?? 'idle',
      scrapeError: row.scrape_error,
      isActive: row.is_active,
      isNew: Date.now() - createdMs < NEW_BADGE_MS,
      createdAt: row.created_at,
    };
  }
}
