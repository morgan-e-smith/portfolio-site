// Fixed boundary answers from FAQ part 4. The assistant returns these word for word;
// the server substitutes the exact text, so the model can't paraphrase them.
export const BOUNDARIES = {
  compensation: "That's a conversation Morgan prefers to have directly. You can reach her by email or LinkedIn from the Contact section.",
  references: "Morgan is happy to provide references directly. Reach her through the Contact section.",
  confidential: "I can only speak to what's published on this site. The case studies describe the work without confidential details.",
  personal: "I'm here to answer questions about Morgan's professional work. Anything else is best asked of her directly.",
  leaving: "That's a conversation Morgan prefers to have directly.",
  trust: "I answer only from what's published on this site, and I link the pages each answer comes from. I can still make mistakes, so treat the case studies as the source of truth, and reach Morgan directly about anything important.",
};
export const BOUNDARY_TOPICS = {
  compensation: "Salary, compensation, or availability (including start dates)",
  references: "References",
  confidential: "Confidential details about her employer, its clients, or internal projects (including names of internal tools)",
  personal: "Personal questions unrelated to her work (age, family, relationships, contact details beyond the Contact section)",
  leaving: "Why she is leaving her current role",
  trust: "Whether to trust or believe this assistant, or how accurate it is",
};

// Clear-cut boundary questions are matched here, before the model is called, so the fixed answer
// can't be paraphrased or skipped. The patterns are deliberately narrow: they must not catch
// ordinary questions like "How does she partner with engineering?" or "Does she have client experience?".
// Anything they miss still reaches the model, which can choose a boundary itself (see RULES).
const PATTERNS = [
  ["compensation", /\b(salary|salaries|compensation|pay (expectations?|range|rate|requirements?)|rate expectations?|expected pay|how much (does|would|will|is) (she|morgan) (make|earn|want|cost|charge)|notice period|start date|when (can|could|will|would) (she|morgan) (start|join|begin)|\bshe\b.{0,30}\bavailab|\bavailability\b)/i],
  // References: the noun in the sense of people who can vouch for her. "Examples I can reference" is not one.
  ["references", /\b(references|referees)\b(?! to\b)/i, /\b(she|her|morgan|candidate)\b/i],
  ["references", /\breference (checks?|letters?|contacts?|calls?|list)\b/i],
  ["references", /\b(a|any|some)? ?(professional )?references? (for|from) (her|morgan)\b/i],
  ["leaving", /\b(why|reason)\b.{0,50}\b(leav\w*|quit\w*|resign\w*|laid off|fired|looking for a new)\b/i],
  ["trust", /\b(trust|believe|rely on|reliable|accurate|accuracy)\b/i, /\b(chat ?bot|assistant|this (bot|tool)|ai bot)\b/i],
  ["personal", /\b(married|spouse|husband|wife|boyfriend|girlfriend|kids?|children|pregnan\w*|how old|birthday|date of birth|born|religio\w*|political|home address|immigration|visa status)\b|\bher age\b|\bwhat age\b/i],
  ["confidential", /\bwhich\s+(\w+\s+)?(clients?|customers?|accounts?)\b|\b(name|names|list|identify)\b.{0,50}\b(clients?|customers?|vendors?|colleagues|coworkers|managers?|internal (tools?|systems?|platforms?|programs?|projects?))\b|\bwho\s+(are|were)\b.{0,20}\b(clients?|customers?|vendors?)\b|\b(clients?|customers?|vendors?)\s+names?\b|\bname of (the|her|a)\b.{0,30}\b(internal|vendor|client|tool|platform|system)\b/i],
];
export function matchBoundary(question) {
  const q = question.replace(/[\u2018\u2019]/g, "'");
  for (const [key, ...res] of PATTERNS) if (res.every((re) => re.test(q))) return key;
  return null;
}
