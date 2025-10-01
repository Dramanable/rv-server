/**
 * @fileoverview Notification Translation Service
 * @module Application/Services/Notification
 * @version 1.0.0
 */

import { I18nService } from '@application/ports/i18n.port';
import { NotificationTemplateType } from '@domain/value-objects/notification-template.value-object';

/**
 * Interface pour les données de traduction d'une notification
 */
export interface NotificationTranslationData {
  readonly templateType?: NotificationTemplateType;
  readonly variables?: Record<string, any>;
  readonly appointmentId?: string;
  readonly businessId?: string;
  readonly clientName?: string;
  readonly businessName?: string;
  readonly appointmentDate?: string;
  readonly appointmentTime?: string;
  readonly serviceName?: string;
  readonly businessAddress?: string;
  readonly businessPhone?: string;
}

/**
 * Interface pour une notification traduite
 */
export interface TranslatedNotification {
  readonly title: string;
  readonly content: string;
  readonly language: string;
}

/**
 * Service de traduction pour les notifications
 * Gère la traduction du titre et contenu des notifications selon la langue
 */
export class NotificationTranslationService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * Traduit le titre et le contenu d'une notification
   */
  translateNotification(
    originalTitle: string,
    originalContent: string,
    language: string = 'fr',
    data?: NotificationTranslationData,
  ): TranslatedNotification {
    // Si c'est un template prédéfini, utiliser les traductions dédiées
    if (data?.templateType) {
      return this.translateTemplate(data.templateType, language, data);
    }

    // Sinon, traduction générique avec variables
    const translatedTitle = this.translateWithVariables(
      originalTitle,
      language,
      data?.variables,
    );
    const translatedContent = this.translateWithVariables(
      originalContent,
      language,
      data?.variables,
    );

    return {
      title: translatedTitle,
      content: translatedContent,
      language,
    };
  }

  /**
   * Traduit un template de notification prédéfini
   */
  private translateTemplate(
    templateType: NotificationTemplateType,
    language: string,
    data: NotificationTranslationData,
  ): TranslatedNotification {
    const templateKey = this.getTemplateKey(templateType);

    const title = this.i18n.translate(
      `notifications.templates.${templateKey}.title`,
      data.variables,
      language,
    );

    const content = this.i18n.translate(
      `notifications.templates.${templateKey}.content`,
      data.variables,
      language,
    );

    return {
      title,
      content,
      language,
    };
  }

  /**
   * Traduit une chaîne avec variables
   */
  private translateWithVariables(
    text: string,
    language: string,
    variables?: Record<string, any>,
  ): string {
    // Si le texte commence par une clé de traduction (ex: "notifications.welcome.title")
    if (text.includes('.') && !text.includes(' ')) {
      return this.i18n.translate(text, variables, language);
    }

    // Sinon, remplacer les variables dans le texte brut
    if (!variables) {
      return text;
    }

    let translatedText = text;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      translatedText = translatedText.replace(
        new RegExp(placeholder, 'g'),
        String(value),
      );
    });

    return translatedText;
  }

  /**
   * Obtient la clé de template pour l'i18n
   */
  private getTemplateKey(templateType: NotificationTemplateType): string {
    const templateMap: Record<NotificationTemplateType, string> = {
      [NotificationTemplateType.APPOINTMENT_CONFIRMATION]:
        'appointment_confirmation',
      [NotificationTemplateType.APPOINTMENT_REMINDER]: 'appointment_reminder',
      [NotificationTemplateType.APPOINTMENT_CANCELLATION]:
        'appointment_cancellation',
      [NotificationTemplateType.APPOINTMENT_RESCHEDULED]:
        'appointment_rescheduled',
      [NotificationTemplateType.WELCOME_MESSAGE]: 'welcome_message',
      [NotificationTemplateType.PASSWORD_RESET]: 'password_reset',
      [NotificationTemplateType.ACCOUNT_VERIFICATION]: 'account_verification',
      [NotificationTemplateType.PAYMENT_CONFIRMATION]: 'payment_confirmation',
      [NotificationTemplateType.CUSTOM]: 'custom',
    };

    return templateMap[templateType] || 'custom';
  }

  /**
   * Obtient les langues supportées
   */
  getSupportedLanguages(): readonly string[] {
    return ['fr', 'en'] as const;
  }

  /**
   * Vérifie si une langue est supportée
   */
  isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language);
  }

  /**
   * Obtient la langue par défaut
   */
  getDefaultLanguage(): string {
    return 'fr';
  }

  /**
   * Détermine la langue d'un utilisateur (logique métier)
   */
  getUserLanguage(userId: string, defaultLang?: string): string {
    // TODO: Implémenter la récupération de la langue utilisateur depuis DB/préférences
    // Pour l'instant, retourner la langue par défaut
    return defaultLang || this.getDefaultLanguage();
  }
}
