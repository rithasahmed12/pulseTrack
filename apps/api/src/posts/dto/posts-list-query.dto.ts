import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  Pagination,
  Post,
  PostType,
  PostTypeFilter,
  PostsPlatformFilter,
  TopPost,
} from '@pulsetrack/shared-types';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PostsListQueryDto {
  @ApiPropertyOptional({ enum: ['all', 'photo', 'video', 'carousel', 'reel'], default: 'all' })
  @IsOptional()
  @IsIn(['all', 'photo', 'video', 'carousel', 'reel'])
  type?: PostTypeFilter;

  @ApiPropertyOptional({ enum: ['both', 'instagram', 'tiktok'], default: 'both' })
  @IsOptional()
  @IsIn(['both', 'instagram', 'tiktok'])
  platform?: PostsPlatformFilter;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ['engagement', 'posted-at', 'likes'], default: 'posted-at' })
  @IsOptional()
  @IsIn(['engagement', 'posted-at', 'likes'])
  sortBy?: 'engagement' | 'posted-at' | 'likes';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minEngagement?: number;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Full-text search over caption + hashtags' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}

export class PaginationDto implements Pagination {
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() hasMore!: boolean;
}

export class PostsListResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  posts!: Post[];

  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;
}

export class TopPostsResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  posts!: TopPost[];
}

const _postTypeUsed: PostType = 'photo';
export { _postTypeUsed as POST_TYPE_REFERENCE };
