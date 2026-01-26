"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

const products = [
  {
    id: 1,
    name: "Boucles Aurore",
    price: 48,
    image: "/elegant-gold-upcycled-earrings-on-cream-background.jpg",
    category: "Boucles d'oreilles",
    isNew: true,
  },
  {
    id: 2,
    name: "Collier Éclipse",
    price: 72,
    image: "/delicate-silver-pendant-necklace-with-recycled-mat.jpg",
    category: "Colliers",
    isNew: false,
  },
  {
    id: 3,
    name: "Bracelet Ondine",
    price: 56,
    image: "/handcrafted-copper-bracelet-upcycled-jewelry-on-na.jpg",
    category: "Bracelets",
    isNew: true,
  },
  {
    id: 4,
    name: "Bague Solstice",
    price: 42,
    image: "/unique-vintage-inspired-ring-upcycled-materials-ar.jpg",
    category: "Bagues",
    isNew: false,
  },
]

export function FeaturedCollection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

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
            variant="link"
            className={`mt-4 md:mt-0 text-xs sm:text-sm tracking-widest uppercase p-0 h-auto transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Voir toute la collection →
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
