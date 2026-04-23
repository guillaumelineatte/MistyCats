"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

interface Article {
  id: string
  title: string
  price: number
  image: string
  category: string
  createdAt: Date
}

interface FeaturedCollectionProps {
  articles: Article[]
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export function FeaturedCollection({ articles }: FeaturedCollectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (articles.length === 0) return null

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 sm:mb-16">
          <div>
            <span
              className={`inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 sm:mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            >
              Collection
            </span>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-light transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            >
              Pièces <span className="italic">favorites</span>
            </h2>
          </div>
          <Button
            asChild
            variant="link"
            className={`mt-4 md:mt-0 text-xs sm:text-sm tracking-widest uppercase p-0 h-auto transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <Link href="/boutique">Voir toute la collection →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <ProductCard
                product={{
                  id: article.id,
                  name: article.title,
                  price: article.price,
                  image: article.image,
                  category: article.category,
                  isNew: Date.now() - new Date(article.createdAt).getTime() < THIRTY_DAYS,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
