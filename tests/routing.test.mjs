// Free regression test for the boundary pre-check (api/_lib/boundaries.js). No API calls.
//   npm run test:routing
// "yes" questions must be caught by the pre-check with that boundary; "no" questions must reach the model.
import { matchBoundary } from "../api/_lib/boundaries.js";

const yes = {
  compensation: ["What is her salary expectation?", "When can she start?", "What are her compensation expectations?", "Is she available to start soon?", "What is her pay range?"],
  references: ["Can I get references for her?", "Does she have references?", "Can I get a reference for her?", "Can I talk to her references?", "Do you have a reference check contact?"],
  leaving: ["Why is she leaving her current role?", "Why is she looking for a new role?"],
  personal: ["Is she married?", "How old is she?", "Does she have kids?", "What is her age?"],
  trust: ["Why should I believe anything this chatbot says about her?", "Can I trust this assistant?", "How accurate is this chatbot?"],
  confidential: ["Which Accenture clients has she worked with?", "What is the name of the internal tool in a case study?", "Name the clients she worked with", "Who were her clients?", "What vendor names appear in the GEO pilot?"],
};
const no = [
  "Can she be trusted with confidential data?", "How accurate are her adoption numbers?", "Why should we believe her adoption numbers?",
  // Morgan's near-misses, October 4
  "What AI tools does she use?", "How does she use Copilot?", "Does she have examples of her work I can reference?",
  "What kind of clients or industries has she supported?", "Is she open to relocating to New York?",
  // other ordinary questions that share words with the boundary topics
  "Can I reference her case studies?", "Are there references to Claude in her work?", "Which case study can I reference in an interview?",
  "How does she partner with engineering?", "Does she have client experience?", "What tools are available to marketers on the hub?",
  "Tell me about the client case studies she wrote", "What was her work on the GEO pilot vendor evaluation?", "What is the AI enablement hub?",
  "Which of her projects is the most complex?", "How does she work with her manager?", "What results has she driven?", "Has she managed people?",
  "What is her working style?", "What internal programs did she lead?", "What is the funnel split?", "Does she know SQL?",
  "Which case study should I read first?", "Is she a software engineer?", "How was this site built?", "How was the assistant tested?", "Did she build this site herself?", "Why did she choose Vercel?", "What is the age of the AI program?", "How does the scoring app handle the rubric?",
];

let bad = 0;
for (const [key, qs] of Object.entries(yes)) for (const q of qs) { const got = matchBoundary(q); if (got !== key) { bad++; console.log(`MISS  expected ${key}, got ${got}: ${q}`); } }
for (const q of no) { const got = matchBoundary(q); if (got) { bad++; console.log(`WRONGLY CAUGHT as ${got}: ${q}`); } }
const total = Object.values(yes).flat().length + no.length;
console.log(bad ? `${bad} of ${total} routing checks failed` : `All ${total} routing checks pass`);
process.exit(bad ? 1 : 0);
