# TabsAGO Feature Testing Guide

## Overview
This document lists all implemented features in TabsAGO to help with systematic testing. Features are organized by category with their current implementation status.

---

## ✅ Core Features - IMPLEMENTED

### Tab Capture ("Grab")
- **Grab Tabs Button**: Captures all tabs in current window
  - Test: Click "Grab Tabs" button, verify all tabs appear in list
  - Excludes TabsAGO extension tab itself
  - Shows tab count in "Grabbed Tabs (X)" header
- **Single Tab Capture**: NEW! Dropdown menu with capture options
  - Test: Click dropdown arrow next to "Grab Tabs", select "Current Tab Only"
  - Verify only the active tab is captured
  - Test: Select "All Tabs in Window" to capture all tabs

### Tab Storage & Persistence
- **Local Storage**: All tabs stored in `chrome.storage.local`
  - Test: Grab tabs, close browser, reopen - tabs should persist
- **Real-time Sync**: Changes sync across extension instances
  - Test: Open extension in two tabs, modify in one, verify update in other

### Tab Management
- **Remove Individual Tab**: Click ✕ button to remove single tab
  - Test: Click ✕ on any tab, verify it's removed
- **Clear All**: Remove all grabbed tabs at once
  - Test: Click "Clear All" button, confirm all tabs removed
- **Open Tab**: Click on tab to open URL in new browser tab
  - Test: Click any grabbed tab, verify URL opens in new tab

### Multi-Select Operations
- **Select All Checkbox**: Toggle all tabs at once
  - Test: Click "Select All" checkbox at top of list
- **Individual Selection**: Check individual tabs
  - Test: Click checkbox on individual tabs
- **Range Selection**: NEW! Shift+Click to select range
  - Test: Click first tab, then Shift+Click last tab in range
  - Verify all tabs between are selected
- **Bulk Open**: Open all selected tabs
  - Test: Select multiple tabs, click "Open All"
- **Bulk Remove**: Remove all selected tabs
  - Test: Select multiple tabs, click "Remove Selected"
- **Selection Counter**: Shows count of selected tabs
  - Test: Select tabs, verify counter shows "Selected X tab(s)"

### Sorting
- **Latest → Oldest**: Sort by last accessed time (default)
  - Test: Select from dropdown, verify newest tabs first
- **Oldest → Latest**: Sort by capture time ascending
  - Test: Select from dropdown, verify oldest tabs first
- **Title A–Z**: Alphabetical by title
  - Test: Select from dropdown, verify alphabetical order
- **Domain A–Z**: Sort by domain alphabetically
  - Test: Select from dropdown, verify grouped by domain
- **Sort Persistence**: Sort preference saved across sessions
  - Test: Change sort, reload extension, verify sort maintained

### Search
- **Real-time Search**: Filter tabs by title or URL
  - Test: Type in search box, verify tabs filter immediately
- **Search Box**: Text input with placeholder "Search tabs"
  - Test: Search for partial title/URL, verify matching results

---

## ✅ UI & Views - IMPLEMENTED

### View Modes
- **List View**: Detailed list with full information
  - Test: Click "List" toggle, verify detailed list appears
  - Shows favicon, title, domain for each tab
  - Checkboxes for multi-select
  - Hover effects on rows
- **Tabs View**: Chrome-like tab preview (grid layout)
  - Test: Click "Tabs" toggle, verify grid of tabs appears
  - 10 tabs per row
  - Tab-shaped cards with favicon, title, and close button
  - Close button appears on hover
- **View Persistence**: Last selected view mode saved
  - Test: Switch views, reload extension, verify view maintained

### Theme System
- **Dark/Light Toggle**: Switch between themes
  - Test: Click 🌙 or ☀️ button to toggle
- **System Detection**: Follows OS color scheme by default
  - Test: Change OS theme, verify extension follows
- **Theme Persistence**: Theme choice saved across sessions
  - Test: Change theme, reload extension, verify theme maintained
- **Theme Variables**: Consistent colors across all components
  - Test: Toggle theme, verify all UI elements update properly

### Layout & Styling
- **Responsive Design**: Adapts to window size
  - Test: Resize window, verify layout adjusts
