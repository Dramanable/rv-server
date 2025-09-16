/**
 * 👤 User Entity ORM - TypeORM + Clean Architecture + Node.js 24
 *
 * Optimized for Node.js 24 with ES2024 syntax and modern decorators
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 255 })
  hashedPassword!: string;

  @Column({ type: 'varchar', length: 50, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 50, name: 'last_name' })
  lastName!: string;

  @Column({
    type: 'enum',
    enum: [
      'PLATFORM_ADMIN',
      'BUSINESS_OWNER',
      'BUSINESS_ADMIN',
      'LOCATION_MANAGER',
      'DEPARTMENT_HEAD',
      'SENIOR_PRACTITIONER',
      'PRACTITIONER',
      'JUNIOR_PRACTITIONER',
      'RECEPTIONIST',
      'ASSISTANT',
      'SCHEDULER',
      'CORPORATE_CLIENT',
      'VIP_CLIENT',
      'REGULAR_CLIENT',
      'GUEST_CLIENT',
    ],
  })
  role!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
