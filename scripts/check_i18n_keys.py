#!/usr/bin/env python3
"""Confirm every data-i18n* key referenced in index.html exists in locales/en.json,
and flag any locale keys that index.html no longer references.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
EN_LOCALE = ROOT / "locales" / "en.json"

KEY_ATTR_RE = re.compile(r'data-i18n(?:-html|-aria)?="([^"]+)"')

# Applied directly by js/i18n.js (document.title, <meta name="description">)
# rather than via a data-i18n* attribute in the markup.
HANDLED_OUTSIDE_MARKUP = {"meta.title", "meta.description"}


def main() -> int:
    html = INDEX.read_text(encoding="utf-8")
    used_keys = set(KEY_ATTR_RE.findall(html)) | HANDLED_OUTSIDE_MARKUP
    defined_keys = set(json.loads(EN_LOCALE.read_text(encoding="utf-8")))

    missing = used_keys - defined_keys
    unused = defined_keys - used_keys

    ok = True
    if missing:
        print(
            f"::error file=index.html::data-i18n keys referenced in HTML but "
            f"missing from locales/en.json: {sorted(missing)}"
        )
        ok = False
    if unused:
        print(
            f"::warning file=locales/en.json::Keys defined but not referenced "
            f"in index.html (dead entries?): {sorted(unused)}"
        )

    if ok:
        print(f"OK: {len(used_keys)} data-i18n keys used in index.html, all defined.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
