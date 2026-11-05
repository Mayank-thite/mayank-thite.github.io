# mayank-thite.github.io

Mayank Thite's portfolio: an intro page, a one-page recruiter view (`#hire`) and a nine-stop story (`#story`) under a live star sky.

- React 19 + Vite. The sky (`src/sky/engine.js`) is one canvas and one animation loop outside React.
- The intro page ships in the main bundle. The recruiter view and the story are separate chunks that load on hover, tap or click, along with their first images. The app switches views only once they're ready, so transitions don't stall.
- A small boot screen in `index.html` shows before any JavaScript runs and fades once fonts and the first view are ready.
- Copy lives in `src/content/` (`stops.js`, `projects.js`). Images are WebP in `public/s/`.
- Reduced-motion users get the calm version everywhere.

```
npm ci
npm run dev      # local
npm run build    # production build in dist/
```

Merges to `main` deploy to GitHub Pages through `.github/workflows/deploy.yml`.
