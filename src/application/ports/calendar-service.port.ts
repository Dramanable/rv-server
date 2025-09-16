import { Calendar } from '../../domain/entities/calendar.entity';
import { CalendarId } from '../../domain/value-objects/calendar-id.value-object';
import { BusinessId } from '../../domain/value-objects/business-id.value-object';
import { UserId } from '../../domain/value-objects/user-id.value-object';
import { TimeSlot } from '../../domain/value-objects/time-slot.value-object';
import { RecurrencePattern } from '../../domain/value-objects/recurrence-pattern.value-object';

export interface CalendarSlotRequest {
  calendarIds: CalendarId[];
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  participantCount?: number;
  serviceId?: string;
  preferredTimes?: string[]; // ["09:00", "14:00"]
  avoidTimes?: string[];
}

export interface CalendarSlotResult {
  calendarId: CalendarId;
  slot: TimeSlot;
  confidence: number; // 0-1, how well this slot matches preferences
  alternatives?: TimeSlot[];
  requiresApproval: boolean;
  warnings?: string[];
}

export interface CalendarConflict {
  calendarId: CalendarId;
  conflictingSlot: TimeSlot;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: TimeSlot[];
}

export interface CalendarSyncResult {
  synchronized: CalendarId[];
  conflicts: CalendarConflict[];
  errors: { calendarId: CalendarId; error: string }[];
}

/**
 * Port for advanced calendar management operations
 */
export interface CalendarServicePort {
  /**
   * Find optimal time slots across multiple calendars
   */
  findOptimalSlots(request: CalendarSlotRequest): Promise<CalendarSlotResult[]>;

  /**
   * Check for conflicts when booking a time slot
   */
  checkBookingConflicts(
    calendarIds: CalendarId[],
    timeSlot: TimeSlot,
    excludeBookingIds?: string[]
  ): Promise<CalendarConflict[]>;

  /**
   * Synchronize multiple calendars for a business
   */
  synchronizeCalendars(
    businessId: BusinessId,
    calendarIds: CalendarId[]
  ): Promise<CalendarSyncResult>;

  /**
   * Generate recurring time slots based on pattern
   */
  generateRecurringSlots(
    calendar: Calendar,
    pattern: RecurrencePattern,
    startDate: Date,
    duration: number,
    maxOccurrences: number
  ): Promise<TimeSlot[]>;

  /**
   * Optimize calendar schedule for maximum utilization
   */
  optimizeSchedule(
    calendarId: CalendarId,
    period: { start: Date; end: Date },
    constraints: {
      minSlotDuration: number;
      maxSlotDuration: number;
      preferredSlotDuration: number;
      bufferTime: number;
    }
  ): Promise<{
    optimizedSlots: TimeSlot[];
    utilizationImprovement: number;
    recommendations: string[];
  }>;

  /**
   * Find alternative slots when preferred time is not available
   */
  findAlternativeSlots(
    calendarIds: CalendarId[],
    preferredSlot: TimeSlot,
    flexibilityHours: number,
    maxAlternatives: number
  ): Promise<CalendarSlotResult[]>;

  /**
   * Block time slots for maintenance or special events
   */
  blockTimeSlots(
    calendarId: CalendarId,
    timeSlots: TimeSlot[],
    reason: string,
    recurrence?: RecurrencePattern
  ): Promise<void>;

  /**
   * Release blocked time slots
   */
  releaseTimeSlots(
    calendarId: CalendarId,
    timeSlots: TimeSlot[]
  ): Promise<void>;

  /**
   * Get calendar availability summary
   */
  getAvailabilitySummary(
    calendarIds: CalendarId[],
    period: { start: Date; end: Date }
  ): Promise<{
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    blockedSlots: number;
    utilizationByDay: { date: string; utilization: number }[];
    peakTimes: { time: string; demand: number }[];
  }>;

  /**
   * Validate calendar configuration
   */
  validateCalendarConfiguration(calendar: Calendar): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>;

  /**
   * Import external calendar events
   */
  importExternalEvents(
    calendarId: CalendarId,
    events: {
      title: string;
      startTime: Date;
      endTime: Date;
      isBlocking: boolean;
      recurrence?: RecurrencePattern;
    }[]
  ): Promise<{
    imported: number;
    conflicts: CalendarConflict[];
    errors: string[];
  }>;

  /**
   * Calculate optimal break times
   */
  calculateOptimalBreaks(
    calendarId: CalendarId,
    workingHours: { start: string; end: string },
    breakDuration: number,
    minTimeBetweenBreaks: number
  ): Promise<TimeSlot[]>;
}
