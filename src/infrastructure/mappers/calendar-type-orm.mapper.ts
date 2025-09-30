import { CalendarType } from '@domain/entities/calendar-type.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';
import { CalendarTypeOrmEntity } from '@infrastructure/database/sql/postgresql/entities/calendar-type-orm.entity';

export class CalendarTypeOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: CalendarType): CalendarTypeOrmEntity {
    const ormEntity = new CalendarTypeOrmEntity();

    ormEntity.id = domain.getId().getValue();
    ormEntity.business_id = domain.getBusinessId().getValue();
    ormEntity.name = domain.getName();
    ormEntity.code = domain.getCode();
    ormEntity.description = domain.getDescription() || null;

    // Sérialiser les propriétés Domain dans settings JSON
    ormEntity.settings = {
      icon: domain.getIcon(),
      color: domain.getColor(),
      isBuiltIn: domain.isBuiltIn(),
      sortOrder: domain.getSortOrder(),
    };

    ormEntity.is_active = domain.isActive();
    ormEntity.created_by = domain.getCreatedBy();
    ormEntity.updated_by = domain.getUpdatedBy();
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: CalendarTypeOrmEntity): CalendarType {
    const id = CalendarTypeId.fromString(orm.id);
    const businessId = BusinessId.fromString(orm.business_id);

    // Désérialiser les settings JSON
    const settings = orm.settings || {};

    return CalendarType.reconstruct({
      id: id.getValue(),
      businessId,
      name: orm.name,
      code: orm.code,
      description: orm.description || '',
      icon: settings.icon || 'calendar',
      color: settings.color || '#007bff',
      isBuiltIn: settings.isBuiltIn || false,
      isActive: orm.is_active,
      sortOrder: settings.sortOrder || 0,
      createdBy: orm.created_by,
      updatedBy: orm.updated_by,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: CalendarTypeOrmEntity[],
  ): CalendarType[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit liste Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: CalendarType[],
  ): CalendarTypeOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