- **Chrome-like Tabs**: Authentic Chrome tab appearance in Tabs view
  - Test: Compare with real Chrome tabs visually
- **Hover Effects**: Visual feedback on interactive elements
  - Test: Hover over tabs, buttons, verify visual changes
- **Icon Buttons**: Clear visual affordances
  - Test: Verify all buttons have clear purpose

---

## ✅ Session Management - IMPLEMENTED

### Lifeboat (Last Session)
- **Auto-Capture on Close**: Saves tabs when browser closes unexpectedly
  - Test: Close browser abruptly, reopen, verify "Last Session" appears
- **Restore All**: Restore all lifeboat tabs to main grabbed tabs
  - Test: Click "Restore All" in Last Session section
- **Clear Lifeboat**: Remove saved session
  - Test: Click "Clear" in Last Session section
- **Visual Preview**: Shows up to 6 tabs from last session
  - Test: Verify preview shows favicons and titles

### Recently Closed
- **Recent Items List**: Shows last 5 recently closed tabs/windows
  - Test: Close some tabs, verify they appear in Recently Closed
- **One-Click Restore**: Restore individual closed items
  - Test: Click "↻ Restore" button on any item
- **Refresh Button**: Manually refresh the recently closed list
  - Test: Click 🔄 button to refresh list
- **Hide Section**: Dismiss recently closed section
  - Test: Click ✕ to hide section
- **Item Count**: Shows total count of recently closed items
  - Test: Verify count matches "(X)" in section header

---

## ✅ Export & Data Management - IMPLEMENTED

### Export Functionality
- **Export to HTML**: Export grabbed tabs as bookmarks HTML file
  - Test: Click "📄 Export" button
  - Verify browser downloads HTML file
  - Verify file can be imported to Chrome bookmarks
- **Domain Grouping**: Tabs organized by domain in export
  - Test: Open exported HTML, verify tabs grouped by domain
- **Disabled State**: Export button disabled when no tabs
  - Test: Clear all tabs, verify Export button is disabled

### Import Functionality (NEW)
- **Import from HTML**: Import tabs from bookmarks HTML file
  - Test: Click "📥 Import" button
  - Select a previously exported HTML file (or Chrome bookmarks export)
  - Verify tabs are loaded into TabsAGO
- **Duplicate Prevention**: Smart merging prevents duplicate tabs
  - Test: Import same file twice, verify no duplicates created
- **Error Handling**: Clear messages for invalid files
  - Test: Try importing non-HTML file, verify error message
- **Duplicate Prevention**: Imported tabs with same URL are not duplicated
  - Test: Import same file twice, verify no duplicate URLs
- **Merge with Existing**: Imported tabs merge with existing grabbed tabs
  - Test: Grab some tabs, import file, verify both sets exist
- **File Selection**: Standard file picker dialog
  - Test: Click Import, verify file picker opens for .html/.htm files
- **Error Handling**: Shows error if file is invalid or empty
  - Test: Try importing non-HTML file or empty file
- **Works in Both Views**: Import button available in List and Tabs views
  - Test: Import from List view, then try from Tabs view

---

## ✅ Help & Information - IMPLEMENTED

### Help Modal
- **Help Button**: ? button in top right
  - Test: Click ? button, verify modal opens
- **Basic Usage Guide**: Instructions for main features
  - Test: Read help content, verify it's accurate
- **Multi-Select Guide**: Explains selection features
  - Test: Verify multi-select instructions are clear
- **Views Explanation**: Describes List vs Tabs views
  - Test: Verify view descriptions match actual behavior
- **Keyboard Shortcuts Info**: Links to Chrome shortcuts settings
  - Test: Verify chrome://extensions/shortcuts link works
- **Close Modal**: ✕ button to close help
  - Test: Click ✕ to close modal

---

## ✅ NEW - Pin Tab Feature - JUST IMPLEMENTED

### Pin Tab Button
- **Pin Icon Button**: 📌 button in top left toolbar
  - Test: Click 📌 button
  - If extension not pinned: Creates new pinned tab with TabsAGO
  - If already open: Makes existing tab pinned and focuses it
  - Purpose: Ensures TabsAGO persists as pinned tab across sessions
