/**
 * 📅 DOMAIN ENTITY - Appointment
 * Clean Architecture - Domain Layer
 * Entité métier avec logique de validation
 */

import { AppointmentId } from '@domain/value-objects/appointment-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { TimeSlot } from '@domain/value-objects/time-slot.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { generateId } from '@shared/utils/id.utils';

// VALUE OBJECTS - Utilisation d'AppointmentId et TimeSlot depuis value-objects

// ENUMS

export enum AppointmentStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

// INTERFACES

export interface ClientInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: Email;
  readonly phone?: Phone;
  readonly dateOfBirth?: Date; // ✅ Ajout pour compatibilité BookAppointment
  readonly isNewClient?: boolean; // ✅ Ajout pour compatibilité BookAppointment
  readonly notes?: string; // ✅ Ajout pour compatibilité BookAppointment
  readonly bookedBy?: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: Email;
    readonly phone?: Phone;
    readonly relationship:
      | 'SPOUSE'
      | 'PARENT'
      | 'CHILD'
      | 'SIBLING'
      | 'GUARDIAN'
      | 'FAMILY_MEMBER'
      | 'OTHER';
    readonly relationshipDescription?: string;
  }; // ✅ Ajout pour Family Member Booking
}

export interface AppointmentPricing {
  readonly basePrice: Money;
  readonly finalPrice: Money;
  readonly totalAmount: Money;
  readonly paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
  readonly discounts?: Array<{
    readonly name: string;
    readonly amount: Money;
    readonly type: 'PERCENTAGE' | 'FIXED';
  }>; // ✅ Ajout des discounts pour compatibilité
}

// ENUMS

// MAIN ENTITY

export class Appointment {
  public readonly id: AppointmentId;
  public readonly businessId: BusinessId;
  public readonly calendarId?: string; // ✅ Ajout calendarId pour compatibilité tests
  public readonly serviceId: ServiceId;
  public readonly timeSlot: TimeSlot;
  public readonly clientInfo: ClientInfo;
  public readonly status: AppointmentStatus;
  public readonly pricing: AppointmentPricing;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly notes?: Array<{
    id: string;
    content: string;
    authorId: UserId;
    isPrivate: boolean;
    createdAt: Date;
  }>; // ✅ Ajout notes pour compatibilité tests
  public readonly assignedStaffId?: UserId; // ✅ Ajout pour compatibilité tests
  public readonly title?: string; // ✅ Ajout pour compatibilité tests
  public readonly description?: string; // ✅ Ajout pour compatibilité tests

  private constructor(
    id: AppointmentId,
    businessId: BusinessId,
    serviceId: ServiceId,
    timeSlot: TimeSlot,
    clientInfo: ClientInfo,
    status: AppointmentStatus,
    pricing: AppointmentPricing,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    calendarId?: string,
    notes?: Array<{
      id: string;
      content: string;
      authorId: UserId;
      isPrivate: boolean;
      createdAt: Date;
    }>,
    assignedStaffId?: UserId,
    title?: string,
    description?: string,
  ) {
    this.id = id;
    this.businessId = businessId;
    this.serviceId = serviceId;
    this.timeSlot = timeSlot;
    this.clientInfo = clientInfo;
    this.status = status;
    this.pricing = pricing;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.calendarId = calendarId;
    this.notes = notes;
    this.assignedStaffId = assignedStaffId;
    this.title = title;
    this.description = description;
  }

  static create(params: {
    businessId: BusinessId;
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    pricing: AppointmentPricing;
    calendarId?: string; // ✅ Ajout pour compatibilité tests
    assignedStaffId?: UserId; // ✅ Ajout pour compatibilité tests
    title?: string; // ✅ Ajout pour compatibilité tests
    description?: string; // ✅ Ajout pour compatibilité tests
  }): Appointment {
    return new Appointment(
      AppointmentId.generate(),
      params.businessId,
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      AppointmentStatus.REQUESTED,
      params.pricing,
      new Date(),
      new Date(),
      params.calendarId,
      undefined, // notes
      params.assignedStaffId,
      params.title,
      params.description,
    );
  }

  static reconstruct(params: {
    id: AppointmentId;
    businessId: BusinessId;
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    status: AppointmentStatus;
    pricing: AppointmentPricing;
    createdAt: Date;
    updatedAt: Date;
    calendarId?: string;
    notes?: Array<{
      id: string;
      content: string;
      authorId: UserId;
      isPrivate: boolean;
      createdAt: Date;
    }>;
    assignedStaffId?: UserId;
    title?: string;
    description?: string;
  }): Appointment {
    return new Appointment(
      params.id,
      params.businessId,
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      params.status,
      params.pricing,
      params.createdAt,
      params.updatedAt,
      params.calendarId,
      params.notes,
      params.assignedStaffId,
      params.title,
      params.description,
    );
  }

  // BUSINESS METHODS

