import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { NotificationsResponse } from '@pulsetrack/shared-types';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { MarkReadDto } from './dto/mark-read.dto';
import { NotificationsQueryDto } from './dto/notifications-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List recent notifications for the current user (filtered by their preferences).',
  })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NotificationsQueryDto,
  ): Promise<NotificationsResponse> {
    return this.notifications.list(user.id, user.jwt, query.limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get the unread notification count.' })
  @ApiOkResponse({ schema: { properties: { unreadCount: { type: 'number' } } } })
  unread(@CurrentUser() user: AuthenticatedUser): Promise<{ unreadCount: number }> {
    return this.notifications.getUnreadCount(user.id, user.jwt);
  }

  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notifications as read by id list or all.' })
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MarkReadDto,
  ): Promise<{ unreadCount: number }> {
    return this.notifications.markRead(user.id, user.jwt, dto);
  }
}
