import { ApiProperty } from '@nestjs/swagger';
import type { AccentColorId } from '@pulsetrack/shared-types';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

const ACCENT_IDS: AccentColorId[] = ['violet', 'cyan', 'rose', 'amber'];

export class UpdateAppearanceDto {
  @ApiProperty({ enum: ACCENT_IDS, required: false })
  @IsOptional()
  @IsIn(ACCENT_IDS)
  accentColor?: AccentColorId;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sidebarStartsCollapsed?: boolean;
}
