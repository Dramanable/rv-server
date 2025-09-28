/**
 * 📅 DOMAIN ENTITY - Appointment
 * Clean Architecture - Domain Layer
 * Entité métier avec logique de validation
 */

import { AppointmentStatusError } from '@domain/exceptions/appointment.exceptions';
import { AppointmentId } from '@domain/value-objects/appointment-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { TimeSlot } from '@domain/value-objects/time-slot.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';

// ✅ OBLIGATOIRE - Export des Value Objects utilisés par les Use Cases
export { AppointmentId } from '@domain/value-objects/appointment-id.value-object';

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

export interface AppointmentNote {
  id: string; // ✅ Ajouté pour les tests
  authorId: UserId; // ✅ Ajouté pour les tests
  content: string;
  createdAt: Date;
  isPrivate: boolean; // ✅ Ajouté pour les tests
  createdBy?: string; // Conservé pour compatibilité
}

export interface ClientInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: Email;
  readonly phone?: Phone;
  readonly dateOfBirth?: Date;
  readonly isNewClient?: boolean;
  readonly notes?: string;
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
      | 'FRIEND'
      | 'OTHER';
    readonly relationshipDescription?: string;
  };
}

export interface AppointmentPricing {
  readonly basePrice: Money;
  readonly finalPrice: Money;
  readonly totalAmount: Money;
  readonly discounts?: Array<{
    readonly type: string;
    readonly amount: Money;
    readonly description: string;
  }>;
  readonly taxes?: Array<{
    readonly type: string;
    readonly rate: number;
    readonly amount: Money;
  }>;
  readonly paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
}

// MAIN ENTITY

export class Appointment {
  private constructor(
    private readonly _id: AppointmentId,
    private readonly _businessId: BusinessId,
    private readonly _calendarId: CalendarId, // ✅ Ajouté
    private readonly _serviceId: ServiceId,
    private readonly _timeSlot: TimeSlot,
    private readonly _clientInfo: ClientInfo,
    private readonly _status: AppointmentStatus,
    private readonly _pricing: AppointmentPricing,
    private readonly _assignedStaffId?: UserId,
    private readonly _notes: AppointmentNote[] = [],
    private readonly _title?: string, // ✅ Ajouté
    private readonly _description?: string, // ✅ Ajouté
    private readonly _createdBy?: string,
    private readonly _updatedBy?: string,
    private readonly _createdAt: Date = new Date(),
    private readonly _updatedAt: Date = new Date(),
  ) {
    // Validation automatique via les value objects
  }

  static create(params: {
    businessId: BusinessId;
    calendarId: CalendarId; // ✅ Ajouté
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    pricing: AppointmentPricing;
    assignedStaffId?: UserId;
    notes?: AppointmentNote[];
    title?: string; // ✅ Ajouté
    description?: string; // ✅ Ajouté
    createdBy?: string;
  }): Appointment {
    const now = new Date();
    return new Appointment(
      AppointmentId.generate(),
      params.businessId,
      params.calendarId, // ✅ Ajouté
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      AppointmentStatus.REQUESTED,
      params.pricing,
      params.assignedStaffId,
      params.notes || [],
      params.title, // ✅ Ajouté
      params.description, // ✅ Ajouté
      params.createdBy,
      params.createdBy,
      now,
      now,
    );
  }

