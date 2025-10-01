/**
 * 🌍 I18N VALIDATION PIPE - Pipe de validation avec i18n
 *
 * ValidationPipe personnalisé qui traduit les messages d'erreur
 */

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class I18nValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        // Traduire les messages d'erreur
        const translatedErrors = this.translateValidationErrors(errors);
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          details: translatedErrors,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      },
    });
  }

  /**
   * Traduire les erreurs de validation
   */
  private translateValidationErrors(
    errors: ValidationError[],
    parentPath = '',
  ): string[] {
    const translatedMessages: string[] = [];

    for (const error of errors) {
      const currentPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      // Traduire les contraintes directes
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          // Utiliser les messages traduits personnalisés
          const translatedMessage = this.getTranslatedMessage(
            error.property,
            message,
            error.value,
          );
          translatedMessages.push(`${currentPath}: ${translatedMessage}`);
        });
      }

      // Récursion pour les erreurs imbriquées
      if (error.children && error.children.length > 0) {
        const childErrors = this.translateValidationErrors(
          error.children,
          currentPath,
        );
        translatedMessages.push(...childErrors);
      }
    }

    return translatedMessages;
  }

  /**
   * Obtenir le message traduit basé sur le champ et l'erreur
   */
  private getTranslatedMessage(
    property: string,
    originalMessage: string,
    _value?: unknown,
  ): string {
    // Messages traduits pour chaque champ
    const translatedMessages: Record<string, Record<string, string>> = {
      email: {
        'must be an email': 'doit être une adresse email valide',
        'should not be empty': 'ne peut pas être vide',
        'Please provide a valid email address':
          'Veuillez fournir une adresse email valide',
        'Email is required': "L'email est requis",
      },
      password: {
        'must be a string': 'doit être une chaîne de caractères',
        'must be longer than or equal to 6 characters':
          'doit contenir au moins 6 caractères',
        'should not be empty': 'ne peut pas être vide',
        'Password must be a string': 'doit être une chaîne de caractères',
        'Password is required': 'est requis',
        'Password must be at least 6 characters long':
          'doit contenir au moins 6 caractères',
      },
      rememberMe: {
        'must be a boolean value': 'doit être un booléen',
        'Remember me must be a boolean': 'doit être un booléen',
      },
      logoutAll: {
        'must be a boolean value': 'doit être un booléen',
        'Logout all must be a boolean': 'doit être un booléen',
      },
      refreshToken: {
        'must be a string': 'doit être une chaîne de caractères',
        'Refresh token must be a string': 'doit être une chaîne de caractères',
      },
    };

    // Recherche du message traduit
    const fieldMessages = translatedMessages[property];
    if (fieldMessages && fieldMessages[originalMessage]) {
      return fieldMessages[originalMessage];
    }

    // Messages génériques traduits
    const genericTranslations: Record<string, string> = {
      'must be an email': 'doit être une adresse email valide',
      'should not be empty': 'ne peut pas être vide',
      'must be a string': 'doit être une chaîne de caractères',
      'must be a boolean value': 'doit être un booléen',
      'must be longer than or equal to': 'doit contenir au moins',
    };

    // Recherche générique avec remplacement partiel
    for (const [englishPattern, frenchMessage] of Object.entries(
      genericTranslations,
    )) {
      if (originalMessage.includes(englishPattern)) {
        if (englishPattern === 'must be longer than or equal to') {
          // Extraire le nombre minimum
          const match = originalMessage.match(/(\d+)/);
          const minLength = match ? match[1] : '';
          return `${frenchMessage} ${minLength} caractères`;
        }
        return frenchMessage;
      }
    }

    // Retourner le message original si aucune traduction trouvée
    return originalMessage;
  }

  async transform(value: unknown, metadata: ArgumentMetadata) {
    return await super.transform(value, metadata);
  }
}
