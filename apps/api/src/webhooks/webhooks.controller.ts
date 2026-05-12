import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import pLimit from 'p-limit';
import { Public } from '../common/decorators/public.decorator';
import { CronSecretGuard } from '../common/guards/cron-secret.guard';
import { ScraperService } from '../scraper/scraper.service';
import { SupabaseService } from '../supabase/supabase.service';

interface DueRow {
  id: string;
}

@ApiTags('webhooks')
@Controller('webhooks/cron')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly scraper: ScraperService,
  ) {}

  @Public()
  @UseGuards(CronSecretGuard)
  @Post('rescrape-due')
  @ApiOperation({
    summary:
      'Triggered by Supabase pg_cron once per hour. Re-scrapes every active tracked account whose last_scraped_at is older than 6 hours. Bearer token must match CRON_SECRET.',
  })
  async rescrapeDue(): Promise<{ scanned: number; scraped: number; failed: number }> {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.supabase.admin
      .from('tracked_accounts')
      .select('id')
      .eq('is_active', true)
      .or(`last_scraped_at.is.null,last_scraped_at.lt.${sixHoursAgo}`)
      .limit(100);
    if (error) {
      this.logger.error(`Failed to query due accounts: ${error.message}`);
      return { scanned: 0, scraped: 0, failed: 0 };
    }
    const due = (data as DueRow[]) ?? [];

    const limit = pLimit(3);
    let scraped = 0;
    let failed = 0;
    await Promise.all(
      due.map((row) =>
        limit(async () => {
          try {
            const result = await this.scraper.scrape(row.id);
            if (result.postsScraped > 0) scraped += 1;
          } catch (err) {
            failed += 1;
            this.logger.error(
              `Scrape failed for ${row.id}: ${err instanceof Error ? err.message : err}`,
            );
          }
        }),
      ),
    );
    return { scanned: due.length, scraped, failed };
  }
}
