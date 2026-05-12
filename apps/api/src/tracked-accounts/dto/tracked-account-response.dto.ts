import { ApiProperty } from '@nestjs/swagger';
import type { Platform, ScrapeStatus, TrackedProfile } from '@pulsetrack/shared-types';

export class TrackedAccountDto implements TrackedProfile {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['instagram', 'tiktok'] }) platform!: Platform;
  @ApiProperty() username!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty() avatarUrl!: string;
  @ApiProperty() bio!: string;
  @ApiProperty() followersCount!: number;
  @ApiProperty() followingCount!: number;
  @ApiProperty() postsCount!: number;
  @ApiProperty() engagementRate!: number;
  @ApiProperty({ nullable: true, type: String }) lastScrapedAt!: string | null;
  @ApiProperty({ enum: ['idle', 'scraping', 'failed'] }) scrapeStatus!: ScrapeStatus;
  @ApiProperty({ nullable: true, type: String }) scrapeError!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() isNew!: boolean;
  @ApiProperty() createdAt!: string;
}
