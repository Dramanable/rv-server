/**
 * 🏥 INFRASTRUCTURE REPOSITORY - ProfessionalRole
 * Clean Architecture - Infrastructure Layer
 * Implémentation TypeORM du repository ProfessionalRole
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ProfessionalCategory,
  ProfessionalRole,
} from '@domain/entities/professional-role.entity';
import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';
import { ProfessionalRoleOrmEntity } from '@infrastructure/database/sql/postgresql/entities/professional-role-orm.entity';
import { ProfessionalRoleOrmMapper } from '@infrastructure/mappers/professional-role-orm.mapper';

@Injectable()
export class TypeOrmProfessionalRoleRepository
  implements IProfessionalRoleRepository
{
  constructor(
    @InjectRepository(ProfessionalRoleOrmEntity)
    private readonly repository: Repository<ProfessionalRoleOrmEntity>,
  ) {}

  async save(professionalRole: ProfessionalRole): Promise<ProfessionalRole> {
    const ormEntity = ProfessionalRoleOrmMapper.toOrmEntity(professionalRole);
    const savedOrm = await this.repository.save(ormEntity);
    return ProfessionalRoleOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: string): Promise<ProfessionalRole | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });

    if (!ormEntity) return null;
    return ProfessionalRoleOrmMapper.toDomainEntity(ormEntity);
  }

  async findByCode(code: string): Promise<ProfessionalRole | null> {
    const ormEntity = await this.repository.findOne({
      where: { code },
    });

    if (!ormEntity) return null;
    return ProfessionalRoleOrmMapper.toDomainEntity(ormEntity);
  }

  async findAll(filters?: {
    category?: ProfessionalCategory;
    isActive?: boolean;
    canLead?: boolean;
    search?: string;
  }): Promise<ProfessionalRole[]> {
    const queryBuilder = this.repository.createQueryBuilder('pr');

    if (filters?.category) {
      queryBuilder.andWhere('pr.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('pr.is_active = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.canLead !== undefined) {
      queryBuilder.andWhere('pr.can_lead = :canLead', {
        canLead: filters.canLead,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(pr.name ILIKE :search OR pr.display_name ILIKE :search OR pr.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('pr.category', 'ASC');
    queryBuilder.addOrderBy('pr.name', 'ASC');

    const ormEntities = await queryBuilder.getMany();
    return ProfessionalRoleOrmMapper.toDomainEntities(ormEntities);
  }

  async findByCategory(
    category: ProfessionalCategory,
  ): Promise<ProfessionalRole[]> {
    const ormEntities = await this.repository.find({
      where: { category },
      order: { name: 'ASC' },
    });

    return ProfessionalRoleOrmMapper.toDomainEntities(ormEntities);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { code },
    });

    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countByCategory(category: ProfessionalCategory): Promise<number> {
    return this.repository.count({
      where: { category },
    });
  }

  async findActive(): Promise<ProfessionalRole[]> {
    const ormEntities = await this.repository.find({
      where: { is_active: true },
      order: { category: 'ASC', name: 'ASC' },
    });

    return ProfessionalRoleOrmMapper.toDomainEntities(ormEntities);
  }

  async findLeaderRoles(): Promise<ProfessionalRole[]> {
    const ormEntities = await this.repository.find({
      where: {
        can_lead: true,
        is_active: true,
      },
      order: { name: 'ASC' },
    });

    return ProfessionalRoleOrmMapper.toDomainEntities(ormEntities);
  }

  async search(term: string): Promise<ProfessionalRole[]> {
    const queryBuilder = this.repository.createQueryBuilder('pr');

    queryBuilder.where(
      '(pr.name ILIKE :term OR pr.display_name ILIKE :term OR pr.description ILIKE :term OR pr.code ILIKE :term)',
      { term: `%${term}%` },
    );

    queryBuilder.orderBy('pr.category', 'ASC');
    queryBuilder.addOrderBy('pr.name', 'ASC');

    const ormEntities = await queryBuilder.getMany();
    return ProfessionalRoleOrmMapper.toDomainEntities(ormEntities);
  }
}
