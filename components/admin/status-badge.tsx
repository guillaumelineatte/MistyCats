import { Badge } from "@/components/ui/badge"
import type { ARTICLE_STATUSES } from "@/lib/validations/article"

interface StatusBadgeProps {
  status: (typeof ARTICLE_STATUSES)[number]
}

const LABELS: Record<StatusBadgeProps["status"], string> = {
  DRAFT: "Brouillon",
  ONLINE: "En ligne",
  RESERVED: "Réservé",
  SOLD: "Vendu",
  ARCHIVED: "Archivé",
}

const CLASSES: Record<StatusBadgeProps["status"], string> = {
  DRAFT: "",
  ONLINE: "bg-accent text-accent-foreground hover:bg-accent/90",
  RESERVED: "bg-amber-500/90 text-white hover:bg-amber-500",
  SOLD: "bg-muted-foreground text-background hover:bg-muted-foreground/90",
  ARCHIVED: "",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant={status === "DRAFT" || status === "ARCHIVED" ? "secondary" : "default"}
      className={`text-xs tracking-wider uppercase rounded-none ${CLASSES[status]}`}
    >
      {LABELS[status]}
    </Badge>
  )
}
