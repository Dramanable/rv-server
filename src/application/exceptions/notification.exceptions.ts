/**
 * @fileoverview Notification Application Exceptions
 * @module Application/Exceptions
 * @version 1.0.0
 */

import { ApplicationException } from './application.exceptions';

/**
 * Exception de base pour les notifications
 */
export class NotificationException extends ApplicationException {
  constructor(
    message: string,
    code: string = 'NOTIFICATION_ERROR',
    i18nKey?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      code,
      i18nKey || 'errors.notifications.general_error',
      context,
    );
    this.name = 'NotificationException';
  }
}

/**
 * Exception quand un template n'est pas trouvé
 */
export class NotificationTemplateNotFoundError extends NotificationException {
  constructor(
    eventType: string,
    channel: string,
    language?: string,
    businessId?: string,
  ) {
    super(
      `No notification template found for event type ${eventType} and channel ${channel}`,
      'NOTIFICATION_TEMPLATE_NOT_FOUND',
      'errors.notifications.template_not_found',
      { eventType, channel, language, businessId },
    );
  }
}

/**
 * Exception quand l'utilisateur a désactivé ce type de notification
 */
export class UserOptedOutError extends NotificationException {
  constructor(recipientId: string, channel: string) {
    super(
      `User ${recipientId} has opted out from ${channel} notifications`,
      'USER_OPTED_OUT',
      'errors.notifications.user_opted_out',
      { recipientId, channel },
    );
  }
}

/**
 * Exception quand l'envoi de notification échoue
 */
export class NotificationSendError extends NotificationException {
  constructor(channel: string, reason: string, recipientId?: string) {
    super(
      `Failed to send notification via ${channel}: ${reason}`,
      'NOTIFICATION_SEND_ERROR',
      'errors.notifications.send_error',
      { channel, reason, recipientId },
    );
  }
}

/**
 * Exception quand le canal de notification n'est pas supporté
 */
export class UnsupportedChannelError extends NotificationException {
  constructor(channel: string) {
    super(
      `Notification channel ${channel} is not supported`,
      'UNSUPPORTED_CHANNEL',
      'errors.notifications.unsupported_channel',
      { channel },
    );
  }
}

/**
 * Exception quand la planification de notification échoue
 */
export class NotificationScheduleError extends NotificationException {
  constructor(scheduledFor: Date, reason: string) {
    super(
      `Failed to schedule notification for ${scheduledFor.toISOString()}: ${reason}`,
      'NOTIFICATION_SCHEDULE_ERROR',
      'errors.notifications.schedule_error',
      { scheduledFor: scheduledFor.toISOString(), reason },
    );
  }
}

/**
 * Exception quand le template est invalide
 */
export class InvalidTemplateError extends NotificationException {
  constructor(templateId: string, reason: string) {
    super(
      `Invalid notification template ${templateId}: ${reason}`,
      'INVALID_TEMPLATE',
      'errors.notifications.invalid_template',
      { templateId, reason },
    );
  }
}

/**
 * Exception quand les variables de template sont manquantes
 */
export class MissingTemplateVariablesError extends NotificationException {
  constructor(templateId: string, missingVariables: readonly string[]) {
    super(
      `Missing required template variables for template ${templateId}: ${missingVariables.join(', ')}`,
      'MISSING_TEMPLATE_VARIABLES',
      'errors.notifications.missing_template_variables',
      { templateId, missingVariables },
    );
  }
}

/**
 * Exception quand le destinataire n'est pas trouvé
 */
export class RecipientNotFoundError extends NotificationException {
  constructor(recipientId: string) {
    super(
      `Notification recipient not found: ${recipientId}`,
      'RECIPIENT_NOT_FOUND',
      'errors.notifications.recipient_not_found',
      { recipientId },
    );
  }
}

/**
 * Exception quand les préférences utilisateur ne peuvent pas être récupérées
 */
export class UserPreferencesError extends NotificationException {
  constructor(userId: string, reason: string) {
    super(
      `Failed to retrieve user preferences for ${userId}: ${reason}`,
      'USER_PREFERENCES_ERROR',
      'errors.notifications.user_preferences_error',
      { userId, reason },
    );
  }
}

/**
 * Exception quand la limite de retry est atteinte
 */
export class MaxRetryExceededError extends NotificationException {
  constructor(notificationId: string, retryCount: number) {
    super(
      `Maximum retry count exceeded for notification ${notificationId}: ${retryCount} attempts`,
      'MAX_RETRY_EXCEEDED',
      'errors.notifications.max_retry_exceeded',
      { notificationId, retryCount },
    );
  }
}

/**
 * Exception quand une notification est expirée
 */
export class NotificationExpiredError extends NotificationException {
  constructor(notificationId: string, expiresAt: Date) {
    super(
      `Notification ${notificationId} has expired at ${expiresAt.toISOString()}`,
      'NOTIFICATION_EXPIRED',
      'errors.notifications.notification_expired',
      { notificationId, expiresAt: expiresAt.toISOString() },
    );
  }
}

/**
 * Exception pour les erreurs de validation de notification
 */
export class NotificationValidationError extends NotificationException {
  constructor(field: string, value: any, reason: string) {
    super(
      `Notification validation failed for field ${field}: ${reason}`,
      'NOTIFICATION_VALIDATION_ERROR',
      'errors.notifications.validation_error',
      { field, value, reason },
    );
  }
}
