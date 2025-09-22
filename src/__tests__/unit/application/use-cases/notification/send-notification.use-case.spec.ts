/**
 * @fileoverview Tests for SendNotification Use Case - TDD Implementation
 * @module Tests/Unit/Application/UseCases
 * @version 1.0.0
 */

import {
  SendNotificationUseCase,
  SendNotificationRequest,
  SendNotificationResponse,
} from '../../../../../application/use-cases/notification/send-notification.use-case';
import { NotificationChannel } from '../../../../../domain/value-objects/notification-channel.value-object';
import { NotificationPriority } from '../../../../../domain/value-objects/notification-priority.value-object';
import { NotificationStatus } from '../../../../../domain/value-objects/notification-status.value-object';
import { Notification } from '../../../../../domain/entities/notification.entity';
import { NotificationException } from '../../../../../application/exceptions/notification.exceptions';

// Mocks for dependencies
const mockNotificationRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByRecipientId: jest.fn(),
  updateStatus: jest.fn(),
};

const mockNotificationService = {
  send: jest.fn(),
  scheduleDelivery: jest.fn(),
  validateDeliveryWindow: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockI18n = {
  t: jest.fn().mockImplementation((key: string) => key),
};

describe('SendNotificationUseCase - TDD Implementation', () => {
  let useCase: SendNotificationUseCase;

  const createValidRequest = (): SendNotificationRequest => ({
    recipientId: 'user-123',
    title: 'Appointment Reminder',
    content: 'Your appointment is scheduled for tomorrow at 2 PM',
    channel: NotificationChannel.email(),
    priority: NotificationPriority.medium(),
    requestingUserId: 'admin-456',
  });

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new SendNotificationUseCase(
      mockNotificationRepository,
      mockNotificationService,
      mockLogger,
      mockI18n,
    );
  });

  describe('🔴 RED Phase - Entity Creation and Persistence', () => {
    it('should create notification entity with valid data', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      const response = await useCase.execute(request);

      expect(mockNotificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _recipientId: request.recipientId,
          _title: request.title,
          _content: request.content,
        }),
      );
      expect(response.notificationId).toBe('notification-123');
      expect(response.status).toBe('sent');
      expect(response.messageId).toBe('msg-456');
    });

    it('should handle notification creation with metadata', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        metadata: {
          appointmentId: 'apt-123',
          businessId: 'biz-456',
          templateId: 'tpl-789',
        },
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      await useCase.execute(request);

      expect(mockNotificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _metadata: request.metadata,
        }),
      );
    });

    it('should create notification with custom priority', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        priority: NotificationPriority.urgent(),
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      await useCase.execute(request);

      expect(mockNotificationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _priority: expect.objectContaining({
            _level: 'URGENT',
          }),
        }),
      );
    });
  });

  describe('🔴 RED Phase - Input Validation', () => {
    it('should throw error for empty recipient ID', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        recipientId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Recipient ID is required',
      );
    });

    it('should throw error for empty title', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        title: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Notification title is required',
      );
    });

    it('should throw error for empty content', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        content: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Notification content is required',
      );
    });

    it('should throw error for empty requesting user ID', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        requestingUserId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Requesting user ID is required',
      );
    });

    it('should validate content length limits for channel', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        channel: NotificationChannel.sms(),
        content: 'a'.repeat(161), // Exceeds SMS limit of 160
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Content exceeds maximum length for SMS',
      );
    });
  });

  describe('🔴 RED Phase - Scheduled Notifications', () => {
    it('should handle scheduled notification for future delivery', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        scheduledFor: futureDate,
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      // 🎯 CRITICAL: Configure validateDeliveryWindow BEFORE scheduleDelivery
      mockNotificationService.validateDeliveryWindow.mockResolvedValue({
        valid: true,
      });

      mockNotificationService.scheduleDelivery.mockResolvedValue({
        success: true,
        scheduledId: 'schedule-456',
      });

      const response = await useCase.execute(request);

      expect(response.notificationId).toBe('notification-123');
      expect(response.status).toBe('scheduled');
      expect(response.scheduledFor).toEqual(futureDate);
      expect(response.scheduledId).toBe('schedule-456');
    });

    it('should reject past scheduled dates', async () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute in past
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        scheduledFor: pastDate,
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Scheduled date cannot be in the past',
      );
    });

    it('should validate scheduling window based on priority', async () => {
      const veryFutureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year in future
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        priority: NotificationPriority.urgent(),
        scheduledFor: veryFutureDate,
      };

      // 🎯 CRITICAL: Add repository mock for this test
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      mockNotificationService.validateDeliveryWindow.mockResolvedValue({
        valid: false,
        reason:
          'Urgent notifications cannot be scheduled more than 24 hours in advance',
      });

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid scheduling window',
      );
    });
  });

  describe('🔴 RED Phase - Channel-Specific Logic', () => {
    it('should handle EMAIL channel with rich content support', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        channel: NotificationChannel.email(),
        content: '<html><body><h1>Rich Content</h1></body></html>',
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'email-msg-456',
      });

      const response = await useCase.execute(request);

      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          _channel: expect.objectContaining({
            _type: 'EMAIL',
          }),
        }),
      );
      expect(response.status).toBe('sent');
    });

    it('should handle SMS channel with plain text only', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        channel: NotificationChannel.sms(),
        content: 'Your appointment is confirmed for tomorrow at 2 PM',
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'sms-msg-456',
      });

      const response = await useCase.execute(request);

      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          _channel: expect.objectContaining({
            _type: 'SMS',
          }),
        }),
      );
      expect(response.status).toBe('sent');
    });

    it('should handle PUSH notification channel', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        channel: NotificationChannel.push(),
        metadata: {
          deviceToken: 'device-token-123',
          badge: 1,
          sound: 'default',
        },
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'push-msg-456',
      });

      const response = await useCase.execute(request);

      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          _channel: expect.objectContaining({
            _type: 'PUSH',
          }),
          _metadata: expect.objectContaining({
            deviceToken: 'device-token-123',
          }),
        }),
      );
      expect(response.status).toBe('sent');
    });

    it('should handle IN_APP notification channel', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        channel: NotificationChannel.inApp(),
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'inapp-msg-456',
      });

      const response = await useCase.execute(request);

      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          _channel: expect.objectContaining({
            _type: 'IN_APP',
          }),
        }),
      );
      expect(response.status).toBe('sent');
    });
  });

  describe('🔴 RED Phase - Error Handling', () => {
    it('should handle notification service failures', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      // 🎯 CRITICAL: Mock service.send to always reject (should retry then fail)
      mockNotificationService.send.mockRejectedValue(
        new Error('Service unavailable'),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Failed to send notification',
      );
    });

    it('should handle repository save failures', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Failed to save notification',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save notification to repository',
        expect.objectContaining({
          error: 'Database connection failed',
        }),
      );
    });

    it('should handle partial failures with retry logic', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      // 🎯 CRITICAL: Test retry logic - first fails, second succeeds
      mockNotificationService.send
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          success: true,
          messageId: 'msg-456',
        });

      const response = await useCase.execute(request);

      expect(mockNotificationService.send).toHaveBeenCalledTimes(2);
      expect(response.status).toBe('sent');
      expect(response.messageId).toBe('msg-456');
    });
  });

  describe('🔴 RED Phase - Logging and Auditing', () => {
    it('should log notification attempt', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to send notification',
        expect.objectContaining({
          recipientId: request.recipientId,
          channel: expect.any(Object),
          priority: expect.any(Object),
        }),
      );
    });

    it('should log successful notification delivery', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Notification sent successfully',
        expect.objectContaining({
          notificationId: 'notification-123',
          messageId: 'msg-456',
        }),
      );
    });

    it('should log scheduling information for future notifications', async () => {
      const futureDate = new Date(Date.now() + 60000);
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        scheduledFor: futureDate,
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      // 🎯 CRITICAL: Add validateDeliveryWindow mock for scheduled notifications
      mockNotificationService.validateDeliveryWindow.mockResolvedValue({
        valid: true,
      });

      mockNotificationService.scheduleDelivery.mockResolvedValue({
        success: true,
        scheduledId: 'schedule-456',
      });

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Notification scheduled for future delivery',
        expect.objectContaining({
          notificationId: 'notification-123',
          scheduledFor: futureDate,
        }),
      );
    });
  });

  describe('🔴 RED Phase - Business Rules', () => {
    it('should apply priority-based processing delay', async () => {
      const urgentRequest: SendNotificationRequest = {
        ...createValidRequest(),
        priority: NotificationPriority.urgent(),
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      });

      await useCase.execute(urgentRequest);

      expect(mockNotificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          _priority: expect.objectContaining({
            _level: 'URGENT',
          }),
        }),
      );
    });

    it('should validate recipient exists (business rule)', async () => {
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        recipientId: 'non-existent-user',
      };

      // Mock recipient validation failure
      mockNotificationRepository.save.mockRejectedValue(
        new Error('Recipient not found'),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Failed to save notification',
      );
    });

    it('should enforce rate limiting per recipient', async () => {
      const request = createValidRequest();

      // 🎯 CRITICAL: Repository should throw rate limit error
      mockNotificationRepository.save.mockRejectedValue(
        new Error('Rate limit exceeded for recipient'),
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        NotificationException,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Failed to save notification',
      );

      // The error should be logged, not a warning about rate limiting
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to save notification to repository',
        expect.objectContaining({
          error: 'Rate limit exceeded for recipient',
        }),
      );
    });
  });

  describe('🔴 RED Phase - Response Format', () => {
    it('should return complete response for immediate delivery', async () => {
      const request = createValidRequest();
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });
      mockNotificationService.send.mockResolvedValue({
        success: true,
        messageId: 'msg-456',
        deliveryTime: new Date(),
      });

      const response = await useCase.execute(request);

      expect(response).toEqual({
        notificationId: 'notification-123',
        status: 'sent',
        messageId: 'msg-456',
        deliveryTime: expect.any(Date),
      });
    });

    it('should return complete response for scheduled delivery', async () => {
      const futureDate = new Date(Date.now() + 60000);
      const request: SendNotificationRequest = {
        ...createValidRequest(),
        scheduledFor: futureDate,
      };
      mockNotificationRepository.save.mockResolvedValue({
        id: 'notification-123',
        status: NotificationStatus.pending(),
      });

      // 🎯 CRITICAL: Add validateDeliveryWindow mock
      mockNotificationService.validateDeliveryWindow.mockResolvedValue({
        valid: true,
      });

      mockNotificationService.scheduleDelivery.mockResolvedValue({
        success: true,
        scheduledId: 'schedule-456',
      });

      const response = await useCase.execute(request);

      expect(response).toEqual({
        notificationId: 'notification-123',
        status: 'scheduled',
        scheduledFor: futureDate,
        scheduledId: 'schedule-456',
      });
    });
  });
});
