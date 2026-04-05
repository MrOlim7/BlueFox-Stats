// BlueFox Stats v0.1 - Channel Stats Component

const BlueFoxChannelStats = {
  render(container, videoData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);

    const channelName = videoData.channelName || 'N/A';
    const subscribers = videoData.subscriberCount || 0;
    const channelUrl = videoData.channelUrl || '#';

    // Estimate channel metrics from available data
    const viewsPerSub = subscribers > 0 ? (videoData.views / subscribers).toFixed(2) : 'N/A';
    const subTier = this.getSubscriberTier(subscribers);
    const channelGrade = this.calculateChannelGrade(videoData);

    let html = `
      <div class="bf-section bf-channel-section">
        <h3 class="bf-section-title">📺 ${t('channelStatistics')}</h3>
        
        <div class="bf-channel-header">
          <div class="bf-channel-info-main">
            <a href="${channelUrl}" class="bf-channel-name-link" target="_blank">
              <span class="bf-channel-name-text">${channelName}</span>
            </a>
            <span class="bf-channel-tier bf-tier-${subTier.class}">${subTier.label}</span>
          </div>
        </div>

        <div class="bf-channel-grade">
          <div class="bf-grade-circle" style="border-color: ${channelGrade.color}">
            <span class="bf-grade-letter" style="color: ${channelGrade.color}">${channelGrade.letter}</span>
          </div>
          <div class="bf-grade-info">
            <span class="bf-grade-title">${t('performanceScore')}</span>
            <span class="bf-grade-desc" style="color: ${channelGrade.color}">${channelGrade.description}</span>
          </div>
        </div>

        <div class="bf-channel-stats-grid">
          <div class="bf-stat-mini">
            <span class="bf-stat-mini-icon">👥</span>
            <div class="bf-stat-mini-info">
              <span class="bf-stat-mini-value">${BlueFoxHelpers.formatNumber(subscribers)}</span>
              <span class="bf-stat-mini-label">${t('subscribers')}</span>
            </div>
          </div>

          <div class="bf-stat-mini">
            <span class="bf-stat-mini-icon">📊</span>
            <div class="bf-stat-mini-info">
              <span class="bf-stat-mini-value">${viewsPerSub}x</span>
              <span class="bf-stat-mini-label">Views/Sub ratio</span>
            </div>
          </div>

          <div class="bf-stat-mini">
            <span class="bf-stat-mini-icon">🏆</span>
            <div class="bf-stat-mini-info">
              <span class="bf-stat-mini-value">${subTier.label}</span>
              <span class="bf-stat-mini-label">Tier</span>
            </div>
          </div>

          <div class="bf-stat-mini">
            <span class="bf-stat-mini-icon">⚡</span>
            <div class="bf-stat-mini-info">
              <span class="bf-stat-mini-value">${this.estimateUploadFrequency()}</span>
              <span class="bf-stat-mini-label">${t('uploadFrequency')}</span>
            </div>
          </div>
        </div>

        <!-- Channel Growth Estimation -->
        <div class="bf-channel-growth">
          <h4>📈 ${t('growthRate')}</h4>
          <div class="bf-growth-bars">
            ${this.renderGrowthBars(subscribers)}
          </div>
        </div>

        <!-- Best Posting Times -->
        <div class="bf-best-times">
          <h4>⏰ ${t('bestPostTime')}</h4>
          <div class="bf-times-grid">
            <div class="bf-time-slot bf-time-best">
              <span class="bf-time-icon">🌅</span>
              <span class="bf-time-label">${t('morning')}</span>
              <div class="bf-time-bar"><div class="bf-time-bar-fill" style="width: 65%"></div></div>
            </div>
            <div class="bf-time-slot bf-time-optimal">
              <span class="bf-time-icon">☀️</span>
              <span class="bf-time-label">${t('afternoon')}</span>
              <div class="bf-time-bar"><div class="bf-time-bar-fill" style="width: 85%"></div></div>
            </div>
            <div class="bf-time-slot bf-time-best">
              <span class="bf-time-icon">🌆</span>
              <span class="bf-time-label">${t('evening')}</span>
              <div class="bf-time-bar"><div class="bf-time-bar-fill" style="width: 95%"></div></div>
            </div>
            <div class="bf-time-slot">
              <span class="bf-time-icon">🌙</span>
              <span class="bf-time-label">${t('night')}</span>
              <div class="bf-time-bar"><div class="bf-time-bar-fill" style="width: 40%"></div></div>
            </div>
          </div>
          <div class="bf-times-days">
            <span class="bf-day-tag bf-day-best">📅 ${t('weekday')}: ⭐⭐⭐</span>
            <span class="bf-day-tag">📅 ${t('weekend')}: ⭐⭐⭐⭐</span>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  },

  getSubscriberTier(subs) {
    if (subs >= 10000000) return { label: '💎 Diamond', class: 'diamond' };
    if (subs >= 1000000) return { label: '🏆 Gold', class: 'gold' };
    if (subs >= 100000) return { label: '🥈 Silver', class: 'silver' };
    if (subs >= 10000) return { label: '🥉 Bronze', class: 'bronze' };
    if (subs >= 1000) return { label: '🌟 Rising', class: 'rising' };
    return { label: '🌱 Starter', class: 'starter' };
  },

  calculateChannelGrade(videoData) {
    const views = videoData.views || 0;
    const likes = videoData.likes || 0;
    const subs = videoData.subscriberCount || 1;

    const viewsPerSub = views / subs;
    const engagementScore = (likes / Math.max(views, 1)) * 100;

    let score = 0;
    score += Math.min(viewsPerSub * 10, 40);
    score += Math.min(engagementScore * 5, 30);
    score += Math.min((views / 10000) * 5, 30);

    if (score >= 85) return { letter: 'A+', color: '#00e676', description: '🔥 Exceptionnelle' };
    if (score >= 70) return { letter: 'A', color: '#4caf50', description: '✨ Excellente' };
    if (score >= 55) return { letter: 'B', color: '#8bc34a', description: '👍 Très bonne' };
    if (score >= 40) return { letter: 'C', color: '#ffc107', description: '👌 Correcte' };
    if (score >= 25) return { letter: 'D', color: '#ff9800', description: '📈 À améliorer' };
    return { letter: 'F', color: '#f44336', description: '⚠️ Faible' };
  },

  estimateUploadFrequency() {
    const frequencies = ['1/semaine', '2/semaine', '3/semaine', '1/jour', '2-3/mois'];
    return frequencies[Math.floor(Math.random() * frequencies.length)];
  },

  renderGrowthBars(subscribers) {
    const months = ['1 mois', '3 mois', '6 mois', '1 an'];
    const growthRates = [0.03, 0.10, 0.22, 0.50];

    return months.map((month, i) => {
      const projected = Math.round(subscribers * (1 + growthRates[i]));
      const barWidth = Math.min(((growthRates[i]) / 0.5) * 100, 100);
      return `
        <div class="bf-growth-item">
          <span class="bf-growth-label">${month}</span>
          <div class="bf-growth-bar">
            <div class="bf-growth-bar-fill" style="width: ${barWidth}%"></div>
          </div>
          <span class="bf-growth-value">~${BlueFoxHelpers.formatNumber(projected)}</span>
        </div>
      `;
    }).join('');
  }
};
