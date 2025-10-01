/**
 * ⏰ RV Project Frontend SDK - Business Hours Service
 *
 * Service pour la gestion des horaires d'ouverture des entreprises
 * Basé sur les VRAIS endpoints de l'API
 */

import { RVProjectClient } from '../client';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface TimeSlot {
  readonly startTime: string; // Format: "HH:mm"
  readonly endTime: string;   // Format: "HH:mm"
}

export interface BusinessHours {
  readonly id: string;
  readonly businessId: string;
  readonly dayOfWeek: DayOfWeek;
  readonly isOpen: boolean;
  readonly timeSlots: TimeSlot[];
  readonly timezone: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SpecialHours {
  readonly id: string;
  readonly businessId: string;
  readonly date: string; // Format: "YYYY-MM-DD"
  readonly type: 'HOLIDAY' | 'SPECIAL_HOURS' | 'CLOSED' | 'MAINTENANCE';
  readonly isOpen: boolean;
  readonly timeSlots?: TimeSlot[];
  readonly reason?: string;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WeeklyHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
  timezone: string;
  notes?: string;
}

export interface AvailabilityRequest {
  readonly date: string; // YYYY-MM-DD
  readonly startTime?: string; // HH:mm
  readonly endTime?: string; // HH:mm
  readonly duration?: number; // minutes
}

export interface AvailabilityResponse {
  readonly isAvailable: boolean;
  readonly availableSlots: Array<{
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  readonly businessHours: TimeSlot[];
  readonly reason?: string;
}

export interface SpecialDateRequest {
  readonly date: string; // YYYY-MM-DD
  readonly type: 'HOLIDAY' | 'SPECIAL_HOURS' | 'CLOSED' | 'MAINTENANCE';
  readonly isOpen: boolean;
  readonly timeSlots?: TimeSlot[];
  readonly reason?: string;
  readonly notes?: string;
}

/**
 * ⏰ Service principal pour les horaires d'ouverture
 * Utilise les VRAIS endpoints de l'API
 */
export class BusinessHoursRealService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Get business opening hours
   * Endpoint: GET /api/v1/businesses/{businessId}/hours
   */
  async getBusinessHours(businessId: string): Promise<BusinessHours[]> {
    const response = await this.client.get<BusinessHours[]>(`/api/v1/businesses/${businessId}/hours`);
    return response.data;
  }

  /**
   * ✏️ Update business opening hours
   * Endpoint: PUT /api/v1/businesses/{businessId}/hours
   */
  async updateBusinessHours(businessId: string, hours: WeeklyHours): Promise<BusinessHours[]> {
    const response = await this.client.put<BusinessHours[]>(`/api/v1/businesses/${businessId}/hours`, hours);
    return response.data;
  }

  /**
   * 🔍 Check business availability
   * Endpoint: POST /api/v1/businesses/{businessId}/hours/check-availability
   */
  async checkAvailability(businessId: string, request: AvailabilityRequest): Promise<AvailabilityResponse> {
    const response = await this.client.post<AvailabilityResponse>(
      `/api/v1/businesses/${businessId}/hours/check-availability`,
      request
    );
    return response.data;
  }

  /**
   * 📅 Add special date
   * Endpoint: POST /api/v1/businesses/{businessId}/hours/special-dates
   */
  async addSpecialDate(businessId: string, specialDate: SpecialDateRequest): Promise<SpecialHours> {
    const response = await this.client.post<SpecialHours>(
      `/api/v1/businesses/${businessId}/hours/special-dates`,
      specialDate
    );
    return response.data;
  }

  /**
   * 📊 Get weekly hours summary
   */
  async getWeeklyHours(businessId: string): Promise<WeeklyHours> {
    const hours = await this.getBusinessHours(businessId);

    const weeklyHours: WeeklyHours = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      timezone: 'UTC'
    };

    hours.forEach(dayHours => {
      const dayKey = dayHours.dayOfWeek.toLowerCase() as keyof WeeklyHours;
      if (dayKey !== 'timezone' && dayKey !== 'notes') {
        (weeklyHours[dayKey] as TimeSlot[]) = dayHours.timeSlots;
      }
      if (dayHours.timezone) {
        weeklyHours.timezone = dayHours.timezone;
      }
    });

    return weeklyHours;
  }

  /**
   * 🕐 Check if business is open now
   */
  async isOpenNow(businessId: string): Promise<boolean> {
    const now = new Date();
    const todayDate = now.toISOString().split('T')[0]!;
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm

    const availability = await this.checkAvailability(businessId, {
      date: todayDate,
      startTime: currentTime,
      endTime: currentTime
    });

    return availability.isAvailable;
  }

  /**
   * 📅 Get next opening time
   */
  async getNextOpeningTime(businessId: string): Promise<{
    date: string;
    time: string;
    dayOfWeek: string;
  } | null> {
    const hours = await this.getBusinessHours(businessId);
    const now = new Date();

    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);

