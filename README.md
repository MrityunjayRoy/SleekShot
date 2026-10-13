# SleekShot

Turn live data into share-ready PNG cards. Point SleekShot at a YouTube video,
a GitHub profile, or a GitHub repository, tweak the look in a live preview, and
export the result as a high-resolution image (or copy it straight to the
clipboard).

Everything is rendered in the browser and captured with
[`html-to-image`](https://github.com/bubkoo/html-to-image), so what you see in
the preview is exactly what gets downloaded. Card style settings are remembered
in `localStorage` between visits. The app chrome uses a calm, monotonic neutral
theme (light/dark) — card content keeps its own full-color presets.

## Pages

Reach every tool from the hub at `/`:

| Page           | Route      | What it makes                                                |
| -------------- | ---------- | ------------------------------------------------------------ |
| Hub            | `/`        | Landing page that links to the three builders                |
| YouTube        | `/youtube` | Video card with title, channel, thumbnail, duration & stats  |
| GitHub profile | `/github`  | Profile card with bio, stats, languages and top repos        |
| GitHub repo    | `/repo`    | Repository card with description, stars, topics and artwork  |

Each editor has a collapsible left sidebar with every option, a live canvas in
the centre and export actions in the top bar.

## Examples

Generated with the GitHub profile builder (`/github`):

![GitHub profile card example](examples/github-MrityunjayRoy.png)

![GitHub profile card example, alternate style](examples/github-MrityunjayRoy%281%29.png)

## Features

- **Live preview** that scales to fit while exporting at full size.
- **Data pulled from the source** – video stats from the YouTube Data API,
  profile/repo details from the GitHub REST API.
- **Backgrounds** – solid, gradient, image upload, blurred thumbnail, or
  automatic colors sampled from the avatar/thumbnail, plus pattern overlays.
- **Layout controls** – canvas size presets (link preview, square, portrait,
  story, wide, custom), padding, corner radius, borders, shadows and accent
  stripes.
- **Content controls** – edit every field (title, bio, stats, repo topics…)
  before exporting.
- **Typography** – bundled fonts (DM Sans, Geist, Instrument Serif, Space Mono,
  Syne), size, weight and pairing controls.
- **Export** – download a PNG, copy to clipboard, export every preset size, or
  batch-export multiple repos at once, at 1x/2x/3x resolution.

## Getting started

```bash
npm install
npm run dev      # start the Next.js dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # run ESLint
```

### Environment variables

Create a `.env` file in the project root:

```bash
YT_API_KEY=your_youtube_data_api_v3_key   # required for the YouTube card
GITHUB_TOKEN=your_github_token            # optional, raises API rate limits
```

- `YT_API_KEY` is required to load videos on the `/youtube` page.
- `GITHUB_TOKEN` is optional; GitHub's unauthenticated rate limit is low, so
  adding a token is recommended for the `/github` and `/repo` pages.

## API routes

These are Next.js route handlers under `app/api/`:

| Route         | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `/api/video`  | Resolves a YouTube URL/id into title, channel, thumbnail & stats |
| `/api/github` | Fetches a GitHub profile plus derived stars/languages/top repos  |
| `/api/repo`   | Fetches a single repository's details, languages and release     |
| `/api/img`    | Proxies whitelisted image hosts (YouTube/Google/GitHub avatars)  |

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 with a monotonic neutral token set
- [shadcn/ui](https://ui.shadcn.com) (Radix primitives) and
  [Lucide](https://lucide.dev) icons
- [next-themes](https://github.com/pacocoursey/next-themes) for light/dark
- [`html-to-image`](https://github.com/bubkoo/html-to-image) for capture

## Roadmap

1. **Shipped** — Next.js rewrite, hub landing page, dedicated `/youtube`
   route, collapsible options sidebar, monotonic app theme, full feature
   parity with the original Vite app.
2. **Next** — a screenshot-studio-style **bottom editor dock** that pulls the
   ~6 highest-frequency options (canvas size, background, card theme/palette,
   font pairing, alignment, opacity) into a persistent bar under the canvas,
   leaving the long tail in the sidebar.
3. **Later** — template gallery, JPEG/WebP export, undo/redo history, GitHub
   OAuth for higher rate limits, and live sample-card thumbnails on the hub.
