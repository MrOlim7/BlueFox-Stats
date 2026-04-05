# 👨‍💻 DEVELOPMENT - BlueFox Stats

Guide complet pour les développeurs et contributeurs.

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/MrOlim/BlueFox-Stats.git

# 2. Install extension in Chrome
# chrome://extensions -> Load unpacked -> select BlueFox-Stats folder

# 3. Start developing
# Make changes -> reload extension (chrome://extensions)

# 4. Debug in console (F12 > Console)
BlueFoxLogger.setLevel(BlueFoxLogger.DEBUG);
BlueFoxLogger.getLogs();
```

## 📁 Project Structure

```
BlueFox-Stats/
├── utils/              # Core modules (shared)
│   ├── logger.js       # Logging system
│   ├── cache.js        # Cache manager
│   ├── errorHandler.js # Global error handling
│   ├── helpers.js      # Utility functions
│   ├── api.js          # YouTube API wrapper
│   ├── i18n.js         # Internationalization
│   └── manager.js      # Module orchestration
│
├── components/         # Feature components
├── content/            # Content scripts
├── popup/              # Popup UI
├── background/         # Service worker
├── styles/             # CSS
├── _locales/           # Translations
│
└── manifest.json       # Extension config
```

## 🔧 Core Modules API

### BlueFoxLogger

```javascript
// Set logging level
BlueFoxLogger.setLevel(BlueFoxLogger.DEBUG);  // DEBUG, INFO, WARN, ERROR

// Log messages
BlueFoxLogger.debug('Debug message', { data: 'optional' });
BlueFoxLogger.info('Info message');
BlueFoxLogger.warn('Warning message');
BlueFoxLogger.error('Error message', error);

// Get logs
BlueFoxLogger.getLogs();              // All logs
BlueFoxLogger.getLogs('ERROR');       // Filter by level
BlueFoxLogger.clearLogs();
BlueFoxLogger.exportLogs();           // JSON export
```

### BlueFoxCache

```javascript
// Store data (default 15min TTL)
BlueFoxCache.set('key', value);
BlueFoxCache.set('key', value, 30);  // 30 minutes

// Retrieve data
BlueFoxCache.get('key');              // Returns null if expired/missing
BlueFoxCache.has('key');              // Boolean check

// Manage cache
BlueFoxCache.remove('key');
BlueFoxCache.clear();                 // Clear all
BlueFoxCache.getStats();              // Get stats
```

### BlueFoxErrorHandler

```javascript
// Handle errors
BlueFoxErrorHandler.handleError('Operation failed', error);

// Safe wrapper (sync)
BlueFoxErrorHandler.safe(() => {
  // Risky code
}, fallbackValue);

// Safe wrapper (async)
await BlueFoxErrorHandler.safeAsync(async () => {
  // Async risky code
});
```

### BlueFoxManager

```javascript
// Initialize
await BlueFoxManager.init();

// Get module
const logger = BlueFoxManager.getModule('logger');

// Settings
BlueFoxManager.getSetting('bfLanguage');
await BlueFoxManager.updateSetting('bfLanguage', 'en');
BlueFoxManager.getSettings();         // All settings

// Info
BlueFoxManager.getStats();            // System stats

// Maintenance
BlueFoxManager.clearAllCache();
BlueFoxManager.exportLogs();
```

### BlueFoxI18n

```javascript
// Translate
BlueFoxI18n.t('viewsPerDay');

// Change language
BlueFoxI18n.setLanguage('en');
BlueFoxI18n.getLanguage();

// Check translation
BlueFoxI18n.has('keyName');
BlueFoxI18n.getAll();                 // Get all translations

// Available languages
BlueFoxI18n.getAvailableLanguages();
```

## 🛠️ Common Tasks

### Adding a new translation

1. Edit `utils/i18n.js`
2. Add key-value pair to both `fr` and `en` objects:

```javascript
const translations = {
  fr: {
    myNewKey: "Nouvelle clé",
    ...
  },
  en: {
    myNewKey: "New key",
    ...
  }
};
```

3. Use in code:
```javascript
const text = BlueFoxI18n.t('myNewKey');
```

### Creating a new component

1. Create `components/myComponent.js`:
```javascript
const BlueFoxMyComponent = {
  async init() {
    BlueFoxLogger.info('MyComponent initialized');
  },
  
  render(container, data) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    container.innerHTML = `<div>${t('myNewKey')}</div>`;
  }
};
```

2. Register in `utils/manager.js`:
```javascript
BlueFoxManager.registerModule('myComponent', BlueFoxMyComponent);
```

3. Use in content script:
```javascript
const component = BlueFoxManager.getModule('myComponent');
await component.render(containerEl, data);
```

### Adding a new utility function

1. Add to `utils/helpers.js`:
```javascript
const BFHelpers = {
  myNewFunction(param) {
    BlueFoxLogger.debug('myNewFunction called', { param });
    return result;
  }
};
```

2. Use globally:
```javascript
BFHelpers.myNewFunction(value);
```

### Making an API call

1. In `utils/api.js`, add method:
```javascript
async getMyData(id) {
  const cached = BlueFoxCache.get(`myData_${id}`);
  if (cached) return cached;
  
  try {
    const data = await this.youtubeRequest('endpoint', {
      part: 'fields',
      id: id
    });
    
    BlueFoxCache.set(`myData_${id}`, data, 15);
    return data;
  } catch (error) {
    BlueFoxLogger.error('getMyData failed', error);
    return null;
  }
}
```

2. Use in components:
```javascript
const data = await BFApi.getMyData(videoId);
```

## 🧪 Testing & Debugging

### Enable debug mode

```javascript
// In console
BlueFoxLogger.setLevel(BlueFoxLogger.DEBUG);

