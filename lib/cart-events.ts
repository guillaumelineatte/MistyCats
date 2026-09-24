// Petit bus d'événements pour rafraîchir le compteur du panier dans le header
// sans state manager global : chaque mutation du panier notifie, le header écoute.
export const CART_UPDATED_EVENT = "cart:updated"

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}
