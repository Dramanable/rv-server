import {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from '../entities/appointment.entity';
import { BusinessId } from '../value-objects/business-id.value-object';
import { CalendarId } from '../value-objects/calendar-id.value-object';
import { Email } from '../value-objects/email.value-object';
import { ServiceId } from '../value-objects/service-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { AppointmentStatisticsData } from '../value-objects/appointment-statistics.vo';
import { StatisticsPeriod } from '../value-objects/statistics-period.vo';

/**
 * 📅 APPOINTMENT REPOSITORY INTERFACE
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles - Interface Segregation
 * ✅ Rich queries for appointment management
 */

export const APPOINTMENT_REPOSITORY = 'APPOINTMENT_REPOSITORY';

export interface AppointmentSearchCriteria {
  businessId?: BusinessId;
  calendarId?: CalendarId;
  serviceId?: ServiceId;
  clientEmail?: Email;
  staffId?: UserId;
  status?: AppointmentStatus[];
  // type retiré - le type est déterminé par le Service lié
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface AppointmentStatisticsCriteria {
  businessId?: BusinessId; // Optional pour PLATFORM_ADMIN
  staffId?: UserId;
  serviceId?: ServiceId;
  period: StatisticsPeriod;
}

export interface AppointmentStatistics {
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  utilizationRate: number;
  averageDuration: number;
  revenueGenerated: number;
  topServices: {
    serviceId: ServiceId;
    count: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number;
    appointmentCount: number;
  }[];
}

export interface AppointmentRepository {
  /**
   * Find appointment by ID
   */
  findById(id: AppointmentId): Promise<Appointment | null>;

  /**
   * Find appointments by business
   */
  findByBusinessId(
    businessId: BusinessId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]>;

  /**
   * Find appointments by calendar
   */
  findByCalendarId(
    calendarId: CalendarId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Appointment[]>;

  /**
   * Find appointments by service
   */
  findByServiceId(
    serviceId: ServiceId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]>;

  /**
   * Find appointments by client email
   */
  findByClientEmail(
    email: Email,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]>;

  /**
   * Find appointments by assigned staff
   */
  findByStaffId(
    staffId: UserId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]>;

  /**
   * Find appointments by status
   */
  findByStatus(
    status: AppointmentStatus[],
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]>;

  /**
   * Search appointments with complex criteria
   */
  search(criteria: AppointmentSearchCriteria): Promise<{
    appointments: Appointment[];
    total: number;
  }>;

  /**
   * Save appointment (create or update)
   */
  save(appointment: Appointment): Promise<void>;

  /**
   * Delete appointment
   */
  delete(id: AppointmentId): Promise<void>;

  /**
   * Find conflicting appointments for a time slot
   */
  findConflictingAppointments(
    calendarId: CalendarId,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: AppointmentId,
  ): Promise<Appointment[]>;

  /**
   * Find available time slots
   */
  findAvailableSlots(
    calendarId: CalendarId,
    serviceId: ServiceId,
    date: Date,
    duration: number,
  ): Promise<
    {
      startTime: Date;
      endTime: Date;
    }[]
  >;

  /**
   * Get upcoming appointments (next 24 hours)
   */
  getUpcomingAppointments(
    businessId: BusinessId,
    hours?: number,
  ): Promise<Appointment[]>;

  /**
   * Get overdue appointments (past due, not completed)
   */
  getOverdueAppointments(businessId: BusinessId): Promise<Appointment[]>;

  /**
   * Find recurring appointments
   */
  findRecurringAppointments(
    businessId: BusinessId,
    parentAppointmentId?: AppointmentId,
  ): Promise<Appointment[]>;

  /**
   * Get appointments requiring reminders
   */
  getAppointmentsForReminders(
    businessId: BusinessId,
    reminderTime: Date,
  ): Promise<Appointment[]>;

  /**
   * Bulk operations
   */
  bulkUpdateStatus(
    appointmentIds: AppointmentId[],
    status: AppointmentStatus,
    reason?: string,
  ): Promise<void>;

  bulkCancel(appointmentIds: AppointmentId[], reason?: string): Promise<void>;

  /**
   * Get client appointment history
   */
  getClientHistory(
    email: Email,
    businessId?: BusinessId,
    limit?: number,
  ): Promise<Appointment[]>;

  /**
   * Find appointments needing follow-up
   */
  findAppointmentsNeedingFollowUp(
    businessId: BusinessId,
    daysSinceCompletion: number,
  ): Promise<Appointment[]>;

  /**
   * Get calendar utilization
   */
  getCalendarUtilization(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationPercentage: number;
    peakTimes: { time: string; bookingCount: number }[];
  }>;

  /**
   * Count appointments by criteria
   */
  count(criteria: AppointmentSearchCriteria): Promise<number>;

  /**
   * Export appointments for reporting
   */
  export(criteria: AppointmentSearchCriteria): Promise<Appointment[]>;

  /**
   * Get appointment statistics for a given period and filters
   */
  getStatistics(
    criteria: AppointmentStatisticsCriteria,
  ): Promise<AppointmentStatisticsData>;
}
