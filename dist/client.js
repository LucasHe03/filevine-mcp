"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilevineClient = void 0;
const axios_1 = __importDefault(require("axios"));
const REGION_CONFIG = {
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
class FilevineClient {
    constructor() {
        this.tokenCache = null;
        this.identityBase = "https://identity.filevine.com";
        const region = (process.env.FILEVINE_REGION || "us").toLowerCase();
        const config = REGION_CONFIG[region];
        if (!config)
            throw new Error(`Unknown region: ${region}`);
        this.apiBase = config.api;
        this.clientId = process.env.FILEVINE_CLIENT_ID || "";
        this.clientSecret = process.env.FILEVINE_CLIENT_SECRET || "";
        this.pat = process.env.FILEVINE_PAT || "";
        this.orgId = process.env.FILEVINE_ORG_ID || "";
        this.userId = process.env.FILEVINE_USER_ID || "";
        if (!this.clientId || !this.clientSecret || !this.pat || !this.orgId) {
            throw new Error("Missing required env vars: FILEVINE_CLIENT_ID, FILEVINE_CLIENT_SECRET, FILEVINE_PAT, FILEVINE_ORG_ID");
        }
        this.client = axios_1.default.create({ baseURL: `${this.apiBase}/fv-app/v2` });
        // Inject auth header on every request
        this.client.interceptors.request.use(async (config) => {
            const token = await this.getAccessToken();
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["x-fv-orgid"] = this.orgId;
            if (this.userId)
                config.headers["x-fv-userid"] = this.userId;
            return config;
        });
    }
    async getAccessToken() {
        const now = Date.now();
        if (this.tokenCache && this.tokenCache.expiresAt > now + 30000) {
            return this.tokenCache.accessToken;
        }
        // Exchange PAT for access token using client credentials
        const resp = await axios_1.default.post(`${this.identityBase}/connect/token`, new URLSearchParams({
            grant_type: "personal_access_token",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            token: this.pat,
            scope: "fv.api.gateway.access tenant filevine.v2.api.* email openid fv.auth.tenant.read fv.vitals.api.* fv.payments.api.all filevine.v2.webhooks",
        }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const { access_token, expires_in } = resp.data;
        this.tokenCache = {
            accessToken: access_token,
            expiresAt: now + expires_in * 1000,
        };
        return access_token;
    }
    async get(path, params) {
        const resp = await this.client.get(path, { params });
        return resp.data;
    }
    async post(path, data) {
        const resp = await this.client.post(path, data);
        return resp.data;
    }
    async put(path, data) {
        const resp = await this.client.put(path, data);
        return resp.data;
    }
    async patch(path, data) {
        const resp = await this.client.patch(path, data);
        return resp.data;
    }
    async delete(path) {
        const resp = await this.client.delete(path);
        return resp.data;
    }
    getOrgId() {
        return this.orgId;
    }
}
exports.FilevineClient = FilevineClient;
