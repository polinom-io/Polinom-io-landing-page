# Polinom.io — landing page

A one-page site for Polinom.io, a technology consultancy, framed around solving
business growth as a polynomial equation: `P(business) = Strategy·x³ +
Engineering·x² + Data·x + Execution`. The four terms of that equation map
directly to the four service lines listed on the page.

## Structure

```
index.html        Page markup, with data-i18n attributes for translatable text
css/styles.css     All styling, incl. @font-face declarations and light/dark theme tokens
js/main.js         Theme toggle (persists choice to localStorage)
js/i18n.js         Language loader/switcher (persists choice to localStorage)
locales/           One JSON file per language (see Internationalization below)
fonts/             Self-hosted webfonts (see Fonts & licensing below)
```

No build step and no dependencies — it's static HTML/CSS/JS. To preview locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A local server is required here, not just recommended: `js/i18n.js` fetches
`locales/*.json`, and `fetch()` of local files is blocked under the `file://`
protocol in most browsers. Opening `index.html` directly will show the
English fallback markup but the language toggle won't work.

## Design

- **Palette**: Solarized (light: base3/base03 on cream; dark: base03/base2 on
  near-black), with blue/cyan/violet/orange accents used consistently across
  both themes. Light/dark follows OS preference by default; the header toggle
  overrides it and remembers the choice per-browser.
- **Type**: display and body both run on monospace faces — Monaspace Xenon (a
  slab-serif style from GitHub's Monaspace superfamily) for headings, Hack for
  body text and equation/label accents. Both have Nerd Fonts–patched builds
  available upstream, though this page embeds the plain (unpatched) webfonts
  since no icon glyphs are used here.

## Fonts & licensing

Both fonts are self-hosted in `fonts/` rather than loaded from a CDN, so the
page has no third-party font requests at runtime.

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

Supported languages: English (`locales/en.json`) and Spanish (`locales/es.json`).

- On load, `js/i18n.js` picks a language in this order: a previously chosen
  language (`localStorage`), then the browser's `navigator.language`, then
  English as the default.
- The header button toggles between the two and remembers the choice.
- Elements are marked up with one of three attributes, matched against keys
  in the locale JSON:
  - `data-i18n="key"` — sets `textContent` (plain strings).
  - `data-i18n-html="key"` — sets `innerHTML`, for the handful of strings that
    need inline markup (the equation, the approach-card key/value lines).
    Locale values here are author-controlled markup, not user input.
  - `data-i18n-aria="key"` — sets `aria-label` (toggle button labels).
- The static English text already in `index.html` is the pre-JS fallback and
  should stay in sync with `locales/en.json`.

To add a language: copy `locales/en.json` to `locales/<code>.json`, translate
every value (keep the keys identical), and add `<code>` to the `SUPPORTED`
array in `js/i18n.js`.

## CI/CD (proposed)

`.github/workflows/` and `scripts/` contain a proposed GitHub Actions setup —
not yet active anywhere since this repo has no GitHub remote yet. See
[`.github/CI_PROPOSAL.md`](.github/CI_PROPOSAL.md) for the rationale and the
one manual step (enabling GitHub Pages) needed once it's pushed.

## Content

Marketing copy (stats, process steps, contact email) is placeholder text
standing in for real figures — swap in actual numbers, services, and contact
details before shipping.
