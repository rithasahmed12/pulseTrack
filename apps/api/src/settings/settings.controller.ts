import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AppearanceState,
  NotificationPreference,
  SecurityState,
} from '@pulsetrack/shared-types';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdateTwoFactorDto } from './dto/update-two-factor.dto';
import { SettingsService, type SettingsResponse } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Workspace settings — security + notifications + appearance.' })
  get(@CurrentUser() user: AuthenticatedUser): Promise<SettingsResponse> {
    return this.service.get(user.id, user.jwt);
  }

  @Patch('notifications')
  @ApiOperation({ summary: 'Toggle a single notification preference.' })
  toggleNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationDto,
  ): Promise<NotificationPreference[]> {
    return this.service.toggleNotification(user.id, user.jwt, dto);
  }

  @Patch('appearance')
  @ApiOperation({ summary: 'Patch accent color and/or default sidebar state.' })
  updateAppearance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAppearanceDto,
  ): Promise<AppearanceState> {
    return this.service.updateAppearance(user.id, user.jwt, dto);
  }

  @Patch('two-factor')
  @ApiOperation({ summary: 'Toggle the two-factor-enabled flag. TOTP setup is out of scope.' })
  toggleTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTwoFactorDto,
  ): Promise<SecurityState> {
    return this.service.toggleTwoFactor(user.id, user.jwt, dto);
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the account password (re-verifies current first).' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ ok: true }> {
    return this.service.changePassword(user.id, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hard-delete the account. The Supabase auth user is removed; profile cascades.',
  })
  async deleteAccount(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.service.deleteAccount(user.id);
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="pulsetrack-export.csv"')
  @ApiOperation({ summary: 'CSV export of tracked accounts (v0.1 — posts export TBD).' })
  exportCsv(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return this.service.exportCsv(user.id, user.jwt);
  }
}
