# Phase 2 Spec: Core Tab Management and Foundations for Organization

## Objectives
- Robust capture and persistence of tabs
- Polish List view (density, spacing, typography, affordances)
- Prepare for organization (sorting now; grouping next)
- Add first integration: either Tab Groups or History Import

## Decisions (Confirmed)
- Theme: follow system by default; allow manual override with sun/moon icons; persist preference.
- Date ordering: sort by `tabs.lastAccessed`; fallback to capture time; provide dropdown filter Oldest→Latest and Latest→Oldest.
- Terminology: user-facing term is "Grab"; internal code may still use "capture" where clearer.
- Side Panel: deferred; do not implement in Phase 2.
- Tab Groups: caution — keep last in backlog; do not implement additional Tab Groups UI in Phase 2.
- Privacy: local-only; create `PRIVACY.md` stub and link in app; keep runtime friction minimal.

## Functional Requirements
Legend: ** = optional (after main features); *** = optional (last priority; discuss first); ⭐ = needs clarification
1. Grab (user-facing term; internal code may still use capture)
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
- Theme: Dark/Light mode toggle; follow system/browser setting via `prefers-color-scheme` with sun/moon icon override (sun/moon icons). If system not available, default to light/day. Persist user override in storage.
   - TabsView: 10 per row layout; group by day (like Chrome History) with hint border
   - URL View: group/sort by common domain
- Date View: order tabs by last viewed/opened using `tabs.lastAccessed` when available; fallback to capture time. Provide dropdown filter: Oldest→Latest and Latest→Oldest (reshuffles accordingly).
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
### Layout
- Row height 44–48px; padding-x 12–16px; padding-y 8px.
- Left: checkbox (for multi-select) then favicon 16px (24px box), title (single-line, ellipsis), secondary line (domain) in subdued color.
- Right: actions inline — Open, Remove; kebab menu reserved for future; actions only visible on hover/focus; always visible on touch.

### Typography
- Title: truncate with ellipsis; medium weight; 14–15px.
- Domain: 12–13px, muted color; optionally show last accessed time as "5m ago".

### Hover, Focus, Selection
- Hover: subtle bg (e.g., hover:bg-muted/selected shade), pointer cursor.
- Focus: visible focus ring for keyboard nav.
- Selected rows: tinted bg; checkbox checked; bulk action bar enabled.

### Toolbar
- Left: "Grab Tabs" primary button; "Open X" (disabled until selection); "Remove X"; "Clear All".
- Right: Sort dropdown (Newest, Title A–Z, Domain A–Z), Date filter dropdown (Oldest→Latest / Latest→Oldest), Search input (magnifier + clear), Theme toggle (sun/moon).

### Responsive
- Breakpoints: compact at <= 360px (hide domain, collapse actions into kebab).
- Medium: show domain; actions on hover.
- Large: full metadata; comfortable spacing.

### Accessibility
- Keyboard: Up/Down navigate; Space toggles selection; Enter opens tab; Cmd/Ctrl+A selects all; Shift+Click selects range.
- Tooltips for actions; ARIA labels on controls; sufficient contrast.

### Empty State
- Centered message with brief copy and a prominent "Grab Tabs" CTA.

### Performance
- Avoid layout thrash; prefer CSS-only transitions; consider virtualization later if needed.

## Deferred to Phase 3 (pending review)
- *** Groups: Group View (named groups), grab-as-new-group (user-facing), default names (Group A/B/C), active-group switch with visual frame, manage group history, save/import full state
- *** Groups by keywords / Most visited / Mind map view (to be defined/detailed) ⭐
- *** Sorting window: drag between TabsAGO and Bookmarks ⭐
- *** Homepage mode (split search + TabsAGO) ⭐
- *** Accounts/Portability (login/sync) ⭐
- *** Reports: AI tabs report ⭐

## Cautions & Deferrals
- Tab Groups: Do not add new Tab Groups UI in Phase 2; treat as last-priority backlog item to be discussed.
- Side Panel: Defer entirely; no manifest side_panel additions in Phase 2.

## Privacy
- Data remains local in `chrome.storage.local`; no network requests.
- Add `PRIVACY.md` documenting local-only handling and in-app link in About/Privacy view.

## Acceptance Criteria
- Google Chrome extention rules: https://developer.chrome.com/docs/webstore/program-policies/policies 
- Build succeeds; extension loads
- Grab/Remove/Clear works; sort works and persists; date filter works
- Storage sync reflects changes immediately
- Integrations are optional in Phase 2; Tab Groups specifically deferred until reviewed.
