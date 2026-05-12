import { Module } from '@nestjs/common';
import { ApifyService } from './apify.client';
import { InstagramNormalizer } from './instagram-normalizer';
import { ScraperService } from './scraper.service';
import { TikTokNormalizer } from './tiktok-normalizer';

@Module({
  providers: [ScraperService, ApifyService, InstagramNormalizer, TikTokNormalizer],
  exports: [ScraperService],
})
export class ScraperModule {}
