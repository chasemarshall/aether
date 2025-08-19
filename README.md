# Aethers YouTube Frontend (Invidious / Piped)

Apple x OpenAI–styled minimal frontend to **watch** YouTube videos via **Invidious** or **Piped**.
No search/trending required; just paste a YouTube URL (or 11-char video ID) and it **plays** using your chosen instance.

## Demo UX
- Paste: `https://youtube.com/watch?v=qoO60j8inds` → plays via `https://yewtu.be/watch?v=qoO60j8inds` (by default)
- Or paste just: `qoO60j8inds`

## Quickstart

```bash
pnpm i     # or npm i / yarn
pnpm dev   # http://localhost:3000
```

## Deploy on Vercel

1. Push this folder to GitHub
2. Import in Vercel as a Next.js project (App Router)
3. (Optional) Set environment variables:
   - `NEXT_PUBLIC_DEFAULT_INVIDIOUS` (default `https://yewtu.be`)
   - `NEXT_PUBLIC_DEFAULT_PIPED` (default `https://piped.video`)
4. Deploy

## File Structure

```
app/
  globals.css
  layout.tsx
  page.tsx
components/
  Header.tsx
  SettingsPanel.tsx
  WatchView.tsx
hooks/
  useLocalStorage.ts
lib/
  backends.ts
  parseVideoId.ts
  utils.ts
next.config.mjs
package.json
postcss.config.js
tailwind.config.ts
tsconfig.json
README.md
```

## Notes

- We use **embeds** (`/watch?v=ID`) on your chosen instance for maximum compatibility.
- If your instance enforces additional CSP/CORS, use your own domain (self-hosted Invidious/Piped) in **Settings**.
- This is intentionally minimal to get **video playback** working ASAP.
- You can later extend with search/trending via each instance's API once you confirm CORS headers.
