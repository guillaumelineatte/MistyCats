import nodemailer from "nodemailer"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import os from "os"
import { formatCents } from "@/lib/money"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function baseUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000"
}

/** Layout partagé par tous les emails transactionnels — une seule mise en page, pas six. */
function renderLayout(opts: {
  heading: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footerHtml?: string
}) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; padding: 48px 40px;">
        <h1 style="font-size: 22px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; margin: 0 0 8px;">
          Misty Cats
        </h1>
        <p style="font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #9a9a8a; margin: 0 0 40px;">
          Bijoux Upcyclés
        </p>

        <h2 style="font-size: 16px; font-weight: 400; margin: 0 0 16px;">
          ${opts.heading}
        </h2>
        <div style="font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 32px;">
          ${opts.bodyHtml}
        </div>

        ${
          opts.ctaUrl && opts.ctaLabel
            ? `<a href="${opts.ctaUrl}"
                 style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none;
                        font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
                        padding: 14px 32px;">
                ${opts.ctaLabel}
              </a>`
            : ""
        }

        ${
          opts.footerHtml
            ? `<p style="font-size: 12px; color: #9a9a8a; margin: 32px 0 0; line-height: 1.6;">${opts.footerHtml}</p>`
            : ""
        }
      </div>
    </body>
    </html>
  `
}

/**
 * Envoie l'email, ou en mode dégradé (pas de SMTP_HOST configuré) l'écrit en
 * console ET dans un fichier HTML consultable — seul mode dégradé autorisé,
 * jamais un envoi silencieusement ignoré. Écrit dans os.tmpdir(), jamais dans
 * le dépôt : le système de fichiers de déploiement Vercel est en lecture
 * seule hors /tmp (voir app/api/upload/route.ts pour le même piège).
 */
async function deliver(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    const dir = path.join(os.tmpdir(), "mistycats-mail")
    const filename = `${Date.now()}-${to.replace(/[^a-z0-9]/gi, "_")}.html`
    const filePath = path.join(dir, filename)
    try {
      await mkdir(dir, { recursive: true })
      await writeFile(filePath, html, "utf8")
      console.log(`\n[DEV] Email « ${subject} » à ${to} (SMTP non configuré) → ${filePath}\n`)
    } catch (err) {
      console.log(`\n[DEV] Email « ${subject} » à ${to} (SMTP non configuré, écriture fichier échouée) :`, err)
    }
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@mistycats.fr",
    to,
    subject,
    html,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${baseUrl()}/reinitialiser-mot-de-passe/${token}`

  await deliver(
    to,
    "Réinitialisation de votre mot de passe — Misty Cats",
    renderLayout({
      heading: "Réinitialisation de votre mot de passe",
      bodyHtml: `Vous avez demandé à réinitialiser le mot de passe de votre compte Misty Cats.
        Cliquez sur le bouton ci-dessous pour en créer un nouveau. Ce lien est valable pendant
        <strong>1 heure</strong>.`,
      ctaLabel: "Réinitialiser mon mot de passe",
      ctaUrl: resetUrl,
      footerHtml: "Si vous n'avez pas fait cette demande, ignorez simplement cet email. Votre mot de passe restera inchangé.",
    })
  )
}

export async function sendPasswordChangedEmail(to: string) {
  await deliver(
    to,
    "Votre mot de passe a été modifié — Misty Cats",
    renderLayout({
      heading: "Mot de passe modifié",
      bodyHtml: `Le mot de passe de votre compte Misty Cats vient d'être modifié. Vos autres sessions
        actives ont été déconnectées par sécurité.`,
      footerHtml: "Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.",
    })
  )
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${baseUrl()}/api/auth/verify-email/${token}`

  await deliver(
    to,
    "Confirmez votre adresse email — Misty Cats",
    renderLayout({
      heading: "Confirmez votre adresse email",
      bodyHtml: `Bienvenue chez Misty Cats. Confirmez votre adresse email pour activer votre compte et
        pouvoir passer commande. Ce lien est valable pendant <strong>24 heures</strong>.`,
      ctaLabel: "Confirmer mon email",
      ctaUrl: verifyUrl,
      footerHtml: "Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.",
    })
  )
}

export async function sendNewsletterConfirmationEmail(to: string, unsubscribeToken: string) {
  const unsubscribeUrl = `${baseUrl()}/api/newsletter/unsubscribe?token=${unsubscribeToken}`

  await deliver(
    to,
    "Bienvenue dans la newsletter Misty Cats",
    renderLayout({
      heading: "Inscription confirmée",
      bodyHtml: `Merci de votre inscription. Vous recevrez nos nouvelles collections, nos histoires de
        création et des offres exclusives.`,
      footerHtml: `Vous pouvez vous désinscrire à tout moment en <a href="${unsubscribeUrl}" style="color: #9a9a8a;">cliquant ici</a>.`,
    })
  )
}

export async function sendOrderConfirmationEmail(
  to: string,
  order: { number: string; items: { titleSnapshot: string; priceCentsSnapshot: number }[]; totalCents: number }
) {
  const trackingUrl = `${baseUrl()}/suivi?commande=${order.number}`
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding: 6px 0; font-size: 13px;">${item.titleSnapshot}</td><td style="padding: 6px 0; font-size: 13px; text-align: right;">${formatCents(item.priceCentsSnapshot)}</td></tr>`
    )
    .join("")

  await deliver(
    to,
    `Confirmation de votre commande ${order.number} — Misty Cats`,
    renderLayout({
      heading: `Commande ${order.number} confirmée`,
      bodyHtml: `Merci pour votre commande. Voici un récapitulatif :
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          ${itemsHtml}
          <tr><td style="padding-top: 12px; font-weight: bold; font-size: 13px;">Total</td>
              <td style="padding-top: 12px; font-weight: bold; font-size: 13px; text-align: right;">${formatCents(order.totalCents)}</td></tr>
        </table>`,
      ctaLabel: "Suivre ma commande",
      ctaUrl: trackingUrl,
    })
  )
}

export async function sendOrderShippedEmail(
  to: string,
  order: { number: string; carrier: string; trackingNumber: string }
) {
  const trackingUrl = `${baseUrl()}/suivi?commande=${order.number}`

  await deliver(
    to,
    `Votre commande ${order.number} est en route — Misty Cats`,
    renderLayout({
      heading: "Votre commande a été expédiée",
      bodyHtml: `Votre commande <strong>${order.number}</strong> vient d'être expédiée via
        <strong>${order.carrier}</strong>. Numéro de suivi : <strong>${order.trackingNumber}</strong>.`,
      ctaLabel: "Suivre mon colis",
      ctaUrl: trackingUrl,
    })
  )
}

export async function sendOrderDeliveredEmail(to: string, order: { number: string }) {
  await deliver(
    to,
    `Votre commande ${order.number} a été livrée — Misty Cats`,
    renderLayout({
      heading: "Votre commande a été livrée",
      bodyHtml: `Votre commande <strong>${order.number}</strong> a été livrée. Nous espérons qu'elle vous plaira !`,
    })
  )
}
