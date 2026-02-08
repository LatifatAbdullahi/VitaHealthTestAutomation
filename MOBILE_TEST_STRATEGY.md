# MOBILE_TEST_PLAN.md — Activity Feed (iOS / Android)

## 1) Goals & scope
Validate the Activity Feed experience end-to-end on mobile::
- Initial load, pull-to-refresh, pagination
- Error states + retry
- Cache/offline behavior (as implemented)
- Responsiveness under slow/poor networks
- Usability and accessibility baseline

This plan is **risk-based**: it prioritizes scenarios most likely to break and most visible to users.

---

## 2) Device + OS version strategy

### A) Principles
- Cover the **most-used OS versions** plus **one older boundary** still supported.
- Use a **small, representative device matrix** for routine regression, and expand only when risk increases.
- Prefer **real devices** for performance perception, gestures, and network conditioning; use emulators/simulators for fast smoke checks.

### B) Suggested baseline matrix (release sign-off)
**iOS (2–3 devices)**
- 1x latest major iOS on a current device size (e.g., iPhone 15/16 class)
- 1x previous major iOS (e.g., iOS-1) on a common device (e.g., iPhone 13/14 class)
- 1x smaller screen device if your user base includes it (e.g., iPhone SE class) *or* iPad if the app supports tablet layouts

**Android (3 devices)**
- 1x latest major Android on a Pixel-class device (clean reference OS)
- 1x Samsung/OneUI device on a widely-used Android version (captures OEM UI + backgrounding quirks)
- 1x mid/low-tier device (lower CPU/memory) to validate responsiveness and scrolling performance

### C) Expanded matrix (only when needed)
Add devices/OS versions when:
- Feed UI changes significantly (new card layout, images/video, new gestures)
- Caching/network logic changes
- Crash or performance regressions are reported on a specific OEM/OS
- Accessibility changes are introduced

---

## 3) Exploratory testing approach

### A) Charters (time-boxed)
Run 30–60 minute charters focused on high-risk behavior:

1. **Network stress charter**
    - Slow 3G / high latency
    - Intermittent connectivity (drop/reconnect)
    - Offline → online transitions
    - Expected: UI remains responsive, user sees clear progress/error states, retry recovers cleanly.

2. **State & concurrency charter**
    - Pull-to-refresh while pagination is loading
    - Multiple rapid retries
    - Background/foreground during load
    - Expected: no crashes, no duplicated items, spinners settle, state remains consistent.

3. **Cache & freshness charter**
    - Cold start with cache present
    - Relaunch offline (if supported)
    - Refresh updates cached content correctly
    - Logout/login as different user (if applicable)
    - Expected: no cross-account leakage; cache invalidation works.

4. **Data edge charter**
    - Very long names/messages, emojis, special characters
    - Unknown event types / missing optional fields
    - Timezones, “just now” vs older timestamps
    - Expected: graceful rendering, no broken layout, safe fallbacks.

5. **Navigation & interruption charter**
    - Navigate away mid-load and return
    - App killed and relaunched
    - System interruptions: calls/notifications (as feasible)
    - Expected: stable recovery, no stuck loading, no crash.

### B) Bug capture guidance
When defects are found, capture:
- Device + OS + build number
- Network condition used
- Steps + expected vs actual
- Screenshots/screen recording
- Relevant logs (crash logs / console if available)

---

## 4) Accessibility & usability checks (lightweight but intentional)

### A) Accessibility baseline (each platform)
**iOS**
- VoiceOver spot-check:
    - Feed screen title announced
    - Each feed item is reachable, readable, and not duplicated in focus order
    - Pull-to-refresh and Retry are discoverable and actionable
- Dynamic Type:
    - Increase text size (2–3 steps) and confirm cards don’t overlap/truncate critical info
- Contrast:
    - Check error state + retry button contrast in light/dark mode

**Android**
- TalkBack spot-check:
    - Feed items are navigable in logical order
    - Retry button accessible and has meaningful label
- Font scaling:
    - Test 1.15x–1.3x (or largest common setting used internally) for layout resilience
- Touch target size:
    - Ensure Retry and tappable areas meet minimum touch target guidance (no tiny buttons)

### B) Usability checks (quick heuristics)
- Loading feedback is clear (skeleton/spinner + no frozen UI)
- Error state messaging is actionable (what happened + clear retry)
- Pagination feedback is obvious (loading indicator, no confusion about “stuck”)
- Pull-to-refresh interaction feels natural (no accidental triggers / no double refresh)

---

## 5) Regression scope for release sign-off

### A) Must-pass (iOS + Android)
1. **Initial load**
    - Fresh launch → loading → feed renders (or empty state)
2. **Pull-to-refresh**
    - Refresh updates content and resets pagination state
3. **Pagination**
    - Load more appends items; end-of-feed handled
4. **Error + retry**
    - Simulate failure (offline or forced error) → error UI shown → retry recovers after network returns
5. **Responsiveness**
    - Scroll remains smooth; UI remains responsive under slow network (no jank/stalls)
6. **Cache behavior (as intended)**
    - Relaunch shows last known content quickly (if implemented)
    - No stale/incorrect content after refresh

### B) Should-pass (time permitting / higher confidence)
- Background/foreground during load
- Long text/emojis layout sanity
- Dark mode and one localization spot-check
- Basic accessibility spot-check (VoiceOver/TalkBack)

### C) Regression exclusions (explicit)
Not in scope unless impacted by this release:
- Deep performance profiling (beyond lightweight checks)
- Full localization sweep across all languages

---

## 6) Suggested automation split (mobile)
- **Automated smoke (per platform)**: initial load, pull-to-refresh, pagination once, error UI + retry (using stubbed backend for determinism).
- **Manual validation**: network conditioning, usability/accessibility spot-checks, interruptions, device/OEM quirks.

---

## 7) Release sign-off reporting
For sign-off, report:
- Devices/OS tested (matrix)
- Must-pass checklist status for iOS/Android
- Known issues (severity, workaround, risk)
- Residual risks (what was not covered + why)
- Recommendation (Go / Go with risks / No-go)
