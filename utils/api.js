// BlueFox Stats v0.1 - API Module

const BlueFoxAPI = {
  async getDislikeData(videoId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'fetchDislike', videoId },
        (response) => {
          if (response && response.success) {
            resolve(response.data);
          } else {
            resolve(null);
          }
        }
      );
    });
  },

  async getThumbnailHistory(videoId) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'fetchThumbnailHistory', videoId },
        (response) => {
          if (response && response.success && Array.isArray(response.data)) {
            resolve(response.data);
          } else {
            resolve([]);
          }
        }
      );
    });
  },

  getVideoDataFromPage() {
    const data = {
      title: '',
      views: 0,
      likes: 0,
      publishedDate: '',
      channelName: '',
      channelUrl: '',
      subscriberCount: 0,
      description: '',
      tags: [],
      videoId: BlueFoxHelpers.getVideoId()
    };

    try {
      // Title
      const titleEl = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata') ||
                       document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                       document.querySelector('#title h1 yt-formatted-string');
      if (titleEl) data.title = titleEl.textContent.trim();

      // Views
      const viewsEl = document.querySelector('span.view-count') ||
                       document.querySelector('ytd-video-view-count-renderer span') ||
                       document.querySelector('#count ytd-video-view-count-renderer span');
      if (viewsEl) {
        const viewsText = viewsEl.textContent.replace(/[^0-9]/g, '');
        data.views = parseInt(viewsText) || 0;
      }

      // Likes
      const likeBtn = document.querySelector('#top-level-buttons-computed ytd-toggle-button-renderer button[aria-label]') ||
                       document.querySelector('ytd-menu-renderer button[aria-label*="like" i]') ||
                       document.querySelector('#segmented-like-button button') ||
                       document.querySelector('like-button-view-model button');
      if (likeBtn) {
        const ariaLabel = likeBtn.getAttribute('aria-label') || '';
        const likeText = ariaLabel.replace(/[^0-9]/g, '');
        data.likes = parseInt(likeText) || 0;
        
        if (!data.likes) {
          const likeTextEl = likeBtn.querySelector('.yt-spec-button-shape-next__button-text-content') ||
                             likeBtn.querySelector('span[role="text"]');
          if (likeTextEl) {
            const txt = likeTextEl.textContent.trim().replace(/[^0-9KMBkmb.,]/g, '');
            data.likes = this.parseShortNumber(txt);
          }
        }
      }

      // Published date
      const dateEl = document.querySelector('#info-strings yt-formatted-string') ||
                     document.querySelector('ytd-video-primary-info-renderer #info-strings yt-formatted-string');
      if (dateEl) data.publishedDate = dateEl.textContent.trim();

      // Also try structured data
      const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
      scriptTags.forEach(script => {
        try {
          const json = JSON.parse(script.textContent);
          if (json.uploadDate) data.publishedDate = json.uploadDate;
          if (json.interactionStatistic) {
            json.interactionStatistic.forEach(stat => {
              if (stat.interactionType === 'http://schema.org/WatchAction') {
                data.views = data.views || parseInt(stat.userInteractionCount) || 0;
              }
            });
          }
          if (json.name) data.title = data.title || json.name;
          if (json.description) data.description = json.description;
          if (json.keywords) data.tags = json.keywords.split(',').map(t => t.trim());
        } catch (e) {}
      });

      // Try meta tags
      const metaDate = document.querySelector('meta[itemprop="datePublished"]') ||
                       document.querySelector('meta[itemprop="uploadDate"]');
      if (metaDate) data.publishedDate = data.publishedDate || metaDate.getAttribute('content');

      // Channel
      const channelEl = document.querySelector('#owner #channel-name a') ||
                        document.querySelector('ytd-channel-name a') ||
                        document.querySelector('#upload-info #channel-name a');
      if (channelEl) {
        data.channelName = channelEl.textContent.trim();
        data.channelUrl = channelEl.href;
      }

      // Subscribers
      const subEl = document.querySelector('#owner-sub-count') ||
                    document.querySelector('yt-formatted-string#owner-sub-count');
      if (subEl) {
        const subText = subEl.textContent.trim();
        data.subscriberCount = this.parseShortNumber(subText);
      }

      // Description
      const descEl = document.querySelector('#description-inline-expander') ||
                     document.querySelector('ytd-text-inline-expander #plain-snippet-text') ||
                     document.querySelector('#snippet-text');
      if (descEl) data.description = data.description || descEl.textContent.trim();

      // Tags from meta
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords && data.tags.length === 0) {
        data.tags = metaKeywords.getAttribute('content').split(',').map(t => t.trim());
      }

    } catch (e) {
      console.error('BlueFox: Error extracting video data', e);
    }

    return data;
  },

  parseShortNumber(text) {
    if (!text) return 0;
    text = text.toString().trim().toUpperCase();
    text = text.replace(/[^0-9KMBG.,]/g, '');
    
    let multiplier = 1;
    if (text.includes('B') || text.includes('G')) {
      multiplier = 1000000000;
      text = text.replace(/[BG]/g, '');
    } else if (text.includes('M')) {
      multiplier = 1000000;
      text = text.replace(/M/g, '');
    } else if (text.includes('K')) {
      multiplier = 1000;
      text = text.replace(/K/g, '');
    }
    
    text = text.replace(',', '.');
    const num = parseFloat(text);
    return Math.round((isNaN(num) ? 0 : num) * multiplier);
  },

  async getSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        resolve(response || {});
      });
    });
  },

  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'saveSettings', settings }, (response) => {
        resolve(response);
      });
    });
  }
};
