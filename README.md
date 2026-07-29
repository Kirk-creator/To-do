# Daily Checklist

A phone-friendly to-do web app (PWA) with:

- **Every day** items that reset each morning
- **One-time** items that carry over until finished
- Confetti when you check something off
- **History** so you can undo a mistaken check
- Symbols and colors per item

## Live site

**https://kirk-creator.github.io/To-do/**

The production JS/CSS bundle is committed under `assets/` so the app works even when GitHub Pages is set to **Deploy from a branch → main**. After code changes, run `npm run build:pages` (or merge to `main` and let Actions sync it).

Optional hardening in **Settings → Pages**:
- Source **GitHub Actions**, or
- Branch **`gh-pages`** / root

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Install on your phone

1. Open the live site URL above on your phone
2. On iPhone (Safari): Share → **Add to Home Screen**
3. On Android (Chrome): Menu → **Install app** / **Add to Home screen**

Or build yourself:

```bash
npm run build:pages
npm run preview
```

Data stays in your browser’s local storage on that device.
