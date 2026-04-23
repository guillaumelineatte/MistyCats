import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe/${token}`

  // En développement sans SMTP configuré : log dans la console
  if (!process.env.SMTP_HOST) {
    console.log(`\n[DEV] Lien de réinitialisation de mot de passe :\n${resetUrl}\n`)
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@mistycats.fr",
    to,
    subject: "Réinitialisation de votre mot de passe — Misty Cats",
    html: `
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
            Réinitialisation de votre mot de passe
          </h2>
          <p style="font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 32px;">
            Vous avez demandé à réinitialiser le mot de passe de votre compte Misty Cats.
            Cliquez sur le bouton ci-dessous pour en créer un nouveau.
            Ce lien est valable pendant <strong>1 heure</strong>.
          </p>

          <a href="${resetUrl}"
             style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none;
                    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
                    padding: 14px 32px;">
            Réinitialiser mon mot de passe
          </a>

          <p style="font-size: 12px; color: #9a9a8a; margin: 32px 0 0; line-height: 1.6;">
            Si vous n'avez pas fait cette demande, ignorez simplement cet email.
            Votre mot de passe restera inchangé.
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
