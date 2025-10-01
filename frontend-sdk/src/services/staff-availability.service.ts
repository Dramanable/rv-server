/**
 * 📅 Staff Availability Service - Gestion des Disponibilités
 *
 * Service pour la gestion des disponibilités du personnel
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum AvailabilityType {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
  BREAK = 'BREAK',
  LUNCH = 'LUNCH',
  MEETING = 'MEETING',
  TRAINING = 'TRAINING',
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

// Interfaces
export interface TimeSlot {
  readonly startTime: string; // Format HH:mm
  readonly endTime: string;   // Format HH:mm
}

export interface StaffAvailability {
  readonly id: string;
  readonly staffId: string;
  readonly date: string; // Format YYYY-MM-DD
  readonly timeSlot: TimeSlot;
  readonly type: AvailabilityType;
  readonly title?: string;
  readonly description?: string;
  readonly isRecurring: boolean;
  readonly recurrenceType?: RecurrenceType;
  readonly recurrenceEndDate?: string;
  readonly businessId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export interface WeeklyAvailability {
  readonly staffId: string;
  readonly dayOfWeek: DayOfWeek;
  readonly timeSlots: readonly TimeSlot[];
  readonly isActive: boolean;
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

export interface AvailableStaff {
  readonly staffId: string;
  readonly staffName: string;
  readonly staffEmail: string;
  readonly staffRole: string;
  readonly availableSlots: readonly TimeSlot[];
  readonly skills: readonly string[];
  readonly rating?: number;
}

export interface SetAvailabilityDto {
  readonly staffId: string;
  readonly date: string;
  readonly timeSlot: TimeSlot;
  readonly type: AvailabilityType;
  readonly title?: string;
  readonly description?: string;
  readonly isRecurring?: boolean;
  readonly recurrenceType?: RecurrenceType;
  readonly recurrenceEndDate?: string;
}

export interface UpdateAvailabilityDto {
  readonly date?: string;
  readonly timeSlot?: TimeSlot;
  readonly type?: AvailabilityType;
  readonly title?: string;
  readonly description?: string;
  readonly isRecurring?: boolean;
  readonly recurrenceType?: RecurrenceType;
  readonly recurrenceEndDate?: string;
}

export interface GetAvailableStaffDto {
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly serviceId?: string;
  readonly skillIds?: readonly string[];
  readonly businessId?: string;
}

export interface GetStaffAvailabilityDto {
  readonly staffId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly type?: AvailabilityType;
}

export interface SetWeeklyAvailabilityDto {
  readonly staffId: string;
  readonly schedule: readonly {
    readonly dayOfWeek: DayOfWeek;
    readonly timeSlots: readonly TimeSlot[];
  }[];
  readonly effectiveFrom: string;
  readonly effectiveUntil?: string;
}

export interface AvailabilityStatsDto {
  readonly staffId: string;
  readonly period: 'week' | 'month' | 'quarter';
  readonly startDate: string;
}

export interface AvailabilityStats {
  readonly totalHours: number;
  readonly availableHours: number;
  readonly busyHours: number;
  readonly breakHours: number;
  readonly utilizationRate: number; // Pourcentage
  readonly peakDays: readonly DayOfWeek[];
  readonly averageBookingRate: number;
}

export interface CreateAvailabilityResponse {
  readonly success: boolean;
  readonly data: StaffAvailability;
  readonly message: string;
}

export interface UpdateAvailabilityResponse {
  readonly success: boolean;
  readonly data: StaffAvailability;
  readonly message: string;
}

export interface DeleteAvailabilityResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface AvailableStaffResponse {
  readonly success: boolean;
  readonly data: readonly AvailableStaff[];
  readonly totalAvailable: number;
}

/**
 * 📅 Service principal pour la gestion des disponibilités
 */
