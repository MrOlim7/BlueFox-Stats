// ============================================
// BlueFox Stats v0.1 - Popup Script
// ============================================

(function() {
  'use strict';

  const translations = {
    fr: {
      views: 'Vues',
      likes: 'Likes',
      dislikes: 'Dislikes',
      comments: 'Commentaires',
      openPanel: 'Ouvrir le panneau',
      togglePanel: 'Afficher/Masquer',
      settings: '⚙️ Paramètres',
      autoShow: 'Affichage automatique',
      showDislikes: 'Afficher les dislikes',
      darkMode: 'Mode sombre',
      panelPosition: 'Position du panneau',
      sidebar: 'Barre latérale',
      floating: 'Flottant',
      statusActive: 'Extension active',
      statusActiveDetail: 'Page vidéo YouTube détectée',
      statusInactive: 'En attente',
      statusInactiveDetail: 'Naviguez vers une vidéo YouTube',
      statusChecking: 'Vérification...',
      statusCheckingDetail: 'Analyse de la page en cours',
      apiConfigured: 'Clé API configurée',
      apiNotConfigured: 'Non configurée',
      apiSaved: 'Clé API sauvegardée !',
      apiEmpty: 'Veuillez entrer une clé API',
      apiInvalid: 'Clé API invalide'
    },
    en: {
      views: 'Views',
      likes: 'Likes',
      dislikes: 'Dislikes',
      comments: 'Comments',
      openPanel: 'Open panel',
      togglePanel: 'Show/Hide',
      settings: '⚙️ Settings',
      autoShow: 'Auto display',
      showDislikes: 'Show dislikes',
      darkMode: 'Dark mode',
      panelPosition: 'Panel position',
      sidebar: 'Sidebar',
      floating: 'Floating',
      statusActive: 'Extension active',
      statusActiveDetail: 'YouTube video page detected',
      statusInactive: 'Waiting',
      statusInactiveDetail: 'Navigate to a YouTube video',
      statusChecking: 'Checking...',
      statusCheckingDetail: 'Analyzing current page',
      apiConfigured: 'API key configured',
      apiNotConfigured: 'Not configured',
      apiSaved: 'API key saved!',
      apiEmpty: 'Please enter an API key',
      apiInvalid: 'Invalid API key'
    }
  };

  let currentLang = 'fr';

  function t(key) {
    return translations[currentLang]?.[key] || translations['fr'][key] || key;
  }

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get([
      'bfLanguage', 'bfAutoShow', 'bfShowDislikes',
      'bfDarkMode', 'bfPanelPosition', 'bfApiKey'
    ], (data) => {
      currentLang = data.bfLanguage || 'fr';
      document.getElementById('popup-lang').value = currentLang;
      document.getElementById('setting-autoshow').checked = data.bfAutoShow !== false;
      document.getElementById('setting-dislikes').checked = data.bfShowDislikes !== false;
      document.getElementById('setting-darkmode').checked = data.bfDarkMode !== false;
      document.getElementById('setting-position').value = data.bfPanelPosition || 'sidebar';

      // API Key
      if (data.bfApiKey) {
        document.getElementById('api-key-input').value = data.bfApiKey;
        document.getElementById('api-dot').classList.add('active');
        document.getElementById('api-status-text').textContent = t('apiConfigured');
      } else {
        document.getElementById('api-dot').classList.remove('active');
        document.getElementById('api-status-text').textContent = t('apiNotConfigured');
      }

      updateTranslations();
      checkCurrentTab();
    });
  }

  // Save setting
  function saveSetting(key, value) {
    const data = {};
    data[key] = value;
    chrome.storage.sync.set(data);

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'BF_SETTING_CHANGED',
          key: key,
          value: value
        }).catch(() => {});
      }
    });
  }

  // Update translations
  function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang]?.[key]) {
        el.textContent = translations[currentLang][key];
      }
    });
  }

  // Check current tab
  function checkCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        setStatus('inactive');
        return;
      }

      const url = tab.url;
      if (url.includes('youtube.com/watch')) {
        setStatus('active');
        fetchQuickStats(tab.id);
      } else if (url.includes('youtube.com')) {
        setStatus('inactive');
        document.getElementById('status-detail').textContent =
          currentLang === 'fr' ? 'Vous êtes sur YouTube mais pas sur une vidéo' : 'You are on YouTube but not on a video';
      } else {
        setStatus('inactive');
      }
    });
  }

  // Set status display
  function setStatus(status) {
    const statusEl = document.getElementById('popup-status');
    const iconEl = document.getElementById('status-icon');
    const titleEl = document.getElementById('status-title');
    const detailEl = document.getElementById('status-detail');
    const actionsEl = document.querySelector('.popup-actions');

    statusEl.className = 'popup-status';

    switch (status) {
      case 'active':
        statusEl.classList.add('status-active');
        iconEl.textContent = '✅';
        titleEl.textContent = t('statusActive');
        detailEl.textContent = t('statusActiveDetail');
        document.getElementById('btn-open-panel').style.display = 'flex';
        document.getElementById('btn-toggle-panel').style.display = 'flex';
        break;

      case 'inactive':
        statusEl.classList.add('status-inactive');
        iconEl.textContent = '📺';
        titleEl.textContent = t('statusInactive');
        detailEl.textContent = t('statusInactiveDetail');
        document.getElementById('btn-open-panel').style.display = 'none';
        document.getElementById('btn-toggle-panel').style.display = 'none';
        document.getElementById('quick-stats').style.display = 'none';
        document.getElementById('video-title').style.display = 'none';
        break;

      default:
        iconEl.textContent = '⏳';
        titleEl.textContent = t('statusChecking');
        detailEl.textContent = t('statusCheckingDetail');
    }
  }

  // Fetch quick stats from content script
  function fetchQuickStats(tabId) {
    chrome.tabs.sendMessage(tabId, { type: 'BF_GET_QUICK_STATS' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded yet
        console.log('Content script not ready');
        return;
      }

      if (response && response.success) {
        const data = response.data;
        const statsEl = document.getElementById('quick-stats');
        const titleEl = document.getElementById('video-title');

        // Format numbers
        const fmt = (n) => {
          if (!n && n !== 0) return '-';
          n = parseInt(n);
          if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
          if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
          return n.toLocaleString();
        };

        document.getElementById('qs-views').textContent = fmt(data.views);
        document.getElementById('qs-likes').textContent = fmt(data.likes);
        document.getElementById('qs-dislikes').textContent = fmt(data.dislikes);
        document.getElementById('qs-comments').textContent = fmt(data.comments);

        if (data.title) {
          document.getElementById('video-title-text').textContent = data.title;
          titleEl.style.display = 'block';
        }

        statsEl.style.display = 'grid';
      }
    });
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    // Language change
    document.getElementById('popup-lang').addEventListener('change', (e) => {
      currentLang = e.target.value;
      saveSetting('bfLanguage', currentLang);
      updateTranslations();
      checkCurrentTab();
    });

    // Settings toggles
    document.getElementById('setting-autoshow').addEventListener('change', (e) => {
      saveSetting('bfAutoShow', e.target.checked);
    });

    document.getElementById('setting-dislikes').addEventListener('change', (e) => {
      saveSetting('bfShowDislikes', e.target.checked);
    });

    document.getElementById('setting-darkmode').addEventListener('change', (e) => {
      saveSetting('bfDarkMode', e.target.checked);
    });

    document.getElementById('setting-position').addEventListener('change', (e) => {
      saveSetting('bfPanelPosition', e.target.value);
    });

    // API Key save
    document.getElementById('btn-save-api').addEventListener('click', () => {
      const key = document.getElementById('api-key-input').value.trim();
      if (!key) {
        showApiMessage(t('apiEmpty'), false);
        return;
      }

      // Basic validation (YouTube API keys are typically 39 chars)
      if (key.length < 20) {
        showApiMessage(t('apiInvalid'), false);
        return;
      }

      saveSetting('bfApiKey', key);
      document.getElementById('api-dot').classList.add('active');
      showApiMessage(t('apiSaved'), true);
    });

    // Toggle API key visibility
    let apiVisible = false;
    document.getElementById('btn-toggle-api').addEventListener('click', () => {
      const input = document.getElementById('api-key-input');
      apiVisible = !apiVisible;
      input.type = apiVisible ? 'text' : 'password';
      document.getElementById('btn-toggle-api').textContent = apiVisible ? '🔒' : '👁️';
    });

    // Open panel button
    document.getElementById('btn-open-panel').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'BF_SHOW_PANEL' });
          window.close();
        }
      });
    });

    // Toggle panel button
    document.getElementById('btn-toggle-panel').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'BF_TOGGLE_PANEL' });
          window.close();
        }
      });
    });
  });

  function showApiMessage(msg, success) {
    const statusText = document.getElementById('api-status-text');
    statusText.textContent = msg;
    statusText.style.color = success ? '#22c55e' : '#ef4444';

    setTimeout(() => {
      statusText.style.color = '';
      chrome.storage.sync.get(['bfApiKey'], (data) => {
        statusText.textContent = data.bfApiKey ? t('apiConfigured') : t('apiNotConfigured');
      });
    }, 3000);
  }

})();
