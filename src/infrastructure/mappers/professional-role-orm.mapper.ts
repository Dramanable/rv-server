/**
 * 🏥 INFRASTRUCTURE MAPPER - ProfessionalRole
 * Clean Architecture - Infrastructure Layer
 * Mapper bidirectionnel entre Domain et ORM pour ProfessionalRole
 */

import { ProfessionalRole } from '@domain/entities/professional-role.entity';
import { ProfessionalRoleOrmEntity } from '@infrastructure/database/sql/postgresql/entities/professional-role-orm.entity';

export class ProfessionalRoleOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: ProfessionalRole): ProfessionalRoleOrmEntity {
    const ormEntity = new ProfessionalRoleOrmEntity();
    ormEntity.id = domain.getId();
    ormEntity.code = domain.getCode();
    ormEntity.name = domain.getName();
    ormEntity.display_name = domain.getDisplayName();
    ormEntity.category = domain.getCategory();
    ormEntity.description = domain.getDescription();
    ormEntity.can_lead = domain.getCanLead();
    ormEntity.is_active = domain.getIsActive();
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();
    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: ProfessionalRoleOrmEntity): ProfessionalRole {
    return ProfessionalRole.reconstruct({
      id: orm.id,
      code: orm.code,
      name: orm.name,
      displayName: orm.display_name,
      category: orm.category,
      description: orm.description,
      canLead: orm.can_lead,
      isActive: orm.is_active,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * Convertit une liste d'entités ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: ProfessionalRoleOrmEntity[],
  ): ProfessionalRole[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit une liste d'entités Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: ProfessionalRole[],
  ): ProfessionalRoleOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
