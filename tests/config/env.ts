export const env = {
  baseURL: process.env.API_BASE_URL || "http://localhost:3000",
  apiToken: process.env.API_TOKEN || "",
  emptyFeedToken: process.env.EMPTY_FEED_TOKEN || "",
  enableFaults: process.env.ENABLE_FAULTS === "true",
  responseTimeMs: Number(process.env.RESPONSE_TIME_MS || 1200),
};
