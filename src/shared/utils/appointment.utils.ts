/**
 * 📅 Appointment Management Utilities
 * 
 * Comprehensive utility functions for appointment lifecycle management, validation,
 * and business rule enforcement in professional service environments.
 * 
 * Features:
 * - Smart appointment validation and conflict detection
 * - Recurrence pattern generation and management
 * - Business rule enforcement and policy compliance
 * - Time zone handling and calendar calculations
 * - Revenue calculations and pricing logic
 * - Client communication and notification management
 */

import {
  AppointmentStatus,
  AppointmentRecurrenceType,
  AppointmentReminderType,
  AppointmentReminderTiming,
  AppointmentPaymentStatus,
  AppointmentPriority,
  AppointmentSource,
  AppointmentType,
  AppointmentLocationType,
  AppointmentConfirmationType,
  AppointmentRecurrenceConfig,
  AppointmentReminderConfig,
  AppointmentLocationInfo,
  AppointmentPricing,
  AppointmentMetadata,
  isModifiableStatus,
  isFinalStatus,
  getValidStatusTransitions,
  isValidStatusTransition,
  DEFAULT_REMINDER_CONFIGS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_PRIORITY_COLORS
} from '../enums/appointment.enums';

/**
 * 🕐 Time and Duration Management Utilities
 */
export class AppointmentTimeUtils {
  /**
   * Calculate appointment end time based on start time and service duration
   */
  static calculateEndTime(startTime: Date, durationMinutes: number): Date {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
  }

  /**
   * Calculate duration between two dates in minutes
   */
  static calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  /**
   * Check if appointment times overlap
   */
  static doAppointmentsOverlap(
    start1: Date, end1: Date,
    start2: Date, end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Check if appointment is within business hours
   */
  static isWithinBusinessHours(
    appointmentStart: Date,
    appointmentEnd: Date,
    businessHours: {
      start: string; // "09:00"
      end: string;   // "17:00"
      days: number[]; // [1,2,3,4,5] for Mon-Fri
    }
  ): boolean {
    const dayOfWeek = appointmentStart.getDay();
    
    if (!businessHours.days.includes(dayOfWeek)) {
      return false;
    }

    const startHour = appointmentStart.getHours() + appointmentStart.getMinutes() / 60;
    const endHour = appointmentEnd.getHours() + appointmentEnd.getMinutes() / 60;
    
    const [businessStartHour, businessStartMin] = businessHours.start.split(':').map(Number);
    const [businessEndHour, businessEndMin] = businessHours.end.split(':').map(Number);
    
    const businessStart = businessStartHour + businessStartMin / 60;
    const businessEnd = businessEndHour + businessEndMin / 60;

    return startHour >= businessStart && endHour <= businessEnd;
  }

  /**
   * Calculate buffer time needed between appointments
   */
  static calculateBufferTime(
    serviceType: string,
    defaultBufferMinutes: number = 15
  ): number {
    // Different services may need different buffer times
    const bufferRules: Record<string, number> = {
      'SURGERY': 30,
      'CONSULTATION': 10,
      'TREATMENT': 15,
      'EMERGENCY': 5
    };

    return bufferRules[serviceType] || defaultBufferMinutes;
  }

  /**
   * Get next available time slot considering buffer time
   */
  static getNextAvailableSlot(
    lastAppointmentEnd: Date,
    bufferMinutes: number,
    serviceDurationMinutes: number
  ): { startTime: Date; endTime: Date } {
    const startTime = new Date(lastAppointmentEnd);
    startTime.setMinutes(startTime.getMinutes() + bufferMinutes);
    
    const endTime = this.calculateEndTime(startTime, serviceDurationMinutes);
    
    return { startTime, endTime };
  }

  /**
   * Round time to nearest appointment slot (e.g., 15-minute intervals)
   */
  static roundToNearestSlot(date: Date, intervalMinutes: number = 15): Date {
    const rounded = new Date(date);
    const minutes = rounded.getMinutes();
    const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
    
    rounded.setMinutes(roundedMinutes, 0, 0);
    
    // Handle hour overflow
    if (roundedMinutes >= 60) {
      rounded.setHours(rounded.getHours() + 1);
      rounded.setMinutes(roundedMinutes - 60);
    }
    
    return rounded;
  }

  /**
   * Check if appointment is in the past
   */
  static isInPast(appointmentTime: Date): boolean {
    return appointmentTime < new Date();
  }

  /**
   * Check if appointment is within cancellation deadline
   */
  static isWithinCancellationDeadline(
    appointmentTime: Date,
    cancellationHours: number = 24
  ): boolean {
    const deadline = new Date(appointmentTime);
    deadline.setHours(deadline.getHours() - cancellationHours);
    return new Date() < deadline;
  }
}

/**
 * 🔁 Recurrence Pattern Management Utilities
 */
export class AppointmentRecurrenceUtils {
  /**
   * Generate recurring appointment dates based on pattern
   */
  static generateRecurringDates(
    startDate: Date,
    config: AppointmentRecurrenceConfig
  ): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (this.shouldContinueRecurrence(currentDate, config, occurrenceCount)) {
      dates.push(new Date(currentDate));
      currentDate = this.getNextRecurrenceDate(currentDate, config);
      occurrenceCount++;
    }

