// BlueFox Stats v0.1 - Internationalization Module

const BlueFoxI18n = (() => {
  const translations = {
    fr: {
      views: "Vues",
      likes: "J'aime",
      dislikes: "Je n'aime pas",
      comments: "Commentaires",
      subscribers: "Abonnés",
      videoPerformance: "Performance de la vidéo",
      publishedOn: "Publié le",
      videoId: "ID Vidéo",
      engagementRate: "Taux d'engagement",
      likeDislikeRatio: "Ratio J'aime/J'aime pas",
      estimatedRevenue: "Revenus estimés",
      viewsPerDay: "Vues par jour",
      viewsPerHour: "Vues par heure",
      videoAge: "Âge de la vidéo",
      thumbnailHistory: "Historique des miniatures",
      currentThumbnail: "Miniature actuelle",
      previousThumbnails: "Miniatures précédentes",
      noThumbnailsFound: "Aucune miniature précédente trouvée",
      channelStatistics: "Statistiques de la chaîne",
      totalVideos: "Total de vidéos",
      totalViews: "Total de vues",
      avgViewsPerVideo: "Moyenne de vues/vidéo",
      channelCreated: "Chaîne créée le",
      uploadFrequency: "Fréquence d'upload",
      seoScore: "Score SEO",
      titleAnalysis: "Analyse du titre",
      descriptionAnalysis: "Analyse de la description",
      tagsAnalysis: "Analyse des tags",
      aiAssistant: "Assistant IA BlueFox",
      aiPlaceholder: "Demandez des conseils pour booster vos vidéos...",
      aiSend: "Envoyer",
      aiWelcome: "👋 Bonjour ! Je suis l'assistant BlueFox. Posez-moi vos questions sur comment améliorer vos vidéos YouTube !",
      statsPanel: "📊 Statistiques BlueFox",
      viewsGraph: "Graphique des vues",
      excellent: "Excellent",
      good: "Bon",
      average: "Moyen",
      poor: "Faible",
      settings: "⚙️ Paramètres",
      language: "Langue",
      days: "jours",
      hours: "heures",
      minutes: "minutes",
      seconds: "secondes",
      bestPostTime: "Meilleur moment pour publier",
      viralScore: "Score de viralité",
      exportData: "📥 Exporter les données",
      compareVideos: "🔀 Comparer les vidéos",
      titleLength: "Longueur du titre",
      descriptionLength: "Longueur de la description",
      hasTimestamps: "Contient des timestamps",
      hasLinks: "Contient des liens",
      yes: "Oui",
      no: "Non",
      characters: "caractères",
      close: "Fermer",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      retry: "Réessayer",
      estimatedCPM: "CPM estimé",
      shareStats: "Partager les stats",
      openPanel: "Ouvrir le panneau",
      togglePanel: "Afficher/Masquer",
      autoShow: "Affichage automatique",
      showDislikes: "Afficher les dislikes",
      darkMode: "Mode sombre",
      panelPosition: "Position du panneau",
      viral: "Viral 🔥",
      projectedViews: "Vues projettées"
    },
    en: {
      views: "Views",
      likes: "Likes",
      dislikes: "Dislikes",
      comments: "Comments",
      subscribers: "Subscribers",
      videoPerformance: "Video Performance",
      publishedOn: "Published on",
      videoId: "Video ID",
      engagementRate: "Engagement Rate",
      likeDislikeRatio: "Like/Dislike Ratio",
      estimatedRevenue: "Estimated Revenue",
      viewsPerDay: "Views per day",
      viewsPerHour: "Views per hour",
      videoAge: "Video age",
      thumbnailHistory: "Thumbnail History",
      currentThumbnail: "Current Thumbnail",
      previousThumbnails: "Previous Thumbnails",
      noThumbnailsFound: "No previous thumbnails found",
      channelStatistics: "Channel Statistics",
      totalVideos: "Total Videos",
      totalViews: "Total Views",
      avgViewsPerVideo: "Avg Views/Video",
      channelCreated: "Channel Created",
      uploadFrequency: "Upload Frequency",
      seoScore: "SEO Score",
      titleAnalysis: "Title Analysis",
      descriptionAnalysis: "Description Analysis",
      tagsAnalysis: "Tags Analysis",
      aiAssistant: "BlueFox AI Assistant",
      aiPlaceholder: "Ask for tips to boost your videos...",
      aiSend: "Send",
      aiWelcome: "👋 Hello! I'm the BlueFox assistant. Ask me about YouTube video improvement!",
      statsPanel: "📊 BlueFox Statistics",
      viewsGraph: "Views Graph",
      excellent: "Excellent",
      good: "Good",
      average: "Average",
      poor: "Poor",
      settings: "⚙️ Settings",
      language: "Language",
      days: "days",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      bestPostTime: "Best time to publish",
      viralScore: "Viral Score",
      exportData: "📥 Export Data",
      compareVideos: "🔀 Compare Videos",
      titleLength: "Title Length",
      descriptionLength: "Description Length",
      hasTimestamps: "Has Timestamps",
      hasLinks: "Has Links",
      yes: "Yes",
      no: "No",
      characters: "characters",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      retry: "Retry",
      estimatedCPM: "Estimated CPM",
      shareStats: "Share Stats",
      openPanel: "Open Panel",
      togglePanel: "Show/Hide",
      autoShow: "Auto Show",
      showDislikes: "Show Dislikes",
      darkMode: "Dark Mode",
      panelPosition: "Panel Position",
      viral: "Viral 🔥",
      projectedViews: "Projected Views"
    }
  };

  let currentLang = 'fr';

  return {
    /**
     * Set current language
     */
    setLanguage(lang) {
      if (translations[lang]) {
        currentLang = lang;
        if (typeof BlueFoxLogger !== 'undefined') {
          BlueFoxLogger.info(`Language changed to: ${lang}`);
        }
      } else {
        if (typeof BlueFoxLogger !== 'undefined') {
          BlueFoxLogger.warn(`Language not supported: ${lang}, using default (fr)`);
        }
      }
    },

    /**
     * Get current language
     */
    getLanguage() {
      return currentLang;
    },

    /**
     * Translate key with fallback
     */
    t(key) {
      const trans = translations[currentLang];
      
      if (!trans) {
        if (typeof BlueFoxLogger !== 'undefined') {
          BlueFoxLogger.warn(`Translation object missing for: ${currentLang}`);
        }
        return key;
      }

      if (!trans[key]) {
        // Try English fallback
        const enTrans = translations.en;
        return enTrans[key] || key;
      }

      return trans[key];
    },

    /**
     * Check if key exists
     */
    has(key) {
      const trans = translations[currentLang] || translations.en;
      return key in trans;
    },

    /**
     * Get all translations for current language
     */
    getAll() {
      return translations[currentLang] || translations.fr;
    },

    /**
     * Get all available languages
     */
    getAvailableLanguages() {
      return Object.keys(translations);
    },

    /**
     * Initialize from storage
     */
    async init() {
      return new Promise((resolve) => {
        try {
          chrome.storage.sync.get(['bfLanguage'], (data) => {
            if (data.bfLanguage) {
              this.setLanguage(data.bfLanguage);
            }
            resolve(currentLang);
          });
        } catch (error) {
          if (typeof BlueFoxLogger !== 'undefined') {
            BlueFoxLogger.error('Failed to initialize i18n', error);
          }
          resolve(currentLang);
        }
      });
    }
  };
})();
