// BlueFox Stats v0.1 - Views Graph Component

const BlueFoxViewsGraph = {
  render(container, viewsData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    
    if (!viewsData || viewsData.length === 0) return;

    const maxViews = Math.max(...viewsData.map(d => d.views));
    const graphHeight = 150;
    const graphWidth = 100; // percentage

    let html = `
      <div class="bf-section bf-graph-section">
        <h3 class="bf-section-title">📈 ${t('viewsGraph')}</h3>
        <div class="bf-graph-container">
          <div class="bf-graph-y-axis">
            <span>${BlueFoxHelpers.formatNumber(maxViews)}</span>
            <span>${BlueFoxHelpers.formatNumber(Math.round(maxViews * 0.5))}</span>
            <span>0</span>
          </div>
          <div class="bf-graph-area">
            <svg viewBox="0 0 ${viewsData.length * 30} ${graphHeight}" class="bf-graph-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bf-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#1e88e5;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#1e88e5;stop-opacity:0.05" />
                </linearGradient>
              </defs>
    `;

    // Build path for area
    let areaPath = `M 0 ${graphHeight}`;
    let linePath = 'M ';
    
    viewsData.forEach((point, i) => {
      const x = (i / (viewsData.length - 1)) * (viewsData.length * 30 - 10);
      const y = graphHeight - (point.views / maxViews) * (graphHeight - 10);
      
      if (i === 0) {
        linePath += `${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }
    });

    areaPath += ` L ${(viewsData.length - 1) / (viewsData.length - 1) * (viewsData.length * 30 - 10)} ${graphHeight} Z`;

    html += `
              <path d="${areaPath}" fill="url(#bf-gradient)" />
              <path d="${linePath}" fill="none" stroke="#1e88e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    `;

    // Data points
    viewsData.forEach((point, i) => {
      const x = (i / (viewsData.length - 1)) * (viewsData.length * 30 - 10);
      const y = graphHeight - (point.views / maxViews) * (graphHeight - 10);
      html += `<circle cx="${x}" cy="${y}" r="3" fill="#1e88e5" stroke="#fff" stroke-width="1.5" class="bf-graph-point" data-views="${BlueFoxHelpers.formatNumber(point.views)}" data-date="${point.date}" />`;
    });

    html += `
            </svg>
            <div class="bf-graph-tooltip" id="bf-graph-tooltip"></div>
          </div>
          <div class="bf-graph-x-axis">
    `;

    // Show some x-axis labels
    const step = Math.max(1, Math.floor(viewsData.length / 5));
    viewsData.forEach((point, i) => {
      if (i % step === 0 || i === viewsData.length - 1) {
        html += `<span>${point.date}</span>`;
      }
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);

    // Add tooltip behavior
    setTimeout(() => {
      const points = container.querySelectorAll('.bf-graph-point');
      const tooltip = container.querySelector('#bf-graph-tooltip');
      
      points.forEach(point => {
        point.addEventListener('mouseenter', (e) => {
          const views = point.getAttribute('data-views');
          const date = point.getAttribute('data-date');
          tooltip.innerHTML = `<strong>${date}</strong><br/>${views} ${t('views').toLowerCase()}`;
          tooltip.style.display = 'block';
          tooltip.style.opacity = '1';
        });
        point.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
          tooltip.style.opacity = '0';
        });
      });
    }, 100);
  }
};
