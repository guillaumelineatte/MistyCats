import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGallery } from "@/components/product-gallery"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Button } from "@/components/ui/button"
import { formatCents } from "@/lib/money"
import { siteConfig } from "@/lib/site-config"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// Statuts visibles publiquement : une pièce vendue ou réservée reste consultable
// (transparence), un brouillon ou une pièce archivée non.
const PUBLIC_STATUSES = ["ONLINE", "RESERVED", "SOLD"] as const

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      drop: { select: { id: true, name: true } },
    },
  })
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article || !PUBLIC_STATUSES.includes(article.status as (typeof PUBLIC_STATUSES)[number])) return {}

  return {
    title: `${article.title} | Misty Cats`,
    description: article.shortDescription,
    openGraph: {
      title: article.title,
      description: article.shortDescription,
      images: article.images[0] ? [article.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article || !PUBLIC_STATUSES.includes(article.status as (typeof PUBLIC_STATUSES)[number])) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: article.title,
    description: article.shortDescription,
    sku: article.sku,
    image: article.images.map((img) => img.url),
    category: article.category.name,
    offers: {
      "@type": "Offer",
      price: (article.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability:
        article.status === "ONLINE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.AUTH_URL ?? "http://localhost:3000"}/boutique/produit/${article.slug}`,
    },
    brand: { "@type": "Brand", name: siteConfig.brand.name },
  }

  const details = [
    { label: "Époque", value: article.era },
    { label: "Matières", value: article.materials },
    { label: "Dimensions", value: article.dimensions },
    { label: "Longueur de chaîne", value: article.chainLength },
    { label: "Poids", value: article.weight },
    { label: "Référence", value: article.sku },
  ].filter((d) => d.value)

  return (
    <main className="min-h-screen bg-background">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <section className="pt-32 sm:pt-40 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider mb-8"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Toute la collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <ProductGallery
              images={article.images.map((img) => ({ url: img.url, alt: img.alt || article.title }))}
              title={article.title}
            />

            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                {article.category.name}
                {article.drop && (
                  <>
                    {" — "}
                    <Link href={`/boutique/drops/${article.drop.id}`} className="underline underline-offset-4">
                      {article.drop.name}
                    </Link>
                  </>
                )}
              </p>
              <h1 className="text-3xl sm:text-4xl font-light tracking-wide mb-4">{article.title}</h1>
              <p className="text-2xl font-light mb-6">{formatCents(article.priceCents)}</p>

              {article.status === "SOLD" && (
                <p className="mb-6 text-sm tracking-widest uppercase text-muted-foreground border border-border px-4 py-3 inline-block">
                  Cette pièce a trouvé preneuse
                </p>
              )}
              {article.status === "RESERVED" && (
                <p className="mb-6 text-sm tracking-widest uppercase text-muted-foreground border border-border px-4 py-3 inline-block">
                  Actuellement réservée
                </p>
              )}

              <p className="text-sm leading-relaxed text-muted-foreground mb-8 whitespace-pre-line">
                {article.description}
              </p>

              {article.story && (
                <div className="mb-8">
                  <h2 className="text-xs tracking-widest uppercase mb-2">L'histoire de la pièce</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{article.story}</p>
                </div>
              )}

              {details.length > 0 && (
                <dl className="mb-8 space-y-2 border-t border-border pt-6">
                  {details.map((d) => (
                    <div key={d.label} className="flex justify-between text-sm">
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {article.status === "ONLINE" ? (
                <AddToCartButton articleId={article.id} />
              ) : (
                <Button disabled className="w-full rounded-none tracking-widest uppercase text-xs py-6">
                  Indisponible
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
