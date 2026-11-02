# Mayank Thite, portfolio

Live at https://mayank-thite.github.io/

An interactive sky of seven data constellations. Each one is a section of the portfolio (about, impact, experience, work, skills, education, contact), built from real data: skill stars are sized by how many roles and projects used them, impact stars by the size of the result. You fly a small ship between them, or take the guided tour. "Read it in 30 seconds" shows everything as a plain page.

## Stack

React 19, Vite, Tailwind 4, Framer Motion. The sky itself is a hand-written canvas engine in `src/sky/engine.js` that runs outside React and talks to the HUD through a tiny store (`src/store.js`).

## Where things live

| Path | What |
| --- | --- |
| `src/content/profile.js` | Name, email, links, opening copy, key numbers, resume PDF switch |
| `src/content/sky.js` | Constellation shapes, star facts and sizes |
| `src/content/Sections.jsx` | Section copy, used by both the sky panel and the text page |
| `src/sky/engine.js` | Ship, stardust, sun, comets, reveal, camera, input |
| `src/components/` | Top bar, opening screen, dock, panel, labels, star cards, tutorial, text pages |

## Run it

```bash
npm install
npm run dev      # local dev server
npm run lint
npm run build    # production build in dist/
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, builds and publishes `dist/` to GitHub Pages. In the repo settings, Pages > Build and deployment > Source must be set to **GitHub Actions**. `npm run deploy` (gh-pages branch) still works as a manual fallback.

## Keyboard

Hold the mouse to fly, `W A S D` or arrows to steer, `Space` to boost, `1` to `7` to jump, `M` for the whole map, `T` for the tour, `Enter` to skip a reveal, `?` for shortcuts, `Esc` to close.
