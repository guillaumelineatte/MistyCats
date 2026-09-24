"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles } from "lucide-react"

export function Provenance() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles
            className={`h-10 sm:h-12 w-10 sm:w-12 mx-auto text-primary/30 mb-6 sm:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          />

          <span
            className={`inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            D&apos;où viennent nos matières
          </span>

          <p
            className={`text-lg sm:text-2xl md:text-3xl font-light leading-relaxed italic transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            &ldquo;Chaque pièce commence par un matériau qu&apos;on aurait pu jeter&nbsp;: une boucle dépareillée, un
            fragment de métal, une chute de matière. Nous les récupérons, les trions, les transformons à la main
            jusqu&apos;à ce qu&apos;ils deviennent un bijou qui n&apos;existera qu&apos;une seule fois.&rdquo;
          </p>

          <p
            className={`mt-8 text-sm sm:text-base text-muted-foreground leading-relaxed transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Aucune pièce n&apos;est produite en série&nbsp;: le stock affiché sur chaque fiche correspond aux
            exemplaires réellement disponibles.
          </p>
        </div>
      </div>
    </section>
  )
}
