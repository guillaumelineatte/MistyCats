import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export function LegalPageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-40 pb-20 sm:pt-48 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase mb-12">{title}</h1>
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90 [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-medium [&_h2]:tracking-wide [&_h2]:uppercase [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:first:mt-0 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
