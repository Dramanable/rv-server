/**
 * @fileoverview Notification Service Ports
 * @module Application/Ports
 * @version 1.0.0
 */

import { NotificationChannel } from "../../domain/value-objects/notification-channel.value-object";
import { NotificationPriority } from "../../domain/value-objects/notification-priority.value-object";

/**
 * Données pour l'envoi d'une notification
 */
export interface SendNotificationData {
  readonly recipientId: string;
  readonly channel: NotificationChannel;
  readonly title: string;
  readonly content: string;
  readonly subject?: string; // Pour EMAIL
  readonly htmlContent?: string; // Pour EMAIL
  readonly priority: NotificationPriority;
  readonly metadata?: Record<string, any>;
}

/**
 * Résultat de l'envoi d'une notification
 */
export interface NotificationSendResult {
  readonly success: boolean;
  readonly messageId?: string; // ID du message chez le provider
  readonly deliveredAt?: Date;
  readonly failureReason?: string;
  readonly retryAfter?: number; // Secondes avant retry si applicable
}

/**
 * Configuration du destinataire
 */
export interface NotificationRecipient {
  readonly id: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly pushToken?: string;
  readonly language?: string;
  readonly timezone?: string;
  readonly preferences?: NotificationPreferences;
}

/**
 * Préférences de notification d'un utilisateur
 */
export interface NotificationPreferences {
  readonly channels: {
    readonly email: boolean;
    readonly sms: boolean;
    readonly push: boolean;
    readonly inApp: boolean;
  };
  readonly categories: {
    readonly appointments: boolean;
    readonly reminders: boolean;
    readonly marketing: boolean;
    readonly system: boolean;
  };
  readonly quietHours?: {
    readonly start: string; // HH:MM format
    readonly end: string; // HH:MM format
    readonly timezone: string;
  };
}

/**
 * Port pour le service d'envoi d'emails
 */
export interface IEmailNotificationPort {
  /**
   * Envoie un email
   */
  sendEmail(
    recipient: NotificationRecipient,
    subject: string,
    content: string,
    htmlContent?: string,
    priority?: NotificationPriority,
  ): Promise<NotificationSendResult>;

  /**
   * Envoie un email avec template
   */
  sendEmailWithTemplate(
    recipient: NotificationRecipient,
    templateId: string,
    variables: Record<string, any>,
    priority?: NotificationPriority,
  ): Promise<NotificationSendResult>;

  /**
   * Valide une adresse email
   */
  validateEmailAddress(email: string): Promise<boolean>;

  /**
   * Vérifie la délivrabilité d'un email
   */
  checkDeliverability(email: string): Promise<boolean>;
}

/**
 * Port pour le service d'envoi de SMS
 */
export interface ISmsNotificationPort {
  /**
   * Envoie un SMS
   */
  sendSms(
    recipient: NotificationRecipient,
    content: string,
    priority?: NotificationPriority,
  ): Promise<NotificationSendResult>;

  /**
   * Valide un numéro de téléphone
   */
  validatePhoneNumber(phoneNumber: string): Promise<boolean>;

  /**
   * Estime le coût d'un SMS
   */
  estimateCost(phoneNumber: string, content: string): Promise<number>;
}

/**
 * Port pour le service de notifications push
 */
export interface IPushNotificationPort {
  /**
   * Envoie une notification push
   */
  sendPush(
    recipient: NotificationRecipient,
    title: string,
    content: string,
    data?: Record<string, any>,
    priority?: NotificationPriority,
  ): Promise<NotificationSendResult>;

  /**
   * Envoie une notification push à plusieurs destinataires
   */
  sendMulticast(
    recipients: readonly NotificationRecipient[],
    title: string,
    content: string,
    data?: Record<string, any>,
    priority?: NotificationPriority,
  ): Promise<readonly NotificationSendResult[]>;

  /**
   * Valide un token push
   */
  validatePushToken(token: string): Promise<boolean>;
}

/**
 * Port pour le service de notifications in-app
 */
export interface IInAppNotificationPort {
  /**
   * Envoie une notification in-app
   */
  sendInApp(
    recipient: NotificationRecipient,
    title: string,
    content: string,
    data?: Record<string, any>,
    priority?: NotificationPriority,
  ): Promise<NotificationSendResult>;

  /**
   * Marque une notification comme lue
   */
  markAsRead(recipientId: string, notificationId: string): Promise<void>;

  /**
   * Récupère les notifications non lues d'un utilisateur
   */
  getUnreadCount(recipientId: string): Promise<number>;
}

/**
 * Port pour la gestion des préférences utilisateur
 */
export interface INotificationPreferencesPort {
  /**
   * Récupère les préférences d'un utilisateur
   */
  getPreferences(userId: string): Promise<NotificationPreferences | null>;

  /**
   * Met à jour les préférences d'un utilisateur
   */
  updatePreferences(
    userId: string,
    preferences: NotificationPreferences,
  ): Promise<void>;

  /**
   * Vérifie si un utilisateur accepte un type de notification
   */
  canReceive(
    userId: string,
    channel: NotificationChannel,
    category: string,
  ): Promise<boolean>;

  /**
   * Vérifie si c'est une heure silencieuse pour l'utilisateur
   */
  isQuietHour(userId: string): Promise<boolean>;
}

/**
 * Port pour la planification et la queue des notifications
 */
export interface INotificationQueuePort {
  /**
   * Ajoute une notification à la queue
   */
  enqueue(
    notification: SendNotificationData,
    delay?: number, // Secondes de délai
  ): Promise<string>; // Job ID

  /**
   * Planifie une notification pour plus tard
   */
  schedule(
    notification: SendNotificationData,
    scheduledFor: Date,
  ): Promise<string>; // Job ID

  /**
   * Annule une notification planifiée
   */
  cancel(jobId: string): Promise<boolean>;

  /**
   * Récupère le statut d'un job
   */
  getJobStatus(jobId: string): Promise<{
    id: string;
    status: "waiting" | "active" | "completed" | "failed" | "cancelled";
    progress?: number;
    result?: any;
    error?: string;
  } | null>;

  /**
   * Récupère les métriques de la queue
   */
  getQueueMetrics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }>;
}

/**
 * Port pour l'analyse et les métriques des notifications
 */
export interface INotificationAnalyticsPort {
  /**
   * Enregistre un événement de notification
   */
  trackEvent(
    notificationId: string,
    event: "sent" | "delivered" | "opened" | "clicked" | "failed",
    metadata?: Record<string, any>,
  ): Promise<void>;

  /**
   * Récupère les métriques de délivrabilité
   */
  getDeliveryMetrics(
    dateRange: { from: Date; to: Date },
    filters?: {
      channel?: NotificationChannel;
      businessId?: string;
      recipientId?: string;
    },
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  }>;

  /**
   * Récupère les métriques par canal
   */
  getChannelMetrics(dateRange: { from: Date; to: Date }): Promise<
    Record<
      string,
      {
        total: number;
        delivered: number;
        failed: number;
        averageDeliveryTime: number;
      }
    >
  >;
}
