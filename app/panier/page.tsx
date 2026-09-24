"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { X, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { formatCents } from "@/lib/money"
import { notifyCartUpdated } from "@/lib/cart-events"

interface CartItem {
  articleId: string
  reservedUntil: string
  article: {
    title: string
    slug: string
    priceCents: number
    categoryName: string
    image: string | null
  }
}

function useCountdown(reservedUntil: string) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(reservedUntil).getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(new Date(reservedUntil).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [reservedUntil])

  const clamped = Math.max(0, remainingMs)
  const minutes = Math.floor(clamped / 60000)
  const seconds = Math.floor((clamped % 60000) / 1000)

  return { label: `${minutes}:${seconds.toString().padStart(2, "0")}`, expired: clamped <= 0 }
}

function CartRow({ item, onRemove }: { item: CartItem; onRemove: (articleId: string) => void }) {
  const { label, expired } = useCountdown(item.reservedUntil)

  useEffect(() => {
    if (expired) onRemove(item.articleId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired])

  return (
    <div className="flex items-center gap-4 py-5 border-b border-border">
      <Link href={`/boutique/produit/${item.article.slug}`} className="w-20 h-20 bg-secondary overflow-hidden shrink-0">
        <img
          src={item.article.image ?? "/placeholder-product.svg"}
          alt={item.article.title}
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-xs tracking-wider uppercase text-muted-foreground">{item.article.categoryName}</p>
        <Link href={`/boutique/produit/${item.article.slug}`} className="font-medium hover:text-primary transition-colors">
          {item.article.title}
        </Link>
        <p className="text-sm mt-1">{formatCents(item.article.priceCents)}</p>
        <p className={`text-xs mt-1 tracking-wider ${expired ? "text-destructive" : "text-muted-foreground"}`}>
          Réservée encore {label}
        </p>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={() => onRemove(item.articleId)} aria-label="Retirer du panier">
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function PanierPage() {
  const [items, setItems] = useState<CartItem[] | null>(null)

  const load = useCallback(async () => {
    const res = await fetch("/api/cart")
    const data = await res.json()
    setItems(data.items)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleRemove(articleId: string) {
    setItems((prev) => prev?.filter((i) => i.articleId !== articleId) ?? prev)
    await fetch(`/api/cart/items/${articleId}`, { method: "DELETE" })
    notifyCartUpdated()
  }

  const total = items?.reduce((sum, item) => sum + item.article.priceCents, 0) ?? 0

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase mb-10">Mon panier</h1>

          {items === null ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm tracking-widest uppercase mb-6">Votre panier est vide</p>
              <Link href="/boutique" className="text-xs tracking-widest uppercase border-b border-foreground pb-0.5">
                Voir la collection
              </Link>
            </div>
          ) : (
            <>
              <div>
                {items.map((item) => (
                  <CartRow key={item.articleId} item={item} onRemove={handleRemove} />
                ))}
              </div>

              <div className="flex items-center justify-between py-6">
                <span className="text-sm tracking-widest uppercase">Total</span>
                <span className="text-xl font-light">{formatCents(total)}</span>
              </div>

              <Button asChild className="w-full rounded-none tracking-widest uppercase text-xs py-6">
                <Link href="/commande">Passer commande</Link>
              </Button>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
