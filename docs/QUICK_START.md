# TabsAGO Quick Start Guide

## 🚀 Ready to Start Development

This guide will get you from zero to a working Chrome extension in the shortest time possible.

## Immediate Next Steps (Phase 1)

### Step 1: Initialize Project (DEV-001)
```bash
# Navigate to project root
cd /Users/xavstack/Documents/CODE/TabsAGO

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install --save-dev vite @crxjs/vite-plugin typescript @types/chrome
npm install --save-dev @types/node tailwindcss postcss autoprefixer
npm install --save-dev @types/react @types/react-dom
npm install react react-dom
```

### Step 2: Create Basic Project Structure
```bash
# Create source directories
mkdir -p src/{components,hooks,utils,types,views}
mkdir -p src/components/{TabManager,ViewModes,Settings,Common}
mkdir -p public
mkdir -p dist
```

### Step 3: Essential Configuration Files

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './public/manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'src/views/index.html'
      }
    }
  }
})
```

#### `public/manifest.json`
```json
{
  "manifest_version": 3,
  "name": "TabsAGO",
  "version": "0.1.0",
  "description": "Organize multiple Chrome tabs into one manageable interface",
  "action": {
    "default_title": "TabsAGO"
  },
  "background": {
    "service_worker": "src/service-worker.ts",
    "type": "module"
  },
  "permissions": [
    "storage",
    "tabs"
  ],
  "icons": {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Create Service Worker (DEV-003)
```typescript
// src/service-worker.ts
chrome.runtime.onInstalled.addListener(() => {
  console.log('TabsAGO extension installed');
  
  // Create the pinned tab on install
  chrome.tabs.create({
    url: chrome.runtime.getURL('views/index.html'),
    pinned: true,
    active: false
  });
});

// Handle tab creation requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CREATE_TAB') {
    chrome.tabs.create({
      url: message.url,
      pinned: false,
      active: true
    });
  }
});
```

### Step 5: Create Basic UI (DEV-004)
```typescript
// src/views/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TabsAGO</title>
    <script type="module" src="./main.tsx"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

```typescript
// src/views/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```typescript
// src/views/App.tsx
import React from 'react'
import TabManager from '../components/TabManager/TabManager'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          TabsAGO
        </h1>
        <TabManager />
      </div>
    </div>
  )
}

export default App
```

```css
/* src/views/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 6: Create Basic Tab Manager Component
```typescript
// src/components/TabManager/TabManager.tsx
import React, { useState, useEffect } from 'react'
import { Tab } from '../../types/Tab'

const TabManager: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load tabs from storage
    chrome.storage.local.get(['tabs'], (result) => {
      setTabs(result.tabs || [])
      setLoading(false)
    })
  }, [])

  const captureCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id && tab.url) {
        const newTab: Tab = {
          id: Date.now().toString(),
          title: tab.title || 'Untitled',
          url: tab.url,
          favicon: tab.favIconUrl || '',
          capturedAt: new Date().toISOString(),
          domain: new URL(tab.url).hostname
        }
        
        const updatedTabs = [...tabs, newTab]
        setTabs(updatedTabs)
        
        // Save to storage
        chrome.storage.local.set({ tabs: updatedTabs })
      }
    } catch (error) {
      console.error('Error capturing tab:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Grabbed Tabs ({tabs.length})
        </h2>
        <button
          onClick={captureCurrentTab}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Grab Current Tab
        </button>
      </div>
      
      {tabs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tabs grabbed yet. Click "Grab Current Tab" to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <img
                src={tab.favicon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>'}
                alt=""
                className="w-4 h-4"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tab.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {tab.domain}
                </p>
              </div>
              <button
                onClick={() => {
                  const updatedTabs = tabs.filter(t => t.id !== tab.id)
                  setTabs(updatedTabs)
                  chrome.storage.local.set({ tabs: updatedTabs })
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TabManager
```

### Step 7: Create Type Definitions
```typescript
// src/types/Tab.ts
export interface Tab {
  id: string
  title: string
  url: string
  favicon: string
  capturedAt: string
  domain: string
}

export interface TabGroup {
  id: string
  name: string
  tabs: Tab[]
  color?: string
}
```

### Step 8: Test the Extension
```bash
# Build the extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

## 🎯 What You'll Have After These Steps

✅ **Working Chrome Extension** that loads without errors  
✅ **Pinned Tab** that opens automatically on install  
✅ **Basic Tab Grabbing** functionality  
✅ **Tab Storage** in chrome.storage.local  
✅ **Simple List View** of captured tabs  
✅ **Remove Tab** functionality  
✅ **Responsive Design** with Tailwind CSS  

## 🚧 Next Steps After Quick Start

1. **Test the extension** - Make sure it loads and creates the pinned tab
2. **Grab some tabs** - Test the tab grabbing functionality
3. **Update PROJECT_TRACKING.md** - Mark DEV-001 through DEV-004 as complete
4. **Move to Phase 2** - Begin implementing advanced tab management features
5. Use scripts: `npm run type-check && npm run lint && npm run test && npm run build`

## 🔧 Troubleshooting

### Extension Won't Load
- Check that `dist/` folder contains all files
- Verify `manifest.json` is in the root of `dist/`
- Check Chrome extension error logs

### Build Errors
- Ensure all dependencies are installed
- Check TypeScript configuration
- Verify file paths in imports

### Tab Grabbing Not Working
- Check browser console for errors
- Verify `tabs` permission is granted
- Test with a simple webpage first

## 📚 Resources

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/reference/manifest/)
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [@crxjs/vite-plugin Documentation](https://crxjs.dev/)

---

**Ready to start coding? Begin with Step 1 and you'll have a working extension in under 30 minutes!** 🚀
