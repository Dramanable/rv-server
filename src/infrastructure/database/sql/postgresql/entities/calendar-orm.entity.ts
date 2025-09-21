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

  /**
   * 🔄 Calendar Entity Mapper
   * Convertit l'entité ORM vers l'entité Domain
   */
  toDomainEntity(): any {
    // TODO: Implémenter la conversion vers Calendar domain entity
    return {
      id: this.id,
      businessId: this.business_id,
      type: this.type,
      name: this.name,
      description: this.description,
      ownerId: this.owner_id,
      status: this.status,
      timezone: this.timezone,
      isDefault: this.is_default,
      color: this.color,
      settings: this.settings,
      availability: this.availability,
      createdAt: this.created_at,
      updatedAt: this.updated_at,
    };
  }

  /**
   * 🔄 Domain Entity Mapper
   * Convertit l'entité Domain vers l'entité ORM
   */
  static fromDomainEntity(calendar: any): CalendarOrmEntity {
    const ormEntity = new CalendarOrmEntity();

    if (calendar.id) ormEntity.id = calendar.id;
    ormEntity.business_id = calendar.businessId;
    ormEntity.type = calendar.type;
    ormEntity.name = calendar.name;
    ormEntity.description = calendar.description;
    ormEntity.owner_id = calendar.ownerId || null;
    ormEntity.status = calendar.status;
    ormEntity.timezone = calendar.timezone || 'Europe/Paris';
    ormEntity.is_default = calendar.isDefault || false;
    ormEntity.color = calendar.color || '#007bff';
    ormEntity.settings = calendar.settings;
    ormEntity.availability = calendar.availability;

    return ormEntity;
  }
}
