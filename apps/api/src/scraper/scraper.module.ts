import { Module } from '@nestjs/common';
import { ApifyService } from './apify.client';
import { InstagramNormalizer } from './instagram-normalizer';
import { MediaRehosterService } from './media-rehoster.service';
import { ScraperService } from './scraper.service';
import { TikTokNormalizer } from './tiktok-normalizer';

@Module({
  providers: [ScraperService, ApifyService, InstagramNormalizer, TikTokNormalizer, MediaRehosterService],
  exports: [ScraperService],
})
export class ScraperModule {}
