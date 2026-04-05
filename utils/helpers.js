// ============================================
// BlueFox Stats v0.1 - Helper Utilities
// ============================================

const BFHelpers = {
  // Format large numbers
  formatNumber(num) {
    if (!num && num !== 0) return '-';
    num = parseInt(num);
    if (isNaN(num)) return '-';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  },

  // Format full number with separators
  formatFullNumber(num) {
    if (!num && num !== 0) return '-';
    return parseInt(num).toLocaleString();
  },

  // Format date relative (e.g., "il y a 3 jours")
  formatRelativeDate(dateString, lang = 'fr') {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (lang === 'fr') {
      if (diffSec < 60) return `il y a ${diffSec}s`;
      if (diffMin < 60) return `il y a ${diffMin} min`;
      if (diffHour < 24) return `il y a ${diffHour}h`;
      if (diffDay < 7) return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
      if (diffWeek < 5) return `il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`;
      if (diffMonth < 12) return `il y a ${diffMonth} mois`;
      return `il y a ${diffYear} an${diffYear > 1 ? 's' : ''}`;
    } else {
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      if (diffWeek < 5) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
      if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
      return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    }
  },

  // Format date full
  formatDate(dateString, lang = 'fr') {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', options);
  },

  // Format duration ISO 8601 (PT1H2M3S)
  formatDuration(isoDuration) {
    if (!isoDuration) return '-';
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '-';

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  },

  // Get video ID from URL
  getVideoId(url) {
    if (!url) url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  },

  // Get channel ID from URL
  getChannelId(url) {
    if (!url) url = window.location.href;
    const match = url.match(/\/(channel|c|@)\/([^/?]+)/);
    return match ? match[2] : null;
  },

  // Check if on video page
  isVideoPage(url) {
    if (!url) url = window.location.href;
    return url.includes('youtube.com/watch');
  },

  // Calculate engagement rate
  calcEngagementRate(likes, dislikes, comments, views) {
    if (!views || views === 0) return 0;
    const interactions = (parseInt(likes) || 0) + (parseInt(dislikes) || 0) + (parseInt(comments) || 0);
    return ((interactions / parseInt(views)) * 100).toFixed(2);
  },

  // Calculate like ratio
  calcLikeRatio(likes, dislikes) {
    likes = parseInt(likes) || 0;
    dislikes = parseInt(dislikes) || 0;
    const total = likes + dislikes;
    if (total === 0) return 100;
    return ((likes / total) * 100).toFixed(1);
  },

  // Calculate views per day
  calcViewsPerDay(views, publishDate) {
    if (!views || !publishDate) return 0;
    const days = Math.max(1, Math.floor((Date.now() - new Date(publishDate).getTime()) / 86400000));
    return Math.round(parseInt(views) / days);
  },

  // Determine video performance rating
  getPerformanceRating(views, subscribers, daysOld, lang = 'fr') {
    if (!views || !subscribers) return { label: '-', color: '#64748b', emoji: '❓' };
    
    const viewsPerSub = views / subscribers;
    const expectedDaily = subscribers * 0.01;
    const actualDaily = views / Math.max(1, daysOld);
    const ratio = actualDaily / expectedDaily;

    if (lang === 'fr') {
      if (ratio > 5) return { label: 'Viral 🔥', color: '#ef4444', emoji: '🔥' };
      if (ratio > 2) return { label: 'Excellent', color: '#22c55e', emoji: '🚀' };
      if (ratio > 1) return { label: 'Bon', color: '#3b82f6', emoji: '👍' };
      if (ratio > 0.5) return { label: 'Moyen', color: '#eab308', emoji: '😐' };
      return { label: 'Faible', color: '#ef4444', emoji: '👎' };
    } else {
      if (ratio > 5) return { label: 'Viral 🔥', color: '#ef4444', emoji: '🔥' };
      if (ratio > 2) return { label: 'Excellent', color: '#22c55e', emoji: '🚀' };
      if (ratio > 1) return { label: 'Good', color: '#3b82f6', emoji: '👍' };
      if (ratio > 0.5) return { label: 'Average', color: '#eab308', emoji: '😐' };
      return { label: 'Low', color: '#ef4444', emoji: '👎' };
    }
  },

  // Estimate revenue
  estimateRevenue(views) {
    views = parseInt(views) || 0;
    const cpmLow = 0.5;
    const cpmMid = 2;
    const cpmHigh = 7;
    return {
      low: ((views / 1000) * cpmLow).toFixed(0),
      mid: ((views / 1000) * cpmMid).toFixed(0),
      high: ((views / 1000) * cpmHigh).toFixed(0)
    };
  },

  // Debounce function
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

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Simple hash for caching
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  },

  // Local storage cache
  cache: {
    set(key, data, ttlMinutes = 30) {
      try {
        const item = {
          data: data,
          expiry: Date.now() + (ttlMinutes * 60 * 1000)
        };
        localStorage.setItem(`bf_cache_${key}`, JSON.stringify(item));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
    },

    get(key) {
      try {
        const item = localStorage.getItem(`bf_cache_${key}`);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem(`bf_cache_${key}`);
          return null;
        }
        return parsed.data;
      } catch (e) {
        return null;
      }
    },

    clear() {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('bf_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
};

// Make available globally
window.BFHelpers = BFHelpers;
