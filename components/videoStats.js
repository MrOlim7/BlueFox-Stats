// BlueFox Stats v0.1 - Video Stats Component

const BlueFoxVideoStats = {
  render(container, videoData, dislikeData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    
    const views = videoData.views || 0;
    const likes = dislikeData ? dislikeData.likes : (videoData.likes || 0);
    const dislikes = dislikeData ? dislikeData.dislikes : 0;
    const publishedDate = videoData.publishedDate;
    const subscriberCount = videoData.subscriberCount || 0;

    const engagement = BlueFoxHelpers.calculateEngagementRate(likes, dislikes, views);
    const likeRatio = BlueFoxHelpers.calculateLikeRatio(likes, dislikes);
    const revenue = BlueFoxHelpers.estimateRevenue(views);
    const vpd = BlueFoxHelpers.calculateViewsPerDay(views, publishedDate);
    const vph = BlueFoxHelpers.calculateViewsPerHour(views, publishedDate);
    const viralScore = BlueFoxHelpers.getViralScore(views, likes, dislikes, publishedDate, subscriberCount);
    const projectedViews = BlueFoxHelpers.generateProjectedViews(views, publishedDate);
    const videoAge = BlueFoxHelpers.getVideoAge(publishedDate);

    const scoreColor = BlueFoxHelpers.getScoreColor(viralScore);
    const scoreLabel = BlueFoxHelpers.getScoreLabel(viralScore);

    let html = `
      <div class="bf-section bf-video-stats-section">
        <h3 class="bf-section-title">📊 ${t('videoPerformance')}</h3>
        
        <!-- Viral Score -->
        <div class="bf-viral-score-container">
          <div class="bf-score-circle" style="border-color: ${scoreColor}">
            <span class="bf-score-number" style="color: ${scoreColor}">${viralScore}</span>
            <span class="bf-score-label">${t('viralScore')}</span>
          </div>
          <span class="bf-score-text" style="color: ${scoreColor}">${scoreLabel}</span>
        </div>

        <!-- Stats Grid -->
        <div class="bf-stats-grid">
          <div class="bf-stat-card">
            <div class="bf-stat-icon">👁️</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumberFull(views)}</span>
              <span class="bf-stat-label">${t('views')}</span>
            </div>
          </div>
          
          <div class="bf-stat-card">
            <div class="bf-stat-icon">👍</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumberFull(likes)}</span>
              <span class="bf-stat-label">${t('likes')}</span>
            </div>
          </div>
          
          <div class="bf-stat-card">
            <div class="bf-stat-icon">👎</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumberFull(dislikes)}</span>
              <span class="bf-stat-label">${t('dislikes')}</span>
            </div>
          </div>

                      <div class="bf-stat-icon">📅</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${videoAge}</span>
              <span class="bf-stat-label">${t('videoAge')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">📈</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumber(vpd)}</span>
              <span class="bf-stat-label">${t('viewsPerDay')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">⏱️</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumber(vph)}</span>
              <span class="bf-stat-label">${t('viewsPerHour')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">💰</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${revenue.min} - ${revenue.max}</span>
              <span class="bf-stat-label">${t('estimatedRevenue')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">🎯</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${engagement}%</span>
              <span class="bf-stat-label">${t('engagementRate')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">⚖️</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${likeRatio}%</span>
              <span class="bf-stat-label">${t('likeDislikeRatio')}</span>
            </div>
          </div>

          <div class="bf-stat-card">
            <div class="bf-stat-icon">🔮</div>
            <div class="bf-stat-info">
              <span class="bf-stat-value">${BlueFoxHelpers.formatNumber(projectedViews)}</span>
              <span class="bf-stat-label">${t('projectedViews')}</span>
            </div>
          </div>
        </div>

        <!-- Like/Dislike Bar -->
        <div class="bf-ratio-bar-container">
          <div class="bf-ratio-bar">
            <div class="bf-ratio-bar-fill" id="bf-like-ratio-bar" style="width: ${likeRatio}%"></div>
          </div>
          <div class="bf-ratio-labels">
            <span class="bf-ratio-like">👍 ${likeRatio}%</span>
            <span class="bf-ratio-dislike">👎 ${(100 - parseFloat(likeRatio)).toFixed(1)}%</span>
          </div>
        </div>

        <!-- Video ID & Publish Info -->
        <div class="bf-meta-info">
          <div class="bf-meta-item">
            <span class="bf-meta-label">${t('videoId')}:</span>
            <span class="bf-meta-value bf-copyable" data-copy="${videoData.videoId}">${videoData.videoId} 📋</span>
          </div>
          <div class="bf-meta-item">
            <span class="bf-meta-label">${t('publishedOn')}:</span>
            <span class="bf-meta-value">${publishedDate}</span>
          </div>
          <div class="bf-meta-item">
            <span class="bf-meta-label">${t('estimatedCPM')}:</span>
            <span class="bf-meta-value">$2.00 - $7.00</span>
          </div>
        </div>

        <!-- Export Button -->
        <div class="bf-export-section">
          <button class="bf-btn bf-btn-export" id="bf-export-btn">
            📥 ${t('exportData')}
          </button>
          <button class="bf-btn bf-btn-share" id="bf-share-btn">
            📤 ${t('shareStats')}
          </button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);

    // Event listeners
    setTimeout(() => {
      // Copy video ID
      container.querySelectorAll('.bf-copyable').forEach(el => {
        el.addEventListener('click', () => {
          const text = el.getAttribute('data-copy');
          navigator.clipboard.writeText(text).then(() => {
            const orig = el.textContent;
            el.textContent = '✅ Copié!';
            setTimeout(() => { el.textContent = orig; }, 1500);
          });
        });
      });

      // Export button
      const exportBtn = container.querySelector('#bf-export-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.exportData(videoData, dislikeData);
        });
      }

      // Share button
      const shareBtn = container.querySelector('#bf-share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.shareStats(videoData, dislikeData);
        });
      }
    }, 100);
  },

  exportData(videoData, dislikeData) {
    const data = {
      title: videoData.title,
      videoId: videoData.videoId,
      views: videoData.views,
      likes: dislikeData ? dislikeData.likes : videoData.likes,
      dislikes: dislikeData ? dislikeData.dislikes : 0,
      publishedDate: videoData.publishedDate,
      channelName: videoData.channelName,
      subscribers: videoData.subscriberCount,
      engagementRate: BlueFoxHelpers.calculateEngagementRate(
        dislikeData ? dislikeData.likes : videoData.likes,
        dislikeData ? dislikeData.dislikes : 0,
        videoData.views
      ),
      likeRatio: BlueFoxHelpers.calculateLikeRatio(
        dislikeData ? dislikeData.likes : videoData.likes,
        dislikeData ? dislikeData.dislikes : 0
      ),
      estimatedRevenue: BlueFoxHelpers.estimateRevenue(videoData.views),
      exportDate: new Date().toISOString(),
      exportedBy: 'BlueFox Stats v0.1'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bluefox_stats_${videoData.videoId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  shareStats(videoData, dislikeData) {
    const likes = dislikeData ? dislikeData.likes : videoData.likes;
    const dislikes = dislikeData ? dislikeData.dislikes : 0;
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);

    const text = `📊 BlueFox Stats - ${videoData.title}\n` +
      `👁️ ${BlueFoxHelpers.formatNumber(videoData.views)} ${t('views')}\n` +
      `👍 ${BlueFoxHelpers.formatNumber(likes)} ${t('likes')}\n` +
      `👎 ${BlueFoxHelpers.formatNumber(dislikes)} ${t('dislikes')}\n` +
      `🎯 ${t('engagementRate')}: ${BlueFoxHelpers.calculateEngagementRate(likes, dislikes, videoData.views)}%\n` +
      `💰 ${t('estimatedRevenue')}: ${BlueFoxHelpers.estimateRevenue(videoData.views).min} - ${BlueFoxHelpers.estimateRevenue(videoData.views).max}\n` +
      `\nhttps://youtube.com/watch?v=${videoData.videoId}`;

    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = document.getElementById('bf-share-btn');
      if (shareBtn) {
        const orig = shareBtn.textContent;
        shareBtn.textContent = '✅ Copié dans le presse-papiers!';
        setTimeout(() => { shareBtn.textContent = orig; }, 2000);
      }
    });
  }
};
