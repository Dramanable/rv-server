/**
 * @fileoverview Tests for Notification Domain Entity
 * @module Tests/Unit/Domain/Entities
 * @version 1.0.0
 */

import {
  CreateNotificationData,
  Notification,
  ReconstructNotificationData,
} from "@domain/entities/notification.entity";
import { DomainError } from "@domain/exceptions/domain.exceptions";
import { NotificationChannel } from "@domain/value-objects/notification-channel.value-object";
import { NotificationPriority } from "@domain/value-objects/notification-priority.value-object";
import { NotificationStatus } from "@domain/value-objects/notification-status.value-object";

describe("Notification Entity", () => {
  // Test Data Builders
  const createValidNotificationData = (): CreateNotificationData => ({
    recipientId: "user-123",
    title: "Appointment Reminder",
    content: "Your appointment is scheduled for tomorrow at 2 PM",
    channel: NotificationChannel.email(),
  });

  const createValidReconstructData = (): ReconstructNotificationData => ({
    id: "notification-123",
    recipientId: "user-123",
    title: "Appointment Reminder",
    content: "Your appointment is scheduled for tomorrow at 2 PM",
    channel: NotificationChannel.email(),
    priority: NotificationPriority.medium(),
    status: NotificationStatus.pending(),
    retryCount: 0,
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date("2023-01-01T10:00:00Z"),
  });

  describe("🎯 RED Phase - Entity Creation", () => {
    describe("create factory method", () => {
      it("should create notification with required fields", () => {
        const data = createValidNotificationData();

        const notification = Notification.create(data);

        expect(notification.getRecipientId()).toBe(data.recipientId);
        expect(notification.getTitle()).toBe(data.title);
        expect(notification.getContent()).toBe(data.content);
        expect(notification.getChannel().equals(data.channel)).toBe(true);
        expect(notification.getPriority().isMedium()).toBe(true); // Default priority
        expect(notification.getStatus().isPending()).toBe(true); // Default status
        expect(notification.getId()).toBeDefined();
        expect(notification.getCreatedAt()).toBeInstanceOf(Date);
        expect(notification.getUpdatedAt()).toBeInstanceOf(Date);
      });

      it("should create notification with custom priority", () => {
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          priority: NotificationPriority.urgent(),
        };

        const notification = Notification.create(data);

        expect(notification.getPriority().isUrgent()).toBe(true);
      });

      it("should create notification with metadata", () => {
        const metadata = {
          appointmentId: "apt-123",
          businessId: "biz-456",
          templateId: "tpl-789",
        };
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          metadata,
        };

        const notification = Notification.create(data);

        expect(notification.getMetadata()).toEqual(metadata);
      });

      it("should create notification with scheduled date", () => {
        const scheduledFor = new Date("2023-12-25T10:00:00Z");
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          scheduledFor,
        };

        const notification = Notification.create(data);

        expect(notification.getScheduledFor()).toEqual(scheduledFor);
      });

      it("should generate unique IDs for different notifications", () => {
        const data = createValidNotificationData();

        const notification1 = Notification.create(data);
        const notification2 = Notification.create(data);

        expect(notification1.getId()).not.toBe(notification2.getId());
      });
    });

    describe("reconstruct factory method", () => {
      it("should reconstruct notification from persistence data", () => {
        const data = createValidReconstructData();

        const notification = Notification.reconstruct(data);

        expect(notification.getId()).toBe(data.id);
        expect(notification.getRecipientId()).toBe(data.recipientId);
        expect(notification.getTitle()).toBe(data.title);
        expect(notification.getContent()).toBe(data.content);
        expect(notification.getChannel().equals(data.channel)).toBe(true);
        expect(notification.getPriority().equals(data.priority!)).toBe(true);
        expect(notification.getStatus().equals(data.status)).toBe(true);
        expect(notification.getRetryCount()).toBe(data.retryCount);
        expect(notification.getCreatedAt()).toEqual(data.createdAt);
        expect(notification.getUpdatedAt()).toEqual(data.updatedAt);
      });

      it("should reconstruct notification with all optional fields", () => {
        const data: ReconstructNotificationData = {
          ...createValidReconstructData(),
          sentAt: new Date("2023-01-01T11:00:00Z"),
          deliveredAt: new Date("2023-01-01T11:05:00Z"),
          readAt: new Date("2023-01-01T11:10:00Z"),
          failureReason: "Network timeout",
          metadata: {
            appointmentId: "apt-123",
            retryCount: 2,
          },
        };

        const notification = Notification.reconstruct(data);

        expect(notification.getSentAt()).toEqual(data.sentAt);
        expect(notification.getDeliveredAt()).toEqual(data.deliveredAt);
        expect(notification.getReadAt()).toEqual(data.readAt);
        expect(notification.getFailureReason()).toBe(data.failureReason);
        expect(notification.getMetadata()).toEqual(data.metadata);
      });
    });
  });

  describe("🚨 RED Phase - Validation Rules", () => {
    it("should throw error for empty recipient ID", () => {
      const data: CreateNotificationData = {
        ...createValidNotificationData(),
        recipientId: "",
      };

      expect(() => Notification.create(data)).toThrow(DomainError);
      expect(() => Notification.create(data)).toThrow(
        "Recipient ID is required",
      );
    });

    it("should throw error for empty title", () => {
      const data: CreateNotificationData = {
        ...createValidNotificationData(),
        title: "",
      };

      expect(() => Notification.create(data)).toThrow(DomainError);
      expect(() => Notification.create(data)).toThrow(
        "Notification title is required",
      );
    });

    it("should throw error for empty content", () => {
      const data: CreateNotificationData = {
        ...createValidNotificationData(),
        content: "",
      };

      expect(() => Notification.create(data)).toThrow(DomainError);
      expect(() => Notification.create(data)).toThrow(
        "Notification content is required",
      );
    });

    it("should throw error for title too long", () => {
      const data: CreateNotificationData = {
        ...createValidNotificationData(),
        title: "a".repeat(256), // 256 characters > 255 limit
      };

      expect(() => Notification.create(data)).toThrow(DomainError);
      expect(() => Notification.create(data)).toThrow(
        "Notification title cannot exceed 255 characters",
      );
    });

    it("should throw error for content too long", () => {
      const data: CreateNotificationData = {
        ...createValidNotificationData(),
        content: "a".repeat(2001), // 2001 characters > 2000 limit
      };

      expect(() => Notification.create(data)).toThrow(DomainError);
      expect(() => Notification.create(data)).toThrow(
        "Notification content cannot exceed 2000 characters",
      );
    });

    it("should throw error for negative retry count in reconstruction", () => {
      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        retryCount: -1,
      };

      expect(() => Notification.reconstruct(data)).toThrow(DomainError);
      expect(() => Notification.reconstruct(data)).toThrow(
        "Retry count cannot be negative",
      );
    });

    it("should throw error for excessive retry count in reconstruction", () => {
      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        retryCount: 11, // > 10 max
      };

      expect(() => Notification.reconstruct(data)).toThrow(DomainError);
      expect(() => Notification.reconstruct(data)).toThrow(
        "Maximum retry count exceeded",
      );
    });
  });

  describe("🔄 RED Phase - Status Transitions", () => {
    let notification: Notification;

    beforeEach(() => {
      notification = Notification.create(createValidNotificationData());
    });

    describe("markAsSent", () => {
      it("should mark pending notification as sent", () => {
        const sentNotification = notification.markAsSent();

        expect(sentNotification.getStatus().isSent()).toBe(true);
        expect(sentNotification.getSentAt()).toBeInstanceOf(Date);
        expect(sentNotification.getUpdatedAt()).toBeInstanceOf(Date);
        expect(sentNotification.getId()).toBe(notification.getId()); // Same ID
      });

      it("should throw error when marking non-pending notification as sent", () => {
        const failedNotification = notification.markAsFailed("Test failure");

        expect(() => failedNotification.markAsSent()).toThrow(DomainError);
        expect(() => failedNotification.markAsSent()).toThrow(
          "Cannot mark notification as sent from status: FAILED",
        );
      });
    });

    describe("markAsDelivered", () => {
      it("should mark sent notification as delivered", () => {
        const sentNotification = notification.markAsSent();
        const deliveredNotification = sentNotification.markAsDelivered();

        expect(deliveredNotification.getStatus().isDelivered()).toBe(true);
        expect(deliveredNotification.getDeliveredAt()).toBeInstanceOf(Date);
        expect(deliveredNotification.getSentAt()).toEqual(
          sentNotification.getSentAt(),
        );
      });

      it("should throw error when marking non-sent notification as delivered", () => {
        expect(() => notification.markAsDelivered()).toThrow(DomainError);
        expect(() => notification.markAsDelivered()).toThrow(
          "Cannot mark notification as delivered from status: PENDING",
        );
      });
    });

    describe("markAsRead", () => {
      it("should mark delivered notification as read", () => {
        const sentNotification = notification.markAsSent();
        const deliveredNotification = sentNotification.markAsDelivered();
        const readNotification = deliveredNotification.markAsRead();

        expect(readNotification.getStatus().isRead()).toBe(true);
        expect(readNotification.getReadAt()).toBeInstanceOf(Date);
        expect(readNotification.getDeliveredAt()).toEqual(
          deliveredNotification.getDeliveredAt(),
        );
      });

      it("should throw error when marking non-delivered notification as read", () => {
        const sentNotification = notification.markAsSent();

        expect(() => sentNotification.markAsRead()).toThrow(DomainError);
        expect(() => sentNotification.markAsRead()).toThrow(
          "Cannot mark notification as read from status: SENT",
        );
      });
    });

    describe("markAsFailed", () => {
      it("should mark notification as failed with reason", () => {
        const failureReason = "Network timeout occurred";
        const failedNotification = notification.markAsFailed(failureReason);

        expect(failedNotification.getStatus().isFailed()).toBe(true);
        expect(failedNotification.getFailureReason()).toBe(failureReason);
        expect(failedNotification.getUpdatedAt()).toBeInstanceOf(Date);
      });

      it("should throw error for empty failure reason", () => {
        expect(() => notification.markAsFailed("")).toThrow(DomainError);
        expect(() => notification.markAsFailed("")).toThrow(
          "Failure reason is required",
        );
      });

      it("should throw error when marking terminal status as failed", () => {
        const readNotification = notification
          .markAsSent()
          .markAsDelivered()
          .markAsRead();

        expect(() => readNotification.markAsFailed("Test")).toThrow(
          DomainError,
        );
      });
    });

    describe("cancel", () => {
      it("should cancel pending notification", () => {
        const cancelledNotification = notification.cancel();

        expect(cancelledNotification.getStatus().isCancelled()).toBe(true);
        expect(cancelledNotification.getUpdatedAt()).toBeInstanceOf(Date);
      });

      it("should cancel sent notification", () => {
        const sentNotification = notification.markAsSent();
        const cancelledNotification = sentNotification.cancel();

        expect(cancelledNotification.getStatus().isCancelled()).toBe(true);
      });

      it("should throw error when cancelling terminal notification", () => {
        const readNotification = notification
          .markAsSent()
          .markAsDelivered()
          .markAsRead();

        expect(() => readNotification.cancel()).toThrow(DomainError);
      });
    });
  });

  describe("🔄 RED Phase - Retry Logic", () => {
    it("should increment retry count for failed notification", () => {
      const failedNotification = Notification.create(
        createValidNotificationData(),
      ).markAsFailed("Network error");

      const retriedNotification = failedNotification.incrementRetryCount();

      expect(retriedNotification.getRetryCount()).toBe(1);
      expect(retriedNotification.getStatus().isPending()).toBe(true);
      expect(retriedNotification.getSentAt()).toBeUndefined();
      expect(retriedNotification.getDeliveredAt()).toBeUndefined();
      expect(retriedNotification.getFailureReason()).toBeUndefined();
    });

    it("should throw error when exceeding maximum retry attempts", () => {
      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        status: NotificationStatus.failed(),
        priority: NotificationPriority.low(), // Max 1 retry
        retryCount: 1,
      };
      const notification = Notification.reconstruct(data);

      expect(() => notification.incrementRetryCount()).toThrow(DomainError);
      expect(() => notification.incrementRetryCount()).toThrow(
        "Maximum retry attempts (1) exceeded",
      );
    });

    it("should throw error when retrying non-failed notification", () => {
      const notification = Notification.create(createValidNotificationData());

      expect(() => notification.incrementRetryCount()).toThrow(DomainError);
      expect(() => notification.incrementRetryCount()).toThrow(
        "Cannot retry notification with current status",
      );
    });
  });

  describe("🎯 RED Phase - Business Logic", () => {
    describe("isReadyToSend", () => {
      it("should return true for pending notification without schedule", () => {
        const notification = Notification.create(createValidNotificationData());

        expect(notification.isReadyToSend()).toBe(true);
      });

      it("should return false for non-pending notification", () => {
        const notification = Notification.create(
          createValidNotificationData(),
        ).markAsSent();

        expect(notification.isReadyToSend()).toBe(false);
      });

      it("should return false for scheduled notification not yet due", () => {
        const futureDate = new Date(Date.now() + 60000); // 1 minute in future
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          scheduledFor: futureDate,
        };
        const notification = Notification.create(data);

        expect(notification.isReadyToSend()).toBe(false);
      });

      it("should return true for scheduled notification that is due", () => {
        const pastDate = new Date(Date.now() - 60000); // 1 minute in past
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          scheduledFor: pastDate,
        };
        const notification = Notification.create(data);

        expect(notification.isReadyToSend()).toBe(true);
      });
    });

    describe("isExpired", () => {
      it("should return false for notification without expiry", () => {
        const notification = Notification.create(createValidNotificationData());

        expect(notification.isExpired()).toBe(false);
      });

      it("should return false for notification not yet expired", () => {
        const futureDate = new Date(Date.now() + 60000);
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          metadata: { expiresAt: futureDate },
        };
        const notification = Notification.create(data);

        expect(notification.isExpired()).toBe(false);
      });

      it("should return true for expired notification", () => {
        const pastDate = new Date(Date.now() - 60000);
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          metadata: { expiresAt: pastDate },
        };
        const notification = Notification.create(data);

        expect(notification.isExpired()).toBe(true);
      });
    });

    describe("canBeDeleted", () => {
      it("should return true for terminal status notification", () => {
        const readNotification = Notification.create(
          createValidNotificationData(),
        )
          .markAsSent()
          .markAsDelivered()
          .markAsRead();

        expect(readNotification.canBeDeleted()).toBe(true);
      });

      it("should return true for expired notification", () => {
        const pastDate = new Date(Date.now() - 60000);
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          metadata: { expiresAt: pastDate },
        };
        const notification = Notification.create(data);

        expect(notification.canBeDeleted()).toBe(true);
      });

      it("should return false for active notification", () => {
        const notification = Notification.create(createValidNotificationData());

        expect(notification.canBeDeleted()).toBe(false);
      });
    });

    describe("getAgeInMinutes", () => {
      it("should calculate correct age in minutes", () => {
        const createdAt = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
        const data: ReconstructNotificationData = {
          ...createValidReconstructData(),
          createdAt,
        };
        const notification = Notification.reconstruct(data);

        const age = notification.getAgeInMinutes();

        expect(age).toBeGreaterThanOrEqual(4);
        expect(age).toBeLessThanOrEqual(6);
      });
    });

    describe("isAppointmentRelated", () => {
      it("should return true for notification with appointment ID", () => {
        const data: CreateNotificationData = {
          ...createValidNotificationData(),
          metadata: { appointmentId: "apt-123" },
        };
        const notification = Notification.create(data);

        expect(notification.isAppointmentRelated()).toBe(true);
      });

      it("should return false for notification without appointment ID", () => {
        const notification = Notification.create(createValidNotificationData());

        expect(notification.isAppointmentRelated()).toBe(false);
      });
    });
  });

  describe("📊 RED Phase - Equality and String Representation", () => {
    it("should be equal when same ID", () => {
      const data = createValidReconstructData();
      const notification1 = Notification.reconstruct(data);
      const notification2 = Notification.reconstruct(data);

      expect(notification1.equals(notification2)).toBe(true);
    });

    it("should not be equal when different ID", () => {
      const data1 = createValidReconstructData();
      const data2 = { ...createValidReconstructData(), id: "different-id" };
      const notification1 = Notification.reconstruct(data1);
      const notification2 = Notification.reconstruct(data2);

      expect(notification1.equals(notification2)).toBe(false);
    });

    it("should return proper string representation", () => {
      const notification = Notification.create(createValidNotificationData());

      const str = notification.toString();

      expect(str).toContain("Notification(");
      expect(str).toContain(notification.getId());
      expect(str).toContain(notification.getTitle());
      expect(str).toContain("PENDING");
    });
  });

  describe("🕒 RED Phase - Date Validation Logic", () => {
    it("should throw error when sentAt is before createdAt", () => {
      const createdAt = new Date("2023-01-01T12:00:00Z");
      const sentAt = new Date("2023-01-01T11:00:00Z"); // Before createdAt

      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        createdAt,
        sentAt,
      };

      expect(() => Notification.reconstruct(data)).toThrow(DomainError);
      expect(() => Notification.reconstruct(data)).toThrow(
        "Sent date cannot be before creation date",
      );
    });

    it("should throw error when deliveredAt is before sentAt", () => {
      const sentAt = new Date("2023-01-01T12:00:00Z");
      const deliveredAt = new Date("2023-01-01T11:00:00Z"); // Before sentAt

      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        sentAt,
        deliveredAt,
      };

      expect(() => Notification.reconstruct(data)).toThrow(DomainError);
      expect(() => Notification.reconstruct(data)).toThrow(
        "Delivered date cannot be before sent date",
      );
    });

    it("should throw error when readAt is before deliveredAt", () => {
      const deliveredAt = new Date("2023-01-01T12:00:00Z");
      const readAt = new Date("2023-01-01T11:00:00Z"); // Before deliveredAt

      const data: ReconstructNotificationData = {
        ...createValidReconstructData(),
        deliveredAt,
        readAt,
      };

      expect(() => Notification.reconstruct(data)).toThrow(DomainError);
      expect(() => Notification.reconstruct(data)).toThrow(
        "Read date cannot be before delivered date",
      );
    });
  });
});
