/**
 * 🌍 MESSAGES I18N - Authentication
 *
 * Messages d'authentification en français et anglais
 */

export const authMessages = {
  // 🔐 Login
  "auth.login_attempt": {
    fr: "Tentative de connexion pour {email}",
    en: "Login attempt for {email}",
  },
  "auth.login_successful": {
    fr: "Connexion réussie pour {userId} ({email})",
    en: "Successful login for {userId} ({email})",
  },
  "auth.login_failed": {
    fr: "Échec de connexion pour {email}: {error}",
    en: "Login failed for {email}: {error}",
  },
  "auth.invalid_credentials": {
    fr: "Email ou mot de passe incorrect",
    en: "Invalid email or password",
  },
  "auth.login_error": {
    fr: "Erreur lors de la connexion",
    en: "Login error",
  },

  // 🔄 Refresh Token
  "auth.refresh_attempt": {
    fr: "Tentative de renouvellement du token",
    en: "Token refresh attempt",
  },
  "auth.refresh_successful": {
    fr: "Token renouvelé avec succès",
    en: "Token refreshed successfully",
  },
  "auth.refresh_failed": {
    fr: "Échec du renouvellement du token: {error}",
    en: "Token refresh failed: {error}",
  },
  "auth.refresh_token_missing": {
    fr: "Token de renouvellement manquant",
    en: "Refresh token missing",
  },
  "auth.invalid_refresh_token": {
    fr: "Token de renouvellement invalide",
    en: "Invalid refresh token",
  },
  "auth.refresh_error": {
    fr: "Erreur lors du renouvellement du token",
    en: "Token refresh error",
  },

  // � Registration
  "auth.register_attempt": {
    fr: "Tentative d'inscription pour {email}",
    en: "Registration attempt for {email}",
  },
  "auth.register_success": {
    fr: "Inscription réussie pour {userId} ({email})",
    en: "Registration successful for {userId} ({email})",
  },
  "auth.register_failed": {
    fr: "Échec de l'inscription pour {email}: {error}",
    en: "Registration failed for {email}: {error}",
  },
  "auth.email_already_exists": {
    fr: "Cette adresse email est déjà utilisée",
    en: "This email address is already in use",
  },
  "auth.no_refresh_token": {
    fr: "Token de rafraîchissement manquant",
    en: "Refresh token missing",
  },

  // �🚪 Logout
  "auth.logout_attempt": {
    fr: "Tentative de déconnexion",
    en: "Logout attempt",
  },
  "auth.logout_successful": {
    fr: "Déconnexion réussie",
    en: "Logout successful",
  },
  "auth.logout_failed": {
    fr: "Échec de la déconnexion: {error}",
    en: "Logout failed: {error}",
  },
  "auth.logout_success": {
    fr: "Vous avez été déconnecté avec succès",
    en: "You have been logged out successfully",
  },
  "auth.logout_error": {
    fr: "Erreur lors de la déconnexion",
    en: "Logout error",
  },

  // 👤 User Info
  "auth.me_attempt": {
    fr: "Récupération des informations utilisateur",
    en: "Fetching user information",
  },
  "auth.me_successful": {
    fr: "Informations utilisateur récupérées avec succès",
    en: "User information fetched successfully",
  },
  "auth.me_failed": {
    fr: "Échec de récupération des informations utilisateur: {error}",
    en: "Failed to fetch user information: {error}",
  },
  "auth.user_not_found": {
    fr: "Utilisateur non trouvé",
    en: "User not found",
  },
  "auth.authentication_required": {
    fr: "Authentification requise",
    en: "Authentication required",
  },

  // 🎫 Tokens
  "auth.tokens_generated": {
    fr: "Tokens générés pour l'utilisateur {userId}, session {sessionId}",
    en: "Tokens generated for user {userId}, session {sessionId}",
  },
  "auth.access_token_refreshed": {
    fr: "Token d'accès renouvelé pour l'utilisateur {userId}",
    en: "Access token refreshed for user {userId}",
  },
  "auth.token_validation_failed": {
    fr: "Échec de validation du token {tokenType}: {error}",
    en: "Token validation failed for {tokenType}: {error}",
  },
  "auth.access_token_missing": {
    fr: "Token d'accès manquant",
    en: "Access token missing",
  },
  "auth.invalid_access_token": {
    fr: "Token d'accès invalide",
    en: "Invalid access token",
  },

  // 🍪 Cookies
  "auth.cookies_set": {
    fr: "Cookies d'authentification configurés pour l'environnement {environment}",
    en: "Authentication cookies set for {environment} environment",
  },
  "auth.cookies_cleared": {
    fr: "Cookies d'authentification supprimés pour l'environnement {environment}",
    en: "Authentication cookies cleared for {environment} environment",
  },

  // 🔒 Security
  "auth.security_context_created": {
    fr: "Contexte de sécurité créé pour la requête {requestId}",
    en: "Security context created for request {requestId}",
  },
  "auth.session_created": {
    fr: "Session créée pour l'utilisateur {userId}, appareil {deviceId}",
    en: "Session created for user {userId}, device {deviceId}",
  },
  "auth.session_revoked": {
    fr: "Session révoquée pour l'utilisateur {userId}: {reason}",
    en: "Session revoked for user {userId}: {reason}",
  },
  "auth.suspicious_activity": {
    fr: "Activité suspecte détectée pour l'utilisateur {userId}",
    en: "Suspicious activity detected for user {userId}",
  },

  // ⚠️ Warnings
  "auth.multiple_login_attempts": {
    fr: "Multiples tentatives de connexion pour {email}",
    en: "Multiple login attempts for {email}",
  },
  "auth.ip_address_changed": {
    fr: "Changement d'adresse IP détecté pour l'utilisateur {userId}",
    en: "IP address change detected for user {userId}",
  },
  "auth.device_changed": {
    fr: "Changement d'appareil détecté pour l'utilisateur {userId}",
    en: "Device change detected for user {userId}",
  },

  // ✅ Success Messages
  "success.auth.login_successful": {
    fr: "Connexion réussie",
    en: "Login successful",
  },
  "success.auth.register_successful": {
    fr: "Inscription réussie",
    en: "Registration successful",
  },
  "success.auth.token_refreshed": {
    fr: "Token renouvelé avec succès",
    en: "Token refreshed successfully",
  },
  "success.auth.logout_successful": {
    fr: "Déconnexion réussie",
    en: "Logout successful",
  },

  // 🎯 Development
  "auth.dev_mode_warning": {
    fr: "Mode développement: sécurité réduite activée",
    en: "Development mode: reduced security enabled",
  },
  "auth.production_mode_active": {
    fr: "Mode production: sécurité maximale activée",
    en: "Production mode: maximum security enabled",
  },
} as const;

export type AuthMessageKey = keyof typeof authMessages;
