# Denver News Station 5

A fully functional local news website for Denver News Station 5.

## Features

- 📰 **Write & Publish Articles** — Rich text editor with bold, italic, underline formatting
- 🖼️ **Image Uploads** — Drag & drop or click to upload images with captions
- 📺 **Breaking News Ticker** — Auto-scrolling headline bar
- 📋 **Staff Application Form** — Apply with Discord/Roblox info + writing samples
- 💾 **Persistent Storage** — Articles saved locally via localStorage
- 📱 **Responsive** — Works on mobile and desktop

## Getting Started (Local)

Just open `index.html` in any web browser. No server needed.

## Deploy to GitHub Pages

1. Fork or push this repo to GitHub
2. Go to **Settings → Pages**
3. Set Source to `main` branch, root folder
4. Your site will be live at `https://yourusername.github.io/denver-news-station5/`

## File Structure

```
denver-news-station5/
├── index.html   — Main HTML structure
├── style.css    — All styles
├── app.js       — Article logic, forms, modals
└── README.md    — This file
```

## Notes

- Articles are stored in the browser's `localStorage`. They will persist between sessions on the same browser/device.
- For a shared/multi-user setup, you'd need a backend (e.g. Firebase, Supabase).
- Images are stored as base64 — keep images reasonably sized (<2MB) to avoid storage limits.
