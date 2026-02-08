import { test, expect } from "../../fixtures/api.fixtures";
import { env } from "../../config/env";
import { FeedClient } from "../../clients/feed.client";
import { assertFeedResponse } from "../../schema/feed.schema";

test("Happy: feed load + schema + response time", async ({ api }) => {
  const client = new FeedClient(api);
  const { res, body, durationMs } = await client.getFeed();

  expect(res.status()).toBe(200);
  expect(durationMs).toBeLessThan(env.responseTimeMs);
  assertFeedResponse(body);
});

test("Happy: pagination returns next page without duplicates", async ({ api }) => {
  const client = new FeedClient(api);

  const page1 = await client.getFeed();
  expect(page1.res.status()).toBe(200);
  assertFeedResponse(page1.body);

  test.skip(!page1.body?.nextCursor, "No nextCursor (feed may be only one page).");

  const ids1 = new Set((page1.body.items ?? []).map((x: any) => x.id));
  const page2 = await client.getFeedPage(page1.body.nextCursor);
  expect(page2.res.status()).toBe(200);
  assertFeedResponse(page2.body);

  const overlap = page2.body.items.filter((it: any) => ids1.has(it.id));
  expect(overlap).toHaveLength(0);
});
