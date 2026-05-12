import { Module } from '@nestjs/common';
import { ScraperModule } from '../scraper/scraper.module';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ScraperModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
