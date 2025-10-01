/**
 * 🕐 RV Project Frontend SDK - Service des Heures d'Ouverture
 *
 * Gestion des horaires d'ouverture des entreprises
 */

import { RVProjectClient } from '../client';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum BusinessHoursType {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
  HOLIDAY = 'HOLIDAY',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

export interface TimeSlot {
  readonly start: string; // Format: "HH:mm"
  readonly end: string; // Format: "HH:mm"
}

export interface BusinessHours {
  readonly id: string;
  readonly businessId: string;
  readonly dayOfWeek: DayOfWeek;
  readonly type: BusinessHoursType;
  readonly isOpen: boolean;
  readonly timeSlots: TimeSlot[];
  readonly notes?: string;
  readonly effectiveDate?: string; // Pour les horaires spéciaux
  readonly expirationDate?: string; // Pour les horaires temporaires
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SpecialHours {
  readonly id: string;
  readonly businessId: string;
  readonly date: string; // Format: "YYYY-MM-DD"
  readonly type: BusinessHoursType;
  readonly isOpen: boolean;
  readonly timeSlots: TimeSlot[];
  readonly reason?: string;
  readonly notes?: string;
  readonly createdAt: string;
}

export interface CreateBusinessHoursRequest {
  readonly businessId: string;
  readonly dayOfWeek: DayOfWeek;
  readonly type?: BusinessHoursType;
  readonly isOpen: boolean;
  readonly timeSlots: TimeSlot[];
  readonly notes?: string;
  readonly effectiveDate?: string;
  readonly expirationDate?: string;
}

export interface UpdateBusinessHoursRequest {
  readonly isOpen?: boolean;
  readonly timeSlots?: TimeSlot[];
  readonly notes?: string;
  readonly effectiveDate?: string;
  readonly expirationDate?: string;
  readonly isActive?: boolean;
}

export interface CreateSpecialHoursRequest {
  readonly businessId: string;
  readonly date: string;
  readonly type: BusinessHoursType;
  readonly isOpen: boolean;
  readonly timeSlots?: TimeSlot[];
  readonly reason?: string;
  readonly notes?: string;
}

export interface UpdateSpecialHoursRequest {
  readonly isOpen?: boolean;
  readonly timeSlots?: TimeSlot[];
  readonly reason?: string;
  readonly notes?: string;
}

export interface ListBusinessHoursRequest {
  readonly businessId: string;
  readonly dayOfWeek?: DayOfWeek;
  readonly type?: BusinessHoursType;
  readonly isActive?: boolean;
  readonly includeExpired?: boolean;
}

export interface ListSpecialHoursRequest {
  readonly businessId: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly type?: BusinessHoursType;
}

export class BusinessHoursService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les horaires d'ouverture
   */
  async list(request: ListBusinessHoursRequest): Promise<BusinessHours[]> {
    const response = await this.client.post<BusinessHours[]>(
      '/api/v1/business-hours/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir les horaires par ID
   */
  async getById(id: string): Promise<BusinessHours> {
    const response = await this.client.get<BusinessHours>(
      `/api/v1/business-hours/${id}`,
    );
    return response.data;
  }

  /**
   * ➕ Créer de nouveaux horaires
   */
  async create(request: CreateBusinessHoursRequest): Promise<BusinessHours> {
    const response = await this.client.post<BusinessHours>(
      '/api/v1/business-hours',
      request,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour les horaires
   */
  async update(
    id: string,
    updates: UpdateBusinessHoursRequest,
  ): Promise<BusinessHours> {
    const response = await this.client.put<BusinessHours>(
      `/api/v1/business-hours/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer les horaires
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/business-hours/${id}`);
  }

  /**
   * 📅 Lister les horaires spéciaux
   */
  async listSpecialHours(
    request: ListSpecialHoursRequest,
  ): Promise<SpecialHours[]> {
    const response = await this.client.post<SpecialHours[]>(
      '/api/v1/business-hours/special/list',
      request,
    );
    return response.data;
  }

  /**
   * ⭐ Créer des horaires spéciaux
   */
  async createSpecialHours(
    request: CreateSpecialHoursRequest,
  ): Promise<SpecialHours> {
    const response = await this.client.post<SpecialHours>(
      '/api/v1/business-hours/special',
      request,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour les horaires spéciaux
   */
  async updateSpecialHours(
    id: string,
    updates: UpdateSpecialHoursRequest,
  ): Promise<SpecialHours> {
    const response = await this.client.put<SpecialHours>(
      `/api/v1/business-hours/special/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer les horaires spéciaux
   */
  async deleteSpecialHours(id: string): Promise<void> {
    await this.client.delete(`/api/v1/business-hours/special/${id}`);
  }

  /**
   * 🏢 Obtenir tous les horaires d'une entreprise
   */
  async getBusinessHours(businessId: string): Promise<{
    regular: BusinessHours[];
    special: SpecialHours[];
  }> {
    const response = await this.client.get<{
      regular: BusinessHours[];
      special: SpecialHours[];
    }>(`/api/v1/business-hours/business/${businessId}`);
    return response.data;
  }

  /**
   * 📅 Obtenir les horaires pour une date spécifique
   */
  async getHoursForDate(
    businessId: string,
    date: string,
  ): Promise<{
    isOpen: boolean;
    timeSlots: TimeSlot[];
    type: BusinessHoursType;
    notes?: string;
    isSpecialDay: boolean;
  }> {
    const response = await this.client.get<{
      isOpen: boolean;
      timeSlots: TimeSlot[];
      type: BusinessHoursType;
      notes?: string;
      isSpecialDay: boolean;
    }>(`/api/v1/business-hours/business/${businessId}/date/${date}`);
    return response.data;
  }

  /**
   * 📝 Mettre à jour tous les horaires d'une semaine
   */
  async updateWeeklyHours(
    businessId: string,
    weeklyHours: Record<
      DayOfWeek,
      {
        isOpen: boolean;
        timeSlots: TimeSlot[];
        notes?: string;
      }
    >,
  ): Promise<BusinessHours[]> {
    const response = await this.client.put<BusinessHours[]>(
      `/api/v1/business-hours/business/${businessId}/weekly`,
      { weeklyHours },
    );
    return response.data;
  }

  /**
   * 🔄 Copier les horaires d'un jour vers d'autres jours
   */
  async copyHours(
    businessId: string,
    sourceDay: DayOfWeek,
    targetDays: DayOfWeek[],
  ): Promise<BusinessHours[]> {
    const response = await this.client.post<BusinessHours[]>(
      '/api/v1/business-hours/copy',
      {
        businessId,
        sourceDay,
        targetDays,
      },
    );
    return response.data;
  }

  /**
   * 🏖️ Créer des horaires de vacances
   */
  async createHolidayHours(
    businessId: string,
    startDate: string,
    endDate: string,
    reason: string,
  ): Promise<SpecialHours[]> {
    const response = await this.client.post<SpecialHours[]>(
      '/api/v1/business-hours/holiday',
      {
        businessId,
        startDate,
        endDate,
        reason,
      },
    );
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les horaires
   */
  static getDayDisplayName(day: DayOfWeek): string {
    const names: Record<DayOfWeek, string> = {
      [DayOfWeek.MONDAY]: 'Lundi',
      [DayOfWeek.TUESDAY]: 'Mardi',
      [DayOfWeek.WEDNESDAY]: 'Mercredi',
      [DayOfWeek.THURSDAY]: 'Jeudi',
      [DayOfWeek.FRIDAY]: 'Vendredi',
      [DayOfWeek.SATURDAY]: 'Samedi',
      [DayOfWeek.SUNDAY]: 'Dimanche',
    };
    return names[day];
  }

  static getTypeDisplayName(type: BusinessHoursType): string {
    const names: Record<BusinessHoursType, string> = {
      [BusinessHoursType.REGULAR]: 'Horaires réguliers',
      [BusinessHoursType.SPECIAL]: 'Horaires spéciaux',
      [BusinessHoursType.HOLIDAY]: 'Jour férié',
      [BusinessHoursType.MAINTENANCE]: 'Maintenance',
      [BusinessHoursType.CLOSED]: 'Fermé',
    };
    return names[type];
  }

  static formatTimeSlot(slot: TimeSlot): string {
    return `${slot.start} - ${slot.end}`;
  }

  static formatTimeSlots(slots: TimeSlot[]): string {
    if (slots.length === 0) return 'Fermé';
    return slots.map((slot) => this.formatTimeSlot(slot)).join(', ');
  }

  static isValidTimeSlot(slot: TimeSlot): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
      return false;
    }

    const startMinutes = this.timeToMinutes(slot.start);
    const endMinutes = this.timeToMinutes(slot.end);

    return startMinutes < endMinutes;
  }

  static timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 60 + minutes;
  }

  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static getCurrentDayOfWeek(): DayOfWeek {
    const days = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    const dayIndex = new Date().getDay();
    return days[dayIndex] || DayOfWeek.MONDAY;
  }

  static isOpenNow(hours: BusinessHours[]): boolean {
    const now = new Date();
    const currentDay = this.getCurrentDayOfWeek();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentMinutes = this.timeToMinutes(currentTime);

    const todayHours = hours.find(
      (h) => h.dayOfWeek === currentDay && h.isActive && h.isOpen,
    );

    if (!todayHours) return false;

    return todayHours.timeSlots.some((slot) => {
      const startMinutes = this.timeToMinutes(slot.start);
      const endMinutes = this.timeToMinutes(slot.end);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  }

  static getNextOpeningTime(
    hours: BusinessHours[],
  ): { day: DayOfWeek; time: string } | null {
    const currentDay = this.getCurrentDayOfWeek();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentMinutes = this.timeToMinutes(currentTime);

    const dayOrder = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    const currentDayIndex = dayOrder.indexOf(currentDay);

    // Chercher dans les jours suivants (y compris aujourd'hui)
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = dayOrder[dayIndex];
      if (!day) continue;

      const dayHours = hours.find(
        (h) => h.dayOfWeek === day && h.isActive && h.isOpen,
      );

      if (dayHours && dayHours.timeSlots.length > 0) {
        const firstSlot = dayHours.timeSlots[0];
        if (!firstSlot) continue;

        // Si c'est aujourd'hui, vérifier si c'est après l'heure actuelle
        if (i === 0) {
          const startMinutes = this.timeToMinutes(firstSlot.start);
          if (startMinutes > currentMinutes) {
            return { day, time: firstSlot.start };
          }
        } else {
          return { day, time: firstSlot.start };
        }
      }
    }

    return null;
  }

  static sortByDay(hours: BusinessHours[]): BusinessHours[] {
    const dayOrder: Record<DayOfWeek, number> = {
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6,
      [DayOfWeek.SUNDAY]: 7,
    };

    return [...hours].sort(
      (a, b) => dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek],
    );
  }

  static mergeOverlappingSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length <= 1) return slots;

    const sortedSlots = [...slots].sort(
      (a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start),
    );

    const firstSlot = sortedSlots[0];
    if (!firstSlot) return slots;

    const merged: TimeSlot[] = [firstSlot];

    for (let i = 1; i < sortedSlots.length; i++) {
      const current = sortedSlots[i];
      if (!current) continue;

      const lastMerged = merged[merged.length - 1];
      if (!lastMerged) continue;

      const lastEnd = this.timeToMinutes(lastMerged.end);
      const currentStart = this.timeToMinutes(current.start);

      if (currentStart <= lastEnd) {
        // Fusionner les créneaux qui se chevauchent
        const currentEnd = this.timeToMinutes(current.end);
        if (currentEnd > lastEnd) {
          merged[merged.length - 1] = {
            start: lastMerged.start,
            end: current.end,
          };
        }
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}

export default BusinessHoursService;
