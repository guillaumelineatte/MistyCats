import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  published: boolean
}

export function StatusBadge({ published }: StatusBadgeProps) {
  if (published) {
    return (
      <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs tracking-wider uppercase rounded-none">
        Publié
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs tracking-wider uppercase rounded-none">
      Brouillon
    </Badge>
  )
}
