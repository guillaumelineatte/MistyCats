// Base rédigée automatiquement (lot 1.3 de l'audit, voir AUDIT.md). Un
// professionnel du droit doit relire ce texte avant toute ouverture réelle de
// la boutique — ce n'est pas un avis juridique.

import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig, MISSING_LEGAL_INFO } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Politique de confidentialité | Misty Cats",
  description: "Politique de confidentialité et protection des données personnelles de Misty Cats.",
}

export default function ConfidentialitePage() {
  const { legal, contact } = siteConfig

  return (
    <LegalPageShell title="Politique de confidentialité">
      <section>
        <h2>Responsable de traitement</h2>
        <p>
          {legal.companyName ?? MISSING_LEGAL_INFO}, {contact.email}
          {legal.dpo && <> — délégué à la protection des données : {legal.dpo}</>}
        </p>
      </section>

      <section>
        <h2>Données collectées</h2>
        <ul>
          <li>Données de compte : nom, prénom, email, téléphone, mot de passe (chiffré)</li>
          <li>Adresses de livraison et de facturation</li>
          <li>Données de commande : historique d&apos;achats, montants</li>
          <li>Email pour l&apos;inscription à la newsletter (facultatif, sur consentement séparé)</li>
        </ul>
      </section>

      <section>
        <h2>Finalités et base légale</h2>
        <ul>
          <li>Gestion du compte client et des commandes — exécution du contrat</li>
          <li>Envoi d&apos;emails transactionnels (confirmation, réinitialisation de mot de passe) — exécution du contrat</li>
          <li>Envoi de la newsletter — consentement, révocable à tout moment</li>
          <li>Respect des obligations comptables et fiscales — obligation légale</li>
        </ul>
      </section>

      <section>
        <h2>Durées de conservation</h2>
        <ul>
          <li>Données de compte : durée de la relation commerciale, puis archivage limité aux obligations légales</li>
          <li>Données de commande : 10 ans (obligations comptables)</li>
          <li>Email newsletter : jusqu&apos;à désinscription</li>
        </ul>
      </section>

      <section>
        <h2>Destinataires</h2>
        <p>
          Les données sont traitées par {legal.companyName ?? "Misty Cats"} et ses sous-traitants techniques
          strictement nécessaires au fonctionnement du site : hébergement ({legal.host.name}), base de données,
          envoi d&apos;emails transactionnels. Aucune donnée n&apos;est vendue à des tiers.
        </p>
      </section>

      <section>
        <h2>Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité sur
          vos données. Vous pouvez exercer ces droits en écrivant à {contact.email}. Vous disposez également du
          droit d&apos;introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Le site utilise des cookies strictement nécessaires à son fonctionnement (session de connexion, panier) et
          un outil de mesure d&apos;audience. Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé à ce
          jour.
        </p>
      </section>
    </LegalPageShell>
  )
}
