// BlueFox Stats v0.1 - Main Content Script
// Injecté sur toutes les pages YouTube

(function () {
  'use strict';

  const PANEL_ID = 'bluefox-stats-panel';
  const TOGGLE_ID = 'bluefox-stats-toggle';
  let currentVideoId = null;
  let isInitialized = false;
  let retryCount = 0;
  const MAX_RETRIES = 30;

  // Initialize i18n
  BlueFoxI18n.init();

  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  function isVideoPage() {
    return window.location.pathname === '/watch' && getVideoId();
  }

  function createToggleButton() {
    if (document.getElementById(TOGGLE_ID)) return;

    const btn = document.createElement('div');
    btn.id = TOGGLE_ID;
    btn.className = 'bf-toggle-btn';
    btn.innerHTML = `
      <div class="bf-toggle-inner">
        <span class="bf-toggle-icon">🦊</span>
        <span class="bf-toggle-text">BlueFox Stats</span>
      </div>
    `;
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);
  }

  function togglePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.classList.toggle('bf-panel-hidden');
      const btn = document.getElementById(TOGGLE_ID);
      if (btn) btn.classList.toggle('bf-toggle-active');

      // Save state
      chrome.storage.local.set({
        panelVisible: !panel.classList.contains('bf-panel-hidden')
      });
    }
  }

  function createPanel() {
    // Remove existing panel
    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'bf-panel';

    // Header
    panel.innerHTML = `
      <div class="bf-panel-header">
        <div class="bf-header-left">
          <span class="bf-logo">🦊</span>
          <span class="bf-title">BlueFox Stats <span class="bf-version">v0.1</span></span>
        </div>
        <div class="bf-header-right">
          <select id="bf-lang-select" class="bf-lang-select">
            <option value="fr" ${BlueFoxI18n.getLanguage() === 'fr' ? 'selected' : ''}>🇫🇷 FR</option>
            <option value="en" ${BlueFoxI18n.getLanguage() === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
          </select>
          <button class="bf-minimize-btn" id="bf-minimize-btn">─</button>
          <button class="bf-close-btn" id="bf-close-btn">✕</button>
        </div>
      </div>
      <div class="bf-panel-body" id="bf-panel-body">
        <div class="bf-loading" id="bf-loading">
          <div class="bf-spinner"></div>
          <span>${BlueFoxI18n.t('loading')}</span>
        </div>
      </div>
    `;

    // Insert into YouTube's secondary column or body
    const secondary = document.querySelector('#secondary, #secondary-inner, ytd-watch-flexy #secondary');
    if (secondary) {
      secondary.prepend(panel);
    } else {
      document.body.appendChild(panel);
      panel.classList.add('bf-panel-floating');
    }

    // Event listeners
    setTimeout(() => {
      const closeBtn = document.getElementById('bf-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          panel.classList.add('bf-panel-hidden');
          const toggleBtn = document.getElementById(TOGGLE_ID);
          if (toggleBtn) toggleBtn.classList.remove('bf-toggle-active');
        });
      }

      const minimizeBtn = document.getElementById('bf-minimize-btn');
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
          panel.classList.toggle('bf-panel-minimized');
          minimizeBtn.textContent = panel.classList.contains('bf-panel-minimized') ? '□' : '─';
        });
      }

      const langSelect = document.getElementById('bf-lang-select');
      if (langSelect) {
        langSelect.addEventListener('change', (e) => {
          BlueFoxI18n.setLanguage(e.target.value);
          loadVideoData();
        });
      }
    }, 100);

    return panel;
  }

  async function loadVideoData() {
    const videoId = getVideoId();
    if (!videoId) return;

    const body = document.getElementById('bf-panel-body');
    if (!body) return;

    // Show loading
    body.innerHTML = `
      <div class="bf-loading" id="bf-loading">
        <div class="bf-spinner"></div>
        <span>${BlueFoxI18n.t('loading')}</span>
      </div>
    `;

    try {
      // Extract video data from page
      const videoData = await extractVideoData(videoId);

      // Get dislike data
      const dislikeData = await BlueFoxAPI.getDislikes(videoId);

      // Clear loading
      body.innerHTML = '';

      // Create navigation tabs
      renderTabs(body);

      // Create content container
      const content = document.createElement('div');
      content.id = 'bf-content';
      content.className = 'bf-content';
      body.appendChild(content);

      // Render all components
      BlueFoxVideoStats.render(content, videoData, dislikeData);
      BlueFoxViewsGraph.render(content, videoData);
      BlueFoxDislikeCounter.renderInline(videoData, dislikeData);
      BlueFoxThumbnailViewer.render(content, videoData);
      BlueFoxChannelStats.render(content, videoData);
      BlueFoxSEOAnalyzer.render(content, videoData);
      BlueFoxAIAssistant.render(content, videoData);

      // Show active tab
      showTab('stats');

    } catch (error) {
      console.error('BlueFox Stats Error:', error);
      body.innerHTML = `
        <div class="bf-error">
          <span class="bf-error-icon">⚠️</span>
          <span class="bf-error-text">${BlueFoxI18n.t('errorLoading')}</span>
          <button class="bf-btn bf-btn-retry" onclick="location.reload()">🔄 ${BlueFoxI18n.t('retry')}</button>
        </div>
      `;
    }
  }

  function renderTabs(container) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'bf-tabs';
    tabsDiv.innerHTML = `
      <button class="bf-tab bf-tab-active" data-tab="stats">📊 Stats</button>
      <button class="bf-tab" data-tab="graph">📈 ${t('viewsGraph')}</button>
      <button class="bf-tab" data-tab="thumbnails">🖼️ ${t('thumbnails')}</button>
      <button class="bf-tab" data-tab="channel">📺 ${t('channel')}</button>
      <button class="bf-tab" data-tab="seo">🔍 SEO</button>
      <button class="bf-tab" data-tab="ai">🤖 AI</button>
    `;
    container.appendChild(tabsDiv);

    tabsDiv.querySelectorAll('.bf-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsDiv.querySelectorAll('.bf-tab').forEach(t => t.classList.remove('bf-tab-active'));
        tab.classList.add('bf-tab-active');
        showTab(tab.getAttribute('data-tab'));
      });
    });
  }

  function showTab(tabName) {
    const sectionMap = {
      stats: '.bf-video-stats-section',
      graph: '.bf-graph-section',
      thumbnails: '.bf-thumbnail-section',
      channel: '.bf-channel-section',
      seo: '.bf-seo-section',
      ai: '.bf-ai-section'
    };

    document.querySelectorAll('.bf-section').forEach(section => {
      section.style.display = 'none';
    });

    const target = document.querySelector(sectionMap[tabName]);
    if (target) {
      target.style.display = 'block';
    }
  }

  async function extractVideoData(videoId) {
    const data = {
      videoId: videoId,
      title: '',
      views: 0,
      likes: 0,
      publishedDate: '',
      description: '',
      tags: [],
      channelName: '',
      channelUrl: '',
      subscriberCount: 0,
      commentCount: 0,
      category: '',
      duration: ''
    };

    // Try to extract from page elements
    await waitForElement('h1.ytd-watch-metadata yt-formatted-string, h1.title');

    // Title
    const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, h1.ytd-video-primary-info-renderer');
    if (titleEl) data.title = titleEl.textContent.trim();

    // Views
    const viewsEl = document.querySelector('span.view-count, ytd-video-view-count-renderer span, .ytd-video-primary-info-renderer .view-count');
    if (viewsEl) {
      const viewsText = viewsEl.textContent;
      data.views = BlueFoxHelpers.parseViewCount(viewsText);
    }

    // Likes
    const likesEl = document.querySelector('ytd-menu-renderer ytd-toggle-button-renderer:first-child yt-formatted-string, like-button-view-model button, #top-level-buttons-computed > segmented-like-dislike-button-view-model button:first-child');
    if (likesEl) {
      const likesText = likesEl.getAttribute('aria-label') || likesEl.textContent;
      data.likes = BlueFoxHelpers.parseViewCount(likesText);
    }

    // Channel name
    const channelEl = document.querySelector('#channel-name a, ytd-channel-name a, #owner #channel-name yt-formatted-string a');
    if (channelEl) {
      data.channelName = channelEl.textContent.trim();
      data.channelUrl = channelEl.href;
    }

    // Subscribers
    const subsEl = document.querySelector('#owner-sub-count, yt-formatted-string#owner-sub-count');
    if (subsEl) {
      data.subscriberCount = BlueFoxHelpers.parseViewCount(subsEl.textContent);
    }

    // Published date - from structured data
    const dateScript = document.querySelector('script[type="application/ld+json"]');
    if (dateScript) {
      try {
        const jsonData = JSON.parse(dateScript.textContent);
        if (jsonData.uploadDate) data.publishedDate = jsonData.uploadDate;
        if (jsonData.description) data.description = jsonData.description;
        if (jsonData.interactionStatistic) {
          jsonData.interactionStatistic.forEach(stat => {
            if (stat.interactionType && stat.interactionType['@type'] === 'WatchAction') {
              data.views = parseInt(stat.userInteractionCount) || data.views;
            }
          });
        }
      } catch (e) { /* ignore */ }
    }

    // Description from page
    if (!data.description) {
      const descEl = document.querySelector('ytd-text-inline-expander #attributed-snippet-text, #description-inline-expander, #description yt-formatted-string');
      if (descEl) data.description = descEl.textContent.trim();
    }

    // Tags from meta
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      data.tags = metaKeywords.content.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }

    // Published date from info strings
    if (!data.publishedDate) {
      const infoStrings = document.querySelectorAll('#info-strings yt-formatted-string, ytd-video-primary-info-renderer #info-text yt-formatted-string');
      infoStrings.forEach(el => {
        const text = el.textContent;
        if (text.match(/\d{1,2}\s\w+\s\d{4}/) || text.match(/\w+\s\d{1,2},\s\d{4}/)) {
          data.publishedDate = text.trim();
        }
      });
    }

    return data;
  }

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver((mutations, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  function init() {
    if (!isVideoPage()) {
      // Remove panel on non-video pages
      const panel = document.getElementById(PANEL_ID);
      if (panel) panel.remove();
      const toggle = document.getElementById(TOGGLE_ID);
      if (toggle) toggle.remove();
      currentVideoId = null;
      return;
    }

    const videoId = getVideoId();
    if (videoId === currentVideoId && isInitialized) return;

    currentVideoId = videoId;
    isInitialized = true;

    createToggleButton();
    createPanel();

    // Small delay to let YouTube finish rendering
    setTimeout(() => {
      loadVideoData();
    }, 1500);
  }

  // Watch for YouTube navigation (SPA)
  let lastUrl = location.href;

  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      isInitialized = false;
      retryCount = 0;

      setTimeout(() => {
        init();
      }, 1000);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Also listen for yt-navigate-finish
  window.addEventListener('yt-navigate-finish', () => {
    isInitialized = false;
    setTimeout(init, 1000);
  });

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 2000));
  } else {
    setTimeout(init, 2000);
  }

  console.log('🦊 BlueFox Stats v0.1 loaded!');
})();
