// ============================================
// BlueFox Stats v0.2 - Popup Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
});

const PopupManager = {
  // DOM Elements
  elements: {
    // Status
    statusIcon: document.getElementById('status-icon'),
    statusTitle: document.getElementById('status-title'),
    statusDetail: document.getElementById('status-detail'),
    statusEl: document.getElementById('popup-status'),
    
    // Quick Stats
    quickStats: document.getElementById('quick-stats'),
    qsViews: document.getElementById('qs-views'),
    qsLikes: document.getElementById('qs-likes'),
    qsDislikes: document.getElementById('qs-dislikes'),
    qsComments: document.getElementById('qs-comments'),
    
    // Video Title
    videoTitle: document.getElementById('video-title'),
    videoTitleText: document.getElementById('video-title-text'),
    
    // Buttons
    btnOpenPanel: document.getElementById('btn-open-panel'),
    btnTogglePanel: document.getElementById('btn-toggle-panel'),
    btnRate: document.getElementById('btn-rate'),
    btnSupport: document.getElementById('btn-support'),
    
    // Language
    langSelect: document.getElementById('lang-select'),
    
    // Settings Tab
    settingAutoshow: document.getElementById('setting-autoshow'),
    settingDislikes: document.getElementById('setting-dislikes'),
    settingDarkmode: document.getElementById('setting-darkmode'),
    settingPosition: document.getElementById('setting-position'),
    settingTheme: document.getElementById('setting-theme'),
    settingNotifications: document.getElementById('setting-notifications'),
    
    // Advanced Tab
    settingGraph: document.getElementById('setting-graph'),
    settingSeo: document.getElementById('setting-seo'),
    settingAi: document.getElementById('setting-ai'),
    settingCacheTtl: document.getElementById('setting-cache-ttl'),
    btnResetSettings: document.getElementById('btn-reset-settings'),
    btnClearCache: document.getElementById('btn-clear-cache'),
    
    // API Tab
    apiKeyInput: document.getElementById('api-key-input'),
    btnSaveApi: document.getElementById('btn-save-api'),
    btnDeleteApi: document.getElementById('btn-delete-api'),
    btnToggleApiVisibility: document.getElementById('btn-toggle-api-visibility'),
    apiStatus: document.getElementById('api-status'),
    apiDot: document.getElementById('api-dot'),
    apiStatusText: document.getElementById('api-status-text'),
    
    // Tabs
    tabs: document.querySelectorAll('.popup-tab'),
    tabContents: document.querySelectorAll('.popup-tab-content')
  },

  currentLang: 'fr',
  showApiKey: false,

  // Initialize
  init() {
    this.loadSettings();
    this.attachEventListeners();
    this.checkYouTubePage();
    this.updateApiStatus();
  },

  // Load settings from storage
  loadSettings() {
    const settings = [
      'bfLanguage', 'bfAutoShow', 'bfShowDislikes', 'bfDarkMode',
      'bfPanelPosition', 'bfTheme', 'bfNotifications', 'bfGraph',
      'bfSeo', 'bfAi', 'bfCacheTtl', 'bfApiKey'
    ];

    chrome.storage.sync.get(settings, (data) => {
      this.currentLang = data.bfLanguage || 'fr';
      this.elements.langSelect.value = this.currentLang;

      // Settings Tab
      if (this.elements.settingAutoshow) this.elements.settingAutoshow.checked = data.bfAutoShow !== false;
      if (this.elements.settingDislikes) this.elements.settingDislikes.checked = data.bfShowDislikes !== false;
      if (this.elements.settingDarkmode) this.elements.settingDarkmode.checked = data.bfDarkMode !== false;
      if (this.elements.settingPosition) this.elements.settingPosition.value = data.bfPanelPosition || 'sidebar';
      if (this.elements.settingTheme) this.elements.settingTheme.value = data.bfTheme || 'auto';
      if (this.elements.settingNotifications) this.elements.settingNotifications.checked = data.bfNotifications !== false;

      // Advanced Tab
      if (this.elements.settingGraph) this.elements.settingGraph.checked = data.bfGraph !== false;
      if (this.elements.settingSeo) this.elements.settingSeo.checked = data.bfSeo !== false;
      if (this.elements.settingAi) this.elements.settingAi.checked = data.bfAi !== false;
      if (this.elements.settingCacheTtl) this.elements.settingCacheTtl.value = data.bfCacheTtl || 15;

      // API
      if (this.elements.apiKeyInput && data.bfApiKey) {
        this.elements.apiKeyInput.value = data.bfApiKey;
      }
    });
  },

  // Attach event listeners
  attachEventListeners() {
    // Tab switching
    this.elements.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e));
    });

    // Language change
    this.elements.langSelect.addEventListener('change', () => {
      this.currentLang = this.elements.langSelect.value;
      chrome.storage.sync.set({ bfLanguage: this.currentLang });
    });

    // Settings auto-save
    document.querySelectorAll('input[type="checkbox"], select.popup-select').forEach(el => {
      el.addEventListener('change', () => this.autoSaveSettings());
    });

    // API Key visibility toggle
    if (this.elements.btnToggleApiVisibility) {
      this.elements.btnToggleApiVisibility.addEventListener('click', () => {
        this.showApiKey = !this.showApiKey;
        const inputType = this.showApiKey ? 'text' : 'password';
        this.elements.apiKeyInput.type = inputType;
        this.elements.btnToggleApiVisibility.textContent = this.showApiKey ? '🙈' : '👁️';
      });
    }

    // Save API Key
    if (this.elements.btnSaveApi) {
      this.elements.btnSaveApi.addEventListener('click', () => this.saveApiKey());
    }

    // Delete API Key
    if (this.elements.btnDeleteApi) {
      this.elements.btnDeleteApi.addEventListener('click', () => this.deleteApiKey());
    }

    // Reset Settings
    if (this.elements.btnResetSettings) {
      this.elements.btnResetSettings.addEventListener('click', () => this.resetSettings());
    }

    // Clear Cache
    if (this.elements.btnClearCache) {
      this.elements.btnClearCache.addEventListener('click', () => this.clearCache());
    }

    // Panel buttons
    if (this.elements.btnOpenPanel) {
      this.elements.btnOpenPanel.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'BF_SHOW_PANEL' });
          }
        });
      });
    }

    if (this.elements.btnTogglePanel) {
      this.elements.btnTogglePanel.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'BF_TOGGLE_PANEL' });
          }
        });
      });
    }

    // Footer links
    if (this.elements.btnRate) {
      this.elements.btnRate.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/bluefox-stats' });
      });
    }

    if (this.elements.btnSupport) {
      this.elements.btnSupport.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'https://github.com/MrOlim/BlueFox-Stats' });
      });
    }
  },

  // Switch tabs
  switchTab(e) {
    const tabName = e.target.getAttribute('data-tab');
    
    this.elements.tabs.forEach(tab => tab.classList.remove('active'));
    this.elements.tabContents.forEach(content => content.classList.remove('active'));
    
    e.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  },

  // Auto-save settings
  autoSaveSettings() {
    const settings = {
      bfAutoShow: this.elements.settingAutoshow?.checked ?? true,
      bfShowDislikes: this.elements.settingDislikes?.checked ?? true,
      bfDarkMode: this.elements.settingDarkmode?.checked ?? true,
      bfPanelPosition: this.elements.settingPosition?.value || 'sidebar',
      bfTheme: this.elements.settingTheme?.value || 'auto',
      bfNotifications: this.elements.settingNotifications?.checked ?? true,
      bfGraph: this.elements.settingGraph?.checked ?? true,
      bfSeo: this.elements.settingSeo?.checked ?? true,
      bfAi: this.elements.settingAi?.checked ?? true,
      bfCacheTtl: this.elements.settingCacheTtl?.value || 15,
      bfLanguage: this.currentLang
    };

    chrome.storage.sync.set(settings, () => {
      // Notify content script of changes
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'BF_SETTINGS_CHANGED',
            settings: settings
          }).catch(() => { /* Content script might not be loaded */ });
        }
      });
    });
  },

  // Save API Key
  async saveApiKey() {
    const apiKey = this.elements.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showApiError('Veuillez entrer une clé API');
      return;
    }

    // Validate API key format (basic check)
    if (apiKey.length < 10) {
      this.showApiError('La clé API semble invalide');
      return;
    }

    chrome.storage.sync.set({ bfApiKey: apiKey }, () => {
      this.showApiSuccess('✅ Clé API sauvegardée avec succès !');
      this.updateApiStatus();

      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'BF_API_KEY_UPDATED',
            apiKey: apiKey
          }).catch(() => { });
        }
      });
    });
  },

  // Delete API Key
  deleteApiKey() {
    if (confirm('Êtes-vous sûr de vouloir supprimer la clé API ?')) {
      this.elements.apiKeyInput.value = '';
      chrome.storage.sync.remove(['bfApiKey'], () => {
        this.showApiSuccess('🗑️ Clé API supprimée');
        this.updateApiStatus();
      });
    }
  },

  // Update API status
  updateApiStatus() {
    chrome.storage.sync.get(['bfApiKey'], (data) => {
      if (data.bfApiKey && data.bfApiKey.length > 10) {
        this.elements.apiDot.classList.add('success');
        this.elements.apiStatusText.textContent = '✅ Configurée';
      } else {
        this.elements.apiDot.classList.remove('success');
        this.elements.apiStatusText.textContent = '❌ Non configurée';
      }
    });
  },

  // Show API success message
  showApiSuccess(message) {
    const originalText = this.elements.apiStatusText.textContent;
    this.elements.apiStatusText.textContent = message;
    setTimeout(() => {
      this.elements.apiStatusText.textContent = originalText;
    }, 3000);
  },

  // Show API error message
  showApiError(message) {
    const originalText = this.elements.apiStatusText.textContent;
    this.elements.apiStatusText.textContent = '❌ ' + message;
    setTimeout(() => {
      this.elements.apiStatusText.textContent = originalText;
    }, 3000);
  },

  // Reset all settings
  resetSettings() {
    if (confirm('Voulez-vous réinitialiser TOUS les paramètres à leurs valeurs par défaut ?')) {
      const defaultSettings = {
        bfLanguage: 'fr',
        bfAutoShow: true,
        bfShowDislikes: true,
        bfDarkMode: true,
        bfPanelPosition: 'sidebar',
        bfTheme: 'auto',
        bfNotifications: true,
        bfGraph: true,
        bfSeo: true,
        bfAi: true,
        bfCacheTtl: 15
      };

      chrome.storage.sync.set(defaultSettings, () => {
        alert('✅ Paramètres réinitialisés. Rechargez la page.');
        this.loadSettings();
      });
    }
  },

  // Clear cache
  clearCache() {
    if (confirm('Voulez-vous vider le cache ?')) {
      chrome.runtime.sendMessage({ type: 'BF_CLEAR_CACHE' }, (response) => {
        if (response?.success) {
          alert('✅ Cache vidé avec succès');
        }
      });
    }
  },

  // Check if on YouTube page
  checkYouTubePage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!tab || !tab.url) {
        this.setStatus('inactive', '⚠️', 'Erreur', 'Impossible de vérifier la page');
        return;
      }

      if (!tab.url.includes('youtube.com')) {
        this.setStatus('inactive', '⚠️',
          'Pas sur YouTube',
          'Naviguez vers YouTube pour utiliser BlueFox'
        );
        return;
      }

      if (!tab.url.includes('youtube.com/watch')) {
        this.setStatus('inactive', '📺',
          'Pas sur une vidéo',
          'Ouvrez une vidéo pour voir les statistiques'
        );
        return;
      }

      // On video page - get data from content script
      chrome.tabs.sendMessage(tab.id, { type: 'BF_GET_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          this.setStatus('active', '🦊', 'BlueFox actif',
            'Rechargez la page si le panneau n\'apparaît pas'
          );
          return;
        }

        if (!response) {
          this.setStatus('active', '🦊', 'BlueFox actif',
            'Attendez le chargement des données'
          );
          return;
        }

        this.setStatus('active', '✅', 'Analyse en cours',
          response.videoId ? `ID: ${response.videoId.substring(0, 8)}...` : 'En cours d\'analyse'
        );

        // Show scraped data
        if (response.scrapedData) {
          this.displayVideoStats(response.scrapedData);
        }
      });
    });
  },

  // Display video stats
  displayVideoStats(data) {
    if (!data || Object.keys(data).length === 0) return;

    this.elements.quickStats.style.display = 'grid';
    
    if (data.title) {
      this.elements.videoTitle.style.display = 'block';
      this.elements.videoTitleText.textContent = data.title;
    }

    if (data.views) this.elements.qsViews.textContent = this.formatNum(data.views);
    if (data.likes) this.elements.qsLikes.textContent = this.formatNum(data.likes);
    if (data.dislikes) this.elements.qsDislikes.textContent = this.formatNum(data.dislikes);
    if (data.comments) this.elements.qsComments.textContent = this.formatNum(data.comments);
  },

  // Set status
  setStatus(type, icon, title, detail) {
    this.elements.statusEl.className = `popup-status ${type}`;
    this.elements.statusIcon.textContent = icon;
    this.elements.statusTitle.textContent = title;
    this.elements.statusDetail.textContent = detail;
  },

  // Format number
  formatNum(num) {
    num = parseInt(num);
    if (isNaN(num)) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }
};

// Initialize popup
function initializePopup() {
  PopupManager.init();
}
