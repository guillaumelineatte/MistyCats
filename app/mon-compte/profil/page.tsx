"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/auth"

export default function ProfilPage() {
  const { data: session, update: updateSession } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    name: string
    lastName: string
    email: string
    phone: string
  } | null>(null)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", lastName: "", email: "", phone: "" },
  })

  // Charger les données complètes du profil (y compris lastName/phone non dans la session)
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setProfileData(data)
        form.reset({
          name: data.name ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        })
      }
    }
    if (session?.user?.id) load()
  }, [session?.user?.id, form])

  async function onSubmit(data: UpdateProfileInput) {
    setError(null)

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Une erreur est survenue.")
      return
    }

    await updateSession({ name: data.name, email: data.email })
    setProfileData(json)
    toast.success("Profil mis à jour")
  }

  if (!profileData && !session) return null

  return (
    <div className="space-y-8 max-w-md">
      <div>
        <h2 className="text-xl font-light tracking-wider">Informations personnelles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces informations sont utilisées pour vos commandes et votre compte.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">Prénom</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" placeholder="Marie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">Nom</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" placeholder="Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">
                  Téléphone{" "}
                  <span className="normal-case text-muted-foreground">(optionnel)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="rounded-none tracking-widest uppercase text-xs"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
