// Content-rule sweep over the built site (brief sections 3 and 15).
// Run after `npm run build`: npm run check:copy
import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p); } })(root);

const rules = [
  ["em dash", /—|&mdash;/],
  ["phone number", /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/],
  ["off-brand color word in markup", /\b(purple|violet|magenta)\b/i],
  ["emoji", /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{23F1}]/u],
  ["employer named outside About, Resume, or attributions", /Accenture(?!\.com)/],
];
// Accenture is allowed on About, Resume, and inside testimonial attributions.
const employerOk = (file, html) => /\/(about|resume)\.html$/.test(file) || !html.replace(/<figcaption[^>]*>[^<]*<\/figcaption>/g, "").includes("Accenture");

let fails = 0;
const rawFiles = [];
const oldAddress = /vercel\.app/i; // the site's address is the custom domain set in astro.config.mjs
const requiredPdfs = ["morgan-smith-resume.pdf", "time-reporting-agent-one-pager.pdf"];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(html|css|js|svg|xml|txt)$/.test(p) && rawFiles.push(p); } })(root);
for (const f of rawFiles) {
  const o = readFileSync(f, "utf8").match(oldAddress);
  if (o) { fails++; console.log(`FAIL old vercel.app address: ${f.replace(root, "")}`); }
}
// PDFs served with the site (resume, one-pager): same content rules as the pages. Needs pdftotext; skipped if missing.
const pdfRules = [["phone number", /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/], ["em dash", /\u2014/]];
const pdfs = readdirSync(root).filter((f) => f.endsWith(".pdf"));
for (const f of requiredPdfs) if (!pdfs.includes(f)) { fails++; console.log(`FAIL expected PDF missing from the build: ${f}`); }
for (const f of pdfs) {
  let text;
  try { text = execFileSync("pdftotext", [join(root, f), "-"], { encoding: "utf8" }); } catch { console.log(`note: pdftotext not available, skipped ${f}`); continue; }
  for (const [name, re] of pdfRules) { const m = text.match(re); if (m) { fails++; console.log(`FAIL ${name} in ${f} -> "${m[0]}"`); } }
}
// The email address must never appear in the built page, scripts included (EmailButton encodes it).
for (const f of files) {
  const raw = readFileSync(f, "utf8");
  const m = raw.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/);
  if (m) { fails++; console.log(`FAIL email address in page source: ${f.replace(root, "")} -> "${m[0]}"`); }
}
for (const f of files) {
  const html = readFileSync(f, "utf8").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  for (const [name, re] of rules) {
    if (name.startsWith("employer")) { if (!employerOk(f, html)) { fails++; console.log(`FAIL ${name}: ${f.replace(root, "")}`); } continue; }
    const m = html.match(re);
    if (m) { fails++; console.log(`FAIL ${name}: ${f.replace(root, "")} -> "${m[0]}"`); }
  }
}
console.log(fails ? `${fails} problem(s) in ${files.length} pages` : `All ${files.length} pages pass`);
process.exit(fails ? 1 : 0);