- **Always Accessible**: Available in both List and Tabs views
  - Test: Switch views, verify pin button always visible

---

## ✅ Keyboard Navigation & Accessibility - NEW!

### Keyboard Navigation
- **Arrow Keys**: Navigate up/down through tab list
  - Test: Use ↑/↓ arrow keys to move focus between tabs
  - Verify focus indicator appears on focused tab
- **Enter Key**: Open focused tab
  - Test: Focus a tab with arrow keys, press Enter
  - Verify tab opens in new browser window
- **Space Key**: Toggle selection of focused tab
  - Test: Focus a tab, press Space to select/deselect
  - Verify checkbox state changes
- **Cmd/Ctrl+A**: Select all tabs
  - Test: Press Cmd+A (Mac) or Ctrl+A (Windows/Linux)
  - Verify all tabs become selected

### Range Selection
- **Shift+Click**: Select range of tabs
  - Test: Click first tab, then Shift+Click last tab
  - Verify all tabs between are selected

### Accessibility Features
- **ARIA Attributes**: Proper roles and labels for screen readers
  - Test: Use screen reader to navigate tab list
  - Verify proper announcements of selections and navigation
- **Focus Management**: Visible focus indicators
  - Test: Tab through interface, verify focus is visible
  - Test: Use arrow keys, verify focus moves correctly
- **Screen Reader Support**: Announces tab information
  - Test: Screen reader should announce "tab X of Y" and selection state

### Time Display
- **Relative Timestamps**: Shows "5m ago", "2h ago", "3d ago"
  - Test: Grab tabs, verify timestamps show relative time
  - Test: Wait a few minutes, refresh, verify timestamps update
  - Test: Check old tabs show "3d ago", "1w ago", "2mo ago" format

---

## ✅ Thumbnail Preview - REBUILT NOV 9, 2025

### Manual Screenshot Capture
- **User-Initiated Batch Capture**: Click "📸 Capture All Thumbnails" in Help modal
  - Test: Open Help modal (? button) → Scroll to "Thumbnail Settings"
  - Test: Click "📸 Capture All Thumbnails", verify capture begins
  - Test: Watch progress indicator "Capturing X of Y tabs..."
  - Test: Verify extension switches through tabs briefly
  - Test: Verify returns to original tab when complete
  - Test: Check completion stats (success/failed/skipped)
- **Quality Control**: Adjustable quality slider (20-100%)
  - Test: Set quality to 20%, capture, check file size (smaller, faster)
  - Test: Set quality to 100%, capture, check file size (larger, clearer)
  - Test: Default quality 70% provides good balance

### Hover Preview in Both Views
- **List View**: Shows thumbnail preview on hover over tab rows
  - Test: Switch to List view, hover over any tab row
  - Test: Verify preview appears next to cursor with offset
  - Test: Move mouse, verify preview follows smoothly
  - Test: Mouse out, verify preview disappears immediately
- **Tabs View**: Shows thumbnail preview on hover over tab cards
  - Test: Switch to Tabs view, hover over any tab card
  - Test: Verify same preview behavior as List view
  - Test: Verify preview works consistently across both views
- **Preview Content**: Displays screenshot and title
  - Test: Verify screenshot is clear and recognizable
  - Test: Verify title is displayed under thumbnail
- **No Preview Fallback**: Shows helpful message when no thumbnail exists
  - Test: Hover over tab without thumbnail
  - Test: Verify "📷 No preview available" message appears
  - Test: Verify message explains how to capture thumbnails

### Settings & Controls
- **Enable/Disable Toggle**: Control thumbnail feature in Help modal
  - Test: Open Help modal, find "Enable thumbnail previews" checkbox
  - Test: Uncheck to disable, verify capture button becomes disabled
  - Test: Re-enable, verify capture button becomes active again
- **Quality Slider**: Visual feedback with labels
  - Test: Move slider, verify quality percentage updates
  - Test: Verify "Low (faster)" and "High (clearer)" labels visible
  - Test: Verify quality setting persists across sessions
