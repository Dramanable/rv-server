/**
 * 🔄 TypeORM Calendar Entity Mapper
 *
 * Mapper statique entre l'entité domaine Calendar et l'entité ORM TypeORM
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Calendar, CalendarType } from '../../../../domain/entities/calendar.entity';
import { CalendarId } from '../../../../domain/value-objects/calendar-id.value-object';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../domain/value-objects/user-id.value-object';
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
    ormEntity.color = '#007BFF'; // Default color
    ormEntity.timezone = domainEntity.settings.timezone;
    ormEntity.isActive = true;
    ormEntity.isDefault = false;
    ormEntity.settings = domainEntity.settings;

    return ormEntity;
  }

  /**
   * 🔄 Conversion TypeORM → Domain
   */
  static toDomainEntity(ormEntity: CalendarOrmEntity): Calendar {
    return Calendar.create({
      businessId: BusinessId.create(ormEntity.businessId),
      type: ormEntity.type as CalendarType,
      name: ormEntity.name,
      description: ormEntity.description || '', // Handle nullable description
      ownerId: ormEntity.ownerId ? UserId.create(ormEntity.ownerId) : undefined,
      settings: {
        timezone: ormEntity.timezone || 'Europe/Paris',
        // Add other required settings with defaults if missing
        defaultSlotDuration: 30,
        minimumNotice: 60,
        maximumAdvanceBooking: 30,
        allowMultipleBookings: false,
        autoConfirmBookings: true,
        bufferTimeBetweenSlots: 0
      }
    });
  }

  /**
   * 🔄 Conversion Domain → TypeORM (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Calendar): Partial<CalendarOrmEntity> {
    return this.toOrmEntity(domainEntity);
  }
}
