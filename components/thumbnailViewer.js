// BlueFox Stats v0.1 - Thumbnail Viewer Component

const BlueFoxThumbnailViewer = {
  async render(container, videoId) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    
    const thumbnailQualities = [
      { label: 'Max Res', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
      { label: 'SD', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
      { label: 'HQ', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
      { label: 'MQ', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
      { label: 'Default', url: `https://img.youtube.com/vi/${videoId}/default.jpg` }
    ];

    let html = `
      <div class="bf-section bf-thumbnail-section">
        <h3 class="bf-section-title">🖼️ ${t('thumbnailHistory')}</h3>
        <div class="bf-thumbnail-current">
          <h4>${t('currentThumbnail')}</h4>
          <div class="bf-thumbnail-grid">
    `;

    thumbnailQualities.forEach(thumb => {
      html += `
            <div class="bf-thumbnail-item" data-url="${thumb.url}">
              <img src="${thumb.url}" alt="${thumb.label}" loading="lazy" onerror="this.parentElement.style.display='none'" />
              <span class="bf-thumbnail-label">${thumb.label}</span>
              <button class="bf-thumb-download" data-url="${thumb.url}" data-name="thumbnail_${videoId}_${thumb.label}.jpg">⬇️</button>
            </div>
      `;
    });

    html += `
          </div>
        </div>
        <div class="bf-thumbnail-history">
          <h4>${t('previousThumbnails')}</h4>
          <div class="bf-thumbnail-history-grid" id="bf-thumb-history-grid">
            <div class="bf-loading-spinner">${t('loading')}</div>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);

    // Download buttons
    setTimeout(() => {
      container.querySelectorAll('.bf-thumb-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const url = btn.getAttribute('data-url');
          const name = btn.getAttribute('data-name');
          const a = document.createElement('a');
          a.href = url;
          a.download = name;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });

      // Thumbnail lightbox
      container.querySelectorAll('.bf-thumbnail-item img').forEach(img => {
        img.addEventListener('click', () => {
          this.showLightbox(img.src);
        });
      });
    }, 100);

    // Fetch history
    this.loadThumbnailHistory(videoId);
  },

  async loadThumbnailHistory(videoId) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    const grid = document.getElementById('bf-thumb-history-grid');
    if (!grid) return;

    try {
      const history = await BlueFoxAPI.getThumbnailHistory(videoId);
      
      if (history && history.length > 1) {
        // Remove header row
        const entries = history.slice(1);
        const uniqueTimestamps = [...new Set(entries.map(e => e[0]))];
        
        let historyHTML = '';
        const seen = new Set();

        uniqueTimestamps.forEach(ts => {
          const url = `https://web.archive.org/web/${ts}/https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
          const dateStr = ts.substring(0, 4) + '-' + ts.substring(4, 6) + '-' + ts.substring(6, 8);
          
          if (!seen.has(dateStr)) {
            seen.add(dateStr);
            historyHTML += `
              <div class="bf-thumbnail-item bf-thumb-history-item" data-url="${url}">
                <img src="${url}" alt="Thumbnail ${dateStr}" loading="lazy" onerror="this.parentElement.style.display='none'" />
                <span class="bf-thumbnail-label">${dateStr}</span>
              </div>
            `;
          }
        });

        grid.innerHTML = historyHTML || `<p class="bf-no-data">${t('noThumbnailsFound')}</p>`;
      } else {
        grid.innerHTML = `<p class="bf-no-data">${t('noThumbnailsFound')}</p>`;
      }
    } catch (e) {
      grid.innerHTML = `<p class="bf-no-data">${t('noThumbnailsFound')}</p>`;
    }

    // Add lightbox to history items
    grid.querySelectorAll('.bf-thumb-history-item img').forEach(img => {
      img.addEventListener('click', () => {
        this.showLightbox(img.src);
      });
    });
  },

  showLightbox(src) {
    const existing = document.getElementById('bf-lightbox');
    if (existing) existing.remove();

    const lightbox = document.createElement('div');
    lightbox.id = 'bf-lightbox';
    lightbox.className = 'bf-lightbox';
    lightbox.innerHTML = `
      <div class="bf-lightbox-overlay"></div>
      <div class="bf-lightbox-content">
        <img src="${src}" alt="Thumbnail" />
        <button class="bf-lightbox-close">✕</button>
      </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.querySelector('.bf-lightbox-overlay').addEventListener('click', () => lightbox.remove());
    lightbox.querySelector('.bf-lightbox-close').addEventListener('click', () => lightbox.remove());
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        lightbox.remove();
        document.removeEventListener('keydown', handler);
      }
    });
  }
};
