/**
 * 🏢 BusinessSector Entity ORM - TypeORM + Clean Architecture + Node.js 24
 *
 * Entité TypeORM pour les secteurs d'activité avec contraintes strictes et optimisations Node.js 24
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('business_sectors')
export class BusinessSectorOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment:
      'Unique business sector code (uppercase, alphanumeric with underscores)',
  })
  code!: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Human-readable business sector name',
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Optional detailed description of the business sector',
  })
  description?: string;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Whether this business sector is available for new businesses',
  })
  isActive!: boolean;

  @Column({
    type: 'uuid',
    name: 'created_by',
    comment: 'ID of the user (super admin) who created this sector',
  })
  createdBy!: string;

  @Column({
    type: 'uuid',
    name: 'updated_by',
    nullable: true,
    comment: 'ID of the user who last updated this sector',
  })
  updatedBy?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Timestamp when the business sector was created',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Timestamp when the business sector was last updated',
  })
  updatedAt!: Date;
}
