# Known Gaps Implementation Plan

## Overview
This document outlines a detailed plan to implement the features identified as "Known Gaps" in PROJECT_TRACKING.md. These features were mentioned in specifications but not yet implemented.

**Status**: 🔴 **Ready to Start**  
**Priority**: Medium-High (Quality of Life improvements)  
**Estimated Timeline**: 2-3 days

---

## Known Gaps to Address

From PROJECT_TRACKING.md (lines 401-405):
1. ✅ Thumbnail/snapshot preview on hover (mentioned in spec, not implemented)
2. ✅ Some advanced accessibility features (keyboard navigation, range selection)
3. ✅ Single tab capture (only "all tabs" currently works)
4. ✅ Relative time display ("5m ago")

---

## Implementation Sequence

### Phase 1: Single Tab Capture (Easiest - 2 hours)
**Priority**: HIGH  
**Complexity**: ⭐ Low  
**Dependencies**: None

#### **GAP-001**: Add "Capture Current Tab" Functionality

**Current State**:
- Only "Grab Tabs" button exists (captures all tabs in window)
- No way to capture just the active tab

**Desired State**:
- Two separate buttons or a dropdown:
  - "Grab Current Tab" - captures only active tab
  - "Grab All Tabs" - captures all tabs in window

**Implementation Steps**:

1. **Update TabService** (Already exists but not exposed)
   ```typescript
   // src/services/TabService.ts already has:
   async captureActiveTab(): Promise<TabItem | null>
   ```

2. **Add UI Controls** - Option A: Two Separate Buttons
   ```tsx
   // In TabManager.tsx and TabsView.tsx
   <button className="btn" onClick={captureCurrentTab}>
     Grab Current Tab
   </button>
   <button className="btn" onClick={captureAllTabsInWindow}>
     Grab All Tabs
   </button>
   ```

3. **Add UI Controls** - Option B: Dropdown Menu (Recommended)
   ```tsx
   <div className="btn-group">
     <button className="btn" onClick={captureAllTabsInWindow}>
       Grab Tabs
     </button>
     <button className="btn-dropdown" onClick={toggleDropdown}>
       ▼
     </button>
     {showDropdown && (
       <div className="dropdown-menu">
         <button onClick={captureCurrentTab}>Current Tab Only</button>
         <button onClick={captureAllTabsInWindow}>All Tabs</button>
       </div>
     )}
   </div>
   ```

4. **Wire Up Handler in App.tsx**
   ```typescript
   const captureCurrentTab = async () => {
     try {
       const tab = await TabService.captureActiveTab()
       if (tab) {
         const merged = await TabService.appendCapturedTabs([tab])
         await setStoredTabs(merged)
         setError(null)
       }
     } catch {
       setError('Failed to capture current tab.')
       setTimeout(() => setError(null), 3000)
     }
   }
   ```

5. **Update Documentation**
   - Update FEATURE_TEST_GUIDE.md
   - Add to help modal

**Files to Modify**:
- `src/views/App.tsx` - Add handler
- `src/components/TabManager/TabManager.tsx` - Add UI
- `src/components/ViewModes/TabsView.tsx` - Add UI
- `docs/FEATURE_TEST_GUIDE.md` - Document feature

**Testing**:
- [ ] Click "Grab Current Tab" on a specific tab
- [ ] Verify only that tab is captured
- [ ] Verify duplicate prevention works
- [ ] Test keyboard shortcut (if implemented)

---

### Phase 2: Relative Time Display (Easy - 2 hours)
**Priority**: MEDIUM  
**Complexity**: ⭐ Low  
**Dependencies**: None

#### **GAP-002**: Display Relative Time ("5m ago")

**Current State**:
- Tabs show title and domain
- No timestamp information displayed
- Captured timestamp stored but not shown

**Desired State**:
- Show relative time since last access or capture
- Format: "5m ago", "2h ago", "3d ago"
- Updates in real-time (optional)

**Implementation Steps**:

