// POST /api/ask: the "Ask my portfolio" serverless function on Vercel (brief section 13).
// The API key lives only in Vercel environment variables (ANTHROPIC_API_KEY).
import { createHash } from "node:crypto";
import kb from "./_lib/knowledge.json" with { type: "json" };
import { createAssistant, MAX_QUESTION_CHARS, STANDARD_MESSAGE } from "./_lib/assistant.js";

const ENABLED = () => process.env.PUBLIC_ASSISTANT_ENABLED === "true"; // the one off switch
const PER_VISITOR = Number(process.env.ASSISTANT_PER_VISITOR_LIMIT || 8);   // questions per window
const WINDOW_MS = 10 * 60 * 1000;
const DAILY_CAP = Number(process.env.ASSISTANT_DAILY_CAP || 400);          // per server instance

let ask;
const visitors = new Map(); // hashed visitor key -> timestamps. In memory only, never logged.
let day = "", dayCount = 0;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const LIMIT_MSG = "You've asked a lot of great questions. The assistant needs a short break; try again in a few minutes, or reach Morgan through the Contact section.";

function allow(request) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; dayCount = 0; visitors.clear(); }
  if (dayCount >= DAILY_CAP) return false;
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const key = createHash("sha256").update(today + ip + (request.headers.get("user-agent") || "")).digest("hex").slice(0, 16);
  const now = Date.now();
  const recent = (visitors.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_VISITOR) return false;
  recent.push(now); visitors.set(key, recent); dayCount++;
  return true;
}

export async function POST(request) {
  if (!ENABLED()) return json({ error: "off", message: "The assistant is off right now. Reach Morgan through the Contact section." }, 503);
  let question = "";
  try { question = String((await request.json()).question || "").trim(); } catch {}
  if (!question) return json({ error: "empty", message: "Type a question about Morgan's work." }, 400);
  if (question.length > MAX_QUESTION_CHARS) return json({ error: "long", message: `Please keep questions under ${MAX_QUESTION_CHARS} characters.` }, 400);
  if (!allow(request)) return json({ error: "limit", message: LIMIT_MSG }, 429);

  try {
    ask ??= createAssistant(kb);
    const r = await ask(question);
    // Log for Morgan's review: question and answer only. No IP address or other personal data.
    console.log(JSON.stringify({ event: "ask", at: new Date().toISOString(), question, answer: r.answer, sources: r.sources.map((s) => s.url), boundary: r.boundary, covered: r.covered }));
    return json({ answer: r.answer, sources: r.sources });
  } catch (err) {
    // Any API failure, including the Anthropic Console spending limit being reached, shows the
    // visitor the standard Contact message. The log says why, so Morgan can spot a limit hit.
    const type = err?.error?.error?.type ?? err?.name;
    const detail = String(err?.error?.error?.message ?? err?.message ?? "").slice(0, 200);
    const spendLimit = /credit balance|usage limit|spend(ing)? limit|billing/i.test(detail);
    console.error(JSON.stringify({ event: "ask_error", at: new Date().toISOString(), status: err?.status ?? null, type, detail, spend_limit: spendLimit }));
    return json({ answer: STANDARD_MESSAGE, sources: [] }, 200); // failed call: same standard reply, no retry on another model
  }
}
