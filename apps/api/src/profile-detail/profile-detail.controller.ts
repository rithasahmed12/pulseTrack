import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Platform } from '@pulsetrack/shared-types';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { ProfileDetailService, type ProfileDetailResponse } from './profile-detail.service';

@ApiTags('profile-detail')
@ApiBearerAuth()
@Controller('profile-detail')
export class ProfileDetailController {
  constructor(private readonly service: ProfileDetailService) {}

  @Get(':platform/:username')
  @ApiOperation({ summary: 'Full analytics bundle for a single tracked profile.' })
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('platform') platform: string,
    @Param('username') username: string,
  ): Promise<ProfileDetailResponse> {
    return this.service.getDetail(platform as Platform, username, user.id, user.jwt);
  }
}
