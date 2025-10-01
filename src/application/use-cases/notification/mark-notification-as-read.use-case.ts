/**
 * @fileoverview Mark Notification As Read Use Case - Full TDD Implementation
 * @module Application/UseCases/Notification
 * @version 1.0.0
 */

import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { INotificationRepository } from "@domain/repositories/notification.repository.interface";
import { Notification } from "@domain/entities/notification.entity";
import { NotificationException } from "@application/exceptions/notification.exceptions";

/**
 * Requête pour marquer une notification comme lue
 */
export interface MarkNotificationAsReadRequest {
  readonly notificationId: string;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

/**
 * Réponse pour le marquage comme lue
 */
export interface MarkNotificationAsReadResponse {
  readonly notification: Notification;
  readonly markedAsReadAt: Date;
}

/**
 * Use case pour marquer une notification comme lue
 * Inclut la vérification des permissions et l'audit trail
 */
export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Exécute le cas d'usage
   */
  async execute(
    request: MarkNotificationAsReadRequest,
  ): Promise<MarkNotificationAsReadResponse> {
    // 🔍 Validation des entrées
    this.validateRequest(request);

    // 📊 Log de l'opération
    this.logger.info("Marking notification as read", {
      notificationId: request.notificationId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔍 Récupération de la notification
      const notification = await this.notificationRepository.findById(
        request.notificationId,
      );

      if (!notification) {
        throw new NotificationException(
          this.i18n.translate("errors.notifications.not_found"),
          "NOT_FOUND",
          "errors.notifications.not_found",
          { notificationId: request.notificationId },
        );
      }

      // 🔐 Vérification des permissions
      this.checkPermissions(notification, request.requestingUserId);

      // ✅ Vérification que la notification peut être marquée comme lue
      this.validateCanBeMarkedAsRead(notification);

      // 📝 Marquage comme lue
      const readNotification = notification.markAsRead();
      const markedAsReadAt = new Date();

      // 💾 Sauvegarde de la notification mise à jour
      const savedNotification =
        await this.notificationRepository.save(readNotification);

      // 📊 Log de succès
      this.logger.info("Notification marked as read successfully", {
        notificationId: request.notificationId,
        recipientId: notification.getRecipientId(),
        markedAsReadAt,
        correlationId: request.correlationId,
      });

      // 🔍 Log d'audit pour traçabilité
      this.logger.audit("MARK_NOTIFICATION_AS_READ", request.requestingUserId, {
        notificationId: request.notificationId,
        recipientId: notification.getRecipientId(),
        channel: notification.getChannel().getValue(),
        priority: notification.getPriority().getValue(),
        correlationId: request.correlationId,
      });

      return {
        notification: savedNotification,
        markedAsReadAt,
      };
    } catch (error) {
      // 🚨 Log d'erreur
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        "Failed to mark notification as read",
        error instanceof Error ? error : undefined,
        {
          notificationId: request.notificationId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        },
      );

      if (error instanceof NotificationException) {
        throw error;
      }

      throw new NotificationException(
        this.i18n.translate("errors.notifications.mark_as_read_failed"),
        "MARK_AS_READ_FAILED",
        "errors.notifications.mark_as_read_failed",
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Valide la requête
   */
  private validateRequest(request: MarkNotificationAsReadRequest): void {
    if (!request.notificationId || request.notificationId.trim().length === 0) {
      throw new NotificationException(
        this.i18n.translate("errors.notifications.id_required"),
        "VALIDATION_ERROR",
        "errors.notifications.id_required",
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new NotificationException(
        this.i18n.translate("errors.notifications.requesting_user_required"),
        "VALIDATION_ERROR",
        "errors.notifications.requesting_user_required",
      );
    }
  }

  /**
   * Vérifie que l'utilisateur peut marquer cette notification comme lue
   */
  private checkPermissions(
    notification: Notification,
    requestingUserId: string,
  ): void {
    // Règle métier : Un utilisateur ne peut marquer comme lue que ses propres notifications
    // OU être administrateur (à implémenter selon les besoins)
    if (notification.getRecipientId() !== requestingUserId) {
      // TODO: Vérifier si l'utilisateur est admin/staff qui peut gérer toutes les notifications
      throw new NotificationException(
        this.i18n.translate("errors.notifications.permission_denied"),
        "PERMISSION_DENIED",
        "errors.notifications.permission_denied",
        {
          notificationId: notification.getId(),
          requestingUserId,
          recipientId: notification.getRecipientId(),
        },
      );
    }
  }

  /**
   * Vérifie que la notification peut être marquée comme lue
   */
  private validateCanBeMarkedAsRead(notification: Notification): void {
    const status = notification.getStatus();

    // Règles métier pour le marquage comme lue
    if (status.isFailed()) {
      throw new NotificationException(
        this.i18n.translate("errors.notifications.cannot_mark_failed_as_read"),
        "INVALID_STATUS_TRANSITION",
        "errors.notifications.cannot_mark_failed_as_read",
        {
          notificationId: notification.getId(),
          currentStatus: status.getValue(),
        },
      );
    }

    if (status.isCancelled()) {
      throw new NotificationException(
        this.i18n.translate(
          "errors.notifications.cannot_mark_cancelled_as_read",
        ),
        "INVALID_STATUS_TRANSITION",
        "errors.notifications.cannot_mark_cancelled_as_read",
        {
          notificationId: notification.getId(),
          currentStatus: status.getValue(),
        },
      );
    }

    if (status.isRead()) {
      // C'est acceptable - idempotent, mais on peut logger un warning
      this.logger.warn("Notification already marked as read", {
        notificationId: notification.getId(),
        currentStatus: status.getValue(),
      });
    }

    // Vérifier si la notification a expiré
    if (notification.isExpired()) {
      throw new NotificationException(
        this.i18n.translate("errors.notifications.notification_expired"),
        "NOTIFICATION_EXPIRED",
        "errors.notifications.notification_expired",
        {
          notificationId: notification.getId(),
        },
      );
    }
  }
}
