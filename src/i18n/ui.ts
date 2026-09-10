import en from "./en.json";
import es from "./es.json";

export const languages = {
  en: "English",
  es: "Español",
};

export const defaultLang = "en";

const dictionaries = { en, es } as const;

export type Lang = keyof typeof dictionaries;

function get(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined,
      obj,
    );
}

/** Returns a translator for `lang`, falling back to English for any missing key. */
export function useTranslations(lang: string) {
  const dict = dictionaries[lang as Lang] ?? dictionaries[defaultLang];

  return function t(key: string): string {
    const value = get(dict, key) ?? get(dictionaries[defaultLang], key);
    if (value === undefined) {
      throw new Error(`Missing i18n key "${key}"`);
    }
    return value as string;
  };
}

/** Returns the raw dictionary object for `lang` — for list data (services.terms, etc). */
export function useDictionary(lang: string) {
  return dictionaries[lang as Lang] ?? dictionaries[defaultLang];
}

/** The other supported language, for the language-switcher link. */
export function otherLang(lang: string): Lang {
  return lang === "en" ? "es" : "en";
}
