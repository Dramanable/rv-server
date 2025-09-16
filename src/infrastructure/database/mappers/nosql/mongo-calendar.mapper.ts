/**
 * 🔄 MongoDB Calendar Entity Mapper
 *
 * Mapper statique entre l'entité domaine Calendar et le document MongoDB
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Calendar, CalendarType } from '../../../../domain/entities/calendar.entity';
import { CalendarId } from '../../../../domain/value-objects/calendar-id.value-object';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../domain/value-objects/user-id.value-object';
import { CalendarDocument } from '../../entities/mongo/calendar.schema';

export class MongoCalendarMapper {
  /**
   * 🔄 Conversion Domain → MongoDB
   */
  static toMongoDocument(domainEntity: Calendar): Partial<CalendarDocument> {
    return {
      _id: domainEntity.id.getValue(),
      businessId: domainEntity.businessId.getValue(),
      ownerId: domainEntity.ownerId?.getValue(),
      name: domainEntity.name,
      description: domainEntity.description,
      type: domainEntity.type,
      color: domainEntity.color,
      timezone: domainEntity.timezone,
      isActive: domainEntity.isActive ?? true,
      isDefault: domainEntity.isDefault ?? false,
      settings: domainEntity.settings,
      // createdAt et updatedAt gérés automatiquement par Mongoose
    };
  }

  /**
   * 🔄 Conversion MongoDB → Domain
   */
  static toDomainEntity(mongoDoc: CalendarDocument): Calendar {
    return Calendar.createFromData({
      id: mongoDoc._id.toString(),
      businessId: mongoDoc.businessId,
      ownerId: mongoDoc.ownerId,
      name: mongoDoc.name,
      description: mongoDoc.description,
      type: mongoDoc.type as CalendarType,
      color: mongoDoc.color,
      timezone: mongoDoc.timezone,
      isActive: mongoDoc.isActive,
      isDefault: mongoDoc.isDefault,
      settings: mongoDoc.settings,
      createdAt: mongoDoc.createdAt || new Date(),
      updatedAt: mongoDoc.updatedAt || new Date(),
    });
  }

  /**
   * 🔄 Conversion Domain → MongoDB (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Calendar): Partial<CalendarDocument> {
    return this.toMongoDocument(domainEntity);
  }

  /**
   * 🔄 Conversion multiple MongoDB → Domain
   */
  static toDomainEntities(mongoDocs: CalendarDocument[]): Calendar[] {
    return mongoDocs.map((doc) => this.toDomainEntity(doc));
  }
}
