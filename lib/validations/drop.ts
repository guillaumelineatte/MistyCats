import { z } from "zod"

export const dropArticleSchema = z.object({
  // articleDbId = id en base (absent pour les nouveaux articles)
  articleDbId: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  shortDescription: z.string().min(1, "La description courte est requise").max(160),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  image: z.string().min(1, "L'image est requise"),
  categoryId: z.string().min(1, "La catégorie est requise"),
})

export const dropSchema = z.object({
  name: z.string().min(1, "Le nom du drop est requis"),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean(),
  scheduledAt: z.string().nullable().optional(),
  articles: z.array(dropArticleSchema).min(1, "Au moins un article est requis"),
  articlesToRelease: z.array(z.string()).optional(),
})

export type DropInput = z.infer<typeof dropSchema>
export type DropArticleInput = z.infer<typeof dropArticleSchema>
