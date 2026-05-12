import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { EnvVars } from '../../config/env.validation';

@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService<EnvVars, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const provided = auth.slice('Bearer '.length).trim();
    const expected = this.config.get('CRON_SECRET', { infer: true });
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return true;
  }
}
