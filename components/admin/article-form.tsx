"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { articleSchema, type ArticleInput, CATEGORIES } from "@/lib/validations/article"

interface Article {
  id: string
  title: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  published: boolean
}

interface ArticleFormProps {
  article?: Article
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const isEdit = !!article
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<ArticleInput>({
    resolver: zodResolver(articleSchema),
    defaultValues: article
      ? {
          title: article.title,
          description: article.description,
          price: article.price,
          image: article.image,
          category: article.category as ArticleInput["category"],
          stock: article.stock,
          published: article.published,
        }
      : {
          title: "",
          description: "",
          price: 0,
          image: "",
          category: undefined,
          stock: 0,
          published: false,
        },
  })

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

      form.setValue("image", body.url, { shouldValidate: true })
      toast.success("Image uploadée")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
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
      toast.success(isEdit ? "Article mis à jour" : "Article créé")
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
        {/* Titre */}
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Description de l'article…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prix + Stock */}
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
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Catégorie */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Image</FormLabel>

              {/* Upload depuis l'appareil */}
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
                  {uploading ? "Upload…" : "Choisir un fichier"}
                </Button>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 Mo</span>
              </div>

              {/* Ou URL manuelle */}
              <FormControl>
                <Input
                  placeholder="ou coller une URL : https://…"
                  {...field}
                />
              </FormControl>
              <FormMessage />

              {/* Aperçu */}
              {field.value && (
                <div className="relative mt-2 w-32 h-32 bg-secondary overflow-hidden rounded-sm">
                  <img
                    src={field.value}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue("image", "", { shouldValidate: true })}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Publié */}
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <FormLabel className="text-xs tracking-wider uppercase">Publier l'article</FormLabel>
                <p className="mt-1 text-xs text-muted-foreground">
                  L'article sera visible sur le site public.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
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
              "Créer l'article"
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
