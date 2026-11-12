export interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const tokens = new Map<string, CachedToken>();

export function getCachedToken(key: string, now = Date.now()): string | null {
  const token = tokens.get(key);
  if (!token || token.expiresAt <= now) {
    tokens.delete(key);
    return null;
  }
  return token.accessToken;
}

export function cacheToken(key: string, accessToken: string, expiresInSeconds: number, now = Date.now()): void {
  const safeTtlSeconds = Math.max(0, expiresInSeconds - 60);
  tokens.set(key, { accessToken, expiresAt: now + safeTtlSeconds * 1000 });
}

export function clearCachedToken(key: string): void {
  tokens.delete(key);
}

export function clearAllCachedTokens(): void {
  tokens.clear();
}
