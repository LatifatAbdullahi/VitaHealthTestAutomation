import { test, expect } from "../../fixtures/api.fixtures";
import { FeedClient } from "../../clients/feed.client";
import { assertFeedResponse } from "../../schema/feed.schema";

test("Edge: invalid cursor returns 4xx", async ({ api }) => {
  const res = await api.get("/feed?cursor=INVALID_CURSOR_123");
  expect([400, 404]).toContain(res.status());

  const body = await res.json().catch(() => null);
  expect(body).toBeTruthy();
});

test("Edge: empty feed returns [] and no nextCursor", async ({ apiEmpty }) => {
  test.skip(!process.env.EMPTY_FEED_TOKEN, "EMPTY_FEED_TOKEN not set.");

  const client = new FeedClient(apiEmpty);
  const { res, body } = await client.getFeed();

  expect(res.status()).toBe(200);
  assertFeedResponse(body);

  expect(body.items).toEqual([]);
  expect(body.nextCursor).toBeUndefined();
});
