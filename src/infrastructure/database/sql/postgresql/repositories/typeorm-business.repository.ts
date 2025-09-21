/**
 * 🏢 Business TypeORM Repository - Infrastructure Layer
 *
 * Implémentation concrète du repository Business avec TypeORM
 * Couche Infrastructure - Persistence des données
 *
 * ✅ Implémente l'interface domain BusinessRepository
 * ✅ Conversion entité ORM ↔ entité Domain
 * ✅ Gestion des erreurs et logging
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../../../../domain/entities/business.entity';
import { BusinessRepository } from '../../../../../domain/repositories/business.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../../domain/value-objects/business-name.value-object';
import { BusinessOrmEntity } from '../entities/business-orm.entity';
import { BusinessMapper } from '../../../../mappers/domain-mappers';

@Injectable()
export class TypeOrmBusinessRepository implements BusinessRepository {
  constructor(
    @InjectRepository(BusinessOrmEntity)
    private readonly ormRepository: Repository<BusinessOrmEntity>,
  ) {}

  async findById(id: BusinessId): Promise<Business | null> {
    try {
      const businessId = id.getValue();
      const ormEntity = await this.ormRepository.findOne({
        where: { id: businessId },
      });

      return ormEntity ? BusinessMapper.fromTypeOrmEntity(ormEntity) : null;
    } catch (error) {
      throw new Error(
        `Failed to find business by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findByName(name: BusinessName): Promise<Business | null> {
    try {
      const businessName = name.getValue();
      const ormEntity = await this.ormRepository.findOne({
        where: { name: businessName },
      });

      return ormEntity ? BusinessMapper.fromTypeOrmEntity(ormEntity) : null;
    } catch (error) {
      throw new Error(
        `Failed to find business by name: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findBySector(sector: string): Promise<Business[]> {
    try {
      const ormEntities = await this.ormRepository.find({
        where: { sector },
      });

      return ormEntities.map((entity) =>
        BusinessMapper.fromTypeOrmEntity(entity),
      );
    } catch (error) {
      throw new Error(
        `Failed to find businesses by sector: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
      const queryBuilder = this.ormRepository.createQueryBuilder('business');

      // Apply filters
      if (criteria.name) {
        queryBuilder.andWhere('business.name ILIKE :name', {
          name: `%${criteria.name}%`,
        });
      }

      if (criteria.sector) {
        queryBuilder.andWhere('business.sector = :sector', {
          sector: criteria.sector,
        });
      }

      if (criteria.city) {
        queryBuilder.andWhere("business.address ->> 'city' = :city", {
          city: criteria.city,
        });
      }

      if (criteria.isActive !== undefined) {
        const status = criteria.isActive ? 'ACTIVE' : 'INACTIVE';
        queryBuilder.andWhere('business.status = :status', { status });
      }

      // Count total
      const total = await queryBuilder.getCount();

      // Apply pagination
      if (criteria.limit) {
        queryBuilder.limit(criteria.limit);
      }

      if (criteria.offset) {
        queryBuilder.offset(criteria.offset);
      }

      // Order by creation date
      queryBuilder.orderBy('business.created_at', 'DESC');

      const ormEntities = await queryBuilder.getMany();
      const businesses = ormEntities.map((entity) =>
        BusinessMapper.fromTypeOrmEntity(entity),
      );

      return { businesses, total };
    } catch (error) {
      throw new Error(
        `Failed to search businesses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async save(business: Business): Promise<void> {
    try {
      // Convertir l'entité domain vers ORM
      const ormEntity = BusinessMapper.toTypeOrmEntity(business);

      // Sauvegarder dans la base
      await this.ormRepository.save(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to save business: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: BusinessId): Promise<void> {
    try {
      const businessId = id.getValue();
      const result = await this.ormRepository.delete(businessId);

      if (result.affected === 0) {
        throw new Error(`Business with id ${businessId} not found`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete business: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async existsByName(name: BusinessName): Promise<boolean> {
    try {
      const businessName = name.getValue();
      const count = await this.ormRepository.count({
        where: { name: businessName },
      });

      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check business name existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
  ): Promise<Business[]> {
    try {
      // Requête SQL avec calcul de distance géographique
      const queryBuilder = this.ormRepository.createQueryBuilder('business');

      queryBuilder.andWhere(
        `
        ST_DWithin(
          ST_SetSRID(ST_MakePoint(CAST(business.address ->> 'longitude' AS FLOAT), CAST(business.address ->> 'latitude' AS FLOAT)), 4326),
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
          :radius
        )
      `,
        { latitude, longitude, radius: radiusKm * 1000 },
      ); // Conversion km -> mètres

      queryBuilder.orderBy(
        `
        ST_Distance(
          ST_SetSRID(ST_MakePoint(CAST(business.address ->> 'longitude' AS FLOAT), CAST(business.address ->> 'latitude' AS FLOAT)), 4326),
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )
      `,
        'ASC',
      );

      if (limit) {
        queryBuilder.limit(limit);
      }

      const ormEntities = await queryBuilder.getMany();
      return ormEntities.map((entity) =>
        BusinessMapper.fromTypeOrmEntity(entity),
      );
    } catch (error) {
      // Fallback si PostGIS n'est pas disponible - utilisation d'une formule simple
      const ormEntities = await this.ormRepository.find();
      const businesses = ormEntities.map((entity) =>
        BusinessMapper.fromTypeOrmEntity(entity),
      );

      return businesses
        .filter((business) => {
          const addr = business.address;
          if (!addr.getCoordinates()) return false;

          const distance = this.haversineDistance(
            latitude,
            longitude,
            addr.getCoordinates()!.latitude,
            addr.getCoordinates()!.longitude,
          );

          return distance <= radiusKm;
        })
        .slice(0, limit);
    }
  }

  async getStatistics(_businessId: BusinessId): Promise<{
    totalAppointments: number;
    totalClients: number;
    totalStaff: number;
    totalServices: number;
    revenue: number;
  }> {
    try {
      // Pour l'instant, retourner des statistiques par défaut
      // À implémenter quand les entités Appointment, Client, Staff, Service seront créées
      return {
        totalAppointments: 0,
        totalClients: 0,
        totalStaff: 0,
        totalServices: 0,
        revenue: 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get business statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Calcul de distance haversine (fallback sans PostGIS)
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
