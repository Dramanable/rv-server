import { BusinessId } from '../value-objects/business-id.value-object';
import { BusinessName } from '../value-objects/business-name.value-object';
import { Email } from '../value-objects/email.value-object';
import { Phone } from '../value-objects/phone.value-object';
import { Address } from '../value-objects/address.value-object';
import { FileUrl } from '../value-objects/file-url.value-object';
import { BusinessHours } from '../value-objects/business-hours.value-object';
import { BusinessSector } from './business-sector.entity';

// Réexporter BusinessSector pour compatibilité
export { BusinessSector } from './business-sector.entity';

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface BusinessBranding {
  logoUrl?: FileUrl;
  coverImageUrl?: FileUrl;
  brandColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  images?: FileUrl[];
}

export interface BusinessContactInfo {
  primaryEmail: Email;
  secondaryEmails?: Email[];
  primaryPhone: Phone;
  secondaryPhones?: Phone[];
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface BusinessSettings {
  timezone: string;
  currency: string;
  language: string;
  appointmentSettings: {
    defaultDuration: number; // en minutes
    bufferTime: number; // temps entre RDV
    advanceBookingLimit: number; // jours à l'avance
    cancellationPolicy: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reminderTime: number; // heures avant RDV
  };
}

export class Business {
  constructor(
    private readonly _id: BusinessId,
    private readonly _name: BusinessName,
    private readonly _description: string,
    private readonly _slogan: string,
    private readonly _sector: BusinessSector | null,
    private readonly _branding: BusinessBranding,
    private readonly _address: Address,
    private readonly _contactInfo: BusinessContactInfo,
    private readonly _settings: BusinessSettings,
    private _businessHours: BusinessHours,
    private _status: BusinessStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // Getters
  get id(): BusinessId {
    return this._id;
  }

  get name(): BusinessName {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get slogan(): string {
    return this._slogan;
  }

  get sector(): BusinessSector | null {
    return this._sector;
  }

  get branding(): BusinessBranding {
    return this._branding;
  }

  get address(): Address {
    return this._address;
  }

  get contactInfo(): BusinessContactInfo {
    return this._contactInfo;
  }

  get settings(): BusinessSettings {
    return this._settings;
  }

  get status(): BusinessStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get businessHours(): BusinessHours {
    return this._businessHours;
  }

  // Factory method
  static create(data: {
    name: string;
    description: string;
    slogan?: string;
    sector: BusinessSector | null;
    address: Address;
    contactInfo: BusinessContactInfo;
    settings?: Partial<BusinessSettings>;
    businessHours?: BusinessHours;
  }): Business {
    const defaultSettings: BusinessSettings = {
      timezone: 'Europe/Paris',
      currency: 'EUR',
      language: 'fr',
      appointmentSettings: {
        defaultDuration: 30,
        bufferTime: 5,
        advanceBookingLimit: 30,
        cancellationPolicy: '24h avant le rendez-vous',
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        reminderTime: 24,
      },
    };

    return new Business(
      BusinessId.generate(),
      BusinessName.create(data.name),
      data.description,
      data.slogan || '',
      data.sector,
      {},
      data.address,
      data.contactInfo,
      { ...defaultSettings, ...data.settings },
      data.businessHours ||
        BusinessHours.createStandardWeek([1, 2, 3, 4, 5], '09:00', '17:00'),
      BusinessStatus.PENDING_VERIFICATION,
      new Date(),
      new Date(),
    );
  }

  // Business rules
  public isActive(): boolean {
    return this._status === BusinessStatus.ACTIVE;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive();
  }

  // Business hours management
  public isOpenOnDay(dayOfWeek: number): boolean {
    return this._businessHours.isOpenOnDay(dayOfWeek);
  }

  public isOpenOnDate(date: Date): boolean {
    return this._businessHours.isOpenOnDate(date);
  }

  public isOpenAt(date: Date, time: string): boolean {
    if (!this.isActive()) {
      return false; // Business fermé si inactif
    }
    return this._businessHours.isOpenAt(date, time);
  }

  public getTimeSlotsForDay(dayOfWeek: number) {
    return this._businessHours.getTimeSlotsForDay(dayOfWeek);
  }

  public getTimeSlotsForDate(date: Date) {
    return this._businessHours.getTimeSlotsForDate(date);
  }

  public updateBusinessHours(newHours: BusinessHours): void {
    this._businessHours = newHours;
    this._updatedAt = new Date();
  }

  public updateBranding(branding: BusinessBranding): void {
    this._branding.logoUrl = branding.logoUrl;
    this._branding.coverImageUrl = branding.coverImageUrl;
    this._branding.brandColors = branding.brandColors;
    this._branding.images = branding.images;
    this._updatedAt = new Date();
  }

  public updateSettings(settings: Partial<BusinessSettings>): void {
    Object.assign(this._settings, settings);
    this._updatedAt = new Date();
  }

  // Domain events
  public activate(): void {
    if (this._status !== BusinessStatus.PENDING_VERIFICATION) {
      throw new Error('Business must be verified before activation');
    }
    this._status = BusinessStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  public suspend(): void {
    if (!this.isActive()) {
      throw new Error('Only active businesses can be suspended');
    }
    this._status = BusinessStatus.SUSPENDED;
    this._updatedAt = new Date();
  }
}
