"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: { url: string; alt: string }[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : [{ url: "/placeholder-product.svg", alt: title }]

  return (
    <div>
      <div className="aspect-square overflow-hidden bg-secondary mb-3">
        <img src={list[active].url} alt={list[active].alt || title} className="w-full h-full object-cover" />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "aspect-square overflow-hidden bg-secondary border transition-colors",
                i === active ? "border-foreground" : "border-transparent hover:border-border",
              )}
            >
              <img src={img.url} alt={img.alt || title} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
