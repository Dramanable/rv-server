/**
 * @fileoverview Notification Repository Interface
 * @module Domain/Repositories
 * @version 1.0.0
 */

import { Notification } from '../entities/notification.entity';
import { NotificationChannel } from '../value-objects/notification-channel.value-object';
import { NotificationPriority } from '../value-objects/notification-priority.value-object';
import { NotificationStatus } from '../value-objects/notification-status.value-object';

/**
 * Critères de recherche pour les notifications
 */
export interface NotificationSearchCriteria {
  readonly recipientId?: string;
  readonly channels?: readonly NotificationChannel[];
  readonly statuses?: readonly NotificationStatus[];
  readonly priorities?: readonly NotificationPriority[];
  readonly eventTypes?: readonly string[];
  readonly businessId?: string;
  readonly appointmentId?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly scheduledAfter?: Date;
  readonly scheduledBefore?: Date;
  readonly isReadyToSend?: boolean;
  readonly isExpired?: boolean;
}

/**
 * Options de pagination pour les recherches
 */
export interface NotificationPaginationOptions {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Résult paginé de notifications
 */
export interface PaginatedNotifications {
  readonly notifications: readonly Notification[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/**
 * Statistiques des notifications
 */
export interface NotificationStatistics {
  readonly totalNotifications: number;
  readonly byStatus: Record<string, number>;
  readonly byChannel: Record<string, number>;
  readonly byPriority: Record<string, number>;
  readonly averageDeliveryTime?: number; // en minutes
  readonly deliveryRate: number; // pourcentage
}

/**
 * Interface du repository des notifications
 * Définit le contrat pour la persistance des notifications
 */
export interface INotificationRepository {
  /**
   * Sauvegarde une notification
   */
  save(notification: Notification): Promise<Notification>;

  /**
   * Récupère une notification par son ID
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Récupère toutes les notifications d'un destinataire
   */
  findByRecipientId(recipientId: string): Promise<readonly Notification[]>;

  /**
   * Recherche des notifications avec critères et pagination
   */
  findByCriteria(
    criteria: NotificationSearchCriteria,
    pagination?: NotificationPaginationOptions,
  ): Promise<PaginatedNotifications>;

  /**
   * Récupère les notifications prêtes à être envoyées
   */
  findReadyToSend(limit?: number): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications expirées
   */
  findExpired(limit?: number): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications qui nécessitent un retry
   */
  findForRetry(limit?: number): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications par canal
   */
  findByChannel(channel: NotificationChannel): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications par priorité
   */
  findByPriority(
    priority: NotificationPriority,
  ): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications liées à un rendez-vous
   */
  findByAppointmentId(appointmentId: string): Promise<readonly Notification[]>;

  /**
   * Récupère les notifications liées à une entreprise
   */
  findByBusinessId(businessId: string): Promise<readonly Notification[]>;

  /**
   * Marque plusieurs notifications comme lues
   */
  markMultipleAsRead(notificationIds: readonly string[]): Promise<void>;

  /**
   * Supprime les notifications expirées ou terminales anciennes
   */
  deleteOldNotifications(olderThanDays: number): Promise<number>;

  /**
   * Compte le nombre de notifications non lues pour un utilisateur
   */
  countUnreadByRecipient(recipientId: string): Promise<number>;

  /**
   * Récupère les statistiques des notifications
   */
  getStatistics(
    criteria?: NotificationSearchCriteria,
    dateRange?: { from: Date; to: Date },
  ): Promise<NotificationStatistics>;

  /**
   * Vérifie l'existence d'une notification
   */
  exists(id: string): Promise<boolean>;

  /**
   * Supprime une notification par son ID
   */
  delete(id: string): Promise<void>;

  /**
   * Supprime toutes les notifications d'un destinataire
   */
  deleteByRecipientId(recipientId: string): Promise<number>;
}
