/**
 * 🏢 Business ORM Entity - Infrastructure Layer
 *
 * Entité TypeORM pour la persistance des données Business
 * Couche Infrastructure - Mapping objet-relationnel
 *
 * ⚠️ IMPORTANT: TypeScript 5.7+ Decorator Compatibility
 * Utilise la syntaxe des décorateurs TypeORM compatible avec TS 5.7+
 */

// TypeORM imports
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// ✅ Only import enums for type constraints - Clean Architecture compliant
import { BusinessSectorOrmEntity } from './business-sector-orm.entity';

@Entity('businesses')
@Index(['name'])
@Index(['status'])
@Index(['business_sector_id'])
@Index(['created_at'])
export class BusinessOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  slogan!: string | null;

  @Column({ type: 'uuid', nullable: true })
  business_sector_id!: string | null;

  @ManyToOne(() => BusinessSectorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'business_sector_id' })
  businessSector!: BusinessSectorOrmEntity | null;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'PENDING_VERIFICATION',
  })
  status!: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  primary_email!: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  primary_phone!: string;

  // Address as JSON
  @Column({ type: 'jsonb', nullable: false })
  address!: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    region?: string;
  };

  // Contact Info as JSON
  @Column({ type: 'jsonb', nullable: false })
  contact_info!: {
    primary_email: string;
    secondary_emails?: string[];
    primary_phone: string;
    secondary_phones?: string[];
    website?: string;
    social_media?: Record<string, string>;
  };

  // Branding as JSON
  @Column({ type: 'jsonb', nullable: true })
  branding!: {
    logo_url?: string;
    cover_image_url?: string;
    brand_colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    theme?: 'light' | 'dark' | 'auto';
  } | null;

  // Settings as JSON
  @Column({ type: 'jsonb', nullable: false })
  settings!: {
    timezone: string;
    currency: string;
    language: string;
    appointment_settings: {
      default_duration: number;
      buffer_time: number;
      advance_booking_limit: number;
      cancellation_policy: string;
    };
    notification_settings: {
      email_notifications: boolean;
      sms_notifications: boolean;
      reminder_time: number;
    };
  };

  // ✅ Business Configuration - New structured configuration fields
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'Europe/Paris',
  })
  @Index()
  configuration_timezone!: string;

  @Column({ type: 'varchar', length: 3, nullable: false, default: 'EUR' })
  @Index()
  configuration_currency!: string;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'fr-FR' })
  configuration_locale!: string;

  @Column({ type: 'smallint', nullable: false, default: 1 })
  configuration_first_day_of_week!: number;

  @Column({
    type: 'int',
    array: true,
    nullable: false,
    default: [1, 2, 3, 4, 5],
  })
  configuration_business_week_days!: number[];

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  configuration_updated_at!: Date;

  // Business Hours as JSON - Flexible schedule management
  @Column({ type: 'jsonb', nullable: false })
  business_hours!: {
    weekly_schedule: {
      [key: string]: {
        is_open: boolean;
        time_slots: Array<{
          start_time: string;
          end_time: string;
        }>;
      };
    };
    special_dates: Array<{
      date: string;
      type: 'CLOSED' | 'SPECIAL_HOURS' | 'HOLIDAY' | 'MAINTENANCE';
      label?: string;
      time_slots?: Array<{
        start_time: string;
        end_time: string;
      }>;
    }>;
    timezone: string;
  };

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // 🖼️ Relations for image management
  @OneToMany('BusinessImageOrmEntity', 'business', { lazy: true })
  images?: any[]; // Lazy loaded to avoid circular imports

  @OneToMany('BusinessGalleryOrmEntity', 'business', { lazy: true })
  galleries?: any[]; // Lazy loaded to avoid circular imports

  // ✅ NO MAPPING LOGIC HERE
  // Use dedicated mappers in /infrastructure/mappers/ instead
  // This follows Clean Architecture principles
}
