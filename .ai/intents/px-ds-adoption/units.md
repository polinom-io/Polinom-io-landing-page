# Units: px-ds adoption

Each unit is one or more bolts; each bolt is one squash PR in the owning repo. Contract between the two repos = the published `@polinom-io/px-ds-react` version; the landing never depends on a px-ds branch.

| Unit | Repo | What | Depends on | Done when |
|---|---|---|---|---|
| U1 | landing | Package access: `.npmrc` scope mapping, Actions secret for a fine-grained `read:packages` token in CI and deploy, `@astrojs/react` + `react` installed, px-ds `tokens.css` imported with no visual change yet | — | CI and deploy green with px-ds installed |
| U2 | landing | Theme attributes: `data-theme="px"`, mode on `data-mode`, pre-paint script and toggle moved to it | U1 | A1 criteria pass; tests updated |
| U3 | px-ds | Font subsetting for the web package (Latin range, `unicode-range`), documented; release | — | New px-ds release with subset fonts |
| U4 | landing | Tokens: replace the local palette, type, spacing, radius and shadow with px-ds semantic tokens and fonts; delete local font files | U2, U3, decision 1 | Acceptance criteria 2–3 |
| U5 | landing | Components: Button, Card, Stat, CurveDivider from px-ds | U4 | Local equivalents deleted |
| U6 | px-ds | MKT-01 Hero, MKT-02 Feature grid, MKT-03 CTA specs and React components, landing as reference | decision 2 | Components released |
| U7 | landing | Adopt MKT components | U6 | Section markup comes from px-ds |
| U8 | px-ds | Spec fix for the landing repo name (or rename) | decision 3 | Spec matches reality |

## Sessions

1. **Lead session** in the landing repo root: owns this intent, opens U1, U2, U4, U5, U7, and files px-ds requests as issues in `polinom-io/px-ds` (public, so linking both ways is fine).
2. **px-ds session** in the px-ds repo root: picks up U3, U6, U8 from those issues and releases through release-please; reports the released version on the issue.
3. Hand-off between sessions is the issue plus the released version, never a shared branch.