- **Persistent Settings**: All preferences saved to localStorage
  - Test: Change settings, reload extension
  - Test: Verify all settings (enabled, quality) are restored

### Cache Management
- **Clear Cache Button**: "🗑️ Clear Cache" in Help modal
  - Test: Capture thumbnails, then click "🗑️ Clear Cache"
  - Test: Verify success message appears
  - Test: Hover over tabs, verify "No preview available" appears
  - Test: Capture again, verify thumbnails reappear
- **LRU Cache**: Automatic eviction of oldest thumbnails (max 100)
  - Test: Capture 101+ thumbnails
  - Test: Verify oldest thumbnails are evicted automatically
  - Test: Extension remains responsive with large cache
- **Storage Persistence**: Thumbnails stored in chrome.storage.local
  - Test: Capture thumbnails, close browser
  - Test: Reopen browser, reload extension
  - Test: Hover over tabs, verify thumbnails still load

### Performance & Reliability
- **Batch Capture Speed**: ~300ms per tab with progress tracking
  - Test: Capture 10 tabs, should take ~3 seconds
  - Test: Capture 50 tabs, should take ~15 seconds
  - Test: Verify progress indicator updates accurately
- **Hover Responsiveness**: Preview loads quickly
  - Test: Hover over tab, verify preview appears within 200ms
  - Test: Multiple rapid hovers should be smooth
- **Error Handling**: Graceful handling of capture failures
  - Test: Try capturing chrome:// pages (should skip)
  - Test: Try capturing extension pages (should skip)
  - Test: Verify error messages are clear and helpful
  - Test: No lag or stuttering when moving mouse

---

## ❌ NOT IMPLEMENTED / NOT WORKING

### No Major Features Missing ✅
All core features have been implemented!

### Keyboard Shortcuts
- **Extension Shortcuts**: No keyboard shortcuts configured
  - ❌ NOT IMPLEMENTED
  - Spec mentions keyboard shortcuts should be configurable
  - Currently: Must use Chrome's shortcuts settings manually

### Advanced Selection
- **Range Selection**: Shift+Click to select range
  - ❌ NOT IMPLEMENTED
  - Spec mentions this in Phase 2 spec
- **Keyboard Navigation**: Arrow keys to navigate, Space to toggle
  - ❌ NOT IMPLEMENTED

### Capture Current Tab Only
- **Single Tab Capture**: Capture only the active tab
  - ❌ NOT IMPLEMENTED
  - Spec mentions "Capture Current Tab" as separate from "all tabs"
  - Currently: Only "Grab Tabs" (all tabs) exists

### Error Notifications
- **Capture Errors**: Better error handling for failed captures
  - ⚠️ PARTIALLY IMPLEMENTED
  - Basic error messages exist but no persistent notifications

### Responsive Breakpoints
- **Mobile/Small Screen**: Spec mentions 360px breakpoint
  - ⚠️ NOT TESTED
  - May work due to Tailwind, but not explicitly designed for mobile

### Accessibility Features
- **Keyboard Navigation**: Full keyboard accessibility
  - ⚠️ PARTIALLY IMPLEMENTED
  - Basic tab navigation works, but no custom keyboard controls
- **ARIA Labels**: Some exist but coverage incomplete
  - ⚠️ PARTIALLY IMPLEMENTED

### Time Displays
- **Relative Time**: "5m ago" style timestamps
  - ❌ NOT IMPLEMENTED
  - Spec mentions showing last accessed time like "5m ago"

### Performance Features
- **Virtual Scrolling**: For large tab lists (100+)
  - ❌ NOT IMPLEMENTED
  - Spec defers this but mentions it for performance

---

## 🔮 Phase 3+ Features (Not Started)

### Advanced Organization
- Tab Groups UI
- Named groups
- Custom tags
- Smart grouping by keywords

### Advanced Views
- Timeline/History view with day buckets
- Grid view (different from Tabs view)
- Snapshot/Thumbnail view

### Side Panel
- Chrome side panel integration
- Toggle side panel from extension icon

### Settings Page
- Preferences UI
- Keyboard shortcut customization
- Auto-save settings
- Data export/import

