# SleekShot

A small web app that turns live data into share-ready PNG cards. Point it at a
YouTube video, a GitHub profile, or a GitHub repository, tweak the look in a
live preview, and export the result as a high-resolution image (or copy it
straight to the clipboard).

Everything is rendered in the browser and captured with
[`html-to-image`](https://github.com/bubkoo/html-to-image), so what you see in
the preview is exactly what gets downloaded. Style settings are remembered in
`localStorage` between visits.

## Card types

The app has three pages, switchable from the top bar:

| Page     | Route     | What it makes                                                |
| -------- | --------- | ------------------------------------------------------------ |
| YouTube  | `/`       | Video card with title, channel, thumbnail, duration & stats  |
| Profile  | `/github` | GitHub profile card with bio, stats, languages and top repos |
| Repo     | `/repo`   | Repository card with description, stars, topics and artwork  |

Each page loads data from a serverless API route, then lets you edit the
content and fully restyle the card.

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
- **Layout controls** – canvas size presets (link preview, square, story,
  wide, custom), padding, corner radius, borders, shadows and accent stripes.
- **Content controls** – edit every field (title, bio, stats, repo topics…)
  before exporting.
- **Typography** – bundled fonts (DM Sans, Instrument Serif, Space Mono, Syne),
  size and weight controls.
- **Export** – download a PNG, copy to clipboard, export every preset size, or
  batch-export multiple repos at once, at 1x/2x/3x resolution.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # run ESLint
```

### Environment variables

Create a `.env` file in the project root:

```bash
YT_API_KEY=your_youtube_data_api_v3_key   # required for the YouTube card
GITHUB_TOKEN=your_github_token            # optional, raises API rate limits
```

- `YT_API_KEY` is required to load videos on the `/` page.
- `GITHUB_TOKEN` is optional; GitHub's unauthenticated rate limit is low, so
  adding a token is recommended for the `/github` and `/repo` pages.

## API routes

These live in `api/` and run as serverless functions (deployed on Vercel):

| Route         | Purpose                                                          |
| ------------- | ---------------------------------------------------------------- |
| `/api/video`  | Resolves a YouTube URL/id into title, channel, thumbnail & stats |
| `/api/github` | Fetches a GitHub profile plus derived stars/languages/top repos  |
| `/api/repo`   | Fetches a single repository's details, languages and release     |
| `/api/img`    | Proxies whitelisted image hosts (YouTube/Google/GitHub avatars)  |

## Tech stack

React 19, Vite, and `html-to-image`. No CSS framework – styles are plain CSS in
`src/index.css` / `src/App.css`. The client routes (`/github`, `/repo`) are
rewritten to `index.html` via `vercel.json`.
