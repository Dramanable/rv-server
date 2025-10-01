/**
 * @fileoverview Types pour les use cases de notifications
 * @module Application/UseCases/Notifications
 * @version 1.0.0
 */

/**
 * Request pour l'envoi de notification simple
 */
export interface SendNotificationRequest {
  readonly recipientId: string;
  readonly title: string;
  readonly content: string;
  readonly channel: string;
  readonly priority: string;
  readonly metadata?: Record<string, any>;
  readonly scheduledFor?: Date;
  readonly expiresAt?: Date;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

/**
 * Response pour l'envoi de notification simple
 */
export interface SendNotificationResponse {
  readonly notification: any; // L'entité Notification du domain
  readonly status: string;
  readonly sentAt?: Date;
  readonly scheduledFor?: Date;
}

/**
 * Request pour l'envoi en masse de notifications
 */
export interface SendBulkNotificationRequest {
  readonly templateType: string;
  readonly defaultChannel: string;
  readonly priority: string;
  readonly commonVariables?: Record<string, any>;
  readonly recipients: Array<{
    readonly recipientId: string;
    readonly variables?: Record<string, any>;
    readonly channel?: string;
    readonly priority?: string;
  }>;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

/**
 * Response pour l'envoi en masse de notifications
 */
export interface SendBulkNotificationResponse {
  readonly totalSent: number;
  readonly totalFailed: number;
  readonly successRate: number;
  readonly notifications: any[];
  readonly failedRecipients: string[];
}

/**
 * Request pour la liste des notifications
 */
export interface ListNotificationsRequest {
  readonly recipientId?: string;
  readonly status?: string;
  readonly channel?: string;
  readonly priority?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly search?: string;
  readonly page: number;
  readonly limit: number;
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response pour la liste des notifications
 */
export interface ListNotificationsResponse {
  readonly notifications: any[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * Request pour récupérer une notification par ID
 */
export interface GetNotificationByIdRequest {
  readonly notificationId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response pour récupérer une notification par ID
 */
export interface GetNotificationByIdResponse {
  readonly notification: any;
}

/**
 * Request pour marquer comme lue
 */
export interface MarkAsReadRequest {
  readonly notificationId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response pour marquer comme lue
 */
export interface MarkAsReadResponse {
  readonly notification: any;
  readonly readAt: Date;
}

/**
 * Response pour marquer comme lue (alias)
 */
export interface MarkNotificationAsReadResponse {
  readonly notificationId: string;
  readonly readAt: Date;
}

/**
 * Request pour supprimer une notification
 */
export interface DeleteNotificationRequest {
  readonly notificationId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response pour supprimer une notification
 */
export interface DeleteNotificationResponse {
  readonly deletedId: string;
  readonly deletedAt: Date;
}

/**
 * Request pour les analytics
 */
export interface GetNotificationAnalyticsRequest {
  readonly businessId?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response pour les analytics
 */
export interface GetNotificationAnalyticsResponse {
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalRead: number;
  readonly totalFailed: number;
  readonly deliveryRate: number;
  readonly readRate: number;
  readonly channelStats: Record<string, any>;
  readonly templateStats: Record<string, any>;
  readonly timeSeriesData: Array<{
    readonly date: string;
    readonly sent: number;
    readonly delivered: number;
    readonly read: number;
  }>;
}
