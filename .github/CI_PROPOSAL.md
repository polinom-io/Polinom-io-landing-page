# GitHub Actions proposal

This repo currently has no CI: nothing checks a change before it lands, and
nothing publishes the site anywhere. That's a real gap given how much of it
is hand-kept in sync by whoever's editing — `locales/en.json` and
`locales/es.json` need the same key set, and every `data-i18n*` attribute in
`index.html` needs a matching key in the locale files. Both have already
drifted once or twice during this project's normal editing. This proposes
two workflows to catch that automatically, plus auto-deploy to GitHub Pages
since the site is static with zero build step — a straight file copy is a
full deployment.

## What's included

### `workflows/ci.yml` — runs on every push and pull request

1. **HTML5 validation** (`html5validator`) — catches malformed markup in
   `index.html` (unclosed tags, invalid attributes, etc.).
2. **`scripts/check_locales.py`** — parses every file under `locales/` as
   JSON and fails if any locale's key set doesn't exactly match the others.
   This is what would have caught it if `es.json` had ever fallen out of
   sync with `en.json`.
3. **`scripts/check_i18n_keys.py`** — extracts every key referenced via
   `data-i18n`, `data-i18n-html`, or `data-i18n-aria` in `index.html` and
   fails if any of them aren't defined in `locales/en.json` (a typo'd key
   silently shows nothing, since `js/i18n.js` just skips keys it can't
   find). Also warns (non-fatal) about locale keys no longer referenced in
   the markup, as a dead-entry signal.

All three checks were run locally against the current repo before writing
this proposal — they pass clean.

### `workflows/deploy.yml` — runs on push to `main`

Runs the same three checks, then — only if they pass — deploys the repo
root straight to GitHub Pages via the official `actions/upload-pages-artifact`
+ `actions/deploy-pages` actions. No build step, because there isn't one:
`index.html` already references `css/`, `js/`, `fonts/`, and `locales/` by
relative path, so the deployed site is just the repo as-is.

## Manual step required (one-time, can't be done from a workflow)

This repo has no GitHub remote yet. Once it's pushed to GitHub:

1. Go to **Settings → Pages** on the GitHub repo.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.

Until that's set, `deploy.yml` will run and pass validation but the deploy
step will fail — GitHub Pages has to be explicitly pointed at "GitHub
Actions" as its source before `actions/deploy-pages` has anywhere to publish
to. This is a repo-settings change, not something a workflow file can flip
on its own.

## What this deliberately leaves out

- **No Node/npm tooling** — the repo has zero JS dependencies today (see
  the README), so CI stays on Python (already on every GitHub runner) rather
  than introducing a `package.json` and `node_modules` just to run a linter.
- **No visual regression / screenshot testing** — would need a headless
  browser step and reference images to maintain; worth adding later if the
  page keeps evolving, not proposed here.
- **No custom domain / CNAME setup** — out of scope until there's an actual
  domain decision to make.
