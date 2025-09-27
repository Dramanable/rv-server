/**
 * 🗓️ Calendar ORM Mapper - Infrastructure Layer
 *
 * Mapper pour la conversion entre entités Domain Calendar et ORM CalendarOrmEntity
 * Suit les principes de Clean Architecture avec séparation stricte des responsabilités
 *
 * ✅ BONNES PRATIQUES :
 * - Mappers statiques dans Infrastructure layer
 * - Aucune logique métier dans les mappers
 * - Conversion bidirectionnelle Domain ↔ ORM
 * - Gestion des Value Objects et primitives
 */

import { CalendarOrmEntity } from '../database/sql/postgresql/entities/calendar-orm.entity';

/**
 * 🔄 Calendar ORM Mapper
 * Responsabilité : Conversion pure entre Calendar Domain et ORM Entity
 */
export class CalendarOrmMapper {
  /**
   * Convertit une entité ORM vers un objet plain pour Domain
   * @param orm - Entité ORM Calendar
   * @returns Objet plain compatible avec Domain
   */
  static toDomainPlainObject(orm: CalendarOrmEntity): any {
    return {
      id: orm.id,
      businessId: orm.business_id,
      type: orm.type,
      name: orm.name,
      description: orm.description,
      ownerId: orm.owner_id,
      status: orm.status,
      timezone: orm.timezone,
      isDefault: orm.is_default,
      color: orm.color,
      settings: orm.settings,
      availability: orm.availability,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    };
  }

  /**
   * Convertit un objet Domain vers une entité ORM
   * @param domainObject - Objet Domain Calendar
   * @returns Entité ORM CalendarOrmEntity
   */
  static toOrmEntity(domainObject: any): CalendarOrmEntity {
    const ormEntity = new CalendarOrmEntity();

    // Mapping des propriétés
    if (domainObject.id) {
      ormEntity.id = domainObject.id;
    }

    ormEntity.business_id = domainObject.businessId;
    ormEntity.type = domainObject.type;
    ormEntity.name = domainObject.name;
    ormEntity.description = domainObject.description;
    ormEntity.owner_id = domainObject.ownerId || null;
    ormEntity.status = domainObject.status;
    ormEntity.timezone = domainObject.timezone || 'Europe/Paris';
    ormEntity.is_default = domainObject.isDefault || false;
    ormEntity.color = domainObject.color || '#007bff';
    ormEntity.settings = domainObject.settings;
    ormEntity.availability = domainObject.availability;

    return ormEntity;
  }

  /**
   * Convertit une liste d'entités ORM vers des objets Domain
   * @param ormEntities - Liste d'entités ORM
   * @returns Liste d'objets Domain
   */
  static toDomainPlainObjects(ormEntities: CalendarOrmEntity[]): any[] {
    return ormEntities.map((orm) => this.toDomainPlainObject(orm));
  }

  /**
   * Convertit une liste d'objets Domain vers des entités ORM
   * @param domainObjects - Liste d'objets Domain
   * @returns Liste d'entités ORM
   */
  static toOrmEntities(domainObjects: any[]): CalendarOrmEntity[] {
    return domainObjects.map((domain) => this.toOrmEntity(domain));
  }
}
