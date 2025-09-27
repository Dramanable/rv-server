/**
 * @fileoverview Send Notification Use Case - Complete TDD Implementation
 * @module Application/UseCases
 * @version 1.0.0
 */

import { Notification } from "../../../domain/entities/notification.entity";
import { NotificationChannel } from "../../../domain/value-objects/notification-channel.value-object";
import { NotificationPriority } from "../../../domain/value-objects/notification-priority.value-object";
import { NotificationStatus } from "../../../domain/value-objects/notification-status.value-object";
import { NotificationException } from "../../exceptions/notification.exceptions";

/**
 * Requête pour envoyer une notification
 */
export interface SendNotificationRequest {
  readonly recipientId: string;
  readonly title: string;
  readonly content: string;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly requestingUserId: string;
  readonly scheduledFor?: Date;
  readonly metadata?: Record<string, any>;
}

/**
 * Réponse pour l'envoi de notification
 */
export interface SendNotificationResponse {
  readonly notificationId: string;
  readonly status: "sent" | "scheduled" | "queued" | "failed";
  readonly messageId?: string;
  readonly scheduledFor?: Date;
  readonly scheduledId?: string;
  readonly deliveryTime?: Date;
}

/**
 * Repository interface for notifications
 */
export interface INotificationRepository {
  save(
    notification: Notification,
  ): Promise<{ id: string; status: NotificationStatus }>;
  findById(id: string): Promise<Notification | null>;
  findByRecipientId(recipientId: string): Promise<Notification[]>;
  updateStatus(id: string, status: NotificationStatus): Promise<void>;
}

/**
 * Service interface for notification delivery
 */
export interface INotificationService {
  send(
    notification: Notification,
  ): Promise<{ success: boolean; messageId: string; deliveryTime?: Date }>;
  scheduleDelivery(
    notification: Notification,
    scheduledFor: Date,
  ): Promise<{ success: boolean; scheduledId: string }>;
  validateDeliveryWindow(
    priority: NotificationPriority,
    scheduledFor: Date,
  ): Promise<{ valid: boolean; reason?: string }>;
}

/**
 * Logger interface
 */
