import { Repository } from 'typeorm';
import { InfrastructureException } from '@shared/exceptions/shared.exceptions';

import { Notification } from '../../../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../../../domain/repositories/notification.repository';
import { NotificationStatus } from '../../../../../domain/value-objects/notification-status.value-object';
import { NotificationOrmMapper } from '../../../../mappers/notification-orm.mapper';
import { NotificationOrmEntity } from '../entities/notification-orm.entity';

/**
 * Implémentation TypeORM du repository de notifications
 * Responsabilité : Persistence et récupération des notifications en base de données
 */
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(private readonly repository: Repository<NotificationOrmEntity>) {}

  /**
   * Sauvegarde une notification
   */
  async save(
    notification: Notification,
  ): Promise<{ id: string; status: NotificationStatus }> {
    // Conversion Domain → ORM
    const ormEntity = NotificationOrmMapper.toOrmEntity(notification);

    // Persistence en base
    const savedEntity = await this.repository.save(ormEntity);

    // Retour avec format attendu par l'application
    return {
      id: savedEntity.id,
      status: NotificationStatus.fromString(savedEntity.status),
    };
  }

  /**
   * Trouve une notification par ID
   */
  async findById(id: string): Promise<Notification | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });

    if (!ormEntity) {
      return null;
    }

    // Conversion ORM → Domain
    return NotificationOrmMapper.toDomainEntity(ormEntity);
  }

  /**
   * Trouve toutes les notifications d'un destinataire
   */
  async findByRecipient(recipientId: string): Promise<Notification[]> {
    const ormEntities = await this.repository.find({
      where: { recipient_id: recipientId },
      order: { created_at: 'DESC' },
    });

    // Conversion batch ORM → Domain
    return NotificationOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * Trouve les notifications par statut
   */
  async findByStatus(status: NotificationStatus): Promise<Notification[]> {
    const ormEntities = await this.repository.find({
      where: { status: status.toString() },
      order: { created_at: 'DESC' },
    });

    return NotificationOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * Met à jour le statut d'une notification
   */
  async updateStatus(
    id: string,
    status: NotificationStatus,
  ): Promise<Notification> {
    // Récupérer l'entité existante
    const existingEntity = await this.repository.findOne({
      where: { id },
    });

    if (!existingEntity) {
      throw new InfrastructureException(
        'Notification not found',
        'INFRASTRUCTURE_ERROR',
      );
    }

    // Mettre à jour le statut et la date de mise à jour
    existingEntity.status = status.toString();
    existingEntity.updated_at = new Date();

    // Sauvegarder
    const updatedEntity = await this.repository.save(existingEntity);

    // Retourner l'entité domain mise à jour
    return NotificationOrmMapper.toDomainEntity(updatedEntity);
  }

  /**
   * Supprime une notification
   */
  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new InfrastructureException(
        'Notification not found',
        'INFRASTRUCTURE_ERROR',
      );
    }
  }

  /**
   * Compte le nombre total de notifications
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  /**
   * Compte les notifications par destinataire
   */
  async countByRecipient(recipientId: string): Promise<number> {
    return await this.repository.count({
      where: { recipient_id: recipientId },
    });
  }

  /**
   * Trouve les notifications en attente plus anciennes qu'une date donnée
   * Utile pour les tâches de nettoyage ou de retry
   */
  async findPendingOlderThan(cutoffDate: Date): Promise<Notification[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('notification')
      .where('notification.status = :status', { status: 'PENDING' })
      .andWhere('notification.created_at < :cutoffDate', { cutoffDate })
      .orderBy('notification.created_at', 'ASC')
      .getMany();

    return NotificationOrmMapper.toDomainEntities(ormEntities);
  }
}
