/**
 * @fileoverview Mappers pour les notifications - Conversion entre couches
 * @module Presentation/Mappers/Notification
 * @version 1.0.0
 */

import { Notification } from "@domain/entities/notification.entity";
import { NotificationDto } from "../dtos/notification/notification-response.dto";
import {
  SendNotificationDto,
  SendBulkNotificationDto,
  ListNotificationsDto,
} from "../dtos/notification/notification.dto";
import {
  SendNotificationResponseDto,
  SendBulkNotificationResponseDto,
  ListNotificationsResponseDto,
  GetNotificationByIdResponseDto,
  MarkAsReadResponseDto,
  DeleteNotificationResponseDto,
  NotificationAnalyticsResponseDto,
} from "../dtos/notification/notification-response.dto";
import {
  SendNotificationRequest,
  SendBulkNotificationRequest,
  ListNotificationsRequest,
  SendNotificationResponse,
  SendBulkNotificationResponse,
  ListNotificationsResponse,
  GetNotificationByIdResponse,
  MarkNotificationAsReadResponse,
  DeleteNotificationResponse,
  GetNotificationAnalyticsResponse,
} from "@application/use-cases/notifications/types";

/**
 * Mapper pour convertir les DTOs de notification vers les objets métier
 */
export class NotificationMapper {
  /**
   * Convertit un DTO d'envoi de notification vers une requête use case
   */
  static toSendNotificationRequest(
    dto: SendNotificationDto,
    requestingUserId: string,
    correlationId: string,
  ): SendNotificationRequest {
    return {
      recipientId: dto.recipientId,
      title: dto.templateType || "Notification",
      content: dto.variables?.message || "Nouvelle notification",
      channel: dto.preferredChannel || "EMAIL",
      priority: dto.priority || "NORMAL",
      metadata: dto.metadata,
      scheduledFor: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      requestingUserId,
      correlationId,
      timestamp: new Date(),
    };
  }

  /**
   * Convertit un DTO d'envoi en masse vers une requête use case
   */
  static toSendBulkNotificationRequest(
    dto: SendBulkNotificationDto,
    requestingUserId: string,
    correlationId: string,
  ): SendBulkNotificationRequest {
    return {
      recipients:
        dto.recipientIds?.map((id) => ({
          recipientId: id,
          variables: dto.recipientVariables?.[id],
        })) || [],
      templateType: dto.templateType,
      defaultChannel: dto.preferredChannel || "EMAIL",
      priority: dto.priority || "NORMAL",
      commonVariables: dto.commonVariables,
      requestingUserId,
      correlationId,
      timestamp: new Date(),
    };
  }

  /**
   * Convertit un DTO de recherche vers une requête use case
   */
  static toListNotificationsRequest(
    dto: ListNotificationsDto,
    requestingUserId: string,
    correlationId: string,
  ): ListNotificationsRequest {
    return {
      recipientId: dto.recipientId,
      status: dto.status,
      channel: dto.channel,
      priority: dto.priority,
      dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
      dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      search: dto.search,
      page: dto.page || 1,
      limit: dto.limit || 10,
      sortBy: dto.sortBy || "createdAt",
      sortOrder: dto.sortOrder || "desc",
      requestingUserId,
      correlationId,
    };
  }

  /**
   * Convertit une entité Notification vers un DTO de réponse
   */
  static toNotificationDto(notification: any): NotificationDto {
    return {
      id: notification.id || notification.getId?.()?.getValue?.() || "",
      recipientId:
        notification.recipientId || notification.getRecipientId?.() || "",
      title: notification.title || notification.getTitle?.() || "",
      content: notification.content || notification.getContent?.() || "",
      channel:
        notification.channel || notification.getChannel?.()?.getValue?.() || "",
      priority:
        notification.priority ||
        notification.getPriority?.()?.getValue?.() ||
        "",
      status:
        notification.status || notification.getStatus?.()?.getValue?.() || "",
      sentAt:
        notification.sentAt || notification.getSentAt?.()?.toISOString?.(),
      deliveredAt:
        notification.deliveredAt ||
        notification.getDeliveredAt?.()?.toISOString?.(),
      readAt:
        notification.readAt || notification.getReadAt?.()?.toISOString?.(),
      failureReason:
        notification.failureReason || notification.getFailureReason?.(),
      retryCount:
        notification.retryCount || notification.getRetryCount?.() || 0,
      scheduledFor:
        notification.scheduledFor ||
        notification.getScheduledFor?.()?.toISOString?.(),
      metadata: notification.metadata || notification.getMetadata?.() || {},
      createdAt:
        notification.createdAt ||
        notification.getCreatedAt?.()?.toISOString?.() ||
        new Date().toISOString(),
      updatedAt:
        notification.updatedAt ||
        notification.getUpdatedAt?.()?.toISOString?.() ||
        new Date().toISOString(),
    };
  }

  /**
   * Convertit une liste d'entités Notification vers des DTOs
   */
  static toNotificationDtos(notifications: Notification[]): NotificationDto[] {
    return notifications.map((notification) =>
      this.toNotificationDto(notification),
    );
  }

  /**
   * Convertit une réponse use case d'envoi vers un DTO de réponse
   */
  static toSendNotificationResponseDto(
    response: SendNotificationResponse,
    message: string = "Notification envoyée avec succès",
  ): SendNotificationResponseDto {
    return {
      success: true,
      data: {
        id: response.notification?.id || "",
        status: response.status || "sent",
        sentAt: response.sentAt?.toISOString() || new Date().toISOString(),
      },
    };
  }

