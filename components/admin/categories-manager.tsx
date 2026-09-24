"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowUp, ArrowDown, Trash2, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
  description: string | null
  order: number
  _count: { articles: number }
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body.error ?? "Erreur")
        return
      }
      setNewName("")
      toast.success("Catégorie créée")
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(body.error ?? "Impossible de supprimer")
        return
      }
      toast.success("Catégorie supprimée")
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const reordered = [...categories]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    setBusyId(categories[index].id)
    try {
      await fetch("/api/categories/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordered.map((c, i) => ({ id: c.id, order: i }))),
      })
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 max-w-md">
        <Input
          placeholder="Nom de la nouvelle catégorie"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="rounded-none tracking-widest uppercase text-xs shrink-0"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium">{cat.name}</p>
              <p className="text-xs text-muted-foreground">
                {cat._count.articles} pièce{cat._count.articles !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={index === 0 || busyId === cat.id}
                onClick={() => handleMove(index, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={index === categories.length - 1 || busyId === cat.id}
                onClick={() => handleMove(index, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif text-xl">Supprimer la catégorie</AlertDialogTitle>
                    <AlertDialogDescription>
                      Voulez-vous vraiment supprimer «&nbsp;{cat.name}&nbsp;» ?
                      {cat._count.articles > 0 && " Impossible tant qu'elle contient des pièces."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-none tracking-wider uppercase text-xs">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(cat.id)}
                      className="rounded-none tracking-wider uppercase text-xs bg-destructive text-white hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
