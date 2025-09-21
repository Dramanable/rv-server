/**
 * 🏢 Business ORM Entity - Infrastructure Layer
 *
 * Entité TypeORM pour la persistance des données Business
 * Couche Infrastructure - Mapping objet-relationnel
 *
 * ⚠️ IMPORTANT: TypeScript 5.7+ Decorator Compatibility
 * Utilise la syntaxe des décorateurs TypeORM compatible avec TS 5.7+
 */

// Domain imports using TypeScript path aliases
import {
  Business,
  BusinessSector,
  BusinessStatus,
} from '@domain/entities/business.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { BusinessName } from '@domain/value-objects/business-name.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Address } from '@domain/value-objects/address.value-object';
import { FileUrl } from '@domain/value-objects/file-url.value-object';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  /**
   * 🔄 Business Entity Mapper
   * Convertit l'entité ORM vers l'entité Domain
   * Utilise les Value Objects de la couche Domain
   */
  toDomainEntity(): Business {
    // Utilise les imports statiques pour éviter les problèmes de résolution
    // Mapper les données ORM vers les structures Domain
    const businessId = BusinessId.create(this.id);
    const businessName = BusinessName.create(this.name);

    const contactInfo = {
      primaryEmail: Email.create(this.contact_info.primary_email),
      secondaryEmails:
        this.contact_info.secondary_emails?.map((e: string) =>
          Email.create(e),
        ) || [],
      primaryPhone: Phone.create(this.contact_info.primary_phone),
      secondaryPhones:
        this.contact_info.secondary_phones?.map((p: string) =>
          Phone.create(p),
        ) || [],
      website: this.contact_info.website,
      socialMedia: this.contact_info.social_media,
    };

    const address = Address.create({
      street: this.address.street,
      city: this.address.city,
      postalCode: this.address.postal_code,
      country: this.address.country,
      region: this.address.region,
    });

    const branding = {
      logoUrl: this.branding?.logo_url
        ? FileUrl.createS3Url(
            'uploads',
            this.branding.logo_url,
            this.branding.logo_url,
          )
        : undefined,
      coverImageUrl: this.branding?.cover_image_url
        ? FileUrl.createS3Url(
            'uploads',
            this.branding.cover_image_url,
            this.branding.cover_image_url,
          )
        : undefined,
      brandColors: this.branding?.brand_colors
        ? {
            primary: this.branding.brand_colors.primary || '#000000',
            secondary: this.branding.brand_colors.secondary || '#666666',
            accent: this.branding.brand_colors.accent,
          }
        : undefined,
      images: [],
    };

    const settings = {
      timezone: this.settings.timezone,
      currency: this.settings.currency,
      language: this.settings.language,
      appointmentSettings: {
        defaultDuration: this.settings.appointment_settings.default_duration,
        bufferTime: this.settings.appointment_settings.buffer_time,
        advanceBookingLimit:
          this.settings.appointment_settings.advance_booking_limit,
        cancellationPolicy:
          this.settings.appointment_settings.cancellation_policy,
      },
      notificationSettings: {
        emailNotifications:
          this.settings.notification_settings.email_notifications,
        smsNotifications: this.settings.notification_settings.sms_notifications,
        reminderTime: this.settings.notification_settings.reminder_time,
      },
    };

    // Utiliser le constructeur Business avec toutes les propriétés
    return new Business(
      businessId,
      businessName,
      this.description,
      this.slogan || '',
      this.sector as BusinessSector,
      branding,
      address,
      contactInfo,
      settings,
      this.status as BusinessStatus,
      this.created_at,
      this.updated_at,
    );
  }

  /**
   * 🔄 Domain Entity Mapper
   * Convertit l'entité Domain vers l'entité ORM
   */
  static fromDomainEntity(business: any): BusinessOrmEntity {
    const ormEntity = new BusinessOrmEntity();

    // Mapper les propriétés business domain vers ORM
    if (business.id)
      ormEntity.id = business.id.getValue
        ? business.id.getValue()
        : business.id;
    ormEntity.name = business.name?.getValue
      ? business.name.getValue()
      : business.name;
    ormEntity.description = business.description;
    ormEntity.slogan = business.slogan || null;
    ormEntity.sector = business.sector;
    ormEntity.status = business.status;

    // Mapper les données contact
    const contactInfo = business.contactInfo || business.contact_info;
    ormEntity.primary_email = contactInfo?.primaryEmail?.getValue
      ? contactInfo.primaryEmail.getValue()
      : contactInfo?.primaryEmail;
    ormEntity.primary_phone = contactInfo?.primaryPhone?.getValue
      ? contactInfo.primaryPhone.getValue()
      : contactInfo?.primaryPhone;

    ormEntity.contact_info = {
      primary_email: ormEntity.primary_email,
      secondary_emails:
        contactInfo?.secondaryEmails?.map((e: any) =>
          e.getValue ? e.getValue() : e,
        ) || [],
      primary_phone: ormEntity.primary_phone,
      secondary_phones:
        contactInfo?.secondaryPhones?.map((p: any) =>
          p.getValue ? p.getValue() : p,
        ) || [],
      website: contactInfo?.website,
      social_media: contactInfo?.socialMedia,
    };

    // Mapper l'adresse
    const address = business.address;
    ormEntity.address = {
      street: address?.street || address?.getStreet?.() || '',
      city: address?.city || address?.getCity?.() || '',
      postal_code: address?.postalCode || address?.getPostalCode?.() || '',
      country: address?.country || address?.getCountry?.() || '',
      region: address?.region || address?.getRegion?.(),
    };

    // Mapper le branding
    const branding = business.branding;
    ormEntity.branding = branding
      ? {
          logo_url: branding.logoUrl?.getValue
            ? branding.logoUrl.getValue()
            : branding.logoUrl,
          cover_image_url: branding.coverImageUrl?.getValue
            ? branding.coverImageUrl.getValue()
            : branding.coverImageUrl,
          brand_colors: branding.brandColors,
        }
      : null;

    // Mapper les settings
    const settings = business.settings;
    ormEntity.settings = {
      timezone: settings.timezone,
      currency: settings.currency,
      language: settings.language,
      appointment_settings: {
        default_duration: settings.appointmentSettings.defaultDuration,
        buffer_time: settings.appointmentSettings.bufferTime,
        advance_booking_limit: settings.appointmentSettings.advanceBookingLimit,
        cancellation_policy: settings.appointmentSettings.cancellationPolicy,
      },
      notification_settings: {
        email_notifications: settings.notificationSettings.emailNotifications,
        sms_notifications: settings.notificationSettings.smsNotifications,
        reminder_time: settings.notificationSettings.reminderTime,
      },
    };

    ormEntity.logo_url = ormEntity.branding?.logo_url || null;

    return ormEntity;
  }
}
