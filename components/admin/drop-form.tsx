"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Plus, Upload, X, CalendarClock } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { DropArticleFields } from "@/components/admin/drop-article-fields"
import { dropSchema, type DropInput } from "@/lib/validations/drop"
import { centsToEuros } from "@/lib/money"

interface DropArticle {
  id: string
  title: string
  shortDescription: string
  description: string
  priceCents: number
  image: string
  categoryId: string
}

interface DropData {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  published: boolean
  scheduledAt: string | null
  articles: DropArticle[]
}

interface Category {
  id: string
  name: string
}

interface DropFormProps {
  drop?: DropData
  categories: Category[]
}

const emptyArticle = {
  articleDbId: undefined,
  title: "",
  shortDescription: "",
  description: "",
  price: 0 as unknown as number,
  image: "",
  categoryId: undefined as unknown as string,
}

export function DropForm({ drop, categories }: DropFormProps) {
  const router = useRouter()
  const isEdit = !!drop
  const coverFileRef = useRef<HTMLInputElement>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [articlesToRelease, setArticlesToRelease] = useState<string[]>([])
  const [scheduling, setScheduling] = useState(
    !!drop?.scheduledAt && !drop?.published
  )

  function toLocalDatetime(isoString: string | null) {
    if (!isoString) return ""
    const d = new Date(isoString)
    // Format pour input datetime-local : "YYYY-MM-DDTHH:MM"
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  }

  const form = useForm<DropInput>({
    resolver: zodResolver(dropSchema),
    defaultValues: drop
      ? {
          name: drop.name,
          description: drop.description ?? "",
          coverImage: drop.coverImage ?? "",
          published: drop.published,
          scheduledAt: toLocalDatetime(drop.scheduledAt),
          articles: drop.articles.map((a) => ({
            articleDbId: a.id,
            title: a.title,
            shortDescription: a.shortDescription,
            description: a.description,
            price: centsToEuros(a.priceCents),
            image: a.image,
            categoryId: a.categoryId,
          })),
          articlesToRelease: [],
        }
      : {
          name: "",
          description: "",
          coverImage: "",
          published: false,
          scheduledAt: null,
          articles: [emptyArticle],
          articlesToRelease: [],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "articles",
  })

  // IDs en base des articles actuellement dans le formulaire
  const currentArticleDbIds = form
    .getValues("articles")
    .map((a) => a.articleDbId)
    .filter(Boolean) as string[]

  function handleRelease(index: number) {
    const articleDbId = form.getValues(`articles.${index}.articleDbId`)
    if (articleDbId) {
      setArticlesToRelease((prev) => [...prev, articleDbId])
    }
    remove(index)
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body?.error ?? "Échec de l'upload")
        return
      }
      form.setValue("coverImage", body.url, { shouldValidate: true })
      toast.success("Image uploadée")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploadingCover(false)
      if (coverFileRef.current) coverFileRef.current.value = ""
    }
  }

  async function onSubmit(data: DropInput) {
    const scheduledAt =
      !data.published && scheduling && data.scheduledAt
        ? new Date(data.scheduledAt).toISOString()
        : null

    const payload = {
      ...data,
      scheduledAt,
      articlesToRelease,
    }

    const url = isEdit ? `/api/drops/${drop.id}` : "/api/drops"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success(isEdit ? "Drop mis à jour" : "Drop créé")
      router.push("/admin/drops")
      router.refresh()
    } else {
      const body = await res.json().catch(() => ({}))
      toast.error(body?.error ?? "Une erreur est survenue")
    }
  }

  const published = form.watch("published")
  const coverImage = form.watch("coverImage")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">

        {/* ── Informations du drop ─────────────────────────────── */}
        <div className="space-y-6">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground border-b border-border pb-2">
            Informations du drop
          </h2>

          {/* Nom */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Nom du drop</FormLabel>
                <FormControl>
                  <Input placeholder="Automne · Forêt Profonde" {...field} />
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
                <FormLabel className="text-xs tracking-wider uppercase">
                  Description <span className="text-muted-foreground normal-case">(optionnel)</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Direction artistique, thème, inspiration de cette collection…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image de couverture */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">
                  Image de couverture <span className="text-muted-foreground normal-case">(optionnel)</span>
                </FormLabel>
                <div className="flex items-center gap-3">
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-none tracking-wider uppercase text-xs"
                    disabled={uploadingCover}
                    onClick={() => coverFileRef.current?.click()}
                  >
                    {uploadingCover ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploadingCover ? "Upload…" : "Choisir un fichier"}
                  </Button>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP — max 5 Mo</span>
                </div>
                <FormControl>
                  <Input placeholder="ou coller une URL : https://…" {...field} />
                </FormControl>
                <FormMessage />
                {coverImage && (
                  <div className="relative mt-2 w-40 h-28 bg-secondary overflow-hidden rounded-sm">
                    <img
                      src={coverImage}
                      alt="Aperçu couverture"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => form.setValue("coverImage", "", { shouldValidate: true })}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        {/* ── Articles du drop ─────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground border-b border-border pb-2">
            Articles du drop
          </h2>

          {fields.map((field, index) => {
            const articleDbId = form.getValues(`articles.${index}.articleDbId`)
            const isExisting = !!articleDbId

            return (
              <DropArticleFields
                key={field.id}
                index={index}
                control={form.control}
                categories={categories}
                isExisting={isExisting}
                isEdit={isEdit}
                onRemove={() => remove(index)}
                onRelease={isExisting ? () => handleRelease(index) : null}
              />
            )
          })}

          <Button
            type="button"
            variant="outline"
            className="rounded-none tracking-wider uppercase text-xs w-full border-dashed"
            onClick={() => append(emptyArticle)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un article
          </Button>

          {form.formState.errors.articles?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.articles.root.message}
            </p>
          )}
        </div>

        {/* ── Publication ──────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground border-b border-border pb-2">
            Publication
          </h2>

          {/* Publier maintenant */}
          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Publier maintenant
                  </FormLabel>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le drop et ses articles seront visibles immédiatement.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(val) => {
                      field.onChange(val)
                      if (val) setScheduling(false)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Programmer à une date */}
          {!published && (
            <div className="rounded-md border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs tracking-wider uppercase">Programmer la publication</span>
                </div>
                <Switch
                  checked={scheduling}
                  onCheckedChange={setScheduling}
                />
              </div>
              {scheduling && (
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Le drop sera publié automatiquement à cette date.
                      </p>
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || uploadingCover}
            className="rounded-none tracking-widest uppercase text-xs"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              "Enregistrer"
            ) : (
              "Créer le drop"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-none tracking-widest uppercase text-xs"
            onClick={() => router.push("/admin/drops")}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}
