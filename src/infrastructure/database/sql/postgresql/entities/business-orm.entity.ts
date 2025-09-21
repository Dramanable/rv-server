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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// ✅ Only import enums for type constraints - Clean Architecture compliant

@Entity('businesses')
@Index(['name'])
@Index(['status'])
@Index(['sector'])
@Index(['created_at'])
export class BusinessOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @Index()
  name!: string;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  slogan!: string | null;

  @Column({
    type: 'enum',
    enum: [
      'LEGAL',
      'MEDICAL',
      'HEALTH',
      'BEAUTY',
      'CONSULTING',
      'FINANCE',
      'EDUCATION',
      'WELLNESS',
      'AUTOMOTIVE',
      'OTHER',
    ],
    default: 'OTHER',
  })
  sector!: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
    default: 'PENDING_VERIFICATION',
  })
  @Index()
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

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;

  // ✅ NO MAPPING LOGIC HERE
  // Use dedicated mappers in /infrastructure/mappers/ instead
  // This follows Clean Architecture principles
}
