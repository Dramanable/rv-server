/**
 * 🗄️ INFRASTRUCTURE REPOSITORY - TypeORM Role Assignment
 *
 * Implémentation concrète du repository pour les assignations de rôles.
 * Utilise TypeORM comme ORM et PostgreSQL comme base de données.
 *
 * CLEAN ARCHITECTURE :
 * - Implémente l'interface définie dans la couche Domain
 * - Aucune logique métier - uniquement la persistence
 * - Conversion via mapper dédié
 * - Logging complet avec contexte de traçabilité
 * - Messages i18n pour erreurs utilisateur
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  RoleAssignment,
  RoleAssignmentContext,
} from '@domain/entities/role-assignment.entity';
import {
  IRoleAssignmentRepository,
  RoleAssignmentCriteria,
  RoleAssignmentFilters,
} from '@domain/repositories/role-assignment.repository.interface';
import { RoleAssignmentOrmMapper } from '@infrastructure/mappers/role-assignment-orm.mapper';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@shared/enums/user-role.enum';
import { InfrastructureException } from '@shared/exceptions/shared.exceptions';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { RoleAssignmentOrmEntity } from '../entities/role-assignment-orm.entity';

@Injectable()
export class TypeOrmRoleAssignmentRepository
  implements IRoleAssignmentRepository
{
  constructor(
    @InjectRepository(RoleAssignmentOrmEntity)
    private readonly ormRepository: Repository<RoleAssignmentOrmEntity>,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * 💾 Sauvegarder une assignation de rôle
   */
  async save(roleAssignment: RoleAssignment): Promise<RoleAssignment> {
    try {
      this.logger.info('Saving role assignment', {
        userId: roleAssignment.getUserId(),
        role: roleAssignment.getRole(),
      });

      const ormEntity = RoleAssignmentOrmMapper.toOrmEntity(roleAssignment);
      const savedEntity = await this.ormRepository.save(ormEntity);
      const savedAssignment =
        RoleAssignmentOrmMapper.toDomainEntity(savedEntity);

      this.logger.info('Role assignment saved successfully', {
        id: savedAssignment.getId(),
        userId: savedAssignment.getUserId(),
        role: savedAssignment.getRole(),
      });

      return savedAssignment;
    } catch (error) {
      this.logger.error(
        'Failed to save role assignment',
        error instanceof Error ? error : new Error(String(error)),
        {
          assignment: {
            userId: roleAssignment.getUserId(),
            role: roleAssignment.getRole(),
          },
        },
      );
      throw error;
    }
  }

  /**
   * 🔍 Trouver par ID
   */
  async findById(id: string): Promise<RoleAssignment | null> {
    try {
      this.logger.info('Finding role assignment by ID', { id });

      const ormEntity = await this.ormRepository.findOne({
        where: { id },
        relations: ['businessContext'],
      });

      if (!ormEntity) {
        this.logger.info('Role assignment not found', { id });
        return null;
      }

      const assignment = RoleAssignmentOrmMapper.toDomainEntity(ormEntity);

      this.logger.info('Role assignment found', {
        id,
        userId: assignment.getUserId(),
        role: assignment.getRole(),
      });

      return assignment;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignment by ID',
        error instanceof Error ? error : new Error(String(error)),
        { id },
      );
      throw error;
    }
  }

  /**
   * 👤 Trouver toutes les assignations d'un utilisateur
   */
  async findByUserId(userId: string): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding role assignments by user ID', { userId });

      const ormAssignments = await this.ormRepository.find({
        where: { userId },
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found role assignments by user ID', {
        userId,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignments by user ID',
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * 👤 Trouver les assignations actives d'un utilisateur
   */
  async findActiveByUserId(userId: string): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding active role assignments by user ID', {
        userId,
      });

      const ormAssignments = await this.ormRepository.find({
        where: {
          userId,
          isActive: true,
          expiresAt: MoreThan(new Date()),
        },
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found active role assignments', {
        userId,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find active role assignments',
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * 👤 Trouver les assignations actives d'un utilisateur dans un contexte spécifique
   */
  async findActiveByUserIdAndContext(
    userId: string,
    context: RoleAssignmentContext,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding active role assignments in context', {
        userId,
        context,
      });

      const where: any = {
        userId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const ormAssignments = await this.ormRepository.find({
        where,
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found active role assignments in context', {
        userId,
        context,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find active role assignments in context',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          context,
        },
      );
      throw error;
    }
  }

  /**
   * 🏢 Trouver les assignations dans un contexte métier
   */
  async findByContext(
    context: RoleAssignmentContext,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding role assignments by context', { context });

      const where: any = {};

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const ormAssignments = await this.ormRepository.find({
        where,
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found role assignments by context', {
        context,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignments by context',
        error instanceof Error ? error : new Error(String(error)),
        { context },
      );
      throw error;
    }
  }

  /**
   * 🔍 Trouver les assignations selon des critères
   */
  async findByCriteria(
    criteria: RoleAssignmentCriteria,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding role assignments by criteria', { criteria });

      const where: any = {};

      if (criteria.userId) where.userId = criteria.userId;
      if (criteria.role) where.role = criteria.role;
      if (criteria.businessId) where.businessId = criteria.businessId;
      if (criteria.locationId) where.locationId = criteria.locationId;
      if (criteria.departmentId) where.departmentId = criteria.departmentId;
      if (criteria.isActive !== undefined) where.isActive = criteria.isActive;
      if (criteria.assignedBy) where.assignedBy = criteria.assignedBy;

      if (!criteria.includeExpired) {
        where.expiresAt = MoreThan(new Date());
      }

      const ormAssignments = await this.ormRepository.find({
        where,
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found role assignments by criteria', {
        criteria,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignments by criteria',
        error instanceof Error ? error : new Error(String(error)),
        { criteria },
      );
      throw error;
    }
  }

  /**
   * 📋 Lister avec filtres et pagination
   */
  async findWithFilters(
    filters: RoleAssignmentFilters,
    pagination?: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{
    data: RoleAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      this.logger.info('Finding role assignments with filters', {
        filters,
        pagination,
      });

      const queryBuilder = this.ormRepository
        .createQueryBuilder('ra')
        .leftJoinAndSelect('ra.businessContext', 'bc');

      // Filtres
      if (filters.roles?.length) {
        queryBuilder.andWhere('ra.role IN (:...roles)', {
          roles: filters.roles,
        });
      }

      if (filters.businessIds?.length) {
        queryBuilder.andWhere('ra.businessId IN (:...businessIds)', {
          businessIds: filters.businessIds,
        });
      }

      if (filters.locationIds?.length) {
        queryBuilder.andWhere('ra.locationId IN (:...locationIds)', {
          locationIds: filters.locationIds,
        });
      }

      if (filters.departmentIds?.length) {
        queryBuilder.andWhere('ra.departmentId IN (:...departmentIds)', {
          departmentIds: filters.departmentIds,
        });
      }

      if (filters.isActive !== undefined) {
        queryBuilder.andWhere('ra.isActive = :isActive', {
          isActive: filters.isActive,
        });
      }

      if (filters.assignmentScope) {
        queryBuilder.andWhere('ra.assignmentScope = :scope', {
          scope: filters.assignmentScope,
        });
      }

      if (filters.expirationStatus) {
        const now = new Date();
        const soonDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

        switch (filters.expirationStatus) {
          case 'active':
            queryBuilder.andWhere('ra.expiresAt > :now', { now });
            break;
          case 'expired':
            queryBuilder.andWhere('ra.expiresAt <= :now', { now });
            break;
          case 'expiring_soon':
            queryBuilder.andWhere('ra.expiresAt BETWEEN :now AND :soon', {
              now,
              soon: soonDate,
            });
            break;
        }
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(ra.assignedByName ILIKE :search OR ra.notes ILIKE :search)',
          { search: `%${filters.search}%` },
        );
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      const total = await queryBuilder.getCount();

      // Tri
      const sortBy = pagination?.sortBy || 'createdAt';
      const sortOrder = pagination?.sortOrder || 'DESC';
      queryBuilder.orderBy(`ra.${sortBy}`, sortOrder);

      const ormAssignments = await queryBuilder
        .skip(offset)
        .take(limit)
        .getMany();

      const data = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      const result = {
        data,
        total,
        page,
        limit,
      };

      this.logger.info('Found role assignments with filters', {
        filters,
        pagination,
        total,
        count: data.length,
      });

      return result;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignments with filters',
        error instanceof Error ? error : new Error(String(error)),
        {
          filters,
          pagination,
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Vérifier si un utilisateur a un rôle spécifique dans un contexte
   */
  async hasRoleInContext(
    userId: string,
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<boolean> {
    try {
      this.logger.info('Checking if user has role in context', {
        userId,
        role,
        context,
      });

      const where: any = {
        userId,
        role,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const count = await this.ormRepository.count({ where });
      const hasRole = count > 0;

      this.logger.info('Checked if user has role in context', {
        userId,
        role,
        context,
        hasRole,
      });

      return hasRole;
    } catch (error) {
      this.logger.error(
        'Failed to check if user has role in context',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          role,
          context,
        },
      );
      throw error;
    }
  }

  /**
   * 🎭 Obtenir le rôle effectif d'un utilisateur dans un contexte
   */
  async getEffectiveRole(
    userId: string,
    context: RoleAssignmentContext,
  ): Promise<UserRole | null> {
    try {
      this.logger.info('Getting effective role for user in context', {
        userId,
        context,
      });

      const where: any = {
        userId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      // Chercher les assignations dans l'ordre hiérarchique
      const assignment = await this.ormRepository.findOne({
        where,
        order: {
          createdAt: 'DESC', // Plus récent en premier
        },
      });

      const effectiveRole = assignment ? (assignment.role as UserRole) : null;

      this.logger.info('Got effective role for user in context', {
        userId,
        context,
        effectiveRole,
      });

      return effectiveRole;
    } catch (error) {
      this.logger.error(
        'Failed to get effective role for user in context',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          context,
        },
      );
      throw error;
    }
  }

  /**
   * 📊 Compter les assignations selon des critères
   */
  async countByCriteria(criteria: RoleAssignmentCriteria): Promise<number> {
    try {
      this.logger.info('Counting role assignments by criteria', { criteria });

      const where: any = {};

      if (criteria.userId) where.userId = criteria.userId;
      if (criteria.role) where.role = criteria.role;
      if (criteria.businessId) where.businessId = criteria.businessId;
      if (criteria.locationId) where.locationId = criteria.locationId;
      if (criteria.departmentId) where.departmentId = criteria.departmentId;
      if (criteria.isActive !== undefined) where.isActive = criteria.isActive;
      if (criteria.assignedBy) where.assignedBy = criteria.assignedBy;

      if (!criteria.includeExpired) {
        where.expiresAt = MoreThan(new Date());
      }

      const count = await this.ormRepository.count({ where });

      this.logger.info('Counted role assignments by criteria', {
        criteria,
        count,
      });

      return count;
    } catch (error) {
      this.logger.error(
        'Failed to count role assignments by criteria',
        error instanceof Error ? error : new Error(String(error)),
        { criteria },
      );
      throw error;
    }
  }

  /**
   * ⏰ Trouver les assignations qui expirent bientôt
   */
  async findExpiringSoon(daysAhead: number): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Finding role assignments expiring soon', { daysAhead });

      const now = new Date();
      const futureDate = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000,
      );

      const ormAssignments = await this.ormRepository.find({
        where: {
          isActive: true,
          expiresAt: Between(now, futureDate),
        },
        relations: ['businessContext'],
      });

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Found role assignments expiring soon', {
        daysAhead,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to find role assignments expiring soon',
        error instanceof Error ? error : new Error(String(error)),
        { daysAhead },
      );
      throw error;
    }
  }

  /**
   * 🗑️ Supprimer une assignation (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    try {
      this.logger.info('Deleting role assignment', { id });

      const assignment = await this.ormRepository.findOne({ where: { id } });
      if (!assignment) {
        return false;
      }

      assignment.isActive = false;
      assignment.updatedAt = new Date();
      await this.ormRepository.save(assignment);

      this.logger.info('Deleted role assignment', { id });

      return true;
    } catch (error) {
      this.logger.error(
        'Failed to delete role assignment',
        error instanceof Error ? error : new Error(String(error)),
        { id },
      );
      throw error;
    }
  }

  /**
   * 🗑️ Supprimer toutes les assignations d'un utilisateur
   */
  async deleteByUserId(userId: string): Promise<number> {
    try {
      this.logger.info('Deleting role assignments by user ID', { userId });

      const result = await this.ormRepository.update(
        { userId, isActive: true },
        { isActive: false, updatedAt: new Date() },
      );

      const count = result.affected || 0;

      this.logger.info('Deleted role assignments by user ID', {
        userId,
        count,
      });

      return count;
    } catch (error) {
      this.logger.error(
        'Failed to delete role assignments by user ID',
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * 🏢 Supprimer toutes les assignations dans un contexte
   */
  async deleteByContext(context: RoleAssignmentContext): Promise<number> {
    try {
      this.logger.info('Deleting role assignments by context', { context });

      const where: any = { isActive: true };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const result = await this.ormRepository.update(where, {
        isActive: false,
        updatedAt: new Date(),
      });

      const count = result.affected || 0;

      this.logger.info('Deleted role assignments by context', {
        context,
        count,
      });

      return count;
    } catch (error) {
      this.logger.error(
        'Failed to delete role assignments by context',
        error instanceof Error ? error : new Error(String(error)),
        { context },
      );
      throw error;
    }
  }

  /**
   * ♻️ Réactiver une assignation désactivée
   */
  async reactivate(id: string): Promise<RoleAssignment | null> {
    try {
      this.logger.info('Reactivating role assignment', { id });

      const assignment = await this.ormRepository.findOne({ where: { id } });
      if (!assignment) {
        return null;
      }

      assignment.isActive = true;
      assignment.updatedAt = new Date();
      const savedAssignment = await this.ormRepository.save(assignment);

      const domainAssignment =
        RoleAssignmentOrmMapper.toDomainEntity(savedAssignment);

      this.logger.info('Reactivated role assignment', { id });

      return domainAssignment;
    } catch (error) {
      this.logger.error(
        'Failed to reactivate role assignment',
        error instanceof Error ? error : new Error(String(error)),
        { id },
      );
      throw error;
    }
  }

  /**
   * 📊 Obtenir des statistiques d'assignations
   */
  async getAssignmentStats(businessId?: string): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    expiredAssignments: number;
    assignmentsByRole: Record<UserRole, number>;
    assignmentsByScope: Record<string, number>;
  }> {
    try {
      this.logger.info('Getting role assignment statistics', { businessId });

      const baseWhere: any = businessId ? { businessId } : {};

      const [totalAssignments, activeAssignments, expiredAssignments] =
        await Promise.all([
          this.ormRepository.count({
            where: baseWhere,
          }),
          this.ormRepository.count({
            where: {
              ...baseWhere,
              isActive: true,
              expiresAt: MoreThan(new Date()),
            },
          }),
          this.ormRepository.count({
            where: {
              ...baseWhere,
              expiresAt: LessThan(new Date()),
            },
          }),
        ]);

      // Initialiser avec tous les rôles possibles
      const assignmentsByRole: Record<UserRole, number> = {
        [UserRole.SUPER_ADMIN]: 0,
        [UserRole.PLATFORM_ADMIN]: 0,
        [UserRole.BUSINESS_OWNER]: 0,
        [UserRole.BUSINESS_ADMIN]: 0,
        [UserRole.LOCATION_MANAGER]: 0,
        [UserRole.DEPARTMENT_HEAD]: 0,
        [UserRole.SENIOR_PRACTITIONER]: 0,
        [UserRole.PRACTITIONER]: 0,
        [UserRole.JUNIOR_PRACTITIONER]: 0,
        [UserRole.RECEPTIONIST]: 0,
        [UserRole.ASSISTANT]: 0,
        [UserRole.SCHEDULER]: 0,
        [UserRole.CORPORATE_CLIENT]: 0,
        [UserRole.VIP_CLIENT]: 0,
        [UserRole.REGULAR_CLIENT]: 0,
        [UserRole.GUEST_CLIENT]: 0,
      };

      const assignmentsByScope: Record<string, number> = {
        BUSINESS: 0,
        LOCATION: 0,
        DEPARTMENT: 0,
      };

      // Compter par rôle et scope
      const assignments = await this.ormRepository.find({
        where: {
          ...baseWhere,
          isActive: true,
        },
      });

      assignments.forEach((assignment) => {
        const role = assignment.role as UserRole;
        if (role in assignmentsByRole) {
          assignmentsByRole[role]++;
        }

        if (assignment.assignmentScope in assignmentsByScope) {
          assignmentsByScope[assignment.assignmentScope]++;
        }
      });

      const stats = {
        totalAssignments,
        activeAssignments,
        expiredAssignments,
        assignmentsByRole,
        assignmentsByScope,
      };

      this.logger.info('Role assignment statistics calculated', {
        businessId,
        stats,
      });

      return stats;
    } catch (error) {
      this.logger.error(
        'Failed to get role assignment statistics',
        error instanceof Error ? error : new Error(String(error)),
        { businessId },
      );
      throw new InfrastructureException(
        this.i18n.translate('rbac.assignment.stats.failed') ||
          'Failed to get assignment statistics',
        'RBAC_STATS_ERROR',
      );
    }
  }

  /**
   * 👥 Trouver tous les utilisateurs avec un rôle spécifique dans un contexte
   */
  async findUsersWithRoleInContext(
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<string[]> {
    try {
      this.logger.info('Finding users with role in context', { role, context });

      const where: any = {
        role,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const assignments = await this.ormRepository.find({
        where,
        select: ['userId'],
      });

      const userIds = assignments.map((assignment) => assignment.userId);
      const uniqueUserIds = [...new Set(userIds)];

      this.logger.info('Found users with role in context', {
        role,
        context,
        count: uniqueUserIds.length,
      });

      return uniqueUserIds;
    } catch (error) {
      this.logger.error(
        'Failed to find users with role in context',
        error instanceof Error ? error : new Error(String(error)),
        {
          role,
          context,
        },
      );
      throw error;
    }
  }

  /**
   * 🔄 Transférer toutes les assignations d'un utilisateur à un autre
   */
  async transferAssignments(
    fromUserId: string,
    toUserId: string,
    transferredBy: string,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Transferring role assignments', {
        fromUserId,
        toUserId,
        transferredBy,
      });

      const assignments = await this.ormRepository.find({
        where: {
          userId: fromUserId,
          isActive: true,
          expiresAt: MoreThan(new Date()),
        },
        relations: ['businessContext'],
      });

      const transferredAssignments: RoleAssignment[] = [];

      for (const assignment of assignments) {
        // Désactiver l'ancienne assignation
        assignment.isActive = false;
        assignment.updatedAt = new Date();
        await this.ormRepository.save(assignment);

        // Créer la nouvelle assignation
        const newAssignment = new RoleAssignmentOrmEntity();
        Object.assign(newAssignment, {
          ...assignment,
          id: undefined, // Nouveau ID
          userId: toUserId,
          assignedBy: transferredBy,
          assignedByName: transferredBy,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: `Transferred from user ${fromUserId} by ${transferredBy}`,
        });

        const savedAssignment = await this.ormRepository.save(newAssignment);
        const domainAssignment =
          RoleAssignmentOrmMapper.toDomainEntity(savedAssignment);
        transferredAssignments.push(domainAssignment);
      }

      this.logger.info('Transferred role assignments', {
        fromUserId,
        toUserId,
        transferredBy,
        count: transferredAssignments.length,
      });

      return transferredAssignments;
    } catch (error) {
      this.logger.error(
        'Failed to transfer role assignments',
        error instanceof Error ? error : new Error(String(error)),
        {
          fromUserId,
          toUserId,
          transferredBy,
        },
      );
      throw error;
    }
  }

  /**
   * 🎯 Vérifier les conflits d'assignation (même rôle, même contexte)
   */
  async checkAssignmentConflicts(
    userId: string,
    role: UserRole,
    context: RoleAssignmentContext,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Checking assignment conflicts', {
        userId,
        role,
        context,
      });

      const where: any = {
        userId,
        role,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      };

      if (context.businessId) where.businessId = context.businessId;
      if (context.locationId) where.locationId = context.locationId;
      if (context.departmentId) where.departmentId = context.departmentId;

      const ormAssignments = await this.ormRepository.find({
        where,
        relations: ['businessContext'],
      });

      const conflicts = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Checked assignment conflicts', {
        userId,
        role,
        context,
        conflictsCount: conflicts.length,
      });

      return conflicts;
    } catch (error) {
      this.logger.error(
        'Failed to check assignment conflicts',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          role,
          context,
        },
      );
      throw error;
    }
  }

  /**
   * 📋 Obtenir l'historique des assignations d'un utilisateur
   */
  async getAssignmentHistory(
    userId: string,
    includeCurrent?: boolean,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Getting assignment history', {
        userId,
        includeCurrent,
      });

      const where: any = { userId };

      if (!includeCurrent) {
        where.isActive = false;
      }

      const ormAssignments = await this.ormRepository.find({
        where,
        relations: ['businessContext'],
        order: { createdAt: 'DESC' },
      });

      const history = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Got assignment history', {
        userId,
        includeCurrent,
        count: history.length,
      });

      return history;
    } catch (error) {
      this.logger.error(
        'Failed to get assignment history',
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          includeCurrent,
        },
      );
      throw error;
    }
  }

  /**
   * 🔍 Recherche avancée d'assignations avec texte libre
   */
  async searchAssignments(
    searchQuery: string,
    context?: RoleAssignmentContext,
  ): Promise<RoleAssignment[]> {
    try {
      this.logger.info('Searching role assignments', { searchQuery, context });

      const queryBuilder = this.ormRepository
        .createQueryBuilder('ra')
        .leftJoinAndSelect('ra.businessContext', 'bc')
        .where(
          '(ra.assignedByName ILIKE :search OR ra.notes ILIKE :search OR ra.role ILIKE :search)',
          { search: `%${searchQuery}%` },
        );

      if (context?.businessId) {
        queryBuilder.andWhere('ra.businessId = :businessId', {
          businessId: context.businessId,
        });
      }
      if (context?.locationId) {
        queryBuilder.andWhere('ra.locationId = :locationId', {
          locationId: context.locationId,
        });
      }
      if (context?.departmentId) {
        queryBuilder.andWhere('ra.departmentId = :departmentId', {
          departmentId: context.departmentId,
        });
      }

      const ormAssignments = await queryBuilder
        .orderBy('ra.createdAt', 'DESC')
        .getMany();

      const assignments = ormAssignments.map((orm) =>
        RoleAssignmentOrmMapper.toDomainEntity(orm),
      );

      this.logger.info('Searched role assignments', {
        searchQuery,
        context,
        count: assignments.length,
      });

      return assignments;
    } catch (error) {
      this.logger.error(
        'Failed to search role assignments',
        error instanceof Error ? error : new Error(String(error)),
        {
          searchQuery,
          context,
        },
      );
      throw error;
    }
  }
}