### Data Management
- Backup/restore functionality
- Storage usage display
- Data retention controls

---

## Testing Checklist Template

Use this checklist for manual testing sessions:

```
Date: _______________
Tester: _____________
Browser: Chrome Version: _____

### Core Functionality
- [ ] Grab Tabs
- [ ] Remove individual tab
- [ ] Clear All
- [ ] Open tab (click)
- [ ] Select All
- [ ] Multi-select (individual)
- [ ] Bulk Open
- [ ] Bulk Remove

### Views & UI
- [ ] Switch to List view
- [ ] Switch to Tabs view
- [ ] Toggle Light theme
- [ ] Toggle Dark theme
- [ ] Pin tab button (📌)

### Sorting & Search
- [ ] Sort: Latest → Oldest
- [ ] Sort: Oldest → Latest
- [ ] Sort: Title A–Z
- [ ] Sort: Domain A–Z
- [ ] Search by title
- [ ] Search by URL

### Session Features
- [ ] Recently Closed appears
- [ ] Restore recently closed item
- [ ] Refresh recently closed
- [ ] Hide recently closed
- [ ] Lifeboat appears (after crash)
- [ ] Restore lifeboat
- [ ] Clear lifeboat

### Export, Import & Help
- [ ] Export to HTML
- [ ] Import from HTML
- [ ] Import merges with existing tabs
- [ ] Import prevents duplicates
- [ ] Open Help modal
- [ ] Close Help modal

### Persistence
- [ ] Theme persists after reload
- [ ] View mode persists after reload
- [ ] Sort preference persists
- [ ] Grabbed tabs persist after browser restart

### Known Issues Found
(List any bugs or unexpected behavior)
```

---

## Test Scenarios

### Scenario 1: First Time User
1. Install extension
2. Verify pinned tab opens automatically
3. Click "Grab Tabs" 
4. Verify all open tabs appear
5. Try List and Tabs views
6. Open Help modal

### Scenario 2: Daily Usage
1. Open extension
2. Grab current tabs
3. Search for specific tab
4. Select multiple tabs
5. Bulk open selected tabs
6. Clear old tabs

### Scenario 3: Session Recovery
1. Grab tabs
2. Close browser abruptly (force quit)
3. Reopen browser
4. Verify "Last Session" lifeboat appears
5. Restore lifeboat tabs

### Scenario 4: Export & Import Workflow
1. Grab diverse tabs from different domains
2. Export to HTML
3. Clear all tabs in TabsAGO
4. Import the same HTML file back
5. Verify all tabs are restored correctly
6. Verify no duplicates if imported again
7. Optional: Import HTML to Chrome bookmarks to verify format compatibility

### Scenario 5: Theme & Preferences
1. Change theme to dark
2. Reload extension - verify dark persists
3. Switch to tabs view
4. Reload - verify tabs view persists
5. Change sort to Domain A-Z
6. Reload - verify sort persists

---

## Performance Benchmarks

Test with different tab counts:
- [ ] 10 tabs: Should be instant
- [ ] 50 tabs: Should be smooth
- [ ] 100 tabs: Target < 1s load time
- [ ] 500+ tabs: May need optimization

---

## Browser Compatibility

Tested on:
- [ ] Chrome (latest stable)
- [ ] Chrome (beta)
- [ ] Chrome (canary)
- [ ] Edge (Chromium)
- [ ] Brave
- [ ] Other Chromium browsers

---

## Notes

- Most core features are working well
- ✅ **Thumbnail preview on hover**: Fully implemented and working (rebuilt Nov 9, 2025)
- Some advanced accessibility features incomplete
- Keyboard shortcuts need manual setup in Chrome
- Mobile/responsive not fully tested

---

## Recent Updates

### October 19, 2025 (Evening)
- ✅ **Import Functionality Added**: Users can now import previously exported HTML bookmark files
- Import button (📥 Import) added next to Export button in both List and Tabs views
- Imported tabs automatically merge with existing tabs (no duplicates)
- Supports standard Netscape bookmark HTML format
- Compatible with TabsAGO exports and Chrome bookmark exports

---

Last Updated: October 19, 2025

