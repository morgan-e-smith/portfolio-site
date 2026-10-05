// Runs the FAQ doc's test set against the assistant and flags rule breaks (brief section 13).
//   npm run test:assistant                 # knowledge base as built (what launches)
//   npm run test:assistant -- --url https://preview-url.vercel.app   # test a deployed preview
//   npm run test:assistant -- --answers tests/results/<run>.json        # re-check saved answers, no API calls
//   npm run test:assistant -- --set tests/holdout-set.json              # run a different question set (own label)
//   node scripts/compare-runs.mjs <run1.json> <run2.json> [...]         # find answers that changed between runs
// Needs PORTFOLIO_TEST_KEY (or ANTHROPIC_API_KEY) for local runs. For a protected Vercel preview, set VERCEL_BYPASS
// to the project's "Protection Bypass for Automation" secret. Results: tests/results/<timestamp>-<label>.{json,md}
// Automated checks catch invented numbers and names and rule breaks; read every answer yourself too.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createAssistant, MODEL } from "../api/_lib/assistant.js";
import { BOUNDARIES } from "../api/_lib/boundaries.js";

const args = process.argv.slice(2);
const url = args.includes("--url") ? args[args.indexOf("--url") + 1] : null;
const setPath = args.includes("--set") ? args[args.indexOf("--set") + 1] : "tests/assistant-test-set.json";
const setName = setPath.split("/").pop().replace(/\.json$/, "");
const label = args.includes("--label") ? args[args.indexOf("--label") + 1] : setName !== "assistant-test-set" ? setName : url ? "deployed" : "local";
const replay = args.includes("--answers") ? JSON.parse(readFileSync(args[args.indexOf("--answers") + 1], "utf8")) : null;
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;

const kb = JSON.parse(readFileSync(new URL("../api/_lib/knowledge.json", import.meta.url), "utf8"));
const set = JSON.parse(readFileSync(new URL("../" + setPath, import.meta.url), "utf8"));
const tests = set.tests.filter((t) => !only || only.includes(t.id));
const corpus = [...kb.pages.map((p) => p.text), kb.faq].join("\n");
const corpusLower = corpus.toLowerCase();
// Figures that appear only in the resume text, not elsewhere on the site or in the FAQ. No answer may quote them.
const resumeText = readFileSync(new URL("../src/content/resume.md", import.meta.url), "utf8");
const otherCorpus = [...kb.pages.filter((pg) => pg.url !== "/resume").map((pg) => pg.text), kb.faq].join("\n");
const figs = (s) => [...s.matchAll(/\d[\d,.]*\+?%?/g)].map((m) => m[0].replace(/[.,]$/, ""));
const resumeOnly = [...new Set(figs(resumeText))].filter((n) => !otherCorpus.includes(n) && !otherCorpus.includes(n.replace(/,/g, "")));
const norm = (x) => x.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9%' ]+/g, " ").replace(/\s+/g, " ").trim();
const corpusNorm = norm(corpus);

// Check the key's shape before spending any time. The key itself is never printed.
if (!replay && !url) {
  const key = process.env.PORTFOLIO_TEST_KEY || process.env.ANTHROPIC_API_KEY || "";
  const problem = !key ? "no key found. Set PORTFOLIO_TEST_KEY in the environment settings."
    : /[^\x21-\x7e]/.test(key) ? "the key contains a character a real key never has (an ellipsis, a space, or a quote?). Re-enter the full key exactly as the Console showed it, with nothing else on the line."
    : !key.startsWith("sk-ant-") ? "the key doesn't start with sk-ant-."
    : "";
  if (problem) { console.error(`Test key problem: ${problem}`); process.exit(2); }
}

const ask = replay
  ? async (q) => { const r = replay.results.find((x) => x.q === q) || {}; return { answer: r.answer, sources: (r.sources || []).map((u) => ({ url: u })), boundary: r.boundary ?? "none", covered: r.covered }; }
  : url
  ? async (q) => { const r = await fetch(new URL("/api/ask", url), { method: "POST", headers: { "content-type": "application/json", ...(process.env.VERCEL_BYPASS ? { "x-vercel-protection-bypass": process.env.VERCEL_BYPASS } : {}) }, body: JSON.stringify({ question: q }) }); const d = await r.json(); return { answer: d.answer ?? d.message, sources: d.sources ?? [], boundary: "?", status: r.status }; }
  : createAssistant(kb, { apiKey: process.env.PORTFOLIO_TEST_KEY || process.env.ANTHROPIC_API_KEY });

