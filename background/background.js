// ============================================
// BlueFox Stats v0.1 - Background Service Worker
// ============================================

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🦊 BlueFox Stats installed!', details.reason);

  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      bfLanguage: 'fr',
      bfAutoShow: true,
      bfShowDislikes: true,
      bfDarkMode: true,
      bfPanelPosition: 'sidebar',
      bfApiKey: '',
      bfInstallDate: Date.now()
    });

    // Open welcome page (optional)
    // chrome.tabs.create({ url: 'welcome.html' });
  }

  if (details.reason === 'update') {
    console.log('🦊 BlueFox Stats updated to v0.1');
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BF_API_REQUEST') {
    handleApiRequest(message, sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'BF_GET_SETTINGS') {
    chrome.storage.sync.get(null, (data) => {
      sendResponse({ success: true, data: data });
    });
    return true;
  }

  if (message.type === 'BF_SAVE_SETTING') {
    const saveData = {};
    saveData[message.key] = message.value;
    chrome.storage.sync.set(saveData, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle YouTube API requests (to avoid CORS)
async function handleApiRequest(message, sendResponse) {
  try {
    const { endpoint, params } = message;

    // Validate request
    if (!endpoint || typeof endpoint !== 'string') {
      sendResponse({
        success: false,
        error: 'Invalid endpoint',
        code: 'INVALID_REQUEST'
      });
      return;
    }

    // Get API key
    const data = await chrome.storage.sync.get(['bfApiKey']);
    const apiKey = data.bfApiKey;

    if (!apiKey) {
      sendResponse({
        success: false,
        error: 'No API key configured',
        code: 'NO_API_KEY'
      });
      return;
    }

    // Build URL with validation
    const baseUrl = 'https://www.googleapis.com/youtube/v3';
    
    try {
      const url = new URL(`${baseUrl}/${endpoint}`);
      
      // Add params with validation
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(key => {
          if (key && params[key] != null) {
            url.searchParams.append(key, params[key]);
          }
        });
      }
      url.searchParams.append('key', apiKey);

      // Fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🦊 API Error Response:', errorData);
        sendResponse({
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}`,
          code: `HTTP_${response.status}`,
          details: errorData
        });
        return;
      }

      const responseData = await response.json();
      
      // Validate response data
      if (!responseData) {
        sendResponse({
          success: false,
          error: 'Empty response from API',
          code: 'EMPTY_RESPONSE'
        });
        return;
      }

      sendResponse({
        success: true,
        data: responseData
      });

    } catch (urlError) {
      console.error('🦊 URL/Parse error:', urlError);
      sendResponse({
        success: false,
        error: 'Failed to process request',
        code: 'PARSE_ERROR'
      });
    }

  } catch (error) {
    console.error('🦊 API Request error:', error);
    sendResponse({
      success: false,
      error: error.message || 'Unknown error',
      code: error.name || 'UNKNOWN_ERROR'
    });
  }
}

// Return Dislike API (free, no key needed)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BF_GET_DISLIKES') {
    fetchDislikes(message.videoId, sendResponse);
    return true;
  }
});

async function fetchDislikes(videoId, sendResponse) {
  try {
    const response = await fetch(
      `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`
    );

    if (!response.ok) {
      sendResponse({ success: false, error: 'Failed to fetch dislikes' });
      return;
    }

    const data = await response.json();
    sendResponse({
      success: true,
      data: {
        likes: data.likes,
        dislikes: data.dislikes,
        rating: data.rating,
        viewCount: data.viewCount
      }
    });
  } catch (error) {
    console.error('🦊 Dislikes fetch error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Context menu (right-click)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'bluefox-analyze',
    title: '🦊 Analyser avec BlueFox Stats',
    contexts: ['link'],
    documentUrlPatterns: ['*://*.youtube.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'bluefox-analyze') {
    const url = info.linkUrl;
    if (url && url.includes('youtube.com/watch')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'BF_ANALYZE_URL',
        url: url
      });
    }
  }
});

// Badge update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('youtube.com/watch')) {
      chrome.action.setBadgeText({ text: 'ON', tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6', tabId: tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: tabId });
    }
  }
});