export default class StaffAvailabilityService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📊 Obtenir la disponibilité d'un membre du personnel
   */
  async getStaffAvailability(params: GetStaffAvailabilityDto): Promise<StaffAvailability[]> {
    const response = await this.client.post('/api/v1/staff-availability/get', params);
    return response.data.data;
  }

  /**
   * ✏️ Définir la disponibilité d'un membre du personnel
   */
  async setAvailability(data: SetAvailabilityDto): Promise<CreateAvailabilityResponse> {
    const response = await this.client.post('/api/v1/staff-availability', data);
    return response.data;
  }

  /**
   * 🔄 Mettre à jour une disponibilité
   */
  async updateAvailability(id: string, data: UpdateAvailabilityDto): Promise<UpdateAvailabilityResponse> {
    const response = await this.client.put(`/api/v1/staff-availability/${id}`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer une disponibilité
   */
  async deleteAvailability(id: string): Promise<DeleteAvailabilityResponse> {
    const response = await this.client.delete(`/api/v1/staff-availability/${id}`);
    return response.data;
  }

  /**
   * 👥 Obtenir le personnel disponible
   */
  async getAvailableStaff(params: GetAvailableStaffDto): Promise<AvailableStaffResponse> {
    const response = await this.client.post('/api/v1/staff-availability/available', params);
    return response.data;
  }

  /**
   * 📅 Définir la disponibilité hebdomadaire
   */
  async setWeeklyAvailability(data: SetWeeklyAvailabilityDto): Promise<WeeklyAvailability[]> {
    const response = await this.client.post('/api/v1/staff-availability/weekly', data);
    return response.data.data;
  }

  /**
   * 📊 Obtenir les statistiques de disponibilité
   */
  async getAvailabilityStats(params: AvailabilityStatsDto): Promise<AvailabilityStats> {
    const response = await this.client.post('/api/v1/staff-availability/stats', params);
    return response.data.data;
  }

  /**
   * 📅 Obtenir la disponibilité pour une date
   */
  async getAvailabilityByDate(staffId: string, date: string): Promise<StaffAvailability[]> {
    const response = await this.getStaffAvailability({
      staffId,
      startDate: date,
      endDate: date
    });
    return response;
  }

  /**
   * 📊 Obtenir la disponibilité pour une semaine
   */
  async getWeeklyAvailability(staffId: string, weekStart: string): Promise<StaffAvailability[]> {
    const weekEnd = this.addDays(weekStart, 6);
    return this.getStaffAvailability({
      staffId,
      startDate: weekStart,
      endDate: weekEnd
    });
  }

  /**
   * 📊 Obtenir la disponibilité pour un mois
   */
  async getMonthlyAvailability(staffId: string, monthStart: string): Promise<StaffAvailability[]> {
    const monthEnd = this.addDays(monthStart, 30);
    return this.getStaffAvailability({
      staffId,
      startDate: monthStart,
      endDate: monthEnd
    });
  }

  /**
   * 🔍 Vérifier si un membre du personnel est disponible
   */
  async isStaffAvailable(staffId: string, date: string, timeSlot: TimeSlot): Promise<boolean> {
    const availabilities = await this.getAvailabilityByDate(staffId, date);

    return !availabilities.some(availability =>
      availability.type !== AvailabilityType.AVAILABLE &&
      this.isTimeSlotOverlapping(availability.timeSlot, timeSlot)
    );
  }

  /**
   * 🔄 Copier la disponibilité d'une semaine à une autre
   */
  async copyWeeklyAvailability(
    staffId: string,
    sourceWeekStart: string,
    targetWeekStart: string
  ): Promise<StaffAvailability[]> {
    const sourceAvailabilities = await this.getWeeklyAvailability(staffId, sourceWeekStart);
    const newAvailabilities: StaffAvailability[] = [];

    for (const availability of sourceAvailabilities) {
      const daysDiff = this.getDaysDifference(sourceWeekStart, availability.date);
      const newDate = this.addDays(targetWeekStart, daysDiff);

      const newAvailability = await this.setAvailability({
        staffId,
        date: newDate,
        timeSlot: availability.timeSlot,
        type: availability.type,
        ...(availability.title && { title: availability.title }),
        ...(availability.description && { description: availability.description })
      });

      newAvailabilities.push(newAvailability.data);
    }

    return newAvailabilities;
  }

  /**
   * 📊 Obtenir un résumé de disponibilité
   */
  async getAvailabilitySummary(staffId: string, startDate: string, endDate: string): Promise<{
    totalSlots: number;
    availableSlots: number;
    busySlots: number;
    utilizationRate: number;
  }> {
    const availabilities = await this.getStaffAvailability({
      staffId,
      startDate,
      endDate
    });

    const totalSlots = availabilities.length;
    const availableSlots = availabilities.filter(a => a.type === AvailabilityType.AVAILABLE).length;
    const busySlots = availabilities.filter(a => a.type !== AvailabilityType.AVAILABLE).length;
    const utilizationRate = totalSlots > 0 ? (busySlots / totalSlots) * 100 : 0;

    return {
      totalSlots,
      availableSlots,
      busySlots,
      utilizationRate: Math.round(utilizationRate * 100) / 100
    };
  }

  /**
   * 🔧 Utilitaires pour les dates et heures
   */
  private addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    const isoString = date.toISOString().split('T')[0];
    if (!isoString) throw new Error('Invalid date format');
    return isoString;
  }

  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private isTimeSlotOverlapping(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const start1 = this.timeToMinutes(slot1.startTime);
    const end1 = this.timeToMinutes(slot1.endTime);
    const start2 = this.timeToMinutes(slot2.startTime);
    const end2 = this.timeToMinutes(slot2.endTime);

    return start1 < end2 && start2 < end1;
  }

  private timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    return hours * 60 + minutes;
  }

  /**
   * 🎨 Obtenir la couleur pour un type de disponibilité
   */
  static getTypeColor(type: AvailabilityType): string {
    const colors: Record<AvailabilityType, string> = {
      [AvailabilityType.AVAILABLE]: '#22C55E',    // Vert
      [AvailabilityType.BUSY]: '#EF4444',         // Rouge
      [AvailabilityType.UNAVAILABLE]: '#6B7280',  // Gris
      [AvailabilityType.BREAK]: '#3B82F6',        // Bleu
      [AvailabilityType.LUNCH]: '#F59E0B',        // Orange
      [AvailabilityType.MEETING]: '#8B5CF6',      // Violet
      [AvailabilityType.TRAINING]: '#10B981',     // Emeraude
      [AvailabilityType.VACATION]: '#F97316',     // Orange foncé
      [AvailabilityType.SICK_LEAVE]: '#DC2626'    // Rouge foncé
    };
    return colors[type] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un type de disponibilité
   */
  static getTypeIcon(type: AvailabilityType): string {
    const icons: Record<AvailabilityType, string> = {
      [AvailabilityType.AVAILABLE]: '✅',
      [AvailabilityType.BUSY]: '🔴',
      [AvailabilityType.UNAVAILABLE]: '⚫',
      [AvailabilityType.BREAK]: '☕',
      [AvailabilityType.LUNCH]: '🍽️',
      [AvailabilityType.MEETING]: '👥',
      [AvailabilityType.TRAINING]: '🎓',
      [AvailabilityType.VACATION]: '🏖️',
      [AvailabilityType.SICK_LEAVE]: '🤒'
    };
    return icons[type] || '❓';
  }

  /**
   * 📊 Obtenir tous les types de disponibilité
   */
  static getAvailabilityTypes(): AvailabilityType[] {
    return Object.values(AvailabilityType);
  }

  /**
   * 📅 Obtenir tous les jours de la semaine
   */
  static getDaysOfWeek(): DayOfWeek[] {
    return Object.values(DayOfWeek);
  }

  /**
   * 🔄 Obtenir tous les types de récurrence
   */
  static getRecurrenceTypes(): RecurrenceType[] {
    return Object.values(RecurrenceType);
  }

  /**
   * ✅ Valider un créneau horaire
   */
  static validateTimeSlot(timeSlot: TimeSlot): string[] {
    const errors: string[] = [];

    if (!timeSlot.startTime || !timeSlot.endTime) {
      errors.push('Les heures de début et de fin sont obligatoires');
      return errors;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(timeSlot.startTime)) {
      errors.push('Format d\'heure de début invalide (HH:mm attendu)');
    }

    if (!timeRegex.test(timeSlot.endTime)) {
      errors.push('Format d\'heure de fin invalide (HH:mm attendu)');
    }

    if (errors.length === 0) {
      const startMinutes = StaffAvailabilityService.prototype.timeToMinutes(timeSlot.startTime);
      const endMinutes = StaffAvailabilityService.prototype.timeToMinutes(timeSlot.endTime);

      if (startMinutes >= endMinutes) {
        errors.push('L\'heure de fin doit être après l\'heure de début');
      }

      if (endMinutes - startMinutes < 15) {
        errors.push('La durée minimale est de 15 minutes');
      }

      if (endMinutes - startMinutes > 720) {
        errors.push('La durée maximale est de 12 heures');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires statiques
   */
  static readonly utils = {
    /**
     * Formater une heure pour l'affichage
     */
    formatTime: (time: string): string => {
      const parts = time.split(':');
      const hours = parts[0] ?? '00';
      const minutes = parts[1] ?? '00';
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    },

    /**
     * Calculer la durée d'un créneau en minutes
     */
    getSlotDuration: (timeSlot: TimeSlot): number => {
      const start = StaffAvailabilityService.prototype.timeToMinutes(timeSlot.startTime);
      const end = StaffAvailabilityService.prototype.timeToMinutes(timeSlot.endTime);
      return end - start;
    },

    /**
     * Formater la durée pour l'affichage
     */
    formatDuration: (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (hours === 0) return `${mins}min`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    },

    /**
     * Obtenir le nom du jour en français
     */
    getDayName: (dayOfWeek: DayOfWeek): string => {
      const names: Record<DayOfWeek, string> = {
        [DayOfWeek.MONDAY]: 'Lundi',
        [DayOfWeek.TUESDAY]: 'Mardi',
        [DayOfWeek.WEDNESDAY]: 'Mercredi',
        [DayOfWeek.THURSDAY]: 'Jeudi',
        [DayOfWeek.FRIDAY]: 'Vendredi',
        [DayOfWeek.SATURDAY]: 'Samedi',
        [DayOfWeek.SUNDAY]: 'Dimanche'
      };
      return names[dayOfWeek];
    },

    /**
     * Obtenir le nom du type en français
     */
    getTypeName: (type: AvailabilityType): string => {
      const names: Record<AvailabilityType, string> = {
        [AvailabilityType.AVAILABLE]: 'Disponible',
        [AvailabilityType.BUSY]: 'Occupé',
        [AvailabilityType.UNAVAILABLE]: 'Indisponible',
        [AvailabilityType.BREAK]: 'Pause',
        [AvailabilityType.LUNCH]: 'Déjeuner',
        [AvailabilityType.MEETING]: 'Réunion',
        [AvailabilityType.TRAINING]: 'Formation',
        [AvailabilityType.VACATION]: 'Congés',
        [AvailabilityType.SICK_LEAVE]: 'Arrêt maladie'
      };
      return names[type];
    }
  };
}
