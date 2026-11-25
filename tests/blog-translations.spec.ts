import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";

// Every post ships in both languages: same file name under en/ and es/.
const BLOG_DIR = "src/content/blog";

function postFiles(locale: "en" | "es"): string[] {
  return readdirSync(`${BLOG_DIR}/${locale}`)
    .filter((file) => file.endsWith(".mdx"))
    .sort();
}

test("every blog post exists in English and Spanish", () => {
  expect(postFiles("es")).toEqual(postFiles("en"));
});
