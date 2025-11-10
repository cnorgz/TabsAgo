<!-- 89917496-20e9-4e5d-96c1-d371f88ee592 f78d31f0-e2c3-4ecc-82bf-b55527e4fcee -->
# Known Gaps Implementation Plan

## Overview

Implement the three high-priority features identified in KNOWN_GAPS_IMPLEMENTATION_PLAN.md:

1. Single Tab Capture (capture just current tab)
2. Relative Time Display (show "5m ago" timestamps)
3. Keyboard Navigation & Accessibility (arrow keys, range selection, ARIA)

Thumbnail preview is deferred as low-priority optional feature (6-8h additional work).

## Phase 1: Single Tab Capture (2 hours)

### Files to Modify

- `src/views/App.tsx` - Add captureCurrentTab handler
- `src/components/TabManager/TabManager.tsx` - Add UI for single tab capture
- `src/components/ViewModes/TabsView.tsx` - Add UI for single tab capture

### Implementation

**Step 1: Add handler in App.tsx**

Create new function after `captureAllTabsInWindow`:

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

**Step 2: Pass to components**

Add `captureCurrentTab` prop to both TabManager and TabsView components.

**Step 3: Update TabManager.tsx interface**

Add to props: `captureCurrentTab: () => Promise<void>`

**Step 4: Add dropdown UI in TabManager.tsx**

Replace single "Grab Tabs" button with button group:

```tsx
<div className="btn-group" style={{position: 'relative'}}>
  <button className="btn" onClick={captureAllTabsInWindow}>
    Grab Tabs
  </button>
  <button 
    className="btn" 
    onClick={() => setShowDropdown(!showDropdown)}
    style={{padding: '8px 6px', marginLeft: '-1px'}}
  >
    ▼
  </button>
  {showDropdown && (
    <div className="dropdown-menu" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '4px',
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow)',
      zIndex: 1000,
      minWidth: '150px'
    }}>
      <button 
        className="dropdown-item"
        onClick={() => {
          captureCurrentTab()
          setShowDropdown(false)
        }}
      >
        Current Tab Only
      </button>
      <button 
        className="dropdown-item"
        onClick={() => {
          captureAllTabsInWindow()
          setShowDropdown(false)
        }}
      >
        All Tabs in Window
      </button>
    </div>
  )}
</div>
```

**Step 5: Add CSS for dropdown**

In `src/views/index.css`:

```css
.btn-group {
  display: inline-flex;
}

.dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.dropdown-item {
  all: unset;
  cursor: pointer;
  padding: 8px 12px;
  text-align: left;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text);
}

.dropdown-item:hover {
  background: var(--btn-hover-bg);
}
```

**Step 6: Repeat for TabsView.tsx**

Apply same dropdown UI to TabsView component.

## Phase 2: Relative Time Display (2 hours)

### Files to Create

- `src/utils/timeUtils.ts` - Time formatting utility
- `src/utils/timeUtils.test.ts` - Unit tests

### Files to Modify

- `src/components/TabManager/TabManager.tsx` - Display relative time
- `src/views/index.css` - Style time display

### Implementation

**Step 1: Create timeUtils.ts**

```typescript
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

**Step 2: Add to TabManager list view**

Update the domain line to include relative time:

```tsx
import { getRelativeTime } from '../../utils/timeUtils'

// In the tab mapping:
<div className="domain">
  {tab.domain}
  <span className="time-ago">
    {' · '}
    {getRelativeTime(tab.lastAccessed || tab.capturedAt)}
  </span>
</div>
```

**Step 3: Add CSS styling**

```css
.time-ago {
  color: var(--muted);
  font-size: 11px;
  opacity: 0.8;
}
```

**Step 4: Create tests**

Basic tests for timeUtils:

```typescript
import { describe, it, expect } from 'vitest'
import { getRelativeTime } from './timeUtils'

