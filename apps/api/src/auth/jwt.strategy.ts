import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwksClient, { JwksClient } from 'jwks-rsa';
import { decode as decodeJwt } from 'jsonwebtoken';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { EnvVars } from '../config/env.validation';

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  exp?: number;
  iat?: number;
  role?: string;
}

const fromAuthHeader = ExtractJwt.fromAuthHeaderAsBearerToken();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static readonly logger = new Logger(JwtStrategy.name);

  constructor(config: ConfigService<EnvVars, true>) {
    const supabaseUrl = config.get('SUPABASE_URL', { infer: true });
    const legacySecret = config.get('SUPABASE_JWT_SECRET', { infer: true });

    const jwks: JwksClient = jwksClient({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });

    super({
      jwtFromRequest: fromAuthHeader,
      ignoreExpiration: false,
      passReqToCallback: true,
      algorithms: ['HS256', 'RS256', 'ES256'],
      secretOrKeyProvider: (
        _req: Request,
        rawJwt: string,
        done: (err: Error | null, key?: string | Buffer) => void,
      ) => {
        try {
          const decoded = decodeJwt(rawJwt, { complete: true });
          if (!decoded || typeof decoded === 'string') {
            return done(new UnauthorizedException('Malformed token'));
          }
          const { alg, kid } = decoded.header;
          if (alg === 'HS256') {
            return done(null, legacySecret);
          }
          if (!kid) {
            return done(new UnauthorizedException('Token missing kid'));
          }
          jwks.getSigningKey(kid, (err, signingKey) => {
            if (err || !signingKey) {
              JwtStrategy.logger.warn(`JWKS lookup failed for kid=${kid}: ${err?.message}`);
              return done(err ?? new UnauthorizedException('Signing key not found'));
            }
            done(null, signingKey.getPublicKey());
          });
        } catch (err) {
          done(err instanceof Error ? err : new UnauthorizedException('Token decode failed'));
        }
      },
    });
  }

  validate(req: Request, payload: SupabaseJwtPayload): AuthenticatedUser {
    const jwt = fromAuthHeader(req);
    if (!jwt) {
      throw new UnauthorizedException('Missing bearer token');
    }
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing sub');
    }
    return {
      id: payload.sub,
      email: payload.email ?? '',
      jwt,
    };
  }
}
