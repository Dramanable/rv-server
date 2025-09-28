/**
 * 📅 Calendar ORM Entity - Infrastructure Layer
 *
 * Entité TypeORM pour la persistance des données Calendar
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
import { BusinessOrmEntity } from './business-orm.entity';

@Entity('calendars')
@Index(['business_id'])
@Index(['name'])
@Index(['type'])
@Index(['status'])
@Index(['created_at'])
export class CalendarOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  business_id!: string;

  @Column({
    type: 'enum',
    enum: ['BUSINESS', 'PERSONAL', 'SHARED', 'RESOURCE'],
    default: 'BUSINESS',
  })
  @Index()
  type!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id!: string | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'],
    default: 'ACTIVE',
  })
  @Index()
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'Europe/Paris' })
  timezone!: string;

  @Column({ type: 'boolean', default: false })
  is_default!: boolean;

  @Column({ type: 'varchar', length: 7, default: '#007bff' })
  color!: string;

  // Settings as JSON
  @Column({ type: 'jsonb', nullable: false })
  settings!: {
    timezone: string;
    default_slot_duration: number;
    minimum_notice: number;
    maximum_advance_booking: number;
    allow_multiple_bookings: boolean;
    auto_confirm_bookings: boolean;
    buffer_time_between_slots: number;
    reminder_settings?: {
      enabled: boolean;
      advance_time: number;
    };
  };

  // Availability as JSON
  @Column({ type: 'jsonb', nullable: false })
  availability!: {
    working_hours: Array<{
      day_of_week: number;
      is_working: boolean;
      start_time?: string;
      end_time?: string;
      breaks?: Array<{
        start_time: string;
        end_time: string;
      }>;
    }>;
    exceptions: Array<{
      date: string;
      is_available: boolean;
      start_time?: string;
      end_time?: string;
      reason?: string;
    }>;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => BusinessOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessOrmEntity;

  // ✅ NO MAPPING LOGIC HERE
  // Use dedicated mappers in /infrastructure/mappers/ instead
  // This follows Clean Architecture principles
}
