"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { customRequestSchema, type CustomRequestInput } from "@/lib/validations/contact"

export default function SurMesurePage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CustomRequestInput>({
    resolver: zodResolver(customRequestSchema),
    defaultValues: { name: "", email: "", description: "", budget: "" },
  })

  async function onSubmit(data: CustomRequestInput) {
    setError(null)
    const res = await fetch("/api/custom-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const body = await res.json()
    if (!res.ok) {
      setError(body.error ?? "Une erreur est survenue.")
      return
    }
    setSuccess(true)
    form.reset()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase text-center mb-4">Sur-mesure</h1>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Une pièce unique imaginée pour vous. Décrivez votre idée, nous revenons vers vous.
          </p>

          {success ? (
            <p className="text-sm text-center border border-border p-6">
              Votre demande a été envoyée. Nous vous répondrons rapidement.
            </p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-wider uppercase">Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-wider uppercase">Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="budget" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-wider uppercase">Budget indicatif (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Votre idée</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full rounded-none tracking-widest uppercase text-xs py-6">
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer ma demande"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
