import { Badge } from "@/components/ui/badge"

interface DropStatusBadgeProps {
  published: boolean
  scheduledAt: Date | string | null
}

export function DropStatusBadge({ published, scheduledAt }: DropStatusBadgeProps) {
  if (published) {
    return (
      <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs tracking-wider uppercase rounded-none">
        Publié
      </Badge>
    )
  }

  if (scheduledAt) {
    const date = new Date(scheduledAt)
    const formatted = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    return (
      <Badge variant="outline" className="text-xs tracking-wider uppercase rounded-none border-amber-400 text-amber-600">
        Programmé · {formatted}
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="text-xs tracking-wider uppercase rounded-none">
      Brouillon
    </Badge>
  )
}
