# Intent: adopt the px-ds design system on the landing page

**Status:** G1 proposal, decisions taken · **Created:** 2026-11-25 · **Repos:** `px-landing-page` (lead; renamed from `polinom-io-landing-page` on 2026-11-26), `px-ds` (provider)

## Why

The px-ds spec names this site as the Polinom.io theme's web consumer (§2.1, §2.2), but the site still runs its own palette, fonts and components. Adopting px-ds gives one brand across products, the contrast guarantees px-ds already checks (AA in every theme and mode), and removes a second design system to maintain.

## Audit (2026-11-25)

Landing: commit `896b097`, Astro 7, no UI framework, one stylesheet (`src/styles/global.css`, ~720 lines, 16 custom properties). px-ds: commit `2800f65`, `@polinom-io/px-ds-react` 0.2.2.

| # | Area | Landing today | px-ds | Gap and decision needed |
|---|---|---|---|---|
| A1 | Theme attributes | `data-theme="light\|dark"` on `<html>` | `data-theme="px"` (brand) + `data-mode="light\|dark"` (mode); no `data-mode` follows the OS | **Collision.** Landing must move the mode to `data-mode` and set `data-theme="px"`. Keep the pre-paint script and two-state toggle (PR #13) on the new attribute. |
| A2 | Colour | Solarized-style palette (`--bg #fdf6e3`, blue/cyan/violet/orange) | Cool neutral ramp from the logo ground (`#002B36`, light page `#F1F8FA`), violet primary, semantic `--color-*` tokens | Visible redesign. Lighthouse flags 5 light-mode contrast failures today (3.21–4.4:1); px-ds tokens fix them by construction. |
| A3 | Type | Monaspace Xenon (display) + Hack (body and mono) | Atkinson Hyperlegible Next (`--font-brand`, `--font-body`) + Hack (mono); type roles `--text-*` | **Brand decision:** drop Monaspace Xenon, or propose it to px-ds as a display role. Default: follow px-ds. PR #15's font subsetting moves to px-ds (A7). |
| A4 | Spacing, radius, shadow, motion | Ad-hoc values in CSS | `--space-*`, `--radius-*`, `--shadow-*`, `--motion-*` | Mechanical replacement. |
| A5 | Components | Astro sections: Header, Hero, Approach, Services, Process, Stats, Contact, Footer; buttons and cards as CSS classes | React: Button, Card, Stat, CurveDivider (+10 others), Astro-safe without hydration. Marketing sections MKT-01 Hero, MKT-02 Feature grid, MKT-03 CTA are P1 but not built | Use Button, Card, Stat, CurveDivider now. Hero, Services/Approach and Contact are candidates to build **in px-ds** as MKT-01/02/03, using this site as the reference. |
| A6 | Delivery | npm, no px-ds dependency | GitHub Packages (`npm.pkg.github.com`); install needs a token with `read:packages` even though the package is public | **Blocker for CI and deploy:** add `.npmrc` scope mapping and a fine-grained read-only token as an Actions secret; deploy workflow must pass it to `npm ci`. Also needs `@astrojs/react` + `react` for server-rendered components. |
| A7 | Fonts | Self-hosted, subset to Latin (PR #15: 798 KB → 170 KB) | `fonts/*` export, Atkinson variable files not subset | Subsetting belongs in px-ds so every web consumer gets it. |
| A8 | Naming | Repo `polinom-io-landing-page` | Spec calls it `px-landing-page` | px-ds spec fix, or a repo rename (decide; rename has redirect and deploy impact). |
| A9 | Browser policy | — | — | Baseline widely available; newer features behind feature detection; no polyfills (shared engineering rule). |

## Acceptance criteria

1. `<html>` carries `data-theme="px"` and `data-mode` only; no flash of the wrong mode; toggle keeps the two-state behaviour.
2. No colour, font, spacing, radius or shadow literal left in `src/` outside the px-ds imports (checked by a grep in CI).
3. Lighthouse accessibility 100 and performance ≥ 95 on `/` and `/es/` (mobile, local preview), CLS 0.
4. Playwright suite green, plus a visual check of light and dark on both locales.
5. CI and deploy install px-ds with a read-only token; no token in the repo.

## Out of scope

TreatMint product page; new marketing sections beyond what this site needs (MKT-04+); content changes.

## Decisions (Mario Espinoza, 2026-11-25)

1. A3: drop Monaspace Xenon; the site follows px-ds type (Atkinson Hyperlegible Next + Hack). Font subsetting moves to px-ds (U3).
2. A5: migrate the landing on px-ds tokens and existing components first; extract Hero, Feature grid and CTA into px-ds afterwards, with this site as the reference (U6, U7 follow U5).
3. A8: rename this repo to `px-landing-page` to match the px-ds spec (U8 becomes the rename, done by an org owner).
