// BlueFox Stats v0.1 - Helper Functions

const BlueFoxHelpers = {
  formatNumber(num) {
    if (!num && num !== 0) return '0';
    num = parseInt(num);
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  },

  formatNumberFull(num) {
    if (!num && num !== 0) return '0';
    return parseInt(num).toLocaleString();
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const lang = BlueFoxI18n.getLanguage();
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  getVideoAge(publishedDate) {
    const now = new Date();
    const published = new Date(publishedDate);
    const diffMs = now - published;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    const t = BlueFoxI18n.t.bind(BlueFoxI18n);

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return `${years}a ${months}m`;
    }
    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return `${months}m ${days}${t('days').charAt(0)}`;
    }
    if (diffDays > 0) return `${diffDays} ${t('days')}`;
    if (diffHours > 0) return `${diffHours} ${t('hours')}`;
    return `${diffMinutes} ${t('minutes')}`;
  },

  getVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('v');
  },

  calculateEngagementRate(likes, dislikes, views) {
    if (!views || views === 0) return 0;
    return (((likes || 0) + (dislikes || 0)) / views * 100).toFixed(2);
  },

  calculateLikeRatio(likes, dislikes) {
    const total = (likes || 0) + (dislikes || 0);
    if (total === 0) return 0;
    return ((likes / total) * 100).toFixed(1);
  },

  estimateRevenue(views) {
    const lowCPM = 0.5;
    const highCPM = 5.0;
    const avgCPM = 2.5;
    return {
      low: ((views / 1000) * lowCPM).toFixed(2),
      high: ((views / 1000) * highCPM).toFixed(2),
      avg: ((views / 1000) * avgCPM).toFixed(2)
    };
  },

  calculateViewsPerDay(views, publishedDate) {
    const days = Math.max(1, Math.floor((new Date() - new Date(publishedDate)) / (1000 * 60 * 60 * 24)));
    return Math.round(views / days);
  },

  calculateViewsPerHour(views, publishedDate) {
    const hours = Math.max(1, Math.floor((new Date() - new Date(publishedDate)) / (1000 * 60 * 60)));
    return Math.round(views / hours);
  },

  getViralScore(views, likes, dislikes, publishedDate, subscriberCount) {
    let score = 0;
    const days = Math.max(1, Math.floor((new Date() - new Date(publishedDate)) / (1000 * 60 * 60 * 24)));
    const vpd = views / days;
    const engagement = ((likes + (dislikes || 0)) / Math.max(1, views)) * 100;
    const likeRatio = likes / Math.max(1, likes + (dislikes || 0)) * 100;

    // Views velocity
    if (vpd > 1000000) score += 30;
    else if (vpd > 100000) score += 25;
    else if (vpd > 10000) score += 20;
    else if (vpd > 1000) score += 15;
    else if (vpd > 100) score += 10;
    else score += 5;

    // Engagement
    if (engagement > 10) score += 25;
    else if (engagement > 5) score += 20;
    else if (engagement > 3) score += 15;
    else if (engagement > 1) score += 10;
    else score += 5;

    // Like ratio
    if (likeRatio > 98) score += 25;
    else if (likeRatio > 95) score += 20;
    else if (likeRatio > 90) score += 15;
    else if (likeRatio > 80) score += 10;
    else score += 5;

    // Views vs subscribers
    if (subscriberCount && subscriberCount > 0) {
      const viewSubRatio = views / subscriberCount;
      if (viewSubRatio > 10) score += 20;
      else if (viewSubRatio > 5) score += 15;
      else if (viewSubRatio > 1) score += 10;
      else score += 5;
    } else {
      score += 10;
    }

    return Math.min(100, score);
  },

  getScoreColor(score) {
    if (score >= 80) return '#00e676';
    if (score >= 60) return '#76ff03';
    if (score >= 40) return '#ffea00';
    if (score >= 20) return '#ff9100';
    return '#ff1744';
  },

  getScoreLabel(score) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    if (score >= 75) return t('excellent');
    if (score >= 50) return t('good');
    if (score >= 25) return t('average');
    return t('poor');
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);

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
        reject(new Error(`Element ${selector} not found`));
      }, timeout);
    });
  },

  generateProjectedViews(currentViews, publishedDate) {
    const days = Math.max(1, Math.floor((new Date() - new Date(publishedDate)) / (1000 * 60 * 60 * 24)));
    const dailyRate = currentViews / days;
    // Decay factor
    const projected30 = currentViews + (dailyRate * 30 * 0.7);
    return Math.round(projected30);
  },

  generateViewsData(totalViews, publishedDate) {
    const now = new Date();
    const published = new Date(publishedDate);
    const totalDays = Math.max(1, Math.floor((now - published) / (1000 * 60 * 60 * 24)));
    
    const points = Math.min(totalDays, 30);
    const data = [];
    
    for (let i = 0; i <= points; i++) {
      const ratio = i / points;
      // Logarithmic growth curve simulation
      const viewsAtPoint = Math.round(totalViews * (1 - Math.pow(1 - ratio, 1.5)));
      const date = new Date(published.getTime() + (ratio * (now - published)));
      data.push({
        date: date.toLocaleDateString(BlueFoxI18n.getLanguage() === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' }),
        views: viewsAtPoint
      });
    }
    
    return data;
  }
};