  /**
   * Convertit une réponse use case d'envoi en masse vers un DTO de réponse
   */
  static toSendBulkNotificationResponseDto(
    response: SendBulkNotificationResponse,
    message?: string,
  ): SendBulkNotificationResponseDto {
    const successRate =
      response.totalSent > 0
        ? Number(
            (
              (response.totalSent /
                (response.totalSent + response.totalFailed)) *
              100
            ).toFixed(2),
          )
        : 0;

    const defaultMessage = `Envoi en masse terminé avec ${successRate}% de succès`;

    return {
      success: true,
      data: {
        totalSent: response.totalSent,
        totalFailed: response.totalFailed,
        successRate,
        notificationIds:
          response.notifications?.map(
            (n: any) => n.id || n.getId?.()?.getValue?.() || "",
          ) || [],
        failedRecipients: response.failedRecipients,
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: "bulk-notification",
        processingTime: 0,
      },
    };
  }

  /**
   * Convertit une réponse use case de liste vers un DTO de réponse
   */
  static toListNotificationsResponseDto(
    response: ListNotificationsResponse,
  ): ListNotificationsResponseDto {
    return {
      success: true,
      data: this.toNotificationDtos(response.notifications),
      meta: {
        currentPage: response.meta.currentPage,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.totalItems,
        itemsPerPage: response.meta.itemsPerPage,
        hasNextPage: response.meta.hasNextPage,
        hasPrevPage: response.meta.hasPrevPage,
      },
    };
  }

  /**
   * Convertit une réponse use case de récupération par ID vers un DTO de réponse
   */
  static toGetNotificationByIdResponseDto(
    response: GetNotificationByIdResponse,
  ): GetNotificationByIdResponseDto {
    return {
      success: true,
      data: this.toNotificationDto(response.notification),
    };
  }

  /**
   * Convertit une réponse use case de marquage comme lu vers un DTO de réponse
   */
  static toMarkAsReadResponseDto(
    response: MarkNotificationAsReadResponse,
    message: string = "Notification marquée comme lue",
  ): MarkAsReadResponseDto {
    return {
      success: true,
      data: {
        id: response.notificationId || "",
        status: "read",
        readAt: response.readAt.toISOString(),
      },
    };
  }

  /**
   * Convertit une réponse use case de suppression vers un DTO de réponse
   */
  static toDeleteNotificationResponseDto(
    response: DeleteNotificationResponse,
    message: string = "Notification supprimée avec succès",
  ): DeleteNotificationResponseDto {
    return {
      success: true,
      data: {
        id: response.deletedId || "",
        deletedAt: response.deletedAt.toISOString(),
      },
    };
  }

  /**
   * Convertit une réponse use case d'analytics vers un DTO de réponse
   */
  static toNotificationAnalyticsResponseDto(
    response: GetNotificationAnalyticsResponse,
  ): NotificationAnalyticsResponseDto {
    return {
      success: true,
      data: {
        totalSent: response.totalSent,
        totalDelivered: response.totalDelivered,
        totalRead: response.totalRead,
        totalFailed: response.totalFailed,
        deliveryRate: response.deliveryRate,
        readRate: response.readRate,
        channelStats: response.channelStats,
        templateStats: response.templateStats,
      },
    };
  }

  /**
   * Crée un DTO de réponse d'erreur standardisé
   */
  static toErrorResponseDto(
    error: Error,
    path: string,
    correlationId: string = "unknown",
  ) {
    // Mapping des erreurs spécifiques aux codes d'erreur
    const getErrorCode = (error: Error): string => {
      const errorName = error.constructor.name;
      switch (errorName) {
        case "NotificationNotFoundError":
          return "NOTIFICATION_NOT_FOUND";
        case "InvalidNotificationDataError":
          return "NOTIFICATION_INVALID_DATA";
        case "NotificationPermissionDeniedError":
          return "NOTIFICATION_PERMISSION_DENIED";
        case "NotificationTemplateNotFoundError":
          return "NOTIFICATION_TEMPLATE_NOT_FOUND";
        case "NotificationTranslationError":
          return "NOTIFICATION_TRANSLATION_ERROR";
        case "NotificationRepositoryError":
          return "NOTIFICATION_REPOSITORY_ERROR";
        default:
          return "NOTIFICATION_UNKNOWN_ERROR";
      }
    };

    return {
      success: false,
      error: {
        code: getErrorCode(error),
        message: error.message,
        timestamp: new Date().toISOString(),
        path,
        correlationId,
      },
    };
  }

  /**
   * Crée un DTO de réponse de validation d'erreur
   */
  static toValidationErrorResponseDto(
    validationErrors: any[],
    path: string,
    correlationId: string = "unknown",
  ) {
    const firstError = validationErrors[0];
    const field = firstError?.property || "unknown";
    const constraints = firstError?.constraints || {};
    const message =
      (Object.values(constraints)[0] as string) || "Données invalides";

    return {
      success: false,
      error: {
        code: "NOTIFICATION_VALIDATION_ERROR",
        message,
        field,
        timestamp: new Date().toISOString(),
        path,
        correlationId,
      },
    };
  }
}
