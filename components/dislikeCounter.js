// BlueFox Stats v0.1 - Dislike Counter Component

const BlueFoxDislikeCounter = {
  async render(videoId) {
    const data = await BlueFoxAPI.getDislikeData(videoId);
    if (!data) return;

    this.injectDislikeCount(data);
    return data;
  },

  injectDislikeCount(data) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    
    // Try to find the dislike button
    const dislikeBtn = document.querySelector('#segmented-dislike-button button') ||
                       document.querySelector('dislike-button-view-model button') ||
                       document.querySelector('ytd-toggle-button-renderer:nth-child(2) button');

    if (dislikeBtn) {
      // Check if already injected
      if (dislikeBtn.querySelector('.bf-dislike-count')) return;

      const textContainer = dislikeBtn.querySelector('.yt-spec-button-shape-next__button-text-content') ||
                           dislikeBtn.querySelector('span[role="text"]');
      
      if (textContainer) {
        textContainer.textContent = BlueFoxHelpers.formatNumber(data.dislikes);
        textContainer.classList.add('bf-dislike-count');
      } else {
        const span = document.createElement('span');
        span.className = 'bf-dislike-count';
        span.textContent = ' ' + BlueFoxHelpers.formatNumber(data.dislikes);
        span.style.cssText = 'margin-left:4px;font-size:12px;';
        dislikeBtn.appendChild(span);
      }
    }

    // Also inject in our panel
    const likeRatioBar = document.getElementById('bf-like-ratio-bar');
    if (likeRatioBar && data.likes && data.dislikes) {
      const ratio = (data.likes / (data.likes + data.dislikes)) * 100;
      likeRatioBar.style.width = ratio + '%';
    }
  }
};
