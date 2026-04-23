"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Article {
  id: string
  title: string
  image: string
  published: boolean
}

interface ReorderPanelProps {
  articles: Article[]
}

type SaveStatus = "idle" | "saving" | "saved"

// Élément individuel draggable
function SortableItem({
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
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md border border-transparent transition-colors select-none",
        isDragging
          ? "opacity-30"
          : "hover:border-border hover:bg-secondary/50",
      )}
    >
      {/* Numéro */}
      <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">
        {index + 1}
      </span>

      {/* Image */}
      <div className="w-8 h-8 rounded-sm bg-secondary overflow-hidden flex-shrink-0">
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

      {/* Titre */}
      <span
        className={cn(
          "flex-1 text-xs truncate",
          !article.published && "text-muted-foreground",
        )}
      >
        {article.title}
        {!article.published && (
          <span className="ml-1.5 text-[10px] tracking-wider uppercase opacity-60">
            brouillon
          </span>
        )}
      </span>

      {/* Poignée */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none p-0.5 rounded"
        aria-label="Réordonner"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  )
}

// Aperçu flottant pendant le drag
function DragPreview({ article }: { article: Article }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-background shadow-xl opacity-95">
      <div className="w-8 h-8 rounded-sm bg-secondary overflow-hidden flex-shrink-0">
        {article.image ? (
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
      <span className="text-xs truncate max-w-[160px]">{article.title}</span>
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  )
}

export function ReorderPanel({ articles: initialArticles }: ReorderPanelProps) {
  const [articles, setArticles] = useState(initialArticles)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty = useRef(false)

  // Resync si les articles changent (refresh page)
  useEffect(() => {
    setArticles(initialArticles)
  }, [initialArticles])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch {
      setSaveStatus("idle")
    }
  }, [])

  // Auto-save avec debounce après chaque modification
  const scheduleSave = useCallback(
    (ordered: Article[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => save(ordered), 800)
    },
    [save]
  )

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
      isDirty.current = true
      scheduleSave(next)
      return next
    })
  }

  const activeArticle = activeId ? articles.find((a) => a.id === activeId) : null

  return (
    <aside className="flex flex-col w-72 flex-shrink-0">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xs tracking-widest uppercase font-medium">Ordre d'affichage</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Glissez pour réordonner
          </p>
        </div>

        {/* Statut sauvegarde */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Enreg…</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Enregistré</span>
            </>
          )}
        </div>
      </div>

      {/* Liste draggable */}
      <div className="border border-border rounded-md overflow-hidden bg-background">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={articles.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-1.5 space-y-0.5">
              {articles.map((article, index) => (
                <SortableItem
                  key={article.id}
                  article={article}
                  index={index}
                  isDragging={activeId === article.id}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeArticle && <DragPreview article={activeArticle} />}
          </DragOverlay>
        </DndContext>
      </div>
    </aside>
  )
}
