/**
 * 📅 DOMAIN ENTITY - Appointment
 * Clean Architecture - Domain Layer
 * Entité métier avec logique de validation
 */

import { AppointmentId } from '@domain/value-objects/appointment-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { TimeSlot } from '@domain/value-objects/time-slot.value-object';

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
}

export interface AppointmentPricing {
  readonly basePrice: { amount: number; currency: string };
  readonly finalPrice: { amount: number; currency: string };
  readonly totalAmount: { amount: number; currency: string };
  readonly paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
}

// MAIN ENTITY

export class Appointment {
  private constructor(
    private readonly _id: AppointmentId,
    private readonly _businessId: BusinessId,
    private readonly _serviceId: ServiceId,
    private readonly _timeSlot: TimeSlot,
    private readonly _clientInfo: ClientInfo,
    private _status: AppointmentStatus,
    private readonly _pricing: AppointmentPricing,
    private readonly _notes?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static create(params: {
    businessId: BusinessId;
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    pricing: AppointmentPricing;
    notes?: string;
  }): Appointment {
    return new Appointment(
      AppointmentId.generate(),
      params.businessId,
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      AppointmentStatus.REQUESTED,
      params.pricing,
      params.notes,
      new Date(),
      new Date(),
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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }): Appointment {
    return new Appointment(
      params.id,
      params.businessId,
      params.serviceId,
      params.timeSlot,
      params.clientInfo,
      params.status,
      params.pricing,
      params.notes,
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
  getNotes(): string | undefined {
    return this._notes;
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // BUSINESS METHODS

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

  confirm(): void {
    if (this._status !== AppointmentStatus.REQUESTED) {
      throw new Error('Only requested appointments can be confirmed');
    }
    this._status = AppointmentStatus.CONFIRMED;
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (!this.canBeModified()) {
      throw new Error('Appointment cannot be cancelled in current status');
    }
    this._status = AppointmentStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  reschedule(newTimeSlot: TimeSlot): void {
    if (!this.canBeRescheduled()) {
      throw new Error('Appointment cannot be rescheduled');
    }

    // Note: Dans une vraie implementation, on créerait un nouveau Appointment
    // car le TimeSlot est readonly, mais pour ce prototype on simule
    (this._timeSlot as any) = newTimeSlot;
    this._updatedAt = new Date();
  }
}