describe('getRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = Date.now()
    expect(getRelativeTime(now)).toBe('just now')
  })
  
  it('returns minutes for < 1 hour', () => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    expect(getRelativeTime(fiveMinutesAgo)).toBe('5m ago')
  })
  
  // Add more tests...
})
```

## Phase 3: Keyboard Navigation & Accessibility (4 hours)

### Files to Modify

- `src/components/TabManager/TabManager.tsx` - Add keyboard handlers and focus management
- `src/views/index.css` - Add focus styles

### Implementation

**Step 1: Add state for keyboard navigation**

```typescript
const [focusedIndex, setFocusedIndex] = useState<number>(0)
const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1)
const tabRefs = useRef<(HTMLDivElement | null)[]>([])
```

**Step 2: Implement keyboard handler**

```typescript
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault()
      const nextIndex = Math.min(index + 1, tabs.length - 1)
      setFocusedIndex(nextIndex)
      tabRefs.current[nextIndex]?.focus()
      break
      
    case 'ArrowUp':
      e.preventDefault()
      const prevIndex = Math.max(index - 1, 0)
      setFocusedIndex(prevIndex)
      tabRefs.current[prevIndex]?.focus()
      break
      
    case 'Enter':
      e.preventDefault()
      openTab(tabs[index].id)
      break
      
    case ' ':
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

**Step 3: Implement range selection**

```typescript
const handleRowClick = (index: number, e: React.MouseEvent) => {
  if (e.shiftKey && lastSelectedIndex !== -1) {
    // Range selection
    e.preventDefault()
    const start = Math.min(lastSelectedIndex, index)
    const end = Math.max(lastSelectedIndex, index)
    
    setSelected(prev => {
      const next = new Set(prev)
      for (let i = start; i <= end; i++) {
        next.add(tabs[i].id)
      }
      return next
    })
  } else {
    setLastSelectedIndex(index)
  }
}
```

**Step 4: Update row rendering with ARIA and refs**

```tsx
<li 
  key={tab.id}
  role="option"
  aria-selected={selected.has(tab.id)}
  aria-posinset={index + 1}
  aria-setsize={tabs.length}
  tabIndex={0}
  ref={el => tabRefs.current[index] = el}
  onKeyDown={(e) => handleKeyDown(e, index)}
  onClick={(e) => handleRowClick(index, e)}
  style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0'}}
>
  {/* existing content */}
</li>
```

**Step 5: Update list container with ARIA**

```tsx
<ul 
  className="list"
  role="listbox"
  aria-label="Grabbed tabs list"
  aria-multiselectable="true"
>
  {/* tabs */}
</ul>
```

**Step 6: Add focus styles**

```css
.row-button:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.row-button:focus:not(:focus-visible) {
  outline: none;
}

.row-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

## Testing Checklist

### Phase 1: Single Tab Capture

- [ ] Dropdown appears on click
- [ ] "Current Tab Only" captures just active tab
- [ ] "All Tabs in Window" captures all tabs
- [ ] Dropdown closes after selection
- [ ] No duplicates created

### Phase 2: Relative Time

- [ ] Time displays correctly for recent tabs
- [ ] Time displays for old tabs (days, weeks, months)
- [ ] Time format is readable and consistent
- [ ] Tests pass: `npm run test`

### Phase 3: Keyboard Navigation

- [ ] Arrow Down moves focus to next tab
- [ ] Arrow Up moves focus to previous tab
- [ ] Enter opens focused tab
- [ ] Space toggles selection
- [ ] Cmd/Ctrl+A selects all
- [ ] Shift+Click selects range
- [ ] Focus visible with outline
- [ ] Screen reader announces selections

## Documentation Updates

After implementation:

- Update `docs/FEATURE_TEST_GUIDE.md` with new features
- Update `docs/PROJECT_TRACKING.md` to mark gaps as complete
- Update help modal in App.tsx with keyboard shortcuts

## Build & Deploy

Final steps:

- Run `npm run build` to verify no errors
- Run `npm run lint` to check code quality
- Run `npm run type-check` for TypeScript
- Test in Chrome with loaded extension

### To-dos

- [ ] Implement single tab capture with dropdown UI (current tab only vs all tabs)
- [ ] Add relative time display utility and show timestamps in list view
- [ ] Implement keyboard navigation (arrows, Enter, Space, Cmd+A) and range selection
- [ ] Add enhanced ARIA attributes and focus management
- [ ] Test all features and update documentation