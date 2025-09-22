/**
 * 🔧 Service ORM Entity - Infrastructure Layer
 *
 * Entité TypeORM pour la persistance des données Service
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

@Entity('services')
@Index(['business_id'])
@Index(['name'])
@Index(['category'])
@Index(['status'])
@Index(['created_at'])
export class ServiceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  business_id!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({
    type: 'enum',
    enum: [
      'CONSULTATION',
      'TREATMENT',
      'PROCEDURE',
      'EXAMINATION',
      'THERAPY',
      'MAINTENANCE',
      'EMERGENCY',
      'FOLLOWUP',
      'OTHER',
    ],
    default: 'OTHER',
  })
  @Index()
  category!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
    default: 'DRAFT',
  })
  @Index()
  status!: string;

  // Pricing as JSON - Support des pricing flexibles
  @Column({ type: 'jsonb', nullable: false })
  pricing!: {
    base_price: {
      amount: number;
      currency: string;
    } | null;
    discount_price?: {
      amount: number;
      currency: string;
    } | null;
    packages?: Array<{
      name: string;
      sessions: number;
      price: {
        amount: number;
        currency: string;
      };
      validity_days: number;
    }>;
  };

  // Configuration de pricing flexible
  @Column({ type: 'jsonb', nullable: false })
  @Index('IDX_services_pricing_config_type', {
    where: "(pricing_config->>'type') IS NOT NULL",
  })
  @Index('IDX_services_pricing_config_visibility', {
    where: "(pricing_config->>'visibility') IS NOT NULL",
  })
  pricing_config!: {
    type: 'FREE' | 'FIXED' | 'VARIABLE' | 'HIDDEN' | 'ON_DEMAND';
    visibility: 'PUBLIC' | 'AUTHENTICATED' | 'PRIVATE' | 'HIDDEN';
    basePrice?: {
      amount: number;
      currency: string;
    } | null;
    rules?: Array<{
      minDuration?: number;
      maxDuration?: number;
      basePrice: {
        amount: number;
        currency: string;
      };
      pricePerMinute?: {
        amount: number;
        currency: string;
      } | null;
    }>;
    description?: string | null;
  };

  // Scheduling as JSON
  @Column({ type: 'jsonb', nullable: false })
  scheduling!: {
    duration: number;
    buffer_time_before?: number;
    buffer_time_after?: number;
    allow_online_booking: boolean;
    requires_approval: boolean;
    advance_booking_limit?: number;
    cancellation_deadline?: number;
  };

  // Requirements as JSON
  @Column({ type: 'jsonb', nullable: true })
  requirements!: {
    preparation_instructions?: string;
    contraindications?: string[];
    required_documents?: string[];
    minimum_age?: number;
    maximum_age?: number;
    special_requirements?: string;
  } | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url!: string | null;

  // Assigned staff as JSON array
  @Column({ type: 'jsonb', nullable: false, default: '[]' })
  assigned_staff_ids!: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => BusinessOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessOrmEntity;
}
