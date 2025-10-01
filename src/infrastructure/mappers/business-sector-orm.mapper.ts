/**
 * 🏢 Business Sector ORM Mapper
 *
 * Mapper pour convertir entre l'entité Domain BusinessSector et l'entité ORM
 * Respecte les principes Clean Architecture en séparant la logique de conversion
 */

import { BusinessSector } from '@domain/entities/business-sector.entity';
import { BusinessSectorOrmEntity } from '../database/sql/postgresql/entities/business-sector-orm.entity';

export class BusinessSectorOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: BusinessSector): BusinessSectorOrmEntity {
    const ormEntity = new BusinessSectorOrmEntity();

    ormEntity.id = domain.id;
    ormEntity.code = domain.code;
    ormEntity.name = domain.name;
    ormEntity.description = domain.description;
    ormEntity.isActive = domain.isActive;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt || new Date();

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: BusinessSectorOrmEntity): BusinessSector {
    return BusinessSector.restore(
      orm.id,
      orm.name,
      orm.description || '', // Valeur par défaut si manquante
      orm.code,
      orm.isActive,
      orm.createdAt,
      orm.createdBy || 'system', // Valeur par défaut si manquante
      orm.updatedAt,
      orm.updatedBy,
    );
  }

  /**
   * Convertit une liste d'entités ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: BusinessSectorOrmEntity[],
  ): BusinessSector[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit une liste d'entités Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: BusinessSector[],
  ): BusinessSectorOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