1. **Create Time Utility Function**
   ```typescript
   // src/utils/timeUtils.ts
   export function getRelativeTime(timestamp: number | string): string {
     const now = Date.now()
     const then = typeof timestamp === 'number' 
       ? timestamp 
       : new Date(timestamp).getTime()
     
     const diffMs = now - then
     const diffSec = Math.floor(diffMs / 1000)
     const diffMin = Math.floor(diffSec / 60)
     const diffHour = Math.floor(diffMin / 60)
     const diffDay = Math.floor(diffHour / 24)
     
     if (diffSec < 60) return 'just now'
     if (diffMin < 60) return `${diffMin}m ago`
     if (diffHour < 24) return `${diffHour}h ago`
     if (diffDay < 7) return `${diffDay}d ago`
     if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
     return `${Math.floor(diffDay / 30)}mo ago`
   }
   ```

2. **Add to List View**
   ```tsx
   // In TabManager.tsx
   <div className="min-w-0" style={{flex: 1}}>
     <div className="title" title={tab.title}>{tab.title}</div>
     <div className="domain">
       {tab.domain}
       <span className="time-ago">
         · {getRelativeTime(tab.lastAccessed || tab.capturedAt)}
       </span>
     </div>
   </div>
   ```

3. **Add CSS Styling**
   ```css
   .time-ago {
     color: var(--muted);
     font-size: 11px;
     margin-left: 4px;
   }
   ```

4. **Optional: Real-time Updates**
   ```typescript
   // Update every minute
   useEffect(() => {
     const interval = setInterval(() => {
       setForceUpdate(Date.now())
     }, 60000)
     return () => clearInterval(interval)
   }, [])
   ```

**Files to Modify**:
- `src/utils/timeUtils.ts` (NEW)
- `src/components/TabManager/TabManager.tsx`
- `src/views/index.css`
- Add unit tests in `src/utils/timeUtils.test.ts` (NEW)

**Testing**:
- [ ] Grab tabs and verify relative time displays
- [ ] Test with various ages: recent, hours, days, weeks
- [ ] Verify time updates (if real-time enabled)
- [ ] Test edge cases (future dates, invalid dates)

---

### Phase 3: Keyboard Navigation & Accessibility (Medium - 4 hours)
**Priority**: HIGH  
**Complexity**: ⭐⭐ Medium  
**Dependencies**: None

#### **GAP-003**: Advanced Accessibility Features

**Current State**:
- Basic ARIA labels exist
- No keyboard navigation
- No range selection with Shift+Click
- Tab key works for basic navigation

**Desired State**:
- Full keyboard navigation (Arrow keys, Enter, Space)
- Range selection with Shift+Click
- Keyboard shortcuts (Cmd/Ctrl+A for select all)
- Proper focus management
- Enhanced ARIA attributes

**Implementation Steps**:

1. **Add Keyboard Event Handlers**
   ```typescript
   // In TabManager.tsx
   const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
     switch(e.key) {
       case 'ArrowDown':
         e.preventDefault()
         focusTab(index + 1)
         break
       case 'ArrowUp':
         e.preventDefault()
         focusTab(index - 1)
         break
       case 'Enter':
         e.preventDefault()
         openTab(tabs[index].id)
         break
       case ' ': // Space
         e.preventDefault()
         handleSelect(tabs[index].id, !selected.has(tabs[index].id))
         break
       case 'a':
         if (e.metaKey || e.ctrlKey) {
           e.preventDefault()
           handleSelectAll()
         }
         break
     }
   }
   ```

2. **Implement Range Selection**
   ```typescript
   const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1)
   
   const handleRowClick = (index: number, e: React.MouseEvent) => {
     if (e.shiftKey && lastSelectedIndex !== -1) {
       // Range selection
       const start = Math.min(lastSelectedIndex, index)
       const end = Math.max(lastSelectedIndex, index)
       const idsToSelect = tabs.slice(start, end + 1).map(t => t.id)
       
       setSelected(prev => {
         const next = new Set(prev)
         idsToSelect.forEach(id => next.add(id))
         return next
       })
     } else {
       setLastSelectedIndex(index)
     }
   }
   ```

