# Fonts

The woff2 files are subset to Latin, Latin-1, general punctuation, super/subscripts and arrows, which covers English and Spanish text. The same range is set as `unicode-range` in `src/styles/global.css`; keep both in sync.

To regenerate from the upstream fonts (fonttools + brotli):

```sh
pyftsubset <font>.woff2 \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-209F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215" \
  --layout-features='*' --flavor=woff2 --output-file=<font>.woff2
```

`px-xenon-var.woff2` is a subset of Monaspace Xenon (SIL OFL 1.1, `LICENSE-monaspace.txt`). OFL reserves the name "Monaspace" for unmodified fonts, so the subset is renamed to "Px Xenon" in its name table and in CSS. Hack is subset under its own licence (`LICENSE-hack.txt`) and keeps its name.

Adding text in another script (for example Greek or Cyrillic) needs a wider range.
