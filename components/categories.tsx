"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const categories = [
  {
    name: "Boucles d'oreilles",
    image: "/collection-of-elegant-upcycled-earrings-displayed-.jpg",
    count: 24,
  },
  {
    name: "Colliers",
    image: "/beautiful-handcrafted-necklaces-with-recycled-mate.jpg",
    count: 18,
  },
  {
    name: "Bracelets",
    image: "/artisan-bracelets-made-from-upcycled-materials-on-.jpg",
    count: 15,
  },
]

export function Categories() {
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
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <span
            className={`inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 sm:mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Explorer
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-light transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Nos <span className="italic">catégories</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/boutique/${category.name.toLowerCase().replace(/['\s]/g, "-")}`}
              className={`group relative aspect-[5/7] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-background">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide mb-1 sm:mb-2">{category.name}</h3>
                <span className="text-xs sm:text-sm tracking-widest opacity-80">{category.count} pièces</span>
                <span className="mt-4 sm:mt-6 text-xs sm:text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-b border-background pb-1">
                  Découvrir
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
