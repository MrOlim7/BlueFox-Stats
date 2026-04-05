# 🦊 BlueFox Stats - Documentation v0.2

Extension Chrome avancée pour l'analyse complète des vidéos YouTube avec statistiques, SEO, assistant IA et une interface modernisée ultra-intuitive.

## 🎨 Quoi de neuf en v0.2 ?

✅ **Interface complètement redessinée** - Design moderne, professionnel et intuitif  
✅ **Correction critique** - L'API YouTube se sauvegarde maintenant correctement !  
✅ **Système d'onglets** - Paramètres, API, Options avancées  
✅ **Plus d'options** - Thème couleur, notifications, graphique, SEO, IA  
✅ **Guide API clair** - Instructions étape par étape pour acquérir une clé API  
✅ **Code réstructuré** - Meilleure maintenabilité et robustesse  

## 📋 Table des matières

- [Installation](#installation)
- [Fonctionnalités](#fonctionnalités)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Fichiers](#fichiers)
- [Développement](#développement)
- [Améliorations v0.2](#améliorations-v02)
- [Dépannage](#dépannage)

---

## 📦 Installation

### Conditions préalables
- Chrome / Edge / Brave / Chromium (version récente)
- Clé API YouTube Data v3 (optionnelle, pour certaines fonctionnalités avancées)

### Installation locale

1. Clonez ou téléchargez le projet
   ```bash
   git clone https://github.com/MrOlim/BlueFox-Stats.git
   ```

2. Allez dans `chrome://extensions/`

3. Activez le "Mode de développeur" (coin haut-droit)

4. Cliquez "Charger l'extension non empaquetée"

5. Sélectionnez le dossier `BlueFox-Stats`

### Configuration initiale

1. **Sans API key** (par défaut) - L'extension fonctionne avec les API publiques (Return YouTube Dislike)

2. **Avec API key optionnelle** :
   - Cliquez sur l'icône BlueFox
   - Allez dans l'onglet **API**
   - Suivez les instructions pour obtenir une clé gratuite
   - Collez votre clé dans le champ
   - Cliquez **Sauvegarder**

---

## ✨ Fonctionnalités

### 📊 Statistiques vidéo
- **Vues, likes, dislikes** (via Return YouTube Dislike API)
- **Engagement rate** - Pourcentage d'engagement
- **Durée et date de publication**
- **Révenu estimé** - CPM-based revenue estimation
- **Vues par jour/heure**
- **Score de viralité**
- **Graphique d'évolution des vues** (si API configurée)

### 📈 Analyse avancée
- **SEO optimization** - Conseils pour optimiser le titre et la description
- **Assistant IA** - Suggestions intelligentes
- **Statistiques de chaîne** - Données du créateur
- **Vidéos connexes** - Top vidéos du canal
- **Visualiseur de miniature** - Aperçu de la miniature

### ⚙️ Paramètres personnalisables
- **Langue** - Support FR/EN
- **Thème couleur** - Auto, Bleu, Violet, Vert
- **Mode sombre** - Toujours activé par défaut
- **Position du panneau** - Barre latérale ou flottant
- **Affichage automatique** - Affiche le panneau au chargement vidéo
- **Notifications** - Alertes d'événements importants
- **Cache TTL** - 5min, 15min, 30min, 1h

---

## 🔧 Configuration

### Sans API Key (Mode basique)
- L'extension fonctionne hors de la boîte
- Accès aux données publiques YouTube (vues, likes)
- Dislikes depuis l'API Return YouTube Dislike
- Pas de statistiques de chaîne avancées

### Avec API Key (Mode complet)
1. Allez sur [Google Developers Console](https://console.developers.google.com/)
2. Créez un nouveau projet
3. Activez l'API **YouTube Data v3**
4. Allez dans "Identifiants" → "Créer des identifiants" → "Clé API"
5. Copiez la clé
6. Ouvrez BlueFox Stats
7. Cliquez sur l'onglet **API**
8. Collez votre clé dans le champ
9. Cliquez **Sauvegarder**

✅ Voilà ! L'API est maintenant connectée. Vous verrez un **point vert** confirmant la configuration.

---

## 🎯 Utilisation

### Utilisation basique
1. Allez sur une vidéo YouTube
2. Cliquez sur l'icône 🦊 BlueFox dans la barre de toolbar
3. Consultez les statistiques rapides dans la popup
4. (Optionnel) Cliquez "Ouvrir le panneau" pour voir l'analyse complète

### Personnalisation
- **Onglet Paramètres** - Options d'affichage et de langue
- **Onglet API** - Gestion de votre clé API
- **Onglet Avancé** - Options avancées, cache, réinitialisation

---

## 🏗️ Architecture

```
BlueFox-Stats/
├── manifest.json           # Configuration de l'extension (v0.2)
├── popup/                  # Interface popup
│   ├── popup.html         # HTML (interface à onglets)
│   ├── popup.css          # CSS (design moderne)
│   └── popup.js           # JS (gestion d'onglets, API)
├── background/
│   └── background.js      # Service worker (API)
├── content/               # Content scripts
│   ├── content.js         # Script principal
│   ├── init.js            # Initialisation
├── components/            # Modules spécialisés
│   ├── videoStats.js
│   ├── channelStats.js
│   ├── dislikeCounter.js
│   ├── seoAnalyzer.js
│   ├── aiAssistant.js
│   ├── thumbnailViewer.js
│   └── viewsGraph.js
├── utils/                 # Utilitaires
│   ├── api.js            # API management
│   ├── cache.js          # Caching system
│   ├── logger.js         # Logging
│   ├── i18n.js           # Internationalization
│   ├── helpers.js        # Helper functions
│   ├── manager.js        # Manager orchestration
│   └── errorHandler.js   # Error handling
├── styles/
│   └── content.css       # Content page styles
├── _locales/            # Traductions
│   ├── fr/messages.json
│   └── en/messages.json
├── CHANGELOG.md         # Historique des versions
└── README.md           # Ce fichier
```

---

## 📄 Fichiers clés en v0.2

### popup/popup.html
- **Nouveau** - Système d'onglets (Settings, API, Advanced)
- Tous les IDs HTML synchronisés avec le JavaScript
- Guide intégré pour l'API YouTube
- Interface claire et professionnelle

### popup/popup.css
- **Nouveau** - Design entièrement refondu
- Gradients modernes et animations fluides
- Support complet du mode sombre
- Thème couleur personnalisable

### popup/popup.js
- **CORRIGÉ** - Sauvegarde d'API key fonctionnelle
- Gestion robuste des onglets
- Auto-save automatique des paramètres
- Validation des entrées utilisateur
- 40+ lignes de commentaires

### manifest.json
- Version mise à jour à **v0.2**
- Description améliorée
- Configuration inchangée sinon

---

## 👨‍💻 Développement

### Clone et setup
```bash
git clone https://github.com/MrOlim/BlueFox-Stats.git
cd BlueFox-Stats
```

### Charger en mode dev
1. `chrome://extensions/` (ou edge/brave équivalent)
2. Mode de développeur ON
3. "Charger l'extension non empaquetée"
4. Sélectionnez le dossier

### Hot reload
Pour tester les changements :
1. Modifiez votre fichier
2. Cliquez sur le bouton ↻ rafraîchir dans `chrome://extensions`
3. Rafraîchissez la page YouTube

### Fichiers à modifier pour customization

**Interface popup** → `popup/popup.html`, `popup/popup.css`, `popup/popup.js`  
**Contenu des statistiques** → `components/*.js`  
**Utilitaires** → `utils/*.js`  
**Localisations** → `_locales/**/messages.json`  

---

## 🎉 Améliorations v0.2

### 🎨 Interface
| Aspect | v0.1 | v0.2 |
|--------|------|------|
| Design | Basique | Moderne & Professionnel |
| Onglets | Aucun | 3 onglets (Settings, API, Advanced) |
| Instructions API | Confuses | Claires & Détaillées |
| Responsivité | Partielle | Complète |
| Animations | Aucune | Fluides & Polies |

### 🔧 Fonctionnalités
| Fonctionnalité | v0.1 | v0.2 |
|---|---|---|
| Sauvegarde API | ❌ Cassée | ✅ Fonctionnelle |
| Paramètres | 4 | 11 |
| Sauvegardes | Manuelles | Automatiques |
| Validation | Non | ✅ Complète |
| Thèmes | Aucun | 4 (Auto, Blue, Purple, Green) |

### 🐛 Bugs corrigés
- ✅ IDs HTML/JS incohérents
- ✅ API key ne se sauvegardait pas
- ✅ Absence de guide API
- ✅ Références d'éléments undefined
- ✅ Pas de validation d'entrées

---

## 📞 Dépannage

### L'API key ne se sauvegarde pas
**Solution v0.2** : Ce bug est maintenant corrigé ! Les IDs HTML et JavaScript sont synchronisés.

### Le popup ne s'affiche pas
- Vérifiez que vous êtes sur une page YouTube
- Rechargez l'extension dans `chrome://extensions`
- Rafraîchissez la page YouTube

### Pas de statistiques dislikes
- Return YouTube Dislike API peut être temporairement indisponible
- Vérifiez la connexion internet
- Réessayez dans quelques instants

### Les paramètres ne sont pas sauvegardés
- Vérifiez que le stockage synchronisé Chrome fonctionne
- Connectez-vous à votre compte Google
- Réinstallez l'extension

### Signal d'erreur API
- Vérifiez que votre clé API est correcte
- Vérifiez que YouTube Data v3 est activée dans Google Console
- Attendez quelques secondes et réessayez

---

## 📝 Licence

MIT License - Libre d'utilisation et de modification

## 🤝 Support

- **GitHub Issues** - https://github.com/MrOlim/BlueFox-Stats/issues
- **Pull Requests** - Contributions bienvenues !

## ⭐ Si vous aimez BlueFox Stats
N'oubliez pas de laisser une ⭐ sur GitHub et d'évaluer l'extension !

---

**Fait avec 💙 par BlueFox**  
v0.2 - Avril 2024

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
