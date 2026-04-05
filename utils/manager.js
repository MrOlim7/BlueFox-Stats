// ============================================
// BlueFox Stats v0.1 - Module Manager
// ============================================

const BlueFoxManager = {
  modules: {},
  initialized: false,
  settings: {},

  /**
   * Register a module
   */
  registerModule(name, module) {
    if (!module || typeof module !== 'object') {
      BlueFoxLogger.warn(`Invalid module: ${name}`);
      return false;
    }

    this.modules[name] = {
      name: name,
      instance: module,
      initialized: false,
      error: null
    };

    BlueFoxLogger.debug(`Module registered: ${name}`);
    return true;
  },

  /**
   * Get a module instance
   */
  getModule(name) {
    if (!this.modules[name]) {
      BlueFoxLogger.warn(`Module not found: ${name}`);
      return null;
    }
    return this.modules[name].instance;
  },

  /**
   * Initialize all modules
   */
  async init() {
    if (this.initialized) {
      BlueFoxLogger.debug('Manager already initialized');
      return true;
    }

    try {
      BlueFoxLogger.info('Initializing BlueFox Manager...');

      // Load settings
      await this.loadSettings();

      // Initialize i18n
      if (typeof BlueFoxI18n !== 'undefined' && BlueFoxI18n.init) {
        await BlueFoxI18n.init();
      }

      // Register core modules
      this.registerModule('logger', BlueFoxLogger);
      this.registerModule('cache', BlueFoxCache);
      this.registerModule('errorHandler', BlueFoxErrorHandler);
      this.registerModule('i18n', BlueFoxI18n);

      this.initialized = true;
      BlueFoxLogger.info('BlueFox Manager initialized successfully');
      return true;

    } catch (error) {
      BlueFoxLogger.error('Failed to initialize manager', error);
      return false;
    }
  },

  /**
   * Load settings from storage
   */
  async loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(null, (data) => {
          this.settings = data || {};
          BlueFoxLogger.debug(`Settings loaded: ${Object.keys(this.settings).length} items`);
          resolve(this.settings);
        });
      } catch (error) {
        BlueFoxLogger.error('Failed to load settings', error);
        resolve({});
      }
    });
  },

  /**
   * Get a setting
   */
  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  },

  /**
   * Update a setting
   */
  async updateSetting(key, value) {
    try {
      const data = {};
      data[key] = value;
      
      return new Promise((resolve) => {
        chrome.storage.sync.set(data, () => {
          this.settings[key] = value;
          BlueFoxLogger.debug(`Setting updated: ${key}`);
          resolve(true);
        });
      });
    } catch (error) {
      BlueFoxLogger.error(`Failed to update setting ${key}`, error);
      return false;
    }
  },

  /**
   * Get all settings
   */
  getSettings() {
    return { ...this.settings };
  },

  /**
   * Get module statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      modulesCount: Object.keys(this.modules).length,
      modules: Object.values(this.modules).map(m => ({
        name: m.name,
        initialized: m.initialized,
        hasError: m.error !== null
      })),
      settings: Object.keys(this.settings).length,
      cacheStats: typeof BlueFoxCache !== 'undefined' ? BlueFoxCache.getStats() : null
    };
  },

  /**
   * Clear all cache and temp data
   */
  clearAllCache() {
    try {
      if (typeof BlueFoxCache !== 'undefined') {
        BlueFoxCache.clear();
      }
      BlueFoxLogger.info('All cache cleared');
      return true;
    } catch (error) {
      BlueFoxLogger.error('Failed to clear cache', error);
      return false;
    }
  },

  /**
   * Export all logs
   */
  exportLogs() {
    if (typeof BlueFoxLogger === 'undefined') {
      return null;
    }
    return BlueFoxLogger.exportLogs();
  },

  /**
   * Unload all modules
   */
  unload() {
    this.modules = {};
    this.initialized = false;
    BlueFoxLogger.info('BlueFox Manager unloaded');
  }
};

// Auto-initialize if on document ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      BlueFoxManager.init();
    });
  } else {
    BlueFoxManager.init();
  }
}

if (typeof window !== 'undefined') {
  window.BlueFoxManager = BlueFoxManager;
}
