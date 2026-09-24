"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Upload, X, Star } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { articleSchema, type ArticleInput, ARTICLE_STATUSES } from "@/lib/validations/article"
import { centsToEuros } from "@/lib/money"

interface ArticleImage {
  url: string
  alt: string
  isPrimary: boolean
}

interface Article {
  id: string
  title: string
  shortDescription: string
  description: string
  story: string | null
  priceCents: number
  categoryId: string
  era: string | null
  materials: string | null
  dimensions: string | null
  chainLength: string | null
  weight: string | null
  status: ArticleInput["status"]
  images: ArticleImage[]
}

interface Category {
  id: string
  name: string
}

interface ArticleFormProps {
  article?: Article
  categories: Category[]
}

const STATUS_LABELS: Record<ArticleInput["status"], string> = {
  DRAFT: "Brouillon",
  ONLINE: "En ligne",
  RESERVED: "Réservé",
  SOLD: "Vendu",
  ARCHIVED: "Archivé",
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter()
  const isEdit = !!article
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          title: article.title,
          shortDescription: article.shortDescription,
          description: article.description,
          story: article.story ?? "",
          price: centsToEuros(article.priceCents),
          categoryId: article.categoryId,
          era: article.era ?? "",
          materials: article.materials ?? "",
          dimensions: article.dimensions ?? "",
          chainLength: article.chainLength ?? "",
          weight: article.weight ?? "",
          images: article.images,
          status: article.status,
        }
      : {
          title: "",
          shortDescription: "",
          description: "",
          story: "",
          price: 0,
          categoryId: undefined,
          era: "",
          materials: "",
          dimensions: "",
          chainLength: "",
          weight: "",
          images: [],
          status: "DRAFT",
        },
  })

  const images = form.watch("images")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const body = await res.json()

      if (!res.ok) {
        toast.error(body?.error ?? "Échec de l'upload")
        return
      }

      const next = [...images, { url: body.url, alt: form.getValues("title") || "", isPrimary: images.length === 0 }]
      form.setValue("images", next, { shouldValidate: true })
      toast.success("Image uploadée")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index)
    if (next.length > 0 && !next.some((img) => img.isPrimary)) next[0].isPrimary = true
    form.setValue("images", next, { shouldValidate: true })
  }

  function setPrimary(index: number) {
    const next = images.map((img, i) => ({ ...img, isPrimary: i === index }))
    form.setValue("images", next, { shouldValidate: true })
  }

  async function onSubmit(data: ArticleInput) {
    const url = isEdit ? `/api/articles/${article.id}` : "/api/articles"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success(isEdit ? "Pièce mise à jour" : "Pièce créée")
      router.push("/admin/articles")
      router.refresh()
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error ?? "Une erreur est survenue")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Titre</FormLabel>
              <FormControl>
                <Input placeholder="Collier Éclat Sauvage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Description courte</FormLabel>
              <FormControl>
                <Input placeholder="Affichée dans les listings (160 caractères max)" maxLength={160} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Description de la pièce…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="story"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Histoire de la pièce</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Provenance, matériaux upcyclés, anecdote de création… (optionnel)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Prix (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="era"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Époque estimée</FormLabel>
                <FormControl>
                  <Input placeholder="Années 1980…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="materials"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Matières</FormLabel>
                <FormControl>
                  <Input placeholder="Laiton, verre, perles de bois…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Dimensions</FormLabel>
                <FormControl>
                  <Input placeholder="3 x 2 cm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chainLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Longueur de chaîne</FormLabel>
                <FormControl>
                  <Input placeholder="45 cm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Poids</FormLabel>
                <FormControl>
                  <Input placeholder="12 g" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Images</FormLabel>

              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none tracking-wider uppercase text-xs"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? "Upload…" : "Ajouter une image"}
                </Button>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 Mo chacune</span>
              </div>
              <FormMessage />

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {images.map((img, index) => (
                    <div key={img.url} className="relative w-24 h-24 bg-secondary overflow-hidden rounded-sm group">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPrimary(index)}
                        title="Définir comme image principale"
                        className={`absolute bottom-1 left-1 rounded-full p-1 transition-colors ${img.isPrimary ? "bg-accent text-accent-foreground" : "bg-background/80 text-muted-foreground hover:bg-background"}`}
                      >
                        <Star className="h-3 w-3" fill={img.isPrimary ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Statut */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ARTICLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Seul « En ligne » rend la pièce visible et achetable sur le site public.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || uploading}
            className="rounded-none tracking-widest uppercase text-xs"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              "Enregistrer"
            ) : (
              "Créer la pièce"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-none tracking-widest uppercase text-xs"
            onClick={() => router.push("/admin/articles")}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}
