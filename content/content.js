// ============================================
// BlueFox Stats v0.1 - Main Content Script
// ============================================

(function () {
  'use strict';

  const PANEL_ID = 'bluefox-stats-panel';
  const TOGGLE_ID = 'bluefox-toggle-btn';

  let currentVideoId = null;
  let isInitialized = false;
  let settings = {};
  let lang = 'fr';

  // Load settings
  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([
        'bfLanguage', 'bfAutoShow', 'bfShowDislikes',
        'bfDarkMode', 'bfPanelPosition', 'bfApiKey'
      ], (data) => {
        settings = data;
        lang = data.bfLanguage || 'fr';
        resolve(data);
      });
    });
  }

  // Create toggle button
  function createToggleButton() {
    let btn = document.getElementById(TOGGLE_ID);
    if (btn) return btn;

    btn = document.createElement('div');
    btn.id = TOGGLE_ID;
    btn.className = 'bf-toggle-btn';
    btn.innerHTML = '🦊';
    btn.title = 'BlueFox Stats';

    btn.addEventListener('click', () => {
      const panel = document.getElementById(PANEL_ID);
      if (panel) {
        panel.classList.toggle('bf-panel-hidden');
        btn.classList.toggle('bf-toggle-active');
      }
    });

    document.body.appendChild(btn);
    return btn;
  }

  // Create main panel
  function createPanel() {
    let panel = document.getElementById(PANEL_ID);
    if (panel) {
      panel.innerHTML = '';
    } else {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
    }

    // Determine position
    if (settings.bfPanelPosition === 'floating') {
      panel.className = 'bf-panel-floating';
      document.body.appendChild(panel);
    } else {
      panel.className = '';
      // Insert in YouTube sidebar
      const sidebar = document.querySelector('#secondary, #secondary-inner, ytd-watch-flexy #secondary');
      if (sidebar) {
        sidebar.insertBefore(panel, sidebar.firstChild);
      } else {
        panel.className = 'bf-panel-floating';
        document.body.appendChild(panel);
      }
    }

    // Auto-show setting
    if (settings.bfAutoShow === false) {
      panel.classList.add('bf-panel-hidden');
    }

    return panel;
  }

  // Build panel content
  function buildPanelContent(panel, videoData, channelData, dislikeData) {
    const t = (fr, en) => lang === 'fr' ? fr : en;

    // Header
    const header = document.createElement('div');
    header.className = 'bf-panel-header';
    header.innerHTML = `
      <div class="bf-panel-header-left">
        <span class="bf-panel-logo">🦊</span>
        <span class="bf-panel-title">BlueFox Stats</span>
        <span class="bf-panel-badge">v0.1</span>
      </div>
      <div class="bf-panel-header-right">
        <button class="bf-panel-btn bf-btn-minimize" title="${t('Réduire', 'Minimize')}">—</button>
        <button class="bf-panel-btn bf-btn-close" title="${t('Fermer', 'Close')}">✕</button>
      </div>
    `;
    panel.appendChild(header);

    // Minimize handler
    header.querySelector('.bf-btn-minimize').addEventListener('click', () => {
      panel.classList.toggle('bf-panel-minimized');
    });

    // Close handler
    header.querySelector('.bf-btn-close').addEventListener('click', () => {
      panel.classList.add('bf-panel-hidden');
      const btn = document.getElementById(TOGGLE_ID);
      if (btn) btn.classList.remove('bf-toggle-active');
    });

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'bf-tabs';
    tabs.innerHTML = `
      <button class="bf-tab bf-tab-active" data-tab="stats">📊 Stats</button>
      <button class="bf-tab" data-tab="thumbnails">🖼️ ${t('Miniatures', 'Thumbnails')}</button>
      <button class="bf-tab" data-tab="channel">📺 ${t('Chaîne', 'Channel')}</button>
      <button class="bf-tab" data-tab="seo">🔍 SEO</button>
      <button class="bf-tab" data-tab="ai">🤖 IA</button>
    `;
    panel.appendChild(tabs);

    // Tab body
    const body = document.createElement('div');
    body.className = 'bf-panel-body';
    panel.appendChild(body);

    // Tab switching
    tabs.querySelectorAll('.bf-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.bf-tab').forEach(t => t.classList.remove('bf-tab-active'));
        tab.classList.add('bf-tab-active');
        renderTab(body, tab.dataset.tab, videoData, channelData, dislikeData);
      });
    });

    // Render default tab
    renderTab(body, 'stats', videoData, channelData, dislikeData);
  }

  // Render tab content
  function renderTab(container, tabName, videoData, channelData, dislikeData) {
    container.innerHTML = '<div class="bf-loading"><div class="bf-spinner"></div></div>';

    switch (tabName) {
      case 'stats':
        renderStatsTab(container, videoData, dislikeData);
        break;
      case 'thumbnails':
        renderThumbnailsTab(container);
        break;
      case 'channel':
        renderChannelTab(container, channelData);
        break;
      case 'seo':
        renderSeoTab(container, videoData);
        break;
      case 'ai':
        renderAiTab(container, videoData, channelData);
        break;
    }
  }

  // ===== STATS TAB =====
  function renderStatsTab(container, videoData, dislikeData) {
    const stats = videoData?.statistics || {};
    const snippet = videoData?.snippet || {};
    const contentDetails = videoData?.contentDetails || {};

    const views = parseInt(stats.viewCount) || 0;
    const likes = parseInt(stats.likeCount) || 0;
    const comments = parseInt(stats.commentCount) || 0;
    const dislikes = dislikeData?.dislikes || 0;
    const publishDate = snippet.publishedAt;
    const duration = contentDetails.duration;

    const engagement = BFHelpers.calcEngagementRate(likes, dislikes, comments, views);
    const likeRatio = BFHelpers.calcLikeRatio(likes, dislikes);
    const viewsPerDay = BFHelpers.calcViewsPerDay(views, publishDate);
    const revenue = BFHelpers.estimateRevenue(views);

    const t = (fr, en) => lang === 'fr' ? fr : en;

    container.innerHTML = `
      <div class="bf-stats-section">
        <!-- Main Stats Grid -->
        <div class="bf-stats-grid">
          <div class="bf-stat-card">
            <div class="bf-stat-icon">👁️</div>
            <div class="bf-stat-value">${BFHelpers.formatNumber(views)}</div>
            <div class="bf-stat-label">${t('Vues', 'Views')}</div>
            <div class="bf-stat-detail">${BFHelpers.formatFullNumber(views)}</div>
          </div>
          <div class="bf-stat-card">
            <div class="bf-stat-icon">👍</div>
            <div class="bf-stat-value">${BFHelpers.formatNumber(likes)}</div>
            <div class="bf-stat-label">${t('Likes', 'Likes')}</div>
          </div>
          <div class="bf-stat-card bf-stat-dislike">
            <div class="bf-stat-icon">👎</div>
            <div class="bf-stat-value">${BFHelpers.formatNumber(dislikes)}</div>
            <div class="bf-stat-label">${t('Dislikes', 'Dislikes')}</div>
          </div>
          <div class="bf-stat-card">
            <div class="bf-stat-icon">💬</div>
            <div class="bf-stat-value">${BFHelpers.formatNumber(comments)}</div>
            <div class="bf-stat-label">${t('Commentaires', 'Comments')}</div>
          </div>
          <div class="bf-stat-card">
            <div class="bf-stat-icon">⏱️</div>
            <div class="bf-stat-value">${BFHelpers.formatDuration(duration)}</div>
            <div class="bf-stat-label">${t('Durée', 'Duration')}</div>
          </div>
          <div class="bf-stat-card">
            <div class="bf-stat-icon">📅</div>
            <div class="bf-stat-value">${publishDate ? BFHelpers.formatRelativeDate(publishDate, lang) : '-'}</div>
            <div class="bf-stat-label">${t('Publication', 'Published')}</div>
          </div>
        </div>

        <!-- Like/Dislike Bar -->
        <div class="bf-like-bar-section">
          <div class="bf-like-bar-header">
            <span>👍 ${likeRatio}%</span>
            <span>${BFHelpers.formatNumber(likes + dislikes)} ${t('votes', 'votes')}</span>
          </div>
          <div class="bf-like-bar">
            <div class="bf-like-bar-fill" style="width: ${likeRatio}%"></div>
          </div>
        </div>

        <!-- Advanced Metrics -->
        <div class="bf-advanced-stats">
          <div class="bf-adv-stat">
            <span class="bf-adv-label">📈 ${t('Engagement', 'Engagement')}</span>
            <span class="bf-adv-value">${engagement}%</span>
          </div>
          <div class="bf-adv-stat">
            <span class="bf-adv-label">📊 ${t('Vues/jour', 'Views/day')}</span>
            <span class="bf-adv-value">${BFHelpers.formatNumber(viewsPerDay)}</span>
          </div>
          <div class="bf-adv-stat">
            <span class="bf-adv-label">💰 ${t('Revenus estimés', 'Est. Revenue')}</span>
            <span class="bf-adv-value">$${revenue.low} - $${revenue.high}</span>
          </div>
          <div class="bf-adv-stat">
            <span class="bf-adv-label">📅 ${t('Date exacte', 'Exact date')}</span>
            <span class="bf-adv-value">${publishDate ? BFHelpers.formatDate(publishDate, lang) : '-'}</span>
          </div>
        </div>

        <!-- Views Graph Placeholder -->
        <div class="bf-graph-section">
          <div class="bf-section-title">📈 ${t('Évolution des vues', 'Views Evolution')}</div>
          <div class="bf-graph-container" id="bf-views-graph">
            <canvas id="bf-views-canvas" width="380" height="180"></canvas>
          </div>
          <div class="bf-graph-info">
            <div class="bf-graph-info-item">
              <span class="bf-graph-dot" style="background:#3b82f6"></span>
              <span>${t('Vues estimées', 'Estimated views')}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Draw simple views graph
    setTimeout(() => drawViewsGraph(views, publishDate), 100);
  }

  // Simple canvas graph for views estimation
  function drawViewsGraph(totalViews, publishDate) {
    const canvas = document.getElementById('bf-views-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 30;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Generate estimated data points (simulated growth curve)
    const daysOld = Math.max(1, Math.floor((Date.now() - new Date(publishDate).getTime()) / 86400000));
    const points = Math.min(daysOld, 30);
    const data = [];

    for (let i = 0; i <= points; i++) {
      // Logarithmic growth simulation
      const progress = i / points;
      const views = Math.floor(totalViews * (1 - Math.exp(-3 * progress)));
      data.push(views);
    }

    const maxVal = Math.max(...data, 1);
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    data.forEach((val, i) => {
      const x = padding + (graphWidth / Math.max(data.length - 1, 1)) * i;
      const y = padding + graphHeight - (val / maxVal) * graphHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill gradient under line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(BFHelpers.formatNumber(maxVal), padding, padding - 5);
    ctx.fillText('0', padding, height - padding + 15);
    ctx.textAlign = 'right';
    ctx.fillText(points + 'j', width - padding, height - padding + 15);
  }

  // ===== THUMBNAILS TAB =====
  function renderThumbnailsTab(container) {
    const videoId = BFHelpers.getVideoId();
    const thumbs = BFApi.getThumbnailUrls(videoId);
    const t = (fr, en) => lang === 'fr' ? fr : en;

    container.innerHTML = `
      <div class="bf-thumbnails-section">
        <div class="bf-section-title">🖼️ ${t('Toutes les miniatures', 'All Thumbnails')}</div>
        <p class="bf-section-desc">${t(
          'YouTube génère automatiquement plusieurs miniatures. Les créateurs peuvent aussi en uploader une custom.',
          'YouTube auto-generates multiple thumbnails. Creators can also upload a custom one.'
        )}</p>
        <div class="bf-thumbnail-grid">
          ${Object.entries(thumbs).map(([key, url]) => `
            <div class="bf-thumbnail-item">
              <img src="${url}" alt="${key}" loading="lazy" 
                   onerror="this.parentElement.style.display='none'"
                   class="bf-thumbnail-img">
              <div class="bf-thumbnail-overlay">
                <span class="bf-thumbnail-label">${key}</span>
                <div class="bf-thumbnail-actions">
                  <a href="${url}" target="_blank" class="bf-thumb-btn" title="${t('Ouvrir', 'Open')}">🔗</a>
                  <button class="bf-thumb-btn bf-thumb-download" data-url="${url}" data-name="${videoId}_${key}" title="${t('Télécharger', 'Download')}">💾</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Download handlers
    container.querySelectorAll('.bf-thumb-download').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        const name = btn.dataset.name;
        const a = document.createElement('a');
        a.href = url;
        a.download = name + '.jpg';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    });
  }

  // ===== CHANNEL TAB =====
  function renderChannelTab(container, channelData) {
    if (!channelData) {
      container.innerHTML = `
        <div class="bf-empty-state">
          <span class="bf-empty-state-icon">📺</span>
          <p>${lang === 'fr' ? 'Données de chaîne non disponibles. Configurez votre clé API.' : 'Channel data unavailable. Configure your API key.'}</p>
        </div>`;
      return;
    }

    const stats = channelData.statistics || {};
    const snippet = channelData.snippet || {};
    const t = (fr, en) => lang === 'fr' ? fr : en;

    container.innerHTML = `
      <div class="bf-channel-section">
        <div class="bf-channel-header">
          <img src="${snippet.thumbnails?.medium?.url || ''}" class="bf-channel-avatar" alt="">
          <div class="bf-channel-info">
            <div class="bf-channel-name">${snippet.title || '-'}</div>
            <div class="bf-channel-handle">${snippet.customUrl || ''}</div>
            <div class="bf-channel-created">${t('Créée le', 'Created')} ${BFHelpers.formatDate(snippet.publishedAt, lang)}</div>
          </div>
        </div>

        <div class="bf-channel-metrics">
          <div class="bf-metric-card">
            <div class="bf-metric-icon">👥</div>
            <div class="bf-metric-value">${BFHelpers.formatNumber(stats.subscriberCount)}</div>
            <div class="bf-metric-label">${t('Abonnés', 'Subscribers')}</div>
          </div>
          <div class="bf-metric-card">
            <div class="bf-metric-icon">🎬</div>
            <div class="bf-metric-value">${BFHelpers.formatNumber(stats.videoCount)}</div>
            <div class="bf-metric-label">${t('Vidéos', 'Videos')}</div>
          </div>
          <div class="bf-metric-card">
            <div class="bf-metric-icon">👁️</div>
            <div class="bf-metric-value">${BFHelpers.formatNumber(stats.viewCount)}</div>
            <div class="bf-metric-label">${t('Vues totales', 'Total Views')}</div>
          </div>
          <div class="bf-metric-card">
            <div class="bf-metric-icon">📊</div>
            <div class="bf-metric-value">${stats.videoCount > 0 ? BFHelpers.formatNumber(Math.round(stats.viewCount / stats.videoCount)) : '-'}</div>
            <div class="bf-metric-label">${t('Moy. vues/vidéo', 'Avg views/video')}</div>
          </div>
        </div>

        <div class="bf-channel-desc">
          <div class="bf-section-title">📝 Description</div>
          <p class="bf-desc-text">${(snippet.description || t('Aucune description', 'No description')).substring(0, 300)}${snippet.description?.length > 300 ? '...' : ''}</p>
        </div>
      </div>
    `;
  }

  // ===== SEO TAB =====
  function renderSeoTab(container, videoData) {
    const snippet = videoData?.snippet || {};
    const title = snippet.title || '';
    const description = snippet.description || '';
    const tags = snippet.tags || [];
    const t = (fr, en) => lang === 'fr' ? fr : en;

    // SEO Score calculation
    let score = 0;
    const checks = [];

    // Title length (ideal: 50-70 chars)
    if (title.length >= 40 && title.length <= 70) {
      score += 20;
      checks.push({ label: t('Titre optimisé', 'Optimized title'), status: 'good', detail: `${title.length} ${t('caractères', 'chars')}` });
    } else if (title.length > 0) {
      score += 10;
      checks.push({ label: t('Titre', 'Title'), status: 'warning', detail: `${title.length} ${t('caractères (idéal: 40-70)', 'chars (ideal: 40-70)')}` });
    } else {
      checks.push({ label: t('Titre manquant', 'Missing title'), status: 'bad', detail: '' });
    }

    // Description length (ideal: 200+ chars)
    if (description.length >= 200) {
      score += 20;
      checks.push({ label: t('Description complète', 'Complete description'), status: 'good', detail: `${description.length} ${t('caractères', 'chars')}` });
    } else if (description.length > 50) {
      score += 10;
      checks.push({ label: t('Description courte', 'Short description'), status: 'warning', detail: `${description.length} ${t('caractères (min 200)', 'chars (min 200)')}` });
    } else {
      checks.push({ label: t('Description insuffisante', 'Insufficient description'), status: 'bad', detail: '' });
    }

    // Tags
    if (tags.length >= 10) {
      score += 20;
      checks.push({ label: t('Tags bien remplis', 'Good tags'), status: 'good', detail: `${tags.length} tags` });
    } else if (tags.length >= 3) {
      score += 10;
      checks.push({ label: t('Quelques tags', 'Some tags'), status: 'warning', detail: `${tags.length} tags (${t('min 10', 'min 10')})` });
    } else {
      checks.push({ label: t('Pas assez de tags', 'Not enough tags'), status: 'bad', detail: `${tags.length} tags` });
    }

    // Has links in description
    const hasLinks = description.includes('http');
    if (hasLinks) {
      score += 10;
      checks.push({ label: t('Liens dans description', 'Links in description'), status: 'good', detail: '' });
    } else {
      checks.push({ label: t('Pas de liens', 'No links'), status: 'warning', detail: t('Ajoutez des liens utiles', 'Add useful links') });
    }

    // Has hashtags
    const hasHashtags = description.includes('#');
    if (hasHashtags) {
      score += 10;
      checks.push({ label: t('Hashtags présents', 'Hashtags present'), status: 'good', detail: '' });
    } else {
      checks.push({ label: t('Pas de hashtags', 'No hashtags'), status: 'warning', detail: t('Ajoutez 3-5 hashtags', 'Add 3-5 hashtags') });
    }

    // Emoji in title
    const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/u.test(title);
    if (hasEmoji) {
      score += 10;
      checks.push({ label: t('Emoji dans le titre', 'Emoji in title'), status: 'good', detail: t('Attire l\'attention', 'Catches attention') });
    }

    // Caps usage
    const capsRatio = (title.match(/[A-Z]/g) || []).length / Math.max(title.length, 1);
    if (capsRatio > 0.1 && capsRatio < 0.5) {
      score += 10;
      checks.push({ label: t('Utilisation des majuscules', 'Caps usage'), status: 'good', detail: '' });
    }

    score = Math.min(100, score);

    const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

    container.innerHTML = `
      <div class="bf-seo-section">
        <div class="bf-seo-score-container">
          <div class="bf-seo-score-circle" style="border-color: ${scoreColor}">
            <span class="bf-seo-score-value" style="color: ${scoreColor}">${score}</span>
            <span class="bf-seo-score-label">/100</span>
          </div>
          <div class="bf-seo-score-title">${t('Score SEO', 'SEO Score')}</div>
        </div>

        <div class="bf-seo-checks">
          ${checks.map(c => `
            <div class="bf-seo-check bf-seo-${c.status}">
              <span class="bf-seo-check-icon">${c.status === 'good' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'}</span>
              <div class="bf-seo-check-text">
                <span class="bf-seo-check-label">${c.label}</span>
                ${c.detail ? `<span class="bf-seo-check-detail">${c.detail}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        ${tags.length > 0 ? `
          <div class="bf-tags-section">
            <div class="bf-section-title">🏷️ Tags (${tags.length})</div>
            <div class="bf-tags-list">
              ${tags.map(tag => `<span class="bf-tag">${tag}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ===== AI TAB =====
  function renderAiTab(container, videoData, channelData) {
    const t = (fr, en) => lang === 'fr' ? fr : en;

    container.innerHTML = `
      <div class="bf-ai-section">
        <div class="bf-section-title">🤖 ${t('Assistant IA BlueFox', 'BlueFox AI Assistant')}</div>
        <p class="bf-section-desc">${t(
          'Sélectionnez un sujet pour obtenir des conseils personnalisés pour booster vos vidéos.',
          'Select a topic to get personalized tips to boost your videos.'
        )}</p>

        <div class="bf-ai-buttons">
          <button class="bf-ai-btn" data-topic="optimize">
            🚀 ${t('Optimiser cette vidéo', 'Optimize this video')}
          </button>
          <button class="bf-ai-btn" data-topic="title">
            ✏️ ${t('Améliorer le titre', 'Improve title')}
          </button>
          <button class="bf-ai-btn" data-topic="thumbnail">
            🖼️ ${t('Conseils miniature', 'Thumbnail tips')}
          </button>
          <button class="bf-ai-btn" data-topic="grow">
            📈 ${t('Comment percer', 'How to grow')}
          </button>
          <button class="bf-ai-btn" data-topic="shorts">
            📱 ${t('Maîtriser les Shorts', 'Master Shorts')}
          </button>
          <button class="bf-ai-btn" data-topic="viral">
            🔥 ${t('Devenir viral', 'Go viral')}
          </button>
        </div>

        <div class="bf-ai-response" id="bf-ai-response">
          <div class="bf-ai-placeholder">
            🦊 ${t(
              'Cliquez sur un bouton ci-dessus pour recevoir des conseils !',
              'Click a button above to receive tips!'
            )}
          </div>
        </div>
      </div>
    `;

    // AI button handlers
    container.querySelectorAll('.bf-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const topic = btn.dataset.topic;
        const responseEl = document.getElementById('bf-ai-response');
        responseEl.innerHTML = '<div class="bf-loading"><div class="bf-spinner"></div></div>';

        setTimeout(() => {
          const tip = generateAiTip(topic, videoData, channelData);
          responseEl.innerHTML = `<div class="bf-ai-content">${tip}</div>`;
        }, 800);
      });
    });
  }

  // Generate AI tips
  function generateAiTip(topic, videoData, channelData) {
    const snippet = videoData?.snippet || {};
    const stats = videoData?.statistics || {};
    const title = snippet.title || '';
    const t = (fr, en) => lang === 'fr' ? fr : en;

    const tips = {
      optimize: t(
        `🚀 <strong>Optimisation de "${title.substring(0, 40)}..."</strong><br/><br/>
        📊 <strong>Analyse rapide :</strong><br/>
        • Vues : ${BFHelpers.formatNumber(stats.viewCount)} | Likes : ${BFHelpers.formatNumber(stats.likeCount)}<br/>
        • Engagement : ${BFHelpers.calcEngagementRate(stats.likeCount, 0, stats.commentCount, stats.viewCount)}%<br/><br/>
        💡 <strong>Recommandations :</strong><br/>
        1️⃣ ${title.length < 40 ? 'Allongez votre titre (40-70 caractères idéal)' : title.length > 70 ? 'Raccourcissez votre titre' : 'Bonne longueur de titre !'}<br/>
        2️⃣ Ajoutez des timestamps dans la description<br/>
        3️⃣ Épinglez un commentaire avec un CTA<br/>
        4️⃣ Créez un écran de fin avec des liens<br/>
        5️⃣ Répondez aux commentaires dans la première heure`,

        `🚀 <strong>Optimization for "${title.substring(0, 40)}..."</strong><br/><br/>
        📊 <strong>Quick Analysis:</strong><br/>
        • Views: ${BFHelpers.formatNumber(stats.viewCount)} | Likes: ${BFHelpers.formatNumber(stats.likeCount)}<br/>
        • Engagement: ${BFHelpers.calcEngagementRate(stats.likeCount, 0, stats.commentCount, stats.viewCount)}%<br/><br/>
        💡 <strong>Recommendations:</strong><br/>
        1️⃣ ${title.length < 40 ? 'Make your title longer (40-70 chars ideal)' : title.length > 70 ? 'Shorten your title' : 'Good title length!'}<br/>
        2️⃣ Add timestamps in description<br/>
        3️⃣ Pin a comment with a CTA<br/>
        4️⃣ Create an end screen with links<br/>
        5️⃣ Reply to comments in the first hour`
      ),

      title: t(
        `✏️ <strong>Amélioration du titre</strong><br/><br/>
        📝 Titre actuel : "${title}"<br/>
        📏 Longueur : ${title.length} caractères<br/><br/>
        💡 <strong>Suggestions :</strong><br/>
        • Ajoutez des chiffres (ex: "5 astuces", "en 10 min")<br/>
        • Utilisez des mots puissants : INCROYABLE, SECRET, FACILE<br/>
        • Posez une question pour susciter la curiosité<br/>
        • Placez le mot-clé principal au début<br/>
        • Ajoutez un emoji pour attirer l'œil 👀<br/><br/>
        🎯 <strong>Formules qui marchent :</strong><br/>
        • "Comment [OBJECTIF] en [TEMPS]"<br/>
        • "[NOMBRE] [SUJETS] que vous ne connaissez pas"<br/>
        • "J'ai testé [CHOSE] pendant [TEMPS] (résultats)"`,

        `✏️ <strong>Title Improvement</strong><br/><br/>
        📝 Current title: "${title}"<br/>
        📏 Length: ${title.length} characters<br/><br/>
        💡 <strong>Suggestions:</strong><br/>
        • Add numbers (e.g., "5 tips", "in 10 min")<br/>
        • Use power words: INCREDIBLE, SECRET, EASY<br/>
        • Ask a question to spark curiosity<br/>
        • Put the main keyword at the beginning<br/>
        • Add an emoji to catch the eye 👀<br/><br/>
        🎯 <strong>Winning formulas:</strong><br/>
        • "How to [GOAL] in [TIME]"<br/>
        • "[NUMBER] [TOPICS] you didn't know"<br/>
        • "I tested [THING] for [TIME] (results)"`
      ),

      thumbnail: t(
        `🖼️ <strong>Conseils pour une miniature qui clique :</strong><br/><br/>
        🎨 <strong>Design :</strong><br/>
        • Maximum 3 éléments visuels<br/>
        • Texte gros et lisible (3-5 mots max)<br/>
        • Contraste élevé de couleurs<br/>
        • Visage avec expression forte = +30% CTR<br/><br/>
        🚫 <strong>À éviter :</strong><br/>
        • Trop de texte<br/>
        • Images floues ou sombres<br/>
        • Clickbait trompeur (pénalisé par l'algo)<br/>
        • Ressembler aux autres vidéos<br/><br/>
        🔧 <strong>Outils gratuits :</strong><br/>
        • Canva (templates YouTube)<br/>
        • Remove.bg (supprimer fond)<br/>
        • Photopea (Photoshop gratuit)`,

        `🖼️ <strong>Tips for a clickable thumbnail:</strong><br/><br/>
        🎨 <strong>Design:</strong><br/>
        • Maximum 3 visual elements<br/>
        • Large readable text (3-5 words max)<br/>
        • High color contrast<br/>
        • Face with strong expression = +30% CTR<br/><br/>
        🚫 <strong>Avoid:</strong><br/>
        • Too much text<br/>
        • Blurry or dark images<br/>
        • Misleading clickbait (penalized by algo)<br/>
        • Looking like other videos<br/><br/>
        🔧 <strong>Free tools:</strong><br/>
        • Canva (YouTube templates)<br/>
        • Remove.bg (remove background)<br/>
        • Photopea (free Photoshop)`
      ),

      grow: t(
        `📈 <strong>Comment percer sur YouTube :</strong><br/><br/>
        🎯 <strong>Les 3 piliers :</strong><br/>
        1️⃣ <strong>Régularité</strong> : Publiez au minimum 2x/semaine<br/>
        2️⃣ <strong>Qualité</strong> : Meilleur contenu que vos concurrents<br/>
        3️⃣ <strong>Optimisation</strong> : SEO, miniatures, titres<br/><br/>
        🧠 <strong>Stratégie de croissance :</strong><br/>
        • Trouvez votre niche unique<br/>
        • Étudiez vos analytics chaque semaine<br/>
        • Collaborez avec des créateurs similaires<br/>
        • Shorts pour attirer, longs pour fidéliser<br/>
        • Répondez à TOUS les commentaires<br/>
        • Créez des playlists thématiques<br/><br/>
        ⏰ <strong>Meilleurs horaires :</strong><br/>
        • Semaine : 17h-20h<br/>
        • Weekend : 10h-12h`,

        `📈 <strong>How to grow on YouTube:</strong><br/><br/>
        🎯 <strong>The 3 pillars:</strong><br/>
        1️⃣ <strong>Consistency</strong>: Post at least 2x/week<br/>
        2️⃣ <strong>Quality</strong>: Better content than competitors<br/>
        3️⃣ <strong>Optimization</strong>: SEO, thumbnails, titles<br/><br/>
        🧠 <strong>Growth strategy:</strong><br/>
        • Find your unique niche<br/>
        • Study your analytics weekly<br/>
        • Collaborate with similar creators<br/>
        • Shorts to attract, long-form to retain<br/>
        • Reply to ALL comments<br/>
        • Create themed playlists<br/><br/>
        ⏰ <strong>Best posting times:</strong><br/>
        • Weekdays: 5-8 PM<br/>
        • Weekends: 10
        AM-12 PM`
      ),

      shorts: t(
        `📱 <strong>Maîtriser les YouTube Shorts :</strong><br/><br/>
        📐 <strong>Format :</strong><br/>
        • 9:16 vertical (1080x1920)<br/>
        • Durée idéale : 30-45 secondes<br/>
        • Hook dans les 2 premières secondes<br/><br/>
        🔥 <strong>Ce qui marche :</strong><br/>
        • Tutoriels rapides<br/>
        • Before/After<br/>
        • Réactions et POV<br/>
        • Faits surprenants<br/>
        • Trends et challenges<br/><br/>
        💡 <strong>Astuces pro :</strong><br/>
        • Boucle infinie (fin = début)<br/>
        • Sous-titres obligatoires (80% regardent sans son)<br/>
        • Postez 1 Short/jour minimum<br/>
        • Utilisez les sons tendance<br/>
        • CTA : "Follow pour plus"<br/>
        • Recyclez vos meilleurs longs en Shorts`,

        `📱 <strong>Master YouTube Shorts:</strong><br/><br/>
        📐 <strong>Format:</strong><br/>
        • 9:16 vertical (1080x1920)<br/>
        • Ideal length: 30-45 seconds<br/>
        • Hook in first 2 seconds<br/><br/>
        🔥 <strong>What works:</strong><br/>
        • Quick tutorials<br/>
        • Before/After<br/>
        • Reactions and POV<br/>
        • Surprising facts<br/>
        • Trends and challenges<br/><br/>
        💡 <strong>Pro tips:</strong><br/>
        • Infinite loop (end = beginning)<br/>
        • Captions mandatory (80% watch muted)<br/>
        • Post at least 1 Short/day<br/>
        • Use trending sounds<br/>
        • CTA: "Follow for more"<br/>
        • Repurpose best long-form into Shorts`
      ),

      viral: t(
        `🔥 <strong>Les secrets de la viralité :</strong><br/><br/>
        🧪 <strong>La formule virale :</strong><br/>
        Viral = (Émotion forte × Partageabilité × Timing)<br/><br/>
        😱 <strong>Émotions qui marchent :</strong><br/>
        • Surprise / Choc<br/>
        • Rire / Humour<br/>
        • Inspiration / Motivation<br/>
        • Curiosité irrésistible<br/>
        • Nostalgie<br/><br/>
        📊 <strong>Métriques clés :</strong><br/>
        • CTR miniature > 10%<br/>
        • Rétention > 70% à 30 secondes<br/>
        • Watch time élevé<br/>
        • Taux de partage élevé<br/><br/>
        🎬 <strong>Structure virale :</strong><br/>
        1. Hook choc (0-5 sec)<br/>
        2. Promesse de valeur (5-15 sec)<br/>
        3. Contenu qui tient en haleine<br/>
        4. Pattern interrupts réguliers<br/>
        5. CTA + teaser fin<br/><br/>
        ⚡ <strong>Conseil #1 :</strong> Le contenu viral n'est pas créé, il est <em>engineered</em>.`,

        `🔥 <strong>Secrets of virality:</strong><br/><br/>
        🧪 <strong>The viral formula:</strong><br/>
        Viral = (Strong Emotion × Shareability × Timing)<br/><br/>
        😱 <strong>Emotions that work:</strong><br/>
        • Surprise / Shock<br/>
        • Laughter / Humor<br/>
        • Inspiration / Motivation<br/>
        • Irresistible curiosity<br/>
        • Nostalgia<br/><br/>
        📊 <strong>Key metrics:</strong><br/>
        • Thumbnail CTR > 10%<br/>
        • Retention > 70% at 30 seconds<br/>
        • High watch time<br/>
        • High share rate<br/><br/>
        🎬 <strong>Viral structure:</strong><br/>
        1. Shock hook (0-5 sec)<br/>
        2. Value promise (5-15 sec)<br/>
        3. Gripping content<br/>
        4. Regular pattern interrupts<br/>
        5. CTA + end teaser<br/><br/>
        ⚡ <strong>Tip #1:</strong> Viral content isn't created, it's <em>engineered</em>.`
      )
    };

    return tips[topic] || t('Conseil non disponible.', 'Tip not available.');
  }

  // ===== MAIN INITIALIZATION =====
  async function init() {
    if (!BFHelpers.isVideoPage()) return;

    const videoId = BFHelpers.getVideoId();
    if (!videoId) return;
    if (videoId === currentVideoId && isInitialized) return;

    currentVideoId = videoId;
    isInitialized = false;

    console.log('🦊 BlueFox Stats - Initializing for:', videoId);

    await loadSettings();

    // Create toggle button
    createToggleButton();

    // Create panel
    const panel = createPanel();

    // Show loading
    panel.innerHTML = `
      <div class="bf-panel-header">
        <div class="bf-panel-header-left">
          <span class="bf-panel-logo">🦊</span>
          <span class="bf-panel-title">BlueFox Stats</span>
        </div>
      </div>
      <div class="bf-loading-state">
        <div class="bf-spinner"></div>
        <span>${lang === 'fr' ? 'Chargement des données...' : 'Loading data...'}</span>
      </div>
    `;

    try {
      // Fetch all data in parallel
      const [videoData, dislikeData, scrapedData] = await Promise.all([
        settings.bfApiKey ? BFApi.getVideoDetails(videoId) : null,
        BFApi.getDislikes(videoId),
        Promise.resolve(BFApi.scrapeVideoData())
      ]);

      // Get channel data if we have the API and channel ID
      let channelData = null;
      if (videoData && videoData.snippet && videoData.snippet.channelId) {
        channelData = await BFApi.getChannelDetails(videoData.snippet.channelId);
      }

      // Build panel
      panel.innerHTML = '';
      buildPanelContent(panel, videoData, channelData, dislikeData);

      isInitialized = true;
      console.log('🦊 BlueFox Stats - Ready!');

    } catch (error) {
      console.error('🦊 BlueFox Stats - Init error:', error);
      panel.innerHTML = `
        <div class="bf-panel-header">
          <div class="bf-panel-header-left">
            <span class="bf-panel-logo">🦊</span>
            <span class="bf-panel-title">BlueFox Stats</span>
          </div>
        </div>
        <div class="bf-error-state">
          <span class="bf-error-icon">⚠️</span>
          <span>${lang === 'fr' ? 'Erreur de chargement.' : 'Loading error.'}</span>
          <button class="bf-retry-btn" id="bf-retry">${lang === 'fr' ? 'Réessayer' : 'Retry'}</button>
        </div>
      `;

      document.getElementById('bf-retry')?.addEventListener('click', () => {
        currentVideoId = null;
        isInitialized = false;
        init();
      });
    }
  }

  // ===== URL CHANGE DETECTION =====
  let lastUrl = location.href;

  // Observer for SPA navigation
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      currentVideoId = null;
      isInitialized = false;

      // Small delay for YouTube to update DOM
      setTimeout(init, 1500);
    }
  });

  urlObserver.observe(document.body, { childList: true, subtree: true });

  // Also listen for YouTube navigation events
  window.addEventListener('yt-navigate-finish', () => {
    setTimeout(init, 1000);
  });

  // Message listener from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BF_ANALYZE_URL') {
      // Handle context menu analysis
      const videoId = BFHelpers.getVideoId(message.url);
      if (videoId) {
        currentVideoId = null;
        init();
      }
    }

    if (message.type === 'BF_GET_STATUS') {
      sendResponse({
        isVideoPage: BFHelpers.isVideoPage(),
        videoId: currentVideoId,
        isInitialized: isInitialized,
        scrapedData: BFApi.scrapeVideoData()
      });
      return true;
    }

    if (message.type === 'BF_SETTINGS_CHANGED') {
      loadSettings().then(() => {
        currentVideoId = null;
        isInitialized = false;
        init();
      });
    }
  });

  // ===== FIRST RUN =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 2000));
  } else {
    setTimeout(init, 2000);
  }

})();
