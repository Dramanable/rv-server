import { BusinessId } from '../value-objects/business-id.value-object';
import { BusinessName } from '../value-objects/business-name.value-object';
import { Email } from '../value-objects/email.value-object';
import { Phone } from '../value-objects/phone.value-object';
import { Address } from '../value-objects/address.value-object';
import { FileUrl } from '../value-objects/file-url.value-object';

export enum BusinessSector {
  LEGAL = 'LEGAL', // Avocats, Notaires
  MEDICAL = 'MEDICAL', // Médecins, Dentistes
  HEALTH = 'HEALTH', // Cliniques, Physiothérapie
  BEAUTY = 'BEAUTY', // Coiffeurs, Esthétique
  CONSULTING = 'CONSULTING', // Consultants
  FINANCE = 'FINANCE', // Comptables, Conseillers
  EDUCATION = 'EDUCATION', // Formations, Cours
  WELLNESS = 'WELLNESS', // Massage, Bien-être
  AUTOMOTIVE = 'AUTOMOTIVE', // Garages, Contrôle technique
  OTHER = 'OTHER'
}

export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
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
    private readonly _sector: BusinessSector,
    private readonly _branding: BusinessBranding,
    private readonly _address: Address,
    private readonly _contactInfo: BusinessContactInfo,
    private readonly _settings: BusinessSettings,
    private _status: BusinessStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date
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

  get sector(): BusinessSector {
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

  // Factory method
  static create(data: {
    name: string;
    description: string;
    slogan?: string;
    sector: BusinessSector;
    address: Address;
    contactInfo: BusinessContactInfo;
    settings?: Partial<BusinessSettings>;
  }): Business {
    const defaultSettings: BusinessSettings = {
      timezone: 'Europe/Paris',
      currency: 'EUR',
      language: 'fr',
      appointmentSettings: {
        defaultDuration: 30,
        bufferTime: 5,
        advanceBookingLimit: 30,
        cancellationPolicy: '24h avant le rendez-vous'
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        reminderTime: 24
      }
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
      BusinessStatus.PENDING_VERIFICATION,
      new Date(),
      new Date()
    );
  }

  // Business rules
  public isActive(): boolean {
    return this._status === BusinessStatus.ACTIVE;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive();
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
