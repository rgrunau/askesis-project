import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.union([z.string(), z.date()]).transform((value) =>
      value instanceof Date ? value.toISOString().slice(0, 10) : value
    ),
    updatedAt: z.union([z.string(), z.date()]).transform((value) =>
      value instanceof Date ? value.toISOString().slice(0, 10) : value
    ).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
