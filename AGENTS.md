# TabsAGO – Agent Guidelines

## Project summary
TabsAGO is a Chrome Extension (MV3) for organizing tabs.
**Stack:** React, TypeScript, Vite, Tailwind CSS.
**Core:** `service-worker.ts` (background), `TabManager.tsx` (UI), `CaptureScheduler.ts` (logic).

## Protocol 0: Pre-Code Planning (MANDATORY)
**Before generating any code, you must execute this lightweight planning sequence:**

1.  **Context & Safety Scan:**
    *   Read `docs/CODE_AUDIT.md` for known issues.
    *   Check `package.json` for available libs (no assumptions).
    *   **Verify Chrome APIs:** Check [Official Chrome Docs](https://developer.chrome.com/docs/extensions/) for MV3 compliance.
2.  **The "Mini-Plan" (Token-Efficient):**
    *   **Files:** List exactly which files you will modify or create.
    *   **Pattern Check:** Does this duplicate logic in `src/services`? (Reuse > Rewrite).
    *   **Guardrails:** Explicitly state: "I have checked `AGENTS.md` performance rules."
    *   **Verification:** How will you test this? (e.g., "Manual check of UI" or "New unit test").
3.  **Complexity Switch:**
    *   *Trivial (typo/style):* Proceed immediately.
    *   *Standard:* Output the Mini-Plan above.
    *   *Complex (Refactor/New Feature):* Stop. Create detailed plan using `write_todos` or `codebase_investigator`.

## Hard Rules (The "Guardrails")
1.  **Performance (CRITICAL - from 900-performance-guardrails):**
    *   **Stable Hooks:** NEVER pass inline objects/arrays `[]` `{} ` to `useEffect` dependencies. Use `useRef` for initial values or `useMemo`.
    *   **Event Listeners:** NEVER call `setState` in `mousemove`, `scroll`, or `resize` without throttling.
    *   **Chrome Storage:** Do NOT read from storage in a loop/render. Use the optimized `useChromeStorage` hook.
2.  **Architecture:**
    *   **UI Components:** React only. No Chrome APIs (except via services/hooks).
    *   **Services:** Pure logic + Chrome APIs. No UI code.
3.  **Error Handling:**
    *   Wrap ALL Chrome API calls in `try/catch`.
    *   Log errors with `console.error`.
    *   Do not fail silently.
4.  **Logging:**
    *   Use `src/utils/logger.ts` for debug logs.
    *   Avoid `console.log` in production.

## Workflow Rules
1.  **Sanity Check:** Run `npm run sanity` (or lint/test) before committing.
2.  **No Magic:** Do not assume dependencies exist.
3.  **Docs First:** Update `docs/` if architecture changes.
4.  **Git Workflow (CRITICAL):**
    *   **Branches:** Always create a new branch for your task (e.g., `feature/xyz`, `fix/abc`).
    *   **No Auto-Merge:** NEVER merge to `master` (or `main`) without explicit user validation.
    *   **Handover:** When a task is done, commit to your branch and ask the user: "Ready to merge to master?" Do not assume yes.

## When in doubt
Check `docs/IMPLEMENTATION_PLAN.md` or `docs/CODE_AUDIT.md`.