"use client"

import { useState } from "react"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Product {
  id: string | number
  name: string
  price: number
  image: string
  category: string
  isNew?: boolean
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[5/6] overflow-hidden bg-secondary mb-4">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className={cn("w-full h-full object-cover transition-transform duration-700", isHovered && "scale-105")}
        />

        {/* New Badge */}
        {product.isNew && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs tracking-wider uppercase">
            Nouveau
          </span>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          )}
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
        </Button>

        {/* Quick Add Button */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <Button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-none py-3 text-xs tracking-widest uppercase">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Ajouter au panier
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">{product.category}</p>
        <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-base font-light">{product.price.toFixed(2)} €</p>
      </div>
    </div>
  )
}
