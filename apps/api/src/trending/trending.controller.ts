import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  Heatmap,
  PlatformSeries,
  TrendingHashtag,
  TrendingPost,
} from '@pulsetrack/shared-types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { TrendingService } from './trending.service';

@ApiTags('trending')
@ApiBearerAuth()
@Controller('trending')
export class TrendingController {
  constructor(private readonly trending: TrendingService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Top 10 posts in the last 24h, ranked by engagement velocity.' })
  async posts(@CurrentUser() user: AuthenticatedUser): Promise<{ posts: TrendingPost[] }> {
    return { posts: await this.trending.topPosts(user.jwt) };
  }

  @Get('hashtags')
  @ApiOperation({ summary: 'Top 20 hashtags by usage_count with growth_percent + tag-cloud weight.' })
  async hashtags(): Promise<{ hashtags: TrendingHashtag[] }> {
    return { hashtags: await this.trending.hashtags() };
  }

  @Get('platform-comparison')
  @ApiOperation({ summary: '7-day avg engagement per platform vs prior 7-day baseline.' })
  async platformComparison(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ series: PlatformSeries[] }> {
    return { series: await this.trending.platformComparison(user.jwt) };
  }

  @Get('best-times')
  @ApiOperation({ summary: '7×24 heatmap of avg engagement by weekday (Mon-first) and hour (UTC).' })
  bestTimes(@CurrentUser() user: AuthenticatedUser): Promise<Heatmap> {
    return this.trending.bestTimes(user.jwt);
  }
}
