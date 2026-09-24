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
import { contactSchema, type ContactInput } from "@/lib/validations/contact"

export default function ContactPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  async function onSubmit(data: ContactInput) {
    setError(null)
    const res = await fetch("/api/contact", {
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
          <h1 className="text-3xl sm:text-4xl font-light tracking-widest uppercase text-center mb-4">Contact</h1>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Une question ? Écrivez-nous, nous répondons sous quelques jours.
          </p>

          {success ? (
            <p className="text-sm text-center border border-border p-6">
              Votre message a été envoyé. Nous vous répondrons rapidement.
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
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs tracking-wider uppercase">Sujet (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Message</FormLabel>
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
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
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
