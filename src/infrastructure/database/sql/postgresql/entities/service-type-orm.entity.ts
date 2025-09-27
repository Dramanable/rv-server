import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ⚠️ CRITICAL - Service Type ORM Entity for PostgreSQL persistence
 *
 * OBLIGATORY RULES:
 * - NO BUSINESS LOGIC in ORM entities
 * - NO domain imports in ORM entities
 * - ALWAYS use mapping via dedicated ServiceTypeOrmMapper
 * - ALL audit columns REQUIRED for traceability
 */
@Entity({ name: 'service_types', schema: process.env.DB_SCHEMA || 'public' })
@Index(['businessId', 'code'], { unique: true })
@Index(['businessId', 'isActive'])
export class ServiceTypeOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'business_id' })
  businessId!: string;

  @Column('varchar', { length: 100 })
  name!: string;

  @Column('varchar', { length: 20 })
  code!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('boolean', { default: true, name: 'is_active' })
  isActive!: boolean;

  @Column('integer', { default: 0, name: 'sort_order' })
  sortOrder!: number;

  // ✅ OBLIGATORY - Audit trail columns for traceability
  @Column('uuid', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @Column('uuid', { name: 'updated_by', nullable: true })
  updatedBy!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