3. **Add Focus Management**
   ```typescript
   const tabRefs = useRef<(HTMLDivElement | null)[]>([])
   
   const focusTab = (index: number) => {
     if (index >= 0 && index < tabs.length) {
       tabRefs.current[index]?.focus()
     }
   }
   ```

4. **Enhanced ARIA Attributes**
   ```tsx
   <div
     role="listbox"
     aria-label="Grabbed tabs list"
     aria-multiselectable="true"
   >
     {tabs.map((tab, index) => (
       <div
         key={tab.id}
         role="option"
         aria-selected={selected.has(tab.id)}
         aria-posinset={index + 1}
         aria-setsize={tabs.length}
         tabIndex={0}
         ref={el => tabRefs.current[index] = el}
         onKeyDown={(e) => handleKeyDown(e, index)}
         onClick={(e) => handleRowClick(index, e)}
       >
         {/* tab content */}
       </div>
     ))}
   </div>
   ```

5. **Add Visual Focus Indicators**
   ```css
   .row-button:focus {
     outline: 2px solid var(--accent);
     outline-offset: 2px;
   }
   
   .row-button:focus-visible {
     outline: 2px solid var(--accent);
     outline-offset: 2px;
   }
   ```

**Files to Modify**:
- `src/components/TabManager/TabManager.tsx`
- `src/views/index.css`
- `docs/FEATURE_TEST_GUIDE.md`

**Testing**:
- [ ] Arrow Up/Down navigates between tabs
- [ ] Enter opens focused tab
- [ ] Space toggles selection
- [ ] Cmd/Ctrl+A selects all tabs
- [ ] Shift+Click selects range
- [ ] Tab key follows logical order
- [ ] Screen reader announces selections correctly

---

### Phase 4: Thumbnail Preview on Hover (Hard - 6-8 hours)
**Priority**: LOW (Nice to have)  
**Complexity**: ⭐⭐⭐⭐ High  
**Dependencies**: Chrome tabs.captureVisibleTab API

#### **GAP-004**: Tab Thumbnail Previews

**Current State**:
- No thumbnail capture
- No preview on hover
- Only favicons displayed

**Desired State**:
- Capture tab screenshot when grabbed
- Display thumbnail on hover
- Cache thumbnails for performance
- Lazy load thumbnails

**Why This Is Complex**:
1. Requires `tabs.captureVisibleTab` permission
2. Must capture screenshot of each tab individually
3. Storage: Screenshots are large (need compression/optimization)
4. Performance: Must be fast, can't slow down tab capture
5. UI: Need smooth hover interaction with loading states

**Implementation Steps**:

1. **Add Permission to Manifest**
   ```json
   // public/manifest.json
   {
     "permissions": [
       "tabs",
       "storage",
       "activeTab",
       "sessions",
       "tabCapture"  // NEW - if needed
     ]
   }
   ```

2. **Create Thumbnail Service**
   ```typescript
   // src/services/ThumbnailService.ts
   export const ThumbnailService = {
     async captureThumbnail(tabId: number): Promise<string | null> {
       try {
         // Switch to tab first (required for captureVisibleTab)
         await chrome.tabs.update(tabId, { active: true })
         
         // Wait a moment for tab to render
         await new Promise(resolve => setTimeout(resolve, 100))
         
         // Capture screenshot
         const dataUrl = await chrome.tabs.captureVisibleTab(
           undefined,
           { format: 'jpeg', quality: 50 }
         )
         
         return dataUrl
       } catch (error) {
         console.error('Thumbnail capture failed:', error)
         return null
       }
     },
     
     async captureThumbnails(tabIds: number[]): Promise<Map<number, string>> {
       const thumbnails = new Map<number, string>()
       
       for (const tabId of tabIds) {
         const thumbnail = await this.captureThumbnail(tabId)
         if (thumbnail) {
           thumbnails.set(tabId, thumbnail)
         }
       }
       
       return thumbnails
     }
   }
   ```