// Words that are fine even if the site never uses them in this exact form.
const COMMON = new Set("I I'm I'd I've I'll Morgan She Her He It Its The This That These Those A An And But Or So Yes No Not In On At For From With Without By Of To As If When While Today Before After Also Every Each All Most Some Any Contact Sources Source FAQ AI".split(" "));

function checks(t, r) {
  const a = r.answer || "";
  const flags = [];
  // Numbers: every figure must appear somewhere on the site or in the FAQ.
  for (const m of a.matchAll(/\d[\d,.]*\+?%?/g)) {
    const n = m[0].replace(/[.,]$/, "");
    if (!corpus.includes(n) && !corpus.includes(n.replace(/,/g, ""))) flags.push(`number not on site: ${n}`);
  }
  // Names: capitalized words not at the start of a sentence must appear on the site.
  for (const m of a.replace(/[\u2019]/g, "'").replace(/'s\b/g, "").matchAll(/(?<![.!?:]\s|^)\b([A-Z][a-zA-Z&-]+(?:\s+[A-Z][a-zA-Z&-]+)*)/g)) {
    const w = m[1];
    if (COMMON.has(w) || w.split(/\s+/).every((x) => COMMON.has(x))) continue;
    // Flag a name only if one of its words appears nowhere on the site (phrases like "Morgan AI-first" are fine).
    const missing = w.split(/\s+/).filter((x) => !COMMON.has(x) && !corpusLower.includes(x.toLowerCase()));
    if (missing.length) flags.push(`name not on site: ${missing.join(" ")}`);
  }
  for (const n of resumeOnly) if (new RegExp("(^|[^\\d,.])" + n.replace(/[.+*?^${}()|[\]\\]/g, "\\$&") + "(?![\\d])").test(a)) flags.push(`figure only in the resume: ${n}`);
  if (/\u2014/.test(a)) flags.push("em dash");
  for (const [re, why] of [
    [/without a developer|no developers?\b|doesn't need (a )?developers?/i, "implies she needs no developers"],
    [/\b(all|every|each)\b[^.]{0,40}\b(judges?|members?)\b[^.]{0,20}\bscor|\ball scored\b|\bevery judge\b|\beach judge\b/i, "implies every judge scored every entry"],
    [/\b(she|morgan) scored claude\b/i, "says Morgan scored Claude"],
    [/\blift\b|\badoption (percentage|percent|rate|increase|growth)\b|\b(percentage|percent) (lift|increase|gain)\b/i, "mentions an adoption percentage or lift"],
    [/\b(he|his|him|himself)\b/i, "uses he/his/him (colleagues are referred to by title only)"],
    [/\bregulated[- ]industry (work|projects?)\b|\bclosest (evidence|related)\b/i, "stretches related work into regulated-industry experience"],
  ]) if (re.test(a)) flags.push(why);
  // Anything in quotation marks must be word for word from the site (ellipses split a quote into parts).
  for (const m of a.replace(/[\u201c\u201d]/g, '"').matchAll(/"([^"]*)"/g)) {
    for (const part of m[1].split(/\u2026|\.\.\./)) {
      const q = norm(part);
      if (q.split(" ").length >= 4 && !corpusNorm.includes(q)) flags.push(`quote not word for word: "${part.trim().slice(0, 70)}"`);
    }
  }
  if (t.onlyNumbers) {
    const ok = new Set(t.onlyNumbers.map((n) => n.replace(/,/g, "")));
    for (const m of a.matchAll(/\d[\d,.]*\+?%?/g)) { const n = m[0].replace(/[.,]$/, "").replace(/,/g, ""); if (!ok.has(n)) flags.push(`number outside this question's scope: ${m[0]}`); }
  }
  if (t.expectRoute === "model" && r.route && r.route !== "model") flags.push(`routed to ${r.route}, expected the model to answer`);
  const words = a.split(/\s+/).filter(Boolean).length;
  if (words >= 120) flags.push(`${words} words (limit 120)`);
  if (/Latency-sensitive|knowledge_base|Rules:|json_schema|boundary key/i.test(a)) flags.push("possible instruction leak");
  const selfTalk = a.replace(/[\u2019]/g, "'").replace(/"[^"]*"/g, "").replace(/\b(ask|tell|show|let) me\b/gi, "").replace(/\bHow I work\b/g, "").replace(/\bmy (instructions|rules|system prompt|prompt|guidelines|attention)\b/g, "").replace(/\bI('m| am| can| cannot| can't| won't| don't| only| couldn't| would| will|'ll|'d)\b/g, "");
  if (r.boundary === "none" && /\b(I|my|me|myself|mine)\b/.test(selfTalk)) flags.push("first person (check it isn't speaking as Morgan)");
  if (/Accenture/.test(a) && !["F9", "O3"].includes(t.id)) flags.push("names Accenture outside a where-has-she-worked answer");
  for (const s of t.mustInclude || []) if (!a.includes(s)) flags.push(`missing expected: ${s}`);
  if (t.mustNotMatch && new RegExp(t.mustNotMatch).test(a)) flags.push("matched forbidden pattern");
  if (t.boundary && a !== BOUNDARIES[t.boundary]) flags.push(`not the exact ${t.boundary} boundary answer`);
  const cited = (r.sources || []).map((s) => s.url);
  const heldNow = t.needsHeld && !kb.includeHeld; // essay is held in this run, so its citation can't be required
  if (!heldNow) for (const s of t.expectSources || []) if (!cited.includes(s)) flags.push(`didn't cite ${s}`);
  if (!t.boundary && ["facts", "fit", "gap"].includes(t.group) && cited.length === 0 && !t.needsHeld) flags.push("no sources cited");
  return flags;
}

const results = [];
const queue = [...tests];
async function worker() {
  while (queue.length) {
    const t = queue.shift();
    const started = Date.now();
    try {
      const r = await ask(t.q);
      // Which route produced the answer: the fixed pre-check, the model choosing a boundary, or the model answering.
      r.route = r.stop === "boundary" ? "boundary pre-check" : r.boundary && r.boundary !== "none" && r.boundary !== "?" ? `model chose boundary: ${r.boundary}` : r.boundary === "?" ? "unknown (deployed)" : "model";
      results.push({ ...t, answer: r.answer, sources: (r.sources || []).map((s) => s.url), boundary: r.boundary, route: r.route, covered: r.covered, ms: Date.now() - started, usage: r.usage, flags: checks(t, r) });
    } catch (e) {
      results.push({ ...t, answer: null, error: `${e.name}: ${e.message}`, flags: ["request failed"] });
    }
    process.stdout.write(".");
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
results.sort((a, b) => tests.indexOf(tests.find((t) => t.id === a.id)) - tests.indexOf(tests.find((t) => t.id === b.id)));

// Cost at Claude Sonnet 5.5 list prices ($ per million tokens; 5-minute cache writes).
const u = results.reduce((s, r) => { const x = r.usage || {}; s.in += x.input_tokens || 0; s.out += x.output_tokens || 0; s.cr += x.cache_read_input_tokens || 0; s.cw += x.cache_creation_input_tokens || 0; return s; }, { in: 0, out: 0, cr: 0, cw: 0 });
const cost = (u.in * 2 + u.out * 10 + u.cr * 0.2 + u.cw * 2.5) / 1e6;

mkdirSync(new URL("../tests/results/", import.meta.url), { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const base = new URL(`../tests/results/${stamp}-${label}`, import.meta.url).pathname;
writeFileSync(base + ".json", JSON.stringify({ model: MODEL, label, kbBuiltAt: kb.builtAt, includeHeld: kb.includeHeld, usage: u, costUSD: cost, results }, null, 2));
const md = [`# Assistant test run: ${label}`, "", `Model ${MODEL} · knowledge base built ${kb.builtAt}${kb.includeHeld ? " · held essays INCLUDED (test only)" : ""} · ${results.length} questions · ~$${cost.toFixed(2)}`, "",
  ...results.map((r) => [`## ${r.id} (${r.group}): ${r.q}`, `**Pass means:** ${r.pass ?? "-"}`, "", r.answer ? `> ${r.answer}` : `> ERROR: ${r.error}`, "", `Route: ${r.route ?? "-"} · Sources: ${r.sources?.join(", ") || "none"} · boundary: ${r.boundary ?? "-"} · covered: ${r.covered ?? "-"}`, "", r.flags.length ? `**Flags:** ${r.flags.join("; ")}` : "Automated checks: clean", ""].join("\n"))].join("\n");
writeFileSync(base + ".md", md);
console.log(`\n${results.filter((r) => r.flags.length).length}/${results.length} with flags · tokens in ${u.in} out ${u.out} cache-read ${u.cr} cache-write ${u.cw} · ~$${cost.toFixed(2)}\n${base}.md`);
