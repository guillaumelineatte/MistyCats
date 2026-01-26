"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  const [email, setEmail] = useState("")
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    setEmail("")
  }

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-foreground text-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span
            className={`inline-block text-sm tracking-[0.3em] uppercase text-background/60 mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Newsletter
          </span>
          <h2
            className={`text-4xl md:text-5xl font-light mb-6 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Restez <span className="italic">inspiré</span>
          </h2>
          <p
            className={`text-background/80 mb-10 leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            Inscrivez-vous pour recevoir en avant-première nos nouvelles collections, nos histoires de création et des
            offres exclusives.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent border-background/30 text-background placeholder:text-background/50 rounded-none py-6 focus:border-background"
              required
            />
            <Button
              type="submit"
              className="bg-background text-foreground hover:bg-background/90 rounded-none px-8 py-6 text-sm tracking-widest uppercase"
            >
              S&apos;inscrire
            </Button>
          </form>

          <p
            className={`mt-6 text-xs text-background/50 transition-all duration-700 delay-400 ${isVisible ? "opacity-100" : "opacity-0"}`}
          >
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </div>
      </div>
    </section>
  )
}
