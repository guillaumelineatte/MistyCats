"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function Hero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/elegant-jewelry-flat-lay-on-natural-linen-fabric-w.jpg" alt="Bijoux Misty Cats" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div
          className={`transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="inline-block text-xs sm:text-sm md:text-base tracking-[0.3em] uppercase text-background/90 mb-4 sm:mb-6">
            Bijoux Artisanaux & Durables
          </span>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-background leading-tight tracking-wide transition-all duration-1000 delay-200 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <span className="block">La beauté</span>
          <span className="block italic font-normal">réinventée</span>
        </h1>

        <p
          className={`mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-background/90 max-w-2xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-400 px-2 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          Des créations uniques nées de matériaux oubliés, transformés en pièces d&apos;exception qui racontent une
          histoire.
        </p>

        <div
          className={`mt-8 sm:mt-12 flex flex-col gap-3 sm:gap-4 justify-center transition-all duration-1000 delay-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 px-6 sm:px-10 py-5 sm:py-6 text-xs sm:text-sm tracking-widest uppercase rounded-none"
          >
            Découvrir la Collection
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-background text-background hover:bg-background/10 px-6 sm:px-10 py-5 sm:py-6 text-xs sm:text-sm tracking-widest uppercase rounded-none bg-transparent"
          >
            Notre Histoire
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 text-background animate-bounce transition-all duration-1000 delay-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        aria-label="Défiler vers le bas"
      >
        <ArrowDown className="h-6 w-6" />
      </button>
    </section>
  )
}
