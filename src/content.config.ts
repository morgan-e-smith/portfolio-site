import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const writing = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    pillar: z.enum(["Strategy", "Building", "Enablement"]),
    teaser: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    // true = held: built for local and preview review only, never on the live site.
    draft: z.boolean().default(false),
    holdReason: z.string().optional(),
  }),
});

export const collections = { writing };
