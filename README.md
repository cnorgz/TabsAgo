# TabsAGO Chrome Extension

A Chrome extension to enhance the Chrome Reading List user experience by displaying it in a pinned tab with improved viewing and organizational options.

## Features (Planned for v1.0)

- Display Chrome Reading List data in a pinned tab
- Dual view options: List View and Tabs View
- Organize items by day groups (Today, Yesterday, etc.)
- Light/dark theme options
- Auto-refresh of Reading List data
- Basic settings page
- Error logging and debugging features

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Project Structure

```
tabsago/
├── manifest.json
├── service-worker.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
├── settings/
│   ├── settings.html
│   ├── settings.css
│   ├── settings.js
├── views/
│   ├── listView.js
│   ├── tabsView.js
│   ├── views.css
├── css/
│   ├── styles.css
├── js/
│   ├── utils.js
│   ├── storage.js
│   ├── readinglist.js
├── assets/
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
├── debug/
│   ├── debug.html
├── _locales/
│   └── en/messages.json
```

## Development Guidelines

- Follow Chrome Extension MV3 best practices
- Implement robust error handling
- Use clear and descriptive commit messages
- Document code changes and new features
- Test thoroughly before submitting changes

## Permissions Used

- `readingList`: Access to Chrome Reading List API
- `storage`: For saving user settings and caching data
- `tabs`: Required for creating and managing the pinned tab

## Author

Xavier Stack

## License

MIT License 