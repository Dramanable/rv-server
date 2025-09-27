/**
 * 📅 DOMAIN ENTITY - Appointment
 * Clean Architecture - Domain Layer
 * Entité métier avec logique de validation
 */

import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { ServiceId } from "@domain/value-objects/service-id.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { Phone } from "@domain/value-objects/phone.value-object";
import { Money } from "@domain/value-objects/money.value-object";
import { AppointmentId } from "@domain/value-objects/appointment-id.value-object";
import { TimeSlot } from "@domain/value-objects/time-slot.value-object";
import { generateId } from "@shared/utils/id.utils";

// VALUE OBJECTS - Utilisation d'AppointmentId et TimeSlot depuis value-objects

// ENUMS

export enum AppointmentStatus {
  REQUESTED = "REQUESTED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
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
}

export interface AppointmentPricing {
  readonly basePrice: Money;
  readonly finalPrice: Money;
  readonly totalAmount: Money;
  readonly paymentStatus: "PENDING" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";
  readonly discounts?: Array<{
    readonly name: string;
    readonly amount: Money;
    readonly type: "PERCENTAGE" | "FIXED";
  }>; // ✅ Ajout des discounts pour compatibilité
}

// ENUMS

// MAIN ENTITY

export class Appointment {
  private constructor(
    private readonly _id: AppointmentId,
    private readonly _businessId: BusinessId,
    private readonly _serviceId: ServiceId,
    private readonly _timeSlot: TimeSlot,
    private readonly _clientInfo: ClientInfo,
    private readonly _status: AppointmentStatus,
    private readonly _pricing: AppointmentPricing,
    private readonly _createdAt: Date = new Date(),
    private readonly _updatedAt: Date = new Date(),
  ) {}

  static create(params: {
    businessId: BusinessId;
    serviceId: ServiceId;
    timeSlot: TimeSlot;
    clientInfo: ClientInfo;
    pricing: AppointmentPricing;
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

  // ✅ MÉTHODES DE COMPATIBILITÉ - Ajoutées pour compatibilité Use Cases
  getStatus(): AppointmentStatus {
    return this._status;
  }

  getTimeSlot(): TimeSlot {
    return this._timeSlot;
  }

  getClientInfo(): ClientInfo {
    return this._clientInfo;
  }

  getPricing(): AppointmentPricing {
    return this._pricing;
  }

  getScheduledAt(): Date {
    return this._timeSlot.getStartTime();
  }

  getDuration(): number {
    return this._timeSlot.getDurationMinutes();
  }

  cancel(): Appointment {
    if (!this.canBeModified()) {
      throw new Error(
        "Cannot cancel appointment - status does not allow modification",
      );
    }

    const cancelledAppointment = Object.create(this);
    cancelledAppointment._status = AppointmentStatus.CANCELLED;
    cancelledAppointment._updatedAt = new Date();
    return cancelledAppointment;
  }
}

// Re-exports pour utilisation externe
export { AppointmentId } from "@domain/value-objects/appointment-id.value-object";
export { TimeSlot } from "@domain/value-objects/time-slot.value-object";
