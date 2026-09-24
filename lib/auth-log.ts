type AuthEvent =
  | "register"
  | "login_success"
  | "login_failure"
  | "email_verified"
  | "password_reset_requested"
  | "password_reset_completed"
  | "password_changed"

/**
 * Journalisation structurée des événements d'auth (stdout — capté par les
 * logs Vercel). Pas de service de log dédié dans ce projet ; un email n'est
 * jamais loggé en clair à côté d'un mot de passe ou d'un token.
 */
export function logAuthEvent(event: AuthEvent, details: Record<string, string | null | undefined>) {
  console.log(JSON.stringify({ type: "auth_event", event, ...details, at: new Date().toISOString() }))
}
