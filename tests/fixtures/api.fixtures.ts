import { test as base, request } from "@playwright/test";
import { env } from "../config/env";

type ApiFixtures = {
  api: import("@playwright/test").APIRequestContext;
  apiEmpty: import("@playwright/test").APIRequestContext;
  apiFault: import("@playwright/test").APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  api: async ({}, use) => {
    const ctx = await request.newContext({
      baseURL: env.baseURL,
      extraHTTPHeaders: env.apiToken ? { Authorization: `Bearer ${env.apiToken}` } : undefined,
    });
    await use(ctx);
    await ctx.dispose();
  },

  apiEmpty: async ({}, use) => {
    const ctx = await request.newContext({
      baseURL: env.baseURL,
      extraHTTPHeaders: env.emptyFeedToken
        ? { Authorization: `Bearer ${env.emptyFeedToken}` }
        : undefined,
    });
    await use(ctx);
    await ctx.dispose();
  },

  apiFault: async ({}, use) => {
    const ctx = await request.newContext({
      baseURL: env.baseURL,
      extraHTTPHeaders: env.enableFaults ? { "X-Fault": "feed_500" } : undefined,
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from "@playwright/test";
