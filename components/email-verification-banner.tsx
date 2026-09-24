"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmailVerificationBanner({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function resend() {
    setSending(true)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setSent(true)
      toast.success("Email de vérification renvoyé")
    } catch {
      toast.error("Erreur, réessayez plus tard")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mb-8 flex items-center justify-between gap-4 border border-border bg-secondary/40 px-5 py-4">
      <div className="flex items-center gap-3">
        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          Votre adresse email n'est pas encore confirmée. La confirmation est nécessaire pour passer commande.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-none tracking-wider uppercase text-xs shrink-0"
        disabled={sending || sent}
        onClick={resend}
      >
        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : sent ? "Envoyé" : "Renvoyer l'email"}
      </Button>
    </div>
  )
}
