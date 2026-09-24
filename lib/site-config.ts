/**
 * Source unique de vérité pour les informations de la boutique : adresse,
 * horaires, contact, réseaux, identité légale. Utilisé partout (store, footer,
 * pages légales, données structurées) — ne jamais dupliquer ces valeurs
 * ailleurs dans le code.
 *
 * Les champs marqués `null` ou "[À COMPLÉTER]" sont des informations réelles
 * manquantes, volontairement non inventées. Ne pas les remplacer par une
 * valeur plausible : attendre la confirmation, voir AUDIT.md.
 */

export interface OpeningHours {
  days: string
  hours: string
}

export interface SiteConfig {
  brand: {
    name: string
    tagline: string
  }
  contact: {
    /** null tant que le vrai numéro n'est pas confirmé (voir AUDIT.md lot 3) */
    phone: string | null
    email: string
  }
  address: {
    street: string
    postalCode: string
    city: string
    country: string
    /** utilisée pour le lien Google Maps du bloc "Notre Magasin" */
    mapsUrl: string
  }
  hours: OpeningHours[]
  social: {
    instagram: string
    /** null : aucune page Facebook réelle confirmée (voir AUDIT.md lot 3) */
    facebook: string | null
  }
  legal: {
    /** raison sociale ou nom de l'entrepreneur — manquant */
    companyName: string | null
    /** forme juridique (EI, micro-entreprise, SASU...) — manquant */
    legalForm: string | null
    /** SIRET (14 chiffres) — manquant */
    siret: string | null
    /** mention TVA (intracommunautaire ou franchise en base) — manquant */
    vatStatus: string | null
    /** capital social, uniquement si société — manquant */
    shareCapital: string | null
    publicationDirector: string
    dpo: string | null
    host: {
      name: string
      address: string
      website: string
    }
  }
  shipping: {
    methods: { label: string; price: string; delay: string }[]
    returnDelayDays: number
  }
  payment: {
    methods: string[]
  }
}

export const siteConfig: SiteConfig = {
  brand: {
    name: "Misty Cats",
    tagline: "Bijoux Upcyclés",
  },
  contact: {
    phone: null,
    email: "contact@mistycats.fr",
  },
  address: {
    street: "7 Rue Lamarck",
    postalCode: "80000",
    city: "Amiens",
    country: "France",
    mapsUrl:
      "https://www.google.com/maps/place/7+Rue+Lamarck,+80000+Amiens/@49.8914112,2.2966534,17z/data=!3m1!4b1!4m6!3m5!1s0x47e7844723212ac3:0xc04cffc0ed61655d!8m2!3d49.8914112!4d2.2992283!16s%2Fg%2F11xgftn_20?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D",
  },
  hours: [
    { days: "Mardi", hours: "14h00 - 19h00" },
    { days: "Mercredi - Samedi", hours: "11h00 - 19h00" },
  ],
  social: {
    instagram: "https://www.instagram.com/_mistycats/",
    facebook: null,
  },
  legal: {
    companyName: null,
    legalForm: null,
    siret: null,
    vatStatus: null,
    shareCapital: null,
    publicationDirector: "Guillaume Linéatte",
    dpo: null,
    host: {
      name: "Vercel Inc.",
      address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
      website: "https://vercel.com",
    },
  },
  shipping: {
    methods: [
      { label: "Point relais (Colissimo)", price: "4,90 €", delay: "2 à 4 jours ouvrés" },
      { label: "Domicile (Colissimo)", price: "6,90 €", delay: "2 à 4 jours ouvrés" },
    ],
    returnDelayDays: 14,
  },
  payment: {
    methods: ["Carte bancaire"],
  },
}

/** Placeholder textuel à afficher tant qu'une info légale n'est pas fournie. */
export const MISSING_LEGAL_INFO = "[À COMPLÉTER — information non fournie, ne pas publier tel quel]"
