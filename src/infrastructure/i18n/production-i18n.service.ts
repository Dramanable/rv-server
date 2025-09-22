/**
 * 🌍 Production I18n Service - Service I18n pour la production
 *
 * Service I18n réel utilisant les fichiers de traduction
 * Infrastructure Layer - Implémentation technique
 */

import type { I18nService } from '@application/ports/i18n.port';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductionI18nService implements I18nService {
  private translations: Record<string, Record<string, string>> = {};
  private defaultLanguage = 'fr';

  constructor() {
    this.loadTranslations();
  }

  /**
   * Charge les traductions depuis les fichiers JSON
   */
  private loadTranslations(): void {
    const translationsPath = path.join(
      process.cwd(),
      'src/shared/i18n/translations',
    );

    try {
      // Charger les traductions françaises
      const frDomainPath = path.join(translationsPath, 'fr/domain.json');
      if (fs.existsSync(frDomainPath)) {
        const frContent = fs.readFileSync(frDomainPath, 'utf8');
        this.translations.fr = JSON.parse(frContent);
      }

      // Traductions de base en anglais (fallback)
      this.translations.en = {
        // Domain messages (business rules)
        'errors.user.not_found': 'User not found',
        'errors.user.email_already_exists': 'Email already exists',
        'errors.user.self_deletion_forbidden': 'User cannot delete themselves',
        'errors.business_sector.not_found': 'Business sector not found',
        'errors.business_sector.code_already_exists':
          'Business sector code already exists',
        'errors.business_sector.cannot_delete_referenced':
          'Cannot delete business sector: it is referenced by businesses',
        'errors.business.not_found': 'Business not found',
        'errors.business.invalid_data': 'Invalid business data',
        'errors.auth.insufficient_permissions': 'Insufficient permissions',
        'errors.auth.role_elevation_forbidden': 'Role elevation forbidden',
        'errors.auth.invalid_credentials': 'Invalid email or password',
        'errors.validation.invalid_email': 'Invalid email format',
        'errors.validation.invalid_name': 'Invalid name',
        'errors.validation.failed': 'Validation failed for field {{field}}',

        // Operations messages
        'operations.user.creation_attempt': 'Attempting to create user',
        'operations.user.deletion_attempt':
          'Attempting to delete user {{userId}}',
        'operations.business_sector.creation_attempt':
          'Attempting to create business sector',
        'operations.business_sector.deletion_attempt':
          'Attempting to delete business sector {{sectorId}}',
        'operations.business.creation_attempt': 'Attempting to create business',
        'operations.business.update_attempt':
          'Attempting to update business {{businessId}}',

        // Success messages
        'success.user.creation_success': 'User {{email}} created successfully',
        'success.business_sector.creation_success':
          'Business sector {{code}} created successfully',
        'success.business.creation_success':
          'Business {{name}} created successfully',
        'success.auth.login_success': 'Login successful for {{email}}',

        // Infrastructure messages
        'infrastructure.database.connection_established':
          'Database connection established',
        'infrastructure.database.connection_failed':
          'Database connection failed',
        'infrastructure.repository.factory_initialized':
          'Repository factory initialized',
        'infrastructure.cache.set_success': 'Cache SET successful',
        'infrastructure.cache.connection_established':
          'Redis connection established',

        // Infrastructure error messages
        'errors.infrastructure.duplicate_resource': 'Resource already exists',
        'errors.infrastructure.invalid_reference':
          'Invalid reference to related resource',
        'errors.infrastructure.missing_required_field':
          'Required field is missing',
        'errors.infrastructure.service_unavailable':
          'Service temporarily unavailable',
        'errors.infrastructure.request_timeout': 'Request timeout',
        'errors.infrastructure.network_error': 'Network connection error',
        'errors.infrastructure.cache_service_error': 'Cache service error',
        'errors.infrastructure.internal_server_error': 'Internal server error',

        // Validation error messages additionnels
        'errors.validation.required': 'This field is required',
        'errors.validation.must_be_string': 'Must be a text value',
        'errors.validation.must_be_number': 'Must be a number',
        'errors.validation.must_be_boolean': 'Must be true or false',
        'errors.validation.must_be_uuid': 'Must be a valid UUID',
        'errors.validation.max_length': 'Text is too long',
        'errors.validation.min_length': 'Text is too short',
      };

      // Si pas de traductions françaises chargées, utiliser une base minimum
      if (!this.translations.fr) {
        this.translations.fr = {
          'errors.user.not_found': 'Utilisateur non trouvé',
          'errors.user.email_already_exists': 'Email déjà existant',
          'errors.business_sector.not_found': "Secteur d'activité non trouvé",
          'errors.business_sector.code_already_exists':
            "Code secteur d'activité déjà existant",
          'errors.business.not_found': 'Entreprise non trouvée',
          'errors.auth.insufficient_permissions': 'Permissions insuffisantes',
          'errors.auth.invalid_credentials': 'Email ou mot de passe invalide',
          'success.auth.login_success': 'Connexion réussie pour {{email}}',
          'infrastructure.database.connection_established':
            'Connexion base de données établie',
        };
      }
    } catch (error) {
      console.warn('Failed to load translation files, using defaults:', error);
    }
  }

  translate(
    key: string,
    params?: Record<string, unknown>,
    lang?: string,
  ): string {
    const currentLang = lang || this.defaultLanguage;
    const langTranslations =
      this.translations[currentLang] || this.translations.en || {};
    let translation =
      langTranslations[key] || this.translations.en?.[key] || key;

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
    this.defaultLanguage = lang;
  }

  exists(key: string, lang?: string): boolean {
    const currentLang = lang || this.defaultLanguage;
    const langTranslations =
      this.translations[currentLang] || this.translations.en || {};
    return key in langTranslations;
  }
}
