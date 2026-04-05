// BlueFox Stats v0.1 - SEO Analyzer Component

const BlueFoxSEOAnalyzer = {
  render(container, videoData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);
    const analysis = this.analyze(videoData);

    let html = `
      <div class="bf-section bf-seo-section">
        <h3 class="bf-section-title">🔍 ${t('seoScore')}</h3>
        
        <!-- Overall SEO Score -->
        <div class="bf-seo-overall">
          <div class="bf-seo-donut">
            <svg viewBox="0 0 36 36" class="bf-donut-chart">
              <path class="bf-donut-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2a3e" stroke-width="3" />
              <path class="bf-donut-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${analysis.overallColor}" stroke-width="3" stroke-dasharray="${analysis.overallScore}, 100" stroke-linecap="round" />
            </svg>
            <div class="bf-donut-center">
              <span class="bf-donut-value" style="color: ${analysis.overallColor}">${analysis.overallScore}</span>
              <span class="bf-donut-label">/100</span>
            </div>
          </div>
          <span class="bf-seo-overall-text" style="color: ${analysis.overallColor}">${analysis.overallLabel}</span>
        </div>

        <!-- Title Analysis -->
        <div class="bf-seo-category">
          <div class="bf-seo-cat-header">
            <span>✏️ ${t('titleAnalysis')}</span>
            <span class="bf-seo-cat-score" style="color: ${analysis.title.color}">${analysis.title.score}/100</span>
          </div>
          <div class="bf-seo-bar">
            <div class="bf-seo-bar-fill" style="width: ${analysis.title.score}%; background: ${analysis.title.color}"></div>
          </div>
          <ul class="bf-seo-tips">
            ${analysis.title.tips.map(tip => `<li class="${tip.type}">${tip.icon} ${tip.text}</li>`).join('')}
          </ul>
          <div class="bf-seo-detail">
            <span>${t('titleLength')}: <strong>${analysis.title.length} ${t('characters')}</strong></span>
          </div>
        </div>

        <!-- Description Analysis -->
        <div class="bf-seo-category">
          <div class="bf-seo-cat-header">
            <span>📝 ${t('descriptionAnalysis')}</span>
            <span class="bf-seo-cat-score" style="color: ${analysis.description.color}">${analysis.description.score}/100</span>
          </div>
          <div class="bf-seo-bar">
            <div class="bf-seo-bar-fill" style="width: ${analysis.description.score}%; background: ${analysis.description.color}"></div>
          </div>
          <ul class="bf-seo-tips">
            ${analysis.description.tips.map(tip => `<li class="${tip.type}">${tip.icon} ${tip.text}</li>`).join('')}
          </ul>
          <div class="bf-seo-detail">
            <span>${t('descriptionLength')}: <strong>${analysis.description.length} ${t('characters')}</strong></span>
            <span>${t('hasTimestamps')}: <strong>${analysis.description.hasTimestamps ? '✅ ' + t('yes') : '❌ ' + t('no')}</strong></span>
            <span>${t('hasLinks')}: <strong>${analysis.description.hasLinks ? '✅ ' + t('yes') : '❌ ' + t('no')}</strong></span>
          </div>
        </div>

        <!-- Tags Analysis -->
        <div class="bf-seo-category">
          <div class="bf-seo-cat-header">
            <span>🏷️ ${t('tagsAnalysis')}</span>
            <span class="bf-seo-cat-score" style="color: ${analysis.tags.color}">${analysis.tags.score}/100</span>
          </div>
          <div class="bf-seo-bar">
            <div class="bf-seo-bar-fill" style="width: ${analysis.tags.score}%; background: ${analysis.tags.color}"></div>
          </div>
          <ul class="bf-seo-tips">
            ${analysis.tags.tips.map(tip => `<li class="${tip.type}">${tip.icon} ${tip.text}</li>`).join('')}
          </ul>
          ${analysis.tags.list.length > 0 ? `
          <div class="bf-tags-cloud">
            ${analysis.tags.list.map(tag => `<span class="bf-tag-item">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </div>

        <!-- Hashtag Analysis -->
        <div class="bf-seo-category">
          <div class="bf-seo-cat-header">
            <span>#️⃣ ${t('hashtagAnalysis')}</span>
            <span class="bf-seo-cat-score" style="color: ${analysis.hashtags.color}">${analysis.hashtags.score}/100</span>
          </div>
          <div class="bf-seo-bar">
            <div class="bf-seo-bar-fill" style="width: ${analysis.hashtags.score}%; background: ${analysis.hashtags.color}"></div>
          </div>
          <ul class="bf-seo-tips">
            ${analysis.hashtags.tips.map(tip => `<li class="${tip.type}">${tip.icon} ${tip.text}</li>`).join('')}
          </ul>
          ${analysis.hashtags.found.length > 0 ? `
          <div class="bf-tags-cloud">
            ${analysis.hashtags.found.map(tag => `<span class="bf-tag-item bf-hashtag">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
  },

  analyze(videoData) {
    const lang = BlueFoxI18n.getLanguage();
    const title = videoData.title || '';
    const description = videoData.description || '';
    const tags = videoData.tags || [];

    // Title Analysis
    const titleAnalysis = this.analyzeTitle(title, lang);
    
    // Description Analysis
    const descAnalysis = this.analyzeDescription(description, lang);
    
    // Tags Analysis
    const tagsAnalysis = this.analyzeTags(tags, title, lang);
    
    // Hashtags Analysis
    const hashtagAnalysis = this.analyzeHashtags(title, description, lang);

    // Overall score
    const overallScore = Math.round(
      (titleAnalysis.score * 0.3) +
      (descAnalysis.score * 0.3) +
      (tagsAnalysis.score * 0.25) +
      (hashtagAnalysis.score * 0.15)
    );

    return {
      overallScore,
      overallColor: this.getColor(overallScore),
      overallLabel: this.getLabel(overallScore, lang),
      title: titleAnalysis,
      description: descAnalysis,
      tags: tagsAnalysis,
      hashtags: hashtagAnalysis
    };
  },

  analyzeTitle(title, lang) {
    const tips = [];
    let score = 50;
    const length = title.length;

    if (length >= 40 && length <= 70) {
      score += 20;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Longueur optimale (40-70 chars)' : 'Optimal length (40-70 chars)' });
    } else if (length < 40) {
      score += 5;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Titre trop court, visez 40-70 caractères' : 'Title too short, aim for 40-70 characters' });
    } else {
      score += 10;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Titre trop long, risque de coupure' : 'Title too long, may get truncated' });
    }

    // Check for numbers
    if (/\d/.test(title)) {
      score += 10;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient des chiffres (attire l\'attention)' : 'Contains numbers (eye-catching)' });
    } else {
      tips.push({ type: 'info', icon: '💡', text: lang === 'fr' ? 'Ajoutez des chiffres pour plus d\'impact' : 'Add numbers for more impact' });
    }

    // Check for emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(title)) {
      score += 5;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient des emojis (bon CTR)' : 'Contains emojis (good CTR)' });
    }

    // Check for power words
    const powerWordsFr = ['incroyable', 'secret', 'meilleur', 'comment', 'pourquoi', 'top', 'astuce', 'tuto', 'facile', 'rapide', 'gratuit', 'nouveau'];
    const powerWordsEn = ['amazing', 'secret', 'best', 'how to', 'why', 'top', 'hack', 'tutorial', 'easy', 'fast', 'free', 'new', 'ultimate'];
    const powerWords = lang === 'fr' ? powerWordsFr : powerWordsEn;
    const titleLower = title.toLowerCase();
    const foundPower = powerWords.filter(w => titleLower.includes(w));

    if (foundPower.length > 0) {
      score += 10;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? `Mots-clés puissants détectés: ${foundPower.join(', ')}` : `Power words found: ${foundPower.join(', ')}` });
    } else {
      tips.push({ type: 'info', icon: '💡', text: lang === 'fr' ? 'Ajoutez des mots-clés accrocheurs' : 'Add power words for better engagement' });
    }

    // Check for CAPS
    const capsRatio = (title.replace(/[^A-Z]/g, '').length) / Math.max(title.replace(/[^a-zA-Z]/g, '').length, 1);
    if (capsRatio > 0.5) {
      score -= 10;
      tips.push({ type: 'error', icon: '❌', text: lang === 'fr' ? 'Trop de majuscules (spam-like)' : 'Too many caps (looks spammy)' });
    }

    // Check for brackets
    if (/[\[\(]/.test(title)) {
      score += 5;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Utilise des crochets/parenthèses (bon pour le CTR)' : 'Uses brackets (good for CTR)' });
    }

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      length,
      color: this.getColor(score),
      tips
    };
  },

  analyzeDescription(description, lang) {
    const tips = [];
    let score = 30;
    const length = description.length;

    const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
    const hasLinks = /https?:\/\//.test(description);
    const hasHashtags = /#\w+/.test(description);

    if (length >= 200) {
      score += 25;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Description suffisamment longue' : 'Description long enough' });
    } else if (length >= 100) {
      score += 15;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Description correcte, mais pourrait être plus longue' : 'Description okay, but could be longer' });
    } else {
      tips.push({ type: 'error', icon: '❌', text: lang === 'fr' ? 'Description trop courte (min 200 chars)' : 'Description too short (min 200 chars)' });
    }

    if (hasTimestamps) {
      score += 15;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient des timestamps (excellent!)' : 'Contains timestamps (excellent!)' });
    } else {
      tips.push({ type: 'info', icon: '💡', text: lang === 'fr' ? 'Ajoutez des timestamps pour la navigation' : 'Add timestamps for navigation' });
    }

    if (hasLinks) {
      score += 10;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient des liens' : 'Contains links' });
    }

    if (hasHashtags) {
      score += 10;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient des hashtags' : 'Contains hashtags' });
    } else {
      tips.push({ type: 'info', icon: '💡', text: lang === 'fr' ? 'Ajoutez des #hashtags pertinents' : 'Add relevant #hashtags' });
    }

    // Check for call to action
    const ctaFr = ['abonne', 'like', 'commentaire', 'partage', 'clique', 'lien'];
    const ctaEn = ['subscribe', 'like', 'comment', 'share', 'click', 'link'];
    const ctaWords = lang === 'fr' ? ctaFr : ctaEn;
    const descLower = description.toLowerCase();
    const hasCTA = ctaWords.some(w => descLower.includes(w));

    if (hasCTA) {
      score += 10;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Contient un appel à l\'action' : 'Contains call to action' });
    } else {
      tips.push({ type: 'info', icon: '💡', text: lang === 'fr' ? 'Ajoutez un appel à l\'action (abonnez-vous, likez...)' : 'Add a call to action (subscribe, like...)' });
    }

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      length,
      hasTimestamps,
      hasLinks,
      color: this.getColor(score),
      tips
    };
  },

  analyzeTags(tags, title, lang) {
    const tips = [];
    let score = 20;
    const count = tags.length;

    if (count >= 10 && count <= 30) {
      score += 30;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? `${count} tags (quantité optimale)` : `${count} tags (optimal amount)` });
    } else if (count > 0 && count < 10) {
      score += 15;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? `Seulement ${count} tags, ajoutez-en plus (10-30)` : `Only ${count} tags, add more (10-30)` });
    } else if (count === 0) {
      tips.push({ type: 'error', icon: '❌', text: lang === 'fr' ? 'Aucun tag trouvé!' : 'No tags found!' });
    } else {
      score += 20;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Trop de tags peuvent diluer le SEO' : 'Too many tags can dilute SEO' });
    }

    // Check if tags match title
    if (count > 0) {
      const titleWords = title.toLowerCase().split(/\s+/);
      const matchingTags = tags.filter(tag => 
        titleWords.some(word => tag.toLowerCase().includes(word) && word.length > 3)
      );

      if (matchingTags.length > 0) {
        score += 20;
        tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Tags cohérents avec le titre' : 'Tags consistent with title' });
      } else {
        tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Tags pas assez liés au titre' : 'Tags not related enough to title' });
      }

      // Check tag length variety
      const shortTags = tags.filter(t => t.length <= 10).length;
      const longTags = tags.filter(t => t.length > 10).length;

      if (shortTags > 0 && longTags > 0) {
        score += 10;
        tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Bon mix de tags courts et longs' : 'Good mix of short and long tags' });
      }
    }

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      count,
      list: tags.slice(0, 20),
      color: this.getColor(score),
      tips
    };
  },

  analyzeHashtags(title, description, lang) {
    const tips = [];
    let score = 30;
    const fullText = title + ' ' + description;
    const hashtags = fullText.match(/#\w+/g) || [];
    const found = [...new Set(hashtags)];

    if (found.length >= 3 && found.length <= 15) {
      score += 40;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? `${found.length} hashtags (quantité idéale)` : `${found.length} hashtags (ideal amount)` });
    } else if (found.length > 0 && found.length < 3) {
      score += 20;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Ajoutez plus de hashtags (3-15)' : 'Add more hashtags (3-15)' });
    } else if (found.length === 0) {
      tips.push({ type: 'error', icon: '❌', text: lang === 'fr' ? 'Aucun hashtag trouvé' : 'No hashtags found' });
    } else {
      score += 25;
      tips.push({ type: 'warning', icon: '⚠️', text: lang === 'fr' ? 'Trop de hashtags' : 'Too many hashtags' });
    }

    // Check if hashtags in title (first 3 appear above title)
    const titleHashtags = (title.match(/#\w+/g) || []);
    if (titleHashtags.length > 0 && titleHashtags.length <= 3) {
      score += 15;
      tips.push({ type: 'success', icon: '✅', text: lang === 'fr' ? 'Hashtags dans le titre (visible au-dessus)' : 'Hashtags in title (visible above)' });
    }

    score = Math.min(100, Math.max(0, score));

    return {
      score,
      found,
      color: this.getColor(score),
      tips
    };
  },

  getColor(score) {
    if (score >= 80) return '#00e676';
    if (score >= 60) return '#4caf50';
    if (score >= 40) return '#ffc107';
    if (score >= 20) return '#ff9800';
    return '#f44336';
  },

  getLabel(score, lang) {
    if (score >= 80) return lang === 'fr' ? '🔥 Excellent' : '🔥 Excellent';
    if (score >= 60) return lang === 'fr' ? '✨ Bon' : '✨ Good';
    if (score >= 40) return lang === 'fr' ? '👌 Moyen' : '👌 Average';
    if (score >= 20) return lang === 'fr' ? '📈 À améliorer' : '📈 Needs work';
    return lang === 'fr' ? '⚠️ Faible' : '⚠️ Poor';
  }
};
