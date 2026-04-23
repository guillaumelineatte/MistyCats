"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"

export default function MotDePasseOubliePage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? "Une erreur est survenue.")
      return
    }

    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block group">
            <h1 className="font-serif text-3xl tracking-widest uppercase text-foreground transition-all duration-300 group-hover:tracking-[0.4em]">
              Misty Cats
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.5em] uppercase text-muted-foreground">
              Bijoux Upcyclés
            </p>
          </Link>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-10 w-10 text-foreground mx-auto" />
            <h2 className="text-lg font-light tracking-wider">Email envoyé</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si un compte existe avec cette adresse, vous recevrez un email
              avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-muted-foreground">
              Ce lien est valable 1 heure.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors mt-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-lg font-light tracking-wider">Mot de passe oublié</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase">Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="votre@email.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-none tracking-widest uppercase text-xs"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
