// Base rédigée automatiquement (lot 1.3 de l'audit, voir AUDIT.md). Un
// professionnel du droit doit relire ce texte avant toute ouverture réelle de
// la boutique — ce n'est pas un avis juridique.

import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig, MISSING_LEGAL_INFO } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Mentions légales | Misty Cats",
  description: "Mentions légales de la boutique Misty Cats.",
}

export default function MentionsLegalesPage() {
  const { legal, address, contact } = siteConfig

  return (
    <LegalPageShell title="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <p>Raison sociale / nom de l&apos;entrepreneur : {legal.companyName ?? MISSING_LEGAL_INFO}</p>
        <p>Forme juridique : {legal.legalForm ?? MISSING_LEGAL_INFO}</p>
        <p>SIRET : {legal.siret ?? MISSING_LEGAL_INFO}</p>
        <p>
          Adresse du siège : {address.street}, {address.postalCode} {address.city}, {address.country}
        </p>
        <p>TVA : {legal.vatStatus ?? MISSING_LEGAL_INFO}</p>
        {legal.shareCapital && <p>Capital social : {legal.shareCapital}</p>}
        <p>Contact : {contact.email}{contact.phone ? ` — ${contact.phone}` : ` — ${MISSING_LEGAL_INFO}`}</p>
      </section>

      <section>
        <h2>Responsable de la publication</h2>
        <p>{legal.publicationDirector}</p>
        {legal.dpo && <p>Délégué à la protection des données : {legal.dpo}</p>}
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>{legal.host.name}</p>
        <p>{legal.host.address}</p>
        <p>
          <a href={legal.host.website} target="_blank" rel="noopener noreferrer">
            {legal.host.website}
          </a>
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur ce site (textes, images, logos, créations) est la propriété de{" "}
          {legal.companyName ?? "Misty Cats"} sauf mention contraire, et ne peut être reproduit sans autorisation
          préalable.
        </p>
      </section>

      <section>
        <h2>Médiation de la consommation</h2>
        <p>
          Conformément à l&apos;article L. 616-1 du Code de la consommation, tout client dispose du droit de recourir
          gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un litige. Les
          coordonnées du médiateur compétent seront communiquées ici une fois l&apos;adhésion à un service de
          médiation effectuée.
        </p>
      </section>
    </LegalPageShell>
  )
}
