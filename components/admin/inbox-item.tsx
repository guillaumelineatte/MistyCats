"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InboxItem({
  endpoint,
  processed,
  children,
}: {
  endpoint: string
  processed: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markProcessed() {
    setLoading(true)
    try {
      await fetch(endpoint, { method: "PATCH" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border p-5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">{children}</div>
      {!processed ? (
        <Button variant="outline" size="sm" disabled={loading} onClick={markProcessed} className="rounded-none tracking-wider uppercase text-xs shrink-0">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Marquer traité"}
        </Button>
      ) : (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <Check className="h-3.5 w-3.5" /> Traité
        </span>
      )}
    </div>
  )
}
