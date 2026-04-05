// ============================================
// BlueFox Stats v0.1 - API Manager
// ============================================

const BFApi = {
  // YouTube Data API via background script
  async youtubeRequest(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'BF_API_REQUEST',
        endpoint: endpoint,
        params: params
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'API request failed'));
        }
      });
    });
  },

  // Get video details
  async getVideoDetails(videoId) {
    // Check cache first
    const cached = BFHelpers.cache.get(`video_${videoId}`);
    if (cached) return cached;

    try {
      const data = await this.youtubeRequest('videos', {
        part: 'snippet,statistics,contentDetails,topicDetails',
        id: videoId
      });

      if (data.items && data.items.length > 0) {
        const result = data.items[0];
        BFHelpers.cache.set(`video_${videoId}`, result, 15);
        return result;
      }
      return null;
    } catch (error) {
      console.error('🦊 getVideoDetails error:', error);
      return null;
    }
  },

  // Get channel details
  async getChannelDetails(channelId) {
    const cached = BFHelpers.cache.get(`channel_${channelId}`);
    if (cached) return cached;

    try {
      const data = await this.youtubeRequest('channels', {
        part: 'snippet,statistics,brandingSettings',
        id: channelId
      });

      if (data.items && data.items.length > 0) {
        const result = data.items[0];
        BFHelpers.cache.set(`channel_${channelId}`, result, 30);
        return result;
      }
      return null;
    } catch (error) {
      console.error('🦊 getChannelDetails error:', error);
      return null;
    }
  },

  // Get channel recent videos
  async getChannelVideos(channelId, maxResults = 10) {
    try {
      // First get uploads playlist
      const channelData = await this.youtubeRequest('channels', {
        part: 'contentDetails',
        id: channelId
      });

      if (!channelData.items || !channelData.items.length) return [];

      const uploadsId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist
      const playlistData = await this.youtubeRequest('playlistItems', {
        part: 'snippet,contentDetails',
        playlistId: uploadsId,
        maxResults: maxResults
      });

      if (!playlistData.items) return [];

      // Get full video stats
      const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
      const videosData = await this.youtubeRequest('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds
      });

      return videosData.items || [];
    } catch (error) {
      console.error('🦊 getChannelVideos error:', error);
      return [];
    }
  },

  // Get dislikes from Return YouTube Dislike API
  async getDislikes(videoId) {
    const cached = BFHelpers.cache.get(`dislikes_${videoId}`);
    if (cached) return cached;

    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'BF_GET_DISLIKES',
        videoId: videoId
      }, (response) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        if (response && response.success) {
          BFHelpers.cache.set(`dislikes_${videoId}`, response.data, 30);
          resolve(response.data);
        } else {
          resolve(null);
        }
      });
    });
  },

  // Scrape data from YouTube page (no API needed)
  scrapeVideoData() {
    const data = {
      title: null,
      views: null,
      likes: null,
      channelName: null,
      channelUrl: null,
      channelAvatar: null,
      publishDate: null,
      description: null,
      tags: [],
      category: null
    };

    try {
      // Title
      const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string');
      if (titleEl) data.title = titleEl.textContent.trim();

      // Views
      const viewEl = document.querySelector('ytd-video-view-count-renderer .view-count, #info-strings yt-formatted-string');
      if (viewEl) {
        const viewText = viewEl.textContent.trim();
        const viewMatch = viewText.match(/[\d\s,.]+/);
        if (viewMatch) {
          data.views = parseInt(viewMatch[0].replace(/[\s,.]/g, ''));
        }
      }

      // Likes
      const likeBtn = document.querySelector('ytd-menu-renderer like-button-view-model button, #top-level-buttons-computed ytd-toggle-button-renderer:first-child');
      if (likeBtn) {
        const likeText = likeBtn.getAttribute('aria-label') || likeBtn.textContent;
        const likeMatch = likeText.match(/[\d\s,.]+/);
        if (likeMatch) {
          data.likes = parseInt(likeMatch[0].replace(/[\s,.]/g, ''));
        }
      }

      // Channel name
      const channelEl = document.querySelector('#owner #channel-name a, ytd-channel-name a');
      if (channelEl) {
        data.channelName = channelEl.textContent.trim();
        data.channelUrl = channelEl.href;
      }

      // Channel avatar
      const avatarEl = document.querySelector('#owner img#img, ytd-video-owner-renderer img');
      if (avatarEl) data.channelAvatar = avatarEl.src;

      // Date from meta
      const dateEl = document.querySelector('#info-strings yt-formatted-string');
      if (dateEl) data.publishDate = dateEl.textContent.trim();

      // Description
      const descEl = document.querySelector('#description-inline-expander yt-formatted-string, #description yt-formatted-string');
      if (descEl) data.description = descEl.textContent.trim();

      // Tags from meta
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        data.tags = metaKeywords.content.split(',').map(t => t.trim()).filter(t => t);
      }

    } catch (error) {
      console.error('🦊 Scrape error:', error);
    }

    return data;
  },

  // Get all thumbnail URLs for a video
  getThumbnailUrls(videoId) {
    return {
      default: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      medium: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      high: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      standard: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
      maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      // Alternative thumbnails (0, 1, 2, 3)
      thumb0: `https://i.ytimg.com/vi/${videoId}/0.jpg`,
      thumb1: `https://i.ytimg.com/vi/${videoId}/1.jpg`,
      thumb2: `https://i.ytimg.com/vi/${videoId}/2.jpg`,
      thumb3: `https://i.ytimg.com/vi/${videoId}/3.jpg`,
      // WebP versions
      webpDefault: `https://i.ytimg.com/vi_webp/${videoId}/mqdefault.webp`,
      webpMax: `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`
    };
  }
};

// Make available globally
window.BFApi = BFApi;
