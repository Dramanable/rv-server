/**
 * 📅 RV Project Frontend SDK - Service des Calendriers
 *
 * Gestion des calendriers individuels pour les membres du personnel
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';
import { CalendarType } from './calendar-types.service';
import { StaffMember } from './staff.service';

export enum CalendarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum CalendarVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEAM_ONLY = 'TEAM_ONLY',
  MANAGERS_ONLY = 'MANAGERS_ONLY',
}

export enum CalendarSyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  DISABLED = 'DISABLED',
}

export interface CalendarAvailability {
  readonly dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  readonly startTime: string; // Format HH:mm
  readonly endTime: string; // Format HH:mm
  readonly isAvailable: boolean;
  readonly breakTimes?: Array<{
    readonly startTime: string;
    readonly endTime: string;
    readonly title?: string;
  }>;
}

export interface CalendarSettings {
  readonly timeZone: string;
  readonly defaultSlotDuration: number; // en minutes
  readonly minAdvanceBooking: number; // en heures
  readonly maxAdvanceBooking: number; // en jours
  readonly allowOverlapping: boolean;
  readonly requireConfirmation: boolean;
  readonly autoAcceptBookings: boolean;
  readonly notificationSettings: {
    readonly emailReminders: boolean;
    readonly smsReminders: boolean;
    readonly reminderTimes: number[]; // en minutes avant le RDV
  };
  readonly bookingLimits: {
    readonly maxPerDay: number;
    readonly maxPerWeek: number;
    readonly maxPerMonth: number;
  };
}

export interface Calendar {
  readonly id: string;
  readonly businessId: string;
  readonly staffMemberId: string;
  readonly calendarTypeId: string;
  readonly name: string;
  readonly description?: string;
  readonly status: CalendarStatus;
  readonly visibility: CalendarVisibility;
  readonly isDefault: boolean;
  readonly color: string; // Hex color
  readonly availability: readonly CalendarAvailability[];
  readonly settings: CalendarSettings;
  readonly syncStatus: CalendarSyncStatus;
  readonly lastSyncAt?: string;
  readonly externalCalendarId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relations populées
  readonly staffMember?: StaffMember;
  readonly calendarType?: CalendarType;
}

export interface CreateCalendarRequest {
  readonly businessId: string;
  readonly staffMemberId: string;
  readonly calendarTypeId: string;
  readonly name: string;
  readonly description?: string;
  readonly visibility?: CalendarVisibility;
  readonly color?: string;
  readonly availability?: CalendarAvailability[];
  readonly settings?: Partial<CalendarSettings>;
}

export interface UpdateCalendarRequest {
  readonly name?: string;
  readonly description?: string;
  readonly status?: CalendarStatus;
  readonly visibility?: CalendarVisibility;
  readonly color?: string;
  readonly availability?: CalendarAvailability[];
  readonly settings?: Partial<CalendarSettings>;
}

export interface ListCalendarsRequest {
  readonly businessId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly status?: CalendarStatus;
  readonly visibility?: CalendarVisibility;
  readonly staffMemberId?: string;
  readonly calendarTypeId?: string;
  readonly search?: string;
  readonly includeArchived?: boolean;
}

export interface CalendarTimeSlot {
  readonly start: string; // ISO datetime
  readonly end: string; // ISO datetime
  readonly isAvailable: boolean;
  readonly isBooked: boolean;
  readonly appointmentId?: string;
  readonly title?: string;
  readonly type: 'available' | 'booked' | 'break' | 'unavailable';
}

export interface GetAvailableSlotsRequest {
  readonly calendarId: string;
  readonly startDate: string; // ISO date
  readonly endDate: string; // ISO date
  readonly slotDuration?: number; // en minutes
  readonly serviceId?: string; // Pour filtrer selon la durée du service
}

export class CalendarsService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister tous les calendriers
   */
  async list(
    request: ListCalendarsRequest,
  ): Promise<PaginatedResponse<Calendar>> {
    const response = await this.client.post<PaginatedResponse<Calendar>>(
      '/api/v1/calendars/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un calendrier par ID
   */
  async getById(id: string, includeRelations = false): Promise<Calendar> {
    const url = `/api/v1/calendars/${id}${includeRelations ? '?include=staffMember,calendarType' : ''}`;
    const response = await this.client.get<Calendar>(url);
    return response.data;
  }

  /**
   * ➕ Créer un nouveau calendrier
   */
  async create(request: CreateCalendarRequest): Promise<Calendar> {
    const response = await this.client.post<Calendar>(
      '/api/v1/calendars',
      request,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un calendrier
   */
  async update(id: string, updates: UpdateCalendarRequest): Promise<Calendar> {
    const response = await this.client.put<Calendar>(
      `/api/v1/calendars/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer un calendrier
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/calendars/${id}`);
  }

  /**
   * 👤 Obtenir tous les calendriers d'un membre du personnel
   */
  async getByStaffMember(staffMemberId: string): Promise<Calendar[]> {
    const response = await this.list({
      businessId: '', // Will be handled by backend based on staff member
      staffMemberId,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * 🏢 Obtenir tous les calendriers d'un business
   */
  async getByBusiness(businessId: string): Promise<Calendar[]> {
    const response = await this.list({
      businessId,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * ⭐ Définir un calendrier comme défaut pour un membre du personnel
   */
  async setDefault(id: string): Promise<Calendar> {
    const response = await this.client.post<Calendar>(
      `/api/v1/calendars/${id}/set-default`,
    );
    return response.data;
  }

  /**
   * 🕐 Obtenir les créneaux disponibles
   */
  async getAvailableSlots(
    request: GetAvailableSlotsRequest,
  ): Promise<CalendarTimeSlot[]> {
    const response = await this.client.post<CalendarTimeSlot[]>(
      '/api/v1/calendars/available-slots',
      request,
    );
    return response.data;
  }

  /**
   * 📅 Obtenir la vue d'un calendrier pour une période
   */
  async getCalendarView(
    calendarId: string,
    startDate: string,
    endDate: string,
    viewType: 'day' | 'week' | 'month' = 'week',
  ): Promise<{
    calendar: Calendar;
    timeSlots: CalendarTimeSlot[];
    appointments: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      status: string;
      clientName: string;
      serviceName: string;
    }>;
    availability: CalendarAvailability[];
  }> {
    const response = await this.client.get<{
      calendar: Calendar;
      timeSlots: CalendarTimeSlot[];
      appointments: Array<{
        id: string;
        title: string;
        start: string;
        end: string;
        status: string;
        clientName: string;
        serviceName: string;
      }>;
      availability: CalendarAvailability[];
    }>(
      `/api/v1/calendars/${calendarId}/view?startDate=${startDate}&endDate=${endDate}&viewType=${viewType}`,
    );
    return response.data;
  }

  /**
   * 🔄 Synchroniser avec un calendrier externe
   */
  async syncWithExternal(
    id: string,
    externalCalendarId: string,
    provider: 'google' | 'outlook' | 'apple',
  ): Promise<Calendar> {
    const response = await this.client.post<Calendar>(
      `/api/v1/calendars/${id}/sync`,
      {
        externalCalendarId,
        provider,
      },
    );
    return response.data;
  }

  /**
   * ❌ Désynchroniser d'un calendrier externe
   */
  async unsyncExternal(id: string): Promise<Calendar> {
    const response = await this.client.delete<Calendar>(
      `/api/v1/calendars/${id}/sync`,
    );
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques d'un calendrier
   */
  async getStats(
    id: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
  ): Promise<{
    totalAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    availabilityRate: number; // Pourcentage de créneaux disponibles
    bookingRate: number; // Pourcentage de créneaux réservés
    averageSlotDuration: number;
    busyDays: number;
    peakHours: Array<{
      hour: number;
      appointmentCount: number;
    }>;
    clientReturnRate: number;
  }> {
    const response = await this.client.get<{
      totalAppointments: number;
      confirmedAppointments: number;
      cancelledAppointments: number;
      noShowAppointments: number;
      availabilityRate: number;
      bookingRate: number;
      averageSlotDuration: number;
      busyDays: number;
      peakHours: Array<{
        hour: number;
        appointmentCount: number;
      }>;
      clientReturnRate: number;
    }>(`/api/v1/calendars/${id}/stats?period=${period}`);
    return response.data;
  }

  /**
   * 🔧 Dupliquer un calendrier
   */
  async duplicate(
    id: string,
    newName: string,
    staffMemberId?: string,
  ): Promise<Calendar> {
    const response = await this.client.post<Calendar>(
      `/api/v1/calendars/${id}/duplicate`,
      {
        name: newName,
        staffMemberId,
      },
    );
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les calendriers
   */
  static getStatusDisplayName(status: CalendarStatus): string {
    const names: Record<CalendarStatus, string> = {
      [CalendarStatus.ACTIVE]: 'Actif',
      [CalendarStatus.INACTIVE]: 'Inactif',
      [CalendarStatus.SUSPENDED]: 'Suspendu',
      [CalendarStatus.ARCHIVED]: 'Archivé',
    };
    return names[status];
  }

  static getVisibilityDisplayName(visibility: CalendarVisibility): string {
    const names: Record<CalendarVisibility, string> = {
      [CalendarVisibility.PUBLIC]: 'Public',
      [CalendarVisibility.PRIVATE]: 'Privé',
      [CalendarVisibility.TEAM_ONLY]: 'équipe uniquement',
      [CalendarVisibility.MANAGERS_ONLY]: 'Managers uniquement',
    };
    return names[visibility];
  }

  static getSyncStatusDisplayName(status: CalendarSyncStatus): string {
    const names: Record<CalendarSyncStatus, string> = {
      [CalendarSyncStatus.SYNCED]: 'Synchronisé',
      [CalendarSyncStatus.PENDING]: 'En attente',
      [CalendarSyncStatus.ERROR]: 'Erreur',
      [CalendarSyncStatus.DISABLED]: 'Désactivé',
    };
    return names[status];
  }

  static isActive(calendar: Calendar): boolean {
    return calendar.status === CalendarStatus.ACTIVE;
  }

  static isPublic(calendar: Calendar): boolean {
    return calendar.visibility === CalendarVisibility.PUBLIC;
  }

  static isSynced(calendar: Calendar): boolean {
    return calendar.syncStatus === CalendarSyncStatus.SYNCED;
  }

  static canBook(calendar: Calendar): boolean {
    return this.isActive(calendar) && this.isPublic(calendar);
  }

  static isAvailableOnDay(calendar: Calendar, dayOfWeek: number): boolean {
    return calendar.availability.some(
      (avail) => avail.dayOfWeek === dayOfWeek && avail.isAvailable,
    );
  }

  static getAvailabilityForDay(
    calendar: Calendar,
    dayOfWeek: number,
  ): CalendarAvailability | null {
    return (
      calendar.availability.find((avail) => avail.dayOfWeek === dayOfWeek) ||
      null
    );
  }

  static formatTimeSlot(slot: CalendarTimeSlot): string {
    const start = new Date(slot.start);
    const end = new Date(slot.end);

    return `${start.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  static calculateTotalWeeklyHours(
    availability: readonly CalendarAvailability[],
  ): number {
    return availability.reduce((total, avail) => {
      if (!avail.isAvailable) return total;

      const start = this.parseTime(avail.startTime);
      const end = this.parseTime(avail.endTime);
      const hours = (end - start) / (1000 * 60 * 60);

      // Soustraire les pauses
      const breakTime =
        avail.breakTimes?.reduce((breakTotal, breakItem) => {
          const breakStart = this.parseTime(breakItem.startTime);
          const breakEnd = this.parseTime(breakItem.endTime);
          return breakTotal + (breakEnd - breakStart) / (1000 * 60 * 60);
        }, 0) || 0;

      return total + hours - breakTime;
    }, 0);
  }

  static validateAvailability(availability: CalendarAvailability[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const avail of availability) {
      // Vérifier les heures
      const start = this.parseTime(avail.startTime);
      const end = this.parseTime(avail.endTime);

      if (start >= end) {
        errors.push(
          `Jour ${avail.dayOfWeek}: L'heure de fin doit être après l'heure de début`,
        );
      }

      // Vérifier les pauses
      if (avail.breakTimes) {
        for (const breakTime of avail.breakTimes) {
          const breakStart = this.parseTime(breakTime.startTime);
          const breakEnd = this.parseTime(breakTime.endTime);

          if (breakStart >= breakEnd) {
            errors.push(
              `Jour ${avail.dayOfWeek}: L'heure de fin de pause doit être après l'heure de début`,
            );
          }

          if (breakStart < start || breakEnd > end) {
            errors.push(
              `Jour ${avail.dayOfWeek}: La pause doit être dans les heures d'ouverture`,
            );
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static parseTime(timeString: string): number {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  static getDayName(dayOfWeek: number): string {
    const days = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];
    return days[dayOfWeek] || 'Inconnu';
  }

  static filterActive(calendars: Calendar[]): Calendar[] {
    return calendars.filter((calendar) => this.isActive(calendar));
  }

  static filterPublic(calendars: Calendar[]): Calendar[] {
    return calendars.filter((calendar) => this.isPublic(calendar));
  }

  static filterBookable(calendars: Calendar[]): Calendar[] {
    return calendars.filter((calendar) => this.canBook(calendar));
  }

  static sortByName(calendars: Calendar[]): Calendar[] {
    return [...calendars].sort((a, b) => a.name.localeCompare(b.name));
  }

  static groupByStaff(calendars: Calendar[]): Record<string, Calendar[]> {
    return calendars.reduce(
      (groups, calendar) => {
        const staffId = calendar.staffMemberId;
        if (!groups[staffId]) {
          groups[staffId] = [];
        }
        groups[staffId].push(calendar);
        return groups;
      },
      {} as Record<string, Calendar[]>,
    );
  }
}

export default CalendarsService;
