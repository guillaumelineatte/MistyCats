import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Philosophy } from "@/components/philosophy"
import { FeaturedCollection } from "@/components/featured-collection"
import { Categories } from "@/components/categories"
import { Store } from "@/components/store"
import { Testimonials } from "@/components/testimonials"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section id="accueil"><Hero /></section>
      <section id="notre-histoire"><Philosophy /></section>
      <section id="collection"><FeaturedCollection /></section>
      <section id="categories"><Categories /></section>
      <Store />
      <section id="avis"><Testimonials /></section>
      <section id="newsletter"><Newsletter /></section>
      <Footer />
    </main>
  )
}
