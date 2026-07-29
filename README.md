# Daily Checklist

A phone-friendly to-do web app (PWA) with:

- **Every day** items that reset each morning
- **One-time** items that carry over until finished
- Confetti when you check something off
- **History** so you can undo a mistaken check
- Symbols and colors per item

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Install on your phone

1. Build for production: `npm run build`
2. Host the `dist` folder (Netlify, Vercel, GitHub Pages, or any static host), **or** run `npm run preview` and open that URL on your phone (same Wi‑Fi).
3. On iPhone (Safari): Share → **Add to Home Screen**
4. On Android (Chrome): Menu → **Install app** / **Add to Home screen**

Data stays in your browser’s local storage on that device.
