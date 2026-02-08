import { test, expect } from "../../fixtures/api.fixtures";

test("Errors: backend returns 5xx when fault injected", async ({ apiFault }) => {
  test.skip(process.env.ENABLE_FAULTS !== "true", "Fault injection disabled.");

  const res = await apiFault.get("/feed");
  expect([500, 502, 503, 504]).toContain(res.status());
});