    return dates;
  }

  private static shouldContinueRecurrence(
    date: Date,
    config: AppointmentRecurrenceConfig,
    count: number
  ): boolean {
    if (config.endDate && date > config.endDate) {
      return false;
    }
    
    if (config.maxOccurrences && count >= config.maxOccurrences) {
      return false;
    }

    return true;
  }

  private static getNextRecurrenceDate(
    currentDate: Date,
    config: AppointmentRecurrenceConfig
  ): Date {
    const nextDate = new Date(currentDate);

    switch (config.type) {
      case AppointmentRecurrenceType.DAILY:
        nextDate.setDate(nextDate.getDate() + config.interval);
        break;

      case AppointmentRecurrenceType.WEEKLY:
        nextDate.setDate(nextDate.getDate() + (7 * config.interval));
        break;

      case AppointmentRecurrenceType.BI_WEEKLY:
        nextDate.setDate(nextDate.getDate() + (14 * config.interval));
        break;

      case AppointmentRecurrenceType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + config.interval);
        break;

      case AppointmentRecurrenceType.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + (3 * config.interval));
        break;

      case AppointmentRecurrenceType.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + config.interval);
        break;

      case AppointmentRecurrenceType.CUSTOM:
        // Custom logic would go here based on additional config
        if (config.daysOfWeek && config.daysOfWeek.length > 0) {
          // Find next occurrence on specified days of week
          const targetDays = config.daysOfWeek;
          let daysToAdd = 1;
          
          while (!targetDays.includes((nextDate.getDay() + daysToAdd) % 7)) {
            daysToAdd++;
          }
          
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
        break;
    }

    return nextDate;
  }

  /**
   * Validate recurrence configuration
   */
  static validateRecurrenceConfig(config: AppointmentRecurrenceConfig): string[] {
    const errors: string[] = [];

    if (config.interval <= 0) {
      errors.push('Recurrence interval must be greater than 0');
    }

    if (config.endDate && config.endDate <= new Date()) {
      errors.push('Recurrence end date must be in the future');
    }

    if (config.maxOccurrences && config.maxOccurrences <= 0) {
      errors.push('Max occurrences must be greater than 0');
    }

    if (config.type === AppointmentRecurrenceType.CUSTOM) {
      if (!config.daysOfWeek || config.daysOfWeek.length === 0) {
        errors.push('Custom recurrence requires days of week specification');
      }
    }

    return errors;
  }
}

/**
 * 💰 Pricing and Payment Utilities
 */
