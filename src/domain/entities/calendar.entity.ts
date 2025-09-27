import { BusinessId } from "../value-objects/business-id.value-object";
import { CalendarId } from "../value-objects/calendar-id.value-object";
import { RecurrencePattern } from "../value-objects/recurrence-pattern.value-object";
import { TimeSlot } from "../value-objects/time-slot.value-object";
import { UserId } from "../value-objects/user-id.value-object";
import { WorkingHours } from "../value-objects/working-hours.value-object";

// Re-export pour faciliter les imports
export { CalendarId } from "../value-objects/calendar-id.value-object";

export enum CalendarType {
  BUSINESS = "BUSINESS", // Calendrier principal de l'entreprise
  STAFF = "STAFF", // Calendrier personnel d'un membre du personnel
  RESOURCE = "RESOURCE", // Calendrier pour une ressource (salle, équipement)
  SERVICE = "SERVICE", // Calendrier spécifique à un service
}

export enum CalendarStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
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
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Calendar name is required");
    }

    if (this._type === CalendarType.STAFF && !this._ownerId) {
      throw new Error("Staff calendar must have an owner");
    }

    if (this._settings.defaultSlotDuration < 5) {
      throw new Error("Default slot duration must be at least 5 minutes");
    }

    if (this._settings.minimumNotice < 0) {
      throw new Error("Minimum notice cannot be negative");
    }

    // Valider les horaires de travail
    if (this._availability.workingHours.length !== 7) {
      throw new Error(
        "Working hours must be defined for all 7 days of the week",
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
      timezone: "Europe/Paris",
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
      WorkingHours.createWithLunchBreak(1, "09:00", "17:00"), // Lundi
      WorkingHours.createWithLunchBreak(2, "09:00", "17:00"), // Mardi
      WorkingHours.createWithLunchBreak(3, "09:00", "17:00"), // Mercredi
      WorkingHours.createWithLunchBreak(4, "09:00", "17:00"), // Jeudi
      WorkingHours.createWithLunchBreak(5, "09:00", "17:00"), // Vendredi
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

  // Disponibilité et créneaux
  public isAvailableOnDate(date: Date): boolean {
    if (!this.canAcceptBookings()) return false;

    // Vérifier si c'est un jour férié
    if (this.isHoliday(date)) return false;

    // Vérifier les périodes de maintenance
    if (this.isInMaintenancePeriod(date)) return false;

    // Vérifier les dates spéciales
    const specialDate = this._availability.specialDates.find(
      (sd) => sd.date.toDateString() === date.toDateString(),
    );

    if (specialDate) {
      return specialDate.isAvailable;
    }

    // Vérifier les horaires de travail normaux
    const dayOfWeek = date.getDay();
    const workingHours = this._availability.workingHours[dayOfWeek];
    return workingHours?.isWorking() || false;
  }

  public getAvailableTimeSlots(
    date: Date,
    duration: number = this._settings.defaultSlotDuration,
    excludeBooked: TimeSlot[] = [],
  ): TimeSlot[] {
    if (!this.isAvailableOnDate(date)) return [];

    const dayOfWeek = date.getDay();
    let workingHours = this._availability.workingHours[dayOfWeek];

    // Vérifier s'il y a des horaires spéciaux pour cette date
    const specialDate = this._availability.specialDates.find(
      (sd) => sd.date.toDateString() === date.toDateString(),
    );

    if (specialDate?.specialHours) {
      workingHours = specialDate.specialHours;
    }

    if (!workingHours?.isWorking()) return [];

    // Générer les créneaux de base
    const baseSlots = workingHours.generateTimeSlots(
      date,
      duration,
      this._settings.bufferTimeBetweenSlots,
    );

    // Convertir en TimeSlots et exclure les créneaux réservés/bloqués
    const availableSlots: TimeSlot[] = [];

    baseSlots.forEach((slotStart) => {
      const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);
      const timeSlot = TimeSlot.create(slotStart, slotEnd);

      // Vérifier que le créneau ne chevauche pas avec les créneaux exclus
      const overlaps = excludeBooked.some((booked) =>
        timeSlot.overlaps(booked),
      );

      if (!overlaps && this.isSlotBookable(timeSlot)) {
        availableSlots.push(timeSlot);
      }
    });

    return availableSlots;
  }

  private isSlotBookable(timeSlot: TimeSlot): boolean {
    const now = new Date();
    const minimumNoticeMs = this._settings.minimumNotice * 60 * 1000;

    // Vérifier le préavis minimum
    if (timeSlot.getStartTime().getTime() - now.getTime() < minimumNoticeMs) {
      return false;
    }

    // Vérifier la limite de réservation à l'avance
    const maxAdvanceMs =
      this._settings.maximumAdvanceBooking * 24 * 60 * 60 * 1000;
    if (timeSlot.getStartTime().getTime() - now.getTime() > maxAdvanceMs) {
      return false;
    }

    // Appliquer les règles de réservation
    return this.applyBookingRules(timeSlot).isAllowed;
  }

  public applyBookingRules(timeSlot: TimeSlot): {
    isAllowed: boolean;
    requiresApproval: boolean;
    adjustedDuration?: number;
    message?: string;
  } {
    let isAllowed = true;
    let requiresApproval = false;
    let adjustedDuration: number | undefined;
    let message: string | undefined;

    // Trier les règles par priorité
    const sortedRules = [...this._bookingRules].sort(
      (a, b) => b.priority - a.priority,
    );

    for (const rule of sortedRules) {
      if (this.ruleApplies(rule, timeSlot)) {
        if (rule.actions.blockSlot) {
          isAllowed = false;
          message = rule.actions.customMessage || "Créneau non disponible";
          break;
        }

        if (rule.actions.requireApproval) {
          requiresApproval = true;
        }

        if (rule.actions.adjustDuration) {
          adjustedDuration = rule.actions.adjustDuration;
        }

        if (rule.actions.customMessage) {
          message = rule.actions.customMessage;
        }
      }
    }

    return {
      isAllowed,
      requiresApproval,
      adjustedDuration,
      message,
    };
  }

  private ruleApplies(rule: BookingRule, timeSlot: TimeSlot): boolean {
    const startTime = timeSlot.getStartTime();

    // Vérifier le jour de la semaine
    if (rule.conditions.dayOfWeek) {
      if (!rule.conditions.dayOfWeek.includes(startTime.getDay())) {
        return false;
      }
    }

    // Vérifier la plage horaire
    if (rule.conditions.timeRange) {
      const timeStr = startTime.toTimeString().substring(0, 5);
      if (
        timeStr < rule.conditions.timeRange.start ||
        timeStr > rule.conditions.timeRange.end
      ) {
        return false;
      }
    }

    // Vérifier la plage de dates
    if (rule.conditions.dateRange) {
      if (
        startTime < rule.conditions.dateRange.start ||
        startTime > rule.conditions.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  }

  // Gestion des jours fériés
  private isHoliday(date: Date): boolean {
    return this._availability.holidays.some((holiday) => {
      if (holiday.recurrence) {
        return holiday.recurrence.matchesPattern(date, holiday.date);
      }
      return holiday.date.toDateString() === date.toDateString();
    });
  }

  // Gestion de la maintenance
  private isInMaintenancePeriod(date: Date): boolean {
    return this._availability.maintenancePeriods.some(
      (period) => date >= period.startDate && date <= period.endDate,
    );
  }

  // Domain methods
  public addHoliday(holiday: {
    name: string;
    date: Date;
    recurrence?: RecurrencePattern;
  }): void {
    this._availability.holidays.push(holiday);
    this._updatedAt = new Date();
  }

  public addMaintenancePeriod(period: {
    startDate: Date;
    endDate: Date;
    reason: string;
  }): void {
    this._availability.maintenancePeriods.push(period);
    this._updatedAt = new Date();
  }

  public addBookingRule(rule: BookingRule): void {
    this._bookingRules.push(rule);
    this._updatedAt = new Date();
  }

  public updateWorkingHours(
    dayOfWeek: number,
    workingHours: WorkingHours,
  ): void {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error("Day of week must be between 0 and 6");
    }

    this._availability.workingHours[dayOfWeek] = workingHours;
    this._updatedAt = new Date();
  }

  public addSpecialDate(specialDate: {
    date: Date;
    isAvailable: boolean;
    specialHours?: WorkingHours;
    reason?: string;
  }): void {
    this._availability.specialDates.push(specialDate);
    this._updatedAt = new Date();
  }

  // Statistics and reporting
  public getUtilizationRate(startDate: Date, endDate: Date): number {
    // Logique pour calculer le taux d'utilisation
    // À implémenter avec les données de réservation
    return 0;
  }

  public getPopularTimeSlots(startDate: Date, endDate: Date): TimeSlot[] {
    // Logique pour identifier les créneaux les plus populaires
    // À implémenter avec les données de réservation
    return [];
  }
}
