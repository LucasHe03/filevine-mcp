import axios, { AxiosError, AxiosInstance } from "axios";

const DEBUG = process.env.FILEVINE_DEBUG === "1" || process.env.FILEVINE_DEBUG === "true";

function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...headers };
  if (safe.Authorization) safe.Authorization = "[REDACTED]";
  return safe;
}

export function formatApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : String(error);
  }
  const status = error.response?.status;
  const body = error.response?.data;
  const method = error.config?.method?.toUpperCase() ?? "?";
  const url = [error.config?.baseURL, error.config?.url].filter(Boolean).join("");
  const detail =
    body === undefined || body === null || body === ""
      ? error.message
      : typeof body === "string"
        ? body
        : JSON.stringify(body);
  return status ? `HTTP ${status} ${method} ${url}: ${detail}` : `${method} ${url}: ${detail}`;
}

function logApiError(error: AxiosError): void {
  const method = error.config?.method?.toUpperCase();
  const url = [error.config?.baseURL, error.config?.url].filter(Boolean).join("");
  console.error("[filevine-mcp] API error:", {
    method,
    url,
    params: error.config?.params,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseHeaders: error.response?.headers,
    body: error.response?.data,
  });
}

const REGION_CONFIG: Record<string, { api: string }> = {
  us: {
    api: "https://api.filevineapp.com",
  },
  ca: {
    api: "https://api.filevineapp.ca",
  },
  cjis: {
    api: "https://api.filevinegov.com",
  },
};

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

export class FilevineClient {
  private client: AxiosInstance;
  private tokenCache: TokenCache | null = null;
  private apiBase: string;
  private identityBase: string = "https://identity.filevine.com";
  private clientId: string;
  private clientSecret: string;
  private pat: string;
  private orgId: string;
  private userId: string;

  constructor() {
    const region = (process.env.FILEVINE_REGION || "us").toLowerCase();
    const config = REGION_CONFIG[region];
    if (!config) throw new Error(`Unknown region: ${region}`);

    this.apiBase = config.api;
    this.clientId = process.env.FILEVINE_CLIENT_ID || "";
    this.clientSecret = process.env.FILEVINE_CLIENT_SECRET || "";
    this.pat = process.env.FILEVINE_PAT || "";
    this.orgId = process.env.FILEVINE_ORG_ID || "";
    this.userId = process.env.FILEVINE_USER_ID || "";

    if (!this.clientId || !this.clientSecret || !this.pat || !this.orgId) {
      throw new Error(
        "Missing required env vars: FILEVINE_CLIENT_ID, FILEVINE_CLIENT_SECRET, FILEVINE_PAT, FILEVINE_ORG_ID"
      );
    }

    this.client = axios.create({ baseURL: `${this.apiBase}/fv-app/v2` });

    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-fv-orgid"] = this.orgId;
      if (this.userId) config.headers["x-fv-userid"] = this.userId;
      config.headers["Accept"] = "application/json";

      if (DEBUG) {
        const url = [config.baseURL, config.url].filter(Boolean).join("");
        console.error("[filevine-mcp] Request:", {
          method: config.method?.toUpperCase(),
          url,
          params: config.params,
          headers: redactHeaders(config.headers as Record<string, unknown>),
        });
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        if (DEBUG) {
          console.error("[filevine-mcp] Response:", {
            status: response.status,
            url: [response.config.baseURL, response.config.url].filter(Boolean).join(""),
          });
        }
        return response;
      },
      (error: AxiosError) => {
        logApiError(error);
        error.message = formatApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 30000) {
      return this.tokenCache.accessToken;
    }

    let resp;
    try {
      resp = await axios.post(
        `${this.identityBase}/connect/token`,
        new URLSearchParams({
          grant_type: "personal_access_token",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          token: this.pat,
          scope: "fv.api.gateway.access tenant filevine.v2.api.* email openid fv.auth.tenant.read fv.vitals.api.* fv.payments.api.all filevine.v2.webhooks",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[filevine-mcp] Token exchange failed:", {
          status: error.response?.status,
          body: error.response?.data,
        });
        throw new Error(formatApiError(error));
      }
      throw error;
    }

    if (DEBUG) {
      console.error("[filevine-mcp] Token exchange OK, expires_in:", resp.data.expires_in);
    }

    const { access_token, expires_in } = resp.data;
    this.tokenCache = {
      accessToken: access_token,
      expiresAt: now + expires_in * 1000,
    };
    return access_token;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const resp = await this.client.get<T>(path, { params });
    return resp.data;
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const resp = await this.client.post<T>(path, data);
    return resp.data;
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const resp = await this.client.put<T>(path, data);
    return resp.data;
  }

  async patch<T>(path: string, data?: unknown): Promise<T> {
    const resp = await this.client.patch<T>(path, data);
    return resp.data;
  }

  async delete<T>(path: string): Promise<T> {
    const resp = await this.client.delete<T>(path);
    return resp.data;
  }

  getOrgId(): string {
    return this.orgId;
  }
}