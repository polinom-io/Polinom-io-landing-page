#!/usr/bin/env python3
"""Confirm every t("...") key referenced across src/**/*.astro exists in
src/i18n/en.json.

This only covers scalar lookups via the t() helper. Structured/list data
accessed directly off useDictionary() (services.terms, process.steps,
approach.card, stats.items) isn't string-keyed, so it can't be grepped the
same way — that's covered instead by TypeScript via `astro check`, since
useDictionary()'s return type comes straight from the en.json/es.json
imports: a shape mismatch between the two locale files fails the build.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
EN_LOCALE = SRC / "i18n" / "en.json"

T_CALL_RE = re.compile(r't\(\s*["\']([\w.]+)["\']\s*\)')


def flatten(node, prefix=""):
    keys = set()
    if isinstance(node, dict):
        for key, value in node.items():
            keys |= flatten(value, f"{prefix}.{key}" if prefix else key)
    elif isinstance(node, list):
        for i, value in enumerate(node):
            keys |= flatten(value, f"{prefix}[{i}]")
    else:
        keys.add(prefix)
    return keys


def main() -> int:
    astro_files = sorted(SRC.rglob("*.astro"))
    used_keys = set()
    for path in astro_files:
        used_keys |= set(T_CALL_RE.findall(path.read_text(encoding="utf-8")))

    en = json.loads(EN_LOCALE.read_text(encoding="utf-8"))
    defined_keys = flatten(en)

    missing = {k for k in used_keys if k not in defined_keys}

    if missing:
        print(
            f"::error file=src/i18n/en.json::t() keys referenced in .astro "
            f"files but missing from en.json: {sorted(missing)}"
        )
        return 1

    print(f"OK: {len(used_keys)} t() keys used across {len(astro_files)} .astro file(s), all defined.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
