<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1CGUqra14-4qEYi-ATB48YQOkDMxh7jRd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Cloudflare Pages

- Overview
  - Static Vite + React build served from `dist`.
  - Users paste their own API keys in the UI (no server env vars required).
  - For OpenAI‑compatible providers, a Pages Function at `/api/chat` proxies requests to avoid CORS.

- Prerequisites
  - GitHub repo with this project, or a local build to upload.
  - Cloudflare account.

- Connect to Git (recommended)
  1. Push your repo to GitHub.
  2. Cloudflare Dashboard → Pages → Create a project → Connect to Git → pick your repo.
  3. Build settings:
     - Framework preset: Vite (or None)
     - Build command: `npm run build`
     - Build output directory: `dist`
     - Environment variables: none required
  4. Deploy. Your app will be available at `https://<project>.pages.dev`.

- Single‑Page App routing
  - Ensure `public/_redirects` exists with: `/* /index.html 200`.
  - This repo includes `public/_redirects`, so deep links work after build.

- API proxy (OpenAI‑compatible)
  - Function file: `functions/api/chat.ts`
  - Frontend calls: `POST /api/chat` with header `x-api-key: <your provider key>` and JSON body `{ baseUrl, model, messages, temperature }`.
  - The function forwards to `<baseUrl>/chat/completions` and returns the response with CORS headers.

- Local preview (optional)
  1. Install Wrangler: `npm i -g wrangler`
  2. Build assets: `npm run build`
  3. Run: `wrangler pages dev dist`
  4. Open the local URL; `/api/chat` works locally too.

- Direct upload (no Git)
  1. `npm run build`
  2. Cloudflare Pages → Create a project → Upload assets → drag‑drop the `dist/` folder.

- Using the app after deploy
  - Click the `API` button in the header.
  - Provider: choose Gemini or OpenAI‑compatible.
  - Paste your API key. For OpenAI‑compatible, use a preset to fill Base URL/model or enter manually.
  - Save and start a new chat.

## Edit Embedded Knowledge (No PDFs)

- Files: `knowledge/en.json`, `knowledge/fr.json`
- What they do: Add concise rules, decision paths, and interpretation guidance; the app injects these into the Gemini system prompt.
- How to edit:
  - Keep items short and specific.
  - Prioritize differential tests (oxidase/catalase/indole/MR-VP) and clinical interpretation (e.g., urine CFU thresholds).
  - Update both EN and FR if you use both languages.
- Preview in app: Click `KB` in the header to view what is injected for the current language.
