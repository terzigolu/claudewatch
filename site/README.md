# ccwatch-site

Marketing site for [@terzigolu/ccwatch](https://www.npmjs.com/package/@terzigolu/ccwatch).

Self-contained Vite + React + TypeScript subproject. Does NOT import from the parent ccwatch CLI — simulates statusline output independently so its lifecycle is decoupled from the CLI version.

## Develop

```bash
cd site
npm install
npm run dev        # http://localhost:5173
npm test           # vitest — pure logic tests
npm run typecheck
npm run build      # → dist/
```

## Deploy to Cloudflare Pages

One-time setup (requires Cloudflare account, free tier is fine):

1. **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**
2. Authorize Cloudflare to access the GitHub repo `terzigolu/ccwatch`
3. Configure the build (Cloudflare's unified UI detects `wrangler.toml` at repo root):

   | Setting              | Value                                  |
   |----------------------|----------------------------------------|
   | Production branch    | `main`                                 |
   | Framework preset     | `None`                                 |
   | Root directory       | `/` (default — leave empty)            |
   | Build command        | `cd site && npm ci && npm run build`   |
   | Build output         | `site/dist`                            |
   | Node.js version      | `20`                                   |

   Repo-root `wrangler.toml` declares `name = "ccwatch"` (→ subdomain) and
   `pages_build_output_dir = "./site/dist"`. If `ccwatch.yajinn.workers.dev` is
   already taken on Cloudflare, edit the `name` field to something else
   (e.g. `ccwatch-app`) and commit.

4. **Save and Deploy**. First build takes 60–90s. Subsequent builds are <30s.
5. Site is live at `https://ccwatch.yajinn.workers.dev/` (or your chosen subdomain).
6. Every push to `main` and every PR triggers a deploy. PRs get preview URLs.

### Custom domain (optional)

If you have `ccwatch.dev` (or similar):
- Cloudflare dashboard → Pages → ccwatch → Custom domains → Set up a custom domain
- Add CNAME record pointing to `ccwatch.yajinn.workers.dev`
- HTTPS is automatic

After custom domain is wired, update `index.html`:
- `<link rel="canonical" href="https://YOUR-DOMAIN/" />`
- `og:url`, `og:image`, `twitter:image` URLs to point to the new domain

## Continuous Integration

`.github/workflows/site-ci.yml` runs on every push/PR that touches `site/`:
- typecheck (TypeScript strict)
- unit tests (Vitest)
- build (Vite)
- bundle size budget (initial JS ≤ 80KB gzipped — fails CI if exceeded)

## Project structure

```
site/
├── public/                    # static assets (fonts, favicon, og-image)
├── src/
│   ├── components/
│   │   ├── sections/          # 6 page sections + CRTFrame
│   │   ├── three/             # 3D CRT scene (lazy-loaded)
│   │   └── ui/                # 5 primitives (buttons, text effects, mock)
│   ├── lib/                   # pure logic (pricing, layout, store, ticker)
│   ├── styles/                # global + animations + crt-frame CSS
│   ├── App.tsx                # composes sections
│   └── main.tsx               # React 18 entry
└── package.json
```

See parent repo's `docs/superpowers/specs/2026-04-27-ccwatch-site-design.md` for the full design spec, and `docs/superpowers/plans/` for the four implementation plans.
