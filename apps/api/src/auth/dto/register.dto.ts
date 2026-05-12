import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'analyst@pulsetrack.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'min-8-chars', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, example: 'Riley Analyst' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
