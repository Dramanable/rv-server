/**
 * 🗄️ TypeORM Staff Repository - Infrastructure Layer
 *
 * Implémentation concrète du StaffRepository avec TypeORM
 * Couche Infrastructure - Persistance des données
 *
 * ✅ CLEAN ARCHITECTURE COMPLIANCE:
 * - Implémente l'interface domain StaffRepository
 * - Utilise l'entité ORM pour la persistance
 * - Convertit entre entités Domain et ORM
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Staff,
  StaffStatus,
} from '../../../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../../../domain/repositories/staff.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { Email } from '../../../../../domain/value-objects/email.value-object';
import { UserId } from '../../../../../domain/value-objects/user-id.value-object';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';
import { StaffOrmEntity } from '../entities/staff-orm.entity';
import { StaffMapper } from '../../../../mappers/domain-mappers';

@Injectable()
export class TypeOrmStaffRepository implements StaffRepository {
  constructor(
    @InjectRepository(StaffOrmEntity)
    private readonly repository: Repository<StaffOrmEntity>,
  ) {}

  async findById(id: UserId): Promise<Staff | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    return ormEntity ? StaffMapper.fromTypeOrmEntity(ormEntity) : null;
  }

  async findByEmail(email: Email): Promise<Staff | null> {
    const ormEntity = await this.repository.findOne({
      where: { email: email.getValue() },
    });

    return ormEntity ? StaffMapper.fromTypeOrmEntity(ormEntity) : null;
  }

  async findByBusinessId(businessId: BusinessId): Promise<Staff[]> {
    const ormEntities = await this.repository.find({
      where: { business_id: businessId.getValue() },
      order: { created_at: 'DESC' },
    });

    return ormEntities.map((entity) => StaffMapper.fromTypeOrmEntity(entity));
  }

  async findByBusinessIdAndRole(
    businessId: BusinessId,
    role: string,
  ): Promise<Staff[]> {
    const ormEntities = await this.repository.find({
      where: {
        business_id: businessId.getValue(),
        role: role as StaffRole,
      },
      order: { created_at: 'DESC' },
    });

    return ormEntities.map((entity) => StaffMapper.fromTypeOrmEntity(entity));
  }

  async findAvailableStaff(
    businessId: BusinessId,
    dateTime: Date,
    duration: number,
  ): Promise<Staff[]> {
    // Pour le moment, on retourne tous les staff actifs
    // Dans une implémentation future, on intégrera la logique de disponibilité basée sur les calendriers
    const ormEntities = await this.repository.find({
      where: {
        business_id: businessId.getValue(),
        status: StaffStatus.ACTIVE,
      },
      order: { role: 'ASC' },
    });

    return ormEntities.map((entity) => StaffMapper.fromTypeOrmEntity(entity));
  }

  async search(criteria: {
    businessId?: BusinessId;
    name?: string;
    role?: string;
    specialization?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ staff: Staff[]; total: number }> {
    const qb = this.repository.createQueryBuilder('staff');

    if (criteria.businessId) {
      qb.andWhere('staff.business_id = :businessId', {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria.name) {
      qb.andWhere(
        '(LOWER(staff.first_name) LIKE LOWER(:name) OR LOWER(staff.last_name) LIKE LOWER(:name))',
        {
          name: `%${criteria.name}%`,
        },
      );
    }

    if (criteria.role) {
      qb.andWhere('staff.role = :role', { role: criteria.role });
    }

    if (criteria.specialization) {
      qb.andWhere('LOWER(staff.specialization) LIKE LOWER(:specialization)', {
        specialization: `%${criteria.specialization}%`,
      });
    }

    if (criteria.isActive !== undefined) {
      qb.andWhere('staff.status = :status', {
        status: criteria.isActive ? StaffStatus.ACTIVE : StaffStatus.INACTIVE,
      });
    }

    const total = await qb.getCount();

    if (criteria.limit) {
      qb.limit(criteria.limit);
    }
    if (criteria.offset) {
      qb.offset(criteria.offset);
    }

    qb.orderBy('staff.role', 'ASC').addOrderBy('staff.last_name', 'ASC');

    const ormEntities = await qb.getMany();
    const staff = ormEntities.map((entity) =>
      StaffMapper.fromTypeOrmEntity(entity),
    );

    return { staff, total };
  }

  async save(staff: Staff): Promise<void> {
    const ormEntity = StaffMapper.toTypeOrmEntity(staff);
    await this.repository.save(ormEntity);
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.delete({ id: id.getValue() });
  }

  async existsByEmail(email: Email, excludeId?: UserId): Promise<boolean> {
    const qb = this.repository
      .createQueryBuilder('staff')
      .where('LOWER(staff.email) = LOWER(:email)', { email: email.getValue() });

    if (excludeId) {
      qb.andWhere('staff.id != :excludeId', {
        excludeId: excludeId.getValue(),
      });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async getBusinessStaffStatistics(businessId: BusinessId): Promise<{
    totalStaff: number;
    activeStaff: number;
    staffByRole: Record<string, number>;
    averageExperience: number;
  }> {
    const totalStaff = await this.repository.count({
      where: { business_id: businessId.getValue() },
    });

    const activeStaff = await this.repository.count({
      where: {
        business_id: businessId.getValue(),
        status: StaffStatus.ACTIVE,
      },
    });

    // Statistiques par rôle
    const roleStats = await this.repository
      .createQueryBuilder('staff')
      .select('staff.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('staff.business_id = :businessId', {
        businessId: businessId.getValue(),
      })
      .groupBy('staff.role')
      .getRawMany();

    const staffByRole = roleStats.reduce(
      (acc, stat) => {
        acc[stat.role] = parseInt(stat.count);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculer l'expérience moyenne (placeholder)
    const averageExperience = 3; // En années - à calculer réellement à partir des hire_date

    return {
      totalStaff,
      activeStaff,
      staffByRole,
      averageExperience,
    };
  }
}
