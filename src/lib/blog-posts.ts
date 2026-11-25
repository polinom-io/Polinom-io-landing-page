import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type BlogLocale = BlogPost["data"]["locale"];

/** Published posts for `locale`, newest first. */
export async function getPublishedPosts(locale: BlogLocale): Promise<BlogPost[]> {
  const posts = await getCollection("blog", (post) => post.data.locale === locale && !post.data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** URL slug without the locale folder: "en/four-terms" -> "four-terms". */
export function postSlug(post: BlogPost): string {
  return post.id.split("/").slice(1).join("/");
}

export function formatPostDate(date: Date, locale: BlogLocale): string {
  return date.toLocaleDateString(locale === "es" ? "es-CL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Path of the blog index for `locale`: English at the root, Spanish under /es/. */
export function blogIndexPath(locale: BlogLocale): string {
  return locale === "es" ? "/es/blog/" : "/blog/";
}

export function postPath(post: BlogPost): string {
  return `${blogIndexPath(post.data.locale)}${postSlug(post)}/`;
}

/** The same post in the other language, if it has been published. */
export async function findTranslation(post: BlogPost): Promise<BlogPost | undefined> {
  const otherLocale: BlogLocale = post.data.locale === "en" ? "es" : "en";
  const candidates = await getPublishedPosts(otherLocale);
  return candidates.find((candidate) => postSlug(candidate) === postSlug(post));
}

export function otherBlogLocale(locale: BlogLocale): BlogLocale {
  return locale === "en" ? "es" : "en";
}
