/**
 * 🏢 Business Entity ORM - TypeORM + Clean Architecture
 * 
 * Entity ORM pour la table businesses avec mapping complet
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export type BusinessType = 
  | 'CLINIC' | 'DENTAL_CLINIC' | 'VETERINARY_CLINIC' | 'MEDICAL_CENTER'
  | 'LAW_FIRM' | 'LEGAL_SERVICES' | 'NOTARY'
  | 'BEAUTY_SALON' | 'BARBER_SHOP' | 'SPA' | 'NAIL_SALON'
  | 'FITNESS_CENTER' | 'GYM' | 'YOGA_STUDIO' | 'PILATES_STUDIO'
  | 'CONSULTING' | 'COACHING' | 'THERAPY'
  | 'RESTAURANT' | 'CAFE' | 'BAR'
  | 'AUTOMOTIVE' | 'GARAGE' | 'CAR_WASH'
  | 'EDUCATION' | 'TRAINING_CENTER' | 'LANGUAGE_SCHOOL'
  | 'REAL_ESTATE' | 'INSURANCE' | 'FINANCE'
  | 'OTHER';

export type BusinessStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface BusinessBranding {
  logoUrl?: string;
  coverImageUrl?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  images?: string[];
}

export interface BusinessContactInfo {
  primaryEmail: string;
  secondaryEmails?: string[];
  primaryPhone: string;
  secondaryPhones?: string[];
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface BusinessSettings {
  timezone?: string;
  currency?: string;
  language?: string;
  appointmentSettings?: {
    defaultDuration?: number;
    bufferTime?: number;
    advanceBookingLimit?: number;
    cancellationPolicy?: string;
  };
  notificationSettings?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    reminderTime?: number;
  };
}

@Entity('businesses')
export class BusinessEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slogan?: string;

  @Column({ 
    type: 'enum',
    enum: [
      'CLINIC', 'DENTAL_CLINIC', 'VETERINARY_CLINIC', 'MEDICAL_CENTER',
      'LAW_FIRM', 'LEGAL_SERVICES', 'NOTARY',
      'BEAUTY_SALON', 'BARBER_SHOP', 'SPA', 'NAIL_SALON',
      'FITNESS_CENTER', 'GYM', 'YOGA_STUDIO', 'PILATES_STUDIO',
      'CONSULTING', 'COACHING', 'THERAPY',
      'RESTAURANT', 'CAFE', 'BAR',
      'AUTOMOTIVE', 'GARAGE', 'CAR_WASH',
      'EDUCATION', 'TRAINING_CENTER', 'LANGUAGE_SCHOOL',
      'REAL_ESTATE', 'INSURANCE', 'FINANCE',
      'OTHER'
    ]
  })
  type!: BusinessType;

  @Column({ 
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  })
  status!: BusinessStatus;

  // Branding
  @Column({ type: 'text', nullable: true, name: 'logo_url' })
  logoUrl?: string;

  @Column({ type: 'text', nullable: true, name: 'cover_image_url' })
  coverImageUrl?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'brand_primary_color' })
  brandPrimaryColor?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'brand_secondary_color' })
  brandSecondaryColor?: string;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'brand_accent_color' })
  brandAccentColor?: string;

  @Column({ type: 'text', array: true, nullable: true, name: 'brand_images' })
  brandImages?: string[];

  // Contact information
  @Column({ type: 'varchar', length: 255, unique: true, name: 'primary_email' })
  primaryEmail!: string;

  @Column({ type: 'text', array: true, nullable: true, name: 'secondary_emails' })
  secondaryEmails?: string[];

  @Column({ type: 'varchar', length: 20, name: 'primary_phone' })
  primaryPhone!: string;

  @Column({ type: 'text', array: true, nullable: true, name: 'secondary_phones' })
  secondaryPhones?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  // Social media
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'facebook_url' })
  facebookUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'instagram_url' })
  instagramUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'linkedin_url' })
  linkedinUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'twitter_url' })
  twitterUrl?: string;

  // Settings as JSON
  @Column({ type: 'jsonb', default: '{}' })
  settings!: BusinessSettings;

  // Audit fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy?: string;

  // Relations will be defined later

  // Helper methods for domain mapping
  getBranding(): BusinessBranding {
    return {
      logoUrl: this.logoUrl,
      coverImageUrl: this.coverImageUrl,
      brandColors: {
        primary: this.brandPrimaryColor,
        secondary: this.brandSecondaryColor,
        accent: this.brandAccentColor,
      },
      images: this.brandImages,
    };
  }

  getContactInfo(): BusinessContactInfo {
    return {
      primaryEmail: this.primaryEmail,
      secondaryEmails: this.secondaryEmails,
      primaryPhone: this.primaryPhone,
      secondaryPhones: this.secondaryPhones,
      website: this.website,
      socialMedia: {
        facebook: this.facebookUrl,
        instagram: this.instagramUrl,
        linkedin: this.linkedinUrl,
        twitter: this.twitterUrl,
      },
    };
  }

  setBranding(branding: BusinessBranding): void {
    this.logoUrl = branding.logoUrl;
    this.coverImageUrl = branding.coverImageUrl;
    this.brandPrimaryColor = branding.brandColors?.primary;
    this.brandSecondaryColor = branding.brandColors?.secondary;
    this.brandAccentColor = branding.brandColors?.accent;
    this.brandImages = branding.images;
  }

  setContactInfo(contactInfo: BusinessContactInfo): void {
    this.primaryEmail = contactInfo.primaryEmail;
    this.secondaryEmails = contactInfo.secondaryEmails;
    this.primaryPhone = contactInfo.primaryPhone;
    this.secondaryPhones = contactInfo.secondaryPhones;
    this.website = contactInfo.website;
    this.facebookUrl = contactInfo.socialMedia?.facebook;
    this.instagramUrl = contactInfo.socialMedia?.instagram;
    this.linkedinUrl = contactInfo.socialMedia?.linkedin;
    this.twitterUrl = contactInfo.socialMedia?.twitter;
  }
}
