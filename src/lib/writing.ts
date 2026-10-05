import { getCollection, type CollectionEntry } from "astro:content";
import { showDrafts } from "../data/site";

export type Essay = CollectionEntry<"writing">;

/** Essays visible on this build. Held essays only appear on local and preview builds. */
export async function getEssays(): Promise<Essay[]> {
  const all = await getCollection("writing", (e) => showDrafts || !e.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export function readTime(body = ""): string {
  const words = body.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 230))} min read`;
}
