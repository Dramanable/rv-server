/**
 * 🌍 Implé      // Domain messages (business rules)
      'errors.user.not_found': 'User not found',
      'errors.user.email_already_exists': 'Email already exists',
      'errors.user.self_deletion_forbidden': 'User cannot delete themselves',
      'errors.auth.insufficient_permissions': 'Insufficient permissions',
      'errors.auth.role_elevation_forbidden': 'Role elevation forbidden',
      'errors.auth.invalid_credentials': 'Invalid email or password',
      'errors.validation.invalid_email': 'Invalid email format',
      'errors.validation.invalid_name': 'Invalid name',
      'errors.validation.failed': 'Validation failed for field {{field}}',
      'errors.name.empty': 'Name cannot be empty',
      'errors.name.too_long': 'Name is too long (max 100 characters)',u service I18n
 *
 * Version Mock simplifiée pour les tests avec structure HYBRID
 */

import type { I18nService } from '../../application/ports/i18n.port';

// Version Mock pour les tests (simplifié)
export class MockI18nService implements I18nService {
  private defaultLang = 'fr';

  // Mock basique avec les clés principales pour les tests
  private mockTranslations: Record<string, Record<string, string>> = {
    en: {
      // Domain messages (business rules)
      'errors.user.not_found': 'User not found',
      'errors.user.email_already_exists': 'Email already exists',
      'errors.user.self_deletion_forbidden': 'A user cannot delete themselves',
      'errors.auth.insufficient_permissions': 'Insufficient permissions',
      'errors.auth.role_elevation_forbidden': 'Role elevation forbidden',
      'errors.auth.invalid_credentials': 'Invalid email or password',
      'errors.validation.invalid_email': 'Invalid email format',
      'errors.validation.invalid_name': 'Invalid name',
      'errors.validation.failed': 'Validation failed for field {{field}}',
      'errors.name.empty': 'Name cannot be empty',
      'errors.name.too_long': 'Name is too long (max 100 characters)',

      // Operations messages (technical)
      'operations.user.creation_attempt': 'Attempting to create user',
      'operations.user.deletion_attempt':
        'Attempting to delete user {{userId}}',
      'operations.user.update_attempt': 'Attempting to update user {{userId}}',
      'operations.user.retrieval_attempt':
        'Attempting to retrieve user {{userId}}',
      'operations.user.target_lookup': 'Looking up target user {{userId}}',
      'operations.user.validation_start':
        'Starting validation for user creation',
      'operations.user.validation_process': 'Starting user validation process',
      'operations.auth.login_attempt': 'Login attempt for {{email}}',
      'operations.auth.password_verification': 'Verifying password',
      'operations.auth.token_generation': 'Generating authentication tokens',
      'operations.auth.token_revocation': 'Revoking existing tokens',
      'operations.permission.check': 'Checking permissions for {{operation}}',
      'operations.failed': 'Operation {{operation}} failed',

      // Success messages
      'success.user.creation_success':
        'User {{email}} created successfully by {{requestingUser}}',
      'success.user.deletion_success':
        'User {{email}} deleted successfully by {{requestingUser}}',
      'success.user.update_success':
        'User {{email}} updated successfully by {{requestingUser}}',
      'success.user.retrieval_success':
        'User {{email}} retrieved successfully by {{requestingUser}}',
      'success.auth.login_success':
        'User {{email}} logged in successfully (ID: {{userId}})',

      // Warning messages
      'warnings.user.not_found':
        'User operation failed: requesting user not found',
      'warnings.user.target_not_found': 'Target user {{userId}} not found',
      'warnings.user.self_deletion_forbidden': 'User cannot delete themselves',
      'warnings.email.already_exists':
        'User operation failed: email {{email}} already exists',
      'warnings.email.invalid_format':
        'User operation failed: invalid email format {{email}}',
      'warnings.permission.denied': 'Permission denied for operation',
      'warnings.role.elevation_attempt':
        'Manager attempted to create {{targetRole}} user',
      'warnings.permission.admin_access_denied':
        'Manager cannot access admin user profiles',
      'warnings.auth.invalid_credentials':
        'Authentication failed: invalid credentials',
      'warnings.auth.token_revocation_failed':
        'Failed to revoke existing tokens during login',

      // Audit messages
      'audit.user.created': 'User created',
      'audit.user.updated': 'User updated',
      'audit.user.deleted': 'User deleted',
      'audit.user.accessed': 'User profile accessed',
      'audit.auth.user_logged_in': 'User logged in',
      'audit.permission.denied': 'Permission denied',

      // Auth messages (specific to auth controller)
      'auth.invalid_credentials': 'Invalid credentials for {email}',
      'auth.invalid_refresh_token': 'Invalid refresh token',
      'auth.user_not_found': 'User not found',
      'auth.service_unavailable': 'Service unavailable',
      'auth.unexpected_error': 'Unexpected error',
      'auth.login_success': 'Login successful for {email}',
      'auth.login_failed': 'Login failed for {email}: {error}',
      'auth.register_success': 'Registration successful for {email}',
      'auth.register_failed': 'Registration failed for {email}: {error}',
      'auth.logout_success': 'Logout successful',
      'auth.refresh_success': 'Token refresh successful',
      'auth.refresh_failed': 'Token refresh failed: {error}',
    },
    fr: {
      // Domain messages (business rules)
      'errors.user.not_found': 'Utilisateur non trouvé',
      'errors.user.email_already_exists': 'Email déjà existant',
      'errors.user.self_deletion_forbidden':
        'Un utilisateur ne peut pas se supprimer lui-même',
      'errors.auth.insufficient_permissions': 'Permissions insuffisantes',
      'errors.auth.role_elevation_forbidden': 'Élévation de rôle interdite',
      'errors.auth.invalid_credentials': 'Email ou mot de passe invalide',
      'errors.validation.invalid_email': 'Format email invalide',
      'errors.validation.invalid_name': 'Nom invalide',
      'errors.validation.failed': 'Échec de validation pour le champ {{field}}',
      'errors.name.empty': 'Le nom ne peut pas être vide',
      'errors.name.too_long': 'Le nom est trop long (max 100 caractères)',

      // Operations messages (technical)
      'operations.user.creation_attempt': 'Tentative de création utilisateur',
      'operations.user.deletion_attempt':
        'Tentative de suppression utilisateur {{userId}}',
      'operations.user.update_attempt':
        'Tentative de modification utilisateur {{userId}}',
      'operations.user.retrieval_attempt':
        'Tentative de récupération utilisateur {{userId}}',
      'operations.user.target_lookup': 'Recherche utilisateur cible {{userId}}',
      'operations.user.validation_start':
        'Début de validation pour création utilisateur',
      'operations.user.validation_process':
        'Début du processus de validation utilisateur',
      'operations.permission.check':
        'Vérification des permissions pour {{operation}}',
      'operations.failed': "Échec de l'opération {{operation}}",

      // Success messages
      'success.user.creation_success':
        'Utilisateur {{email}} créé avec succès par {{requestingUser}}',
      'success.user.deletion_success':
        'Utilisateur {{email}} supprimé avec succès par {{requestingUser}}',
      'success.user.update_success':
        'Utilisateur {{email}} modifié avec succès par {{requestingUser}}',
      'success.user.retrieval_success':
        'Utilisateur {{email}} récupéré avec succès par {{requestingUser}}',

      // Warning messages
      'warnings.user.not_found':
        'Échec opération utilisateur : utilisateur demandeur non trouvé',
      'warnings.user.target_not_found':
        'Utilisateur cible {{userId}} non trouvé',
      'warnings.user.self_deletion_forbidden':
        'Un utilisateur ne peut pas se supprimer lui-même',
      'warnings.email.already_exists':
        'Échec opération utilisateur : email {{email}} déjà existant',
      'warnings.email.invalid_format':
        'Échec opération utilisateur : format email invalide {{email}}',
      'warnings.permission.denied': "Permission refusée pour l'opération",
      'warnings.role.elevation_attempt':
        'Manager a tenté de créer un utilisateur {{targetRole}}',
      'warnings.permission.admin_access_denied':
        'Manager ne peut pas accéder aux profils administrateurs',

      // Audit messages
      'audit.user.created': 'Utilisateur créé',
      'audit.user.updated': 'Utilisateur modifié',
      'audit.user.deleted': 'Utilisateur supprimé',
      'audit.user.accessed': 'Profil utilisateur consulté',
      'audit.permission.denied': 'Permission refusée',

      // Auth messages (specific to auth controller)
      'auth.invalid_credentials': 'Identifiants invalides pour {email}',
      'auth.invalid_refresh_token': 'Token de rafraîchissement invalide',
      'auth.user_not_found': 'Utilisateur non trouvé',
      'auth.service_unavailable': 'Service indisponible',
      'auth.unexpected_error': 'Erreur inattendue',
      'auth.login_success': 'Connexion réussie pour {email}',
      'auth.login_failed': 'Échec de connexion pour {email}: {error}',
      'auth.register_success': 'Inscription réussie pour {email}',
      'auth.register_failed': "Échec d'inscription pour {email}: {error}",
      'auth.logout_success': 'Déconnexion réussie',
      'auth.refresh_success': 'Rafraîchissement du token réussi',
      'auth.refresh_failed': 'Échec du rafraîchissement du token: {error}',
    },
  };

  translate(
    key: string,
    params?: Record<string, unknown>,
    lang?: string,
  ): string {
    const currentLang = lang || this.defaultLang;
    const langTranslations =
      this.mockTranslations[currentLang] || this.mockTranslations.en;
    let translation = langTranslations[key] || key;

    // Remplace les paramètres {{param}} par leurs valeurs
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        const placeholder = `{{${paramKey}}}`;
        translation = translation.replace(
          new RegExp(placeholder, 'g'),
          String(value),
        );
      });
    }

    return translation;
  }

  t(key: string, params?: Record<string, unknown>, lang?: string): string {
    return this.translate(key, params, lang);
  }

  setDefaultLanguage(lang: string): void {
    this.defaultLang = lang;
  }

  exists(key: string, lang?: string): boolean {
    const currentLang = lang || this.defaultLang;
    const langTranslations =
      this.mockTranslations[currentLang] || this.mockTranslations.en;
    return key in langTranslations;
  }
}
