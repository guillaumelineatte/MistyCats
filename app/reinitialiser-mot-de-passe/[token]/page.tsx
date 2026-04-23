"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle } from "lucide-react"
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
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"

export default function ReinitialiserMotDePassePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(data: ResetPasswordInput) {
    setError(null)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: params.token, ...data }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Une erreur est survenue.")
      return
    }

    setSuccess(true)
    setTimeout(() => router.push("/login"), 3000)
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

        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-10 w-10 text-foreground mx-auto" />
            <h2 className="text-lg font-light tracking-wider">Mot de passe modifié</h2>
            <p className="text-sm text-muted-foreground">
              Votre mot de passe a été réinitialisé avec succès.
              Vous allez être redirigé vers la page de connexion.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-lg font-light tracking-wider">Nouveau mot de passe</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choisissez un nouveau mot de passe sécurisé.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase">Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        8 caractères minimum, une majuscule, un chiffre
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase">Confirmer</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
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
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  )
}
