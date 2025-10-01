/**
 * 🔐 USER PERMISSION TYPEORM REPOSITORY - Infrastructure Layer
 *
 * Implémentation TypeORM du repository pour les permissions utilisateurs.
 * Responsabilité : persistence et requêtes de base de données.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IUserPermissionRepository } from '@domain/repositories/user-permission.repository';
import {
  UserPermission,
  PermissionAction,
  ResourceType,
} from '@domain/entities/user-permission.entity';
import { UserPermissionOrmEntity } from '@infrastructure/database/sql/postgresql/entities/user-permission-orm.entity';
import { UserPermissionOrmMapper } from '@infrastructure/mappers/user-permission-orm.mapper';

@Injectable()
export class TypeOrmUserPermissionRepository
  implements IUserPermissionRepository
{
  constructor(
    @InjectRepository(UserPermissionOrmEntity)
    private readonly repository: Repository<UserPermissionOrmEntity>,
  ) {}

  /**
   * 💾 Sauvegarder une permission utilisateur
   */
  async save(userPermission: UserPermission): Promise<UserPermission> {
    const ormEntity = UserPermissionOrmMapper.toOrmEntity(userPermission);
    const savedOrm = await this.repository.save(ormEntity);
    return UserPermissionOrmMapper.toDomainEntity(savedOrm);
  }

  /**
   * 🔍 Trouver les permissions d'un utilisateur
   */
  async findByUserId(userId: string): Promise<UserPermission[]> {
    const ormEntities = await this.repository.find({
      where: { user_id: userId },
      order: { granted_at: 'DESC' },
    });

    return UserPermissionOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * 🔍 Trouver les permissions d'un utilisateur pour une ressource
   */
  async findByUserIdAndResource(
    userId: string,
    resource: ResourceType,
  ): Promise<UserPermission[]> {
    const ormEntities = await this.repository.find({
      where: {
        user_id: userId,
        resource: resource.toString(),
      },
      order: { granted_at: 'DESC' },
    });

    return UserPermissionOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * 🔍 Trouver les permissions d'un utilisateur dans un contexte business
   */
  async findByUserIdAndBusinessId(
    userId: string,
    businessId: string,
  ): Promise<UserPermission[]> {
    const ormEntities = await this.repository.find({
      where: {
        user_id: userId,
        business_id: businessId,
      },
      order: { granted_at: 'DESC' },
    });

    return UserPermissionOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * 🔍 Vérifier si un utilisateur a une permission spécifique
   */
  async hasPermission(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<boolean> {
    const whereClause: any = {
      user_id: userId,
      resource: resource.toString(),
      is_granted: true,
    };

    // Gérer business_id null correctement
    if (businessId === null || businessId === undefined) {
      whereClause.business_id = null;
    } else {
      whereClause.business_id = businessId;
    }

    // Vérifier permission exacte accordée
    const exactPermission = await this.repository.findOne({
      where: {
        ...whereClause,
        action: action.toString(),
      },
    });

    if (exactPermission) return true;

    // Vérifier permission MANAGE (couvre toutes les actions sur la ressource)
    const managePermission = await this.repository.findOne({
      where: {
        ...whereClause,
        action: PermissionAction.MANAGE.toString(),
      },
    });

    return !!managePermission;
  }

  /**
   * 🔍 Trouver une permission spécifique
   */
  async findByUserActionResource(
    userId: string,
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): Promise<UserPermission | null> {
    const whereClause: any = {
      user_id: userId,
      action: action.toString(),
      resource: resource.toString(),
    };

    // Gérer business_id null correctement
    if (businessId === null || businessId === undefined) {
      whereClause.business_id = null;
    } else {
      whereClause.business_id = businessId;
    }

    const ormEntity = await this.repository.findOne({
      where: whereClause,
    });

    return ormEntity ? UserPermissionOrmMapper.toDomainEntity(ormEntity) : null;
  }

  /**
   * 🗑️ Supprimer une permission
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * 🗑️ Supprimer toutes les permissions d'un utilisateur
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ user_id: userId });
  }

  /**
   * 📊 Compter les permissions accordées à un utilisateur
   */
  async countByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        user_id: userId,
        is_granted: true,
      },
    });
  }
}
