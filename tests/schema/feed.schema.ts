import { expect } from "@playwright/test";

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function assertFeedItem(item: any) {
  expect(item).toBeTruthy();
  expect(typeof item).toBe("object");
  expect(isNonEmptyString(item.id)).toBeTruthy();
  expect(isNonEmptyString(item.type)).toBeTruthy();
  expect(isNonEmptyString(item.timestamp)).toBeTruthy();
}

export function assertFeedResponse(body: any) {
  expect(body).toBeTruthy();
  expect(typeof body).toBe("object");
  expect(Array.isArray(body.items)).toBeTruthy();
  for (const it of body.items) assertFeedItem(it);

  if (body.nextCursor !== undefined) {
    expect(typeof body.nextCursor).toBe("string");
    expect(body.nextCursor.length).toBeGreaterThan(0);
  }
}
