import { z } from "zod";

const blogSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  publishDate: z.string(),
  globalStatus: z.enum(["draft", "publish", "future"]),
  category: z.array(z.number()),
  reading_time: z.number(),
  tags: z.array(z.number()).default([]),
  relatedBlogs: z.array(z.number()).default([]),

  platforms: z.array(
    z.object({
      platformId: z.number(),
      settings: z.object({
        slug: z.string().optional(),
        publishStatus: z.enum(["draft", "publish", "future"]).optional(),
        seoTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        canonicalUrl: z.string().optional(),
        ctaButtonText: z.string().optional(),
        ctaButtonLink: z.string().optional(),
      }),
    }),
  ),
});


export default blogSchema