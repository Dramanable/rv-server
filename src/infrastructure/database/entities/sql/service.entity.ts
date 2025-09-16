/**
 *import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';️ Service Entity ORM - TypeORM + Clean Architecture
 * 
 * Entity ORM pour la table services avec mapping complet
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BusinessEntity } from './business.entity';

export interface ServiceSettings {
  isOnlineBookingEnabled?: boolean;
  requiresApproval?: boolean;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  bufferTimeBefore?: number; // en minutes
  bufferTimeAfter?: number; // en minutes
  isGroupBookingAllowed?: boolean;
  maxGroupSize?: number;
  autoConfirm?: boolean;
  allowCancellation?: boolean;
  cancellationDeadlineHours?: number;
}

export interface ServiceRequirements {
  preparation?: string;
  materials?: string[];
  restrictions?: string[];
  cancellationPolicy?: string;
  ageRestrictions?: {
    minAge?: number;
    maxAge?: number;
  };
  healthRestrictions?: string[];
}

export type ServiceCurrency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD' | 'CHF' | 'JPY';

@Entity('services')
@Index(['businessId', 'name'], { unique: true })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'business_id' })
  businessId!: string;

  // Service information
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  // Duration and pricing
  @Column({ type: 'integer' })
  duration!: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_amount' })
  priceAmount!: number;

  @Column({ 
    type: 'enum',
    enum: ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY'],
    default: 'EUR',
    name: 'price_currency'
  })
  priceCurrency!: ServiceCurrency;

  // Settings as JSON
  @Column({ type: 'jsonb', default: '{}' })
  settings!: ServiceSettings;

  // Requirements as JSON
  @Column({ type: 'jsonb', default: '{}' })
  requirements!: ServiceRequirements;

  // Status
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

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

  // Helper methods
  getPrice(): { amount: number; currency: ServiceCurrency } {
    return {
      amount: this.priceAmount,
      currency: this.priceCurrency,
    };
  }

  setPrice(amount: number, currency: ServiceCurrency): void {
    this.priceAmount = amount;
    this.priceCurrency = currency;
  }

  getDurationInHours(): number {
    return this.duration / 60;
  }

  isOnlineBookingEnabled(): boolean {
    return this.settings.isOnlineBookingEnabled === true;
  }

  requiresApproval(): boolean {
    return this.settings.requiresApproval === true;
  }

  isGroupBookingAllowed(): boolean {
    return this.settings.isGroupBookingAllowed === true;
  }

  getMaxGroupSize(): number {
    return this.settings.maxGroupSize || 1;
  }

  getBufferTime(): { before: number; after: number } {
    return {
      before: this.settings.bufferTimeBefore || 0,
      after: this.settings.bufferTimeAfter || 0,
    };
  }

  getAdvanceBookingLimits(): { maxDays?: number; minHours?: number } {
    return {
      maxDays: this.settings.maxAdvanceBookingDays,
      minHours: this.settings.minAdvanceBookingHours,
    };
  }

  hasMaterials(): boolean {
    return (this.requirements.materials?.length || 0) > 0;
  }

  hasRestrictions(): boolean {
    return (this.requirements.restrictions?.length || 0) > 0;
  }

  hasAgeRestrictions(): boolean {
    return this.requirements.ageRestrictions?.minAge !== undefined || 
           this.requirements.ageRestrictions?.maxAge !== undefined;
  }

  updateSettings(settings: Partial<ServiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  updateRequirements(requirements: Partial<ServiceRequirements>): void {
    this.requirements = { ...this.requirements, ...requirements };
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }
}
