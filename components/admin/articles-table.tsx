"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Pencil, GripVertical, CheckCircle2, Loader2 } from "lucide-react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/admin/status-badge"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { cn } from "@/lib/utils"

interface Article {
  id: string
  title: string
  category: string
  price: number
  stock: number
  published: boolean
  image: string
}

type SaveStatus = "idle" | "saving" | "saved"

// Ligne sortable individuelle
function SortableRow({
  article,
  index,
  isDragging,
}: {
  article: Article
  index: number
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
    useSortable({ id: article.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSorting ? transition : undefined,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-secondary/30 transition-colors",
        isDragging && "opacity-40",
      )}
    >
      {/* Poignée + numéro */}
      <TableCell className="w-12">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none p-0.5 rounded transition-colors"
            aria-label="Réordonner"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground/60 tabular-nums w-4">
            {index + 1}
          </span>
        </div>
      </TableCell>

      {/* Image */}
      <TableCell className="w-16">
        <div className="w-12 h-12 bg-secondary overflow-hidden rounded-sm">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
      </TableCell>

      <TableCell className="font-medium">{article.title}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{article.category}</TableCell>
      <TableCell className="text-sm">{article.price.toFixed(2)} €</TableCell>
      <TableCell className="text-sm">{article.stock}</TableCell>
      <TableCell><StatusBadge published={article.published} /></TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/admin/articles/${article.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteDialog articleId={article.id} articleTitle={article.title} />
        </div>
      </TableCell>
    </TableRow>
  )
}

// Aperçu flottant pendant le drag
function DragPreview({ article, index }: { article: Article; index: number }) {
  return (
    <TableRow className="bg-background border border-border shadow-xl rounded-md opacity-95 flex items-center">
      <TableCell className="w-12">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
        </div>
      </TableCell>
      <TableCell className="w-16">
        <div className="w-12 h-12 bg-secondary overflow-hidden rounded-sm">
          {article.image && (
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{article.title}</TableCell>
    </TableRow>
  )
}

export function ArticlesTable({ articles: initialArticles }: { articles: Article[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const save = useCallback(async (ordered: Article[]) => {
    setSaveStatus("saving")
    try {
      await fetch("/api/articles/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ordered.map((a, i) => ({ id: a.id, order: i }))),
      })
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2500)
    } catch {
      setSaveStatus("idle")
    }
  }, [])

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return

    setArticles((prev) => {
      const oldIndex = prev.findIndex((a) => a.id === active.id)
      const newIndex = prev.findIndex((a) => a.id === over.id)
      const next = arrayMove(prev, oldIndex, newIndex)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(next), 600)
      return next
    })
  }

  const activeArticle = activeId ? articles.find((a) => a.id === activeId) : null
  const activeIndex = activeId ? articles.findIndex((a) => a.id === activeId) : -1

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md">
        <p className="text-muted-foreground text-sm tracking-wider uppercase">
          Aucun article pour l'instant
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Commencez par créer votre premier article.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Indicateur de sauvegarde */}
      <div className="flex justify-end items-center gap-1.5 mb-2 h-5">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Enregistrement…</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">Ordre enregistré</span>
          </>
        )}
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-12" />
                <TableHead className="w-16 text-xs tracking-wider uppercase">Image</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">Titre</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">Catégorie</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">Prix</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">Stock</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">Statut</TableHead>
                <TableHead className="text-right text-xs tracking-wider uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={articles.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {articles.map((article, index) => (
                  <SortableRow
                    key={article.id}
                    article={article}
                    index={index}
                    isDragging={activeId === article.id}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>

          <DragOverlay>
            {activeArticle && (
              <table className="w-full">
                <tbody>
                  <DragPreview article={activeArticle} index={activeIndex} />
                </tbody>
              </table>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
