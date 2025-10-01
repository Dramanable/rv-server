import { StaffRole } from '../../shared/enums/staff-role.enum';
import { BusinessId } from '../value-objects/business-id.value-object';
import { Email } from '../value-objects/email.value-object';
import { FileUrl } from '../value-objects/file-url.value-object';
import { Phone } from '../value-objects/phone.value-object';
import { UserId } from '../value-objects/user-id.value-object';

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
}

export interface StaffProfile {
  firstName: string;
  lastName: string;
  title?: string; // Dr., Me., etc.
  specialization?: string;
  bio?: string;
  profileImageUrl?: FileUrl;
  certifications?: string[];
  languages?: string[];
}

export interface StaffWorkingHours {
  dayOfWeek: number; // 0-6 (Dimanche-Samedi)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isWorkingDay: boolean;
}

export interface StaffAvailability {
  workingHours: StaffWorkingHours[];
  timeOff?: {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[];
  specialSchedule?: {
    date: Date;
    startTime?: string;
    endTime?: string;
    isAvailable: boolean;
  }[];
}

export interface StaffCalendarIntegration {
  calendarId?: string; // ID du calendrier personnel
  syncWithBusinessCalendar: boolean;
  overrideBusinessRules: boolean;
  personalBookingRules?: {
    requireApproval: boolean;
    minimumNotice: number; // minutes
    maximumAdvanceBooking: number; // jours
  };
}

export class Staff {
  constructor(
    private readonly _id: UserId,
    private readonly _businessId: BusinessId,
    private readonly _profile: StaffProfile,
    private readonly _role: StaffRole,
    private readonly _email: Email,
    private readonly _phone?: Phone,
    private _availability?: StaffAvailability,
    private _status: StaffStatus = StaffStatus.ACTIVE,
    private readonly _hireDate: Date = new Date(),
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _calendarIntegration?: StaffCalendarIntegration,
  ) {}

  // Getters
  get id(): UserId {
    return this._id;
  }

  get businessId(): BusinessId {
    return this._businessId;
  }

  get profile(): StaffProfile {
    return this._profile;
  }

  get role(): StaffRole {
    return this._role;
  }

  get email(): Email {
    return this._email;
  }

  get phone(): Phone | undefined {
    return this._phone;
  }

  get availability(): StaffAvailability | undefined {
    return this._availability;
  }

  get status(): StaffStatus {
    return this._status;
  }

