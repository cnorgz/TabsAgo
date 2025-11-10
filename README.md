# TabsAGO Chrome Extension

A Chrome extension to organize and manage multiple Chrome tabs into a single, organized view with different viewing modes and organizational options.

## MVP Vision

**Core Purpose**: Transform the chaos of multiple Chrome tabs into one organized, manageable interface.

**What it does**: 
- Consolidates multiple tabs into a single pinned tab
- Provides different viewing modes (List, Grid, Timeline)
- Organizes tabs by categories, domains, or time
- Offers search, filtering, and grouping capabilities
- Maintains tab state and allows quick navigation

## Features (Planned for v1.0)

### Core Functionality
- [ ] **Tab Consolidation**: Grab (capture) and organize multiple tabs into one view
- [ ] **Multiple View Modes**: 
  - List View: Compact list with thumbnails and metadata
  - Grid View: Visual grid layout for easy scanning
  - Timeline View: Chronological organization
- [ ] **Smart Organization**: Auto-group by domain, category, or manual tags
- [ ] **Search & Filter**: Find tabs quickly across all saved tabs
- [ ] **Quick Navigation**: One-click tab restoration and management

### User Experience
- [ ] **Pinned Tab Interface**: Always accessible, organized workspace
- [ ] **Light/Dark Theme**: Consistent with Chrome's theme system
- [ ] **Responsive Design**: Works across different screen sizes
- [ ] **Keyboard Shortcuts**: Power user navigation options

### Technical Features
- [ ] **Tab State Management**: Preserve tab information and order
- [ ] **Storage Optimization**: Efficient local storage for tab data
- [ ] **Auto-refresh**: Keep tab information current
- [ ] **Error Handling**: Robust error recovery and logging

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Chrome/Chromium browser (for testing)
- Git

### Installation
1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run type-check` — TypeScript check
- `npm run lint` / `npm run lint:fix` — ESLint check/fix
- `npm run format` / `npm run format:check` — Prettier format/check
- `npm run test` / `npm run test:watch` — Vitest unit tests

See also:
- `docs/PROJECT_STATUS_OCT_20_2025.md` - ⭐ **CURRENT STATUS & FEATURE LIST**
- `docs/THUMBNAIL_REBUILD_NOV_09.md` - 🔧 **THUMBNAIL SYSTEM REBUILD** (Latest)
- `docs/THUMBNAIL_FIX_OCT_20.md` - 🔧 Previous thumbnail fix (superseded)
- `docs/PHASE2_SPEC.md` for features/specs
- `docs/PROJECT_TRACKING.md` for task tracking
- `docs/FEATURE_TEST_GUIDE.md` for comprehensive testing checklist
- `docs/KNOWN_GAPS_IMPLEMENTATION_COMPLETE.md` - ✅ All gaps resolved
- `docs/IMPORT_FEATURE.md` for import functionality documentation
- `docs/UI_IMPROVEMENTS_OCT_19_EVENING.md` for UI/layout changes
- `docs/ROUTINE_CHECKLISTS.md` for workflow prompts
- `docs/CODE_AUDIT.md` for code quality guardrails

### Loading Extension
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` directory after building

## Project Structure

```
TabsAGO/
├── src/
│   ├── components/
│   │   ├── TabManager/
│   │   ├── ViewModes/
│   │   ├── Settings/
│   │   └── Common/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── views/
│   └── service-worker.ts
├── public/
│   ├── manifest.json
│   └── assets/
├── dist/           # Built extension
├── docs/           # Project documentation
└── package.json
```

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build Tool**: Vite with @crxjs/vite-plugin
- **Extension**: Chrome Extension Manifest V3
- **State Management**: React hooks + chrome.storage
- **UI Components**: Radix UI primitives for complex behaviors

## Development Guidelines

- Follow Chrome Extension MV3 best practices
- Use React functional components with hooks
- Implement robust error handling and logging
- Write clear, descriptive commit messages
- Document code changes and new features
- Test thoroughly before submitting changes

## Permissions Used

- `tabs`: Required for creating and managing tabs
- `storage`: For saving user settings and tab data
- `activeTab`: For accessing current tab information

## Author

Xavier Stack

## License

MIT License 