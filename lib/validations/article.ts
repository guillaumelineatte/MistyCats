import { z } from "zod"

export const CATEGORIES = [
  "Boucles d'oreilles",
  "Colliers",
  "Bracelets",
] as const

export const articleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  image: z.string().min(1, "L'image est requise"),
  category: z.enum(CATEGORIES, { required_error: "La catégorie est requise" }),
  stock: z.coerce.number().int().min(0, "Le stock doit être positif ou zéro"),
  published: z.boolean(),
})

export type ArticleInput = z.infer<typeof articleSchema>
