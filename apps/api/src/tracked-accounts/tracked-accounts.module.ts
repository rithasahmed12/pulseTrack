import { Module } from '@nestjs/common';
import { ScraperModule } from '../scraper/scraper.module';
import { TrackedAccountsController } from './tracked-accounts.controller';
import { TrackedAccountsService } from './tracked-accounts.service';

@Module({
  imports: [ScraperModule],
  controllers: [TrackedAccountsController],
  providers: [TrackedAccountsService],
  exports: [TrackedAccountsService],
})
export class TrackedAccountsModule {}
