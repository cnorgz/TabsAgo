# TabsAGO Code Audit (Code Quality Only)

## TO BE DONE (Open Audit Items)

- [ ] No duplicate code between service worker and components
- [ ] All Chrome API calls have proper error handling
- [ ] Single source of truth for type definitions
- [ ] Consistent storage approach throughout
- [ ] Extension builds and loads successfully
- [ ] Highlighted tabs capture via command/context menu (stability)
- [ ] Keyboard shortcut UX (configuration/visibility)
- [ ] Add additional unit tests (historyClusters, TabService)

---

## DONE (Completed Audit Items)

### Summary
Phase 2 in progress; architecture cleaned to enable iterative work.

---

## 🚨 CRITICAL ISSUES (Original Findings)

### 1. DUPLICATE TAB CAPTURE LOGIC
**Impact**: High - Code duplication leads to bugs and maintenance issues
**Location**: `service-worker.ts` lines 42-51 & 69-78 vs `TabManager.tsx` lines 48-57 & 67-74

**Problem**: 
- Same tab mapping logic exists in service worker and component
- Slight differences between implementations (ID generation, deduplication)
- Changes must be made in multiple places

**Solution**: Create `src/services/TabService.ts` with shared tab operations

---

### 2. INCONSISTENT ERROR HANDLING  
**Impact**: High - Extension could crash or fail silently
**Location**: Throughout codebase - Chrome API calls lack error boundaries

**Problem**:
```typescript
// No error handling:
const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
await chrome.storage.local.set({ [key]: next })
```

**Solution**: Wrap Chrome API calls in try/catch blocks with user feedback

---

### 3. TYPE DEFINITION CHAOS
**Impact**: Medium-High - Makes refactoring difficult and error-prone  
**Location**: Multiple files define similar tab interfaces

**Problem**:
- `SavedTab` in `TabManager.tsx` (should be in types)
- `TabsViewItem` in `TabsView.tsx` duplicates `TabItem` in `Tab.ts`
- Inconsistent property names across interfaces

**Solution**: Consolidate all interfaces in `src/types/` directory

---

### 4. MIXED STORAGE STRATEGIES
**Impact**: Medium - Could lead to state inconsistencies
**Location**: `localStorage` vs `chrome.storage.local` usage

**Problem**:
```typescript
// Theme & sort preferences in localStorage
localStorage.setItem('tabsago_theme', theme)
localStorage.setItem('tabsago_sort', sortBy)

// Tab data in chrome.storage.local  
chrome.storage.local.set({ tabs: updated })
```

**Solution**: Standardize on Chrome storage for extension data

---

## 🔧 REFACTORING TASKS (Priority Order)

### Task 1: Create Shared Services Layer
**Priority**: 🔴 CRITICAL
**Estimate**: 2-3 hours
**Files to create**:
- `src/services/TabService.ts` - tab operations
- `src/services/StorageService.ts` - unified storage
- `src/constants/storage.ts` - storage keys

**Actions**:
1. Extract tab capture/mapping logic to `TabService`
2. Update both service worker and components to use shared service
3. Create storage constants file for keys like 'tabs'

Status: DONE
- Added `src/services/StorageService.ts`
- Added `src/services/TabService.ts`
- Added `src/constants/storage.ts`
- Refactored `src/components/TabManager/TabManager.tsx` to use `TabService`
- Refactored `src/service-worker.ts` to use `TabService`

Manual Tests to Run:
1) Build extension: `npm run build`
2) Load unpacked from `dist/` and check:
   - Command "capture-selected-tabs" still captures and focuses app
   - Context menu "Send highlighted tabs to TabsAGO" still captures
   - UI Capture Current/All Tabs still works; de-duplication by URL maintained
3) Verify `chrome.storage.local.tabs` contains expected data
4) Verify no duplicate storage writes on repeated capture

---

### Task 2: Implement Error Boundaries
**Priority**: 🔴 CRITICAL  
**Estimate**: 1-2 hours
**Files to create/modify**:
- `src/components/Common/ErrorBoundary.tsx`
- Wrap Chrome API calls in components

**Actions**:
1. Create React error boundary component
2. Add try/catch blocks around Chrome API calls
3. Add user-friendly error states

Status: DONE (initial pass)
- Added `src/components/Common/ErrorBoundary.tsx`
- Wrapped main UI in `ErrorBoundary` in `src/views/App.tsx`
- Added try/catch in `TabService`

Manual Tests to Run:
1) Intentionally throw in a child component to verify ErrorBoundary renders fallback
2) Trigger capture with a restricted page to ensure no crash and error logs are clean

---

### Task 3: Consolidate Type Definitions  
**Priority**: 🟡 HIGH
**Estimate**: 1 hour
**Files to modify**:
- Move `SavedTab` from `TabManager.tsx` to `src/types/Tab.ts`
- Remove duplicate interfaces
- Standardize property names

**Actions**:
1. Create unified `Tab` interface in types directory
2. Remove `SavedTab` from component file
3. Update all imports

Status: DONE (first pass)
- `SavedTab` removed from `TabManager.tsx`; using `TabItem` from `src/types/Tab.ts`
- Imports updated

Manual Tests to Run:
1) Type-check: `npm run type-check`
2) Validate runtime still renders list and grid views without type regressions

---

### Task 4: Standardize Storage Approach
**Priority**: 🟡 HIGH
**Estimate**: 1 hour  
**Files to modify**:
- Replace localStorage usage with Chrome storage
- Update storage keys in constants file

**Actions**:
1. Move theme/sort preferences to Chrome storage
2. Use consistent storage patterns throughout
3. Update storage keys to use constants

