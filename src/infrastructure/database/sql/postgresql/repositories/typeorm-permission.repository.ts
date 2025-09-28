import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPermissionRepository } from '@domain/repositories/permission.repository';
import { Permission } from '@domain/entities/permission.entity';
import { PermissionOrmEntity } from '@infrastructure/database/sql/postgresql/entities/permission-orm.entity';
import { PermissionOrmMapper } from '@infrastructure/mappers/permission-orm.mapper';

/**
 * TypeORM Permission Repository Implementation
 * Clean Architecture - Infrastructure Layer - Repository Implementation
 */
@Injectable()
export class TypeOrmPermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly repository: Repository<PermissionOrmEntity>,
  ) {}

  /**
   * Saves a permission (create or update)
   */
  async save(permission: Permission): Promise<Permission> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = PermissionOrmMapper.toOrmEntity(permission);

    // 2. Persistence en base
    const savedOrm = await this.repository.save(ormEntity);

    // 3. Conversion ORM → Domain via Mapper
    return PermissionOrmMapper.toDomainEntity(savedOrm);
  }

  /**
   * Finds a permission by ID
   */
  async findById(id: string): Promise<Permission | null> {
    // 1. Requête ORM
    const ormEntity = await this.repository.findOne({
      where: { id },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return PermissionOrmMapper.toDomainEntity(ormEntity);
  }

  /**
   * Finds a permission by name
   */
  async findByName(name: string): Promise<Permission | null> {
    // 1. Requête ORM
    const ormEntity = await this.repository.findOne({
      where: { name },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return PermissionOrmMapper.toDomainEntity(ormEntity);
  }

  /**
   * Finds all permissions with optional filters, pagination, and sorting
   */
  async findAll(
    filters?: {
      search?: string;
      category?: string;
      isActive?: boolean;
      isSystemPermission?: boolean;
    },
    options?: {
      offset?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<Permission[]> {
    // 1. Construire les critères de recherche
    const queryBuilder = this.repository.createQueryBuilder('permission');

    if (filters?.search) {
      queryBuilder.andWhere(
        '(permission.name ILIKE :search OR permission.display_name ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.category !== undefined) {
      queryBuilder.andWhere('permission.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('permission.is_active = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isSystemPermission !== undefined) {
      queryBuilder.andWhere(
        'permission.is_system_permission = :isSystemPermission',
        { isSystemPermission: filters.isSystemPermission },
      );
    }

    // 2. Tri
    const sortField = options?.sortBy || 'created_at';
    const sortDirection =
      (options?.sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    // Mapper les noms de champs pour l'ORM
    const fieldMapping: { [key: string]: string } = {
      name: 'permission.name',
      displayName: 'permission.display_name',
      category: 'permission.category',
      createdAt: 'permission.created_at',
    };

    const ormField = fieldMapping[sortField] || 'permission.created_at';
    queryBuilder.orderBy(ormField, sortDirection);

    // 3. Pagination
    if (options?.offset !== undefined) {
      queryBuilder.offset(options.offset);
    }

    if (options?.limit !== undefined) {
      queryBuilder.limit(options.limit);
    }

    // 4. Exécution de la requête
    const ormEntities = await queryBuilder.getMany();

    // 5. Conversion vers Domain
    return PermissionOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * Finds permissions by category
   */
  async findByCategory(category: string): Promise<Permission[]> {
    // 1. Requête ORM filtrée par catégorie
    const ormEntities = await this.repository.find({
      where: { category },
      order: { name: 'ASC' },
    });

    // 2. Conversion batch via Mapper
    return PermissionOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * Checks if a permission exists by name
   */
  async existsByName(name: string): Promise<boolean> {
    // 1. Requête d'existence optimisée
    const count = await this.repository.count({
      where: { name },
    });

    return count > 0;
  }

  /**
   * Deletes a permission by ID (only if not system permission)
   */
  async delete(id: string): Promise<void> {
    // 1. Vérifier que ce n'est pas une permission système
    const permission = await this.findById(id);

    if (!permission) {
      return; // Permission déjà supprimée ou n'existe pas
    }

    if (permission.isSystemPermission()) {
      throw new Error(
        `Cannot delete system permission: ${permission.getName()}`,
      );
    }

    // 2. Supprimer de la base
    await this.repository.delete(id);
  }

  /**
   * Counts total permissions with optional filters
   */
  async count(filters?: {
    search?: string;
    category?: string;
    isActive?: boolean;
    isSystemPermission?: boolean;
  }): Promise<number> {
    // 1. Construire les critères de comptage avec QueryBuilder
    const queryBuilder = this.repository.createQueryBuilder('permission');

    if (filters?.search) {
      queryBuilder.andWhere(
        '(permission.name ILIKE :search OR permission.display_name ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.category !== undefined) {
      queryBuilder.andWhere('permission.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('permission.is_active = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isSystemPermission !== undefined) {
      queryBuilder.andWhere(
        'permission.is_system_permission = :isSystemPermission',
        { isSystemPermission: filters.isSystemPermission },
      );
    }

    // 2. Compter avec les critères
    return queryBuilder.getCount();
  }
}
