/**
 * 📅 Calendar Entity ORM - TypeORM + Clean Architecture
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('calendars')
export class CalendarOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', name: 'business_id' })
  businessId!: string;

  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId?: string;

  @Column({ 
    type: 'enum',
    enum: ['PERSONAL', 'BUSINESS', 'SHARED', 'PUBLIC'],
    default: 'PERSONAL'
  })
  type!: string;

  @Column({ type: 'varchar', length: 7, default: '#007BFF' })
  color!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault!: boolean;

  @Column({ type: 'json', nullable: true })
  settings?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
