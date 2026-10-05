// Builds the "Ask my portfolio" knowledge base from the built site (brief section 13):
// published case studies, How I work, About, published essays, the resume page, and the FAQ.
// Held or draft pages carry a noindex tag and are skipped, so they never reach the assistant.
// Runs after `astro build`. Output: api/_lib/knowledge.json (bundled with the serverless function).
//
// KB_INCLUDE_HELD=true adds held essays. For testing only; never set it on Vercel.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const dist = new URL("../dist/", import.meta.url);
const includeHeld = process.env.KB_INCLUDE_HELD === "true";

const routes = [
  "/work/ai-first-channel", "/work/ai-recognition-program", "/work/ai-enablement-hub",
  "/work/morning-briefing-agent", "/work/time-reporting-agent", "/work/enablement-survey",
  "/how-i-work", "/about", "/resume",
  "/writing/the-funnel-split", "/writing/agents-do-the-work-first", "/writing/claude-as-a-judge",
];

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rarr;/g, "→").replace(/&ldquo;|&rdquo;/g, '"').replace(/&middot;/g, "·").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

function toText(html) {
  let main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/) || [, ""])[1];
  main = main.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "");
  main = main.replace(/<h([1-3])[^>]*>/g, (_, l) => "\n\n" + "#".repeat(+l) + " ").replace(/<\/h[1-3]>/g, "\n");
  main = main.replace(/<(li|tr)[^>]*>/g, "\n- ").replace(/<\/t[dh]>/g, " | ").replace(/<(p|div|section|figure|blockquote|dt|dd|br)[^>]*>/g, "\n");
  main = decode(main.replace(/<[^>]+>/g, ""));
  return main.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n").replace(/\n(#+ )/g, "\n\n$1");
}

const pages = [];
const skipped = [];
for (const r of routes) {
  const file = new URL("." + r + ".html", dist);
  if (!existsSync(file)) { skipped.push(`${r} (not built)`); continue; }
  const html = readFileSync(file, "utf8");
  const held = /<meta name="robots" content="noindex/.test(html);
  if (held && !(includeHeld && r.startsWith("/writing/"))) { skipped.push(`${r} (held)`); continue; }
  const title = decode((html.match(/<title>([^<|]+)/) || [, r])[1].trim());
  let text = toText(html);
  // The resume page shows the PDF, which a script can't read, so its text lives in src/content/resume.md.
  if (r === "/resume") text += "\n\n" + readFileSync(new URL("../src/content/resume.md", import.meta.url), "utf8").replace(/<!--[\s\S]*?-->\s*/g, "").trim();
  pages.push({ url: r, title, text });
}
const faq = readFileSync(new URL("../src/content/faq.md", import.meta.url), "utf8").replace(/<!--[\s\S]*?-->\s*/g, "").trim();

const kb = { builtAt: new Date().toISOString(), includeHeld, pages, faq };
writeFileSync(new URL("../api/_lib/knowledge.json", import.meta.url), JSON.stringify(kb, null, 1));
const chars = pages.reduce((n, p) => n + p.text.length, 0) + faq.length;
console.log(`knowledge.json: ${pages.length} pages + FAQ, ~${Math.round(chars / 4 / 1000)}k tokens${includeHeld ? " (TEST: held essays included)" : ""}`);
if (skipped.length) console.log("skipped:", skipped.join(", "));
