/* eslint-disable-next-line */
import {
  RequiredValueError,
  ValueOutOfRangeError,
} from '../exceptions/value-object.exceptions';
import { BusinessId } from '../value-objects/business-id.value-object';
import { CalendarId } from '../value-objects/calendar-id.value-object';
import { RecurrencePattern } from '../value-objects/recurrence-pattern.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { WorkingHours } from '../value-objects/working-hours.value-object';
import { CalendarType } from './calendar-type.entity';

// Re-export pour faciliter les imports
export { CalendarId } from '../value-objects/calendar-id.value-object';

export enum CalendarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface CalendarSettings {
  timezone: string;
  defaultSlotDuration: number; // minutes
  minimumNotice: number; // minutes avant qu'un créneau puisse être réservé
  maximumAdvanceBooking: number; // jours à l'avance maximum
  allowMultipleBookings: boolean;
  autoConfirmBookings: boolean;
  bufferTimeBetweenSlots: number; // minutes
}

export interface CalendarAvailability {
  workingHours: WorkingHours[]; // Horaires par jour de la semaine
  specialDates: {
    date: Date;
    isAvailable: boolean;
    specialHours?: WorkingHours;
    reason?: string;
  }[];
  holidays: {
    name: string;
    date: Date;
    recurrence?: RecurrencePattern;
  }[];
  maintenancePeriods: {
    startDate: Date;
    endDate: Date;
    reason: string;
    affectedTimeSlots?: TimeSlot[];
  }[];
}

export interface BookingRule {
  id: string;
  name: string;
  priority: number;
  conditions: {
    dayOfWeek?: number[];
    timeRange?: { start: string; end: string };
    dateRange?: { start: Date; end: Date };
    staffRole?: string[];
    serviceTypes?: string[];
  };
  actions: {
    requireApproval?: boolean;
    adjustDuration?: number;
    addBufferTime?: number;
    blockSlot?: boolean;
    customMessage?: string;
  };
}

export class Calendar {
  constructor(
    private readonly _id: CalendarId,
    private readonly _businessId: BusinessId,
    private readonly _type: CalendarType,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _settings: CalendarSettings,
    private readonly _availability: CalendarAvailability,
    private readonly _ownerId?: UserId, // Pour les calendriers staff
    private readonly _bookingRules: BookingRule[] = [],
    private readonly _status: CalendarStatus = CalendarStatus.ACTIVE,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    // 🟢 GREEN PHASE: Validation fonctionnelle qui fonctionne

    // Validation du nom - doit être non vide
    if (!this._name || this._name.trim().length === 0) {
      throw new RequiredValueError('calendar_name');
    }

    // Validation pour les calendriers STAFF - doivent avoir un ownerId
    if (this._type.getCode() === 'STAFF' && !this._ownerId) {
      throw new RequiredValueError('calendar_owner_id');
    }

    // Validation des paramètres techniques
    if (this._settings.defaultSlotDuration < 5) {
      throw new ValueOutOfRangeError(
        'default_slot_duration',
        this._settings.defaultSlotDuration,
        5,
        Number.MAX_SAFE_INTEGER,
      );
    }

    if (this._settings.minimumNotice < 0) {
      throw new ValueOutOfRangeError(
        'minimum_notice',
        this._settings.minimumNotice,
        0,
        Number.MAX_SAFE_INTEGER,
      );
    }

    // Valider les horaires de travail
    if (this._availability.workingHours.length !== 7) {
      throw new ValueOutOfRangeError(
        'working_hours_days',
        this._availability.workingHours.length,
        7,
        7,
      );
    }
  }

  // Getters
  get id(): CalendarId {
    return this._id;
  }

  get businessId(): BusinessId {
    return this._businessId;
  }

  get type(): CalendarType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get ownerId(): UserId | undefined {
    return this._ownerId;
  }

  get settings(): CalendarSettings {
    return { ...this._settings };
  }

  get availability(): CalendarAvailability {
    return {
      workingHours: [...this._availability.workingHours],
      specialDates: [...this._availability.specialDates],
      holidays: [...this._availability.holidays],
      maintenancePeriods: [...this._availability.maintenancePeriods],
    };
  }

  get bookingRules(): BookingRule[] {
    return [...this._bookingRules];
  }

  get status(): CalendarStatus {
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
    businessId: BusinessId;
    type: CalendarType;
    name: string;
    description: string;
    ownerId?: UserId;
    settings?: Partial<CalendarSettings>;
    workingHours?: WorkingHours[];
  }): Calendar {
    const defaultSettings: CalendarSettings = {
      timezone: 'Europe/Paris',
      defaultSlotDuration: 30,
      minimumNotice: 60,
      maximumAdvanceBooking: 30,
      allowMultipleBookings: false,
      autoConfirmBookings: true,
      bufferTimeBetweenSlots: 0,
    };

    // Horaires par défaut (9h-17h du lundi au vendredi)
    const defaultWorkingHours = data.workingHours || [
      WorkingHours.createNonWorkingDay(0), // Dimanche
      WorkingHours.createWithLunchBreak(1, '09:00', '17:00'), // Lundi
      WorkingHours.createWithLunchBreak(2, '09:00', '17:00'), // Mardi
      WorkingHours.createWithLunchBreak(3, '09:00', '17:00'), // Mercredi
      WorkingHours.createWithLunchBreak(4, '09:00', '17:00'), // Jeudi
      WorkingHours.createWithLunchBreak(5, '09:00', '17:00'), // Vendredi
      WorkingHours.createNonWorkingDay(6), // Samedi
    ];

    const availability: CalendarAvailability = {
      workingHours: defaultWorkingHours,
      specialDates: [],
      holidays: [],
      maintenancePeriods: [],
    };

    return new Calendar(
      CalendarId.generate(),
      data.businessId,
      data.type,
      data.name,
      data.description,
      { ...defaultSettings, ...data.settings },
      availability,
      data.ownerId,
    );
  }

  // Business rules
  public isActive(): boolean {
    return this._status === CalendarStatus.ACTIVE;
  }

  public canAcceptBookings(): boolean {
    return this.isActive() && this._status !== CalendarStatus.MAINTENANCE;
  }
}
