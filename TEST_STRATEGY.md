# TEST_STRATEGY.md — Activity Feed (Mobile + Backend)

## 1) Scope & assumptions
**Feature:** Activity Feed screen in iOS/Android consuming backend API.

**Capabilities:**
- Initial load (first page)
- Pull-to-refresh
- Pagination (load more)
- Events retrieved from API and cached locally
- Error state + retry when API fails
- Must remain responsive on slow networks

**Backend endpoints:**
- `GET /feed?cursor=<id>` → `{ items: [...], nextCursor?: "<id>" }`
- `POST /event` → creates a new event

**Assumptions (call out early to avoid gaps):**
- Feed items have stable unique identifiers (e.g., `id`) and timestamps.
- Ordering is deterministic (e.g., newest-first) and documented.
- Cursor semantics are consistent (cursor points to “next page after item X”).
- Cache strategy is defined (TTL? offline-first? last-known data?).
- Auth headers/permissions exist (if applicable).

---

## 2) Quality risks & failure modes

### A) Functional risks
1. **Incorrect ordering / missing items**
   - Duplicate items across pages, skipped items between pages, unstable sorting.
2. **Pagination cursor bugs**
   - `nextCursor` missing too early/late; cursor loops; cursor invalidation after refresh.
3. **Refresh behavior conflicts**
   - Refresh resets list but pagination state not reset; refresh merges incorrectly causing duplicates.
4. **Cache consistency**
   - Stale cache shown even after successful refresh; cache overwritten with partial data; cache not updated after `POST /event`.
5. **Error & retry correctness**
   - Wrong error state on partial failure; retry uses wrong cursor; retry spams multiple requests.
6. **Concurrency / race conditions**
   - Pull-to-refresh while pagination in progress; multiple taps on retry; app background/foreground mid-request.
7. **Edge data handling**
   - Null/optional fields, long names/text, unknown event types, timezones, emojis, RTL, localization.

### B) Non-functional risks
1. **Responsiveness under slow/poor network**
   - UI jank, main-thread blocking, spinner never resolves, poor perceived performance.
2. **Offline/airplane mode behavior**
   - Should show cached content + clear offline messaging (or defined UX).
3. **Battery/data usage**
   - Over-fetching pages; aggressive refresh polling; retry storms.
4. **Reliability**
   - Flaky tests due to async UI/network timing; nondeterministic feed ordering in test env.
5. **Security/privacy (if user-specific feed)**
   - Data leakage across accounts; cache not cleared on logout; incorrect auth handling.

---

## 3) Test approach by layer

### 3.1 Backend API tests (fast, deterministic)
**Goal:** Validate contract, cursor logic, failure handling, and event creation. Run in CI.

**Coverage (prioritized):**
- **Contract/schema**
  - Response contains `items` array; item fields match schema; `nextCursor` optional.
- **Ordering & determinism**
  - Items consistently sorted (e.g., newest-first). Same request → same results (within acceptable window).
- **Pagination correctness**
  - Page 1 returns N items; page 2 with cursor returns next N without overlap.
  - `nextCursor` eventually absent at end-of-feed.
  - Invalid/expired cursor returns 4xx with clear error payload.
- **Boundary conditions**
  - Empty feed returns `items: []` and no `nextCursor`.
  - Large page sizes (if supported) and max limits enforced.
- **Error handling**
  - 5xx returns appropriate status; timeouts simulated (where possible).
  - Rate limit (429) behavior (if applicable).
- **`POST /event`**
  - Valid payload → 201/200 + created id.
  - Missing/invalid fields → 4xx with validation errors.
  - Auth/permission checks (if applicable).
  - After create: event appears in subsequent `GET /feed` (eventual consistency expectations documented).

**Tooling suggestion (example):**
- REST contract tests in Postman/Newman, pytest, Jest/supertest, or similar.
- Consumer-driven contract tests (optional) if multiple clients exist.

---

### 3.2 Integration / system tests (API + cache + app logic)
**Goal:** Validate end-to-end behavior with realistic network conditions and caching.

**Where to test:**
- A small set of E2E flows against a test environment (or mocked server with recorded fixtures).
- Prefer **mock/stubbed backend** for determinism in most CI E2E tests; keep a **smaller nightly** suite against real env.

**Key scenarios:**
- Initial load success → renders items, correct empty state when no items.
- Pull-to-refresh success → list updates, pagination state reset, no duplicates.
- Pagination success → “load more” loads next page; `nextCursor` exhaustion handled gracefully.
- API failure on initial load → error state + retry; retry succeeds.
- API failure on pagination → inline error (or defined UX) without losing already loaded items.
- Cache behavior:
  - First launch loads from API and persists.
  - Relaunch offline shows cached data (if intended) with clear stale/offline indicator.
  - Cache invalidation on logout/account switch.
