import axios, { AxiosInstance } from "axios";

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

    // Inject auth header on every request
    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-fv-orgid"] = this.orgId;
      if (this.userId) config.headers["x-fv-userid"] = this.userId;
      return config;
    });
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 30000) {
      return this.tokenCache.accessToken;
    }

    // Exchange PAT for access token using client credentials
    const resp = await axios.post(
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