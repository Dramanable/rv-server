import { Repository } from 'typeorm';

import { TypeOrmNotificationRepository } from '../../../../../infrastructure/database/sql/postgresql/repositories/typeorm-notification.repository';
import { NotificationOrmEntity } from '../../../../../infrastructure/database/entities/notification-orm.entity';
import { NotificationOrmMapper } from '../../../../../infrastructure/mappers/notification-orm.mapper';

import { Notification } from '../../../../../domain/entities/notification.entity';
import { NotificationChannel } from '../../../../../domain/value-objects/notification-channel.value-object';
import { NotificationPriority } from '../../../../../domain/value-objects/notification-priority.value-object';
import { NotificationStatus } from '../../../../../domain/value-objects/notification-status.value-object';

describe('TypeOrmNotificationRepository - TDD Implementation', () => {
  let repository: TypeOrmNotificationRepository;
  let mockOrmRepository: jest.Mocked<Repository<NotificationOrmEntity>>;

  const createValidNotification = (): Notification => {
    return Notification.create({
      recipientId: 'user-123',
      title: 'Test Notification',
      content: 'Test content for notification',
      channel: NotificationChannel.email(),
      priority: NotificationPriority.medium(),
      metadata: { correlationId: 'test-correlation-id' },
    });
  };

  const createValidOrmEntity = (): NotificationOrmEntity => {
    const entity = new NotificationOrmEntity();
    entity.id = 'notification-123';
    entity.recipient_id = 'user-123';
    entity.title = 'Test Notification';
    entity.content = 'Test content for notification';
    entity.channel = 'EMAIL';
    entity.priority = 'MEDIUM';
    entity.status = 'PENDING';
    entity.metadata = { correlationId: 'test-correlation-id' };
    entity.retry_count = 0;
    entity.created_at = new Date();
    entity.updated_at = new Date();
    return entity;
  };

  beforeEach(() => {
    mockOrmRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    // Créer directement l'instance avec le mock repository
    repository = new TypeOrmNotificationRepository(mockOrmRepository);
  });

  describe('🔴 RED Phase - Save Notification', () => {
    it('should save notification entity and return saved result', async () => {
      // Given
      const notification = createValidNotification();
      const ormEntity = createValidOrmEntity();

      mockOrmRepository.save.mockResolvedValue(ormEntity);

      // When
      const result = await repository.save(notification);

      // Then
      expect(mockOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: 'user-123',
          title: 'Test Notification',
          content: 'Test content for notification',
          channel: 'EMAIL',
          priority: 'MEDIUM',
          status: 'PENDING',
        }),
      );
      expect(result.id).toBe('notification-123');
      expect(result.status).toEqual(NotificationStatus.pending());
    });

    it('should handle repository save errors', async () => {
      // Given
      const notification = createValidNotification();
      mockOrmRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // When & Then
      await expect(repository.save(notification)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should map domain entity to ORM entity correctly', async () => {
      // Given
      const notification = createValidNotification();
      const ormEntity = createValidOrmEntity();

      mockOrmRepository.save.mockResolvedValue(ormEntity);

      // When
      await repository.save(notification);

      // Then
      expect(mockOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: notification.getRecipientId(),
          title: notification.getTitle(),
          content: notification.getContent(),
          channel: notification.getChannel().toString(),
          priority: notification.getPriority().toString(),
          status: notification.getStatus().toString(),
          metadata: notification.getMetadata(),
          retry_count: notification.getRetryCount(),
        }),
      );
    });
  });

  describe('🔴 RED Phase - Find Notification by ID', () => {
    it('should find notification by ID and return domain entity', async () => {
      // Given
      const ormEntity = createValidOrmEntity();
      mockOrmRepository.findOne.mockResolvedValue(ormEntity);

      // When
      const result = await repository.findById('notification-123');

      // Then
      expect(mockOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
      });
      expect(result).toBeDefined();
      expect(result!.getId()).toBe('notification-123');
      expect(result!.getRecipientId()).toBe('user-123');
      expect(result!.getTitle()).toBe('Test Notification');
    });

    it('should return null when notification not found', async () => {
      // Given
      mockOrmRepository.findOne.mockResolvedValue(null);

      // When
      const result = await repository.findById('non-existent');

      // Then
      expect(result).toBeNull();
    });

    it('should handle database errors during find', async () => {
      // Given
      mockOrmRepository.findOne.mockRejectedValue(
        new Error('Connection timeout'),
      );

      // When & Then
      await expect(repository.findById('notification-123')).rejects.toThrow(
        'Connection timeout',
      );
    });
  });

  describe('🔴 RED Phase - Find Notifications by Recipient', () => {
    it('should find all notifications for recipient', async () => {
      // Given
      const ormEntities = [createValidOrmEntity(), createValidOrmEntity()];
      mockOrmRepository.find.mockResolvedValue(ormEntities);

      // When
      const result = await repository.findByRecipient('user-123');

      // Then
      expect(mockOrmRepository.find).toHaveBeenCalledWith({
        where: { recipient_id: 'user-123' },
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].getRecipientId()).toBe('user-123');
    });

    it('should return empty array when no notifications found', async () => {
      // Given
      mockOrmRepository.find.mockResolvedValue([]);

      // When
      const result = await repository.findByRecipient('user-123');

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('🔴 RED Phase - Find Notifications by Status', () => {
    it('should find notifications by status', async () => {
      // Given
      const ormEntities = [createValidOrmEntity()];
      mockOrmRepository.find.mockResolvedValue(ormEntities);

      // When
      const result = await repository.findByStatus(
        NotificationStatus.pending(),
      );

      // Then
      expect(mockOrmRepository.find).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].getStatus().toString()).toBe('PENDING');
    });
  });

  describe('🔴 RED Phase - Update Notification Status', () => {
    it('should update notification status', async () => {
      // Given
      const ormEntity = createValidOrmEntity();
      ormEntity.status = 'SENT';
      mockOrmRepository.save.mockResolvedValue(ormEntity);
      mockOrmRepository.findOne.mockResolvedValue(createValidOrmEntity());

      // When
      const result = await repository.updateStatus(
        'notification-123',
        NotificationStatus.sent(),
      );

      // Then
      expect(mockOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-123' },
      });
      expect(mockOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SENT',
          updated_at: expect.any(Date),
        }),
      );
      expect(result.getStatus().toString()).toBe('SENT');
    });

    it('should throw error when notification not found for update', async () => {
      // Given
      mockOrmRepository.findOne.mockResolvedValue(null);

      // When & Then
      await expect(
        repository.updateStatus('non-existent', NotificationStatus.sent()),
      ).rejects.toThrow('Notification not found');
    });
  });

  describe('🔴 RED Phase - Delete Notification', () => {
    it('should delete notification by ID', async () => {
      // Given
      mockOrmRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // When
      await repository.delete('notification-123');

      // Then
      expect(mockOrmRepository.delete).toHaveBeenCalledWith('notification-123');
    });

    it('should throw error when notification not found for deletion', async () => {
      // Given
      mockOrmRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // When & Then
      await expect(repository.delete('non-existent')).rejects.toThrow(
        'Notification not found',
      );
    });
  });

  describe('🔴 RED Phase - Count Notifications', () => {
    it('should count total notifications', async () => {
      // Given
      mockOrmRepository.count.mockResolvedValue(42);

      // When
      const count = await repository.count();

      // Then
      expect(count).toBe(42);
      expect(mockOrmRepository.count).toHaveBeenCalled();
    });

    it('should count notifications by recipient', async () => {
      // Given
      mockOrmRepository.count.mockResolvedValue(5);

      // When
      const count = await repository.countByRecipient('user-123');

      // Then
      expect(count).toBe(5);
      expect(mockOrmRepository.count).toHaveBeenCalledWith({
        where: { recipient_id: 'user-123' },
      });
    });
  });

  describe('🔴 RED Phase - Complex Queries', () => {
    it('should find pending notifications older than date', async () => {
      // Given
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([createValidOrmEntity()]),
      };
      mockOrmRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      // When
      const result = await repository.findPendingOlderThan(cutoffDate);

      // Then
      expect(mockOrmRepository.createQueryBuilder).toHaveBeenCalledWith(
        'notification',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'notification.status = :status',
        { status: 'PENDING' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.created_at < :cutoffDate',
        { cutoffDate },
      );
      expect(result).toHaveLength(1);
    });
  });
});
