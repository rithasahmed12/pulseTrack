import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class MarkReadDto {
  @ApiPropertyOptional({ description: 'Specific notification ids to mark read.', type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  ids?: string[];

  @ApiPropertyOptional({ description: 'When true, marks all unread notifications as read.' })
  @IsOptional()
  @IsBoolean()
  all?: boolean;
}
