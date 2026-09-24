"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderActionsProps {
  orderNumber: string
  status: string
  hasShipment: boolean
}

const STATUS_OPTIONS = [
  { value: "PREPARING", label: "En préparation" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée (rembourse le paiement)" },
]

const EVENT_STATUS_OPTIONS = [
  { value: "PREPARING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "IN_TRANSIT", label: "En transit" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "EXCEPTION", label: "Incident" },
]

export function OrderActions({ orderNumber, status, hasShipment }: OrderActionsProps) {
  const router = useRouter()
  const [changingStatus, setChangingStatus] = useState(false)
  const [carrier, setCarrier] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shipping, setShipping] = useState(false)
  const [eventStatus, setEventStatus] = useState("IN_TRANSIT")
  const [eventLabel, setEventLabel] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [addingEvent, setAddingEvent] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setChangingStatus(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        toast.error("Erreur lors du changement de statut")
        return
      }
      toast.success("Statut mis à jour")
      router.refresh()
    } finally {
      setChangingStatus(false)
    }
  }

  async function handleShip() {
    if (!carrier.trim() || !trackingNumber.trim()) return
    setShipping(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, trackingNumber }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(body.error ?? "Erreur")
        return
      }
      toast.success("Commande marquée comme expédiée, email envoyé")
      setCarrier("")
      setTrackingNumber("")
      router.refresh()
    } finally {
      setShipping(false)
    }
  }

  async function handleAddEvent() {
    if (!eventLabel.trim()) return
    setAddingEvent(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: eventStatus, label: eventLabel, location: eventLocation || undefined }),
      })
      if (!res.ok) {
        toast.error("Erreur")
        return
      }
      toast.success("Événement ajouté")
      setEventLabel("")
      setEventLocation("")
      router.refresh()
    } finally {
      setAddingEvent(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Changer le statut</h2>
        <Select onValueChange={handleStatusChange} disabled={changingStatus}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder={`Statut actuel : ${status}`} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasShipment && status !== "SHIPPED" && status !== "DELIVERED" && (
        <div className="border border-border p-5 max-w-md">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Expédier</h2>
          <div className="space-y-3">
            <Input placeholder="Transporteur (ex. Colissimo)" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
            <Input placeholder="Numéro de suivi" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            <Button
              onClick={handleShip}
              disabled={shipping || !carrier.trim() || !trackingNumber.trim()}
              className="w-full rounded-none tracking-widest uppercase text-xs"
            >
              {shipping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Marquer comme expédiée"}
            </Button>
          </div>
        </div>
      )}

      {hasShipment && (
        <div className="border border-border p-5 max-w-md">
          <h2 className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Ajouter un événement de suivi</h2>
          <div className="space-y-3">
            <Select value={eventStatus} onValueChange={setEventStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Libellé (ex. Arrivée au centre de tri)" value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} />
            <Input placeholder="Lieu (optionnel)" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
            <Button
              onClick={handleAddEvent}
              disabled={addingEvent || !eventLabel.trim()}
              variant="outline"
              className="w-full rounded-none tracking-widest uppercase text-xs"
            >
              {addingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
