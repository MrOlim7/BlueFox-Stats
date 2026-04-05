// ============================================
// BlueFox Stats v0.2 - Content Script
// ============================================

(function () {
  'use strict';

  const PANEL_ID = 'bluefox-stats-panel';
  let currentVideoId = null;
  let settings = {};
  let lang = 'fr';

  // Load settings
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'bfLanguage', 'bfAutoShow', 'bfShowDislikes', 'bfDarkMode',
        'bfPanelPosition', 'bfTheme', 'bfApiKey'
      ], (data) => {
        settings = data;
        lang = data.bfLanguage || 'fr';
        resolve(data);
      });
    });
  }

  // Extract video ID from URL
  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  // Create or get panel
  function getPanel() {
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
    }
    
    // Always ensure it's a sibling or floating
    try {
      if (panel.parentElement && panel.parentElement.id === PANEL_ID) {
        // Already in correct place
      } else {
        // Remove from current location if exists
        if (panel.parentElement) {
          panel.remove();
        }
        
        if (settings.bfPanelPosition === 'floating') {
          panel.className = 'bf-panel-floating';
          document.body.appendChild(panel);
        } else {
          // Try secondary bar
          const secondary = document.querySelector('#secondary, ytd-watch-flexy #secondary, ytd-primary-info-renderer');
          if (secondary && !secondary.contains(panel)) {
            secondary.insertBefore(panel, secondary.firstChild);
          } else {
            // Fallback to floating
            panel.className = 'bf-panel-floating';
            if (!panel.parentElement) {
              document.body.appendChild(panel);
            }
          }
        }
      }
    } catch (err) {
      console.error('🦊 Panel placement error:', err);
      panel.className = 'bf-panel-floating';
      if (!panel.parentElement) {
        document.body.appendChild(panel);
      }
    }
    
    // Hide if setting is false
    if (settings.bfAutoShow === false) {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'block';
    }
    
    return panel;
  }

  // Format number
  function formatNum(num) {
    if (!num) return '-';
    num = parseInt(num);
    if (isNaN(num)) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Format duration (ISO 8601)
  function formatDuration(duration) {
    if (!duration) return '-';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;
    
    const hours = (match[1] || '0H').slice(0, -1);
    const minutes = (match[2] || '0M').slice(0, -1);
    const seconds = (match[3] || '0S').slice(0, -1);
    
    if (hours > 0) return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }

  // Render panel
  function renderPanel(panel, videoData, dislikeData) {
    const t = (fr, en) => lang === 'fr' ? fr : en;
    
    // Get stats
    const stats = videoData?.statistics || {};
    const snippet = videoData?.snippet || {};
    const contentDetails = videoData?.contentDetails || {};
    
    const views = parseInt(stats.viewCount) || 0;
    const likes = parseInt(stats.likeCount) || 0;
    const comments = parseInt(stats.commentCount) || 0;
    const dislikes = dislikeData?.dislikes || 0;
    const duration = contentDetails.duration || '-';
    const publishDate = snippet.publishedAt || '-';
    const title = snippet.title || 'Vidéo YouTube';
    
    const likeRatio = likes + dislikes > 0 ? Math.round((likes / (likes + dislikes)) * 100) : 0;
    
    panel.innerHTML = `
      <div class="bf-panel-header">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="font-size: 24px;">🦊</span>
          <div>
            <div style="font-weight: 700; font-size: 14px;">BlueFox Stats</div>
            <div style="font-size: 10px; opacity: 0.6;">v0.2</div>
          </div>
        </div>
        <button class="bf-close-btn" style="border: none; background: none; color: #e2e8f0; cursor: pointer; font-size: 18px;">✕</button>
      </div>
      
      <div class="bf-panel-content">
        <div class="bf-panel-title">${title}</div>
        
        <div class="bf-stats-grid">
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">👁️</div>
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${formatNum(views)}</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Vues', 'Views')}</div>
          </div>
          
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">👍</div>
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${formatNum(likes)}</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Likes', 'Likes')}</div>
          </div>
          
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">👎</div>
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${formatNum(dislikes)}</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Dislikes', 'Dislikes')}</div>
          </div>
          
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">💬</div>
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${formatNum(comments)}</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Commentaires', 'Comments')}</div>
          </div>
          
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">⏱️</div>
            <div style="font-size: 16px; font-weight: 700; color: #3b82f6;">${formatDuration(duration)}</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Durée', 'Duration')}</div>
          </div>
          
          <div class="bf-stat-card">
            <div style="font-size: 18px; margin-bottom: 4px;">📅</div>
            <div style="font-size: 14px; font-weight: 700; color: #3b82f6;">${likeRatio}%</div>
            <div style="font-size: 10px; color: #94a3b8;">${t('Like ratio', 'Like ratio')}</div>
          </div>
        </div>
        
        <div class="bf-like-bar-section">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
            <span>👍 ${likeRatio}%</span>
            <span>${formatNum(likes + dislikes)} ${t('votes', 'votes')}</span>
          </div>
          <div style="width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden;">
            <div style="width: ${likeRatio}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6);"></div>
          </div>
        </div>
        
        <div class="bf-info-box">
          <div style="font-size: 12px; color: #94a3b8;">
            <strong>${t('Identifiant:', 'ID:')}</strong> ${currentVideoId}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            ${t('Données chargées via BlueFox Stats v0.2', 'Data loaded via BlueFox Stats v0.2')}
          </div>
        </div>
      </div>
    `;
    
    // Close button
    panel.querySelector('.bf-close-btn').addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  // Show loading state
  function showLoading(panel) {
    const t = (fr, en) => lang === 'fr' ? fr : en;
    panel.innerHTML = `
      <div class="bf-panel-header">
        <span style="font-size: 24px;">🦊</span>
        <div style="flex: 1; margin-left: 8px;">
          <div style="font-weight: 700; font-size: 14px;">BlueFox Stats</div>
          <div style="font-size: 10px; color: #94a3b8;">⏳ ${t('Chargement...', 'Loading...')}</div>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; color: #94a3b8;">
        <div style="font-size: 28px; animation: spin 1s linear infinite; margin-bottom: 12px;">⏳</div>
        <div style="font-size: 12px; line-height: 1.6;">
          ${t('Récupération des statistiques vidéo...', 'Fetching video statistics...')}
        </div>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    panel.style.display = 'block';
  }

  // Main initialization
  async function init() {
    const videoId = getVideoId();
    
    if (!videoId) {
      console.log('🦊 No video ID');
      return;
    }
    if (videoId === currentVideoId) return;
    
    currentVideoId = videoId;
    console.log('🦊 Init for video:', videoId);
    
    await loadSettings();
    
    const panel = getPanel();
    showLoading(panel);
    
    try {
      let videoData = null;
      let dislikeData = null;
      
      // Fetch with API if configured
      if (settings.bfApiKey && settings.bfApiKey.length > 10) {
        console.log('🦊 Calling background for video details...');
        videoData = await getVideoDetails(videoId);
        console.log('🦊 Got video data:', !!videoData);
      }
      
      // Always try dislikes
      console.log('🦊 Fetching dislikes...');
      dislikeData = await getDislikes(videoId);
      console.log('🦊 Got dislikes:', !!dislikeData);
      
      // If no data at all
      if (!videoData && !settings.bfApiKey) {
        panel.innerHTML = `
          <div class="bf-panel-header" style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 26px;">🦊</span>
            <div style="flex: 1;">
              <div style="font-weight: 700; color: #e2e8f0;">BlueFox Stats v0.2</div>
              <div style="font-size: 10px; color: #94a3b8;">📋 Configuration requise</div>
            </div>
          </div>
          <div style="padding: 16px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
            <strong style="color: #e2e8f0;">BlueFox Stats est installé ! 🎉</strong>
            <div style="margin-top: 12px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border-left: 3px solid #3b82f6;">
              Configurez votre clé API YouTube pour débloquer les statistiques détaillées.
            </div>
            <div style="margin-top: 12px;">
              👉 Cliquez sur 🦊 → Onglet <strong style="color: #e2e8f0;">API</strong> → Suivez les étapes
            </div>
          </div>
        `;
        return;
      }
      
      if (videoData || dislikeData) {
        renderPanel(panel, videoData, dislikeData);
      } else {
        throw new Error('Impossible de charger les données');
      }
      
    } catch (error) {
      console.error('🦊 Error:', error);
      panel.innerHTML = `
        <div class="bf-panel-header" style="background: rgba(30, 41, 59, 0.8); border-bottom: 1px solid rgba(59, 130, 246, 0.3); padding: 12px 16px; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 26px;">🦊</span>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: #e2e8f0;">BlueFox Stats v0.2</div>
            <div style="font-size: 10px; color: #ef4444;">❌ Erreur</div>
          </div>
        </div>
        <div class="bf-panel-content" style="color: #ef4444; font-size: 12px; padding: 16px;">
          ${error.message}
          <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">Vérifiez votre clé API ou rechargez la page.</div>
        </div>
      `;
    }
  }

  // Get video details via message passing
  function getVideoDetails(videoId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'BF_GET_VIDEO_DETAILS',
        videoId: videoId
      }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response?.data || null);
      });
    });
  }

  // Get dislikes from RYD API
  function getDislikes(videoId) {
    return new Promise((resolve) => {
      fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`)
        .then(r => r.json())
        .then(data => resolve(data))
        .catch(() => resolve(null));
    });
  }

  // Setup message handler
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BF_SETTINGS_CHANGED') {
      currentVideoId = null;
      setTimeout(init, 500);
    }
  });

  // Wait for YouTube to load
  function waitForYouTube() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Initialize on load
  waitForYouTube();

  // Re-init on URL change (YouTube SPA)
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl && location.href.includes('watch?v=')) {
      lastUrl = location.href;
      currentVideoId = null;
      init();
    }
  }, 1000);
})();
