"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CATEGORIES } from "@/lib/validations/article"
import { cn } from "@/lib/utils"

interface Article {
  id: string
  title: string
  price: number
  image: string
  category: string
  createdAt: Date
}

interface CollectionViewProps {
  articles: Article[]
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

const ALL_FILTERS = ["Tous", ...CATEGORIES] as const

export function CollectionView({ articles }: CollectionViewProps) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("categorie") ?? "Tous"
  const [visible, setVisible] = useState(false)
  const [gridKey, setGridKey] = useState(0)

  useEffect(() => {
    setVisible(true)
  }, [])

  // Fade the grid on filter change
  useEffect(() => {
    setGridKey((k) => k + 1)
  }, [activeCategory])

  const filtered =
    activeCategory === "Tous"
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  return (
    <>
      {/* En-tête de page */}
      <section className="pt-40 pb-12 sm:pt-48 sm:pb-16 text-center">
        <div
          className={cn(
            "transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <span className="inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Misty Cats
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-widest uppercase mb-4">
            La <span className="italic font-normal">Collection</span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-wider max-w-md mx-auto px-4">
            Bijoux artisanaux upcyclés, créés à Amiens avec soin.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <div
        className={cn(
          "sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-700 delay-200",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {ALL_FILTERS.map((cat) => {
              const isActive = activeCategory === cat
              const href =
                cat === "Tous"
                  ? "/boutique"
                  : `/boutique?categorie=${encodeURIComponent(cat)}`

              return (
                <Link
                  key={cat}
                  href={href}
                  scroll={false}
                  className={cn(
                    "relative flex-shrink-0 px-5 py-4 text-xs tracking-widest uppercase transition-colors duration-300",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat}
                  {/* Indicateur actif */}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-px bg-foreground transition-all duration-300 origin-center",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              )
            })}

            {/* Compteur aligné à droite */}
            <span className="ml-auto flex-shrink-0 px-5 py-4 text-xs text-muted-foreground tracking-wider">
              {filtered.length} pièce{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Grille */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <p className="text-muted-foreground text-sm tracking-widest uppercase">
              Aucune pièce dans cette catégorie
            </p>
            <Link
              href="/boutique"
              className="mt-6 text-xs tracking-widest uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors"
            >
              Voir toute la collection
            </Link>
          </div>
        ) : (
          <div
            key={gridKey}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in duration-500"
          >
            {filtered.map((article) => (
              <ProductCard
                key={article.id}
                product={{
                  id: article.id,
                  name: article.title,
                  price: article.price,
                  image: article.image,
                  category: article.category,
                  isNew: Date.now() - new Date(article.createdAt).getTime() < THIRTY_DAYS,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
