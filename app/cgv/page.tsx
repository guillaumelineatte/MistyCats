// Base rédigée automatiquement (lot 1.3 de l'audit, voir AUDIT.md). Un
// professionnel du droit doit relire ce texte avant toute ouverture réelle de
// la boutique — ce n'est pas un avis juridique.

import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig, MISSING_LEGAL_INFO } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Conditions générales de vente | Misty Cats",
  description: "Conditions générales de vente de la boutique Misty Cats.",
}

export default function CGVPage() {
  const { legal, shipping, payment, address, contact } = siteConfig

  return (
    <LegalPageShell title="Conditions générales de vente">
      <section>
        <h2>1. Objet et champ d&apos;application</h2>
        <p>
          Les présentes conditions générales de vente régissent les ventes de bijoux réalisées sur le site Misty
          Cats par {legal.companyName ?? MISSING_LEGAL_INFO}. Toute commande passée sur le site implique
          l&apos;acceptation pleine et entière des présentes conditions.
        </p>
      </section>

      <section>
        <h2>2. Pièces uniques et disponibilité</h2>
        <p>
          Chaque bijou est une pièce unique, réalisée à partir de matériaux upcyclés récupérés en quantité limitée.
          Contrairement à un produit fabriqué en série, un article vendu ou retiré de la vente ne sera{" "}
          <strong>pas nécessairement reproduit à l&apos;identique</strong>. La disponibilité affichée sur la fiche
          produit reflète le stock réel au moment de la consultation ; elle peut évoluer si plusieurs clients
          consultent la même pièce simultanément.
        </p>
      </section>

      <section>
        <h2>3. Prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises. {legal.vatStatus ?? MISSING_LEGAL_INFO}. Le prix
          applicable est celui en vigueur au moment de la validation de la commande.
        </p>
      </section>

      <section>
        <h2>4. Commande</h2>
        <p>
          La commande est validée après confirmation du panier, saisie des informations de livraison et paiement
          intégral. Une confirmation est envoyée par email à l&apos;adresse indiquée par le client.
        </p>
      </section>

      <section>
        <h2>5. Moyens de paiement</h2>
        <ul>
          {payment.methods.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>6. Livraison</h2>
        <ul>
          {shipping.methods.map((m) => (
            <li key={m.label}>
              {m.label} — {m.price}, délai indicatif {m.delay}
            </li>
          ))}
        </ul>
        <p>Livraison en France métropolitaine uniquement, sauf accord préalable.</p>
      </section>

      <section>
        <h2>7. Droit de rétractation</h2>
        <p>
          Conformément aux articles L. 221-18 et suivants du Code de la consommation, le client dispose d&apos;un
          délai de {shipping.returnDelayDays} jours à compter de la réception du produit pour exercer son droit de
          rétractation, sans avoir à justifier de motif ni à payer de pénalité, à l&apos;exception des frais de
          retour.
        </p>
        <p>
          Pour exercer ce droit, le client notifie sa décision par une déclaration dénuée d&apos;ambiguïté, par
          exemple par email à {contact.email}, en utilisant si besoin le modèle ci-dessous.
        </p>
        <p className="border border-border p-4 not-italic">
          <em>
            « Je notifie par la présente ma rétractation du contrat portant sur la vente du bien ci-dessous :
            commande n°..., commandé le..., reçu le..., nom du client, adresse du client, date. »
          </em>
        </p>
        <p>
          Le droit de rétractation ne peut être exercé sur un bien confectionné selon les spécifications du client
          ou nettement personnalisé.
        </p>
      </section>

      <section>
        <h2>8. Garanties légales</h2>
        <p>
          Tout article vendu bénéficie de la garantie légale de conformité (articles L. 217-3 et suivants du Code de
          la consommation) et de la garantie légale des vices cachés (articles 1641 et suivants du Code civil), sans
          frais supplémentaire pour le client.
        </p>
      </section>

      <section>
        <h2>9. Réclamations et médiation</h2>
        <p>
          Toute réclamation peut être adressée à {contact.email}. À défaut de résolution amiable, le client peut
          recourir gratuitement à un médiateur de la consommation dans les conditions prévues à l&apos;article L.
          616-1 du Code de la consommation ({MISSING_LEGAL_INFO} — coordonnées du médiateur à compléter une fois
          l&apos;adhésion effectuée).
        </p>
      </section>

      <section>
        <h2>10. Droit applicable</h2>
        <p>
          Les présentes conditions générales de vente sont soumises au droit français. En cas de litige, et à défaut
          de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
      </section>

      <section>
        <h2>11. Adresse de l&apos;entreprise</h2>
        <p>
          {address.street}, {address.postalCode} {address.city}, {address.country}
        </p>
      </section>
    </LegalPageShell>
  )
}
