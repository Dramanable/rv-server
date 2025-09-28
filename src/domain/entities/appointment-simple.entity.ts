/**
 * 📅 DOMAIN ENTITY - Appointment
 * Clean Architecture - Domain Layer
 * Entité métier avec logique de validation
 */

import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { generateId } from '@shared/utils/id.utils';

// VALUE OBJECTS

export class AppointmentId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('AppointmentId cannot be empty');
    }
  }

  static create(value: string): AppointmentId {
    return new AppointmentId(value);
  }

  static generate(): AppointmentId {
    return new AppointmentId(generateId());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AppointmentId): boolean {
    return this.value === other.value;
  }
}

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
  readonly basePrice: Money;
  readonly finalPrice: Money;
  readonly totalAmount: Money;
  readonly paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
}

export interface TimeSlot {
  readonly startTime: Date;
  readonly endTime: Date;
  getStartTime(): Date;
  getEndTime(): Date;
  getDurationMinutes(): number;
}

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
}