  canBeModified(): boolean {
    return (
      this.status === AppointmentStatus.REQUESTED ||
      this.status === AppointmentStatus.CONFIRMED
    );
  }

  isFuture(): boolean {
    return this.timeSlot.getStartTime() > new Date();
  }

  // ✅ MÉTHODES DE COMPATIBILITÉ USE CASES
  getId(): AppointmentId {
    return this.id;
  }

  getBusinessId(): BusinessId {
    return this.businessId;
  }

  getServiceId(): ServiceId {
    return this.serviceId;
  }

  getStatus(): AppointmentStatus {
    return this.status;
  }

  getTimeSlot(): TimeSlot {
    return this.timeSlot;
  }

  getClientInfo(): ClientInfo {
    return this.clientInfo;
  }

  getPricing(): AppointmentPricing {
    return this.pricing;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getScheduledAt(): Date {
    return this.timeSlot.getStartTime();
  }

  getDuration(): number {
    return this.timeSlot.getDurationMinutes();
  }

  getDurationMinutes(): number {
    return this.timeSlot.getDurationMinutes();
  }

  // ✅ MÉTHODES FAMILY BOOKING (pour compatibilité tests)
  isBookedForFamilyMember(): boolean {
    return !!this.clientInfo.bookedBy;
  }

  getBookedByInfo(): any {
    return this.clientInfo.bookedBy;
  }

  hasValidFamilyRelationship(): boolean {
    if (!this.clientInfo.bookedBy) {
      return true; // Pas de contrainte si pas de bookedBy
    }

    const { relationship, relationshipDescription } = this.clientInfo.bookedBy;

    // Si relationship est "OTHER", il faut une description
    if (relationship === 'OTHER') {
      return (
        !!relationshipDescription && relationshipDescription.trim().length > 0
      );
    }

    // Pour les autres relationships, c'est valide
    return [
      'SPOUSE',
      'PARENT',
      'CHILD',
      'SIBLING',
      'GUARDIAN',
      'FAMILY_MEMBER',
    ].includes(relationship);
  }

  cancel(): Appointment {
    if (this.status === AppointmentStatus.CANCELLED) {
      throw new Error('Cannot cancel appointment with status CANCELLED');
    }
    if (this.status === AppointmentStatus.COMPLETED) {
      throw new Error('Cannot cancel appointment with status COMPLETED');
    }
    if (!this.canBeModified()) {
      throw new Error(
        'Cannot cancel appointment - status does not allow modification',
      );
    }

    return new Appointment(
      this.id,
      this.businessId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      AppointmentStatus.CANCELLED,
      this.pricing,
      this.createdAt,
      new Date(),
      this.calendarId,
      this.notes
        ? [
            ...this.notes,
            {
              id: generateId(),
              content: 'Client annulé',
              authorId: UserId.generate(),
              isPrivate: false,
              createdAt: new Date(),
            },
          ]
        : [
            {
              id: generateId(),
              content: 'Client annulé',
              authorId: UserId.generate(),
              isPrivate: false,
              createdAt: new Date(),
            },
          ],
      this.assignedStaffId,
      this.title,
      this.description,
    );
  }

  confirm(): Appointment {
    if (this.status !== AppointmentStatus.REQUESTED) {
      throw new Error('Cannot confirm appointment with status ' + this.status);
    }

    return new Appointment(
      this.id,
      this.businessId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      AppointmentStatus.CONFIRMED,
      this.pricing,
      this.createdAt,
      new Date(),
      this.calendarId,
      this.notes,
      this.assignedStaffId,
      this.title,
      this.description,
    );
  }

  complete(): Appointment {
    if (
      this.status !== AppointmentStatus.CONFIRMED &&
      this.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new Error('Cannot complete appointment with status ' + this.status);
    }

    return new Appointment(
      this.id,
      this.businessId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      AppointmentStatus.COMPLETED,
      this.pricing,
      this.createdAt,
      new Date(),
      this.calendarId,
      this.notes,
      this.assignedStaffId,
      this.title,
      this.description,
    );
  }

  addNote(noteData: {
    authorId: UserId;
    content: string;
    isPrivate: boolean;
  }): Appointment {
    if (!noteData.content || noteData.content.trim().length === 0) {
      throw new Error('Note cannot be empty');
    }

    const newNote = {
      id: generateId(),
      content: noteData.content.trim(),
      authorId: noteData.authorId,
      isPrivate: noteData.isPrivate,
      createdAt: new Date(),
    };

    return new Appointment(
      this.id,
      this.businessId,
      this.serviceId,
      this.timeSlot,
      this.clientInfo,
      this.status,
      this.pricing,
      this.createdAt,
      new Date(),
      this.calendarId,
      this.notes ? [...this.notes, newNote] : [newNote],
      this.assignedStaffId,
      this.title,
      this.description,
    );
  }
}

// Re-exports pour utilisation externe
export { AppointmentId } from '@domain/value-objects/appointment-id.value-object';
export { TimeSlot } from '@domain/value-objects/time-slot.value-object';
