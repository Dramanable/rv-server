/**
 * 🔄 USER PERMISSION ORM MAPPER - Infrastructure Layer
 *
 * Mapper pour la conversion entre UserPermission (Domain) et UserPermissionOrmEntity (ORM).
 * Responsabilité unique : conversion bidirectionnelle des données.
 */

import {
  UserPermission,
  PermissionAction,
  ResourceType,
} from "@domain/entities/user-permission.entity";
import { UserPermissionOrmEntity } from "@infrastructure/database/sql/postgresql/entities/user-permission-orm.entity";

export class UserPermissionOrmMapper {
  /**
   * 🏗️ Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: UserPermission): UserPermissionOrmEntity {
    const orm = new UserPermissionOrmEntity();

    orm.id = domain.getId();
    orm.user_id = domain.getUserId();
    orm.action = domain.getAction();
    orm.resource = domain.getResource();
    orm.business_id = domain.getBusinessId();
    orm.is_granted = domain.isGranted();
    orm.granted_by = domain.getGrantedBy();
    orm.granted_at = domain.getGrantedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }

  /**
   * 🔄 Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: UserPermissionOrmEntity): UserPermission {
    return UserPermission.reconstruct({
      id: orm.id,
      userId: orm.user_id,
      action: orm.action as PermissionAction,
      resource: orm.resource as ResourceType,
      businessId: orm.business_id,
      isGranted: orm.is_granted,
      grantedBy: orm.granted_by,
      grantedAt: orm.granted_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * 📚 Convertit liste ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: UserPermissionOrmEntity[],
  ): UserPermission[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * 📚 Convertit liste Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: UserPermission[],
  ): UserPermissionOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