export interface ILogger {
  info(message: string, context?: any): void;
  error(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}

/**
 * I18n service interface
 */
export interface II18nService {
  t(key: string, options?: any): string;
}

/**
 * Use case pour envoyer une notification - Full TDD Implementation
 */
export class SendNotificationUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationService: INotificationService,
    private readonly logger: ILogger,
    private readonly i18n: II18nService,
  ) {}

  async execute(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResponse> {
    // 🔍 Input validation
    this.validateRequest(request);

    // 📊 Log notification attempt
    this.logger.info("Attempting to send notification", {
      recipientId: request.recipientId,
      channel: request.channel,
      priority: request.priority,
    });

    try {
      // 🏗️ Create notification entity
      const notification = this.createNotificationEntity(request);

      // 💾 Save notification to repository
      const savedNotification = await this.saveNotification(notification);

      // 📅 Handle scheduling vs immediate delivery
      if (request.scheduledFor) {
        return await this.handleScheduledDelivery(
          notification,
          request.scheduledFor,
          savedNotification.id,
        );
      } else {
        return await this.handleImmediateDelivery(
          notification,
          savedNotification.id,
        );
      }
    } catch (error) {
      this.logger.error("Failed to send notification", {
        error: error instanceof Error ? error.message : "Unknown error",
        recipientId: request.recipientId,
      });

      if (error instanceof NotificationException) {
        throw error;
      }

      throw new NotificationException(
        "Failed to send notification",
        "SEND_FAILED",
        "errors.notifications.send_failed",
        {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  }

  private validateRequest(request: SendNotificationRequest): void {
    if (!request.recipientId?.trim()) {
      throw new NotificationException(
        "Recipient ID is required",
        "VALIDATION_ERROR",
        "errors.notifications.recipient_required",
      );
    }

    if (!request.title?.trim()) {
      throw new NotificationException(
        "Notification title is required",
        "VALIDATION_ERROR",
        "errors.notifications.title_required",
      );
    }

    if (!request.content?.trim()) {
      throw new NotificationException(
        "Notification content is required",
        "VALIDATION_ERROR",
        "errors.notifications.content_required",
      );
    }

    if (!request.requestingUserId?.trim()) {
      throw new NotificationException(
        "Requesting user ID is required",
        "VALIDATION_ERROR",
        "errors.notifications.requesting_user_required",
      );
    }

    // Channel-specific content length validation
    const contentLimit = request.channel.getMaxContentLength();
    if (
      contentLimit > 0 &&
      contentLimit < Number.MAX_SAFE_INTEGER &&
      request.content.length > contentLimit
    ) {
      throw new NotificationException(
        `Content exceeds maximum length for ${request.channel.toString()}`,
        "VALIDATION_ERROR",
        "errors.notifications.content_too_long",
        { maxLength: contentLimit, actualLength: request.content.length },
      );
    }

    // Scheduled date validation
    if (request.scheduledFor) {
      if (request.scheduledFor <= new Date()) {
        throw new NotificationException(
          "Scheduled date cannot be in the past",
          "VALIDATION_ERROR",
          "errors.notifications.invalid_schedule_date",
        );
      }
    }
  }

  private createNotificationEntity(
    request: SendNotificationRequest,
  ): Notification {
    return Notification.create({
      recipientId: request.recipientId,
      title: request.title,
      content: request.content,
      channel: request.channel,
      priority: request.priority,
      status: NotificationStatus.pending(),
      metadata: request.metadata,
    });
  }

  private async saveNotification(
    notification: Notification,
  ): Promise<{ id: string; status: NotificationStatus }> {
    try {
      return await this.notificationRepository.save(notification);
    } catch (error) {
      this.logger.error("Failed to save notification to repository", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new NotificationException(
        "Failed to save notification",
        "REPOSITORY_ERROR",
        "errors.notifications.save_failed",
        {
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        },
      );
    }
  }

  private async handleScheduledDelivery(
    notification: Notification,
    scheduledFor: Date,
    notificationId: string,
  ): Promise<SendNotificationResponse> {
    // Validate scheduling window based on priority
    const validationResult =
      await this.notificationService.validateDeliveryWindow(
        notification.getPriority(),
        scheduledFor,
      );

    if (!validationResult.valid) {
      throw new NotificationException(
        "Invalid scheduling window",
        "VALIDATION_ERROR",
        "errors.notifications.invalid_scheduling_window",
        { reason: validationResult.reason },
      );
    }

    const scheduleResult = await this.notificationService.scheduleDelivery(
      notification,
      scheduledFor,
    );

    this.logger.info("Notification scheduled for future delivery", {
      notificationId,
      scheduledFor,
    });

    return {
      notificationId,
      status: "scheduled",
      scheduledFor,
      scheduledId: scheduleResult.scheduledId,
    };
  }

  private async handleImmediateDelivery(
    notification: Notification,
    notificationId: string,
  ): Promise<SendNotificationResponse> {
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        const sendResult = await this.notificationService.send(notification);

        this.logger.info("Notification sent successfully", {
          notificationId,
          messageId: sendResult.messageId,
        });

        return {
          notificationId,
          status: "sent",
          messageId: sendResult.messageId,
          deliveryTime: sendResult.deliveryTime,
        };
      } catch (error) {
        retryCount++;

        if (retryCount > maxRetries) {
          throw new NotificationException(
            "Failed to send notification",
            "DELIVERY_ERROR",
            "errors.notifications.delivery_failed",
            {
              originalError:
                error instanceof Error ? error.message : "Unknown error",
              retryCount: maxRetries,
            },
          );
        }

        // Wait before retry (exponential backoff)
        // For testing: skip delays completely when NODE_ENV is test
        if (process.env.NODE_ENV !== "test") {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000),
          );
        }
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new NotificationException(
      "Unexpected error in delivery handling",
      "UNEXPECTED_ERROR",
      "errors.notifications.unexpected_error",
    );
  }
}
