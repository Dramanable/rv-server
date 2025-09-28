import { Notification } from '../../domain/entities/notification.entity';
import { NotificationChannel } from '../../domain/value-objects/notification-channel.value-object';
import { NotificationPriority } from '../../domain/value-objects/notification-priority.value-object';
import { NotificationStatus } from '../../domain/value-objects/notification-status.value-object';
import { NotificationOrmEntity } from '../database/sql/postgresql/entities/notification-orm.entity';

/**
 * Mapper pour conversion entre entité Domain et entité ORM
 * Responsabilité unique : conversion de données sans logique métier
 */
export class NotificationOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: Notification): NotificationOrmEntity {
    const ormEntity = new NotificationOrmEntity();

    // Propriétés de base
    ormEntity.id = domain.getId();
    ormEntity.recipient_id = domain.getRecipientId();
    ormEntity.title = domain.getTitle();
    ormEntity.content = domain.getContent();

    // Conversion des Value Objects vers strings
    ormEntity.channel = domain.getChannel().toString();
    ormEntity.priority = domain.getPriority().toString();
    ormEntity.status = domain.getStatus().toString();

    // Métadonnées et propriétés optionnelles
    ormEntity.metadata = domain.getMetadata() || {};
    ormEntity.sent_at = domain.getSentAt() || null;
    ormEntity.delivered_at = domain.getDeliveredAt() || null;
    ormEntity.read_at = domain.getReadAt() || null;
    ormEntity.failure_reason = domain.getFailureReason() || null;
    ormEntity.retry_count = domain.getRetryCount();
    ormEntity.scheduled_for = domain.getScheduledFor() || null;

    // Audit trail
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: NotificationOrmEntity): Notification {
    // Reconstruction des Value Objects depuis strings
    const channel = NotificationChannel.fromString(orm.channel);
    const priority = NotificationPriority.fromString(orm.priority);
    const status = NotificationStatus.fromString(orm.status);

    return Notification.reconstruct({
      id: orm.id,
      recipientId: orm.recipient_id,
      title: orm.title,
      content: orm.content,
      channel: channel,
      priority: priority,
      status: status,
      metadata: orm.metadata || {},
      sentAt: orm.sent_at || undefined,
      deliveredAt: orm.delivered_at || undefined,
      readAt: orm.read_at || undefined,
      failureReason: orm.failure_reason || undefined,
      retryCount: orm.retry_count,
      scheduledFor: orm.scheduled_for || undefined,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: NotificationOrmEntity[],
  ): Notification[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit liste Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: Notification[],
  ): NotificationOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
