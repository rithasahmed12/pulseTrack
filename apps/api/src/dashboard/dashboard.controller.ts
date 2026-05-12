import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { ActivityEvent, TimeRange, TopPost } from '@pulsetrack/shared-types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

const RANGES = ['24h', '7d', '30d'] as const;

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  @ApiQuery({ name: 'range', enum: RANGES, required: false })
  @ApiOperation({ summary: 'Four headline stat cards with deltas vs the prior window.' })
  stats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('range') range?: TimeRange,
  ) {
    return this.dashboard.stats(user.jwt, user.id, parseRange(range));
  }

  @Get('top-posts')
  @ApiQuery({ name: 'range', enum: RANGES, required: false })
  @ApiOperation({ summary: 'Six top-performing posts mixed across platforms.' })
  async topPosts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('range') range?: TimeRange,
  ): Promise<{ posts: TopPost[] }> {
    return { posts: await this.dashboard.topPosts(user.jwt, parseRange(range)) };
  }

  @Get('activity')
  @ApiOperation({ summary: 'Last 20 activity events for the current analyst.' })
  async activity(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ events: ActivityEvent[] }> {
    return { events: await this.dashboard.activity(user.jwt) };
  }
}

function parseRange(range?: TimeRange | string): TimeRange {
  if (range === '24h' || range === '7d' || range === '30d') return range;
  return '7d';
}
