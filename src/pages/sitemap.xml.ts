// Sitemap of the published pages only. Held and draft pages are left out on every build.
import type { APIRoute } from "astro";
import { publishedWork } from "../data/work";
import { getEssays } from "../lib/writing";

export const GET: APIRoute = async ({ site }) => {
  const essays = (await getEssays()).filter((e) => !e.data.draft);
  const paths = [
    "/", "/work", "/how-i-work", "/writing", "/about", "/resume",
    ...publishedWork.map((w) => `/work/${w.slug}`),
    "/work/enablement-survey/preview",
    ...essays.map((e) => `/writing/${e.id}`),
  ];
  const urls = [...new Set(paths)].map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { "Content-Type": "application/xml" } });
};
