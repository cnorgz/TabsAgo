# PR-2 — Background Wiring & Scheduler

## Goal
Event-driven capture plumbing.

## Files
- src/service-worker.ts
- src/services/background/CaptureScheduler.ts

## Steps
1. Wire `webNavigation.onCommitted`, `onBeforeNavigate`, `onHistoryStateUpdated`, and `tabs.onUpdated` (`status: "complete"` only) for the active tab.
2. Implement the scheduler (throttle, dedupe, skip minimized/occluded, never activate tabs) and drive `tabs.captureVisibleTab`.

## Acceptance
- Logs show first/final scheduling at the correct moments.
- No tab flashing occurs.
