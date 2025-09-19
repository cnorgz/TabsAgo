# TabsAGO Documentation References

## Project Overview

**TabsAGO** is a Chrome extension that consolidates multiple browser tabs into a single, organized interface. The extension provides multiple viewing modes, smart organization, and efficient tab management capabilities.

## Core APIs Documentation

### Chrome Extension APIs
- **Tabs API**: https://developer.chrome.com/docs/extensions/reference/api/tabs
  - Used for: Creating pinned tabs, accessing tab information, managing tab lifecycle
- **Storage API**: https://developer.chrome.com/docs/extensions/reference/api/storage
  - Used for: Persisting tab data, user preferences, settings
- **Action API**: https://developer.chrome.com/docs/extensions/reference/api/action
  - Used for: Extension icon and popup management
- **Runtime API**: https://developer.chrome.com/docs/extensions/reference/api/runtime
  - Used for: Service worker lifecycle, message passing

### Development Guidelines
- **Manifest V3**: https://developer.chrome.com/docs/extensions/reference/manifest
  - Required for new extensions, uses service workers instead of background pages
- **Service Workers**: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics
  - Handles extension lifecycle, tab creation, and background tasks
- **Debugging Guide**: https://developer.chrome.com/docs/extensions/develop/debug
  - Tools and techniques for debugging Chrome extensions

## Technology Stack Documentation

### Frontend Framework
- **React 18**: https://react.dev/
  - Component library for building the extension UI
  - Hooks for state management and side effects
- **TypeScript**: https://www.typescriptlang.org/
  - Type safety and better developer experience
  - Chrome extension API type definitions

### Styling & UI
- **Tailwind CSS**: https://tailwindcss.com/
  - Utility-first CSS framework for rapid UI development
  - Responsive design and theme system
- **Radix UI**: https://www.radix-ui.com/
  - Accessible UI primitives for complex interactions
  - Used for dropdowns, modals, and advanced components

### Build Tools
- **Vite**: https://vitejs.dev/
  - Fast build tool and development server
  - Hot module replacement for development
- **@crxjs/vite-plugin**: https://crxjs.dev/
  - Vite plugin for building Chrome extensions
  - Handles manifest generation and MV3 compatibility

## Architecture Documentation

### Component Structure
```
src/
├── components/
│   ├── TabManager/          # Core tab management logic
│   ├── ViewModes/           # List, Grid, Timeline views
│   ├── Settings/            # User preferences and configuration
│   └── Common/              # Shared components (buttons, modals, etc.)
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions and helpers
├── types/                   # TypeScript type definitions
├── views/                   # Main view components
└── service-worker.ts        # Extension background script
```

### Data Flow
1. **Tab Capture**: Service worker captures tab information
2. **Storage**: Tab data stored in chrome.storage.local
3. **State Management**: React context manages application state
4. **UI Updates**: Components react to state changes
5. **Persistence**: Changes automatically sync to storage

### State Management
- **React Context**: Global state for tab data and settings
- **Chrome Storage**: Persistent storage for all data
- **Local State**: Component-specific state using useState
- **Real-time Sync**: Automatic synchronization between components

## Version Matrix
| Component | Version | Documentation Link | Notes |
|-----------|---------|-------------------|-------|
| Manifest | V3 | [Link](https://developer.chrome.com/docs/extensions/reference/manifest) | Required for new extensions |
| React | 18.x | [Link](https://react.dev/) | Latest stable version |
| TypeScript | 5.x | [Link](https://www.typescriptlang.org/) | Latest stable version |
| Tailwind CSS | 3.x | [Link](https://tailwindcss.com/) | Latest stable version |
| Chrome | Latest | [Platform Status](https://www.chromestatus.com/) | Monitor for API changes |

## Common Issues and Solutions

### Service Worker Lifecycle
- **Issue**: Service worker may become inactive
- **Solution**: Use chrome.runtime.onStartup and chrome.runtime.onInstalled
- **Prevention**: Implement proper event handling and state management

### Storage Limitations
- **Issue**: chrome.storage.local has size limits
- **Solution**: Implement data compression and cleanup strategies
- **Prevention**: Monitor storage usage and implement data archiving

### Permission Handling
- **Issue**: Users may revoke permissions
- **Solution**: Graceful degradation and permission request flows
- **Prevention**: Clear communication about required permissions

### Error Recovery
- **Issue**: Extension crashes or becomes unresponsive
- **Solution**: Implement error boundaries and automatic recovery
- **Prevention**: Comprehensive error handling and logging

## Best Practices

### Code Quality
- **TypeScript**: Use strict mode and proper typing
- **React**: Follow functional component patterns and hooks
- **Error Handling**: Implement comprehensive error boundaries
- **Testing**: Write unit tests for critical functionality

### Performance
- **Virtual Scrolling**: For large tab lists
- **Lazy Loading**: For tab thumbnails and metadata
- **Storage Optimization**: Efficient data structures and cleanup
- **Memory Management**: Proper cleanup of event listeners

### Security
- **Content Security Policy**: Proper CSP for MV3
- **Input Validation**: Validate all user inputs and data
- **Permission Minimization**: Request only necessary permissions
- **Data Sanitization**: Clean data before storage and display

### Accessibility
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Meet WCAG contrast requirements
- **Focus Management**: Proper focus handling and indicators

## Development Workflow

### Local Development
1. **Setup**: `npm install` to install dependencies
2. **Development**: `npm run dev` for hot reload development
3. **Building**: `npm run build` for production build
4. **Testing**: Load extension from `dist/` directory

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: Chrome API integration testing
- **Manual Testing**: Chrome extension functionality testing
- **Performance Testing**: Large dataset performance validation

### Deployment Process
1. **Build**: Create production build with `npm run build`
2. **Test**: Verify extension works in production build
3. **Package**: Prepare extension for Chrome Web Store
4. **Submit**: Upload to Chrome Web Store for review

## Troubleshooting Guide

### Extension Won't Load
1. Check manifest.json syntax
2. Verify service worker file exists
3. Check Chrome extension error logs
4. Verify all required files are present

### Build Errors
1. Check TypeScript compilation errors
2. Verify Vite configuration
3. Check dependency versions
4. Clear node_modules and reinstall

### Runtime Errors
1. Check browser console for errors
2. Verify Chrome API permissions
3. Check service worker lifecycle
4. Test in incognito mode

### Performance Issues
1. Monitor memory usage
2. Check storage usage
3. Verify component rendering performance
4. Implement performance optimizations 