import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Pagination, PlatformFilter, SortOption } from '@pulsetrack/shared-types';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { TrackedAccountDto } from './tracked-account-response.dto';

export class TrackedAccountsQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: ['all', 'instagram', 'tiktok'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'instagram', 'tiktok'])
  platform?: PlatformFilter;

  @ApiPropertyOptional({ description: 'Search over username / display name / bio' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    enum: ['recently-added', 'most-followers', 'highest-engagement', 'last-scraped'],
    default: 'recently-added',
  })
  @IsOptional()
  @IsIn(['recently-added', 'most-followers', 'highest-engagement', 'last-scraped'])
  sort?: SortOption;
}

export class TrackedAccountsPaginationDto implements Pagination {
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() hasMore!: boolean;
  @ApiProperty() total!: number;
  @ApiProperty() pageCount!: number;
}

export class TrackedAccountsListResponseDto {
  @ApiProperty({ type: TrackedAccountDto, isArray: true })
  profiles!: TrackedAccountDto[];

  @ApiProperty({ type: TrackedAccountsPaginationDto })
  pagination!: TrackedAccountsPaginationDto;
}
