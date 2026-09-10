# Polinom.io — landing page

A one-page site for Polinom.io, a technology consultancy, framed around solving
business growth as a polynomial equation: `P(business) = Strategy·x³ +
Engineering·x² + Data·x + Execution`. The four terms of that equation map
directly to the four service lines listed on the page.

## Structure

```
index.html        Page markup
css/styles.css     All styling, incl. @font-face declarations and light/dark theme tokens
js/main.js         Theme toggle (persists choice to localStorage)
fonts/             Self-hosted webfonts (see Fonts & licensing below)
```

No build step and no dependencies — it's static HTML/CSS/JS. To preview locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly also works, but a local server avoids any
`file://` font-loading quirks in some browsers.)

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

## Content

Marketing copy (stats, process steps, contact email) is placeholder text
standing in for real figures — swap in actual numbers, services, and contact
details before shipping.
