/**
 * 👤 User Repository - TypeORM Implementation
 * ✅ Clean Architecture compliant
 * ✅ PostgreSQL with TypeORM
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository as TypeOrmRepository } from 'typeorm';

// Domain interfaces
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@shared/enums/user-role.enum';

// TypeORM Entity
import { UserOrmEntity } from '../entities/user-orm.entity';

// Types
import { User } from '@domain/entities/user.entity';
import { PaginatedResult } from '@shared/types/pagination.types';
import { UserQueryParams } from '@shared/types/user-query.types';

/**
 * 🗄️ TypeORM User Repository Implementation
 *
 * Implements all UserRepository interface methods with PostgreSQL
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: TypeOrmRepository<UserOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 💾 Save user (create or update)
   */
  async save(user: User): Promise<User> {
    // Extract values from domain objects
    const email =
      typeof user.email === 'string'
        ? user.email
        : (user.email as any)?.value || user.email;
    const hashedPassword =
      typeof user.hashedPassword === 'string'
        ? user.hashedPassword
        : (user.hashedPassword as any)?.value || user.hashedPassword;

    const ormEntity = this.repository.create({
      id: user.id,
      email: email,
      firstName: user.firstName || (user as any).name?.split(' ')[0] || '',
      lastName:
        user.lastName ||
        (user as any).name?.split(' ').slice(1).join(' ') ||
        '',
      hashedPassword: hashedPassword,
      role: user.role,
      isActive: user.isActive ?? true,
      isVerified: user.isVerified ?? false,
    });

    const saved = await this.repository.save(ormEntity);
    return this.toDomainUser(saved);
  }

  /**
   * 🔍 Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? this.toDomainUser(user) : null;
  }

  /**
   * 🔍 Find user by email
   */
  async findByEmail(email: Email | string): Promise<User | null> {
    const emailValue = typeof email === 'string' ? email : email.value;
    const user = await this.repository.findOne({
      where: { email: emailValue },
    });
    return user ? this.toDomainUser(user) : null;
  }

  /**
   * 🔍 Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.repository.findOne({ where: { username } });
    return user ? this.toDomainUser(user) : null;
  }

  /**
   * 🗑️ Delete user
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * 📋 Find all users with pagination
   */
  async findAll(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 20, 100); // Max 100 items
    const skip = (page - 1) * limit;

    const query = this.repository.createQueryBuilder('user');

    // Apply sorting
    if (params?.sortBy && params?.sortOrder) {
      query.orderBy(`user.${params.sortBy}`, params.sortOrder);
    } else {
      query.orderBy('user.createdAt', 'DESC');
    }

    // Apply pagination
    query.skip(skip).take(limit);

    const [users, totalItems] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users.map((user) => this.toDomainUser(user)),
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
      },
    };
  }

  /**
   * 🔍 Search users
   */
  async search(params: UserQueryParams): Promise<PaginatedResult<User>> {
    return this.findAll(params);
  }

  /**
   * 🔍 Find users by role
   */
  async findByRole(
    role: UserRole,
    params?: UserQueryParams,
  ): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = Math.min(params?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [users, totalItems] = await this.repository.findAndCount({
      where: { role },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users.map((user) => this.toDomainUser(user)),
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
      },
    };
  }

  /**
   * ✅ Check if email exists
   */
  async emailExists(email: Email | string): Promise<boolean> {
    const emailValue = typeof email === 'string' ? email : email.value;
    const count = await this.repository.count({ where: { email: emailValue } });
    return count > 0;
  }

  /**
   * ✅ Check if username exists
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ where: { username } });
    return count > 0;
  }

  /**
   * 🔐 Update password
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repository.update(id, { hashedPassword: passwordHash });
  }

  /**
   * 🔄 Update active status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<void> {
    await this.repository.update(id, { isActive });
  }

  /**
   * 📊 Count super admins
   */
  async countSuperAdmins(): Promise<number> {
    return this.repository.count({ where: { role: 'PLATFORM_ADMIN' } });
  }

  /**
   * 📊 Count all users
   */
  async count(): Promise<number> {
    return this.repository.count();
  }

  /**
   * 📊 Count with filters
   */
  async countWithFilters(params: UserQueryParams): Promise<number> {
    const query = this.repository.createQueryBuilder('user');

    // Apply filters if provided
    if (params.filters?.role) {
      const roles = Array.isArray(params.filters.role)
        ? params.filters.role
        : [params.filters.role];
      query.where('user.role IN (:...roles)', { roles });
    }
    if (params.filters?.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', {
        isActive: params.filters.isActive,
      });
    }

    return query.getCount();
  }

  /**
   * ✏️ Update user
   */
  async update(user: User): Promise<User> {
    return this.save(user); // Save handles both create and update
  }

  /**
   * ✏️ Update multiple users
   */
  async updateBatch(users: User[]): Promise<User[]> {
    const results = [];
    for (const user of users) {
      results.push(await this.save(user));
    }
    return results;
  }

  /**
   * 🗑️ Delete multiple users
   */
  async deleteBatch(ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }

  /**
   * 📤 Export users
   */
  async export(params?: UserQueryParams): Promise<User[]> {
    const users = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: params?.limit || 1000,
    });
    return users.map((user) => this.toDomainUser(user));
  }

  /**
   * 🔄 Convert ORM entity to domain object
   */
  private toDomainUser(ormUser: UserOrmEntity): User {
    // Create a User-like object that satisfies the interface
    return {
      id: ormUser.id,
      email: {
        value: ormUser.email,
      } as Email,
      name: `${ormUser.firstName} ${ormUser.lastName}`.trim(),
      firstName: ormUser.firstName,
      lastName: ormUser.lastName,
      username: ormUser.username,
      hashedPassword: {
        value: ormUser.hashedPassword,
      } as any, // HashedPassword type
      role: ormUser.role as UserRole,
      isActive: ormUser.isActive,
      isVerified: ormUser.isVerified,
      createdAt: ormUser.createdAt,
      updatedAt: ormUser.updatedAt,
    } as User;
  }

  /**
   * 🔄 Convert domain object to ORM entity data
   */
  private toOrmEntityData(domainUser: User): Partial<UserOrmEntity> {
    // Extract raw values from domain value objects
    const emailValue = (domainUser.email as any)?.value || domainUser.email;
    const passwordValue =
      (domainUser.hashedPassword as any)?.value || domainUser.hashedPassword;

    return {
      id: domainUser.id,
      email: emailValue,
      firstName: domainUser.firstName,
      lastName: domainUser.lastName,
      username: domainUser.username,
      hashedPassword: passwordValue,
      role: domainUser.role,
      isActive: domainUser.isActive,
      isVerified: domainUser.isVerified,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt || new Date(),
    };
  }
}
