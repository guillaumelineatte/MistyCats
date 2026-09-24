// Base rédigée automatiquement (lot 1.3 de l'audit, voir AUDIT.md). Un
// professionnel du droit doit relire ce texte avant toute ouverture réelle de
// la boutique — ce n'est pas un avis juridique.

import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Livraison & Retours | Misty Cats",
  description: "Modes de livraison, délais, tarifs et procédure de retour chez Misty Cats.",
}

export default function LivraisonRetoursPage() {
  const { shipping, contact } = siteConfig

  return (
    <LegalPageShell title="Livraison & Retours">
      <section>
        <h2>Modes de livraison</h2>
        <ul>
          {shipping.methods.map((m) => (
            <li key={m.label}>
              {m.label} — {m.price}, délai indicatif {m.delay}
            </li>
          ))}
        </ul>
        <p>Livraison en France métropolitaine. Chaque commande est expédiée dans un emballage soigné, sous 48h après validation du paiement.</p>
      </section>

      <section>
        <h2>Suivi de commande</h2>
        <p>Un numéro de suivi est communiqué par email dès l&apos;expédition du colis.</p>
      </section>

      <section>
        <h2>Retours</h2>
        <p>
          Chaque pièce étant unique, merci de vérifier attentivement la fiche produit avant commande. Un retour
          reste possible dans un délai de {shipping.returnDelayDays} jours à compter de la réception, dans son état
          d&apos;origine, non porté. Pour lancer un retour, contactez {contact.email} en indiquant votre numéro de
          commande.
        </p>
        <p>
          Les frais de retour sont à la charge du client, sauf en cas de défaut ou d&apos;erreur de notre part. Le
          remboursement intervient sous 14 jours après réception du produit retourné.
        </p>
        <p>Pour le détail légal du droit de rétractation, voir les <a href="/cgv">CGV</a>.</p>
      </section>
    </LegalPageShell>
  )
}
