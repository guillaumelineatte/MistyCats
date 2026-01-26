"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    text: "Des bijoux d'une beauté rare, avec une histoire unique. Je suis fière de porter des pièces qui ont du sens.",
    author: "Marie L.",
    location: "Paris",
  },
  {
    id: 2,
    text: "La qualité est exceptionnelle et savoir que chaque pièce contribue à un monde plus durable me touche profondément.",
    author: "Sophie D.",
    location: "Lyon",
  },
  {
    id: 3,
    text: "J'ai offert un collier à ma mère, elle était émue par l'histoire derrière. Un cadeau vraiment spécial.",
    author: "Claire M.",
    location: "Bordeaux",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
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

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Quote
            className={`h-10 sm:h-12 w-10 sm:w-12 mx-auto text-primary/30 mb-6 sm:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          />

          <div className="relative min-h-[160px] sm:min-h-[200px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === current
                    ? "opacity-100 translate-x-0"
                    : index < current
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                }`}
              >
                <blockquote
                  className={`text-lg sm:text-2xl md:text-3xl font-light leading-relaxed italic transition-all duration-700 delay-200 px-2 sm:px-0 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                >
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>
                <div
                  className={`mt-6 sm:mt-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                >
                  <p className="font-medium text-base sm:text-lg">{testimonial.author}</p>
                  <p className="text-muted-foreground text-sm sm:text-base">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`flex items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-12 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full border-foreground/20 hover:bg-secondary bg-transparent h-9 w-9 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === current ? "w-8 bg-primary" : "w-2 bg-foreground/20"
                  }`}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full border-foreground/20 hover:bg-secondary bg-transparent h-9 w-9 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
