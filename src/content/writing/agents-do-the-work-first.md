---
title: "Build agents that do the work first"
pillar: Building
teaser: "The principle: the agent does the first draft of everything, including its own setup."
order: 2
---

## Agents fail at adoption, not capability

I build AI agents for my own work and for my team, mostly in Microsoft Copilot. The ones that last have something in common, and it is not how smart they are.

Most agents that get abandoned could do the job. People stopped using them because getting value out of them took more effort than doing the work themselves. The model was capable. The design asked too much of the user.

## The onboarding trap

When my team got a new weekly time-reporting requirement, I built an agent to help. Everyone had to log hours against 10 official activity categories, and nobody had a clean way to map their real work to them.

The obvious design was an onboarding interview. Five questions: your role, your programs, your stakeholders, your recurring work, what you own. Then the agent would know enough to help.

I almost built it. Then I pictured my teammates on a busy Monday, answering five open-ended questions about themselves for a tool they had not yet seen work. Most would skip it. The ones who answered would give rushed, partial answers, and the agent would be worse for it.

A setup interview feels thorough. It is actually a toll booth in front of the value.

## Scan first, then ask

So I flipped it. The agent scans the signals it can already see, like calendar, email, and chat, and drafts a profile of the person's work. The user's job is to correct the draft, not to write it.

Correcting is far easier than creating. Anyone can look at a list and say "no, that's not mine" or "you missed the weekly vendor call." Almost nobody can produce that list from a blank page on a Monday morning.

The same idea carries through the weekly cycle. The agent drafts a categorized time report with a confidence column, and the person reviews it. Afterward it suggests specific profile updates based on what it noticed that week, instead of asking "anything to update?" A vague question gets a shrug. A specific suggestion gets a yes or no.

The principle: the agent does the first draft of everything, including its own setup.

## Tell the agent what things are not

The most useful field in the time-reporting agent's profile is one most people would not think to include: known distinctions and exclusions.

Categorization errors rarely come from things the agent knows nothing about. They come from look-alikes: a meeting that sounds like program work but is really advisory, or a project name that overlaps with a different initiative. Left alone, the agent makes the same wrong call every week, and the user corrects it every week. That is exactly how trust erodes.

One line of negative knowledge, "X is not part of Y," fixes it permanently. Telling an agent what something is turns out to matter less than telling it what something is not.

## Guardrails earn the trust

My other daily agent writes me a morning briefing from the last 24 hours of email, chat, and meetings. Its most important instructions are about what not to do.

- **"Do not provide a general recap."** Without that line, the agent summarizes everything, which is the exact problem it exists to solve. Five words turned a digest into a priority list.
- **"Don't infer ownership from participation."** Being in a meeting does not mean I own its action items. Without this rule, the agent quietly assigned me other people's work.
- **"Don't invent deadlines or decisions."** If a date is not in the source, it does not go in the briefing.

Rules like these are the other half of this approach. I tested the agent privately, then ran a two-week pilot against five quality checks: signal versus noise, accuracy, prioritization, meeting prep, and midweek value. Each check had a defined fix if it fell short. The agent is now part of my morning, and I have taught my team to build their own.

## Design for the least motivated day

It is tempting to design agents for your most motivated user, on their most curious day. That person does not exist for long. The real user is busy, a little skeptical, and one bad experience away from going back to the old way.

So the bar is simple. The agent drafts, and the person corrects. It knows what things are not, not just what they are. It is told what to leave out. Build for the least motivated day, and the agent survives the rest of them.
