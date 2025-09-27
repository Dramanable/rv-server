/**
 * 🗄️ TypeORM Service Repository - Infrastructure Layer
 *
 * Implémentation concrète du ServiceRepository avec TypeORM
 * Couche Infrastructure - Persistance des données
 *
 * ✅ CLEAN ARCHITECTURE COMPLIANCE:
 * - Implémente l'interface domain ServiceRepository
 * - Utilise l'entité ORM pour la persistance
 * - Convertit entre entités Domain et ORM
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Service,
  ServiceStatus,
} from '../../../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../../../domain/repositories/service.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { ServiceId } from '../../../../../domain/value-objects/service-id.value-object';
import { UserId } from '../../../../../domain/value-objects/user-id.value-object';
import { ServiceMapper } from '../../../../mappers/domain-mappers';
import { ServiceOrmEntity } from '../entities/service-orm.entity';

@Injectable()
export class TypeOrmServiceRepository implements ServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly repository: Repository<ServiceOrmEntity>,
  ) {}

  async findById(id: ServiceId): Promise<Service | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    return ormEntity ? ServiceMapper.fromTypeOrmEntity(ormEntity) : null;
  }

  async findByBusinessId(businessId: BusinessId): Promise<Service[]> {
    const ormEntities = await this.repository.find({
      where: { business_id: businessId.getValue() },
      order: { created_at: 'DESC' },
    });

    return ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );
  }

  async findActiveByBusinessId(businessId: BusinessId): Promise<Service[]> {
    const ormEntities = await this.repository.find({
      where: {
        business_id: businessId.getValue(),
        status: ServiceStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });

    return ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );
  }

  async findByCategory(
    businessId: BusinessId,
    category: string,
  ): Promise<Service[]> {
    const ormEntities = await this.repository.find({
      where: {
        business_id: businessId.getValue(),
        category,
      },
      order: { name: 'ASC' },
    });

    return ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );
  }

  async findByStaffId(staffId: UserId): Promise<Service[]> {
    const qb = this.repository
      .createQueryBuilder('service')
      .where('service.assigned_staff_ids @> :staffIds', {
        staffIds: JSON.stringify([staffId.getValue()]),
      });

    const ormEntities = await qb.orderBy('service.name', 'ASC').getMany();

    return ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );
  }

  async search(criteria: {
    businessId?: BusinessId;
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    isActive?: boolean;
    allowOnlineBooking?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ services: Service[]; total: number }> {
    const qb = this.repository.createQueryBuilder('service');

    if (criteria.businessId) {
      qb.andWhere('service.business_id = :businessId', {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria.name) {
      qb.andWhere('LOWER(service.name) LIKE LOWER(:name)', {
        name: `%${criteria.name}%`,
      });
    }

    if (criteria.isActive !== undefined) {
      qb.andWhere('service.status = :status', {
        status: criteria.isActive
          ? ServiceStatus.ACTIVE
          : ServiceStatus.INACTIVE,
      });
    }

    if (criteria.allowOnlineBooking !== undefined) {
      qb.andWhere(
        "service.scheduling->>'allow_online_booking' = :allowBooking",
        {
          allowBooking: criteria.allowOnlineBooking ? 'true' : 'false',
        },
      );
    }

    if (criteria.duration) {
      qb.andWhere("(service.scheduling->>'duration')::integer = :duration", {
        duration: criteria.duration,
      });
    }

    if (criteria.minPrice || criteria.maxPrice) {
      if (criteria.minPrice) {
        qb.andWhere(
          "(service.pricing->'base_price'->>'amount')::numeric >= :minPrice",
          {
            minPrice: criteria.minPrice,
          },
        );
      }
      if (criteria.maxPrice) {
        qb.andWhere(
          "(service.pricing->'base_price'->>'amount')::numeric <= :maxPrice",
          {
            maxPrice: criteria.maxPrice,
          },
        );
      }
    }

    const total = await qb.getCount();

    if (criteria.limit) {
      qb.limit(criteria.limit);
    }
    if (criteria.offset) {
      qb.offset(criteria.offset);
    }

    qb.orderBy('service.name', 'ASC');

    const ormEntities = await qb.getMany();
    const services = ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );

    return { services, total };
  }

  async save(service: Service): Promise<void> {
    const ormEntity = ServiceMapper.toTypeOrmEntity(service);
    await this.repository.save(ormEntity);
  }

  async delete(id: ServiceId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  async findByName(
    businessId: BusinessId,
    name: string,
  ): Promise<Service | null> {
    const entity = await this.repository.findOne({
      where: {
        business_id: businessId.toString(),
        name,
      },
    });

    return entity ? ServiceMapper.fromTypeOrmEntity(entity) : null;
  }

  async existsByName(
    businessId: BusinessId,
    name: string,
    excludeId?: ServiceId,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('service')
      .where('service.businessId = :businessId', {
        businessId: businessId.toString(),
      })
      .andWhere('service.name = :name', { name });

    if (excludeId) {
      queryBuilder.andWhere('service.id != :excludeId', {
        excludeId: excludeId.toString(),
      });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findPopularServices(
    businessId: BusinessId,
    limit = 10,
  ): Promise<Service[]> {
    // Pour l'instant, on retourne les services actifs les plus récents
    // Dans une implémentation future, on pourrait intégrer les statistiques de réservation
    const ormEntities = await this.repository.find({
      where: {
        business_id: businessId.getValue(),
        status: ServiceStatus.ACTIVE,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return ormEntities.map((entity: ServiceOrmEntity) =>
      ServiceMapper.fromTypeOrmEntity(entity),
    );
  }

  async getServiceStatistics(_serviceId: ServiceId): Promise<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    totalRevenue: number;
  }> {
    // Implémentation placeholder - nécessitera l'intégration avec le système de réservations
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      averageRating: 0,
      totalRevenue: 0,
    };
  }

  async getBusinessServiceStatistics(businessId: BusinessId): Promise<{
    totalServices: number;
    activeServices: number;
    averagePrice: number;
    averageDuration: number;
  }> {
    const totalServices = await this.repository.count({
      where: { business_id: businessId.getValue() },
    });

    const activeServices = await this.repository.count({
      where: {
        business_id: businessId.getValue(),
        status: ServiceStatus.ACTIVE,
      },
    });

    // Prix moyen
    const avgPriceResult = await this.repository
      .createQueryBuilder('service')
      .select(
        "AVG((service.pricing->'base_price'->>'amount')::numeric)",
        'avgPrice',
      )
      .where('service.business_id = :businessId', {
        businessId: businessId.getValue(),
      })
      .getRawOne();

    // Durée moyenne
    const avgDurationResult = await this.repository
      .createQueryBuilder('service')
      .select("AVG((service.scheduling->>'duration')::integer)", 'avgDuration')
      .where('service.business_id = :businessId', {
        businessId: businessId.getValue(),
      })
      .getRawOne();

    return {
      totalServices,
      activeServices,
      averagePrice: parseFloat(avgPriceResult?.avgPrice || '0'),
      averageDuration: parseFloat(avgDurationResult?.avgDuration || '0'),
    };
  }
}
