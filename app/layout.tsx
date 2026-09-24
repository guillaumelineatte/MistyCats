import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "@/components/admin/session-provider"
import "./globals.css"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const description =
  "Bijoux artisanaux créés à partir de matériaux upcyclés. Un style unique alliant élégance et engagement écologique."

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Misty Cats | Bijoux Upcyclés",
    template: "%s | Misty Cats",
  },
  description,
  openGraph: {
    title: "Misty Cats | Bijoux Upcyclés",
    description,
    siteName: "Misty Cats",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Misty Cats | Bijoux Upcyclés",
    description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favori-icon.png" type="image/png" sizes="any" />
      </head>
      <body className={`${cormorant.variable} ${inter.variable} font-serif antialiased overflow-x-hidden`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
