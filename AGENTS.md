# TabsAGO – Agent Guidelines

## Project summary
TabsAGO is a Chrome Extension (MV3) for organizing tabs.
**Stack:** React, TypeScript, Vite, Tailwind CSS.
**Core:** `service-worker.ts` (background), `TabManager.tsx` (UI), `CaptureScheduler.ts` (logic).

## Hard rules (must follow)
1.  **Architecture:**
    *   **UI Components:** React only. No Chrome APIs (except via services/hooks).
    *   **Services:** Pure logic + Chrome APIs. No UI code.
2.  **Performance (CRITICAL):**
    *   **Hooks:** Always use `useRef` for static config objects in `useEffect`. Check deps carefully.
    *   **Events:** NEVER call `setState` in `mousemove`, `scroll`, or `resize` without throttling.
    *   **Loops:** No polling (`setInterval`) < 1 min. Use alarms or events.
3.  **Error Handling:**
    *   Wrap ALL Chrome API calls in `try/catch`.
    *   Log errors with `console.error`.
    *   Do not fail silently.
4.  **Logging:**
    *   Use `src/utils/logger.ts` for debug logs.
    *   Avoid `console.log` in production.

## Workflow rules
1.  **Plan First:** Always propose a concise plan before coding.
2.  **Sanity Check:** Run `npm run sanity` (or lint/test) before committing.
3.  **No Magic:** Do not assume dependencies exist. Check `package.json`.

## When in doubt
Check `docs/IMPLEMENTATION_PLAN.md` or `docs/CODE_AUDIT.md`.
