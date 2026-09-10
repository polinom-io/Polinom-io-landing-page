#!/usr/bin/env python3
"""Validate every locales/*.json file and confirm they all define the same key set."""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LOCALES_DIR = ROOT / "locales"


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

    reference_lang, reference_strings = next(iter(parsed.items()))
    reference_keys = set(reference_strings)

    for lang, strings in parsed.items():
        keys = set(strings)
        missing = reference_keys - keys
        extra = keys - reference_keys
        if missing:
            print(
                f"::error file=locales/{lang}.json::Missing keys present in "
                f"{reference_lang}.json: {sorted(missing)}"
            )
            ok = False
        if extra:
            print(
                f"::error file=locales/{lang}.json::Extra keys not present in "
                f"{reference_lang}.json: {sorted(extra)}"
            )
            ok = False

    if ok:
        print(f"OK: {len(files)} locale file(s), {len(reference_keys)} keys, all in sync.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
