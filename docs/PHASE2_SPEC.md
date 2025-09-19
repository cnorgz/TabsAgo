# Phase 2 Spec: Core Tab Management and Foundations for Organization

## Objectives
- Robust capture and persistence of tabs
- Polish List view (density, spacing, typography, affordances)
- Prepare for organization (sorting now; grouping next)
- Add first integration: either Tab Groups or History Import

## Functional Requirements
Legend: ** = optional (after main features); *** = optional (last priority; discuss first); ⭐ = needs clarification
1. Capture
   - Capture Current Tab
   - Capture All Tabs in Window
   - Show error state if capture fails
2. Manage
   - Remove tab, Clear all
   - Sort: Newest, Title A–Z, Domain A–Z (persist preference)
   - Multi-select: select multiple tabs to open (new window or same window) or remove
3. Persist
   - Store in `chrome.storage.local`
   - Sync UI across contexts on storage changes
4. First Integration (choose one to complete in Phase 2)
   - Tab Groups: create/move/collapse groups; auto-group by domain
   - OR History Import: Today/Yesterday/This Week buckets using `chrome.history.search`

5. UI & Views (V1)
   - Theme: Dark/Light mode toggle; follow system/browser setting via `prefers-color-scheme` with sun/moon icon fallback. If system not available, default to light/day.
   - TabsView: 10 per row layout; group by day (like Chrome History) with hint border
   - URL View: group/sort by common domain
   - Date View: order tabs by last viewed/opened using `tabs.lastAccessed` when available; fallback to capture time
   - ** Snapshot View: scalable thumbnail preview tiles

6. Engine, Grab, Search, Export (V1)
   - Exclude TabsAGO tab from grabbing (always)
   - Search bar for tabs: keyword filtering across title/url (magnifying-glass icon)
   - ** Export current tabs to common bookmarks HTML format
   - Hover preview: generate snapshot thumbnails immediately after tabs are grabbed; serve cached thumbnails on hover (no auto-refresh)

7. Workflows & Session Safety (V1)
   - ** On window close: popup confirm → Option A: “TabsAGO or not?” If yes, capture all
   - ** Autosave “Last session” lifeboat: automatically capture new tabs at close into TEMP list shown on next start (read-only group)

## Non-Functional
- Smooth interactions; no jank with 100+ items
- Accessible controls and keyboard focus (need tiny info (?) modal to remind hotkeys)
- Minimal, clean design (pre-Tailwind theming polish)

## UI Polish (List View)
- Card row with favicon, title (one-line), domain (secondary), actions on the right
- Hover state: subtle background; visible actions
- Toolbar: primary actions left; sort and clear on the right

## Deferred to Phase 3 (pending review)
- *** Groups: Group View (named groups), capture-as-new-group, default names (Group A/B/C), active-group switch with visual frame, manage group history, save/import full state
- *** Groups by keywords / Most visited / Mind map view (to be defined/detailed) ⭐
- *** Sorting window: drag between TabsAGO and Bookmarks ⭐
- *** Homepage mode (split search + TabsAGO) ⭐
- *** Accounts/Portability (login/sync) ⭐
- *** Reports: AI tabs report ⭐

## Acceptance Criteria
- Google Chrome extention rules: https://developer.chrome.com/docs/webstore/program-policies/policies 
- Build succeeds; extension loads
- Capture/Remove/Clear works; sort works and persists
- Storage sync reflects changes immediately
- First integration demo-able from the UI
