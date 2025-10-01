/**
 * @fileoverview Get Notification By ID Use Case - Full TDD Implementation
 * @module Application/UseCases/Notification
 * @version 1.0.0
 */

import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { INotificationRepository } from "@domain/repositories/notification.repository.interface";
import { Notification } from "@domain/entities/notification.entity";
import { NotificationException } from "@application/exceptions/notification.exceptions";
import {
  NotificationTranslationService,
  TranslatedNotification,
} from "@application/services/notification-translation.service";

/**
 * Requête pour récupérer une notification par ID
 */
export interface GetNotificationByIdRequest {
  readonly notificationId: string;
  readonly requestingUserId: string;
  readonly language?: string;
  readonly correlationId?: string;
}

/**
 * Réponse avec notification traduite
 */
export interface GetNotificationByIdResponse {
  readonly notification: Notification;
  readonly translatedContent?: TranslatedNotification;
}

/**
 * Use case pour récupérer une notification par son ID
 * Inclut la traduction automatique du contenu selon la langue demandée
 */
export class GetNotificationByIdUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly translationService: NotificationTranslationService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Exécute le cas d'usage
   */
  async execute(
    request: GetNotificationByIdRequest,
  ): Promise<GetNotificationByIdResponse> {
    // 🔍 Validation des entrées
    this.validateRequest(request);

    // 📊 Log de l'opération
    this.logger.info("Getting notification by ID", {
      notificationId: request.notificationId,
      requestingUserId: request.requestingUserId,
      language: request.language,
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

      // 🔐 Vérification des permissions (l'utilisateur peut-il voir cette notification ?)
      this.checkPermissions(notification, request.requestingUserId);

      // 🌍 Traduction du contenu si langue spécifiée
      let translatedContent: TranslatedNotification | undefined;
      if (request.language && request.language !== "fr") {
        const metadata = notification.getMetadata();
        translatedContent = this.translationService.translateNotification(
          notification.getTitle(),
          notification.getContent(),
          request.language,
          {
            variables: metadata,
            appointmentId: metadata.appointmentId,
            businessId: metadata.businessId,
          },
        );
      }

      // 📊 Log de succès
      this.logger.info("Notification retrieved successfully", {
        notificationId: request.notificationId,
        recipientId: notification.getRecipientId(),
        language: request.language,
        wasTranslated: !!translatedContent,
        correlationId: request.correlationId,
      });

      return {
        notification,
        translatedContent,
      };
    } catch (error) {
      // 🚨 Log d'erreur
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        "Failed to get notification by ID",
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
        this.i18n.translate("errors.notifications.get_failed"),
        "GET_FAILED",
        "errors.notifications.get_failed",
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Valide la requête
   */
  private validateRequest(request: GetNotificationByIdRequest): void {
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

    // Validation de la langue si fournie
    if (
      request.language &&
      !this.translationService.isLanguageSupported(request.language)
    ) {
      throw new NotificationException(
        this.i18n.translate("notifications.errors.unsupported_language", {
          language: request.language,
        }),
        "VALIDATION_ERROR",
        "notifications.errors.unsupported_language",
        { language: request.language },
      );
    }
  }

  /**
   * Vérifie que l'utilisateur peut accéder à cette notification
   */
  private checkPermissions(
    notification: Notification,
    requestingUserId: string,
  ): void {
    // Règle métier : Un utilisateur ne peut voir que ses propres notifications
    // OU être administrateur (à implémenter selon les besoins)
    if (notification.getRecipientId() !== requestingUserId) {
      // TODO: Vérifier si l'utilisateur est admin/staff qui peut voir toutes les notifications
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
}
