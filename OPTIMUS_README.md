# Optimus Prime Business

Application IA desktop Windows basee sur le corpus BOS.

## Fonctionnalites actuelles

- Interface React pour discuter avec Optimus Prime Business.
- Application desktop Electron.
- Appel API Pollinations via `https://gen.pollinations.ai/v1/chat/completions`.
- Cle API lue depuis `.env`, jamais committee.
- Corpus BOS integre dans le prompt systeme.
- Historique de conversation sauvegarde localement avec Electron Store.
- Pieces jointes:
  - fichiers texte, Markdown, JSON, CSV, HTML, code: contenu extrait;
  - PDF: texte extrait;
  - DOCX: texte extrait;
  - images: envoyees comme image multimodale quand le modele le supporte;
  - autres fichiers: nom, type et taille transmis comme contexte.
- Export de la derniere reponse en Markdown.
- Base Capacitor preparee pour une future APK Android.

## Configuration API

Copier `.env.example` vers `.env`, puis renseigner:

```env
POLLINATIONS_API_KEY=your_secret_key_here
POLLINATIONS_MODEL=openai
```

## Commandes

```bash
npm install
npm run dev
npm run build
npm run dist:win
```

Recommande pour le developpement: Node.js LTS 20 ou 22. Le projet utilise des versions exactes dans `package.json` et ne depend plus de `wait-on`, `concurrently`, `electron-store` ni de `@hapi/formula`.

## Builds locaux generes

- Windows portable: `Deliverables/Optimus-Prime-Business-Windows.zip`
- Android debug APK: `Deliverables/Optimus-Prime-Business-debug.apk`

## APK Android

La base de configuration est dans `capacitor.config.ts`.

Quand Node/npm et Android Studio sont prets:

```bash
npm run mobile:init
npm run mobile:sync
npx cap open android
```

L'APK se genere ensuite depuis Android Studio ou Gradle.

## Note Pollinations

Pollinations peut generer du texte et des medias selon les endpoints disponibles. Pour les fichiers arbitraires, l'application gere l'envoi en piece jointe: elle extrait le contenu quand c'est possible et transmet les informations utiles au modele. La generation de fichiers est geree cote application par export local des reponses.
