/**
 * 📬 NOTIFICATION PORT - Interface pour service de notification
 *
 * ✅ Port principal pour l'envoi de notifications dans l'architecture Clean
 * ✅ Abstraction pure sans dépendance aux implémentations techniques
 * ✅ Support notifications individuelles et en lot
 */

export interface INotificationService {
  /**
   * Envoie une notification individuelle
   */
  sendNotification(
    notification: NotificationMessage,
  ): Promise<NotificationResult>;

  /**
   * Envoie des notifications en lot
   */
  sendBulkNotifications(
    notifications: NotificationMessage[],
  ): Promise<BulkNotificationResult>;

  /**
   * Vérifie le statut d'une notification
   */
  getNotificationStatus(notificationId: string): Promise<NotificationStatus>;

  /**
   * Annule une notification programmée
   */
  cancelNotification(notificationId: string): Promise<void>;

  /**
   * Valide un template de notification
   */
  validateTemplate(
    template: NotificationTemplate,
  ): Promise<TemplateValidationResult>;
}

export interface NotificationMessage {
  readonly id?: string;
  readonly recipientId: string;
  readonly recipientEmail?: string;
  readonly recipientPhone?: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly subject?: string;
  readonly content: string;
  readonly templateId?: string;
  readonly templateData?: Record<string, any>;
  readonly priority: NotificationPriority;
  readonly scheduledAt?: Date;
  readonly expiresAt?: Date;
  readonly metadata?: Record<string, any>;
}

export interface NotificationResult {
  readonly success: boolean;
  readonly notificationId: string;
  readonly sentAt: Date;
  readonly channel: NotificationChannel;
  readonly error?: string;
  readonly deliveryId?: string;
}

export interface BulkNotificationResult {
  readonly totalSent: number;
  readonly totalFailed: number;
  readonly results: NotificationResult[];
  readonly batchId: string;
  readonly processedAt: Date;
}

export interface NotificationStatus {
  readonly notificationId: string;
  readonly status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  readonly sentAt?: Date;
  readonly deliveredAt?: Date;
  readonly error?: string;
  readonly attempts: number;
  readonly lastAttemptAt?: Date;
}

export interface NotificationTemplate {
  readonly id: string;
  readonly name: string;
  readonly type: NotificationType;
  readonly subject?: string;
  readonly content: string;
  readonly variables: string[];
  readonly isActive: boolean;
}

export interface TemplateValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly missingVariables: string[];
}

export enum NotificationType {
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLATION = 'APPOINTMENT_CANCELLATION',
  APPOINTMENT_RESCHEDULE = 'APPOINTMENT_RESCHEDULE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  WELCOME = 'WELCOME',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  MARKETING = 'MARKETING',
  CUSTOM = 'CUSTOM',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
