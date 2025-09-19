# TabsAGO Project Tracking

Related docs: PHASE2_SPEC.md (features/spec), ROUTINE_CHECKLISTS.md (workflow), CODE_AUDIT.md (code quality), QUICK_START.md (setup)

## Project Overview
**MVP Goal**: Create a Chrome extension that consolidates multiple tabs into one organized, manageable interface with different viewing modes.

**Current Status**: ✅ **PHASE 1 COMPLETE** - Scaffolded; build succeeds; minimal UI shipped. Moving into Phase 2.

## Development Phases

### Phase 1: Foundation & Setup 🏗️
**Goal**: Establish development environment and basic extension structure
**Timeline**: Week 1
**Status**: 🟢 **DONE**

#### Tasks:
- [x] **DEV-001**: Initialize Node.js project with package.json
  - [x] Create package.json with dependencies
  - [x] Set up Vite build configuration
  - [x] Configure @crxjs/vite-plugin for MV3
  - [x] Set up TypeScript configuration
  - [x] Configure Tailwind CSS
  - [x] Test build process

- [x] **DEV-002**: Create Chrome Extension Manifest V3
  - [x] Write manifest.json with proper permissions
  - [x] Configure service worker entry point
  - [ ] Set up extension icons and metadata
  - [x] Test manifest validation

- [x] **DEV-003**: Set up Service Worker Foundation
  - [x] Create basic service-worker.ts
  - [x] Implement extension installation handler
  - [x] Set up pinned tab creation on install
  - [ ] Test service worker lifecycle

- [x] **DEV-004**: Establish Project Structure
  - [x] Create src/ directory structure
  - [x] Set up component folders (TabManager, ViewModes, Settings, Common)
  - [x] Create basic TypeScript types
  - [x] Set up utility functions structure (placeholder)

**Definition of Done**: Extension loads without errors, creates pinned tab on install, basic project structure established.

---

### Phase 2: Core Tab Management 🔧
**Goal**: Implement robust tab capture/management with syncing, sorting, and prep for grouping and history.
**Timeline**: Week 2
**Status**: 🟡 **IN PROGRESS**

#### Tasks:
- [x] **CORE-001**: Tab Capture System
  - [x] Extract tab info (title, URL, favicon, timestamp, domain)
  - [x] Capture current tab / all tabs in window
  - [ ] Add error notifications for failed captures

- [x] **CORE-002**: Storage Layer
  - [x] chrome.storage.local with synced updates (hook)
  - [x] CRUD operations (add/remove/clear)
  - [ ] Data validation and migration guard

- [x] **CORE-003**: UI State & Sorting
  - [x] Sort by newest/title/domain
  - [x] Persist sort preference
  - [ ] Keyboard shortcuts for capture

- [ ] **CORE-004**: List View Polish (first pass now)
- [ ] **UX-010**: Terminology Update (High Priority)
  - [ ] Rename user-facing "Capture" terminology to "Grab" across UI and docs
  - [x] Button: "Capture/Refresh (All Tabs)" → "Grab Tabs"
  - [ ] Align service/variable names only where safe (keep code clarity)
  - [ ] Improve list cell layout and density
  - [ ] Better action affordances (Open/Remove)
  - [ ] Responsive behavior
  - [x] Add Capture/Refresh (All Tabs) with de-dupe

- [ ] **CORE-005**: Multi-Select & Open
  - [ ] Multi-select captured tabs
  - [ ] Open in new window or current window
  - [ ] Bulk remove

- [ ] **TG-001**: Tab Groups Integration
  - [x] Create/move/collapse groups via chrome.tabGroups
  - [x] Auto-group by domain (current window)

- [x] **HIST-001**: History Import (emulate Journeys)
  - [x] Use chrome.history.search to import recent
  - [x] Group by day buckets (Today/Yesterday/This Week)
  - [x] Keyword clusters (heuristic using SERP + referringVisitId)

- [ ] **UI-001**: Views & Themes (V1)
  - [ ] Theme toggle; ⭐ follow system/browser (confirm)
  - [ ] TabsView: 10 per row; group by day with hint border
  - [ ] URL View: group/sort by domain
  - [ ] Date View: order by last viewed/opened ⭐
  - [ ] ** Snapshot View: thumbnail tiles

- [ ] **SRCH-001**: Search
  - [ ] Keyword filter by title/url
  - [ ] Magnifying-glass entry; clear/back affordance

- [ ] **EXP-001**: Export
  - [ ] Export current tabs to bookmarks HTML format

- [ ] **SAFE-001**: Session Safety
  - [ ] ** Close-confirm Option A (capture all)
  - [ ] ** Lifeboat “Last session” (read-only restore)

- [ ] **SESS-001**: Recently Closed
  - [ ] Surface chrome.sessions.getRecentlyClosed
  - [ ] One-click restore

