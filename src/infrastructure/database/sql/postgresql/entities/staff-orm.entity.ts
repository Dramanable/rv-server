/**
 * 🔧 Staff ORM Entity - Infrastructure Layer
 *
 * Entité TypeORM pour la persistance des données Staff
 * Couche Infrastructure - Mapping objet-relationnel
 *
 * ⚠️ IMPORTANT: TypeScript 5.7+ Decorator Compatibility
 * Utilise la syntaxe des décorateurs TypeORM compatible avec TS 5.7+
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';
import { BusinessOrmEntity } from './business-orm.entity';

@Entity('staff')
@Index(['business_id'])
@Index(['role'])
@Index(['status'])
@Index(['email'])
@Index(['created_at'])
export class StaffOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  business_id!: string;

  // Profile as JSON
  @Column({ type: 'jsonb', nullable: false })
  profile!: {
    first_name: string;
    last_name: string;
    title?: string;
    specialization?: string;
    bio?: string;
    profile_image_url?: string;
    certifications?: string[];
    languages?: string[];
  };

  @Column({
    type: 'enum',
    enum: StaffRole,
    nullable: false,
  })
  @Index()
  role!: StaffRole;

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  // Availability as JSON
  @Column({ type: 'jsonb', nullable: true })
  availability!: {
    working_hours: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_working_day: boolean;
    }>;
    time_off?: Array<{
      start_date: string; // ISO string
      end_date: string; // ISO string
      reason?: string;
    }>;
    special_schedule?: Array<{
      date: string; // ISO string
      start_time?: string;
      end_time?: string;
      is_available: boolean;
    }>;
  } | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'],
    default: 'ACTIVE',
  })
  @Index()
  status!: string;

  @Column({ type: 'timestamptz', nullable: false })
  hire_date!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Calendar integration as JSON
  @Column({ type: 'jsonb', nullable: true })
  calendar_integration!: {
    calendar_id?: string;
    sync_with_business_calendar: boolean;
    override_business_rules: boolean;
    personal_booking_rules?: {
      require_approval: boolean;
      minimum_notice: number;
      maximum_advance_booking: number;
    };
  } | null;

  // Relations
  @ManyToOne(() => BusinessOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessOrmEntity;
}
