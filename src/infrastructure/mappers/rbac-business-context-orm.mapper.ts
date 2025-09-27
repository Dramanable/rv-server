/**
 * 🔄 INFRASTRUCTURE MAPPER - RBAC Business Context ORM
 *
 * Mapper responsable de la conversion entre l'entité domain RbacBusinessContext
 * et l'entité ORM BusinessContextOrmEntity.
 *
 * RÈGLES :
 * - Conversion bidirectionnelle Domain ↔ ORM
 * - Gestion des Value Objects et types primitifs
 * - Préservation de l'intégrité des données
 * - Aucune logique métier (pure transformation)
 */

import {
  RbacBusinessContext,
  RbacBusinessContextData,
  RbacContextType,
} from "@domain/entities/rbac-business-context.entity";
import { BusinessContextOrmEntity } from "../database/sql/postgresql/entities/business-context-orm.entity";

export class RbacBusinessContextOrmMapper {
  /**
   * 🔄 Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: RbacBusinessContext): BusinessContextOrmEntity {
    const ormEntity = new BusinessContextOrmEntity();

    // Identification
    ormEntity.id = domain.getId();
    ormEntity.name = domain.getName();
    ormEntity.type = domain.getType();
    ormEntity.businessId = domain.getBusinessId();

    // Hiérarchie
    ormEntity.parentContextId = domain.getParentContextId() || null;

    // Métadonnées descriptives
    ormEntity.description = domain.getDescription() || null;
    ormEntity.code = domain.getCode() || null;

    // Configuration et statut
    ormEntity.isActive = domain.isActive();
    ormEntity.settings = domain.getSettings() || null;

    // Métadonnées hiérarchiques
    ormEntity.level = domain.getLevel();
    ormEntity.path = domain.getPath() || null;
    ormEntity.displayOrder = domain.getDisplayOrder();

    // Audit trail
    ormEntity.createdBy = domain.getCreatedBy();
    ormEntity.updatedBy = domain.getUpdatedBy();

    // Timestamps
    ormEntity.createdAt = domain.getCreatedAt();
    ormEntity.updatedAt = domain.getUpdatedAt();

    // Versioning et intégrations
    ormEntity.version = domain.getVersion();
    ormEntity.externalId = domain.getExternalId() || null;
    ormEntity.timezone = domain.getTimezone() || null;

    return ormEntity;
  }

  /**
   * 🔄 Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: BusinessContextOrmEntity): RbacBusinessContext {
    const contextData: RbacBusinessContextData = {
      id: orm.id,
      name: orm.name,
      type: orm.type as RbacContextType,
      businessId: orm.businessId,
      parentContextId: orm.parentContextId || undefined,
      description: orm.description || undefined,
      code: orm.code || undefined,
      isActive: orm.isActive,
      settings: orm.settings || undefined,
      level: orm.level,
      path: orm.path || undefined,
      displayOrder: orm.displayOrder,
      createdBy: orm.createdBy,
      updatedBy: orm.updatedBy,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      version: orm.version,
      externalId: orm.externalId || undefined,
      timezone: orm.timezone || undefined,
    };

    return RbacBusinessContext.reconstruct(contextData);
  }

  /**
   * 🔄 Convertit une liste d'entités ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: BusinessContextOrmEntity[],
  ): RbacBusinessContext[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * 🔄 Convertit une liste d'entités Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: RbacBusinessContext[],
  ): BusinessContextOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
