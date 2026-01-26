"use client"

import { useEffect, useRef, useState } from "react"
import { Leaf, Recycle, Heart, Sparkles } from "lucide-react"

const values = [
  {
    icon: Recycle,
    title: "Upcycling",
    description: "Chaque pièce est créée à partir de matériaux récupérés, leur offrant une seconde vie précieuse.",
  },
  {
    icon: Heart,
    title: "Artisanat",
    description: "Fait main avec passion, chaque bijou est unique et porte l'empreinte de notre savoir-faire.",
  },
  {
    icon: Leaf,
    title: "Écologique",
    description: "Un engagement profond pour réduire notre impact environnemental à chaque étape.",
  },
  {
    icon: Sparkles,
    title: "Unique",
    description: "Des créations singulières qui vous permettent d'exprimer votre style avec conscience.",
  },
]

export function Philosophy() {
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
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span
            className={`inline-block text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 sm:mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Notre Philosophie
          </span>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Transformer l&apos;ordinaire en <span className="italic">extraordinaire</span>
          </h2>
          <p
            className={`mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 px-2 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Chez Misty Cats, nous croyons que la beauté peut naître de l&apos;inattendu. Nos bijoux racontent une
            histoire de transformation et de renouveau.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className={`group text-center p-6 sm:p-8 bg-background rounded-lg transition-all duration-700 hover:shadow-lg ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-secondary mb-4 sm:mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                <value.icon className="h-6 sm:h-7 w-6 sm:w-7 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
