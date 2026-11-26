#!/usr/bin/env python3
"""Fail when styles in src/ use literal design values instead of px-ds tokens.

Rules (px-ds adoption plan, acceptance criterion 2):
  1. No literal colours (hex, rgb(), hsl()) anywhere in CSS or inline styles.
  2. font, font-family, font-size, line-height, letter-spacing, border-radius,
     box-shadow, margin, padding, gap, inset/top/right/bottom/left and
     transition values must come from var(...) (0, auto, none and inherit are fine).
  3. Any other length literal (px, rem, em, ch, vw, vh) is only allowed:
       a. in an @media condition (custom properties can't be used there), or
       b. inside the layout block between "layout-tokens:start" and
          "layout-tokens:end" comments, until px-ds ships layout tokens, or
       c. as a border or outline width.

Run with --self-test to check the rules against built-in examples.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

COLOR = re.compile(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(")
LENGTH = re.compile(r"(?<![\w-])-?\d*\.?\d+(?:px|rem|em|ch|vw|vh)\b")
TOKEN_ONLY_PROPS = re.compile(
    r"^(?:font|font-family|font-size|line-height|letter-spacing|border-radius|box-shadow|"
    r"margin(?:-[a-z-]+)?|padding(?:-[a-z-]+)?|gap|row-gap|column-gap|inset(?:-[a-z-]+)?|"
    r"top|right|bottom|left|transition)$"
)
KEYWORDS = {"0", "auto", "none", "inherit", "initial", "unset", "normal", "transparent", "currentcolor"}
WIDTH_PROPS = re.compile(r"^(?:border(?:-[a-z]+)?|outline(?:-offset|-width)?)$")
DECLARATION = re.compile(r"(?<![\w-])(-{0,2}[a-zA-Z][\w-]*)\s*:\s*([^;{}]+)")


def value_uses_only_tokens(value: str) -> bool:
    stripped = re.sub(r"var\([^()]*(?:\([^()]*\)[^()]*)*\)", "", value)
    leftovers = [part for part in re.split(r"[\s,/]+", stripped.strip()) if part]
    # Unitless numbers (calc factors, font weights) are fine; lengths are not.
    return all(part.lower() in KEYWORDS or not LENGTH.search(part) for part in leftovers)


def check_css(text: str, origin: str) -> list[str]:
    problems: list[str] = []
    in_layout_block = False
    for number, line in enumerate(text.splitlines(), start=1):
        if "layout-tokens:start" in line:
            in_layout_block = True
        if "layout-tokens:end" in line:
            in_layout_block = False
            continue
        code = re.sub(r"/\*.*?\*/", "", line)
        if not code.strip():
            continue
        where = f"{origin}:{number}"
        if COLOR.search(code):
            problems.append(f"{where}: literal colour: {line.strip()}")
        if code.lstrip().startswith("@media"):
            continue
        for prop, value in DECLARATION.findall(code):
            prop = prop.lower()
            if prop.startswith("--"):
                if not in_layout_block and LENGTH.search(value):
                    problems.append(f"{where}: length in a custom property outside the layout block: {line.strip()}")
                continue
            if TOKEN_ONLY_PROPS.match(prop) and not value_uses_only_tokens(value):
                problems.append(f"{where}: {prop} must use px-ds tokens: {line.strip()}")
            elif not TOKEN_ONLY_PROPS.match(prop) and not WIDTH_PROPS.match(prop) and LENGTH.search(
                re.sub(r"var\([^)]*\)", "", value)
            ):
                problems.append(f"{where}: literal length in {prop}: {line.strip()}")
    return problems


def css_in_astro(text: str) -> str:
    """Inline style attributes and <style> blocks, one declaration line each."""
    chunks = re.findall(r"<style[^>]*>(.*?)</style>", text, flags=re.S)
    chunks += [f"x {{ {style} }}" for style in re.findall(r'\sstyle="([^"]*)"', text)]
    chunks += [f"x {{ {style} }}" for style in re.findall(r"\sstyle=\{`([^`]*)`\}", text)]
    chunks += [f"x {{ {name}: {value}; }}" for name, value in re.findall(r'\s(fill|stroke)="(#[^"]*)"', text)]
    return "\n".join(chunks)


def check_tree() -> list[str]:
    problems: list[str] = []
    for path in sorted(SRC.rglob("*.css")):
        problems += check_css(path.read_text(encoding="utf-8"), str(path.relative_to(ROOT)))
    for path in sorted(SRC.rglob("*.astro")):
        css = css_in_astro(path.read_text(encoding="utf-8"))
        problems += check_css(css, f"{path.relative_to(ROOT)} (inline)")
    return problems


def self_test() -> list[str]:
    bad = {
        "colour": "a { color: #fdf6e3; }",
        "rgb": "a { background: rgba(0, 0, 0, 0.5); }",
        "font size": "a { font-size: 1.05rem; }",
        "padding": "a { padding: 0 2rem; }",
        "radius": "a { border-radius: 8px; }",
        "shadow": "a { box-shadow: 0 1px 2px black; }",
        "width": "a { max-width: 1120px; }",
        "custom length": "a { --gutter: 2rem; }",
    }
    good = {
        "tokens": "a { color: var(--color-text-default); padding: var(--space-4) var(--space-8); }",
        "zero": "a { margin: 0; }",
        "border width": "a { border: 1px solid var(--color-border-subtle); }",
        "media": "@media (max-width: 720px) {",
        "layout block": "/* layout-tokens:start */\n:root { --layout-content-max: 1120px; }\n/* layout-tokens:end */",
        "var in width": "a { max-width: var(--layout-content-max); }",
        "font shorthand": "a { font: var(--text-body-md); }",
    }
    failures = [f"should fail: {name}" for name, css in bad.items() if not check_css(css, name)]
    failures += [f"should pass: {name}: {check_css(css, name)}" for name, css in good.items() if check_css(css, name)]
    return failures


def main() -> int:
    if "--self-test" in sys.argv:
        failures = self_test()
        for failure in failures:
            print(f"::error::{failure}")
        print("OK: self-test passed." if not failures else f"{len(failures)} self-test failure(s).")
        return 1 if failures else 0
    problems = check_tree()
    for problem in problems:
        print(f"::error::{problem}")
    if problems:
        print(f"{len(problems)} literal design value(s) found; use px-ds tokens.")
        return 1
    print("OK: no literal design values in src/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