Status: DONE (initial scope: mode + theme)
- Added `mode` and `theme` keys to `src/constants/storage.ts`
- Refactored `App.tsx` to write `mode` and `theme` via `StorageService`
- Kept read fallback from localStorage to avoid breaking existing persisted values

Manual Tests to Run:
1) Switch List/Tabs modes; reload app; mode persists
2) Toggle theme; reload app; theme persists and attribute set on `<html>`
3) Inspect `chrome.storage.local` to confirm values exist

---

### Task 5: Component Organization Standards
**Priority**: 🟢 MEDIUM
**Estimate**: 1 hour
**Files to modify**:
- Standardize component folder structure
- Remove inline styles

**Actions**:
1. Create `index.tsx` + `Component.types.ts` pattern
2. Replace inline styles with Tailwind classes
3. Extract reusable UI components

Status: 🟡 In Progress
- Inline style cleanup deferred. Added TODO notes in `src/components/Grouped/Grouped.tsx` to migrate to Tailwind in Phase 2 polish.
- Next: Sweep `App.tsx`, `TabManager.tsx` for remaining inline styles.

Manual Tests to Run:
1) Visual regression: verify toolbar spacing and list items look unchanged after style refactors

Update: DONE
- Replaced inline styles in `App.tsx`, `Grouped.tsx`, `TabsView.tsx`, and parts of `TabManager.tsx` with CSS utility classes in `src/views/index.css`.
- Build successful after changes.

---

### Task 6: Guardrails & Conventions
**Priority**: 🟢 MEDIUM
**Estimate**: 1 hour
**Actions**:
- Add constants for IDs/commands to avoid magic strings
- Keep service-worker event wiring minimal and delegate to services
- Keep UI-only logic in components; Chrome API access via services

Status: DONE
- Added `src/constants/ids.ts` and refactored `src/service-worker.ts` to use it

Update: Added Cursor rules
- `.cursor/rules/210-react-ui.mdc` → UI architecture conventions (React + Tailwind, no Chrome APIs in components)
- `.cursor/rules/320-testing.mdc` → Testing guardrails (Vitest, focus on utils/services)

Manual Tests:
- Build and confirm context menu and command still function

---

### Task 7: Tooling — ESLint, Prettier, Vitest
**Priority**: 🟢 MEDIUM
**Actions**:
- Added `.eslintrc.cjs`, `.prettierrc.json`, `vitest.config.ts`
- Updated `package.json` scripts (lint, lint:fix, format, format:check, test)
- Added a starter test `src/utils/historyClusters.test.ts`

Status: DONE

Manual Steps:
- Install deps: `npm install`
- Run checks: `npm run type-check && npm run lint && npm run format:check && npm run test`

---

## 🧪 TESTING STRATEGY

### After Each Task:
1. **Build Test**: `npm run build` succeeds
2. **Load Test**: Extension loads in Chrome without errors  
3. **Function Test**: Core features still work (capture, list, remove)

### Acceptance Criteria:
- [ ] No duplicate code between service worker and components
- [ ] All Chrome API calls have proper error handling
- [ ] Single source of truth for type definitions
- [ ] Consistent storage approach throughout
- [ ] Extension builds and loads successfully

Known Deferrals (Tracked):
- [ ] Highlighted tabs capture via keyboard/command and context menu is flaky in some environments; will revisit with explicit `chrome.tabs.highlight`/window focus checks. Notes added inline in `src/service-worker.ts`.
- [ ] Keyboard shortcut configuration/UX – not prioritized; user can adjust at `chrome://extensions/shortcuts` for now.
- [ ] Add ESLint + Prettier config and scripts; wire `npm run lint` and `format:check`.
- [ ] Add Vitest + minimal tests for `historyClusters.ts` and `TabService`.

---

## 📋 IMPLEMENTATION CHECKLIST

### Pre-Refactoring:
- [ ] Commit current working state
- [ ] Test current functionality works
- [ ] Review Phase 2 requirements

### During Refactoring:
- [ ] Complete Task 1 (Services Layer) first - highest impact
- [ ] Test after each task completion
- [ ] Update imports as types/services move
- [ ] Maintain backward compatibility

### Post-Refactoring:
- [ ] Full extension test (install, capture, list, remove)
- [ ] Verify no regressions in existing features
- [ ] Update documentation if needed
- [ ] Ready for Phase 2 feature additions

---

## 🧩 Bugfix: Capture All Tabs vs Current Tab

Status: DONE
- Removed "Capture Current Tab" from `TabManager` UI and code
- Fixed `TabService.captureCurrentWindowTabs` to return ALL tabs when no highlighted tabs are present
- Rebuilt and verified bundle

Manual Tests to Run:
1) Open multiple tabs in the same window; click "Capture/Refresh (All Tabs)" → All open tabs appear, no duplicates on second click
2) Highlight two tabs then trigger extension command (keyboard or context menu) → Intended behavior is to capture only highlighted; currently deferred due to flakiness. See deferral above.
3) No single-tab capture button visible

---

## 🎯 SUCCESS CRITERIA

**Before**: Functional but fragile codebase with duplication and inconsistencies
**After**: Clean, maintainable architecture ready for Phase 2 feature additions

**Key Metrics**:
- Zero duplicate tab capture logic
- All Chrome API calls properly handle errors
- Single source of truth for types
- Consistent storage patterns
- Extension functionality unchanged

---

*This audit focuses only on blocking issues that would impede iteration. Nice-to-have improvements (virtualization, testing setup, design tokens) are deferred until after Phase 2 core features are complete.*
