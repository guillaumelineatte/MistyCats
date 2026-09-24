"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Trash2, Zap } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { DropStatusBadge } from "@/components/admin/drop-status-badge"

interface Drop {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  published: boolean
  scheduledAt: Date | string | null
  createdAt: Date | string
  _count: { articles: number }
}

function PublishButton({ dropId }: { dropId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePublish() {
    setLoading(true)
    try {
      const res = await fetch(`/api/drops/${dropId}/publish`, { method: "PATCH" })
      if (!res.ok) throw new Error()
      toast.success("Drop publié")
      router.refresh()
    } catch {
      toast.error("Impossible de publier le drop")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={handlePublish}
      disabled={loading}
      title="Publier maintenant"
    >
      <Zap className="h-4 w-4" />
    </Button>
  )
}

function DeleteDropDialog({ dropId, dropName }: { dropId: string; dropName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/drops/${dropId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Drop supprimé")
      router.refresh()
    } catch {
      toast.error("Impossible de supprimer le drop")
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
          <AlertDialogTitle className="font-serif text-xl">Supprimer le drop</AlertDialogTitle>
          <AlertDialogDescription>
            Voulez-vous vraiment supprimer{" "}
            <span className="font-medium text-foreground">«&nbsp;{dropName}&nbsp;»</span> ?
            Les articles du drop seront libérés (ils passeront en articles standalone).
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

export function DropsTable({ drops }: { drops: Drop[] }) {
  if (drops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md">
        <p className="text-muted-foreground text-sm tracking-wider uppercase">
          Aucun drop pour l'instant
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Commencez par créer votre premier drop.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="w-16 text-xs tracking-wider uppercase">Cover</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">Nom</TableHead>
            <TableHead className="hidden sm:table-cell text-xs tracking-wider uppercase">Articles</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">Statut</TableHead>
            <TableHead className="text-right text-xs tracking-wider uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drops.map((drop) => (
            <TableRow key={drop.id} className="hover:bg-secondary/30 transition-colors">
              {/* Cover */}
              <TableCell className="w-16">
                <div className="w-12 h-12 bg-secondary overflow-hidden rounded-sm">
                  {drop.coverImage ? (
                    <img
                      src={drop.coverImage}
                      alt={drop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">—</span>
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Nom */}
              <TableCell>
                <div className="font-medium">{drop.name}</div>
                {drop.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {drop.description}
                  </div>
                )}
              </TableCell>

              {/* Nb articles */}
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {drop._count.articles} article{drop._count.articles !== 1 ? "s" : ""}
              </TableCell>

              {/* Statut */}
              <TableCell>
                <DropStatusBadge published={drop.published} scheduledAt={drop.scheduledAt} />
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {!drop.published && (
                    <PublishButton dropId={drop.id} />
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    asChild
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Link href={`/admin/drops/${drop.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteDropDialog dropId={drop.id} dropName={drop.name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
