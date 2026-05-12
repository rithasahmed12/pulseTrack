import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ScraperService } from '../scraper/scraper.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AddTrackedDto } from './dto/add-tracked.dto';
import { TrackedAccountDto } from './dto/tracked-account-response.dto';
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

  async list(userId: string, jwt: string): Promise<TrackedAccountDto[]> {
    const client = this.supabase.forUser(jwt);
    const { data, error } = await client
      .from('tracked_accounts')
      .select(
        'id, platform, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, engagement_rate, last_scraped_at, scrape_status, scrape_error, is_active, created_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return ((data as TrackedAccountRow[]) ?? []).map((r) => this.toDto(r));
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
