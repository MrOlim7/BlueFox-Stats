# 🦊 BlueFox Stats - Documentation v0.1

Extension Chrome avancée pour l'analyse complète des vidéos YouTube avec statistiques, SEO, assistant IA et bien plus.

## 📋 Table des matières

- [Installation](#installation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Fichiers](#fichiers)
- [Configuration](#configuration)
- [Développement](#développement)
- [Améliorations récentes](#améliorations-récentes)
- [Dépannage](#dépannage)

---

## 📦 Installation

### Conditions préalables
- Chrome / Edge / Brave (Chromium-based)
- Clé API YouTube Data v3 (optionnel, pour certaines fonctionnalités)

### Installation locale

1. Clonez ou téléchargez le projet
2. Allez dans `chrome://extensions/`
3. Activez le "Mode de développeur" (coin haut-droit)
4. Cliquez "Charger l'extension non empaquetée"
5. Sélectionnez le dossier `BlueFox-Stats`

### Configuration initiale

1. Cliquez sur l'icône BlueFox dans la barre d'outils
2. Allez dans les paramètres
3. (Optionnel) Entrez votre clé API YouTube
4. Sélectionnez votre langue (FR/EN)

---

## ✨ Fonctionnalités

### 📊 Statistiques vidéo
- Vues, likes, dislikes (via Return YouTube Dislike API)
- Engagement rate, durée, date de publication
- Révenu estimé (basé sur CPM)
- Vues par jour/heure
- Score de viralité
- Graphique d'évolution des vues

### 🖼️ Viewer de miniatures
- Affichage de toutes les qualités de miniatures YouTube
- Téléchargement direct des miniatures
- Support des miniatures custom

### 📺 Statistiques de chaîne
- Nombre d'abonnés, vues totales
- Moyenne de vues par vidéo
- Taux de croissance estimé
- Classement de la chaîne (tier)

### 🔍 Analyse SEO
- Score SEO global (0-100)
- Analyse du titre (longueur, keywords)
- Analyse de la description (longueur, timestamps, liens)
- Analyse des tags (pertinence, tendance)
- Suggestions d'optimisation

### 🤖 Assistant IA BlueFox
- Questions sur l'optimisation YouTube
- Conseils personnalisés
- Suggestions pour viral content
- Tips pour Shorts et monétisation

### 📈 Graphiques et comparaisons
- Graphique en temps réel des vues estimées
- Comparaison de vidéos
- Export de données (JSON, CSV)
- Partage de statistiques

---

## 🏗️ Architecture

### Structure modulaire

BlueFox utilise une architecture modulaire centralisée pour faciliter la maintenance et les extensions:

```
BlueFyx
│
├── utils/              # Modules utilitaires partagés
│   ├── logger.js       # Logging centralisé
│   ├── cache.js        # System de cache avec TTL
│   ├── errorHandler.js # Gestion d'erreurs globale
│   ├── helpers.js      # Fonctions utilitaires
│   ├── api.js          # Wrapper API YouTube
│   ├── i18n.js         # Internationalisation
│   └── manager.js      # Orchestration des modules
│
├── components/         # Composants fonctionnels
│   ├── videoStats.js   # Stats vidéo
│   ├── channelStats.js # Stats chaîne
│   ├── seoAnalyzer.js  # Analyse SEO
│   ├── aiAssistant.js  # Assistant IA
│   ├── dislikeCounter.js # Counter dislikes
│   ├── thumbnailViewer.js # Viewer miniatures
│   └── viewsGraph.js   # Graphique vues
│
├── content/            # Content scripts
│   ├── content.js      # Script principal (ancien)
│   └── init.js         # Initialisation améliorée
│
├── popup/              # Interface popup
│   ├── popup.html      # Structure
│   ├── popup.js        # Logique
│   └── popup.css       # Styles
│
├── background/         # Service Worker
│   └── background.js   # Handlers d'API
│
├── styles/             # Stylesheets
│   └── content.css     # Styles du panel
│
├── _locales/           # Traductions
│   ├── en/messages.json
│   └── fr/messages.json
│
└── manifest.json       # Configuration extension
```

### Module Manager (`utils/manager.js`)

Le Module Manager orchestr centralement tous les modules:

```javascript
// Initialisation
await BlueFoxManager.init();

// Accès aux modules
const logger = BlueFoxManager.getModule('logger');
const cache = BlueFoxManager.getModule('cache');

// Gestion des paramètres
BlueFoxManager.getSetting('bfLanguage');
await BlueFoxManager.updateSetting('bfLanguage', 'en');

// Stats système
const stats = BlueFoxManager.getStats();
console.log(stats.cacheStats);
```

---

## 📁 Fichiers principaux

### Utils (Utilitaires)

####`utils/logger.js` - Logging centralisé
```javascript
BlueFoxLogger.info('Message');
BlueFoxLogger.error('Erreur', error);
BlueFoxLogger.warn('Avertissement');
BlueFoxLogger.debug('Debug');

// Récupérer les logs
BlueF oxLogger.getLogs();
BlueFoxLogger.exportLogs(); // JSON
```

#### `utils/cache.js` - Cache avec TTL
```javascript
// Set avec TTL de 15min
BlueFoxCache.set('key', value, 15);

// Get
BlueFoxCache.get('key'); // null si expiré

// Stats
BlueFoxCache.getStats();
```

#### `utils/errorHandler.js` - Gestion d'erreurs
```javascript
try {
  await someAsyncOperation();
} catch (error) {
  BlueFoxErrorHandler.handleError('Operation failed', error);
}

// Safe wrapper
BlueFoxErrorHandler.safe(() => {
  // Code potentiellement dangereux
});
```

#### `utils/i18n.js` - Internationalisation
```javascript
// Traduction
BlueFoxI18n.t('viewsPerDay'); // "Vues par jour" (FR) ou "Views Per Day" (EN)

// Changer langue
BlueFoxI18n.setLanguage('en');

// Langue actuelle
BlueFoxI18n.getLanguage();

// Langues disponibles
BlueFoxI18n.getAvailableLanguages(); // ['fr', 'en']
```

#### `utils/api.js` - API YouTube Wrapper
```javascript
// Requête API YouTube
const videoDetails = await BFApi.getVideoDetails(videoId);

// Dislikes (Return YouTube Dislike API)
const dislikeData = await BFApi.getDislikes(videoId);

// Avec cache automatique
// Les résultats sont cachés par défaut
```

#### `utils/helpers.js` - Utilitaires globaux
```javascript
// Formatage
BFHelpers.formatNumber(1234567); // "1.2M"
BFHelpers.formatDate(dateString); // "15 avril 2024"
BFHelpers.formatDuration('PT1H2M3S'); // "1:02:03"

// Calculs
BFHelpers.calcEngagementRate(likes, dislikes, comments, views);
BFHelpers.calcLikeRatio(likes, dislikes);
BFHelpers.estimateRevenue(views);

// Info page
BFHelpers.getVideoId(); // Depuis URL
BFHelpers.isVideoPage();

// Functionals
BFHelpers.debounce(func, wait);
BFHelpers.throttle(func, limit);
```

### Background Worker (`background/background.js`)

Gère les requêtes API avec authentification:

```javascript
chrome.runtime.sendMessage({
  type: 'BF_API_REQUEST',
  endpoint: 'videos',
  params: {
    part: 'snippet,statistics',
    id: videoId
  }
}, response => {
  console.log(response.data);
});
```

### Content Scripts (`content/`

#### `content/content.js` - Script principal (vérifié, en cours de migration)
Script injecté automatiquement sur YouTube

#### `content/init.js` - Initialisation améliorée
Gère:
- Détection de page YouTube
- Communication popup/content
- Observation des changements de page
- Initialisation du panel

---

## 🔧 Configuration

###  Paramètres utilisateur (chrome.storage.sync)

```javascript
{
  bfLanguage: 'fr',           // Langue (fr/en)
  bfAutoShow: true,           // Afficher panel auto
  bfShowDislikes: true,       // Montrer les dislikes
  bfDarkMode: true,           // Mode sombre
  bfPanelPosition: 'sidebar',  // 'sidebar' ou 'floating'
  bfApiKey: '',               // Clé API YouTube (optionnel)
  bfInstallDate: 1234567890   // Timestamp install
}
```

### Variables d'environnement (constants)

```javascript
const PANEL_ID = 'bluefox-stats-panel';
const TOGGLE_ID = 'bluefox-toggle-btn';
const VERSION = '0.1';
const LOG_LEVEL = BlueFoxLogger.INFO;
```

---

## 👨‍💻 Développement

### Ajouter une nouvelle fonctionnalité

1. **Créer le module** (`utils/nouveauModule.js`)
```javascript
const BlueFoxNewModule = {
  async init() {
    // Initialisation
  },
  doSomething() {
    // Logique
  }
};
```

2. **L'enregistrer auprès du Manager** (`utils/manager.js`)
```javascript
BlueFoxManager.registerModule('newModule', BlueFoxNewModule);
```

3. **L'utiliser dans content scripts**
```javascript
const module = BlueFoxManager.getModule('newModule');
await module.doSomething();
```

### Déboguer

Utiliser la console du navigateur (Inspect Element > Console):

```javascript
// Voir les logs
BlueFoxLogger.getLogs();

// Voir la configuration
BlueFoxManager.getSettings();

// Stats système
BlueFoxManager.getStats();

// Exporter les logs
console.log(BlueFoxLogger.exportLogs());
```

### Test local

1. Modifiez des fichiers
2. Allez dans `chrome://extensions/`
3. Cliquez le bouton "Recharger" sur BlueFox
4. Testez sur une page YouTube

---

## 🎯 Améliorations récentes (v0.1 → v0.1.1)

###  ✅ Bugs corrigés

✓ **Erreur HTML structurelle** dans `videoStats.js` (ligne 57)
  - Fermeture de `<div class="bf-stat-card">` manquante

✓ **API Response** incomplète dans `background.js`
  - Réponse JSON complète maintenant
  - Timeout d'API ajouté (10s)

✓ **Références undefined**
  - All modules now check for existence before using
  - Graceful fallbacks implemented

### 🆕 Nouvelles fonctionnalités

✨ **Logging centralisé** (`utils/logger.js`)
  - Niveaux: DEBUG, INFO, WARN, ERROR
  - Persistence en mémoire (100 derniers logs)
  - Export JSON

✨ **Cache robuste** (`utils/cache.js`)
  - TTL configurable par entrée
  - Max size limit (100 entries)
  - Fallback localStorage

✨ **Error Handler global** (`utils/errorHandler.js`)
  - Capture d'erreurs non gérées
  - Promise rejection handling
  - Logging automatique

✨ **Module Manager** (`utils/manager.js`)
  - Orchestration centralisée
  - Settings management
  - Stats système

✨ **Init script** (`content/init.js`)
  - Architecture modulaire
  - Message passing amélioré
  - Error handling complète

###  🔒 Améliorations sécurité

- Validation des requêtes API
- Try/catch global
- XSS protection
- CSP compatible

### 📊 Optim Performance

- Lazy loading modules
- Cache agressif (15-30min)
- Worker threads prêts
- Debounce/Throttle utilitaires

---

## 🐛 Dépannage

### Le panel n'apparaît pas

1. Vérifier que vous êtes sur une vidéo YouTube (youtube.com/watch)
2. Recharger l'extension (`chrome://extensions`, bouton recharger)
3. Recharger la page YouTube
4. Vérifier la console (F12 > Console) pour erreurs

### L'API key ne fonctionne pas

1. Vérifier la clé est correcte
2. Vérifier les quotas API YouTube
3. Vérifier les permissions scopes
4. Vérifier les restrictions IP

### Logs vides

1. Vérifier le niveau de log:
   ```javascript
   BlueFoxLogger.setLevel(BlueFoxLogger.DEBUG);
   ```
2. Vérifier que `enableConsole` est `true`
3. Vérifier la console du navigateur (F12)

### Cache problèmes

```javascript
// Vider tout le cache
BlueFoxCache.clear();

// Voir le cache
BlueFoxCache.getStats();
```

---

## 📞 Support

Pour signaler un bug ou une suggestion:
1. Allez sur [GitHub Issues](https://github.com/MrOlim/BlueFox-Stats/issues)
2. Décrivez le problème clairement
3. Joignez les logs (via `BlueFoxLogger.exportLogs()`)

---

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE)

---

**Dernière mise à jour:** 05/04/2024
**Version:** 0.1.1
**Statut:** En développement actif 🚀
