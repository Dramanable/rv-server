import { Professional } from '@domain/entities/professional.entity';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';
import { ProfessionalOrmEntity } from '@infrastructure/database/sql/postgresql/entities/professional-orm.entity';
import { ProfessionalOrmMapper } from '@infrastructure/mappers/professional-orm.mapper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * 🗄️ PROFESSIONAL REPOSITORY IMPLEMENTATION - Infrastructure Layer
 *
 * ⚠️ Implementation TypeORM du repository Professional
 * ⚠️ Aucune logique métier - uniquement persistance et conversion ORM
 */
@Injectable()
export class TypeOrmProfessionalRepository implements IProfessionalRepository {
  constructor(
    @InjectRepository(ProfessionalOrmEntity)
    private readonly repository: Repository<ProfessionalOrmEntity>,
  ) {}

  async save(professional: Professional): Promise<Professional> {
    const ormEntity = ProfessionalOrmMapper.toOrmEntity(professional);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return ProfessionalOrmMapper.toDomainEntity(savedOrmEntity);
  }

  async findById(id: ProfessionalId): Promise<Professional | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) {
      return null;
    }

    return ProfessionalOrmMapper.toDomainEntity(ormEntity);
  }

  async findByEmail(email: Email): Promise<Professional | null> {
    const ormEntity = await this.repository.findOne({
      where: { email: email.getValue() },
    });

    if (!ormEntity) {
      return null;
    }

    return ProfessionalOrmMapper.toDomainEntity(ormEntity);
  }

  /**
   * Recherche un professionnel par numéro de licence
   */
  async findByLicenseNumber(
    licenseNumber: string,
  ): Promise<Professional | null> {
    // Note: licenseNumber n'est pas dans le schéma ORM actuel, retourner null
    return null;
  }

  /**
   * Recherche tous les professionnels d'une entreprise
   */
  async findAll(businessId: BusinessId): Promise<Professional[]> {
    const ormEntities = await this.repository.find({
      where: { business_id: businessId.getValue() },
      order: { created_at: 'DESC' },
    });

    return ProfessionalOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * Recherche des professionnels avec filtres et pagination
   */
  async findByBusinessId(
    businessId: string,
    options: {
      search?: string;
      filters: {
        isActive?: boolean;
        specialization?: string;
      };
      pagination: {
        page: number;
        limit: number;
      };
      sorting: {
        sortBy: string;
        sortOrder: 'asc' | 'desc';
      };
    },
  ): Promise<{ professionals: Professional[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('professional')
      .where('professional.business_id = :businessId', { businessId });

    // Filtres
    if (options.filters.isActive !== undefined) {
      queryBuilder.andWhere('professional.is_active = :isActive', {
        isActive: options.filters.isActive,
      });
    }

    if (options.filters.specialization) {
      queryBuilder.andWhere(
        'professional.specialization ILIKE :specialization',
        {
          specialization: `%${options.filters.specialization}%`,
        },
      );
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(professional.first_name ILIKE :search OR professional.last_name ILIKE :search OR professional.email ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Tri
    const sortBy = options.sorting.sortBy || 'created_at';
    const sortOrder = options.sorting.sortOrder || 'desc';
    queryBuilder.orderBy(
      `professional.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Pagination
    const { page, limit } = options.pagination;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Exécuter la requête
    const [ormEntities, total] = await queryBuilder.getManyAndCount();
    const professionals = ProfessionalOrmMapper.toDomainEntities(ormEntities);

    return { professionals, total };
  }

  /**
   * Supprime un professionnel par ID
   */
  async deleteById(id: ProfessionalId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  /**
   * Vérifie si un professionnel existe par ID
   */
  async existsById(id: ProfessionalId): Promise<boolean> {
    const count = await this.repository.count({
      where: { id: id.getValue() },
    });
    return count > 0;
  }

  /**
   * Vérifie si un professionnel existe par email
   */
  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  /**
   * Vérifie si un professionnel existe par numéro de licence
   */
  async existsByLicenseNumber(licenseNumber: string): Promise<boolean> {
    // Note: licenseNumber n'est pas dans le schéma ORM actuel, retourner false
    return false;
  }
}
