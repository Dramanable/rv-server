import { Calendar } from '../entities/calendar.entity';
import { CalendarId } from '../value-objects/calendar-id.value-object';
import { BusinessId } from '../value-objects/business-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { TimeSlot } from '../value-objects/time-slot.value-object';

export const CALENDAR_REPOSITORY = 'CALENDAR_REPOSITORY';

export interface CalendarRepository {
  /**
   * Find calendar by ID
   */
  findById(id: CalendarId): Promise<Calendar | null>;

  /**
   * Find all calendars for a business
   */
  findByBusinessId(businessId: BusinessId): Promise<Calendar[]>;

  /**
   * Find calendar by owner (staff member)
   */
  findByOwnerId(ownerId: UserId): Promise<Calendar[]>;

  /**
   * Find calendars by type
   */
  findByType(businessId: BusinessId, type: string): Promise<Calendar[]>;

  /**
   * Save calendar (create or update)
   */
  save(calendar: Calendar): Promise<void>;

  /**
   * Delete calendar
   */
  delete(id: CalendarId): Promise<void>;

  /**
   * Get available time slots for multiple calendars
   */
  findAvailableSlots(
    calendarIds: CalendarId[],
    startDate: Date,
    endDate: Date,
    duration: number,
  ): Promise<
    {
      calendarId: CalendarId;
      slots: TimeSlot[];
    }[]
  >;

  /**
   * Get booked time slots for a calendar
   */
  getBookedSlots(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSlot[]>;

  /**
   * Check if time slot is available
   */
  isSlotAvailable(calendarId: CalendarId, timeSlot: TimeSlot): Promise<boolean>;

  /**
   * Find overlapping calendars for a time slot
   */
  findOverlappingCalendars(
    businessId: BusinessId,
    timeSlot: TimeSlot,
    excludeCalendarIds?: CalendarId[],
  ): Promise<Calendar[]>;

  /**
   * Get calendar utilization statistics
   */
  getUtilizationStats(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
    peakHours: { hour: number; bookings: number }[];
    peakDays: { day: string; bookings: number }[];
  }>;

  /**
   * Find calendars with availability in date range
   */
  findCalendarsWithAvailability(
    businessId: BusinessId,
    startDate: Date,
    endDate: Date,
    duration: number,
  ): Promise<Calendar[]>;

  /**
   * Get recurring availability patterns
   */
  getRecurringPatterns(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      pattern: string;
      nextOccurrence: Date;
      frequency: number;
    }[]
  >;
}