      const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;
      const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek && h.isOpen);

      if (dayHours && dayHours.timeSlots.length > 0) {
        const firstSlot = dayHours.timeSlots[0];

        // If it's today, check if time hasn't passed
        if (i === 0) {
          const currentTime = now.toTimeString().slice(0, 5);
          if (firstSlot.startTime <= currentTime) {
            continue; // Time has passed today
          }
        }

        return {
          date: checkDate.toISOString().split('T')[0],
          time: firstSlot.startTime,
          dayOfWeek: dayOfWeek
        };
      }
    }

    return null;
  }

  /**
   * 📊 Get business hours summary
   */
  async getBusinessHoursSummary(businessId: string): Promise<{
    isOpenToday: boolean;
    nextOpenTime?: { date: string; time: string; dayOfWeek: string };
    todayHours: TimeSlot[];
    weeklySchedule: Record<DayOfWeek, { isOpen: boolean; timeSlots: TimeSlot[] }>;
  }> {
    const [hours, isOpenToday, nextOpenTime] = await Promise.all([
      this.getBusinessHours(businessId),
      this.isOpenNow(businessId),
      this.getNextOpeningTime(businessId)
    ]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;
    const todayHours = hours.find(h => h.dayOfWeek === today)?.timeSlots || [];

    const weeklySchedule = {} as Record<DayOfWeek, { isOpen: boolean; timeSlots: TimeSlot[] }>;
    Object.values(DayOfWeek).forEach(day => {
      const dayHours = hours.find(h => h.dayOfWeek === day);
      weeklySchedule[day] = {
        isOpen: dayHours?.isOpen || false,
        timeSlots: dayHours?.timeSlots || []
      };
    });

    return {
      isOpenToday,
      nextOpenTime: nextOpenTime || undefined,
      todayHours,
      weeklySchedule
    };
  }

  /**
   * 🛡️ Utility methods
   */
  static formatTimeSlot(timeSlot: TimeSlot): string {
    return `${timeSlot.startTime} - ${timeSlot.endTime}`;
  }

  static formatDaySchedule(day: DayOfWeek, timeSlots: TimeSlot[]): string {
    if (timeSlots.length === 0) {
      return `${day}: Fermé`;
    }

    const slotsText = timeSlots.map(slot => this.formatTimeSlot(slot)).join(', ');
    return `${day}: ${slotsText}`;
  }

  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }

  static parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static calculateSlotDuration(timeSlot: TimeSlot): number {
    const startMinutes = this.parseTimeToMinutes(timeSlot.startTime);
    const endMinutes = this.parseTimeToMinutes(timeSlot.endTime);
    return endMinutes - startMinutes;
  }

  static getTotalDailyHours(timeSlots: TimeSlot[]): number {
    return timeSlots.reduce((total, slot) => total + this.calculateSlotDuration(slot), 0);
  }

  static getDayOfWeekFromDate(date: string): DayOfWeek {
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return dayName as DayOfWeek;
  }

  static sortTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
    return [...timeSlots].sort((a, b) => {
      const aStart = this.parseTimeToMinutes(a.startTime);
      const bStart = this.parseTimeToMinutes(b.startTime);
      return aStart - bStart;
    });
  }

  static validateTimeSlots(timeSlots: TimeSlot[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const slot of timeSlots) {
      if (!this.isValidTimeFormat(slot.startTime)) {
        errors.push(`Format d'heure de début invalide: ${slot.startTime}`);
      }
      if (!this.isValidTimeFormat(slot.endTime)) {
        errors.push(`Format d'heure de fin invalide: ${slot.endTime}`);
      }

      const startMinutes = this.parseTimeToMinutes(slot.startTime);
      const endMinutes = this.parseTimeToMinutes(slot.endTime);

      if (startMinutes >= endMinutes) {
        errors.push(`L'heure de fin doit être après l'heure de début: ${slot.startTime} - ${slot.endTime}`);
      }
    }

    // Check for overlapping slots
    const sortedSlots = this.sortTimeSlots(timeSlots);
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      const currentEnd = this.parseTimeToMinutes(current.endTime);
      const nextStart = this.parseTimeToMinutes(next.startTime);

      if (currentEnd > nextStart) {
        errors.push(`Créneaux qui se chevauchent: ${this.formatTimeSlot(current)} et ${this.formatTimeSlot(next)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateWeeklyTemplate(
    mondayToFriday: TimeSlot[] = [{ startTime: '09:00', endTime: '17:00' }],
    saturday: TimeSlot[] = [],
    sunday: TimeSlot[] = [],
    timezone: string = 'UTC'
  ): WeeklyHours {
    return {
      monday: mondayToFriday,
      tuesday: mondayToFriday,
      wednesday: mondayToFriday,
      thursday: mondayToFriday,
      friday: mondayToFriday,
      saturday,
      sunday,
      timezone
    };
  }
}

export default BusinessHoursRealService;
