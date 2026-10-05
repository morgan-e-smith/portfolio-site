---
title: "What happened when we made Claude a judge"
pillar: Enablement
teaser: "Accuracy on average is not enough when a single score can decide an outcome."
order: 3
---

## Why we gave an AI a vote

This summer I ran a four-week AI recognition program for a 2,000-person marketing function. Colleagues submitted the agents, workflows, and prompts they had built, and 85 entries came in across four award categories.

We built a 12-member judging panel: 11 human judges and Claude. Claude did not advise the humans. It scored every entry against the same weighted rubric, Impact 50%, Reusability 30%, Creativity 20%, and its vote counted exactly as much as anyone else's.

The point was to treat AI as a participant, not a novelty. If we were asking a whole function to work alongside AI, we should be willing to do it ourselves, in public, on something people cared about.

## The good news: Claude was a strong judge

After the program closed, I measured how far each judge's scores sat from the rest of the panel. Among the judges who submitted scores, Claude's were the closest, with an average gap of 0.39 points on a 5-point scale.

That could have been a trick of playing it safe. A judge who scores everything near the middle will always look close to the average. So I checked a second measure: did each judge rank entries higher and lower in step with everyone else? Claude placed third. It was not just hugging the middle. It genuinely agreed with the panel about which work was stronger.

Its habits were reasonable, too. Claude averaged 3.46 against the humans' 3.38, so it was slightly generous. It never gave a 5 and never went below 2, while the humans ranged from 1.3 to 5.0.

But it was not the best judge. One human judge matched Claude on closeness and was far better at ranking entries, with a correlation of 0.80 to Claude's 0.43. Claude performed like one of our stronger judges. It did not outperform our best one.

## The twist: 0.02 points

When I recalculated the winners without Claude's scores, three of the four categories came out the same. The fourth did not. The human judges' favorite entry in that category finished third once Claude's score was added. The eventual winner beat it by 0.02 points.

On its own, that is just what an equal vote means. Every judge can swing a close race, and that is why you have a panel.

Here is the part that made me stop. Claude scored the entries twice. The first run was lost when the scoring app refreshed, so we ran it again, and the second run did not match the first. The leaderboard shifted between runs. A human judge who scores on Tuesday will give roughly the same scores on Wednesday. Claude, run twice on the same inputs, did not.

So one category may have been decided by which run we happened to keep.

## The real lesson: pretty good is not the bar

Most debates about AI in decisions ask one question: is the AI as good as a person? In our program, the answer was roughly yes. Claude judged about as well as our better human judges.

That turned out to be the wrong question. A human judge is accountable, and their scores are stable. You can ask them why they scored something low, and they will give you the same answer next week. Claude gave us neither. We could not show its reasoning for each entry, because the rationale was never exported, and we could not reproduce its scores.

Accuracy on average is not enough when a single score can decide an outcome. Before you give AI a deciding vote on anything, from award winners to vendor shortlists to which campaign gets budget, ask two more questions. Would it give the same answer twice? And can you show anyone why it answered the way it did?

## What I would do differently

I would put AI on the panel again. I would design it differently.

1. **Score several times and average.** Run the AI three to five times per entry and use the average. If the runs disagree widely on an entry, flag it for human review.
2. **Decide its role before scoring starts.** An equal vote, a tiebreaker, or a second opinion that humans can see but that does not count. Each is defensible. Choosing after you see the results is not.
3. **Keep everything.** Save every sub-score, every rationale, and every run. We lost the criterion-level scores and Claude's reasoning, which are exactly what would explain its biggest disagreements.
4. **Put a person on close calls.** When the margin between first and second is smaller than the AI's own run-to-run variation, a named human makes the call.

## The takeaway

We set out to test whether AI could judge as well as people. It mostly could. What we actually learned is that judging well is only half of earning a vote. The other half is being consistent and being explainable, and that half is a design problem, not a model problem. It is ours to solve.