- [ ] **SP-001**: Side Panel Surface
  - [ ] Add side_panel.default_path
  - [ ] Toggle side panel from action

**Definition of Done** (Phase 2):
- Capture single/all tabs reliably with persisted storage
- Polished list UI with sorting + clear all
- At least one additional integration working (tab groups OR history import)

---

### Phase 3: View Modes & Organization 👁️
**Goal**: Implement multiple viewing modes and organizational features
**Timeline**: Week 3
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **VIEW-001**: List View Enhancement
  - [ ] Add tab thumbnails and metadata display
  - [ ] Implement compact vs detailed list modes
  - [ ] Add tab selection and bulk operations
  - [ ] Test responsive design across screen sizes

- [ ] **VIEW-002**: Grid View Implementation
- [ ] **GROUPS-001**: Groups (discuss first)
  - [ ] *** Named Group View; default names; active-group switch
  - [ ] *** Capture as new group; group frames/styles
  - [ ] *** Group history management; save/import full state
  - [ ] *** Keyword grouping / Most visited / Mind map ⭐
  - [ ] *** Sorting window (tabs ↔ bookmarks) ⭐
  - [ ] *** Homepage mode ⭐
  - [ ] *** Accounts/Portability ⭐
  - [ ] *** AI tabs report ⭐
  - [ ] Create grid layout component
  - [ ] Implement card-based tab display
  - [ ] Add hover effects and interactions
  - [ ] Test grid responsiveness and scrolling

- [ ] **VIEW-003**: Timeline View
  - [ ] Create chronological organization
  - [ ] Group tabs by date (Today, Yesterday, This Week, Older)
  - [ ] Add date-based filtering
  - [ ] Test timeline accuracy and performance

- [ ] **VIEW-004**: View Mode Switching
  - [ ] Implement view mode selector
  - [ ] Add view preference storage
  - [ ] Create smooth transitions between views
  - [ ] Test view persistence across sessions

**Definition of Done**: All three view modes work correctly, switching between them is smooth, and view preferences are remembered.

---

### Phase 4: Organization & Search 🔍
**Goal**: Add smart organization, tagging, and search capabilities
**Timeline**: Week 4
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **ORG-001**: Smart Grouping
  - [ ] Implement domain-based grouping
  - [ ] Add manual tagging system
  - [ ] Create category management
  - [ ] Test grouping accuracy and performance

- [ ] **ORG-002**: Search & Filter
  - [ ] Implement full-text search across tab data
  - [ ] Add filter by domain, tag, or date
  - [ ] Create search result highlighting
  - [ ] Test search performance with large datasets

- [ ] **ORG-003**: Tab Organization
  - [ ] Add drag-and-drop reordering
  - [ ] Implement bulk operations (move, tag, delete)
  - [ ] Create organization presets
  - [ ] Test organization persistence

- [ ] **ORG-004**: Quick Actions
  - [ ] Add right-click context menus
  - [ ] Implement keyboard shortcuts
  - [ ] Create quick tab restoration
  - [ ] Test action reliability and speed

**Definition of Done**: Can organize tabs by multiple criteria, search effectively, and perform bulk operations. Organization persists correctly.

---

### Phase 5: User Experience & Polish ✨
**Goal**: Enhance usability, add themes, and improve overall experience
**Timeline**: Week 5
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **UX-001**: Theme System
  - [ ] Implement light/dark theme toggle
  - [ ] Add theme preference storage
  - [ ] Create consistent color scheme
  - [ ] Test theme switching and persistence

- [ ] **UX-002**: Responsive Design
  - [ ] Optimize for different screen sizes
  - [ ] Add mobile-friendly interactions
  - [ ] Implement touch gestures where appropriate
  - [ ] Test across various devices and resolutions

- [ ] **UX-003**: Performance Optimization
  - [ ] Implement virtual scrolling for large lists
  - [ ] Add lazy loading for tab thumbnails
  - [ ] Optimize storage operations
  - [ ] Test performance with 100+ tabs

- [ ] **UX-004**: Accessibility
  - [ ] Add ARIA labels and roles
  - [ ] Implement keyboard navigation
  - [ ] Ensure screen reader compatibility
  - [ ] Test with accessibility tools

**Definition of Done**: Extension is visually polished, performs well with large datasets, and meets accessibility standards.

---

### Phase 6: Settings & Advanced Features ⚙️
**Goal**: Add configuration options and advanced functionality
**Timeline**: Week 6
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **SETTINGS-001**: Settings Interface
  - [ ] Create settings page component
  - [ ] Add theme preferences
  - [ ] Implement auto-refresh settings
  - [ ] Add default view mode selection

- [ ] **SETTINGS-002**: Data Management
  - [ ] Add export/import functionality
  - [ ] Implement data backup options
  - [ ] Add storage usage information
  - [ ] Test data portability

