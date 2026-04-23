"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
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
import { SessionProvider } from "@/components/admin/session-provider"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/mon-compte"
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setError(null)
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect.")
      return
    }

    const res = await fetch("/api/auth/session")
    const session = await res.json()

    if (session?.user?.role === "ADMIN") {
      router.push("/admin/articles")
    } else {
      router.push(callbackUrl)
    }
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
          <p className="mt-6 text-sm text-muted-foreground">
            Connectez-vous à votre compte
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs tracking-wider uppercase">Mot de passe</FormLabel>
                    <Link
                      href="/mot-de-passe-oublie"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="••••••••" {...field} />
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
                "Se connecter"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </SessionProvider>
  )
}
