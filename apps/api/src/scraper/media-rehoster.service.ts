import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '../config/env.validation';
import { SupabaseService } from '../supabase/supabase.service';

const BUCKET = 'media';
const MAX_BYTES = 50 * 1024 * 1024;
const BASE_HEADERS = {
  'User-Agent': 'PulseTrackBot/0.1 (+https://pulsetrack.dev)',
  Accept: 'image/*,video/*,*/*',
};

@Injectable()
export class MediaRehosterService {
  private readonly logger = new Logger(MediaRehosterService.name);
  private readonly apifyToken: string;

  constructor(
    private readonly supabase: SupabaseService,
    config: ConfigService<EnvVars, true>,
  ) {
    this.apifyToken = config.get('APIFY_API_TOKEN', { infer: true });
  }

  private buildHeaders(sourceUrl: string): HeadersInit {
    const headers: Record<string, string> = { ...BASE_HEADERS };
    try {
      const host = new URL(sourceUrl).host;
      if (host === 'api.apify.com' && this.apifyToken) {
        headers.Authorization = `Bearer ${this.apifyToken}`;
      }
    } catch {
      // ignore malformed URL — fetch will fail with a clearer error below
    }
    return headers;
  }

  async rehostImage(sourceUrl: string | null | undefined, storageKey: string): Promise<string | null> {
    return this.rehost(sourceUrl, storageKey, 'image');
  }

  async rehostVideo(sourceUrl: string | null | undefined, storageKey: string): Promise<string | null> {
    return this.rehost(sourceUrl, storageKey, 'video');
  }

  private async rehost(
    sourceUrl: string | null | undefined,
    storageKey: string,
    kind: 'image' | 'video',
  ): Promise<string | null> {
    if (!sourceUrl) return null;
    try {
      const response = await fetch(sourceUrl, { headers: this.buildHeaders(sourceUrl), redirect: 'follow' });
      if (!response.ok) {
        this.logger.warn(`rehost(${kind}) ${storageKey}: upstream ${response.status} ${response.statusText}`);
        return null;
      }

      const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
      if (!contentType.startsWith(`${kind}/`)) {
        this.logger.warn(`rehost(${kind}) ${storageKey}: bad content-type "${contentType}"`);
        return null;
      }

      const declaredLen = Number(response.headers.get('content-length') ?? '0');
      if (declaredLen > MAX_BYTES) {
        this.logger.warn(`rehost(${kind}) ${storageKey}: content-length ${declaredLen} exceeds cap`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_BYTES) {
        this.logger.warn(`rehost(${kind}) ${storageKey}: byte length ${arrayBuffer.byteLength} out of range`);
        return null;
      }

      const { error: uploadError } = await this.supabase.admin.storage
        .from(BUCKET)
        .upload(storageKey, arrayBuffer, {
          upsert: true,
          contentType,
          cacheControl: '604800',
        });
      if (uploadError) {
        this.logger.warn(`rehost(${kind}) ${storageKey}: upload failed: ${uploadError.message}`);
        return null;
      }

      const { data } = this.supabase.admin.storage.from(BUCKET).getPublicUrl(storageKey);
      return data.publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`rehost(${kind}) ${storageKey}: ${message}`);
      return null;
    }
  }
}