export class AppointmentPricingUtils {
  /**
   * Calculate total appointment cost including taxes and discounts
   */
  static calculateTotalPrice(pricing: Partial<AppointmentPricing>): AppointmentPricing {
    const baseAmount = pricing.basePrice?.amount || 0;
    let totalAmount = baseAmount;

    // Apply discounts
    const discountAmount = (pricing.discounts || []).reduce(
      (sum, discount) => sum + discount.amount,
      0
    );
    totalAmount -= discountAmount;

    // Apply taxes
    const taxAmount = (pricing.taxes || []).reduce(
      (sum, tax) => sum + tax.amount,
      0
    );
    totalAmount += taxAmount;

    return {
      basePrice: pricing.basePrice || { amount: 0, currency: 'EUR' },
      discounts: pricing.discounts || [],
      taxes: pricing.taxes || [],
      totalAmount: {
        amount: Math.max(0, totalAmount), // Prevent negative amounts
        currency: pricing.basePrice?.currency || 'EUR'
      },
      paymentStatus: pricing.paymentStatus || AppointmentPaymentStatus.NOT_REQUIRED
    };
  }

  /**
   * Calculate cancellation fee based on timing and policy
   */
  static calculateCancellationFee(
    appointmentPrice: number,
    appointmentTime: Date,
    cancellationTime: Date,
    policy: {
      minimumNoticeHours: number;
      feePercentage: number; // 0-100
      flatFee?: number;
    }
  ): { fee: number; refund: number; reason: string } {
    const hoursNotice = (appointmentTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursNotice >= policy.minimumNoticeHours) {
      return {
        fee: 0,
        refund: appointmentPrice,
        reason: 'Cancelled within policy - no fee'
      };
    }

    const percentageFee = (appointmentPrice * policy.feePercentage) / 100;
    const fee = policy.flatFee ? Math.max(percentageFee, policy.flatFee) : percentageFee;
    
    return {
      fee: Math.min(fee, appointmentPrice),
      refund: Math.max(0, appointmentPrice - fee),
      reason: `Late cancellation - ${hoursNotice.toFixed(1)} hours notice`
    };
  }

  /**
   * Calculate dynamic pricing based on demand and availability
   */
  static calculateDynamicPrice(
    basePrice: number,
    demandFactor: number, // 0.5-2.0 (low to high demand)
    availabilityFactor: number, // 0.5-2.0 (high to low availability)
    timeOfDay?: 'peak' | 'off-peak' | 'normal'
  ): number {
    let price = basePrice;

    // Apply demand multiplier
    price *= demandFactor;

    // Apply availability multiplier
    price *= availabilityFactor;

    // Apply time-of-day pricing
    const timeMultipliers = {
      'peak': 1.2,
      'off-peak': 0.8,
      'normal': 1.0
    };

    if (timeOfDay) {
      price *= timeMultipliers[timeOfDay];
    }

    return Math.round(price);
  }
}

/**
 * 📅 Appointment Validation Utilities
 */
