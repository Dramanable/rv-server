import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalendarType } from '@domain/entities/calendar-type.entity';
import {
  CalendarTypeSearchCriteria,
  CalendarTypeSearchResult,
  ICalendarTypeRepository,
} from '@domain/repositories/calendar-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';
import { CalendarTypeOrmEntity } from '@infrastructure/database/sql/postgresql/entities/calendar-type-orm.entity';
import { CalendarTypeOrmMapper } from '@infrastructure/mappers/calendar-type-orm.mapper';

@Injectable()
export class TypeOrmCalendarTypeRepository implements ICalendarTypeRepository {
  constructor(
    @InjectRepository(CalendarTypeOrmEntity)
    private readonly repository: Repository<CalendarTypeOrmEntity>,
  ) {}

  async save(calendarType: CalendarType): Promise<CalendarType> {
    const ormEntity = CalendarTypeOrmMapper.toOrmEntity(calendarType);
    const savedOrm = await this.repository.save(ormEntity);
    return CalendarTypeOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: CalendarTypeId): Promise<CalendarType | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) {
      return null;
    }

    return CalendarTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async findAll(
    criteria?: CalendarTypeSearchCriteria,
  ): Promise<CalendarType[]> {
    const queryBuilder = this.repository.createQueryBuilder('calendar_type');

    if (criteria?.businessId) {
      queryBuilder.andWhere('calendar_type.business_id = :businessId', {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria?.isActive !== undefined) {
      queryBuilder.andWhere('calendar_type.is_active = :isActive', {
        isActive: criteria.isActive,
      });
    }

    if (criteria?.search) {
      queryBuilder.andWhere(
        '(calendar_type.name ILIKE :search OR calendar_type.description ILIKE :search)',
        { search: `%${criteria.search}%` },
      );
    }

    queryBuilder.orderBy('calendar_type.name', 'ASC');

    const ormEntities = await queryBuilder.getMany();
    return CalendarTypeOrmMapper.toDomainEntities(ormEntities);
  }

  async findByBusinessId(businessId: BusinessId): Promise<CalendarType[]> {
    const ormEntities = await this.repository.find({
      where: { business_id: businessId.getValue() },
      order: { name: 'ASC' },
    });

    return CalendarTypeOrmMapper.toDomainEntities(ormEntities);
  }

  async findByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<CalendarType | null> {
    const ormEntity = await this.repository.findOne({
      where: {
        business_id: businessId.getValue(),
        name: name,
      },
    });

    if (!ormEntity) {
      return null;
    }

    return CalendarTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async findByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<CalendarType | null> {
    const ormEntity = await this.repository.findOne({
      where: {
        business_id: businessId.getValue(),
        code: code,
      },
    });

    if (!ormEntity) {
      return null;
    }

    return CalendarTypeOrmMapper.toDomainEntity(ormEntity);
  }

  async existsByBusinessIdAndName(
    businessId: BusinessId,
    name: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        business_id: businessId.getValue(),
        name: name,
      },
    });

    return count > 0;
  }

  async existsByBusinessIdAndCode(
    businessId: BusinessId,
    code: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        business_id: businessId.getValue(),
        code: code,
      },
    });

    return count > 0;
  }

  async delete(id: CalendarTypeId): Promise<void> {
    // Soft delete - mark as inactive
    await this.repository.update({ id: id.getValue() }, { is_active: false });
  }

  async hardDelete(id: CalendarTypeId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  async countByBusinessId(businessId: BusinessId): Promise<number> {
    return await this.repository.count({
      where: { business_id: businessId.getValue() },
    });
  }

  async countActiveByBusinessId(businessId: BusinessId): Promise<number> {
    return await this.repository.count({
      where: {
        business_id: businessId.getValue(),
        is_active: true,
      },
    });
  }

  async updateSortOrders(
    updates: Array<{ id: string; sortOrder: number }>,
  ): Promise<void> {
    // Use transaction for consistency
    await this.repository.manager.transaction(
      async (transactionalEntityManager) => {
        for (const update of updates) {
          await transactionalEntityManager.update(
            CalendarTypeOrmEntity,
            { id: update.id },
            {
              settings: () =>
                `jsonb_set(settings, '{sortOrder}', '${update.sortOrder}')`,
            },
          );
        }
      },
    );
  }

  async findByBusinessIdOrderedBySortOrder(
    businessId: BusinessId,
  ): Promise<CalendarType[]> {
    const ormEntities = await this.repository.find({
      where: { business_id: businessId.getValue() },
      order: { settings: 'ASC' }, // This will need custom SQL for JSON sorting
    });

    // Sort by sortOrder from JSON settings
    const sorted = ormEntities.sort((a, b) => {
      const sortOrderA = (a.settings as any)?.sortOrder || 0;
      const sortOrderB = (b.settings as any)?.sortOrder || 0;
      return sortOrderA - sortOrderB;
    });

    return CalendarTypeOrmMapper.toDomainEntities(sorted);
  }

  async isReferencedByServices(id: CalendarTypeId): Promise<boolean> {
    // This would need to check if any services reference this calendar type
    // For now, return false - will need to implement when Service entity is updated
    return false;
  }

  async search(
    criteria: CalendarTypeSearchCriteria,
  ): Promise<CalendarTypeSearchResult> {
    const queryBuilder = this.repository.createQueryBuilder('calendar_type');

    if (criteria.businessId) {
      queryBuilder.where('calendar_type.business_id = :businessId', {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria.isActive !== undefined) {
      queryBuilder.andWhere('calendar_type.is_active = :isActive', {
        isActive: criteria.isActive,
      });
    }

    if (criteria.search) {
      queryBuilder.andWhere(
        '(calendar_type.name ILIKE :search OR calendar_type.description ILIKE :search)',
        { search: `%${criteria.search}%` },
      );
    }

    if (criteria.color) {
      queryBuilder.andWhere("settings->>'color' = :color", {
        color: criteria.color,
      });
    }

    // Sorting
    const sortBy = criteria.sortBy || 'name';
    const sortOrder = criteria.sortOrder || 'asc';
    queryBuilder.orderBy(
      `calendar_type.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    const total = await queryBuilder.getCount();

    // Pagination
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    const ormEntities = await queryBuilder.getMany();
    const data = CalendarTypeOrmMapper.toDomainEntities(ormEntities);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
