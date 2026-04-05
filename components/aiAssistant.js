// BlueFox Stats v0.1 - AI Assistant Component

const BlueFoxAIAssistant = {
  conversationHistory: [],

  render(container, videoData) {
    const t = BlueFoxI18n.t.bind(BlueFoxI18n);

    let html = `
      <div class="bf-section bf-ai-section">
        <h3 class="bf-section-title">🤖 ${t('aiAssistant')}</h3>
        
        <div class="bf-ai-chat" id="bf-ai-chat">
          <div class="bf-ai-message bf-ai-bot">
            <div class="bf-ai-avatar">🦊</div>
            <div class="bf-ai-bubble">${t('aiWelcome')}</div>
          </div>
        </div>

        <div class="bf-ai-quick-actions">
          <button class="bf-ai-quick-btn" data-question="optimize_title">✏️ ${BlueFoxI18n.getLanguage() === 'fr' ? 'Optimiser le titre' : 'Optimize title'}</button>
          <button class="bf-ai-quick-btn" data-question="improve_description">📝 ${BlueFoxI18n.getLanguage() === 'fr' ? 'Améliorer la description' : 'Improve description'}</button>
          <button class="bf-ai-quick-btn" data-question="thumbnail_tips">🖼️ ${BlueFoxI18n.getLanguage() === 'fr' ? 'Conseils miniature' : 'Thumbnail tips'}</button>
          <button class="bf-ai-quick-btn" data-question="grow_channel">📈 ${BlueFoxI18n.getLanguage() === 'fr' ? 'Percer sur YouTube' : 'Grow on YouTube'}</button>
          <button class="bf-ai-quick-btn" data-question="shorts_tips">📱 ${BlueFoxI18n.getLanguage() === 'fr' ? 'Tips pour Shorts' : 'Shorts tips'}</button>
          <button class="bf-ai-quick-btn" data-question="viral_tips">🔥 ${BlueFoxI18n.getLanguage() === 'fr' ? 'Devenir viral' : 'Go viral'}</button>
          <button class="bf-ai-quick-btn" data-question="seo_tips">🔍 ${BlueFoxI18n.getLanguage() === 'fr' ? 'SEO YouTube' : 'YouTube SEO'}</button>
          <button class="bf-ai-quick-btn" data-question="monetization">💰 ${BlueFoxI18n.getLanguage() === 'fr' ? 'Monétisation' : 'Monetization'}</button>
        </div>

        <div class="bf-ai-input-container">
          <input type="text" id="bf-ai-input" class="bf-ai-input" placeholder="${t('aiPlaceholder')}" />
          <button id="bf-ai-send" class="bf-ai-send-btn">${t('aiSend')} 🚀</button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);

    setTimeout(() => {
      const input = document.getElementById('bf-ai-input');
      const sendBtn = document.getElementById('bf-ai-send');
      const chat = document.getElementById('bf-ai-chat');

      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const question = input.value.trim();
          if (question) {
            this.handleQuestion(question, videoData, chat);
            input.value = '';
          }
        });
      }

      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const question = input.value.trim();
            if (question) {
              this.handleQuestion(question, videoData, chat);
              input.value = '';
            }
          }
        });
      }

      // Quick action buttons
      container.querySelectorAll('.bf-ai-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const questionType = btn.getAttribute('data-question');
          const question = btn.textContent.trim();
          this.handleQuestion(questionType, videoData, chat, question);
        });
      });
    }, 100);
  },

  handleQuestion(questionType, videoData, chatEl, displayQuestion) {
    const lang = BlueFoxI18n.getLanguage();
    const question = displayQuestion || questionType;

    // Add user message
    this.addMessage(chatEl, question, 'user');

    // Show typing indicator
    const typingId = this.showTyping(chatEl);

    // Generate response
    setTimeout(() => {
      this.removeTyping(typingId);
      const response = this.generateResponse(questionType, videoData, lang);
      this.addMessage(chatEl, response, 'bot');
    }, 800 + Math.random() * 1200);
  },

  addMessage(chatEl, text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `bf-ai-message bf-ai-${sender}`;

    if (sender === 'user') {
      msgDiv.innerHTML = `
        <div class="bf-ai-bubble">${this.escapeHtml(text)}</div>
        <div class="bf-ai-avatar">👤</div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="bf-ai-avatar">🦊</div>
        <div class="bf-ai-bubble">${text}</div>
      `;
    }

    chatEl.appendChild(msgDiv);
    chatEl.scrollTop = chatEl.scrollHeight;
  },

  showTyping(chatEl) {
    const id = 'bf-typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'bf-ai-message bf-ai-bot bf-ai-typing';
    typingDiv.innerHTML = `
      <div class="bf-ai-avatar">🦊</div>
      <div class="bf-ai-bubble">
        <div class="bf-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatEl.appendChild(typingDiv);
    chatEl.scrollTop = chatEl.scrollHeight;
    return id;
  },

  removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  generateResponse(questionType, videoData, lang) {
    const title = videoData.title || '';
    const views = videoData.views || 0;
    const likes = videoData.likes || 0;
    const subs = videoData.subscriberCount || 0;

    const responses = {
      optimize_title: {
        fr: `📊 <strong>Analyse du titre actuel :</strong> "${title}"

<br/><br/>🔧 <strong>Suggestions d'amélioration :</strong>
<br/>• ${title.length < 40 ? '⚠️ Votre titre est trop court. Visez 40-70 caractères.' : title.length > 70 ? '⚠️ Votre titre est trop long. Risque d\'être coupé.' : '✅ Longueur correcte.'}
<br/>• ${/\d/.test(title) ? '✅ Contient des chiffres (bien!)' : '💡 Ajoutez des chiffres : "Top 5...", "En 3 étapes..."'}
<br/>• 💡 Utilisez des mots-clés puissants : "Comment", "Pourquoi", "Secret", "Incroyable"
<br/>• 💡 Ajoutez des crochets : [TUTO], [2024], [FR]
<br/>• 💡 Créez de la curiosité : "Vous ne devinerez jamais..."
<br/><br/>✏️ <strong>Exemples de titres optimisés :</strong>
<br/>• "${title} [GUIDE COMPLET 2024]"
<br/>• "Comment ${title.toLowerCase()} (Méthode Secrète)"
<br/>• "${title} - 5 Astuces que Personne ne Connaît"`,

        en: `📊 <strong>Current title analysis:</strong> "${title}"

<br/><br/>🔧 <strong>Improvement suggestions:</strong>
<br/>• ${title.length < 40 ? '⚠️ Your title is too short. Aim for 40-70 characters.' : title.length > 70 ? '⚠️ Your title is too long. May get cut off.' : '✅ Good length.'}
<br/>• ${/\d/.test(title) ? '✅ Contains numbers (good!)' : '💡 Add numbers: "Top 5...", "In 3 Steps..."'}
<br/>• 💡 Use power words: "How to", "Why", "Secret", "Amazing"
<br/>• 💡 Add brackets: [TUTORIAL], [2024], [GUIDE]
<br/>• 💡 Create curiosity: "You Won't Believe..."
<br/><br/>✏️ <strong>Optimized title examples:</strong>
<br/>• "${title} [COMPLETE GUIDE 2024]"
<br/>• "How to ${title.toLowerCase()} (Secret Method)"
<br/>• "${title} - 5 Tips Nobody Knows"`
      },

      improve_description: {
        fr: `📝 <strong>Conseils pour une description parfaite :</strong>

<br/><br/>📌 <strong>Structure idéale :</strong>
<br/>1️⃣ <strong>Ligne 1-2 :</strong> Résumé accrocheur avec mots-clés principaux
<br/>2️⃣ <strong>Ligne 3-5 :</strong> Description détaillée du contenu
<br/>3️⃣ <strong>Timestamps :</strong> Ajoutez des chapitres (00:00 Introduction, etc.)
<br/>4️⃣ <strong>Liens :</strong> Réseaux sociaux, site web, affiliations
<br/>5️⃣ <strong>Hashtags :</strong> 3 à 5 hashtags pertinents
<br/>6️⃣ <strong>Call to Action :</strong> "Abonnez-vous", "Likez si..."

<br/><br/>💡 <strong>Astuces pro :</strong>
<br/>• Les 2 premières lignes sont cruciales (visibles sans cliquer)
<br/>• Minimum 250 mots pour un bon SEO
<br/>• Répétez vos mots-clés naturellement 2-3 fois
<br/>• Incluez des questions fréquentes
<br/>• Ajoutez des émojis pour structurer visuellement`,

        en: `📝 <strong>Tips for a perfect description:</strong>

<br/><br/>📌 <strong>Ideal structure:</strong>
<br/>1️⃣ <strong>Line 1-2:</strong> Catchy summary with main keywords
<br/>2️⃣ <strong>Line 3-5:</strong> Detailed content description
<br/>3️⃣ <strong>Timestamps:</strong> Add chapters (00:00 Introduction, etc.)
<br/>4️⃣ <strong>Links:</strong> Social media, website, affiliations
<br/>5️⃣ <strong>Hashtags:</strong> 3 to 5 relevant hashtags
<br/>6️⃣ <strong>Call to Action:</strong> "Subscribe", "Like if..."

<br/><br/>💡 <strong>Pro tips:</strong>
<br/>• First 2 lines are crucial (visible without clicking)
<br/>• Minimum 250 words for good SEO
<br/>• Repeat keywords naturally 2-3 times
<br/>• Include frequently asked questions
<br/>• Add emojis for visual structure`
      },

      thumbnail_tips: {
        fr: `🖼️ <strong>Secrets des miniatures qui cartonnent :</strong>

<br/><br/>🎨 <strong>Design :</strong>
<br/>• 📐 Résolution : 1280x720 minimum (16:9)
<br/>• 🔤 Texte GROS et LISIBLE (max 5-6 mots)
<br/>• 🎨 Couleurs vives et contrastées (jaune, rouge, bleu)
<br/>• 😮 Visage expressif en gros plan (augmente le CTR de 30%)
<br/>• 🚫 Évitez le clickbait trompeur

<br/><br/>🔥 <strong>Techniques avancées :</strong>
<br/>• Utilisez la règle des tiers
<br/>• Ajoutez un contour autour du sujet principal
<br/>• Flèches et cercles pour attirer l'attention
<br/>• Testez 3-4 miniatures et changez si le CTR est faible
<br/>• Gardez un style cohérent pour votre chaîne

<br/><br/>📊 <strong>CTR moyen par type :</strong>
<br/>• Visage + texte : 8-12%
<br/>• Texte seul : 4-6%
<br/>• Image seule : 3-5%`,

        en: `🖼️ <strong>Thumbnail secrets that crush it:</strong>

<br/><br/>🎨 <strong>Design:</strong>
<br/>• 📐 Resolution: 1280x720 minimum (16:9)
<br/>• 🔤 BIG and READABLE text (max 5-6 words)
<br/>• 🎨 Bright, contrasting colors (yellow, red, blue)
<br/>• 😮 Expressive face close-up (increases CTR by 30%)
<br/>• 🚫 Avoid misleading clickbait

<br/><br/>🔥 <strong>Advanced techniques:</strong>
<br/>• Use the rule of thirds
<br/>• Add outline around main subject
<br/>• Arrows and circles to draw attention
<br/>• Test 3-4 thumbnails and change if CTR is low
<br/>• Keep consistent style for your channel

<br/><br/>📊 <strong>Average CTR by type:</strong>
<br/>• Face + text: 8-12%
<br/>• Text only: 4-6%
<br/>• Image only: 3-5%`
      },

      grow_channel: {
        fr: `📈 <strong>Guide complet pour percer sur YouTube :</strong>

<br/><br/>🚀 <strong>Les 10 règles d'or :</strong>
<br/>1️⃣ <strong>Niche :</strong> Choisissez UN sujet précis au début
<br/>2️⃣ <strong>Régularité :</strong> Minimum 2-3 vidéos/semaine
<br/>3️⃣ <strong>Les 48h :</strong> Les premières 48h sont cruciales pour l'algo
<br/>4️⃣ <strong>Rétention :</strong> Hook dans les 30 premières secondes
<br/>5️⃣ <strong>SEO :</strong> Titre, description, tags optimisés
<br/>6️⃣ <strong>Miniatures :</strong> Passez 30min+ sur chaque miniature
<br/>7️⃣ <strong>Communauté :</strong> Répondez à TOUS les commentaires
<br/>8️⃣ <strong>Tendances :</strong> Surfez sur les sujets tendance
<br/>9️⃣ <strong>Shorts :</strong> 1-2 Shorts/jour pour la croissance
<br/>🔟 <strong>Collaboration :</strong> Collab avec des créateurs similaires

<br/><br/>📊 <strong>Objectifs réalistes :</strong>
<br/>• 0-1000 abonnés : 3-6 mois
<br/>• 1000-10K : 6-12 mois
<br/>• 10K-100K : 1-2 ans
<br/>• Monétisation : 1000 abonnés + 4000h de visionnage`,

        en: `📈 <strong>Complete guide to grow on YouTube:</strong>

<br/><br/>🚀 <strong>The 10 golden rules:</strong>
<br/>1️⃣ <strong>Niche:</strong> Choose ONE specific topic at start
<br/>2️⃣ <strong>Consistency:</strong> Minimum 2-3 videos/week
<br/>3️⃣ <strong>The 48h:</strong> First 48 hours are crucial for the algo
<br/>4️⃣ <strong>Retention:</strong> Hook in the first 30 seconds
<br/>5️⃣ <strong>SEO:</strong> Optimized title, description, tags
<br/>6️⃣ <strong>Thumbnails:</strong> Spend 30min+ on each thumbnail
<br/>7️⃣ <strong>Community:</strong> Reply to ALL comments
<br/>8️⃣ <strong>Trends:</strong> Ride trending topics
<br/>9️⃣ <strong>Shorts:</strong> 1-2 Shorts/day for growth
<br/>🔟 <strong>Collaboration:</strong> Collab with similar creators

<br/><br/>📊 <strong>Realistic goals:</strong>
<br/>• 0-1000 subscribers: 3-6 months
<br/>• 1000-10K: 6-12 months
<br/>• 10K-100K: 1-2 years
<br/>• Monetization: 1000 subs + 4000h watch time`
      },

      shorts_tips: {
        fr: `📱 <strong>Maîtriser les YouTube Shorts :</strong>

<br/><br/>⚡ <strong>Format gagnant :</strong>
<br/>• ⏱️ Durée idéale : 30-45 secondes
<br/>• 📱 Format vertical 9:16 (1080x1920)
<br/>• 🔤 Sous-titres intégrés (80% regardent sans son)
<br/>• 🎵 Musique tendance = boost algorithmique

<br/><br/>🔥 <strong>Structure d'un Short viral :</strong>
<br/>1️⃣ <strong>Hook (0-3s) :</strong> Question choc ou fait surprenant
<br/>2️⃣ <strong>Contenu (3-30s) :</strong> Valeur immédiate, rythme rapide
<br/>3️⃣ <strong>Fin (30-45s) :</strong> Cliffhanger ou CTA
<br/>4️⃣ <strong>Loop :</strong> Fin qui donne envie de revoir = boost

<br/><br/>📊 <strong>Stratégie :</strong>
<br/>• Postez 1-3 Shorts/jour
<br/>• Réutilisez vos meilleures vidéos longues
<br/>• Testez différentes heures de publication
<br/>• Les Shorts redirigent vers vos vidéos longues`,

        en: `📱 <strong>Mastering YouTube Shorts:</strong>

<br/><br/>⚡ <strong>Winning format:</strong>
<br/>• ⏱️ Ideal length: 30-45 seconds
<br/>• 📱 Vertical format 9:16 (1080x1920)
<br/>• 🔤 Built-in subtitles (80% watch without sound)
<br/>• 🎵 Trending music = algorithmic boost

<br/><br/>🔥 <strong>Viral Short structure:</strong>
<br/>1️⃣ <strong>Hook (0-3s):</strong> Shocking question or surprising fact
<br/>2️⃣ <strong>Content (3-30s):</strong> Immediate value, fast pace
<br/>3️⃣ <strong>End (30-45s):</strong> Cliffhanger or CTA
<br/>4️⃣ <strong>Loop:</strong> End that makes you rewatch = boost

<br/><br/>📊 <strong>Strategy:</strong>
<br/>• Post 1-3 Shorts/day
<br/>• Repurpose your best long videos
<br/>• Test different posting times
<br/>• Shorts redirect to your long videos`
      },

      viral_tips: {
        fr: `🔥 <strong>Comment devenir viral sur YouTube :</strong>

<br/><br/>🧠 <strong>Comprendre l'algorithme :</strong>
<br/>• L'algo favorise le <strong>temps de visionnage</strong> et la <strong>rétention</strong>
<br/>• Le <strong>CTR</strong> (taux de clic) détermine la diffusion
<br/>• Les <strong>premières 2h</strong> après publication sont cruciales
<br/>• Les <strong>commentaires</strong> et <strong>partages</strong> boostent massivement

<br/><br/>🎯 <strong>Formule virale :</strong>
<br/>1️⃣ <strong>Émotion forte</strong> : Surprise, rire, colère, inspiration
<br/>2️⃣ <strong>Tendance</strong> : Sujet d'actualité + votre twist
<br/>3️⃣ <strong>Partageabilité</strong> : "Il faut que je montre ça à..."
<br/>4️⃣ <strong>Hook irrésistible</strong> : 3 secondes pour captiver
<br/>5️⃣ <strong>Pattern interrupt</strong> : Changez de plan toutes les 5-8s

<br/><br/>📊 <strong>Stats de cette vidéo :</strong>
<br/>• ${BlueFoxHelpers.formatNumber(views)} vues | ${subs > 0 ? ((views / subs) * 100).toFixed(1) + '% des abonnés' : 'N/A'}
<br/>• ${views > subs * 5 ? '🔥 Performance virale!' : views > subs ? '✨ Bonne performance' : '📈 Performance normale'}`,

        en: `🔥 <strong>How to go viral on YouTube:</strong>

<br/><br/>🧠 <strong>Understanding the algorithm:</strong>
<br/>• The algo favors <strong>watch time</strong> and <strong>retention</strong>
<br/>• <strong>CTR</strong> (click-through rate) determines distribution
<br/>• The <strong>first 2 hours</strong> after publishing are crucial
<br/>• <strong>Comments</strong> and <strong>shares</strong> boost massively

<br/><br/>🎯 <strong>Viral formula:</strong>
<br/>1️⃣ <strong>Strong emotion</strong>: Surprise, laughter, anger, inspiration
<br/>2️⃣ <strong>Trending</strong>: Current topic + your twist
<br/>3️⃣ <strong>Shareability</strong>: "I need to show this to..."
<br/>4️⃣ <strong>Irresistible hook</strong>: 3 seconds to captivate
<br/>5️⃣ <strong>Pattern interrupt</strong>: Change angle every 5-8s

<br/><br/>📊 <strong>This video stats:</strong>
<br/>• ${BlueFoxHelpers.formatNumber(views)} views | ${subs > 0 ? ((views / subs) * 100).toFixed(1) + '% of subscribers' : 'N/A'}
<br/>• ${views > subs * 5 ? '🔥 Viral performance!' : views > subs ? '✨ Good performance' : '📈 Normal performance'}`
      },

      seo_tips: {
        fr: `🔍 <strong>Guide SEO YouTube complet :</strong>

<br/><br/>📌 <strong>Les 3 piliers du SEO YouTube :</strong>

<br/><br/>1️⃣ <strong>Mots-clés :</strong>
<br/>• Utilisez YouTube Search Suggest pour trouver vos mots-clés
<br/>• Placez le mot-clé principal dans les 60 premiers caractères du titre
<br/>• Répétez-le dans la description et les tags
<br/>• Utilisez des variantes et synonymes

<br/><br/>2️⃣ <strong>Métadonnées :</strong>
<br/>• Titre : 40-70 caractères, mot-clé au début
<br/>• Description : 250+ mots, liens, timestamps
<br/>• Tags : 15-30 tags, du spécifique au général
<br/>• Hashtags : 3-5 dans la description
<br/>• Catégorie correcte

<br/><br/>3️⃣ <strong>Engagement :</strong>
<br/>• Posez des questions pour les commentaires
<br/>• Demandez de liker et s'abonner
<br/>• Créez des playlists thématiques
<br/>• Utilisez les fiches et écrans de fin`,

        en: `🔍 <strong>Complete YouTube SEO Guide:</strong>

<br/><br/>📌 <strong>The 3 pillars of YouTube SEO:</strong>

<br/><br/>1️⃣ <strong>Keywords:</strong>
<br/>• Use YouTube Search Suggest to find keywords
<br/>• Place main keyword in first 60 characters of title
<br/>• Repeat in description and tags
<br/>• Use variations and synonyms

<br/><br/>2️⃣ <strong>Metadata:</strong>
<br/>• Title: 40-70 characters, keyword at beginning
<br/>• Description: 250+ words, links, timestamps
<br/>• Tags: 15-30 tags, from specific to general
<br/>• Hashtags: 3-5 in description
<br/>• Correct category

<br/><br/>3️⃣ <strong>Engagement:</strong>
<br/>• Ask questions to get comments
<br/>• Ask to like and subscribe
<br/>• Create thematic playlists
<br/>• Use cards and end screens`
      },

      monetization: {
        fr: `💰 <strong>Guide de monétisation YouTube :</strong>

<br/><br/>📋 <strong>Prérequis Programme Partenaire :</strong>
<br/>• ✅ 1000 abonnés minimum
<br/>• ✅ 4000h de visionnage (12 derniers mois) OU 10M vues Shorts (90 jours)
<br/>• ✅ Respecter les règles de la communauté
<br/>• ✅ Compte AdSense actif

<br/><br/>💵 <strong>Sources de revenus :</strong>
<br/>• 🎬 AdSense : $2-7 CPM (moy. $3-5)
<br/>• 🤝 Sponsoring : $20-50 par 1000 vues
<br/>• 🛍️ Affiliation : 5-15% de commission
<br/>• 👕 Merchandising : via YouTube Shopping
<br/>• 💬 Super Chat : lors des lives
<br/>• 📱 Membership : abonnements payants
<br/>• 📚 Produits numériques : formations, ebooks

<br/><br/>📊 <strong>Estimation pour cette vidéo :</strong>
<br/>• AdSense estimé : ${BlueFoxHelpers.estimateRevenue(views).min} - ${BlueFoxHelpers.estimateRevenue(views).max}
<br/>• Sponsoring potentiel : $${Math.round(views / 1000 * 25)}-$${Math.round(views / 1000 * 50)}`,

        en: `💰 <strong>YouTube Monetization Guide:</strong>

<br/><br/>📋 <strong>Partner Program Requirements:</strong>
<br/>• ✅ Minimum 1000 subscribers
<br/>• ✅ 4000h watch time (last 12 months) OR 10M Shorts views (90 days)
<br/>• ✅ Follow community guidelines
<br/>• ✅ Active AdSense account

<br/><br/>💵 <strong>Revenue sources:</strong>
<br/>• 🎬 AdSense: $2-7 CPM (avg. $3-5)
<br/>• 🤝 Sponsorship: $20-50 per 1000 views
<br/>• 🛍️ Affiliate: 5-15% commission
<br/>• 👕 Merchandise: via YouTube Shopping
<br/>• 💬 Super Chat: during live streams
<br/>• 📱 Membership: paid subscriptions
<br/>• 📚 Digital products: courses, ebooks

<br/><br/>📊 <strong>Estimate for this video:</strong>
<br/>• Estimated AdSense: ${BlueFoxHelpers.estimateRevenue(views).min} - ${BlueFoxHelpers.estimateRevenue(views).max}
<br/>• Potential sponsorship: $${Math.round(views / 1000 * 25)}-$${Math.round(views / 1000 * 50)}`
      }
    };

    // Handle preset questions
    if (responses[questionType]) {
      return responses[questionType][lang] || responses[questionType]['en'];
    }

    // Handle free-form questions with keyword matching
    return this.handleFreeQuestion(questionType, videoData, lang);
  },

  handleFreeQuestion(question, videoData, lang) {
    const q = question.toLowerCase();
    const views = videoData.views || 0;
    const likes = videoData.likes || 0;
    const title = videoData.title || '';

    // Keyword matching for free questions
    const keywords = {
      title: ['titre', 'title', 'nom', 'name', 'intitulé'],
      description: ['description', 'desc', 'texte', 'text'],
      thumbnail: ['miniature', 'thumbnail', 'image', 'visuel', 'visual'],
      seo: ['seo', 'référencement', 'search', 'chercher', 'find'],
      views: ['vues', 'views', 'audience', 'spectateurs', 'viewers'],
      money: ['argent', 'money', 'revenu', 'revenue', 'gagner', 'earn', 'monétis', 'monetiz'],
      growth: ['percer', 'grow', 'croissance', 'grandir', 'abonné', 'subscriber'],
      shorts: ['short', 'court', 'tiktok', 'vertical', 'reels'],
      viral: ['viral', 'buzz', 'tendance', 'trend', 'exploit'],
      algo: ['algorithme', 'algorithm', 'algo', 'recommand'],
      tags: ['tag', 'mot-clé', 'keyword', 'hashtag'],
      comment: ['commentaire', 'comment', 'engagement', 'interact'],
      analytics: ['analytics', 'statistique', 'stat', 'données', 'data'],
      live: ['live', 'direct', 'stream', 'diffusion'],
      collab: ['collab', 'partenariat', 'partnership', 'together'],
      music: ['musique', 'music', 'son', 'sound', 'audio'],
      edit: ['montage', 'edit', 'couper', 'cut', 'logiciel', 'software'],
      niche: ['niche', 'sujet', 'topic', 'thème', 'theme']
    };

    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(w => q.includes(w))) {
        return this.getTopicResponse(key, videoData, lang);
      }
    }

    // Default response
    if (lang === 'fr') {
      return `🦊 Merci pour votre question ! Voici quelques conseils généraux pour "<strong>${this.escapeHtml(question)}</strong>" :

<br/><br/>📊 <strong>Stats de la vidéo actuelle :</strong>
<br/>• Titre : "${title}"
<br/>• Vues : ${BlueFoxHelpers.formatNumber(views)}
<br/>• Likes : ${BlueFoxHelpers.formatNumber(likes)}

<br/><br/>💡 <strong>Conseils rapides :</strong>
<br/>• Analysez vos analytics YouTube Studio
<br/>• Comparez avec vos vidéos les plus performantes
<br/>• Testez de nouveaux formats et sujets
<br/>• Restez constant dans vos publications

<br/><br/>🔍 Essayez les boutons rapides ci-dessus pour des conseils plus spécifiques !`;
    }

    return `🦊 Thanks for your question! Here are some general tips for "<strong>${this.escapeHtml(question)}</strong>":

<br/><br/>📊 <strong>Current video stats:</strong>
<br/>• Title: "${title}"
<br/>• Views: ${BlueFoxHelpers.formatNumber(views)}
<br/>• Likes: ${BlueFoxHelpers.formatNumber(likes)}

<br/><br/>💡 <strong>Quick tips:</strong>
<br/>• Analyze your YouTube Studio analytics
<br/>• Compare with your best performing videos
<br/>• Test new formats and topics
<br/>• Stay consistent with uploads

<br/><br/>🔍 Try the quick buttons above for more specific advice!`;
  },

  getTopicResponse(topic, videoData, lang) {
    const views = videoData.views || 0;
    const subs = videoData.subscriberCount || 0;

    const topicResponses = {
      algo: {
        fr: `🧠 <strong>Comment fonctionne l'algorithme YouTube :</strong>
<br/><br/>L'algorithme utilise principalement ces signaux :
<br/>• 📈 <strong>CTR (Click-Through Rate)</strong> : % de clics sur impressions
<br/>• ⏱️ <strong>Rétention moyenne</strong> : % de la vidéo regardée
<br/>• 👍 <strong>Engagement</strong> : Likes, commentaires, partages
<br/>• 📊 <strong>Satisfaction</strong> : Enquêtes utilisateurs
<br/>• 🔄 <strong>Watch time</strong> : Temps total de visionnage

<br/><br/>🎯 <strong>Comment l'exploiter :</strong>
<br/>• Optimisez CTR : Miniature + titre irrésistibles
<br/>• Optimisez rétention : Hook fort, montage dynamique
<br/>• Publiez quand votre audience est active
<br/>• Les premières 24-48h déterminent la portée`,
        en: `🧠 <strong>How YouTube's algorithm works:</strong>
<br/><br/>The algorithm primarily uses these signals:
<br/>• 📈 <strong>CTR (Click-Through Rate)</strong>: % clicks on impressions
<br/>• ⏱️ <strong>Average retention</strong>: % of video watched
<br/>• 👍 <strong>Engagement</strong>: Likes, comments, shares
<br/>• 📊 <strong>Satisfaction</strong>: User surveys
<br/>• 🔄 <strong>Watch time</strong>: Total viewing time

<br/><br/>🎯 <strong>How to exploit it:</strong>
<br/>• Optimize CTR: Irresistible thumbnail + title
<br/>• Optimize retention: Strong hook, dynamic editing
<br/>• Publish when your audience is active
<br/>• First 24-48h determine reach`
      },

      tags: {
        fr: `🏷️ <strong>Stratégie de tags parfaite :</strong>
<br/><br/>• Utilisez 15-30 tags par vidéo
<br/>• Tag 1 : Votre mot-clé exact
<br/>• Tags 2-5 : Variantes du mot-clé
<br/>• Tags 6-15 : Mots-clés connexes
<br/>• Tags 16+ : Mots-clés généraux de votre niche
<br/><br/>💡 Outils gratuits : TubeBuddy, VidIQ, RapidTags`,
        en: `🏷️ <strong>Perfect tag strategy:</strong>
<br/><br/>• Use 15-30 tags per video
<br/>• Tag 1: Your exact keyword
<br/>• Tags 2-5: Keyword variations
<br/>• Tags 6-15: Related keywords
<br/>• Tags 16+: General niche keywords
<br/><br/>💡 Free tools: TubeBuddy, VidIQ, RapidTags`
      },

      comment: {
        fr: `💬 <strong>Booster l'engagement :</strong>
<br/><br/>• Posez une question dans les 30 premières secondes
<br/>• Épinglez un commentaire avec une question
<br/>• Répondez dans la première heure
<br/>• Utilisez les cœurs pour les bons commentaires
<br/>• Créez des sondages en onglet Communauté`,
        en: `💬 <strong>Boost engagement:</strong>
<br/><br/>• Ask a question in the first 30 seconds
<br/>• Pin a comment with a question
<br/>• Reply within the first hour
<br/>• Heart good comments
<br/>• Create polls in Community tab`
      },

      analytics: {
        fr: `📊 <strong>Métriques clés à surveiller :</strong>
<br/><br/>• CTR impressions : visez > 5%
<br/>• Rétention moyenne : visez > 50%
<br/>• Temps moyen de visionnage
<br/>• Sources de trafic (recherche vs recommandé)
<br/>• Démographie de l'audience
<br/><br/>📊 Cette vidéo : ${BlueFoxHelpers.formatNumber(views)} vues`,
        en: `📊 <strong>Key metrics to monitor:</strong>
<br/><br/>• Impressions CTR: aim > 5%
<br/>• Average retention: aim > 50%
<br/>• Average view duration
<br/>• Traffic sources (search vs recommended)
<br/>• Audience demographics
<br/><br/>📊 This video: ${BlueFoxHelpers.formatNumber(views)} views`
      },

      live: {
        fr: `🔴 <strong>Conseils pour les lives :</strong>
<br/><br/>• Annoncez le live 24-48h à l'avance
<br/>• Durée idéale : 1-2 heures
<br/>• Interagissez activement avec le chat
<br/>• Utilisez Super Chat pour la monétisation
<br/>• Programmez des lives réguliers`,
        en: `🔴 <strong>Live stream tips:</strong>
<br/><br/>• Announce live 24-48h in advance
<br/>• Ideal duration: 1-2 hours
<br/>• Actively interact with chat
<br/>• Use Super Chat for monetization
<br/>• Schedule regular live streams`
      },

      collab: {
        fr: `🤝 <strong>Stratégie de collaboration :</strong>
<br/><br/>• Ciblez des chaînes de taille similaire (+/- 50%)
<br/>• Proposez une valeur claire pour les deux parties
<br/>• Commencez par interagir sur leurs vidéos
<br/>• DM professionnel et personnalisé
<br/>• Contenu cross-promotion`,
        en: `🤝 <strong>Collaboration strategy:</strong>
<br/><br/>• Target channels of similar size (+/- 50%)
<br/>• Propose clear value for both parties
<br/>• Start by engaging on their videos
<br/>• Professional and personalized DM
<br/>• Cross-promotion content`
      },

      edit: {
        fr: `🎬 <strong>Montage pour retenir l'attention :</strong>
<br/><br/>• Coupez tous les temps morts
<br/>• Changez de plan toutes les 5-8 secondes
<br/>• Ajoutez du texte à l'écran pour les points clés
<br/>• Effets sonores pour ponctuer (whoosh, pop)
<br/>• Zoom/dézoom dynamique
<br/><br/>🔧 Logiciels : DaVinci Resolve (gratuit), Premiere Pro, CapCut`,
        en: `🎬 <strong>Editing to retain attention:</strong>
<br/><br/>• Cut all dead time
<br/>• Change angle every 5-8 seconds
<br/>• Add on-screen text for key points
<br/>• Sound effects to punctuate (whoosh, pop)
<br/>• Dynamic zoom in/out
<br/><br/>🔧 Software: DaVinci Resolve (free), Premiere Pro, CapCut`
      },

      niche: {
        fr: `🎯 <strong>Choisir sa niche :</strong>
<br/><br/>• Trouvez l'intersection entre : passion + expertise + demande
<br/>• Analysez la concurrence (pas trop, pas trop peu)
<br/>• Niches rentables : tech, finance, santé, gaming, cuisine
<br/>• Commencez spécifique, élargissez ensuite
<br/>• Votre personnalité EST votre différenciation`,
        en: `🎯 <strong>Choosing your niche:</strong>
<br/><br/>• Find the intersection of: passion + expertise + demand
<br/>• Analyze competition (not too much, not too little)
<br/>• Profitable niches: tech, finance, health, gaming, cooking
<br/>• Start specific, broaden later
<br/>• Your personality IS your differentiation`
      },

      music: {
        fr: `🎵 <strong>Musique et audio :</strong>
<br/><br/>• YouTube Audio Library : musiques gratuites
<br/>• Epidemicsound, Artlist : abonnements pro
<br/>• Le son représente 50% de la qualité perçue
<br/>• Investissez dans un bon micro avant la caméra
<br/>• Normalisez l'audio entre -12 et -6 dB`,
        en: `🎵 <strong>Music and audio:</strong>
<br/><br/>• YouTube Audio Library: free music
<br/>• Epidemicsound, Artlist: pro subscriptions
<br/>• Sound is 50% of perceived quality
<br/>• Invest in good mic before camera
<br/>• Normalize audio between -12 and -6 dB`
      }
    };

    // Fallback to matched preset responses
    if (topicResponses[topic]) {
      return topicResponses[topic][lang] || topicResponses[topic]['en'];
    }

    // Fallback to preset if topic matches a preset key
    const presetMatch = {
      title: 'optimize_title',
      description: 'improve_description',
      thumbnail: 'thumbnail_tips',
      seo: 'seo_tips',
      views: 'viral_tips',
      money: 'monetization',
      growth: 'grow_channel',
      shorts: 'shorts_tips',
      viral: 'viral_tips'
    };

    if (presetMatch[topic]) {
      return this.generateResponse(presetMatch[topic], videoData, lang);
    }

    return lang === 'fr'
      ? `🦊 Je n'ai pas de réponse spécifique pour "${topic}" mais essayez les boutons rapides pour des conseils détaillés !`
      : `🦊 I don't have a specific answer for "${topic}" but try the quick buttons for detailed advice!`;
  }
};