- [ ] **SETTINGS-003**: Advanced Options
  - [ ] Add keyboard shortcut customization
  - [ ] Implement notification preferences
  - [ ] Create performance tuning options
  - [ ] Test configuration persistence

- [ ] **SETTINGS-004**: Debug & Logging
  - [ ] Create debug interface
  - [ ] Add error logging system
  - [ ] Implement performance monitoring
  - [ ] Test debugging capabilities

**Definition of Done**: Comprehensive settings available, data can be exported/imported, and debugging tools are functional.

---

### Phase 7: Testing & Quality Assurance 🧪
**Goal**: Comprehensive testing and bug fixes
**Timeline**: Week 7
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **QA-001**: Manual Testing
  - [ ] Test all features across different scenarios
  - [ ] Verify error handling and edge cases
  - [ ] Test with various tab types and content
  - [ ] Document any issues found

- [ ] **QA-002**: Performance Testing
  - [ ] Test with 100+ tabs
  - [ ] Measure memory usage and performance
  - [ ] Test storage limits and cleanup
  - [ ] Optimize based on results

- [ ] **QA-003**: Cross-Browser Testing
  - [ ] Test in Chrome stable
  - [ ] Test in Chrome Canary
  - [ ] Verify Edge compatibility
  - [ ] Document browser-specific issues

- [ ] **QA-004**: User Acceptance Testing
  - [ ] Create test scenarios
  - [ ] Test user workflows
  - [ ] Gather feedback on usability
  - [ ] Implement final improvements

**Definition of Done**: All features work reliably, performance is acceptable, and user experience is smooth.

---

### Phase 8: Documentation & Deployment 📚
**Goal**: Finalize documentation and prepare for distribution
**Timeline**: Week 8
**Status**: 🔴 **NOT STARTED**

#### Tasks:
- [ ] **DOC-001**: User Documentation
  - [ ] Write user manual
  - [ ] Create feature guides
  - [ ] Add troubleshooting section
  - [ ] Include video tutorials

- [ ] **DOC-002**: Developer Documentation
  - [ ] Update API documentation
  - [ ] Document component architecture
  - [ ] Add contribution guidelines
  - [ ] Include testing procedures

- [ ] **DEPLOY-001**: Build & Package
  - [ ] Create production build
  - [ ] Package extension for distribution
  - [ ] Test packaged extension
  - [ ] Prepare Chrome Web Store assets

- [ ] **DEPLOY-002**: Release Preparation
  - [ ] Create release notes
  - [ ] Prepare marketing materials
  - [ ] Set up monitoring and analytics
  - [ ] Plan post-launch support

**Definition of Done**: Extension is ready for distribution with comprehensive documentation and support materials.

---

## Current Sprint: Phase 1 - Foundation & Setup

### This Week's Goals:
1. Set up development environment
2. Create basic extension structure
3. Implement pinned tab creation
4. Establish project architecture

### Next Milestone:
**Phase 1 Complete**: Extension loads without errors and creates pinned tab on install.

### Blockers:
- None currently identified

### Notes:
- Following React + Tailwind + TypeScript stack per user preferences
- Using @crxjs/vite-plugin for MV3 compatibility
- Prioritizing working functionality over perfect UI initially

---

## Progress Summary

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| Phase 1: Foundation | 🟢 Done | 100% | Extension builds, pinned tab works |
| Phase 2: Core Tab Management | 🟡 In Progress | 25% | Capture/storage/sort working |
| Phase 3: View Modes | 🔴 Not Started | 0% | Depends on Phase 2 |
| Phase 4: Organization & Search | 🔴 Not Started | 0% | Depends on Phase 3 |
| Phase 5: UX & Polish | 🔴 Not Started | 0% | Depends on Phase 4 |
| Phase 6: Settings & Advanced | 🔴 Not Started | 0% | Depends on Phase 5 |
| Phase 7: Testing & QA | 🔴 Not Started | 0% | Depends on Phase 6 |
| Phase 8: Documentation & Deploy | 🔴 Not Started | 0% | Depends on Phase 7 |

**Overall Progress**: 0% (0/8 phases complete)

---

## Daily Standup Template

### Date: [DATE]
### Phase: [CURRENT_PHASE]
### Yesterday's Progress:
- [ ] Task completed
- [ ] Task completed

### Today's Goals:
- [ ] Task to complete
- [ ] Task to complete

### Blockers:
- [Description of any blockers]

### Notes:
- [Any additional notes or observations]

---

## Weekly Review Template

### Week: [WEEK_NUMBER]
### Phase: [CURRENT_PHASE]
### Completed This Week:
- [ ] Major milestone achieved
- [ ] Key feature implemented

### Next Week's Goals:
- [ ] Next milestone target
- [ ] Key deliverables

### Risks & Issues:
- [Description of any risks or issues]

### Team Notes:
- [Any team-related observations or decisions]
