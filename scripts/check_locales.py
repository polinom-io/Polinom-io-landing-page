#!/usr/bin/env python3
"""Validate every src/i18n/*.json file and confirm they all define the same
set of leaf keys, recursing into nested objects and arrays."""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOCALES_DIR = ROOT / "src" / "i18n"


def flatten(node, prefix=""):
    """Return the set of dotted/indexed paths to every leaf value in `node`."""
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
    files = sorted(LOCALES_DIR.glob("*.json"))
    if not files:
        print(f"::error::No locale files found in {LOCALES_DIR}")
        return 1

    parsed = {}
    ok = True
    for path in files:
        try:
            parsed[path.stem] = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"::error file={path}::Invalid JSON: {exc}")
            ok = False

    if not ok:
        return 1

    flattened = {lang: flatten(data) for lang, data in parsed.items()}
    reference_lang, reference_keys = next(iter(flattened.items()))

    for lang, keys in flattened.items():
        missing = reference_keys - keys
        extra = keys - reference_keys
        if missing:
            print(
                f"::error file=src/i18n/{lang}.json::Missing keys present in "
                f"{reference_lang}.json: {sorted(missing)}"
            )
            ok = False
        if extra:
            print(
                f"::error file=src/i18n/{lang}.json::Extra keys not present in "
                f"{reference_lang}.json: {sorted(extra)}"
            )
            ok = False

    if ok:
        print(f"OK: {len(files)} locale file(s), {len(reference_keys)} leaf keys, all in sync.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
