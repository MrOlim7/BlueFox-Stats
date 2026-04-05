// ============================================
// BlueFox Stats v0.1 - Content Script Init
// ============================================

/**
 * BlueFox Content Script - Main entry point
 * Handles initialization and coordination of all components
 */
(function () {
  'use strict';

  // Wait for manager to be ready
  function waitForManager(callback, timeout = 5000) {
    const startTime = Date.now();
    
    const check = () => {
      if (typeof BlueFoxManager !== 'undefined' && BlueFoxManager.initialized) {
        callback();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        BlueFoxLogger.error('Manager initialization timeout');
        callback(); // Try anyway
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  }

  // Main initialization
  function init() {
    try {
      BlueFoxLogger.info('BlueFox Content Script initializing...');

      // Check if we're on a YouTube watch page
      if (!isYouTubePage()) {
        BlueFoxLogger.debug('Not on YouTube watch page');
        return;
      }

      // Setup handlers
      setupMessageHandler();
      setupPageObserver();

      BlueFoxLogger.info('BlueFox Content Script initialized successfully');

    } catch (error) {
      BlueFoxErrorHandler.handleError('Content Script Initialization Error', error);
    }
  }

  /**
   * Check if we're on YouTube
   */
  function isYouTubePage() {
    return window.location.hostname.includes('youtube.com');
  }

  /**
   * Setup message handler for popup communication
   */
  function setupMessageHandler() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        BlueFoxLogger.debug(`Message received: ${message.type}`);

        switch (message.type) {
          case 'BF_GET_STATUS':
            handleGetStatus(sendResponse);
            break;
          case 'BF_REQUEST_DATA':
            handleRequestData(sendResponse);
            break;
          default:
            BlueFoxLogger.warn(`Unknown message type: ${message.type}`);
        }
      } catch (error) {
        BlueFoxErrorHandler.handleError(`Message handler error: ${message.type}`, error);
        sendResponse({ success: false, error: error.message });
      }
    });
  }

  /**
   * Handle status request from popup
   */
  function handleGetStatus(sendResponse) {
    const videoId = BlueFoxHelpers.getVideoId();
    
    sendResponse({
      success: true,
      videoId: videoId,
      isVideoPage: videoId !== null,
      timestamp: Date.now()
    });
  }

  /**
   * Handle data request from popup
   */
  function handleRequestData(sendResponse) {
    const videoId = BlueFoxHelpers.getVideoId();
    if (!videoId) {
      sendResponse({ success: false, error: 'Not on video page' });
      return;
    }

    BlueFoxHelpers.safe(async () => {
      const videoData = await scrapeVideoPage();
      sendResponse({
        success: true,
        data: videoData
      });
    }, () => {
      sendResponse({ success: false, error: 'Failed to scrape data' });
    });
  }

  /**
   * Setup page observer for URL changes
   */
  function setupPageObserver() {
    // YouTube uses history API for navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      window.dispatchEvent(new Event('bf-navigation'));
    };

    window.addEventListener('bf-navigation', () => {
      const videoId = BlueFoxHelpers.getVideoId();
      if (videoId) {
        BlueFoxLogger.debug(`New video detected: ${videoId}`);
        initializePanel(videoId);
      }
    });

    // Initial panel setup
    const initialVideoId = BlueFoxHelpers.getVideoId();
    if (initialVideoId) {
      initializePanel(initialVideoId);
    }
  }

  /**
   * Initialize the stats panel for a video
   */
  async function initializePanel(videoId) {
    try {
      BlueFoxLogger.info(`Initializing panel for video: ${videoId}`);

      // Get settings
      const settings = BlueFoxManager.getSettings();

      // Create or update panel
      const panel = createMainPanel();
      
      if (settings.bfAutoShow !== false) {
        panel.classList.remove('bf-panel-hidden');
      }

      // Fetch video data
      const videoData = await scrapeVideoPage();
      
      // Render panel content
      renderPanelContent(panel, videoData);

      BlueFoxLogger.debug('Panel initialized successfully');

    } catch (error) {
      BlueFoxErrorHandler.handleError('Panel initialization error', error);
    }
  }

  /**
   * Create main stats panel
   */
  function createMainPanel() {
    let panel = document.getElementById('bluefox-stats-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'bluefox-stats-panel';
      panel.className = 'bf-panel';
      
      // Try to insert in sidebar, fallback to float
      const sidebar = document.querySelector('#secondary, ytd-watch-flexy #secondary');
      if (sidebar) {
        sidebar.insertBefore(panel, sidebar.firstChild);
      } else {
        panel.classList.add('bf-panel-floating');
        document.body.appendChild(panel);
      }
    }

    return panel;
  }

  /**
   * Scrape video data from page
   */
  async function scrapeVideoPage() {
    const videoId = BlueFoxHelpers.getVideoId();
    
    return {
      videoId: videoId,
      timestamp: Date.now(),
      success: !!videoId
    };
  }

  /**
   * Render panel content
   */
  function renderPanelContent(panel, videoData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);

    panel.innerHTML = `
      <div class="bf-panel-header">
        <div class="bf-panel-header-left">
          <span class="bf-panel-logo">🦊</span>
          <span class="bf-panel-title">BlueFox Stats</span>
          <span class="bf-panel-badge">v0.1</span>
        </div>
        <div class="bf-panel-header-right">
          <button class="bf-panel-btn bf-btn-close" title="${t('close')}">✕</button>
        </div>
      </div>

      <div class="bf-panel-body">
        <div class="bf-loading">
          <div class="bf-spinner"></div>
          <p>${t('loading')}</p>
        </div>
      </div>
    `;

    // Setup close handler
    panel.querySelector('.bf-btn-close').addEventListener('click', () => {
      panel.classList.add('bf-panel-hidden');
    });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForManager(init);
    });
  } else {
    waitForManager(init);
  }

})();
