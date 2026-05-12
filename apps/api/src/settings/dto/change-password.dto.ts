import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  current!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  next!: string;
}
