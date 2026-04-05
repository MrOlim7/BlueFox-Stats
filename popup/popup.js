// ============================================
// BlueFox Stats v0.1 - Popup Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const statusIcon = document.getElementById('status-icon');
  const statusTitle = document.getElementById('status-title');
  const statusDetail = document.getElementById('status-detail');
  const statusEl = document.getElementById('popup-status');
  const quickStats = document.getElementById('quick-stats');
  const videoTitle = document.getElementById('video-title');
  const videoTitleText = document.getElementById('video-title-text');
  const langSelect = document.getElementById('popup-lang');
  const apiKeyInput = document.getElementById('api-key-input');
  const autoShowToggle = document.getElementById('auto-show-toggle');
  const dislikesToggle = document.getElementById('dislikes-toggle');
  const saveBtn = document.getElementById('popup-save-btn');

  let currentLang = 'fr';

  // Load saved settings
  chrome.storage.sync.get([
    'bfLanguage', 'bfApiKey', 'bfAutoShow', 'bfShowDislikes'
  ], (data) => {
    currentLang = data.bfLanguage || 'fr';
    langSelect.value = currentLang;

    if (apiKeyInput && data.bfApiKey) {
      apiKeyInput.value = data.bfApiKey;
    }
    if (autoShowToggle) {
      autoShowToggle.checked = data.bfAutoShow !== false;
    }
    if (dislikesToggle) {
      dislikesToggle.checked = data.bfShowDislikes !== false;
    }
  });

  // Check current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      setStatus('inactive', '⚠️',
        currentLang === 'fr' ? 'Pas sur YouTube' : 'Not on YouTube',
        currentLang === 'fr' ? 'Naviguez vers YouTube pour utiliser BlueFox' : 'Navigate to YouTube to use BlueFox'
      );
      return;
    }

    if (!tab.url.includes('youtube.com/watch')) {
      setStatus('inactive', '📺',
        currentLang === 'fr' ? 'Pas sur une vidéo' : 'Not on a video',
        currentLang === 'fr' ? 'Ouvrez une vidéo pour voir les stats' : 'Open a video to see stats'
      );
      return;
    }

    // On video page - get data from content script
    chrome.tabs.sendMessage(tab.id, { type: 'BF_GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setStatus('active', '🦊',
          currentLang === 'fr' ? 'BlueFox actif' : 'BlueFox active',
          currentLang === 'fr' ? 'Rechargez la page si le panneau n\'apparaît pas' : 'Reload page if panel doesn\'t appear'
        );
        return;
      }

      setStatus('active', '✅',
        currentLang === 'fr' ? 'Analyse en cours' : 'Analyzing',
        response.videoId ? `ID: ${response.videoId}` : ''
      );

      // Show scraped data
      if (response.scrapedData) {
        const data = response.scrapedData;

        quickStats.style.display = 'grid';
        videoTitle.style.display = 'block';

        if (data.title) videoTitleText.textContent = data.title;
        if (data.views) document.getElementById('qs-views').textContent = formatNum(data.views);
        if (data.likes) document.getElementById('qs-likes').textContent = formatNum(data.likes);
      }
    });
  });

  // Status helper
  function setStatus(type, icon, title, detail) {
    statusEl.className = `popup-status ${type}`;
    statusIcon.textContent = icon;
    statusTitle.textContent = title;
    statusDetail.textContent = detail;
  }

  // Format number
  function formatNum(num) {
    num = parseInt(num);
    if (isNaN(num)) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  // Language change
  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value;
    chrome.storage.sync.set({ bfLanguage: currentLang });
  });

  // Save settings
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const settings = {
        bfLanguage: langSelect.value,
        bfApiKey: apiKeyInput ? apiKeyInput.value.trim() : '',
        bfAutoShow: autoShowToggle ? autoShowToggle.checked : true,
        bfShowDislikes: dislikesToggle ? dislikesToggle.checked : true
      };

      chrome.storage.sync.set(settings, () => {
        saveBtn.textContent = currentLang === 'fr' ? '✅ Sauvegardé !' : '✅ Saved!';
        saveBtn.classList.add('saved');

        // Notify content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'BF_SETTINGS_CHANGED' });
          }
        });

        setTimeout(() => {
          saveBtn.textContent = currentLang === 'fr' ? 'Sauvegarder' : 'Save';
          saveBtn.classList.remove('saved');
        }, 2000);
      });
    });
  }
});
