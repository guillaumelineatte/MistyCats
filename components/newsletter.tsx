"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type Status = "idle" | "loading" | "success" | "error"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) return

    setStatus("loading")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent }),
      })

      if (!res.ok) {
        setStatus("error")
        return
      }

      setStatus("success")
      setEmail("")
      setConsent(false)
    } catch {
      setStatus("error")
    }
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

          {status === "success" ? (
            <p className="text-background text-sm tracking-wide">
              Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
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
                  disabled={status === "loading" || !consent}
                  className="bg-background text-foreground hover:bg-background/90 rounded-none px-8 py-6 text-sm tracking-widest uppercase disabled:opacity-40"
                >
                  {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'inscrire"}
                </Button>
              </div>

              <label className="mt-6 flex items-start gap-3 text-left text-xs text-background/70 leading-relaxed max-w-md mx-auto">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-0.5 border-background/40 data-[state=checked]:bg-background data-[state=checked]:text-foreground"
                />
                <span>
                  J&apos;accepte de recevoir la newsletter par email et j&apos;ai lu la{" "}
                  <Link href="/confidentialite" className="underline underline-offset-4 hover:text-background">
                    politique de confidentialité
                  </Link>
                  . Désinscription possible à tout moment.
                </span>
              </label>

              {status === "error" && (
                <p className="mt-4 text-sm text-background/70">Une erreur est survenue, réessayez.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