- Concurrency:
  - Refresh while paging; ensure only one active request per intent; no crashes; state remains consistent.

---

### 3.3 Mobile UI / regression tests (manual + targeted automation)
**Goal:** Protect core user journeys and UX polish; keep automation stable and high-signal.

**Automate (high value, low flake when designed well):**
- **Smoke UI flows** (1–3 per platform):
  - Initial load renders feed list (with test stub server).
  - Pull-to-refresh updates list (validate visible change).
  - Pagination loads next page once (verify additional items appended).
  - Error state + retry transitions to success.
- **Accessibility basics**
  - Screen has accessible labels, focus order sane (spot-check automated where possible).
- **Visual sanity checks** (optional)
  - Golden snapshots for empty/error/loading states (only if your org supports stable snapshot infra).

**Keep manual (better ROI than brittle UI automation):**
- Exploratory around gestures (pull-to-refresh), edge navigation, interruptions.
- Real-device network + performance feel.
- Localization/RTL, long text layouts, dynamic type.
- OS-level behaviors (background/foreground, low memory) and device matrix sampling.

**Automation frameworks (example):**
- iOS: XCUITest
- Android: Espresso
- Cross-platform: Detox/Appium (only if already adopted; avoid introducing heavy new stack for this exercise)

---

## 4) Manual vs automation split (and rationale)

**Automation is best for:**
- Deterministic backend contracts and cursor logic (fast, repeatable).
- A small, stable UI smoke suite that proves “feature is not broken.”
- Regression guardrails around critical states (loading/empty/error/retry).

**Manual is best for:**
- Exploratory discovery of edge cases and UX issues.
- Performance perception under slow networks.
- Device/OS fragmentation checks and real-world interruptions.
- Visual/layout nuances and accessibility audits beyond basic checks.

**Principle:** Automate “what must always work” and “what breaks silently,” manual-test “what changes often” and “what humans notice.”

---

## 5) Minimum regression checklist (release validation)
**Backend/API**
- [ ] `GET /feed` returns 200 with valid schema for a typical user.
- [ ] Pagination works across at least 2 pages without duplicates/skips.
- [ ] `POST /event` succeeds with valid payload; new event appears in feed as expected.

**Mobile (iOS + Android)**
- [ ] Initial load: loading → list renders; no freeze on slow network.
- [ ] Empty feed: empty state messaging correct.
- [ ] Pull-to-refresh: spinner shows, list updates, no duplicates, pagination reset.
- [ ] Pagination: “load more” appends items; end-of-feed handled.
- [ ] Failure states:
  - [ ] Initial load failure shows error + retry.
  - [ ] Retry works after network restored.
- [ ] Cache:
  - [ ] Relaunch shows last known items quickly (if intended).
  - [ ] Account switch/logout clears prior user’s cached feed (if applicable).
- [ ] Basic UI sanity:
  - [ ] No clipped text for long names/messages; supports dark mode; basic accessibility label check.

---

## 6) CI vs manual validation

### CI (on every PR / merge)
**Fast & reliable**
- API unit/contract tests for `GET /feed` cursor behavior and `POST /event` validation.
- Integration tests with stubbed backend:
  - Initial load success
  - Refresh success
  - Pagination success (one page)
  - Error + retry success
- Static checks: linting, formatting, build, and unit tests.
- Optional: basic UI smoke tests on one emulator/simulator configuration per platform.

### CI (nightly / scheduled)
**Broader but still automated**
- E2E against real test environment (small set) to catch env/config drift.
- Performance budgets (if available): feed render time thresholds, request counts.
- Device farm run on a limited matrix (e.g., 2–3 key devices per platform).

### Manual (pre-release or during QA sign-off)
**High-signal human verification**
- Real-device testing on representative devices/OS versions.
- Network conditioning: 3G/slow LTE, intermittent connectivity, offline transitions.
- Exploratory sessions focused on:
  - Concurrency (refresh + pagination + background/foreground)
  - Layout (long text, localization, dynamic type)
  - Accessibility spot-check (screen reader navigation)
- Risk-based sampling of edge cases found during development.

---

## 7) Notes on test data & determinism
- Prefer seeded test users with known feed contents.
- For automation, use a stub server/fixtures so ordering and cursor values are stable.
- If the backend feed is time-based and naturally moving, isolate tests from “now” (freeze time or use synthetic events with fixed timestamps).

---

## 8) Release readiness communication (how I’d report)
For release go/no-go, I’d summarise:
- ✅ What passed in CI (by layer)
- ✅ Manual regression checklist status (iOS/Android)
- ⚠️ Known issues + severity + mitigation
- ⚠️ Residual risks (e.g., “pagination under intermittent network not fully covered by automation; validated manually on iOS 17 + Pixel 8”)
- 📌 Rollback/monitoring recommendations (API error rate, timeouts, app crash-free rate, feed load latency)
