import { ApiProperty } from '@nestjs/swagger';
import type { Platform } from '@pulsetrack/shared-types';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class AddTrackedDto {
  @ApiProperty({
    description: 'URL paste or `@handle`. Examples: `https://instagram.com/foo`, `@bar`',
    example: 'https://instagram.com/humansofny',
  })
  @IsString()
  @MinLength(1)
  input!: string;

  @ApiProperty({
    description: 'Required if `input` is a bare `@handle` (platform cannot be inferred).',
    enum: ['instagram', 'tiktok'],
    required: false,
  })
  @IsOptional()
  @IsIn(['instagram', 'tiktok'])
  platform?: Platform;
}
