"use client"

import Image from "next/image"
import { MapPin, Clock, Phone } from "lucide-react"

export function Store() {
  return (
    <section id="magasin" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-widest uppercase text-foreground mb-3 sm:mb-4">
            Notre Magasin
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            Visitez notre boutique pour découvrir nos créations en personne et explorer notre collection de bijoux upcyclés
          </p>
        </div>

        {/* Store Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center justify-items-center md:justify-items-stretch max-w-5xl mx-auto">
          {/* Store Image */}
          <div className="relative w-full max-w-xs md:max-w-sm aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-muted">
            <Image
              src="/favori-icon.png"
              alt="Magasin Misty Cats"
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Store Info */}
          <div className="space-y-6 sm:space-y-8 w-full px-4 sm:px-0">
            {/* Address */}
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-wide uppercase text-foreground mb-2">
                  Adresse
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  7 Rue Lamarck<br />
                  80000 Amiens<br />
                  France
                </p>
              </div>
            </div>

            {/* Horaires */}
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <Clock className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-wide uppercase text-foreground mb-2">
                  Horaires
                </h3>
                <div className="text-muted-foreground text-base space-y-1">
                  <p>Mardi: 14h00 - 19h00</p>
                  <p>Mercredi - Samedi: 11h00 - 19h00</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                <Phone className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-wide uppercase text-foreground mb-2">
                  Contact
                </h3>
                <p className="text-muted-foreground text-base">
                  <a href="tel:+33123456789" className="hover:text-foreground transition-colors">
                    03 75 08 92 47
                  </a>
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <a
                href="https://www.google.com/maps/place/7+Rue+Lamarck,+80000+Amiens/@49.8914112,2.2966534,17z/data=!3m1!4b1!4m6!3m5!1s0x47e7844723212ac3:0xc04cffc0ed61655d!8m2!3d49.8914112!4d2.2992283!16s%2Fg%2F11xgftn_20?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-sm rounded-lg hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
              >
                Voir sur la Carte
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
