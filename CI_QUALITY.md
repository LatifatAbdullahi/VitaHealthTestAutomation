# CI_QUALITY.md — CI Integration & Test Reliability

## API tests in CI
- API tests run on **every pull request** and on merge to `main`.
- They use Playwright’s API runner with a **dedicated test environment and test users**.
- The PR suite is kept small and fast:
  - feed load
  - pagination
  - invalid cursor
  - empty feed
  - schema validation and a simple response-time check
- Error/fault-injection tests run **nightly** if they require special setup.

Why: API tests are fast, stable, and give early feedback when contracts or core logic break.

---

## Mobile tests in CI
- Mobile automation runs as a **smoke suite** in CI.
- Executed on:
  - 1 iOS simulator
  - 1 Android emulator

### PR (blocking)
- App launches and feed loads
- Pull-to-refresh works
- Pagination loads one additional page
- Error state + retry recovers
- One basic accessibility check (e.g. Retry button is accessible)

### Nightly / scheduled
- Same smoke tests on a small real-device matrix
- Network-stress scenarios (slow or flaky connection)

Why: CI should catch obvious breaks quickly; deeper confidence comes from nightly and manual testing.

---

## Quality gates (what blocks a release)
A release is blocked if:
- API tests fail on `main`
- Mobile smoke tests fail
- A critical issue exists in:
  - feed load
  - refresh
  - pagination
  - error/retry handling
  - crashes or data leakage

Performance or minor UI issues are reviewed, not auto-blocking, unless they significantly impact users.

---

## Keeping tests reliable (low noise, high signal)
- Use **seeded test users** and **stubbed data** where possible.
- Avoid timing-sensitive assertions and real-time data.
- Assert on **stable states**, not animations or text that can change.
- Limit retries to **one max** and treat retry-only tests as flaky.
- Keep the CI suite small; move slower or unstable checks to nightly runs.

Goal: CI should be **boring and trustworthy** — when it fails, it should mean something.