  static reconstruct(params: {
    id: AppointmentId;
    businessId: BusinessId;
    calendarId: CalendarId; // ✅ Ajouté
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    status: AppointmentStatus;
    pricing: AppointmentPricing;
    assignedStaffId?: UserId;
    notes?: AppointmentNote[];
    title?: string; // ✅ Ajouté
    description?: string; // ✅ Ajouté
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Appointment {
    return new Appointment(
      params.id,
      params.businessId,
      params.calendarId, // ✅ Ajouté
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      params.status,
      params.pricing,
      params.assignedStaffId,
      params.notes || [],
      params.title, // ✅ Ajouté
      params.description, // ✅ Ajouté
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  // GETTERS

  getId(): AppointmentId {
    return this._id;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  getServiceId(): ServiceId {
    return this._serviceId;
  }

  getTimeSlot(): TimeSlot {
    return this._timeSlot;
  }

  getClientInfo(): ClientInfo {
    return this._clientInfo;
  }

  getStatus(): AppointmentStatus {
    return this._status;
  }

  getPricing(): AppointmentPricing {
    return this._pricing;
  }

  getAssignedStaffId(): UserId | undefined {
    return this._assignedStaffId;
  }

  getNotes(): AppointmentNote[] {
    return this._notes;
  }

  getCreatedBy(): string | undefined {
    return this._createdBy;
  }

  getUpdatedBy(): string | undefined {
    return this._updatedBy;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // PROPERTY GETTERS FOR COMPATIBILITY WITH TESTS
  get id(): AppointmentId {
    return this._id;
  }

  get businessId(): BusinessId {
    return this._businessId;
  }

  get calendarId(): CalendarId {
    // ✅ Ajouté
    return this._calendarId;
  }

  get serviceId(): ServiceId {
    return this._serviceId;
  }

  get timeSlot(): TimeSlot {
    return this._timeSlot;
  }

  get clientInfo(): ClientInfo {
    return this._clientInfo;
  }

  get status(): AppointmentStatus {
    return this._status;
  }

  get pricing(): AppointmentPricing {
    return this._pricing;
  }

  get assignedStaffId(): UserId | undefined {
    return this._assignedStaffId;
  }

  get title(): string | undefined {
    // ✅ Ajouté
    return this._title;
  }

  get description(): string | undefined {
    // ✅ Ajouté
    return this._description;
  }

  get notes(): readonly AppointmentNote[] {
    return Object.freeze([...this._notes]);
  }

  get createdBy(): string | undefined {
    return this._createdBy;
  }

  get updatedBy(): string | undefined {
    return this._updatedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // BUSINESS METHODS

  addNote(noteParams: {
    authorId: UserId;
    content: string;
    isPrivate: boolean;
  }): Appointment {
    const newNote: AppointmentNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID unique simple
      authorId: noteParams.authorId,
      content: noteParams.content,
      createdAt: new Date(),
      isPrivate: noteParams.isPrivate,
    };

    const newNotes = [...this._notes, newNote];

    return new Appointment(
      this._id,
      this._businessId,
      this._calendarId,
      this._serviceId,
      this._timeSlot,
      this._clientInfo,
      this._status,
      this._pricing,
      this._assignedStaffId,
      newNotes,
      this._title,
      this._description,
      this._createdBy,
      this._updatedBy,
      this._createdAt,
      this._updatedAt,
    );
  }

  canBeModified(): boolean {
    return (
      this._status === AppointmentStatus.REQUESTED ||
      this._status === AppointmentStatus.CONFIRMED
    );
  }

  isFuture(): boolean {
    return this._timeSlot.getStartTime() > new Date();
  }

  canBeRescheduled(): boolean {
    return this.canBeModified() && this.isFuture();
  }

  isActive(): boolean {
    return (
      this._status === AppointmentStatus.CONFIRMED ||
      this._status === AppointmentStatus.IN_PROGRESS
    );
  }

  isCompleted(): boolean {
    return this._status === AppointmentStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this._status === AppointmentStatus.CANCELLED;
  }

  confirm(updatedBy?: string): Appointment {
    if (this._status !== AppointmentStatus.REQUESTED) {
      throw new AppointmentStatusError(this._status, 'confirm', {
        appointmentId: this._id.getValue(),
      });
    }

    return new Appointment(
      this._id,
      this._businessId,
      this._calendarId, // ✅ Ajouté
      this._serviceId,
      this._timeSlot,
      this._clientInfo,
      AppointmentStatus.CONFIRMED, // Nouveau statut
      this._pricing,
      this._assignedStaffId,
      this._notes,
      this._title, // ✅ Ajouté
      this._description, // ✅ Ajouté
      this._createdBy,
      updatedBy || this._updatedBy,
      this._createdAt,
      new Date(), // Nouvelle date de mise à jour
    );
  }

  cancel(reason?: string, updatedBy?: string): Appointment {
    if (!this.canBeModified()) {
      throw new AppointmentStatusError(this._status, 'cancel', {
        appointmentId: this._id.getValue(),
      });
    }

    const newNotes = [...this._notes];
    if (reason) {
      // Si updatedBy n'est pas fourni, ne pas ajouter d'authorId pour éviter l'erreur
      newNotes.push({
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authorId: updatedBy ? UserId.create(updatedBy) : UserId.generate(), // Utiliser un UUID généré si pas d'updatedBy
        content: `Cancelled: ${reason}`,
        createdAt: new Date(),
        isPrivate: false,
        createdBy: updatedBy,
      });
    }

    return new Appointment(
      this._id,
      this._businessId,
      this._calendarId, // ✅ Ajouté
      this._serviceId,
      this._timeSlot,
      this._clientInfo,
      AppointmentStatus.CANCELLED, // Nouveau statut
      this._pricing,
      this._assignedStaffId,
      newNotes,
      this._title, // ✅ Ajouté
      this._description, // ✅ Ajouté
      this._createdBy,
      updatedBy || this._updatedBy,
      this._createdAt,
      new Date(), // Nouvelle date de mise à jour
    );
  }

  complete(updatedBy?: string): Appointment {
    if (
      this._status !== AppointmentStatus.CONFIRMED &&
      this._status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new AppointmentStatusError(this._status, 'complete', {
        appointmentId: this._id.getValue(),
      });
    }

    return new Appointment(
      this._id,
      this._businessId,
      this._calendarId, // ✅ Ajouté
      this._serviceId,
      this._timeSlot,
      this._clientInfo,
      AppointmentStatus.COMPLETED, // Nouveau statut
      this._pricing,
      this._assignedStaffId,
      this._notes,
      this._title, // ✅ Ajouté
      this._description, // ✅ Ajouté
      this._createdBy,
      updatedBy || this._updatedBy,
      this._createdAt,
      new Date(), // Nouvelle date de mise à jour
    );
  }

  markNoShow(updatedBy?: string): Appointment {
    if (this._status !== AppointmentStatus.CONFIRMED) {
      throw new AppointmentStatusError(this._status, 'mark as no-show', {
        appointmentId: this._id.getValue(),
      });
    }

    return new Appointment(
      this._id,
      this._businessId,
      this._calendarId, // ✅ Ajouté
      this._serviceId,
      this._timeSlot,
      this._clientInfo,
      AppointmentStatus.NO_SHOW, // Nouveau statut
      this._pricing,
      this._assignedStaffId,
      this._notes,
      this._title, // ✅ Ajouté
      this._description, // ✅ Ajouté
      this._createdBy,
      updatedBy || this._updatedBy,
      this._createdAt,
      new Date(), // Nouvelle date de mise à jour
    );
  }

  // HELPER METHODS FOR COMPATIBILITY

  getScheduledAt(): Date {
    return this._timeSlot.getStartTime();
  }

  getDuration(): number {
    return this._timeSlot.getDurationMinutes();
  }

  getDurationMinutes(): number {
    return this._timeSlot.getDurationMinutes();
  }

  // FAMILY BOOKING METHODS
  isBookedForFamilyMember(): boolean {
    return !!this._clientInfo.bookedBy;
  }

  getBookedByInfo(): ClientInfo['bookedBy'] {
    return this._clientInfo.bookedBy;
  }

  hasValidFamilyRelationship(): boolean {
    if (!this._clientInfo.bookedBy) {
      return true; // Pas de contrainte si pas de bookedBy
    }

    const { relationship, relationshipDescription } = this._clientInfo.bookedBy;

    // Si relationship est "OTHER", il faut une description
    if (relationship === 'OTHER' && !relationshipDescription?.trim()) {
      return false;
    }

    return true;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id.getValue(),
      businessId: this._businessId.getValue(),
      serviceId: this._serviceId.getValue(),
      timeSlot: {
        startTime: this._timeSlot.getStartTime().toISOString(),
        endTime: this._timeSlot.getEndTime().toISOString(),
        durationMinutes: this._timeSlot.getDurationMinutes(),
      },
      clientInfo: {
        firstName: this._clientInfo.firstName,
        lastName: this._clientInfo.lastName,
        email: this._clientInfo.email.getValue(),
        phone: this._clientInfo.phone?.getValue(),
        dateOfBirth: this._clientInfo.dateOfBirth?.toISOString(),
        isNewClient: this._clientInfo.isNewClient,
        notes: this._clientInfo.notes,
        bookedBy: this._clientInfo.bookedBy
          ? {
              firstName: this._clientInfo.bookedBy.firstName,
              lastName: this._clientInfo.bookedBy.lastName,
              email: this._clientInfo.bookedBy.email.getValue(),
              phone: this._clientInfo.bookedBy.phone?.getValue(),
              relationship: this._clientInfo.bookedBy.relationship,
              relationshipDescription:
                this._clientInfo.bookedBy.relationshipDescription,
            }
          : undefined,
      },
      status: this._status,
      pricing: {
        basePrice: {
          amount: this._pricing.basePrice.getAmount(),
          currency: this._pricing.basePrice.getCurrency(),
        },
        finalPrice: {
          amount: this._pricing.finalPrice.getAmount(),
          currency: this._pricing.finalPrice.getCurrency(),
        },
        totalAmount: {
          amount: this._pricing.totalAmount.getAmount(),
          currency: this._pricing.totalAmount.getCurrency(),
        },
        paymentStatus: this._pricing.paymentStatus,
        discounts: this._pricing.discounts,
        taxes: this._pricing.taxes,
      },
      assignedStaffId: this._assignedStaffId?.getValue(),
      notes: this._notes,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
