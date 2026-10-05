// Finds answers that changed in substance between saved test runs (same question set).
//   node scripts/compare-runs.mjs tests/results/<run1>.json tests/results/<run2>.json [<run3>.json ...]
// For each question it compares the route, sources, figures, negations, and wording, and prints the
// ones that differ. It surfaces candidates; read the printed answers to judge whether a change matters.
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);
if (files.length < 2) { console.error("Give two or more run files."); process.exit(2); }
const runs = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
const ids = runs[0].results.map((r) => r.id);

const nums = (a) => new Set([...(a || "").matchAll(/\d[\d,.]*\+?%?/g)].map((m) => m[0].replace(/[.,]$/, "")));
const negs = (a) => ((a || "").match(/\b(not|no|never|isn't|doesn't|don't|can't|cannot|none|without)\b/gi) || []).length;
const words = (a) => new Set((a || "").toLowerCase().replace(/[^a-z0-9% ]+/g, " ").split(/\s+/).filter((w) => w.length > 3));
const jaccard = (x, y) => { const i = [...x].filter((w) => y.has(w)).length; return i / (x.size + y.size - i || 1); };
const same = (x, y) => x.size === y.size && [...x].every((v) => y.has(v));

let changed = 0;
for (const id of ids) {
  const rs = runs.map((run) => run.results.find((r) => r.id === id));
  const diffs = [];
  const base = rs[0];
  for (let i = 1; i < rs.length; i++) {
    const r = rs[i];
    // Compare routes only when both runs recorded one (older runs saved the boundary only).
    const routeKind = (x) => (x.route ? (x.route === "model" ? "none" : x.route.replace(/^model chose boundary: /, "").replace("boundary pre-check", x.boundary)) : x.boundary);
    if (routeKind(base) !== routeKind(r)) diffs.push(`run ${i + 1}: route differs (${routeKind(base)} vs ${routeKind(r)})`);
    if (!same(new Set(base.sources), new Set(r.sources))) diffs.push(`run ${i + 1}: sources differ (${base.sources.join(", ") || "none"} vs ${r.sources.join(", ") || "none"})`);
    if (!same(nums(base.answer), nums(r.answer))) diffs.push(`run ${i + 1}: figures differ (${[...nums(base.answer)].join(" ")} vs ${[...nums(r.answer)].join(" ")})`);
    if (base.covered !== r.covered) diffs.push(`run ${i + 1}: covered flag differs (${base.covered} vs ${r.covered})`);
    if (Math.abs(negs(base.answer) - negs(r.answer)) >= 2) diffs.push(`run ${i + 1}: negations differ (${negs(base.answer)} vs ${negs(r.answer)})`);
    const j = jaccard(words(base.answer), words(r.answer));
    if (j < 0.45) diffs.push(`run ${i + 1}: wording overlap only ${(j * 100).toFixed(0)}%`);
    if ((base.flags.length > 0) !== (r.flags.length > 0)) diffs.push(`run ${i + 1}: automated flags differ (${base.flags.join(" | ") || "clean"} vs ${r.flags.join(" | ") || "clean"})`);
  }
  if (diffs.length) {
    changed++;
    console.log(`\n=== ${id}: ${base.q}\n${diffs.map((d) => "  - " + d).join("\n")}`);
    rs.forEach((r, i) => console.log(`  [run ${i + 1}] ${r.answer}`));
  }
}
console.log(`\n${ids.length} questions, ${runs.length} runs: ${changed} with differences the script could detect.`);
console.log("Cost per run: " + runs.map((r) => "$" + r.costUSD.toFixed(2)).join(", "));
