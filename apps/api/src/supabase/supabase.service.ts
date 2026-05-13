import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvVars } from '../config/env.validation';

@Injectable()
export class SupabaseService {
  /** Service-role client; bypasses RLS. Use for backend-owned writes (scraper, webhooks, seed). */
  readonly admin: SupabaseClient;

  /** Project URL — exposed so services can hit GoTrue endpoints (e.g. MFA) directly. */
  readonly url: string;
  /** Anon key — needed as the `apikey` header on direct GoTrue calls. */
  readonly anonKey: string;

  constructor(config: ConfigService<EnvVars, true>) {
    this.url = config.get('SUPABASE_URL', { infer: true });
    this.anonKey = config.get('SUPABASE_ANON_KEY', { infer: true });
    const serviceRoleKey = config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true });

    this.admin = createClient(this.url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /**
   * Returns a Supabase client scoped to a specific user's JWT.
   * Use for any read/write that should be filtered by Row Level Security.
   */
  forUser(jwt: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
  }
}
