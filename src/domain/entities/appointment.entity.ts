import { BusinessId } from '../value-objects/business-id.value-object';
import { CalendarId } from '../value-objects/calendar-id.value-object';
import { ServiceId } from '../value-objects/service-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { Email } from '../value-objects/email.value-object';
import { Phone } from '../value-objects/phone.value-object';
import { Money } from '../value-objects/money.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';

/**
 * 📅 DOMAIN ENTITY - Appointment
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles
 * ✅ Rich Domain Model
 */

export class AppointmentId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('AppointmentId cannot be empty');
    }
  }

  static generate(): AppointmentId {
    return new AppointmentId(crypto.randomUUID());
  }

  static create(value: string): AppointmentId {
    return new AppointmentId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AppointmentId): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}

export enum AppointmentStatus {
  REQUESTED = 'REQUESTED', // Demande de rendez-vous
  CONFIRMED = 'CONFIRMED', // Confirmé par le business
  CANCELLED = 'CANCELLED', // Annulé
  NO_SHOW = 'NO_SHOW', // Client absent
  COMPLETED = 'COMPLETED', // Terminé avec succès
  IN_PROGRESS = 'IN_PROGRESS', // En cours
  RESCHEDULED = 'RESCHEDULED', // Reprogrammé
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  TREATMENT = 'TREATMENT',
  FOLLOWUP = 'FOLLOWUP',
  EMERGENCY = 'EMERGENCY',
  GROUP = 'GROUP',
  ONLINE = 'ONLINE',
}

export enum NotificationMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  CALL = 'CALL',
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: Email;
  phone?: Phone;
  dateOfBirth?: Date;
  notes?: string;
  isNewClient: boolean;
}

export interface AppointmentPricing {
  basePrice: Money;
  discounts?: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    reason?: string;
  }[];
  taxes?: {
    name: string;
    rate: number;
    amount: Money;
  }[];
  totalAmount: Money;
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  paymentMethod?: string;
}

export interface AppointmentReminder {
  method: NotificationMethod;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  template: string;
}

export interface AppointmentNote {
  id: string;
  authorId: UserId;
  content: string;
  isPrivate: boolean; // Visible seulement par le staff
  createdAt: Date;
  updatedAt?: Date;
}

export interface AppointmentMetadata {
  source: 'ONLINE' | 'PHONE' | 'WALK_IN' | 'ADMIN';
  userAgent?: string;
  ipAddress?: string;
  referralSource?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export class Appointment {
  constructor(
    public readonly id: AppointmentId,
    public readonly businessId: BusinessId,
    public readonly calendarId: CalendarId,
    public readonly serviceId: ServiceId,
    public readonly timeSlot: TimeSlot,
    public readonly clientInfo: ClientInfo,
    public readonly type: AppointmentType,
    public readonly status: AppointmentStatus,
    public readonly pricing: AppointmentPricing,
    public readonly assignedStaffId?: UserId,
    public readonly title?: string,
    public readonly description?: string,
    public readonly notes?: AppointmentNote[],
    public readonly reminders?: AppointmentReminder[],
    public readonly metadata?: AppointmentMetadata,
    public readonly parentAppointmentId?: AppointmentId, // Pour les rendez-vous de suivi
    public readonly recurringPattern?: {
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      interval: number;
      endDate?: Date;
      occurrences?: number;
    },
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Factory method pour créer un nouveau rendez-vous
   */
  static create(data: {
    businessId: BusinessId;
    calendarId: CalendarId;
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    type: AppointmentType;
    pricing: AppointmentPricing;
    assignedStaffId?: UserId;
    title?: string;
    description?: string;
    metadata?: AppointmentMetadata;
  }): Appointment {
    return new Appointment(
      AppointmentId.generate(),
      data.businessId,
      data.calendarId,
      data.serviceId,
      data.timeSlot,
      data.clientInfo,
      data.type,
      AppointmentStatus.REQUESTED,
      data.pricing,
      data.assignedStaffId,
      data.title,
      data.description,
      [],
      [],
      data.metadata,
    );
  }

  /**
   * Confirme le rendez-vous
   */
  confirm(): Appointment {
    if (this.status !== AppointmentStatus.REQUESTED) {
      throw new Error(`Cannot confirm appointment with status ${this.status}`);
    }

    return new Appointment(
      this.id,
      this.businessId,
      this.calendarId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      this.type,
      AppointmentStatus.CONFIRMED,
      this.pricing,
      this.assignedStaffId,
      this.title,
      this.description,
      this.notes,
      this.reminders,
      this.metadata,
      this.parentAppointmentId,
      this.recurringPattern,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Annule le rendez-vous
   */
  cancel(reason?: string): Appointment {
    if (
      this.status === AppointmentStatus.CANCELLED ||
      this.status === AppointmentStatus.COMPLETED
    ) {
      throw new Error(`Cannot cancel appointment with status ${this.status}`);
    }

    const cancelNote: AppointmentNote = {
      id: crypto.randomUUID(),
      authorId: UserId.generate(), // TODO: Get from context
      content: `Appointment cancelled. Reason: ${reason || 'No reason provided'}`,
      isPrivate: false,
      createdAt: new Date(),
    };

    return new Appointment(
      this.id,
      this.businessId,
      this.calendarId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      this.type,
      AppointmentStatus.CANCELLED,
      this.pricing,
      this.assignedStaffId,
      this.title,
      this.description,
      [...(this.notes || []), cancelNote],
      this.reminders,
      this.metadata,
      this.parentAppointmentId,
      this.recurringPattern,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Marque le rendez-vous comme terminé
   */
  complete(): Appointment {
    if (
      this.status !== AppointmentStatus.CONFIRMED &&
      this.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new Error(`Cannot complete appointment with status ${this.status}`);
    }

    return new Appointment(
      this.id,
      this.businessId,
      this.calendarId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      this.type,
      AppointmentStatus.COMPLETED,
      this.pricing,
      this.assignedStaffId,
      this.title,
      this.description,
      this.notes,
      this.reminders,
      this.metadata,
      this.parentAppointmentId,
      this.recurringPattern,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Ajoute une note au rendez-vous
   */
  addNote(note: Omit<AppointmentNote, 'id' | 'createdAt'>): Appointment {
    const newNote: AppointmentNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    return new Appointment(
      this.id,
      this.businessId,
      this.calendarId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      this.type,
      this.status,
      this.pricing,
      this.assignedStaffId,
      this.title,
      this.description,
      [...(this.notes || []), newNote],
      this.reminders,
      this.metadata,
      this.parentAppointmentId,
      this.recurringPattern,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Vérifie si le rendez-vous peut être modifié
   */
  canBeModified(): boolean {
    return (
      this.status === AppointmentStatus.REQUESTED ||
      this.status === AppointmentStatus.CONFIRMED
    );
  }

  /**
   * Vérifie si le rendez-vous est dans le futur
   */
  isFuture(): boolean {
    return this.timeSlot.getStartTime() > new Date();
  }

  /**
   * Vérifie si le rendez-vous est en cours
   */
  isInProgress(): boolean {
    const now = new Date();
    return (
      now >= this.timeSlot.getStartTime() && now <= this.timeSlot.getEndTime()
    );
  }

  /**
   * Calcule la durée du rendez-vous en minutes
   */
  getDurationMinutes(): number {
    return Math.round(
      (this.timeSlot.getEndTime().getTime() -
        this.timeSlot.getStartTime().getTime()) /
        (1000 * 60),
    );
  }
}
