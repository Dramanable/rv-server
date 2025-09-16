/**
 * 🐘 PostgreSQL User Repository Implementation
 *
 * Implémentation SQL du port UserRepository avec TypeORM
 * Optimisé pour les données relationnelles et requêtes complexes
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository.interface';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../../../shared/types/pagination.types';
import { UserQueryParams } from '../../../../shared/types/user-query.types';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
// Direct import without file extension for Node.js 24 + TypeScript
import { UserOrmEntity } from '../../entities/typeorm/user-orm.entity';
import { TypeOrmUserMapper } from '../../mappers/sql/typeorm-user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @Inject(TOKENS.LOGGER) 
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) 
    private readonly i18n: I18nService,
  ) {}

  async save(user: User): Promise<User> {
    try {
      this.logger.info(this.i18n.t('operations.user.save_attempt'), {
        userId: user.id,
        userEmail: user.email.value,
      });

      const ormEntity = TypeOrmUserMapper.toOrmEntity(user);
      const savedEntity = await this.ormRepository.save(ormEntity);

      this.logger.info(this.i18n.t('operations.user.saved_successfully'), {
        userId: savedEntity.id,
      });

      return TypeOrmUserMapper.toDomainEntity(savedEntity);
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.save_failed'),
        error as Error,
        { userId: user.id },
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { id },
      });

      return entity ? TypeOrmUserMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_failed'),
        error as Error,
        { userId: id },
      );
      return null;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { email: email.value },
      });

      return entity ? TypeOrmUserMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_by_email_failed'),
        error as Error,
        { email: email.value },
      );
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { username },
      });

      return entity ? TypeOrmUserMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_by_username_failed'),
        error as Error,
        { username },
      );
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.user.delete_attempt'), {
        userId: id,
      });

      await this.ormRepository.delete(id);

      this.logger.info(this.i18n.t('operations.user.deleted_successfully'), {
        userId: id,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.delete_failed'),
        error as Error,
        { userId: id },
      );
      throw error;
    }
  }

  async findAll(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    try {
      const query = this.buildQuery(params);
      const [entities, total] = await query.getManyAndCount();
      const users = entities.map(entity => TypeOrmUserMapper.toDomainEntity(entity));

      return {
        data: users,
        meta: {
          currentPage: params?.page || 1,
          totalPages: Math.ceil(total / (params?.limit || 10)),
          totalItems: total,
          itemsPerPage: params?.limit || 10,
          hasNextPage: (params?.page || 1) < Math.ceil(total / (params?.limit || 10)),
          hasPreviousPage: (params?.page || 1) > 1,
          nextPage: (params?.page || 1) < Math.ceil(total / (params?.limit || 10)) ? (params?.page || 1) + 1 : undefined,
          previousPage: (params?.page || 1) > 1 ? (params?.page || 1) - 1 : undefined
        }
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_all_failed'),
        error as Error,
        { params },
      );
      return { 
        data: [], 
        meta: { 
          currentPage: 1, 
          totalPages: 0, 
          totalItems: 0, 
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        } 
      };
    }
  }

  async search(params: UserQueryParams): Promise<PaginatedResult<User>> {
    return this.findAll(params);
  }

  async findByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResult<User>> {
    const queryParams: UserQueryParams = { 
      ...params,
      page: params?.page || 1,
      limit: params?.limit || 10,
      filters: { 
        ...params?.filters,
        role 
      }
    };
    return this.findAll(queryParams);
  }

  async emailExists(email: Email): Promise<boolean> {
    try {
      const count = await this.ormRepository.count({
        where: { email: email.value },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.email_exists_check_failed'),
        error as Error,
        { email: email.value },
      );
      return false;
    }
  }

  async existsByUsername(username: string): Promise<boolean> {
    try {
      const count = await this.ormRepository.count({
        where: { username },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.username_exists_check_failed'),
        error as Error,
        { username },
      );
      return false;
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    try {
      await this.ormRepository.update(id, { hashedPassword: passwordHash });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.update_password_failed'),
        error as Error,
        { userId: id },
      );
      throw error;
    }
  }

  async updateActiveStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.ormRepository.update(id, { isActive });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.update_status_failed'),
        error as Error,
        { userId: id, isActive },
      );
      throw error;
    }
  }

  async countSuperAdmins(): Promise<number> {
    try {
      return await this.ormRepository.count({
        where: { role: UserRole.PLATFORM_ADMIN },
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.count_super_admins_failed'),
        error as Error,
        {},
      );
      return 0;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.ormRepository.count();
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.count_failed'),
        error as Error,
        {},
      );
      return 0;
    }
  }

  async countWithFilters(params: UserQueryParams): Promise<number> {
    try {
      const query = this.buildQuery(params);
      return await query.getCount();
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.count_with_filters_failed'),
        error as Error,
        { params },
      );
      return 0;
    }
  }

  async update(user: User): Promise<User> {
    try {
      const ormEntity = TypeOrmUserMapper.toOrmEntity(user);
      const savedEntity = await this.ormRepository.save(ormEntity);
      return TypeOrmUserMapper.toDomainEntity(savedEntity);
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.update_failed'),
        error as Error,
        { userId: user.id },
      );
      throw error;
    }
  }

  async updateBatch(users: User[]): Promise<User[]> {
    try {
      const ormEntities = users.map(user => TypeOrmUserMapper.toOrmEntity(user));
      const savedEntities = await this.ormRepository.save(ormEntities);
      return savedEntities.map(entity => TypeOrmUserMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.update_batch_failed'),
        error as Error,
        { userCount: users.length },
      );
      throw error;
    }
  }

  async deleteBatch(ids: string[]): Promise<void> {
    try {
      await this.ormRepository.delete(ids);
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.delete_batch_failed'),
        error as Error,
        { ids },
      );
      throw error;
    }
  }

  async export(params?: UserQueryParams): Promise<User[]> {
    try {
      // Pour export, on utilise les mêmes paramètres mais sans pagination
      const exportParams: UserQueryParams = params ? {
        ...params,
        page: 1,
        limit: Number.MAX_SAFE_INTEGER
      } : { page: 1, limit: Number.MAX_SAFE_INTEGER };
      
      const query = this.buildQuery(exportParams);
      const entities = await query.getMany();
      return entities.map(entity => TypeOrmUserMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.export_failed'),
        error as Error,
        { params },
      );
      return [];
    }
  }

  private buildQuery(params?: UserQueryParams): SelectQueryBuilder<UserOrmEntity> {
    const query = this.ormRepository.createQueryBuilder('user');

    if (params?.filters?.role) {
      if (Array.isArray(params.filters.role)) {
        query.andWhere('user.role IN (:...roles)', { roles: params.filters.role });
      } else {
        query.andWhere('user.role = :role', { role: params.filters.role });
      }
    }

    if (params?.filters?.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: params.filters.isActive });
    }

    if (params?.search?.query) {
      query.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.username) LIKE LOWER(:search))',
        { search: `%${params.search.query}%` }
      );
    }

    if (params?.search?.email) {
      query.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${params.search.email}%` });
    }

    if (params?.search?.name) {
      query.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:name) OR LOWER(user.lastName) LIKE LOWER(:name))',
        { name: `%${params.search.name}%` }
      );
    }

    if (params?.filters?.emailDomain) {
      query.andWhere('user.email LIKE :domain', { domain: `%@${params.filters.emailDomain}` });
    }

    // Date filters
    if (params?.filters?.createdAt?.from) {
      query.andWhere('user.createdAt >= :createdFrom', { createdFrom: params.filters.createdAt.from });
    }
    if (params?.filters?.createdAt?.to) {
      query.andWhere('user.createdAt <= :createdTo', { createdTo: params.filters.createdAt.to });
    }

    // Pagination
    if (params?.page && params?.limit) {
      query.skip((params.page - 1) * params.limit);
      query.take(params.limit);
    }

    // Sorting
    const sortBy = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder || 'DESC';
    query.orderBy(`user.${sortBy}`, sortOrder);

    return query;
  }
}
