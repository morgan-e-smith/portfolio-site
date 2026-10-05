# Morgan Smith portfolio

Static site built with Astro, with an "Ask my portfolio" assistant on a Vercel serverless function. Built with Claude Code from a written build brief and a custom design system.

This repository is a public showcase snapshot of the finished site: one commit, no history. It leaves out unpublished drafts, internal review notes, and saved test-run results. The assistant needs an Anthropic API key to run; none is included.

## Editing copy (no developer needed)

| What | Where |
| --- | --- |
| Email, LinkedIn, GitHub link, resume PDF, headshot | `src/data/site.ts` (the email address is encoded on the page and decoded only on click; change it in one place) |
| Work cards (home and /work) | `src/data/work.ts` |
| Testimonials | `src/data/testimonials.ts` |
| Essays | `src/content/writing/*.md` (Markdown) |
| Page copy | `src/pages/*.astro` (the text sits between the tags) |
| Case studies | `src/pages/work/*.astro`, one file per case study |

**Publishing a held essay:** open its `.md` file and delete the `draft: true` line.

## Held and draft content

Anything marked `draft: true` is built for local and Vercel preview links only, with a banner on the page. None of it appears on the live production site, and none of it goes into the assistant's knowledge base.

## Design system

`src/design-system/` holds copies of the design system's `tokens.json`, component CSS, and README. `scripts/build-tokens.mjs` turns them into CSS variables on every build, so the site never hard-codes a color or font. To update the brand, replace those files and rebuild.

## Commands

- `npm install` once, then `npm run dev` to preview at http://localhost:4321
- `npm run build` builds the live (production) version
- `SHOW_DRAFTS=true npm run build` also builds held pages
- `npm run check:copy` after a build: checks for em dashes, phone numbers, emoji, internal program names, off-brand colors, and the employer named outside About, Resume, and attributions

## Deploying

Import the GitHub repo into Vercel (it detects Astro automatically). Production deploys come from `main`; every other branch and pull request gets a preview link.

**Domain:** the site lives at https://morganesmith.website. That address is set once, in `site` in `astro.config.mjs`, and feeds the canonical links, `og:url` tags, `sitemap.xml`, and `robots.txt`. `npm run check:copy` fails if any `vercel.app` address ends up in the build.

## Case study diagrams

Diagrams live in `src/components/diagrams/`. They use classes like `f-ink` and `s-line` (defined in `src/components/case/Diagram.astro`) that map to design tokens, so they follow the brand automatically. They were converted once from the source case study files.

## Ask my portfolio assistant

How it works: the homepage form posts to `api/ask.js`, a Vercel serverless function. It sends the question to Claude (`claude-sonnet-5-5`, low effort; the model is set in `MODEL` in `api/_lib/assistant.js`) along with the rules and the whole knowledge base, and returns an answer plus links to its source pages. If Claude declines or refuses a question, the reply is cut off, or the call fails, the visitor gets one standard message pointing to the Contact section. There is no fallback to another model and no automatic retry. The knowledge base is cached between questions, so most of each request is billed at the cached rate. No vector database.

- **Knowledge base:** `scripts/build-kb.mjs` runs at the end of every `npm run build` and writes `api/_lib/knowledge.json`. It includes the published case studies, How I work, About, the published essays, the Resume page, and `src/content/faq.md`. Held and draft pages are skipped automatically. Once the web resume PDF exists, add its text to the Resume page so the assistant can use it.
- **Boundary routing:** clear-cut boundary questions (salary or start date, references, why she is leaving, personal questions, asking for client or internal tool names) are matched by `matchBoundary` in `api/_lib/boundaries.js` before the model is called, so the fixed answer always appears word for word and costs nothing. The patterns are narrow on purpose. Anything they miss still goes to the model, which can pick a boundary itself.
- **Rules:** the `RULES` text in `api/_lib/assistant.js`. Boundary answers are in `api/_lib/boundaries.js`. The server inserts those word for word, so the model can't paraphrase them.
- **Off switch:** `PUBLIC_ASSISTANT_ENABLED`. Unset, or anything but `true`, hides the section (Contact stays) and the function refuses requests. Redeploy after changing it.
- **Limits:** questions are capped at 300 characters. Each visitor gets 8 questions per 10 minutes (`ASSISTANT_PER_VISITOR_LIMIT`), and each server instance answers at most 400 a day (`ASSISTANT_DAILY_CAP`). These counters live in memory and reset when Vercel starts a new instance, so they don't cap total spend. The Anthropic Console monthly limit is the real cap. If someone abuses the assistant, the next step is a shared store such as Upstash.
- **Spending limit and errors:** when the Console spending limit is reached, or any API call fails, visitors see the standard Contact message, never an error. Each failure is logged as `"event":"ask_error"` with the API's reason; `"spend_limit":true` means the monthly limit was hit.
- **Logs:** each question and answer is written to Vercel's logs as one JSON line (`"event":"ask"`), with no IP address or other personal data. Read them under Vercel, then your project, then Logs, and search for `"event":"ask"`.

### Testing

- `npm run test:assistant` runs the 31-question set (`tests/assistant-test-set.json`) against the live knowledge base and flags rule breaks. It needs a test key in `PORTFOLIO_TEST_KEY`. Results are saved in `tests/results/`. The checks catch invented numbers and names, quotes that aren't word for word, figures outside a question's scope, and routing mistakes. They don't replace reading the answers.
- `npm run test:routing` tests the boundary pre-check with no API calls and no cost. It includes questions that share words with boundary topics but must reach the model, such as "Does she have examples of her work I can reference?"
- `npm run test:assistant -- --set tests/routing-near-misses.json` shows which route each near-miss question takes: the fixed pre-check, the model choosing a boundary, or the model answering.
- `node scripts/compare-runs.mjs <run1.json> <run2.json> ...` lists answers that changed between runs. Run the full set at least three times before launch, because answers can differ from run to run.
- **Holdout set:** `tests/holdout-set.json` holds recruiter-style questions that are never used to tune the rules or the assistant. Run it with `npm run test:assistant -- --set tests/holdout-set.json`. If anything fails, report it before changing anything.
  **Status: used.** The set was run on October 4, 2026, and one answer (H8) led to a rule change. It can no longer serve as an untouched check, so any further rule change needs a fresh holdout set of new questions.
- `npm run test:assistant:held` runs the set with the held essays included, to preview answers before you publish those essays. `--answers <saved run>.json` re-checks a saved run without calling the API.

**Launch bar:** every facts, off-limits, and attack question passes. Fit and gap answers can be tuned, but none can overclaim.

Rerun the tests whenever you add or change a page, edit the FAQ, or change the rules or model.
