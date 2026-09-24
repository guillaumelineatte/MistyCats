"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Loader2, Download } from "lucide-react"
import { toast } from "sonner"
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

export default function ConfidentialitePage() {
  const [exporting, setExporting] = useState(false)
  const [password, setPassword] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/user/export")
      if (!res.ok) {
        toast.error("Erreur lors de l'export")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "mes-donnees-mistycats.json"
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    setDeleteError(null)
    setDeleting(true)
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const body = await res.json()
      if (!res.ok) {
        setDeleteError(body.error ?? "Une erreur est survenue.")
        return
      }
      await signOut({ callbackUrl: "/" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-10 max-w-md">
      <div>
        <h2 className="text-2xl font-light tracking-wider">Confidentialité</h2>
        <p className="mt-1 text-sm text-muted-foreground">Vos données, votre choix.</p>
      </div>

      <div>
        <h3 className="text-xs tracking-widest uppercase mb-2">Exporter mes données</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Téléchargez une copie de vos données personnelles (profil, adresses, commandes, messages) au format JSON.
        </p>
        <Button variant="outline" disabled={exporting} onClick={handleExport} className="rounded-none tracking-widest uppercase text-xs">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          Télécharger mes données
        </Button>
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="text-xs tracking-widest uppercase mb-2 text-destructive">Supprimer mon compte</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Votre compte, vos adresses et votre panier sont supprimés définitivement. Vos commandes passées sont
          conservées de façon anonyme (obligations comptables).
        </p>
        <AlertDialog onOpenChange={() => { setPassword(""); setDeleteError(null) }}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-none tracking-widest uppercase text-xs border-destructive text-destructive hover:bg-destructive/10">
              Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl">Supprimer définitivement votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Confirmez avec votre mot de passe.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none tracking-wider uppercase text-xs">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={deleting || !password}
                className="rounded-none tracking-wider uppercase text-xs bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer définitivement"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