export class AppointmentValidationUtils {
  /**
   * Validate appointment data for creation
   */
  static validateAppointmentCreation(appointmentData: {
    startTime: Date;
    endTime: Date;
    businessId: string;
    serviceId: string;
    staffId?: string;
    calendarId: string;
    clientInfo?: any;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Time validation
    if (appointmentData.startTime >= appointmentData.endTime) {
      errors.push('End time must be after start time');
    }

    if (AppointmentTimeUtils.isInPast(appointmentData.startTime)) {
      errors.push('Appointment cannot be scheduled in the past');
    }

    // Duration validation (minimum 5 minutes, maximum 8 hours)
    const duration = AppointmentTimeUtils.calculateDuration(
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (duration < 5) {
      errors.push('Appointment must be at least 5 minutes long');
    }

    if (duration > 480) {
      errors.push('Appointment cannot exceed 8 hours');
    }

    // Required field validation
    if (!appointmentData.businessId?.trim()) {
      errors.push('Business ID is required');
    }

    if (!appointmentData.serviceId?.trim()) {
      errors.push('Service ID is required');
    }

    if (!appointmentData.calendarId?.trim()) {
      errors.push('Calendar ID is required');
    }

    // Client info validation
    if (appointmentData.clientInfo) {
      const clientErrors = this.validateClientInfo(appointmentData.clientInfo);
      errors.push(...clientErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate client information
   */
  static validateClientInfo(clientInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): string[] {
    const errors: string[] = [];

    if (!clientInfo.firstName?.trim()) {
      errors.push('Client first name is required');
    }

    if (!clientInfo.lastName?.trim()) {
      errors.push('Client last name is required');
    }

    if (clientInfo.email && !this.isValidEmail(clientInfo.email)) {
      errors.push('Invalid email format');
    }

    if (clientInfo.phone && !this.isValidPhone(clientInfo.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (international)
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate appointment update
   */
  static validateAppointmentUpdate(
    currentStatus: AppointmentStatus,
    updateData: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isModifiableStatus(currentStatus)) {
      errors.push(`Cannot modify appointment with status: ${currentStatus}`);
    }

    if (updateData.status && !isValidStatusTransition(currentStatus, updateData.status)) {
      errors.push(`Invalid status transition from ${currentStatus} to ${updateData.status}`);
    }

    if (updateData.startTime && updateData.endTime) {
      if (new Date(updateData.startTime) >= new Date(updateData.endTime)) {
        errors.push('End time must be after start time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * 🔔 Notification and Reminder Utilities
 */
export class AppointmentNotificationUtils {
  /**
   * Get default reminder configuration for appointment type
   */
  static getDefaultReminders(appointmentType: AppointmentType): AppointmentReminderConfig[] {
    return DEFAULT_REMINDER_CONFIGS[appointmentType] || DEFAULT_REMINDER_CONFIGS[AppointmentType.CONSULTATION];
  }

  /**
   * Calculate when reminders should be sent
   */
  static calculateReminderTimes(
    appointmentTime: Date,
    reminders: AppointmentReminderConfig[]
  ): Array<{ reminderConfig: AppointmentReminderConfig; sendAt: Date }> {
    return reminders.map(reminder => ({
      reminderConfig: reminder,
      sendAt: this.calculateReminderSendTime(appointmentTime, reminder.timing)
    }));
  }

  private static calculateReminderSendTime(
    appointmentTime: Date,
    timing: AppointmentReminderTiming
  ): Date {
    const sendTime = new Date(appointmentTime);

    switch (timing) {
      case AppointmentReminderTiming.ONE_HOUR:
        sendTime.setHours(sendTime.getHours() - 1);
        break;
      case AppointmentReminderTiming.TWO_HOURS:
        sendTime.setHours(sendTime.getHours() - 2);
        break;
      case AppointmentReminderTiming.MORNING_OF:
        sendTime.setHours(8, 0, 0, 0); // 8 AM on appointment day
        break;
      case AppointmentReminderTiming.ONE_DAY:
        sendTime.setDate(sendTime.getDate() - 1);
        break;
      case AppointmentReminderTiming.TWO_DAYS:
        sendTime.setDate(sendTime.getDate() - 2);
        break;
      case AppointmentReminderTiming.ONE_WEEK:
        sendTime.setDate(sendTime.getDate() - 7);
        break;
    }

    return sendTime;
  }

  /**
   * Generate personalized reminder message
   */
  static generateReminderMessage(
    appointmentData: {
      clientName: string;
      serviceName: string;
      appointmentTime: Date;
      businessName: string;
      location?: string;
    },
    reminderType: AppointmentReminderType,
    language: string = 'fr'
  ): string {
    const formatTime = (date: Date) => {
      return date.toLocaleString(language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const templates = {
      fr: {
        [AppointmentReminderType.EMAIL]: `
          Bonjour ${appointmentData.clientName},
          
          Nous vous rappelons votre rendez-vous pour ${appointmentData.serviceName} 
          prévu le ${formatTime(appointmentData.appointmentTime)} 
          chez ${appointmentData.businessName}.
          
          ${appointmentData.location ? `Adresse: ${appointmentData.location}` : ''}
          
          Cordialement,
          L'équipe ${appointmentData.businessName}
        `,
        [AppointmentReminderType.SMS]: `
          Rappel RDV: ${appointmentData.serviceName} 
          le ${formatTime(appointmentData.appointmentTime)} 
          chez ${appointmentData.businessName}
        `
      },
      en: {
        [AppointmentReminderType.EMAIL]: `
          Hello ${appointmentData.clientName},
          
          This is a reminder of your appointment for ${appointmentData.serviceName} 
          scheduled on ${formatTime(appointmentData.appointmentTime)} 
          at ${appointmentData.businessName}.
          
          ${appointmentData.location ? `Location: ${appointmentData.location}` : ''}
          
          Best regards,
          ${appointmentData.businessName} Team
        `,
        [AppointmentReminderType.SMS]: `
          Appointment reminder: ${appointmentData.serviceName} 
          on ${formatTime(appointmentData.appointmentTime)} 
          at ${appointmentData.businessName}
        `
      }
    };

    const languageTemplates = templates[language as keyof typeof templates] || templates.en;
    return (languageTemplates as any)[reminderType] || languageTemplates[AppointmentReminderType.EMAIL];
  }
}

/**
 * 📊 Appointment Analytics Utilities
 */
export class AppointmentAnalyticsUtils {
  /**
   * Calculate appointment metrics for a given period
   */
  static calculateMetrics(appointments: Array<{
    status: AppointmentStatus;
    startTime: Date;
    endTime: Date;
    price?: { amount: number; currency: string };
    source: AppointmentSource;
  }>): {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    totalRevenue: number;
    averageAppointmentValue: number;
    completionRate: number;
    noShowRate: number;
    sourceBuckets: Record<AppointmentSource, number>;
  } {
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const cancelledAppointments = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length;
    const noShowAppointments = appointments.filter(a => a.status === AppointmentStatus.NO_SHOW).length;

    const totalRevenue = appointments
      .filter(a => a.status === AppointmentStatus.COMPLETED && a.price)
      .reduce((sum, a) => sum + (a.price?.amount || 0), 0);

    const averageAppointmentValue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    // Source distribution
    const sourceBuckets = appointments.reduce((buckets, appointment) => {
      buckets[appointment.source] = (buckets[appointment.source] || 0) + 1;
      return buckets;
    }, {} as Record<AppointmentSource, number>);

    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      totalRevenue,
      averageAppointmentValue,
      completionRate,
      noShowRate,
      sourceBuckets
    };
  }

  /**
   * Identify peak booking times
   */
  static findPeakBookingTimes(appointments: Array<{ startTime: Date }>): {
    peakHours: number[];
    peakDays: number[];
    hourlyDistribution: Record<number, number>;
    dailyDistribution: Record<number, number>;
  } {
    const hourlyDistribution: Record<number, number> = {};
    const dailyDistribution: Record<number, number> = {};

    appointments.forEach(appointment => {
      const hour = appointment.startTime.getHours();
      const day = appointment.startTime.getDay();

      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
    });

    // Find peak hours (top 25% by volume)
    const sortedHours = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([hour]) => parseInt(hour));
    const peakHours = sortedHours.slice(0, Math.ceil(sortedHours.length * 0.25));

    // Find peak days (top 25% by volume)
    const sortedDays = Object.entries(dailyDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([day]) => parseInt(day));
    const peakDays = sortedDays.slice(0, Math.ceil(sortedDays.length * 0.25));

    return {
      peakHours,
      peakDays,
      hourlyDistribution,
      dailyDistribution
    };
  }
}

/**
 * 🎨 Frontend Integration Helpers
 */
export class AppointmentUIUtils {
  /**
   * Get status display information for UI
   */
  static getStatusDisplay(status: AppointmentStatus): {
    label: string;
    color: string;
    icon: string;
    description: string;
  } {
    const displays = {
      [AppointmentStatus.PENDING]: {
        label: 'En attente',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.PENDING],
        icon: '🕐',
        description: 'Rendez-vous en attente de confirmation'
      },
      [AppointmentStatus.CONFIRMED]: {
        label: 'Confirmé',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.CONFIRMED],
        icon: '✅',
        description: 'Rendez-vous confirmé et planifié'
      },
      [AppointmentStatus.IN_PROGRESS]: {
        label: 'En cours',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.IN_PROGRESS],
        icon: '🏃',
        description: 'Rendez-vous actuellement en cours'
      },
      [AppointmentStatus.COMPLETED]: {
        label: 'Terminé',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.COMPLETED],
        icon: '🏁',
        description: 'Rendez-vous terminé avec succès'
      },
      [AppointmentStatus.CANCELLED]: {
        label: 'Annulé',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.CANCELLED],
        icon: '❌',
        description: 'Rendez-vous annulé'
      },
      [AppointmentStatus.NO_SHOW]: {
        label: 'Absence',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.NO_SHOW],
        icon: '👻',
        description: 'Client non présenté'
      },
      [AppointmentStatus.RESCHEDULED]: {
        label: 'Reporté',
        color: APPOINTMENT_STATUS_COLORS[AppointmentStatus.RESCHEDULED],
        icon: '📅',
        description: 'Rendez-vous reporté'
      }
    };

    return displays[status];
  }

  /**
   * Get priority display information for UI
   */
  static getPriorityDisplay(priority: AppointmentPriority): {
    label: string;
    color: string;
    icon: string;
    weight: number;
  } {
    const displays = {
      [AppointmentPriority.EMERGENCY]: {
        label: 'Urgence',
        color: APPOINTMENT_PRIORITY_COLORS[AppointmentPriority.EMERGENCY],
        icon: '🚨',
        weight: 4
      },
      [AppointmentPriority.HIGH]: {
        label: 'Haute',
        color: APPOINTMENT_PRIORITY_COLORS[AppointmentPriority.HIGH],
        icon: '🔴',
        weight: 3
      },
      [AppointmentPriority.NORMAL]: {
        label: 'Normale',
        color: APPOINTMENT_PRIORITY_COLORS[AppointmentPriority.NORMAL],
        icon: '🔵',
        weight: 2
      },
      [AppointmentPriority.LOW]: {
        label: 'Faible',
        color: APPOINTMENT_PRIORITY_COLORS[AppointmentPriority.LOW],
        icon: '🟢',
        weight: 1
      }
    };

    return displays[priority];
  }

  /**
   * Format appointment duration for display
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}min`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${remainingMinutes}min`;
  }

  /**
   * Generate calendar event data for integration
   */
  static toCalendarEvent(appointment: any): {
    id: string;
    title: string;
    start: Date;
    end: Date;
    color: string;
    description: string;
    location?: string;
  } {
    const statusDisplay = this.getStatusDisplay(appointment.status);
    
    return {
      id: appointment.id,
      title: `${appointment.service?.name || 'Appointment'} - ${appointment.clientInfo?.firstName} ${appointment.clientInfo?.lastName}`,
      start: new Date(appointment.startTime),
      end: new Date(appointment.endTime),
      color: statusDisplay.color,
      description: appointment.notes || statusDisplay.description,
      location: appointment.location?.address
    };
  }
}

// Export all utilities as a unified namespace
export const AppointmentUtils = {
  Time: AppointmentTimeUtils,
  Recurrence: AppointmentRecurrenceUtils,
  Pricing: AppointmentPricingUtils,
  Validation: AppointmentValidationUtils,
  Notifications: AppointmentNotificationUtils,
  Analytics: AppointmentAnalyticsUtils,
  UI: AppointmentUIUtils
};

export default AppointmentUtils;
