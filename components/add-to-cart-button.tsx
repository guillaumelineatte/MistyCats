"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { notifyCartUpdated } from "@/lib/cart-events"

export function AddToCartButton({ articleId }: { articleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      })
      const body = await res.json()

      if (!res.ok) {
        toast.error(body.error ?? "Impossible d'ajouter cette pièce au panier.")
        router.refresh()
        return
      }

      notifyCartUpdated()
      toast.success("Ajoutée au panier — réservée 30 minutes.")
      router.push("/panier")
    } catch {
      toast.error("Erreur, réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-none tracking-widest uppercase text-xs py-6"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter au panier"}
    </Button>
  )
}
