import { cacheToken, clearCachedToken, getCachedToken } from "./auth-token-cache";

const AUTH_URL = "https://autenticador.secullum.com.br/Token";
const API_BASE_URL = "https://pontowebintegracaoexterna.secullum.com.br/IntegracaoExterna";

export interface SecullumHttpConfig {
  username: string;
  password: string;
  databaseId: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class SecullumApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    public readonly code = "SECULLUM_HTTP_ERROR",
  ) {
    super(`${code}:${status}:${body}`);
  }
}

export class SecullumHttpClient {
  constructor(
    private readonly config: SecullumHttpConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    if (!config.databaseId) throw new Error("SECULLUM_CONFIG_MISSING");
  }

  private tokenKey(): string {
    return this.config.username;
  }

  private async authenticate(): Promise<string> {
    const cached = getCachedToken(this.tokenKey());
    if (cached) return cached;

    const body = new URLSearchParams({
      grant_type: "password",
      username: this.config.username,
      password: this.config.password,
      client_id: "3",
    });

    const response = await this.fetchImpl(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await response.text();
    if (!response.ok) throw new SecullumApiError(response.status, raw, "SECULLUM_AUTH_FAILED");

    let payload: TokenResponse;
    try {
      payload = JSON.parse(raw) as TokenResponse;
    } catch {
      throw new SecullumApiError(response.status, raw, "SECULLUM_AUTH_INVALID_RESPONSE");
    }
    if (!payload.access_token || !Number.isFinite(payload.expires_in)) {
      throw new SecullumApiError(response.status, raw, "SECULLUM_AUTH_INVALID_RESPONSE");
    }

    cacheToken(this.tokenKey(), payload.access_token, payload.expires_in);
    return payload.access_token;
  }

  private async execute<T>(path: string, init: RequestInit, canRetry: boolean): Promise<T> {
    const token = await this.authenticate();
    const response = await this.fetchImpl(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
        "Accept-Language": "pt-BR",
        secullumidbancoselecionado: this.config.databaseId,
        ...(init.headers ?? {}),
      },
    });

    if (response.status === 401 && canRetry) {
      clearCachedToken(this.tokenKey());
      return this.execute<T>(path, init, false);
    }

    const raw = await response.text();
    if (!response.ok) throw new SecullumApiError(response.status, raw);
    if (!raw) return undefined as T;
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new SecullumApiError(response.status, raw, "SECULLUM_INVALID_JSON");
    }
  }

  request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return this.execute<T>(path, init, true);
  }
}