3. **Update TabItem Type**
   ```typescript
   // src/types/Tab.ts
   export interface TabItem {
     id: string
     title: string
     url: string
     favicon: string
     capturedAt: string
     domain: string
     lastAccessed?: number
     thumbnail?: string  // NEW - base64 data URL
   }
   ```

4. **Integrate into Capture Flow**
   ```typescript
   // In TabService.ts
   const captureCurrentWindowTabs = async ({ 
     captureThumbnails = false 
   }) => {
     const tabs = await chrome.tabs.query({ currentWindow: true })
     const mapped = tabs.map(mapChromeTabToTabItem).filter(Boolean)
     
     if (captureThumbnails) {
       const tabIds = tabs.map(t => t.id).filter(Boolean)
       const thumbnails = await ThumbnailService.captureThumbnails(tabIds)
       
       // Add thumbnails to mapped tabs
       mapped.forEach(tab => {
         const chromeTab = tabs.find(t => t.url === tab.url)
         if (chromeTab?.id && thumbnails.has(chromeTab.id)) {
           tab.thumbnail = thumbnails.get(chromeTab.id)
         }
       })
     }
     
     return mapped
   }
   ```

5. **Add Hover Preview UI**
   ```tsx
   // In TabManager.tsx
   const [hoveredTab, setHoveredTab] = useState<string | null>(null)
   
   <div 
     className="row-button"
     onMouseEnter={() => setHoveredTab(tab.id)}
     onMouseLeave={() => setHoveredTab(null)}
   >
     {/* tab content */}
     
     {hoveredTab === tab.id && tab.thumbnail && (
       <div className="thumbnail-preview">
         <img 
           src={tab.thumbnail} 
           alt={`Preview of ${tab.title}`}
           loading="lazy"
         />
       </div>
     )}
   </div>
   ```

6. **Add CSS for Preview**
   ```css
   .thumbnail-preview {
     position: absolute;
     top: 100%;
     left: 0;
     z-index: 1000;
     margin-top: 8px;
     padding: 8px;
     background: var(--panel);
     border: 1px solid var(--border);
     border-radius: 8px;
     box-shadow: 0 10px 30px rgba(0,0,0,0.2);
     max-width: 400px;
     pointer-events: none;
   }
   
   .thumbnail-preview img {
     width: 100%;
     height: auto;
     border-radius: 4px;
   }
   ```

7. **Optimization Considerations**
   - **Storage Limits**: Thumbnails can be large (50-100KB each)
   - **Solution 1**: Store thumbnails separately in IndexedDB
   - **Solution 2**: Limit number of cached thumbnails
   - **Solution 3**: Use WebP format with aggressive compression
   - **Solution 4**: Only capture on demand (first hover triggers capture)

8. **Alternative: On-Demand Capture**
   ```typescript
   // Capture thumbnail only when first hovered
   const loadThumbnail = async (tabUrl: string) => {
     if (thumbnailCache.has(tabUrl)) {
       return thumbnailCache.get(tabUrl)
     }
     
     // Find if tab is still open
     const tabs = await chrome.tabs.query({ url: tabUrl })
     if (tabs.length > 0 && tabs[0].id) {
       const thumbnail = await ThumbnailService.captureThumbnail(tabs[0].id)
       if (thumbnail) {
         thumbnailCache.set(tabUrl, thumbnail)
         return thumbnail
       }
     }
     
     return null
   }
   ```

**Files to Create**:
- `src/services/ThumbnailService.ts` (NEW)
- `src/utils/imageCompression.ts` (NEW - optional)

**Files to Modify**:
- `public/manifest.json` - Add permissions
- `src/types/Tab.ts` - Add thumbnail field
- `src/services/TabService.ts` - Integrate thumbnail capture
- `src/components/TabManager/TabManager.tsx` - Add hover preview
- `src/views/index.css` - Add preview styling
- `src/views/App.tsx` - Add thumbnail toggle in settings

