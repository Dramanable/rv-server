/**
 * 🌍 VALIDATION I18N SERVICE - Service de validation internationalisée
 *
 * Service pour fournir des messages de validation traduits
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationI18nService {
  /**
   * Messages de validation traduits
   */
  private readonly validationMessages: Record<string, Record<string, string>> =
    {
      // 🇫🇷 Français
      fr: {
        'validation.email.invalid': 'Veuillez fournir une adresse email valide',
        'validation.email.required': "L'email est requis",
        'validation.password.required': 'Le mot de passe est requis',
        'validation.password.string':
          'Le mot de passe doit être une chaîne de caractères',
        'validation.password.minLength':
          'Le mot de passe doit contenir au moins {min} caractères',
        'validation.rememberMe.boolean':
          'Se souvenir de moi doit être un booléen',
        'validation.logoutAll.boolean':
          'Déconnecter tous les appareils doit être un booléen',
        'validation.refreshToken.string':
          'Le token de rafraîchissement doit être une chaîne de caractères',
      },
      // 🇬🇧 English (fallback)
      en: {
        'validation.email.invalid': 'Please provide a valid email address',
        'validation.email.required': 'Email is required',
        'validation.password.required': 'Password is required',
        'validation.password.string': 'Password must be a string',
        'validation.password.minLength':
          'Password must be at least {min} characters long',
        'validation.rememberMe.boolean': 'Remember me must be a boolean',
        'validation.logoutAll.boolean': 'Logout all must be a boolean',
        'validation.refreshToken.string': 'Refresh token must be a string',
      },
    };

  /**
   * Obtenir un message de validation traduit
   */
  getValidationMessage(
    key: string,
    locale: string = 'fr',
    params?: Record<string, unknown>,
  ): string {
    const messages =
      this.validationMessages[locale] || this.validationMessages.en;
    let message = messages[key] || key;

    // Remplacer les paramètres dans le message
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(`{${param}}`, String(value));
      });
    }

    return message;
  }

  /**
   * Obtenir tous les messages pour une locale
   */
  getAllMessages(locale: string = 'fr'): Record<string, string> {
    return this.validationMessages[locale] || this.validationMessages.en;
  }
}
