// Work cards. Copy is exactly as written in the build brief (sections 6 and 7).
// Pillar order everywhere: Strategy, Building, Enablement.

export type Pillar = "Strategy" | "Building" | "Enablement";
export const pillars: Pillar[] = ["Strategy", "Building", "Enablement"];

export interface WorkItem {
  slug: string;
  pillar: Pillar;
  title: string;
  stat?: string;
  status?: string;
  flagship: boolean;
  /** Homepage card copy (section 6). */
  homeSummary?: string;
  /** Work index card copy (section 7). */
  summary: string;
  /** Not shown or linked anywhere until Morgan approves. */
  draft?: boolean;
}

export const work: WorkItem[] = [
  {
    slug: "ai-first-channel",
    pillar: "Strategy",
    status: "In progress",
    flagship: true,
    title: "Building the case for an AI-first website",
    homeSummary:
      "The funnel didn't shrink. It split. Buyers now start their research with AI, and most brands aren't in the answer. I'm leading the strategy, the generative engine optimization (GEO) pilot, and the personalization design to change that.",
    summary:
      "Buyers now start their research with AI. I'm leading the CMO pitch, a generative engine optimization pilot, and a personalization framework to make sure the brand shows up in the answer.",
  },
  {
    slug: "ai-recognition-program",
    pillar: "Building",
    stat: "85 submissions",
    flagship: true,
    title: "An AI recognition program with Claude on the judging panel",
    homeSummary:
      "I designed the program, built the scoring app on a platform still in beta, and gave Claude an equal vote alongside 11 human judges.",
    summary:
      "A four-week program I designed and ran end to end, including a scoring app I built on a beta platform and a judging panel where AI had an equal vote.",
  },
  {
    slug: "ai-enablement-hub",
    pillar: "Enablement",
    stat: "170+ examples",
    flagship: true,
    title: "An AI enablement hub for 2,000 marketers",
    homeSummary:
      "One place to get oriented, build skills, and find what colleagues have already built, including a filterable library of real AI work. I designed it, built it, and run it.",
    summary:
      "The central resource for AI tools, learning, and real colleague examples, with a filterable library I built in SharePoint using native features most teams never find.",
  },
  {
    slug: "morning-briefing-agent",
    pillar: "Building",
    flagship: false,
    title: "Morning briefing agent",
    summary:
      "A Copilot agent that turns 24 hours of email, chat, and meetings into a six-part daily briefing. I piloted it, use it daily, and taught my team to build their own.",
  },
  {
    slug: "time-reporting-agent",
    pillar: "Building",
    flagship: false,
    title: "Time reporting agent",
    summary:
      "A scan-first Copilot agent that helps a team meet a new time-reporting mandate without manual recall. Built on a colleague's architecture and extended for a new use case.",
  },
  {
    slug: "enablement-survey",
    pillar: "Enablement",
    stat: "Interactive preview",
    flagship: false,
    title: "AI enablement survey",
    summary:
      "A third-year survey for a 2,000+ person audience across 50+ countries, with multi-jurisdiction legal approvals and AI-assisted analysis of open-text responses.",
  },
];

export const byPillar = (items: WorkItem[]) =>
  [...items].sort((a, b) => pillars.indexOf(a.pillar) - pillars.indexOf(b.pillar));

export const publishedWork = work.filter((w) => !w.draft);
