# TabsAGO – IMPLEMENTATION_PLAN.md

Goal: strengthen TabsAGO’s quality guardrails (linting, tests, agents, docs) so that bugs and perf regressions are caught early, **without** turning the project into a process monster or token sink.

This plan assumes the existing setup: TypeScript, Vite, React, ESLint + Prettier, Vitest.

---

## 0. Guiding principles

- **Single source of truth for agents:** Use `AGENTS.md` as the master rulebook. `GEMINI.md`, Codex CLI contexts, and `.cursor/rules` must reference this file to ensure consistency.
- **Automate the boring checks:** Let tools handle repeatable checks (lint, type-check, tests), while AI + human focus on design and perf reasoning.
- **Ask before burning tokens:** Agents must ask before scanning large portions of the repo or running slow scripts.
- **Chrome-extension aware:** Always consider CPU/memory constraints (idle behavior, re-renders).
- **Incremental rollout:** Implement in phases.

---

## 1. Phase 1 – Hard local guardrails (The Foundation)

### 1.1 Husky + lint-staged pre-commit
**Objective:** Make it hard to commit broken or messy code.

- [ ] Add Husky with a `pre-commit` hook that runs:
  - `lint-staged` (ESLint + Prettier on staged files only).
  - `npm run type-check` (or `tsc --noEmit`) on the whole project.
  - `npm run test` (fast Vitest suite).
- [ ] Keep the hook **fast** (prefer `lint-staged`).

### 1.2 ESLint tightening (React hooks & logging)
**Objective:** Catch subtle lifecycle bugs and enforce structured logging.

- [ ] In `.eslintrc.cjs`:
  - Set `react-hooks/exhaustive-deps: "error"`.
  - Configure `no-console`: `["warn", { "allow": ["warn", "error"] }]`.
- [ ] Fix any immediate violations (replace `console.log` with `console.error` or remove).

### 1.3 Logger Utility (Immediate Cleanliness)
**Objective:** Provide a safe, structured way to debug without spamming production console.

- [ ] Create `src/utils/logger.ts`:
  - `DEBUG_MODE` flag (const or storage-backed).
  - `logger.debug(...)`: No-op unless debug mode is on.
  - `logger.log(...)`: No-op unless debug mode is on.
  - `logger.warn(...)` / `logger.error(...)`: Always delegates to console.
- [ ] Replace existing "noisy" logs with `logger.debug`.

---

## 2. Phase 2 – Agent context files (Single Source of Truth)

### 2.1 `AGENTS.md` – The Constitution
**Objective:** Define the core rules all agents must follow.
**File:** `AGENTS.md` at repo root.

**Structure:**
- **Hard rules:** Separation of concerns, stable hooks, no high-freq setState.
- **Workflow:** Read checklists, run sanity checks before commit.
- **Perf constraints:** Smooth UX, efficient storage.

### 2.2 `GEMINI.md` & Codex Context
**Objective:** Adapters for specific agents that point to `AGENTS.md`.

- `GEMINI.md`: Use `@./AGENTS.md` to include rules. Define Gemini-specific commands (e.g., `/plan`).

### 2.3 Cursor Rules Alignment
**Objective:** Ensure Cursor AI follows the same rules.

- [ ] Create/Update `.cursor/rules/900-performance-guardrails.mdc`:
  - Explicitly reference `AGENTS.md`.
  - Enforce the performance rules (hooks, event listeners).

---

## 3. Phase 3 – Tests & Sanity Tooling

### 3.1 Sanity script
**Objective:** One command to check everything.

- [ ] Add `npm run sanity`:
  - Runs `type-check`, `lint`, `test`.
  - Checks for critical build artifacts (`dist/manifest.json`, `dist/service-worker.js`).

### 3.2 Targeted unit tests
**Objective:** Test logic, not UI.

- [ ] Add tests for `ThumbnailStore` (LRU cache logic).
- [ ] Add tests for `CaptureScheduler` (cooldown logic).

---

## 4. Phase 4 – CI / Automation (Optional)

- [ ] Add minimal GitHub Actions workflow (`npm ci`, `type-check`, `lint`, `test`).

---

## 5. Human & Agent Workflow

### Daily Routine
- **Start:** Run `npm run sanity`. Ask agent to read `AGENTS.md`.
- **Coding:** Agent must propose a plan before editing.
- **Commit:** Allow Husky to verify.

### Agent Protocol
- **Before heavy work:** "Do you want me to run `npm run sanity`? This costs tokens/time."
- **On Error:** Stop, analyze `console.error` logs, check `AGENTS.md` for relevant constraints.

---

## Implementation Order
1. **ESLint tightening** (1.2)
2. **Logger Utility** (1.3)
3. **AGENTS.md + Contexts** (2.1 - 2.3)
4. **Husky + lint-staged** (1.1) (Do this last in Phase 1 so we don't block ourselves while fixing lint errors)
5. **Sanity Script** (3.1)
6. **Tests** (3.2)
