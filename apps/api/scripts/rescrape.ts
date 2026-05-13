import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ScraperService } from '../src/scraper/scraper.service';
import { SupabaseService } from '../src/supabase/supabase.service';

const log = new Logger('Rescrape');

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: false });
  const supabase = app.get(SupabaseService);
  const scraper = app.get(ScraperService);

  const { data, error } = await supabase.admin
    .from('tracked_accounts')
    .select('id, platform, username')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) {
    log.error(`Failed to list tracked accounts: ${error.message}`);
    await app.close();
    process.exit(1);
  }
  const accounts = (data ?? []) as { id: string; platform: string; username: string }[];
  log.log(`Found ${accounts.length} active tracked accounts`);

  for (const acc of accounts) {
    log.log(`→ Scraping ${acc.platform}/${acc.username} (${acc.id})`);
    try {
      const res = await scraper.scrape(acc.id);
      log.log(`  ✓ posts=${res.postsScraped} new=${res.newPostsCount} job=${res.jobId}`);
    } catch (err) {
      log.error(`  ✗ ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await app.close();
  process.exit(0);
}

void main();