  get hireDate(): Date {
    return this._hireDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get calendarIntegration(): StaffCalendarIntegration | undefined {
    return this._calendarIntegration;
  }

  get fullName(): string {
    return `${this._profile.title || ''} ${this._profile.firstName} ${this._profile.lastName}`.trim();
  }

  // Factory method
  static create(data: {
    businessId: BusinessId;
    profile: StaffProfile;
    role: StaffRole;
    email: string;
    phone?: string;
    availability?: StaffAvailability;
    calendarIntegration?: StaffCalendarIntegration;
  }): Staff {
    return new Staff(
      UserId.generate(),
      data.businessId,
      data.profile,
      data.role,
      Email.create(data.email),
      data.phone ? Phone.create(data.phone) : undefined,
      data.availability,
      StaffStatus.ACTIVE,
      new Date(),
      new Date(),
      new Date(),
      data.calendarIntegration,
    );
  }

  // Business rules
  public isActive(): boolean {
    return this._status === StaffStatus.ACTIVE;
  }

  public canAcceptAppointments(): boolean {
    return this.isActive() && this._status !== StaffStatus.ON_LEAVE;
  }

  public isOwner(): boolean {
    return this._role === StaffRole.OWNER;
  }

  public isManager(): boolean {
    return (
      [
        StaffRole.SITE_MANAGER,
        StaffRole.DEPARTMENT_HEAD,
        StaffRole.TEAM_LEAD,
      ].includes(this._role) || this.isOwner()
    );
  }

  public isPractitioner(): boolean {
    return [
      StaffRole.SENIOR_DOCTOR,
      StaffRole.DOCTOR,
      StaffRole.RESIDENT,
      StaffRole.SENIOR_DENTIST,
      StaffRole.DENTIST,
      StaffRole.DENTAL_STUDENT,
      StaffRole.SENIOR_LAWYER,
      StaffRole.LAWYER,
    ].includes(this._role);
  }

  public hasPermission(permission: string): boolean {
    switch (this._role) {
      case StaffRole.OWNER:
      case StaffRole.DIRECTOR:
        return true; // Toutes les permissions
      case StaffRole.SITE_MANAGER:
      case StaffRole.DEPARTMENT_HEAD:
      case StaffRole.TEAM_LEAD:
        return !permission.includes('owner'); // Toutes sauf propriétaire
      case StaffRole.SENIOR_DOCTOR:
      case StaffRole.DOCTOR:
      case StaffRole.SENIOR_DENTIST:
      case StaffRole.DENTIST:
      case StaffRole.SENIOR_LAWYER:
      case StaffRole.LAWYER:
        return [
          'view_appointments',
          'manage_own_appointments',
          'view_clients',
        ].includes(permission);
      case StaffRole.SENIOR_ASSISTANT:
      case StaffRole.ASSISTANT:
        return [
          'view_appointments',
          'create_appointments',
          'view_clients',
        ].includes(permission);
      case StaffRole.RECEPTIONIST:
        return [
          'view_appointments',
          'create_appointments',
          'manage_clients',
        ].includes(permission);
      default:
        return false;
    }
  }

  // Domain methods
  public updateProfile(profile: Partial<StaffProfile>): void {
    Object.assign(this._profile, profile);
    this._updatedAt = new Date();
  }

  public updateAvailability(availability: StaffAvailability): void {
    this._availability = availability;
    this._updatedAt = new Date();
  }

  public takeLeave(startDate: Date, endDate: Date, reason?: string): void {
    if (!this._availability) {
      this._availability = { workingHours: [] };
    }
    if (!this._availability.timeOff) {
      this._availability.timeOff = [];
    }

    this._availability.timeOff.push({
      startDate,
      endDate,
      reason,
    });
    this._updatedAt = new Date();
  }

  public isAvailableAt(dateTime: Date): boolean {
    if (!this.canAcceptAppointments()) {
      return false;
    }

    // Vérifier si en congé
    if (this._availability?.timeOff) {
      const isOnLeave = this._availability.timeOff.some(
        (leave) => dateTime >= leave.startDate && dateTime <= leave.endDate,
      );
      if (isOnLeave) return false;
    }

    // Vérifier les horaires de travail
    if (this._availability?.workingHours) {
      const dayOfWeek = dateTime.getDay();
      const timeStr = dateTime.toTimeString().substring(0, 5); // "HH:MM"

      const workingDay = this._availability.workingHours.find(
        (wh) => wh.dayOfWeek === dayOfWeek,
      );
      if (!workingDay?.isWorkingDay) return false;

      return timeStr >= workingDay.startTime && timeStr <= workingDay.endTime;
    }

    return true; // Par défaut disponible si pas d'horaires définis
  }

  public activate(): void {
    this._status = StaffStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._status = StaffStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  public suspend(): void {
    this._status = StaffStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  // Calendar integration methods
  public setCalendarIntegration(integration: StaffCalendarIntegration): void {
    this._calendarIntegration = integration;
    this._updatedAt = new Date();
  }

  public hasPersonalCalendar(): boolean {
    return !!this._calendarIntegration?.calendarId;
  }

  public canOverrideBusinessRules(): boolean {
    return this._calendarIntegration?.overrideBusinessRules || false;
  }

  /**
   * Vérifie si le membre du personnel peut être supprimé
   * Un staff peut être supprimé s'il n'est pas actif
   */
  public canBeDeleted(): boolean {
    return this._status !== StaffStatus.ACTIVE;
  }

  public getPersonalBookingRules(): StaffCalendarIntegration['personalBookingRules'] {
    return this._calendarIntegration?.personalBookingRules;
  }
}
