"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Copy } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { addressSchema, type AddressInput } from "@/lib/validations/auth"

type AddressData = AddressInput & { id?: string }

function AddressForm({
  title,
  type,
  onSaved,
}: {
  title: string
  type: "SHIPPING" | "BILLING"
  onSaved?: (data: AddressData) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      street: "",
      complement: "",
      postalCode: "",
      city: "",
      country: "France",
      phone: "",
    },
  })

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/user/address/${type.toLowerCase()}`)
      if (res.ok) {
        const data = await res.json()
        if (data) {
          form.reset({
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            street: data.street ?? "",
            complement: data.complement ?? "",
            postalCode: data.postalCode ?? "",
            city: data.city ?? "",
            country: data.country ?? "France",
            phone: data.phone ?? "",
          })
        }
      }
      setLoaded(true)
    }
    load()
  }, [type, form])

  async function onSubmit(data: AddressInput) {
    setError(null)

    const res = await fetch(`/api/user/address/${type.toLowerCase()}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Une erreur est survenue.")
      return
    }

    toast.success(`${title} enregistrée`)
    onSaved?.(json)
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement…
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Prénom / Nom */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
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

        {/* Adresse */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Adresse</FormLabel>
              <FormControl>
                <Input autoComplete={`${type === "SHIPPING" ? "shipping" : "billing"} street-address`} placeholder="12 rue des Lilas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complement"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">
                Complément{" "}
                <span className="normal-case text-muted-foreground">(optionnel)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Appartement, bâtiment, étage…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CP / Ville */}
        <div className="grid grid-cols-[140px_1fr] gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Code postal</FormLabel>
                <FormControl>
                  <Input
                    autoComplete={`${type === "SHIPPING" ? "shipping" : "billing"} postal-code`}
                    placeholder="75001"
                    maxLength={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wider uppercase">Ville</FormLabel>
                <FormControl>
                  <Input
                    autoComplete={`${type === "SHIPPING" ? "shipping" : "billing"} address-level2`}
                    placeholder="Paris"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs tracking-wider uppercase">Pays</FormLabel>
              <FormControl>
                <Input autoComplete={`${type === "SHIPPING" ? "shipping" : "billing"} country-name`} placeholder="France" {...field} />
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
                <Input type="tel" autoComplete="tel" placeholder="06 12 34 56 78" {...field} />
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
  )
}

export default function AdressesPage() {
  const [sameAsSh, setSameAsSh] = useState(false)
  const [shippingData, setShippingData] = useState<AddressData | null>(null)

  const billingForm = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      street: "",
      complement: "",
      postalCode: "",
      city: "",
      country: "France",
      phone: "",
    },
  })

  // Charger l'adresse de facturation existante
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user/address/billing")
      if (res.ok) {
        const data = await res.json()
        if (data) {
          billingForm.reset({
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            street: data.street ?? "",
            complement: data.complement ?? "",
            postalCode: data.postalCode ?? "",
            city: data.city ?? "",
            country: data.country ?? "France",
            phone: data.phone ?? "",
          })
        }
      }
    }
    load()
  }, [billingForm])

  function copyShippingToBilling() {
    if (!shippingData) {
      toast.error("Enregistrez d'abord votre adresse de livraison.")
      return
    }
    billingForm.reset({
      firstName: shippingData.firstName,
      lastName: shippingData.lastName,
      street: shippingData.street,
      complement: shippingData.complement ?? "",
      postalCode: shippingData.postalCode,
      city: shippingData.city,
      country: shippingData.country,
      phone: shippingData.phone ?? "",
    })
  }

  async function onBillingSubmit(data: AddressInput) {
    const res = await fetch("/api/user/address/billing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success("Adresse de facturation enregistrée")
    } else {
      const json = await res.json()
      toast.error(json.error ?? "Une erreur est survenue.")
    }
  }

  return (
    <div className="space-y-12 max-w-md">
      {/* Livraison */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-light tracking-wider">Adresse de livraison</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            L&apos;adresse à laquelle vous souhaitez recevoir vos commandes.
          </p>
        </div>
        <AddressForm
          title="Adresse de livraison"
          type="SHIPPING"
          onSaved={setShippingData}
        />
      </section>

      <Separator />

      {/* Facturation */}
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-light tracking-wider">Adresse de facturation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              L&apos;adresse qui apparaîtra sur vos factures.
            </p>
          </div>
          <button
            type="button"
            onClick={copyShippingToBilling}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-1"
          >
            <Copy className="h-3.5 w-3.5" />
            Copier livraison
          </button>
        </div>

        <Form {...billingForm}>
          <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={billingForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Prénom</FormLabel>
                    <FormControl>
                      <Input autoComplete="billing given-name" placeholder="Marie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billingForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Nom</FormLabel>
                    <FormControl>
                      <Input autoComplete="billing family-name" placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={billingForm.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">Adresse</FormLabel>
                  <FormControl>
                    <Input autoComplete="billing street-address" placeholder="12 rue des Lilas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={billingForm.control}
              name="complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Complément{" "}
                    <span className="normal-case text-muted-foreground">(optionnel)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Appartement, bâtiment, étage…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[140px_1fr] gap-4">
              <FormField
                control={billingForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Code postal</FormLabel>
                    <FormControl>
                      <Input autoComplete="billing postal-code" placeholder="75001" maxLength={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={billingForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase">Ville</FormLabel>
                    <FormControl>
                      <Input autoComplete="billing address-level2" placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={billingForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">Pays</FormLabel>
                  <FormControl>
                    <Input autoComplete="billing country-name" placeholder="France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={billingForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-wider uppercase">
                    Téléphone{" "}
                    <span className="normal-case text-muted-foreground">(optionnel)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="billing tel" placeholder="06 12 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="rounded-none tracking-widest uppercase text-xs"
              disabled={billingForm.formState.isSubmitting}
            >
              {billingForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </form>
        </Form>
      </section>
    </div>
  )
}
