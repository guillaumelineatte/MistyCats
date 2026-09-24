"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Check, Package } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { trackingSchema, type TrackingInput } from "@/lib/validations/tracking"

interface TrackingResult {
  number: string
  status: string
  createdAt: string
  shipment: {
    carrier: string | null
    trackingNumber: string | null
    estimatedDeliveryAt: string | null
    deliveredAt: string | null
    events: { status: string; label: string; location: string | null; occurredAt: string }[]
  } | null
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  PREPARING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
}

function SuiviForm() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TrackingInput>({
    resolver: zodResolver(trackingSchema),
    defaultValues: { number: searchParams.get("commande") ?? "", email: "" },
  })

  async function onSubmit(data: TrackingInput) {
    setError(null)
    setResult(null)
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const body = await res.json()
    if (!res.ok) {
      setError(body.error ?? "Une erreur est survenue.")
      return
    }
    setResult(body)
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase text-center mb-10">
        Suivre ma commande
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField control={form.control} name="number" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Numéro de commande</FormLabel>
              <FormControl><Input placeholder="CMD-2026-0001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Email</FormLabel>
              <FormControl><Input type="email" placeholder="votre@email.fr" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full rounded-none tracking-widest uppercase text-xs py-6">
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suivre"}
          </Button>
        </form>
      </Form>

      {result && (
        <div className="mt-10 border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground">Commande</p>
              <p className="font-medium">{result.number}</p>
            </div>
            <span className="text-xs tracking-widest uppercase border border-border px-3 py-1.5">
              {ORDER_STATUS_LABELS[result.status] ?? result.status}
            </span>
          </div>

          {result.shipment?.carrier && result.shipment?.trackingNumber && (
            <p className="text-sm text-muted-foreground mb-6">
              {result.shipment.carrier} — n°&nbsp;{result.shipment.trackingNumber}
            </p>
          )}

          {result.shipment && result.shipment.events.length > 0 ? (
            <ol className="space-y-4">
              {result.shipment.events.map((event, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    {i === result.shipment!.events.length - 1 ? (
                      <Package className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{event.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.occurredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      {event.location ? ` — ${event.location}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune information de suivi pour le moment.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function SuiviPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24 flex justify-center px-4 sm:px-6">
        <Suspense fallback={null}>
          <SuiviForm />
        </Suspense>
      </section>
      <Footer />
    </main>
  )
}
