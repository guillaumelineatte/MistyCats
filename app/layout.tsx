import type React from "react"
import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
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

export const metadata: Metadata = {
  title: "Misty Cats | Bijoux Upcyclés",
  description:
    "Bijoux artisanaux créés à partir de matériaux upcyclés. Un style unique alliant élégance et engagement écologique.",
  keywords: ["bijoux", "upcycling", "écologique", "artisanal", "durable", "mode éthique"],
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
