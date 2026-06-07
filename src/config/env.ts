import "dotenv/config";

export interface AppConfig {
  cjApiBaseUrl: string;
  cjApiKey?: string;
  cjAccessToken?: string;
  cjRefreshToken?: string;
  shopifyStoreUrl?: string;
  shopifyAccessToken?: string;
  minDropshippingScore: number;
  autoPublishMinScore: number;
}

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config: AppConfig = {
  cjApiBaseUrl: process.env.CJ_API_BASE_URL ?? "https://developers.cjdropshipping.com/api2.0/v1",
  cjApiKey: process.env.CJ_API_KEY,
  cjAccessToken: process.env.CJ_ACCESS_TOKEN,
  cjRefreshToken: process.env.CJ_REFRESH_TOKEN,
  shopifyStoreUrl: process.env.SHOPIFY_STORE_URL,
  shopifyAccessToken: process.env.SHOPIFY_ACCESS_TOKEN,
  minDropshippingScore: numberFromEnv("MIN_DROPSHIPPING_SCORE", 70),
  autoPublishMinScore: numberFromEnv("AUTO_PUBLISH_MIN_SCORE", 85)
};
