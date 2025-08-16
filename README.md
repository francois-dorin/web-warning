# Extension de détection de liens dangereux

## Description

Cette extension pour navigateurs Chrome et Firefox permet de "flagger" automatiquement les liens présents sur les pages web pour identifier s'ils figurent dans des listes de domaines potentiellement dangereux ou malveillants.

L'extension analyse tous les liens d'une page et applique une mise en forme visuelle distinctive selon deux niveaux d'alerte :

### Types de mise en forme

- ** Danger** : Lien direct vers un site figurant dans une liste noire. Le lien pointe directement vers un domaine identifié comme dangereux.

- ** Warning** : Lien faisant référence à un site dangereux (mentionné dans le texte ou l'URL) mais qui ne pointe pas directement vers le domaine malveillant.

Chaque lien détecté se voit attribuer un badge coloré et son style est modifié pour alerter visuellement l'utilisateur sur le risque potentiel avant qu'il ne clique.

![Exemple d'affichage](/docs/example.png "Exemple d'affichage")

## Installation dans les navigateurs

### Chrome Web Store
*[Lien vers le Chrome Web Store à ajouter]*

### Firefox Add-ons
*[Lien vers Firefox Add-ons à ajouter]*

### Installation manuelle (développeurs)
1. Téléchargez ou clonez ce repository
2. Exécutez `npm run build` pour compiler l'extension
3. Chargez l'extension non empaquetée depuis le dossier `dist/chrome` (Chrome) ou `dist/firefox` (Firefox)

## Listes

L'extension utilise actuellement trois sources de listes noires :

### 1. AMF - Autorité des Marchés Financiers
**Source :** [Liste noire AMF](https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/listes-noires-et-mises-en-garde)

Liste officielle des sites d'investissement non autorisés et potentiellement frauduleux, maintenue par l'Autorité des Marchés Financiers française.

### 2. Red Flag Domains
**Source :** [red.flag.domains](https://red.flag.domains/)

Base de données de domaines français très probablement malveillants (typosquatting, usurpation de marque ou de service, phishing, etc.).

### 3. Liste de domaines générée par IA
**Source :** [uBlockOrigin-HUGE-AI-Blocklist](https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist/tree/main)

Liste de domaines identifiés comme contenant exclusivement du contenu généré par intelligence artificielle.

### Import manuel de listes personnalisées

Les utilisateurs peuvent également importer leurs propres listes de domaines :

- Format accepté : fichier texte simple (`.txt`)
- Structure : un domaine par ligne
- Format des domaines : nom de domaine uniquement (sans `https://` ni chemin d'URL)

**Exemple de fichier valide :**
```
example-malicious.com
phishing-site.net
fake-bank.org
```

## Exemples

Pour tester le bon fonctionnement de l'extension, vous pouvez le vérifier en regardant la mise en page des liens ci-dessous :

 - [Lien web-archive vers news.dayfr.com](https://web.archive.org/web/20250207090936/https://news.dayfr.com/technologie/14740.html).
 - [Lien vers news.dayfr.com](https://news.dayfr.com/technologie/14740.html)
 - [Liste AMF](https://divorion.com)
 - [Liste Red Flag Domains](https://envoicourrier.fr)
 - [Liste uBlacklist HUGE AI](https://90creators.com/)
 
## Compilation()

### Prérequis
- Node.js installé sur votre système
- npm

### Instructions de compilation

1. Clonez le repository et naviguez vers le dossier racine :
```bash
git clone [url-du-repository]
cd [nom-du-dossier]
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez la compilation :
```bash
npm run build
```

### Résultat de la compilation

La commande génère l'arborescence suivante :

```
dist/
├── chrome/          # Extension pour Chrome
└── firefox/         # Extension pour Firefox
version/
├── chrome.zip   # Archive pour Chrome Web Store
└── firefox.zip  # Archive pour Firefox Add-ons
```

Les fichiers `.zip` dans le dossier `version/` sont prêts à être soumis aux stores respectifs des navigateurs.

---

## Licence

MIT