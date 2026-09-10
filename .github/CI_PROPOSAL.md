# GitHub Actions proposal

This repo currently has no CI: nothing checks a change before it lands, and
nothing publishes the site anywhere. That's a real gap given how much of it
is hand-kept in sync by whoever's editing — `src/i18n/en.json` and
`src/i18n/es.json` need the same key set, and every `t("...")` call in a
`.astro` component needs a matching key in the locale files. Both have
already drifted once or twice during this project's normal editing. This
proposes two workflows to catch that automatically, plus auto-deploy to
GitHub Pages once the Astro build produces `dist/`.

## What's included

### `workflows/ci.yml` — runs on every push and pull request

1. **`npm run check`** (`astro check`) — TypeScript/Astro diagnostics. This
   is also what catches structural mismatches in the data accessed directly
   off `useDictionary()` (`services.terms`, `process.steps`,
   `approach.card`, `stats.items`) — that data isn't string-keyed, so it
   can't be grepped, but `useDictionary()`'s return type comes straight from
   the `en.json`/`es.json` imports, so a shape mismatch between the two
   locale files fails the build here.
2. **`scripts/check_locales.py`** — parses every file under `src/i18n/` as
   JSON and fails if any locale's leaf-key set (recursing into nested
   objects/arrays) doesn't exactly match the others.
3. **`scripts/check_i18n_keys.py`** — extracts every key referenced via a
   `t("...")` call anywhere in `src/**/*.astro` and fails if any of them
   aren't defined in `src/i18n/en.json` (a typo'd key otherwise throws at
   render time — `useTranslations()`'s `t()` throws on a key missing from
   both the active language and the English fallback).
4. **`npm run build`** — the actual Astro static build.
5. **HTML5 validation** (`html5validator`) — run against the *built* output
   in `dist/`, not the source `.astro` files, so it's checking exactly what
   would ship.

All of this was run locally against the current repo before writing this
proposal — it passes clean.

### `workflows/deploy.yml` — runs on push to `main`

Runs the same five steps, then — only if they pass — uploads `dist/` as a
Pages artifact and deploys it via the official
`actions/upload-pages-artifact` + `actions/deploy-pages` actions.

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

- **No visual regression / screenshot testing** — would need a headless
  browser step and reference images to maintain; worth adding later if the
  page keeps evolving, not proposed here.
- **No custom domain / CNAME setup** — out of scope until there's an actual
  domain decision to make.
- **No dependency-update automation** (Dependabot/Renovate) — worth adding
  once there's a real dependency surface beyond Astro itself; not proposed
  here to keep this change focused.