**Testing**:
- [ ] Thumbnails captured when grabbing tabs
- [ ] Hover shows thumbnail preview
- [ ] Preview positioning works correctly
- [ ] No performance degradation
- [ ] Storage usage acceptable
- [ ] Works with 50+ tabs
- [ ] Fallback when capture fails

**Challenges & Risks**:
1. **Performance**: Capturing many screenshots is slow
2. **Storage**: Thumbnails use significant storage
3. **Permissions**: User may not grant captureVisibleTab permission
4. **UX**: Must be fast and smooth, or it feels broken
5. **Tab Switching**: captureVisibleTab requires tab to be active

**Recommendation**:
- **Phase 4A**: Implement basic capture (capture on grab, store base64)
- **Phase 4B**: Add hover preview UI
- **Phase 4C**: Optimize storage (IndexedDB, compression)
- **Phase 4D**: Add on-demand capture option
- **Make it optional**: Add toggle in settings to enable/disable

---

## Implementation Priority Recommendation

Based on complexity and user value:

### ✅ Immediate Implementation (Day 1)
1. **GAP-001**: Single Tab Capture - 2 hours
2. **GAP-002**: Relative Time Display - 2 hours

### ✅ Short-term Implementation (Day 2)
3. **GAP-003**: Keyboard Navigation & Accessibility - 4 hours

### ⚠️ Long-term Implementation (Day 3-4, Optional)
4. **GAP-004**: Thumbnail Preview - 6-8 hours (Make optional feature)

---

## Success Metrics

After implementing all gaps:
- [ ] Users can capture single tabs (not just all tabs)
- [ ] Relative timestamps help users identify tab age
- [ ] Full keyboard navigation works smoothly
- [ ] Shift+Click range selection works
- [ ] [Optional] Hover thumbnails provide visual preview
- [ ] Screen readers properly announce all interactions
- [ ] No performance degradation with 100+ tabs

---

## Testing Plan

### Unit Tests
- `timeUtils.test.ts` - Relative time formatting
- `ThumbnailService.test.ts` - Thumbnail capture (if implemented)

### Integration Tests
- Single tab capture workflow
- Keyboard navigation through list
- Range selection with Shift+Click
- Thumbnail hover behavior

### Manual Testing
- Test all features across List and Tabs views
- Test with various tab counts (10, 50, 100+)
- Test keyboard accessibility with screen reader
- Test performance impact of thumbnails

---

## Documentation Updates

After implementation, update:
- ✅ `docs/FEATURE_TEST_GUIDE.md` - Add new features
- ✅ `docs/PROJECT_TRACKING.md` - Mark gaps as complete
- ✅ Help modal in app - Document new shortcuts
- ✅ `README.md` - Update feature list

---

## Notes

- All features should be **optional** where possible (settings toggle)
- Maintain **backward compatibility** (existing data still works)
- Add **graceful fallbacks** (thumbnail fails? show favicon)
- Keep **performance** in mind (don't slow down main operations)
- Ensure **accessibility** for all features

---

## Risk Assessment

| Feature | Risk | Mitigation |
|---------|------|------------|
| Single Tab Capture | LOW | Already implemented in service, just needs UI |
| Relative Time | LOW | Simple utility function, no dependencies |
| Keyboard Navigation | MEDIUM | Complex state management, needs thorough testing |
| Thumbnails | HIGH | Performance, storage, permissions, UX complexity |

---

## Decision: Thumbnail Implementation

**Recommendation**: Make thumbnails an **optional Phase 3+ feature**

**Reasons**:
1. High complexity vs. moderate user value
2. Significant storage and performance implications
3. Requires additional permissions
4. Other gaps provide more immediate value

**Alternative**: Implement as experimental feature with setting toggle

---

Last Updated: October 19, 2025 (Evening)

