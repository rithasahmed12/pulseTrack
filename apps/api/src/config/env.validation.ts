import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString, validateSync } from 'class-validator';

export class EnvVars {
  @IsString()
  @IsNotEmpty()
  SUPABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_SERVICE_ROLE_KEY!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_ANON_KEY!: string;

  @IsString()
  @IsNotEmpty()
  APIFY_API_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  CRON_SECRET!: string;

  @IsNumberString()
  PORT: string = '3001';

  @IsString()
  FRONTEND_URL: string = 'http://localhost:5173';

  @IsString()
  NODE_ENV: string = 'development';
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const message = errors
      .map((e) => `  ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${message}`);
  }
  return validated;
}
