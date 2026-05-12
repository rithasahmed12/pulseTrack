import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AppUser } from '@pulsetrack/shared-types';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { AppProfileService, type AppProfileResponse } from './app-profile.service';
import { UpdateAppProfileDto } from './dto/update-app-profile.dto';

@ApiTags('app-profile')
@ApiBearerAuth()
@Controller('app-profile')
export class AppProfileController {
  constructor(private readonly service: AppProfileService) {}

  @Get()
  @ApiOperation({ summary: "Analyst's own profile + workspace stats + platform connections." })
  get(@CurrentUser() user: AuthenticatedUser): Promise<AppProfileResponse> {
    return this.service.getProfile(user.id, user.jwt);
  }

  @Patch()
  @ApiOperation({ summary: 'Update displayName / bio / avatarUrl.' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAppProfileDto,
  ): Promise<AppUser> {
    return this.service.updateProfile(user.id, user.jwt, dto);
  }
}
