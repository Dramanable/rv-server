/**
 * 🐘 PostgreSQL Business Repository Implementation
 *
 * Implémentation SQL du port BusinessRepository avec TypeORM
 * Optimisé pour les données relationnelles et requêtes complexes
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Business, BusinessSector } from '../../../../domain/entities/business.entity';
import { BusinessRepository } from '../../../../domain/repositories/business.repository.interface';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import { BusinessOrmEntity } from '../../entities/typeorm/business.entity';
import { TypeOrmBusinessMapper } from '../../mappers/sql/typeorm-business.mapper';

@Injectable()
export class TypeOrmBusinessRepository implements BusinessRepository {
  constructor(
    @InjectRepository(BusinessOrmEntity)
    private readonly ormRepository: Repository<BusinessOrmEntity>,
    @Inject(TOKENS.LOGGER) 
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) 
    private readonly i18n: I18nService,
  ) {}

  async save(business: Business): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.business.save_attempt'), {
        businessId: business.id.getValue(),
        businessName: business.name.getValue(),
      });

      const ormEntity = TypeOrmBusinessMapper.toOrmEntity(business);
      await this.ormRepository.save(ormEntity);

      this.logger.info(this.i18n.t('operations.business.saved_successfully'), {
        businessId: business.id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.save_failed'),
        error as Error,
        { businessId: business.id.getValue() },
      );
      throw error;
    }
  }

  async findById(id: BusinessId): Promise<Business | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { id: id.getValue() },
        relations: ['owner', 'staff', 'services'], // Charge les relations
      });

      return entity ? TypeOrmBusinessMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_failed'),
        error as Error,
        { businessId: id.getValue() },
      );
      return null;
    }
  }

  async findByName(name: BusinessName): Promise<Business | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { name: name.getValue() },
        relations: ['owner', 'staff', 'services'],
      });

      return entity ? TypeOrmBusinessMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_by_name_failed'),
        error as Error,
        { businessName: name.getValue() },
      );
      return null;
    }
  }

  async delete(id: BusinessId): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.business.delete_attempt'), {
        businessId: id.getValue(),
      });

      await this.ormRepository.delete(id.getValue());

      this.logger.info(this.i18n.t('operations.business.deleted_successfully'), {
        businessId: id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.delete_failed'),
        error as Error,
        { businessId: id.getValue() },
      );
      throw error;
    }
  }

  async existsByName(name: BusinessName): Promise<boolean> {
    try {
      const count = await this.ormRepository.count({
        where: { name: name.getValue() },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.exists_check_failed'),
        error as Error,
        { businessName: name.getValue() },
      );
      return false;
    }
  }

  async findNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
  ): Promise<Business[]> {
    try {
      // Utilise la formule de Haversine pour calculer la distance
      // PostgreSQL avec extension PostGIS serait idéal ici
      const query = this.ormRepository
        .createQueryBuilder('business')
        .leftJoinAndSelect('business.owner', 'owner')
        .leftJoinAndSelect('business.staff', 'staff')
        .leftJoinAndSelect('business.services', 'services')
        .where(
          `(
            6371 * acos(
              cos(radians(:latitude)) * 
              cos(radians(business.latitude)) * 
              cos(radians(business.longitude) - radians(:longitude)) + 
              sin(radians(:latitude)) * 
              sin(radians(business.latitude))
            )
          ) <= :radiusKm`,
          { latitude, longitude, radiusKm },
        )
        .orderBy(
          `(
            6371 * acos(
              cos(radians(:latitude)) * 
              cos(radians(business.latitude)) * 
              cos(radians(business.longitude) - radians(:longitude)) + 
              sin(radians(:latitude)) * 
              sin(radians(business.latitude))
            )
          )`,
          'ASC',
        );

      if (limit) {
        query.limit(limit);
      }

      const entities = await query.getMany();
      return entities.map((entity) => TypeOrmBusinessMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.location_search_failed'),
        error as Error,
        { latitude, longitude, radiusKm, limit },
      );
      return [];
    }
  }

  async getStatistics(businessId: BusinessId): Promise<{
    totalAppointments: number;
    totalClients: number;
    totalStaff: number;
    totalServices: number;
    revenue: number;
  }> {
    try {
      // Utilise des requêtes SQL optimisées pour les statistiques
      const businessIdValue = businessId.getValue();

      // Requête pour compter les rendez-vous
      const appointmentsCount = await this.ormRepository.query(
        `SELECT COUNT(*) as count FROM appointments WHERE business_id = $1`,
        [businessIdValue],
      );

      // Requête pour compter les clients uniques
      const clientsCount = await this.ormRepository.query(
        `SELECT COUNT(DISTINCT client_email) as count FROM appointments WHERE business_id = $1`,
        [businessIdValue],
      );

      // Requête pour compter le staff
      const staffCount = await this.ormRepository.query(
        `SELECT COUNT(*) as count FROM staff WHERE business_id = $1`,
        [businessIdValue],
      );

      // Requête pour compter les services
      const servicesCount = await this.ormRepository.query(
        `SELECT COUNT(*) as count FROM services WHERE business_id = $1`,
        [businessIdValue],
      );

      // Requête pour calculer le chiffre d'affaires
      const revenueResult = await this.ormRepository.query(
        `SELECT COALESCE(SUM(s.price), 0) as revenue 
         FROM appointments a 
         JOIN services s ON a.service_id = s.id 
         WHERE a.business_id = $1 AND a.status = 'COMPLETED'`,
        [businessIdValue],
      );

      return {
        totalAppointments: parseInt(appointmentsCount[0]?.count || '0'),
        totalClients: parseInt(clientsCount[0]?.count || '0'),
        totalStaff: parseInt(staffCount[0]?.count || '0'),
        totalServices: parseInt(servicesCount[0]?.count || '0'),
        revenue: parseFloat(revenueResult[0]?.revenue || '0'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.statistics_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return {
        totalAppointments: 0,
        totalClients: 0,
        totalStaff: 0,
        totalServices: 0,
        revenue: 0,
      };
    }
  }

  async findBySector(sector: BusinessSector): Promise<Business[]> {
    try {
      const entities = await this.ormRepository.find({
        where: { sector },
        relations: ['owner', 'staff', 'services'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmBusinessMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_by_sector_failed'),
        error as Error,
        { sector },
      );
      return [];
    }
  }

  async search(criteria: {
    name?: string;
    sector?: string;
    city?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    businesses: Business[];
    total: number;
  }> {
    try {
      const queryBuilder = this.buildSearchQuery(criteria);

      // Requête pour le total (sans pagination)
      const total = await queryBuilder.getCount();

      // Requête pour les données (avec pagination)
      if (criteria.offset) {
        queryBuilder.offset(criteria.offset);
      }
      if (criteria.limit) {
        queryBuilder.limit(criteria.limit);
      }

      const entities = await queryBuilder.getMany();
      const businesses = entities.map((entity) =>
        TypeOrmBusinessMapper.toDomainEntity(entity),
      );

      return { businesses, total };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.search_failed'),
        error as Error,
        { criteria },
      );
      return { businesses: [], total: 0 };
    }
  }

  /**
   * 🔧 Construction de la requête de recherche TypeORM
   * Optimisée avec des index et jointures appropriées
   */
  private buildSearchQuery(criteria: {
    name?: string;
    sector?: string;
    city?: string;
    isActive?: boolean;
  }): SelectQueryBuilder<BusinessOrmEntity> {
    const query = this.ormRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.owner', 'owner')
      .leftJoinAndSelect('business.staff', 'staff')
      .leftJoinAndSelect('business.services', 'services');

    // Filtre par nom (recherche partielle insensible à la casse)
    if (criteria.name) {
      query.andWhere('LOWER(business.name) ILIKE LOWER(:name)', {
        name: `%${criteria.name}%`,
      });
    }

    // Filtre par secteur
    if (criteria.sector) {
      query.andWhere('business.sector = :sector', {
        sector: criteria.sector as BusinessSector,
      });
    }

    // Filtre par ville (suppose une colonne city ou une relation address)
    if (criteria.city) {
      query.andWhere('LOWER(business.city) ILIKE LOWER(:city)', {
        city: `%${criteria.city}%`,
      });
    }

    // Filtre par statut actif
    if (criteria.isActive !== undefined) {
      query.andWhere('business.isActive = :isActive', {
        isActive: criteria.isActive,
      });
    }

    // Tri par défaut
    query.orderBy('business.createdAt', 'DESC');

    return query;
  }

  /**
   * 🚀 Création des index optimaux pour PostgreSQL
   * À appeler lors de l'initialisation ou migration
   */
  async createOptimalIndexes(): Promise<void> {
    try {
      this.logger.info('Creating optimal PostgreSQL indexes for businesses table');

      // Index composé pour recherche fréquente
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_business_sector_active_created 
        ON businesses (sector, is_active, created_at DESC)
      `);

      // Index pour recherche géospatiale (latitude/longitude)
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_business_location 
        ON businesses (latitude, longitude)
      `);

      // Index pour recherche textuelle sur le nom
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_business_name_gin 
        ON businesses USING gin (to_tsvector('french', name))
      `);

      // Index pour la ville
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_business_city 
        ON businesses (city)
      `);

      this.logger.info('PostgreSQL indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create PostgreSQL indexes', error as Error);
    }
  }
}
