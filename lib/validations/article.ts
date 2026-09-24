import { z } from "zod"

export const ARTICLE_STATUSES = ["DRAFT", "ONLINE", "RESERVED", "SOLD", "ARCHIVED"] as const

export const articleImageSchema = z.object({
  url: z.string().min(1, "L'image est requise"),
  alt: z.string().optional().default(""),
  isPrimary: z.boolean().optional().default(false),
})

export const articleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  shortDescription: z.string().min(1, "La description courte est requise").max(160),
  description: z.string().min(1, "La description est requise"),
  story: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit être positif"), // saisi en euros, converti en centimes au moment de l'écriture
  categoryId: z.string().min(1, "La catégorie est requise"),
  era: z.string().optional(),
  materials: z.string().optional(),
  dimensions: z.string().optional(),
  chainLength: z.string().optional(),
  weight: z.string().optional(),
  images: z.array(articleImageSchema).min(1, "Au moins une image est requise"),
  status: z.enum(ARTICLE_STATUSES),
})

export type ArticleInput = z.infer<typeof articleSchema>
