# Polinom.io — landing page

A one-page site for Polinom.io, a technology consultancy, framed around solving
business growth as a polynomial equation: `P(business) = Strategy·x³ +
Engineering·x² + Data·x + Execution`. The four terms of that equation map
directly to the four service lines listed on the page.

Built with [Astro](https://astro.build) — static output, no client-side
framework runtime shipped to the browser.

## Structure

```
astro.config.mjs        Astro config: i18n locales/routing
src/
  layouts/Layout.astro   <head>, meta tags, theme pre-hydration script
  components/            One component per section (Hero, Approach, Services,
                          Process, Stats, Contact, Footer) + Header + HomePage
  i18n/
    en.json, es.json      Translation strings (nested JSON, one file per language)
    ui.ts                 useTranslations(lang) / useDictionary(lang) helpers
  pages/
    index.astro            English — served at /
    es/index.astro         Spanish — served at /es/
  styles/global.css       All styling: @font-face, light/dark theme tokens
public/fonts/            Self-hosted webfonts (see Fonts & licensing below)
scripts/                 Python validation scripts, run in CI (see below)
```

## Local development

```bash
npm install
npm run dev       # http://localhost:4321, live reload
npm run build     # outputs static site to dist/
npm run preview   # serve the dist/ build locally
npm run check     # Astro/TypeScript diagnostics
```

## Design

- **Palette**: Solarized (light: base3/base03 on cream; dark: base03/base2 on
  near-black), with blue/cyan/violet/orange accents used consistently across
  both themes. Light/dark follows OS preference by default; the header toggle
  overrides it and remembers the choice per-browser (`localStorage`).
- **Type**: display and body both run on monospace faces — Monaspace Xenon (a
  slab-serif style from GitHub's Monaspace superfamily) for headings, Hack for
  body text and equation/label accents. Both have Nerd Fonts–patched builds
  available upstream, though this page embeds the plain (unpatched) webfonts
  since no icon glyphs are used here.

## Fonts & licensing

Both fonts are self-hosted in `public/fonts/` rather than loaded from a CDN,
so the page has no third-party font requests at runtime.

| File | Font | License |
|---|---|---|
| `hack-regular.woff2`, `hack-bold.woff2` | [Hack](https://github.com/source-foundry/Hack) | MIT (+ Bitstream Vera / DejaVu heritage) — see `LICENSE-hack.txt` |
| `monaspace-xenon-var.woff2` | [Monaspace Xenon](https://github.com/githubnext/monaspace) | SIL Open Font License 1.1 — see `LICENSE-monaspace.txt` |

If you want the Nerd Fonts–patched builds (for icon glyphs, e.g. in a
terminal or editor config using these same faces), grab those separately from
the [nerd-fonts releases](https://github.com/ryanoasis/nerd-fonts/releases) —
they're not needed for this page and are much larger due to the bundled icon
sets.

## Internationalization

Supported languages: English (`src/i18n/en.json`) and Spanish
(`src/i18n/es.json`), using Astro's built-in i18n routing.

- English is the default locale and lives at `/`; Spanish lives at `/es/` —
  two genuinely separate static pages (`src/pages/index.astro` and
  `src/pages/es/index.astro`), both rendering the shared `HomePage.astro`
  with a different `lang` prop. No client-side fetch or DOM-swapping: the
  right language is in the HTML on first byte.
- The header's language pill is a plain `<a>` to the other locale's URL
  (`otherLang()` in `src/i18n/ui.ts` picks it), with a flag (🇺🇸/🇪🇸) next to
  the code.
- Components call `t("some.key")` (from `useTranslations(lang)`) for scalar
  strings, or `useDictionary(lang)` directly for structured/list data
  (`services.terms`, `process.steps`, `approach.card`, `stats.items`).
- `t()` falls back to the English value if a key is missing for the current
  language, so a partial translation degrades instead of breaking.

To add a language: copy `src/i18n/en.json` to `src/i18n/<code>.json`,
translate every value (keep the key structure identical), add `<code>` to
`locales` in `astro.config.mjs`, add it to the `dictionaries` map and
`languages` in `src/i18n/ui.ts`, and add `src/pages/<code>/index.astro`
(same two lines as `src/pages/es/index.astro`, with `lang="<code>"`).

## Validation

Two Python scripts (no Node dependency, since they only read files) back up
what TypeScript already checks structurally:

- `scripts/check_locales.py` — every `src/i18n/*.json` file must define
  exactly the same set of leaf keys (recursing into nested objects/arrays).
- `scripts/check_i18n_keys.py` — every `t("...")` call anywhere in
  `src/**/*.astro` must resolve to a key that actually exists in
  `src/i18n/en.json`.

Run them with `npm run check-locales` / `npm run check-i18n-keys`, or
`python3 scripts/<name>.py` directly.

## CI/CD (proposed)

`.github/workflows/` contains a proposed GitHub Actions setup — not yet
active anywhere since this repo has no GitHub remote yet. See
[`.github/CI_PROPOSAL.md`](.github/CI_PROPOSAL.md) for the rationale and the
one manual step (enabling GitHub Pages) needed once it's pushed.

## Content

Marketing copy (stats, process steps, contact email) is placeholder text
standing in for real figures — swap in actual numbers, services, and contact
details before shipping.
