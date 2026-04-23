"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"

interface DeleteDialogProps {
  articleId: string
  articleTitle: string
}

export function DeleteDialog({ articleId, articleTitle }: DeleteDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Article supprimé")
      router.refresh()
    } catch {
      toast.error("Impossible de supprimer l'article")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">Supprimer l'article</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment supprimer{" "}
            <span className="font-medium text-foreground">«&nbsp;{articleTitle}&nbsp;»</span> ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none tracking-wider uppercase text-xs">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="rounded-none tracking-wider uppercase text-xs bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
