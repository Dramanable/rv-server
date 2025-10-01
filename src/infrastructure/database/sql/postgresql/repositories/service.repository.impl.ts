/**
 * 🗄️ SERVICE REPOSITORY IMPLEMENTATION - Infrastructure Layer
 *
 * Implémentation TypeORM du ServiceRepository
 * Respecte les principes Clean Architecture
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Service } from '../../../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../../../domain/repositories/service.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { ServiceId } from '../../../../../domain/value-objects/service-id.value-object';
import { UserId } from '../../../../../domain/value-objects/user-id.value-object';
import { ServiceMapper } from '../../../../mappers/service.mapper';
import { ServiceOrmEntity } from '../entities/service-orm.entity';

export interface ServiceSearchCriteria {
  businessId: BusinessId;
  name?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  allowOnlineBooking?: boolean;
  limit: number;
  offset: number;
}

export interface ServiceSearchResult {
  services: Service[];
  total: number;
}

@Injectable()
export class ServiceRepositoryImpl implements ServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly ormRepository: Repository<ServiceOrmEntity>,
  ) {}

  /**
   * Trouve un service par son ID
   */
  async findById(id: ServiceId): Promise<Service | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.getValue() },
      relations: [], // Relations à définir selon les besoins
    });

    if (!ormEntity) {
      return null;
    }

    return ServiceMapper.toDomain(ormEntity);
  }

  /**
   * Trouve un service par nom dans un business
   */
  async findByName(
    businessId: BusinessId,
    name: string,
  ): Promise<Service | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: {
        business_id: businessId.getValue(),
        name: name,
      },
      relations: [],
    });

    if (!ormEntity) {
      return null;
    }

    return ServiceMapper.toDomain(ormEntity);
  }

  /**
   * Sauvegarde un service (création ou mise à jour)
   */
  async save(service: Service): Promise<void> {
    // Vérifier si le service existe déjà
    const existingEntity = await this.ormRepository.findOne({
      where: { id: service.id.getValue() },
    });

    let ormEntity: ServiceOrmEntity;

    if (existingEntity) {
      // Mise à jour
      ormEntity = ServiceMapper.updateOrm(existingEntity, service);
    } else {
      // Création
      ormEntity = ServiceMapper.toOrm(service);
    }

    await this.ormRepository.save(ormEntity);
  }

  /**
   * Supprime un service
   */
  async delete(id: ServiceId): Promise<void> {
    await this.ormRepository.delete({
      id: id.getValue(),
    });
  }

  /**
   * Trouve les services par business ID avec pagination
   */
  async findByBusinessId(
    businessId: BusinessId,
    page: number = 1,
    limit: number = 10,
  ): Promise<Service[]> {
    const offset = (page - 1) * limit;

    const ormEntities = await this.ormRepository
      .createQueryBuilder('service')
      .where('service.business_id = :businessId', {
        businessId: businessId.getValue(),
      })
      .orderBy('service.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return ormEntities.map((entity) => ServiceMapper.toDomain(entity));
  }

  /**
   * Recherche avancée de services avec filtres
   */
  async search(criteria: ServiceSearchCriteria): Promise<ServiceSearchResult> {
    const queryBuilder = this.ormRepository.createQueryBuilder('service');

    // Filtre principal : business ID
    queryBuilder.where('service.business_id = :businessId', {
      businessId: criteria.businessId.getValue(),
    });

    // Filtre par nom (recherche partielle)
    if (criteria.name) {
      queryBuilder.andWhere('service.name ILIKE :name', {
        name: `%${criteria.name}%`,
      });
    }

    // Filtre par statut actif
    if (criteria.isActive !== undefined) {
      const statusValue = criteria.isActive ? 'ACTIVE' : 'INACTIVE';
      queryBuilder.andWhere('service.status = :status', {
        status: statusValue,
      });
    }

    // Filtre par prix minimum
    if (criteria.minPrice !== undefined) {
      queryBuilder.andWhere('service.base_price >= :minPrice', {
        minPrice: criteria.minPrice,
      });
    }

    // Filtre par prix maximum
    if (criteria.maxPrice !== undefined) {
      queryBuilder.andWhere('service.base_price <= :maxPrice', {
        maxPrice: criteria.maxPrice,
      });
    }

    // Filtre par durée
    if (criteria.duration !== undefined) {
      queryBuilder.andWhere('service.duration = :duration', {
        duration: criteria.duration,
      });
    }

    // Filtre par réservation en ligne
    if (criteria.allowOnlineBooking !== undefined) {
      queryBuilder.andWhere(
        'service.allow_online_booking = :allowOnlineBooking',
        {
          allowOnlineBooking: criteria.allowOnlineBooking,
        },
      );
    }

    // Tri par défaut
    queryBuilder.orderBy('service.created_at', 'DESC');

    // Pagination
    queryBuilder.skip(criteria.offset).take(criteria.limit);

    // Exécution avec count
    const [ormEntities, total] = await queryBuilder.getManyAndCount();

    // Conversion en entités Domain
    const services = ormEntities.map((entity) =>
      ServiceMapper.toDomain(entity),
    );

    return {
      services,
      total,
    };
  }

  /**
   * Trouve les services actifs par business ID
   */
  async findActiveByBusinessId(businessId: BusinessId): Promise<Service[]> {
    const ormEntities = await this.ormRepository.find({
      where: {
        business_id: businessId.getValue(),
        status: 'ACTIVE',
      },
      order: {
        created_at: 'DESC',
      },
    });

    return ormEntities.map((entity) => ServiceMapper.toDomain(entity));
  }

  /**
   * Vérifie si un service avec ce nom existe déjà dans le business
   */
  async existsByName(businessId: BusinessId, name: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: {
        business_id: businessId.getValue(),
        name: name,
      },
    });

    return count > 0;
  }

  /**
   * Find services by category
   */
  async findByCategory(
    businessId: BusinessId,
    _category: string,
  ): Promise<Service[]> {
    // TODO: Implement when category support is added
    const entities = await this.ormRepository.find({
      where: {
        business_id: businessId.getValue(),
        status: 'ACTIVE',
      },
    });
    return entities.map((entity) => ServiceMapper.toDomain(entity));
  }

  /**
   * Find services assigned to a staff member
   */
  async findByStaffId(_staffId: UserId): Promise<Service[]> {
    // TODO: Implement when staff assignment support is added
    const entities = await this.ormRepository.find({
      where: { status: 'ACTIVE' },
    });
    return entities.map((entity) => ServiceMapper.toDomain(entity));
  }

  /**
   * Get popular services for a business
   */
  async findPopularServices(
    businessId: BusinessId,
    limit: number = 10,
  ): Promise<Service[]> {
    // TODO: Implement based on booking statistics
    const entities = await this.ormRepository.find({
      where: {
        business_id: businessId.getValue(),
        status: 'ACTIVE',
      },
      take: limit,
      order: { created_at: 'DESC' },
    });
    return entities.map((entity) => ServiceMapper.toDomain(entity));
  }

  /**
   * Get service statistics
   */
  async getServiceStatistics(_serviceId: ServiceId): Promise<{
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    totalRevenue: number;
  }> {
    // TODO: Implement based on appointment data
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      averageRating: 0,
      totalRevenue: 0,
    };
  }

  /**
   * Get business service statistics
   */
  async getBusinessServiceStatistics(businessId: BusinessId): Promise<{
    totalServices: number;
    activeServices: number;
    averagePrice: number;
    averageDuration: number;
  }> {
    const services = await this.findByBusinessId(businessId);
    const activeServices = services.filter(
      (s) => s.status.toString() === 'ACTIVE',
    );

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      averagePrice: 0, // TODO: Calculate from pricing data
      averageDuration: 0, // TODO: Calculate from scheduling data
    };
  }
}
