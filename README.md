# Daily Checklist

A phone-friendly to-do web app (PWA) with:

- **Every day** items that reset each morning
- **One-time** items that carry over until finished
- Confetti when you check something off
- **History** so you can undo a mistaken check
- Symbols and colors per item

## Live site

**https://kirk-creator.github.io/To-do/**

GitHub Pages must serve the **built** app (not the raw Vite source). Pick one:

1. **Fastest:** Settings → Pages → Branch → **`gh-pages`** / root (a built deploy branch is already published)
2. **Ongoing:** Settings → Pages → Source → **GitHub Actions** (workflow builds on every push to `main` after merge)

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

Or build yourself and host the `dist` folder:

```bash
npm run build
npm run preview
```

Data stays in your browser’s local storage on that device.
