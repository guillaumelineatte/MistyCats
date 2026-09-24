"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { cn } from "@/lib/utils"

interface DropArticle {
  id: string
  title: string
  priceCents: number
  image: string
  categoryName: string
  createdAt: Date | string
}

interface Drop {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  articles: DropArticle[]
}

interface LatestDropSectionProps {
  drop: Drop
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export function LatestDropSection({ drop }: LatestDropSectionProps) {
  const [visible] = useState(true)

  return (
    <section className="border-t border-border">
      {/* En-tête du drop */}
      <div
        className={cn(
          "container mx-auto px-4 sm:px-6 pt-16 pb-10 transition-all duration-700",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Dernier Drop
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-widest uppercase">
              {drop.name}
            </h2>
            {drop.description && (
              <p className="mt-3 text-sm text-muted-foreground max-w-md leading-relaxed">
                {drop.description}
              </p>
            )}
          </div>
          <Link
            href={`/boutique/drops/${drop.id}`}
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border-b border-foreground pb-0.5 hover:text-muted-foreground transition-colors shrink-0"
          >
            Voir le drop complet
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Image de couverture (si présente) */}
      {drop.coverImage && (
        <div className="container mx-auto px-4 sm:px-6 pb-10">
          <div className="w-full h-48 sm:h-64 overflow-hidden rounded-sm bg-secondary">
            <img
              src={drop.coverImage}
              alt={drop.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Articles du drop */}
      <div className="container mx-auto px-4 sm:px-6 pb-16">
        {drop.articles.length === 0 ? (
          <p className="text-sm text-muted-foreground tracking-wider">
            Aucun article dans ce drop.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in duration-500">
            {drop.articles.map((article) => (
              <ProductCard
                key={article.id}
                product={{
                  id: article.id,
                  name: article.title,
                  priceCents: article.priceCents,
                  image: article.image,
                  category: article.categoryName,
                  isNew: Date.now() - new Date(article.createdAt).getTime() < THIRTY_DAYS,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
