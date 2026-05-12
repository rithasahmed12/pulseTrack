import type { Platform } from '@pulsetrack/shared-types';

export interface ParsedHandle {
  platform: Platform;
  username: string;
}

/**
 * Parse a raw user input (URL paste or `@handle`) into a { platform, username }.
 * Supports: full instagram.com / tiktok.com URLs (any protocol/subdomain),
 * `@handle on instagram|tiktok` shorthand, and bare `@handle` if a platform
 * override is provided.
 */
export function parseHandle(input: string, platformOverride?: Platform): ParsedHandle | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(instagram\.com|tiktok\.com)\/(@?)([A-Za-z0-9._]+)/i,
  );
  if (urlMatch) {
    const host = urlMatch[1]?.toLowerCase();
    const username = urlMatch[3];
    if (!host || !username) return null;
    const platform: Platform = host === 'instagram.com' ? 'instagram' : 'tiktok';
    return { platform, username: stripAt(username) };
  }

  const atMatch = trimmed.match(/^@([A-Za-z0-9._]+)$/);
  if (atMatch && atMatch[1] && platformOverride) {
    return { platform: platformOverride, username: atMatch[1] };
  }

  const bareMatch = trimmed.match(/^([A-Za-z0-9._]+)$/);
  if (bareMatch && bareMatch[1] && platformOverride) {
    return { platform: platformOverride, username: bareMatch[1] };
  }

  return null;
}

function stripAt(s: string): string {
  return s.startsWith('@') ? s.slice(1) : s;
}
