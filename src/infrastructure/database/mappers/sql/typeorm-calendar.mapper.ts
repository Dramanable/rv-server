/**
 * 🔄 TypeORM Calendar Entity Mapper
 *
 * Mapper statique entre l'entité domaine Calendar et l'entité ORM TypeORM
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Calendar, CalendarType } from '../../../../domain/entities/calendar.entity';
import { CalendarId } from '../../../../domain/value-objects/calendar-id.value-object';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { CalendarOrmEntity } from '../../entities/typeorm/calendar.entity';

export class TypeOrmCalendarMapper {
  /**
   * 🔄 Conversion Domain → TypeORM
   */
  static toOrmEntity(domainEntity: Calendar): Partial<CalendarOrmEntity> {
    const ormEntity = new CalendarOrmEntity();
    
    ormEntity.id = domainEntity.id.getValue();
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.businessId = domainEntity.businessId.getValue();
    ormEntity.ownerId = domainEntity.ownerId?.getValue();
    ormEntity.type = domainEntity.type;
    ormEntity.color = domainEntity.color;
    ormEntity.timezone = domainEntity.timezone;
    ormEntity.isActive = domainEntity.isActive ?? true;
    ormEntity.isDefault = domainEntity.isDefault ?? false;
    ormEntity.settings = domainEntity.settings;

    return ormEntity;
  }

  /**
   * 🔄 Conversion TypeORM → Domain
   */
  static toDomainEntity(ormEntity: CalendarOrmEntity): Calendar {
    return Calendar.createFromData({
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      businessId: ormEntity.businessId,
      ownerId: ormEntity.ownerId,
      type: ormEntity.type as CalendarType,
      color: ormEntity.color,
      timezone: ormEntity.timezone,
      isActive: ormEntity.isActive,
      isDefault: ormEntity.isDefault,
      settings: ormEntity.settings,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * 🔄 Conversion Domain → TypeORM (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Calendar): Partial<CalendarOrmEntity> {
    return this.toOrmEntity(domainEntity);
  }
}
