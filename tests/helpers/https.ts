import { APIRequestContext, APIResponse } from "@playwright/test";

export async function safeJson(res: APIResponse) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function timedGet(req: APIRequestContext, url: string) {
  const start = Date.now();
  const res = await req.get(url);
  const durationMs = Date.now() - start;
  const body = await safeJson(res);
  return { res, body, durationMs };
}