// See all activities
BlueFoxLogger.getLogs();

// Monitor cache
BlueFoxCache.getStats();

// System info
BlueFoxManager.getStats();
```

### Test scenarios

```javascript
// Test error handling
throw new Error('Test error');

// Test cache
BlueFoxCache.set('test', 'data', 1); // 1 minute TTL
// Wait 1+ minute
BlueFoxCache.get('test'); // Should return null

// Test API
BFApi.youtubeRequest('videos', { part: 'snippet', id: 'dQw4w9WgXcQ' })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Check extension errors

1. Open `chrome://extensions/`
2. Find BlueFox Stats
3. Click "details"
4. Scroll to "Errors" section

Or check popup errors:
1. Right-click extension icon
2. "Inspect popup"
3. Console tab

## 📋 Code Standards

### Naming Conventions

- Classes/Objects: `BlueFoxModuleName` (e.g., `BlueFoxLogger`)
- Functions: `camelCase` (e.g., `calculateEngagement`)
- Constants: `SNAKE_CASE` (e.g., `PANEL_ID`)
- Private: `_privateMethod`

### Comments

```javascript
/**
 * Brief description
 * @param {Type} name - Description
 * @returns {Type} Description
 */
function myFunction(name) {
  // Implementation
}
```

### Error Handling

```javascript
// Always wrap async operations
try {
  const result = await someAsyncOperation();
} catch (error) {
  BlueFoxLogger.error('Operation failed', error);
  // Handle gracefully
}
```

### Logging

```javascript
// Use appropriate levels
BlueFoxLogger.debug('Low-level info');      // Development only
BlueFoxLogger.info('Important events');     // Use for key milestones
BlueFoxLogger.warn('Unexpected but handled'); // Warnings
BlueFoxLogger.error('Unrecoverable errors');  // Errors
```

## 🔐 Security Checklist

- [ ] No hardcoded secrets
- [ ] All user input validated
- [ ] XSS protection (use `textContent` not `innerHTML` when possible)
- [ ] CSP compatible code
- [ ] Error messages don't leak sensitive info
- [ ] API keys in storage, not code

## 📦 Building & Releasing

### Before release

```javascript
// Disable debug mode
BlueFoxLogger.setLevel(BlueFoxLogger.WARN);

// Verify no console.log statements
grep -r "console.log" . --include="*.js"

// Test all features
// - Video page
// - Popup
// - Settings
// - API calls
// - Cache

// Increment version
// - manifest.json
// - package.json (if exists)
// - CHANGELOG.md
```

### Create release

1. Tag commit: `git tag v0.1.1`
2. Push: `git push origin v0.1.1`
3. Create GitHub Release with:
   - Version number
   - Changelog
   - Known issues
   - Installation instructions

## 🐛 Common Issues

### Extension not loaded

```javascript
// Check console
BlueFoxLogger.getLogs();

// Check manifest
// Verify all paths correct

// Try reload in chrome://extensions/
```

### API calls failing

```javascript
// Check API key
BlueFoxManager.getSetting('bfApiKey');

// Check quotas
// https://console.developers.google.com

// Check logs
BlueFoxLogger.getLogs('ERROR');
```

### Cache not working

```javascript
// Check size limit
BlueFoxCache.getStats();

// Manual clear
BlueFoxCache.clear();

// Verify TTL
BlueFoxCache.set('test', 'data');
setTimeout(() => {
  console.log(BlueFoxCache.get('test')); // Should be null
}, 16 * 60 * 1000);
```

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [YouTube API Docs](https://developers.google.com/youtube/v3)
- [Return YouTube Dislike API](https://returnyoutubedislikeapi.com/)

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Create Pull Request

## 📞 Support

For development questions:
- Check existing issues
- Review code comments
- Check CHANGELOG for recent changes
- See README.md for architecture

---

**Last Updated:** 05 April 2024
**Maintainer:** BlueFox Team
