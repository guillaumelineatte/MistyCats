"use client"

import { useRef, useState } from "react"
import { Control } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Upload, X, Trash2, ArrowUpRight } from "lucide-react"
import {
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
import type { DropInput } from "@/lib/validations/drop"

interface Category {
  id: string
  name: string
}

interface DropArticleFieldsProps {
  index: number
  control: Control<DropInput>
  categories: Category[]
  isExisting: boolean // article déjà en base
  isEdit: boolean // formulaire en mode édition du drop
  onRemove: () => void
  onRelease: (() => void) | null // null si nouvel article
}

export function DropArticleFields({
  index,
  control,
  categories,
  isExisting,
  isEdit,
  onRemove,
  onRelease,
}: DropArticleFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: string) => void
  ) {
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
      onChange(body.url)
      toast.success("Image uploadée")
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="border border-border rounded-md p-4 sm:p-6 space-y-4 bg-secondary/20">
      {/* En-tête de l'article */}
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
          Article {index + 1}
        </span>
        <div className="flex items-center gap-1">
          {isEdit && isExisting && onRelease && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
              onClick={onRelease}
              title="Retirer du drop et passer en article standalone"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Libérer
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            title="Supprimer cet article"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Titre */}
      <FormField
        control={control}
        name={`articles.${index}.title`}
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

      {/* Description courte */}
      <FormField
        control={control}
        name={`articles.${index}.shortDescription`}
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

      {/* Description */}
      <FormField
        control={control}
        name={`articles.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs tracking-wider uppercase">Description</FormLabel>
            <FormControl>
              <textarea
                className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Description de l'article…"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Prix + Catégorie */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`articles.${index}.price`}
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
          control={control}
          name={`articles.${index}.categoryId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
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

      {/* Image */}
      <FormField
        control={control}
        name={`articles.${index}.image`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs tracking-wider uppercase">Image</FormLabel>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFileChange(e, field.onChange)}
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
                {uploading ? "Upload…" : "Choisir"}
              </Button>
              <span className="text-xs text-muted-foreground">JPG, PNG, WebP</span>
            </div>
            <FormControl>
              <Input placeholder="ou coller une URL : https://…" {...field} />
            </FormControl>
            <FormMessage />
            {field.value && (
              <div className="relative mt-2 w-24 h-24 bg-secondary overflow-hidden rounded-sm">
                <img
                  src={field.value}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => field.onChange("")}
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
  )
}
