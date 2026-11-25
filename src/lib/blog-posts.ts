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
