"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { Loader2, ChevronLeft, Check } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout"
import { formatCents } from "@/lib/money"
import { siteConfig } from "@/lib/site-config"
import { notifyCartUpdated } from "@/lib/cart-events"

interface CartItem {
  articleId: string
  article: { title: string; priceCents: number; image: string | null }
}

const emptyAddress = {
  firstName: "",
  lastName: "",
  street: "",
  complement: "",
  postalCode: "",
  city: "",
  country: "France",
  phone: "",
}

const STEPS = ["Coordonnées", "Livraison", "Paiement"] as const

function AddressFields({ prefix, form }: { prefix: "shippingAddress" | "billingAddress"; form: ReturnType<typeof useForm<CheckoutInput>> }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField control={form.control} name={`${prefix}.firstName`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Prénom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.lastName`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.street`} render={({ field }) => (
        <FormItem className="col-span-2"><FormLabel className="text-xs tracking-wider uppercase">Adresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.complement`} render={({ field }) => (
        <FormItem className="col-span-2"><FormLabel className="text-xs tracking-wider uppercase">Complément (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.postalCode`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Code postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.city`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Ville</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.country`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Pays</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name={`${prefix}.phone`} render={({ field }) => (
        <FormItem><FormLabel className="text-xs tracking-wider uppercase">Téléphone (optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [items, setItems] = useState<CartItem[] | null>(null)
  const [sameBilling, setSameBilling] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [transactionRef, setTransactionRef] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState("")

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: session?.user?.email ?? "",
      shippingAddress: emptyAddress,
      billingAddress: emptyAddress,
      shippingMethodLabel: siteConfig.shipping.methods[0]?.label ?? "",
    },
  })

  useEffect(() => {
    if (session?.user?.email) form.setValue("email", session.user.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setItems(data.items))
  }, [])

  useEffect(() => {
    if (sameBilling) {
      form.setValue("billingAddress", form.getValues("shippingAddress"))
    }
  }, [sameBilling, form])

  const subtotal = items?.reduce((sum, i) => sum + i.article.priceCents, 0) ?? 0
  const shippingMethod = siteConfig.shipping.methods.find((m) => m.label === form.watch("shippingMethodLabel"))
  const shippingCents = shippingMethod ? Math.round(parseFloat(shippingMethod.price.replace(",", ".")) * 100) : 0
  const total = subtotal + shippingCents

  async function nextStep() {
    if (step === 0) {
      const fields: (keyof CheckoutInput | `shippingAddress.${string}` | `billingAddress.${string}`)[] = [
        "email",
        "shippingAddress.firstName",
        "shippingAddress.lastName",
        "shippingAddress.street",
        "shippingAddress.postalCode",
        "shippingAddress.city",
        "shippingAddress.country",
      ]
      if (!sameBilling) {
        fields.push(
          "billingAddress.firstName",
          "billingAddress.lastName",
          "billingAddress.street",
          "billingAddress.postalCode",
          "billingAddress.city",
          "billingAddress.country"
        )
      } else {
        form.setValue("billingAddress", form.getValues("shippingAddress"))
      }
      const valid = await form.trigger(fields as never)
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  async function confirmOrder(data: CheckoutInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error ?? "Impossible de créer la commande.")
        return
      }
      setTransactionRef(body.transactionRef)
    } catch {
      toast.error("Erreur, réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePay() {
    if (!transactionRef) return
    setPaying(true)
    setPaymentError(null)
    try {
      const res = await fetch(`/api/payments/${transactionRef}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber }),
      })
      const body = await res.json()
      if (!res.ok || !body.success) {
        setPaymentError(body.error ?? "Le paiement a échoué.")
        return
      }
      notifyCartUpdated()
      router.push(`/commande/confirmation/${body.orderNumber}`)
    } catch {
      setPaymentError("Erreur réseau, réessayez.")
    } finally {
      setPaying(false)
    }
  }

  if (items && items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="pt-40 pb-24 text-center">
          <p className="text-muted-foreground text-sm tracking-widest uppercase mb-6">Votre panier est vide</p>
          <Link href="/boutique" className="text-xs tracking-widest uppercase border-b border-foreground pb-0.5">
            Voir la collection
          </Link>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-32 sm:pt-40 pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <Link href="/panier" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider mb-8">
            <ChevronLeft className="h-3.5 w-3.5" />
            Retour au panier
          </Link>

          {/* Étapes */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    i < step ? "bg-foreground text-background" : i === step ? "border border-foreground" : "border border-border text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-xs tracking-widest uppercase hidden sm:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(confirmOrder)} className="space-y-8">
              {/* Étape 1 : coordonnées */}
              {step === 0 && (
                <div className="space-y-6">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs tracking-wider uppercase">Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div>
                    <h2 className="text-xs tracking-widest uppercase text-muted-foreground border-b border-border pb-2 mb-4">Adresse de livraison</h2>
                    <AddressFields prefix="shippingAddress" form={form} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="same-billing" checked={sameBilling} onCheckedChange={(v) => setSameBilling(!!v)} />
                    <label htmlFor="same-billing" className="text-sm text-muted-foreground">
                      Adresse de facturation identique
                    </label>
                  </div>

                  {!sameBilling && (
                    <div>
                      <h2 className="text-xs tracking-widest uppercase text-muted-foreground border-b border-border pb-2 mb-4">Adresse de facturation</h2>
                      <AddressFields prefix="billingAddress" form={form} />
                    </div>
                  )}

                  <Button type="button" onClick={nextStep} className="w-full rounded-none tracking-widest uppercase text-xs py-6">
                    Continuer
                  </Button>
                </div>
              )}

              {/* Étape 2 : livraison */}
              {step === 1 && (
                <div className="space-y-6">
                  <FormField control={form.control} name="shippingMethodLabel" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase mb-2 block">Mode de livraison</FormLabel>
                      <div className="space-y-2">
                        {siteConfig.shipping.methods.map((method) => (
                          <label
                            key={method.label}
                            className={`flex items-center justify-between border p-4 cursor-pointer transition-colors ${field.value === method.label ? "border-foreground" : "border-border"}`}
                          >
                            <div className="flex items-center gap-3">
                              <input type="radio" checked={field.value === method.label} onChange={() => field.onChange(method.label)} className="accent-foreground" />
                              <div>
                                <p className="text-sm">{method.label}</p>
                                <p className="text-xs text-muted-foreground">{method.delay}</p>
                              </div>
                            </div>
                            <span className="text-sm">{method.price}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1 rounded-none tracking-widest uppercase text-xs py-6">
                      Retour
                    </Button>
                    <Button type="button" onClick={() => setStep(2)} className="flex-1 rounded-none tracking-widest uppercase text-xs py-6">
                      Continuer
                    </Button>
                  </div>
                </div>
              )}

              {/* Étape 3 : récapitulatif + paiement */}
              {step === 2 && (
                <div className="space-y-6">
                  {!transactionRef ? (
                    <>
                      <div className="border border-border p-5 space-y-3">
                        {items?.map((item) => (
                          <div key={item.articleId} className="flex justify-between text-sm">
                            <span>{item.article.title}</span>
                            <span>{formatCents(item.article.priceCents)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                          <span>Livraison ({shippingMethod?.label})</span>
                          <span>{shippingMethod?.price}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t border-border">
                          <span>Total</span>
                          <span>{formatCents(total)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-none tracking-widest uppercase text-xs py-6">
                          Retour
                        </Button>
                        <Button type="submit" disabled={submitting} className="flex-1 rounded-none tracking-widest uppercase text-xs py-6">
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer et payer"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-xs tracking-widest uppercase text-center py-2 bg-secondary/50 border border-border">
                        Paiement simulé — aucune transaction réelle
                      </p>
                      <div>
                        <label className="text-xs tracking-wider uppercase block mb-2">Numéro de carte (test)</label>
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                        />
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          4242 4242 4242 4242 → acceptée · 4000 0000 0000 0002 → refusée ·<br />
                          4000 0000 0000 9995 → fonds insuffisants · 4000 0000 0000 0069 → délai puis succès
                        </p>
                      </div>
                      {paymentError && <p className="text-sm text-destructive">{paymentError}</p>}
                      <Button
                        type="button"
                        onClick={handlePay}
                        disabled={paying || cardNumber.length < 12}
                        className="w-full rounded-none tracking-widest uppercase text-xs py-6"
                      >
                        {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : `Payer ${formatCents(total)}`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
