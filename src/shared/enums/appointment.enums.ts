/**
 * 📅 Appointment Management Enums & Types
 * 
 * Comprehensive type definitions for appointment lifecycle management in professional services.
 * Designed for multi-tenant appointment systems with complex business rules and integrations.
 * 
 * Features:
 * - Type-safe appointment status management
 * - Flexible recurrence pattern definitions
 * - Client communication preferences
 * - Payment and billing integration types
 * - Notification and reminder configurations
 * - Multi-language and localization support
 */

/**
 * 🔄 Appointment Status Lifecycle
 * 
 * Defines the complete appointment lifecycle from booking to completion.
 * Each status represents a specific stage with defined business rules and transitions.
 * 
 * Status Flow Example:
 * PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
 * PENDING → CANCELLED (client or staff cancellation)
 * CONFIRMED → RESCHEDULED → CONFIRMED (date/time change)
 * CONFIRMED → NO_SHOW (client absence without notice)
 */
export enum AppointmentStatus {
  /**
   * 🕐 Appointment is booked but requires confirmation
   * - Client has requested the appointment
   * - Staff or system needs to confirm availability
   * - Payment may be pending
   * - Automatic reminders not yet active
   */
  PENDING = 'PENDING',

  /**
   * ✅ Appointment is confirmed and scheduled
   * - Both parties have confirmed the appointment
   * - Calendar slot is officially reserved
   * - Reminders and notifications are active
   * - Payment confirmed (if required)
   */
  CONFIRMED = 'CONFIRMED',

  /**
   * 🏃 Appointment is currently in progress
   * - Client has arrived and appointment has started
   * - Used for time tracking and billing purposes
   * - May trigger real-time status updates
   * - Prevents double-booking during service
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * 🏁 Appointment has been completed successfully
   * - Service has been delivered
   * - Payment processed (if applicable)
   * - Ready for follow-up actions
   * - Generates completion metrics
   */
  COMPLETED = 'COMPLETED',

  /**
   * ❌ Appointment has been cancelled
   * - Cancelled by client, staff, or system
   * - Calendar slot is freed for rebooking
   * - Cancellation fees may apply
   * - Cancellation reason should be recorded
   */
  CANCELLED = 'CANCELLED',

  /**
   * 👻 Client did not show up for appointment
   * - Client failed to arrive without notice
   * - Different billing rules from cancellation
   * - May affect client standing/future bookings
   * - Automatic status update after grace period
   */
  NO_SHOW = 'NO_SHOW',

  /**
   * 📅 Appointment has been rescheduled
   * - Date/time has been changed
   * - May be temporary status during rebooking
   * - Original slot is freed, new slot reserved
   * - Maintains appointment history and context
   */
  RESCHEDULED = 'RESCHEDULED'
}

/**
 * 🔁 Appointment Recurrence Patterns
 * 
 * Defines how appointments repeat over time for ongoing treatments,
 * regular check-ups, or therapy sessions.
 */
export enum AppointmentRecurrenceType {
  /**
   * 📅 No recurrence - single appointment
   */
  NONE = 'NONE',

  /**
   * 📆 Repeats daily
   * Example: Daily physiotherapy sessions
   */
  DAILY = 'DAILY',

  /**
   * 📅 Repeats weekly on the same day
   * Example: Weekly therapy sessions on Wednesdays
   */
  WEEKLY = 'WEEKLY',

  /**
   * 📅 Repeats every two weeks
   * Example: Bi-weekly dental check-ups
   */
  BI_WEEKLY = 'BI_WEEKLY',

  /**
   * 📅 Repeats monthly on the same date
   * Example: Monthly medical consultations
   */
  MONTHLY = 'MONTHLY',

  /**
   * 📅 Repeats quarterly
   * Example: Quarterly business reviews
   */
  QUARTERLY = 'QUARTERLY',

  /**
   * 📅 Repeats annually
   * Example: Annual health check-ups
   */
  YEARLY = 'YEARLY',

  /**
   * 🛠️ Custom recurrence pattern
   * Example: Every 3 days, or specific days of the week
   */
  CUSTOM = 'CUSTOM'
}

/**
 * 🔔 Reminder and Notification Types
 * 
 * Defines when and how clients should be reminded about appointments.
 */
export enum AppointmentReminderType {
  /**
   * 📧 Email reminder
   */
  EMAIL = 'EMAIL',

  /**
   * 📱 SMS text message
   */
  SMS = 'SMS',

  /**
   * 📞 Phone call reminder
   */
  PHONE = 'PHONE',

  /**
   * 🔔 Push notification (mobile app)
   */
  PUSH = 'PUSH',

  /**
   * 💬 WhatsApp message
   */
  WHATSAPP = 'WHATSAPP'
}

/**
 * ⏰ Reminder Timing Options
 * 
 * Defines when reminders should be sent before appointments.
 */
export enum AppointmentReminderTiming {
  /**
   * 🕐 1 hour before appointment
   */
  ONE_HOUR = 'ONE_HOUR',

  /**
   * 🕕 2 hours before appointment
   */
  TWO_HOURS = 'TWO_HOURS',

  /**
   * 🌅 Morning of appointment day
   */
  MORNING_OF = 'MORNING_OF',

  /**
   * 📅 1 day before appointment
   */
  ONE_DAY = 'ONE_DAY',

  /**
   * 📅 2 days before appointment
   */
  TWO_DAYS = 'TWO_DAYS',

  /**
   * 📅 1 week before appointment
   */
  ONE_WEEK = 'ONE_WEEK'
}

/**
 * 💰 Payment Status for Appointments
 * 
 * Tracks payment lifecycle for appointments with monetary value.
 */
export enum AppointmentPaymentStatus {
  /**
   * 💸 No payment required
   */
  NOT_REQUIRED = 'NOT_REQUIRED',

  /**
   * ⏳ Payment is pending
   */
  PENDING = 'PENDING',

  /**
   * 💳 Partial payment received
   */
  PARTIAL = 'PARTIAL',

  /**
   * ✅ Full payment received
   */
  PAID = 'PAID',

  /**
   * 🔄 Refund processed
   */
  REFUNDED = 'REFUNDED',

  /**
   * ⚠️ Payment failed or declined
   */
  FAILED = 'FAILED'
}

/**
 * 📊 Appointment Priority Levels
 * 
 * Helps staff prioritize appointments and manage urgent cases.
 */
export enum AppointmentPriority {
  /**
   * 🔴 Emergency appointment - immediate attention required
   */
  EMERGENCY = 'EMERGENCY',

  /**
   * 🟠 High priority - needs prompt attention
   */
  HIGH = 'HIGH',

  /**
   * 🟡 Normal priority - standard appointment
   */
  NORMAL = 'NORMAL',

  /**
   * 🟢 Low priority - flexible scheduling
   */
  LOW = 'LOW'
}

/**
 * 🏢 Appointment Booking Source
 * 
 * Tracks how appointments were created for analytics and optimization.
 */
export enum AppointmentSource {
  /**
   * 🌐 Online booking system
   */
  ONLINE = 'ONLINE',

  /**
   * 📞 Phone booking
   */
  PHONE = 'PHONE',

  /**
   * 🏢 In-person booking at location
   */
  IN_PERSON = 'IN_PERSON',

  /**
   * 📱 Mobile app booking
   */
  MOBILE_APP = 'MOBILE_APP',

  /**
   * 👩‍💼 Booked by staff member
   */
  STAFF = 'STAFF',

  /**
   * 🔄 Automatically rescheduled by system
   */
  AUTO_RESCHEDULE = 'AUTO_RESCHEDULE',

  /**
   * 🔁 Created from recurring appointment pattern
   */
  RECURRING = 'RECURRING'
}

/**
 * 📋 Appointment Types by Business Category
 * 
 * Categorizes appointments by the type of service or business need.
 */
export enum AppointmentType {
  /**
   * 🩺 Medical consultation or examination
   */
  CONSULTATION = 'CONSULTATION',

  /**
   * 🛠️ Treatment or therapy session
   */
  TREATMENT = 'TREATMENT',

  /**
   * 🔍 Follow-up appointment
   */
  FOLLOW_UP = 'FOLLOW_UP',

  /**
   * 🎯 Initial assessment or evaluation
   */
  ASSESSMENT = 'ASSESSMENT',

  /**
   * 📋 Routine check-up or maintenance
   */
  CHECKUP = 'CHECKUP',

  /**
   * 🆘 Emergency or urgent appointment
   */
  EMERGENCY = 'EMERGENCY',

  /**
   * 📞 Consultation via phone/video
   */
  TELECONSULTATION = 'TELECONSULTATION',

  /**
   * 📝 Administrative or paperwork appointment
   */
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}

/**
 * 📍 Appointment Location Types
 * 
 * Defines where the appointment takes place.
 */
export enum AppointmentLocationType {
  /**
   * 🏢 At business premises
   */
  ON_SITE = 'ON_SITE',

  /**
   * 🏠 At client's location
   */
  CLIENT_LOCATION = 'CLIENT_LOCATION',

  /**
   * 💻 Virtual/online appointment
   */
  VIRTUAL = 'VIRTUAL',

  /**
   * 🚗 Mobile service (traveling to client)
   */
  MOBILE = 'MOBILE'
}

/**
 * 🔒 Appointment Confirmation Requirements
 * 
 * Defines what confirmations are needed before appointment is final.
 */
export enum AppointmentConfirmationType {
  /**
   * ✅ No confirmation required
   */
  NONE = 'NONE',

  /**
   * 📧 Email confirmation required
   */
  EMAIL = 'EMAIL',

  /**
   * 📱 SMS confirmation required
   */
  SMS = 'SMS',

  /**
   * 👤 Staff manual confirmation required
   */
  MANUAL = 'MANUAL',

  /**
   * 💳 Payment confirmation required
   */
  PAYMENT = 'PAYMENT'
}

/**
 * 📊 Appointment Analytics Categories
 * 
 * Categories for grouping appointments in reports and analytics.
 */
export enum AppointmentAnalyticsCategory {
  /**
   * 👥 New client appointments
   */
  NEW_CLIENT = 'NEW_CLIENT',

  /**
   * 🔄 Returning client appointments
   */
  RETURNING_CLIENT = 'RETURNING_CLIENT',

  /**
   * 💰 Revenue-generating appointments
   */
  REVENUE = 'REVENUE',

  /**
   * 🆓 Complimentary or free appointments
   */
  COMPLIMENTARY = 'COMPLIMENTARY',

  /**
   * ⏱️ Long-duration appointments (over threshold)
   */
  EXTENDED = 'EXTENDED',

  /**
   * ⚡ Quick appointments (under threshold)
   */
  QUICK = 'QUICK'
}

/**
 * 🎯 Complex Type Definitions for Advanced Features
 */

/**
 * Appointment recurrence configuration
 */
export interface AppointmentRecurrenceConfig {
  type: AppointmentRecurrenceType;
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly: [1, 3, 5] = Mon, Wed, Fri
  dayOfMonth?: number; // For monthly: 15 = 15th of each month
  endDate?: Date; // When recurrence stops
  maxOccurrences?: number; // Maximum number of appointments to create
}

/**
 * Appointment reminder configuration
 */
export interface AppointmentReminderConfig {
  type: AppointmentReminderType;
  timing: AppointmentReminderTiming;
  enabled: boolean;
  customMessage?: string; // Custom reminder message
  language?: string; // Reminder language (for i18n)
}

/**
 * Appointment location details
 */
export interface AppointmentLocationInfo {
  type: AppointmentLocationType;
  address?: string;
  room?: string;
  virtualLink?: string; // For virtual appointments
  instructions?: string; // Special location instructions
}

/**
 * Appointment pricing and payment information
 */
export interface AppointmentPricing {
  basePrice: {
    amount: number;
    currency: string;
  };
  discounts?: Array<{
    type: string;
    amount: number;
    reason: string;
  }>;
  taxes?: Array<{
    type: string;
    rate: number;
    amount: number;
  }>;
  totalAmount: {
    amount: number;
    currency: string;
  };
  paymentStatus: AppointmentPaymentStatus;
}

/**
 * Appointment metadata for analytics and integrations
 */
export interface AppointmentMetadata {
  source: AppointmentSource;
  category?: AppointmentAnalyticsCategory;
  priority?: AppointmentPriority;
  type?: AppointmentType;
  tags?: string[];
  customFields?: Record<string, any>;
  integrationData?: Record<string, any>; // For third-party integrations
  analytics?: {
    trackingId?: string;
    campaignId?: string;
    referralSource?: string;
  };
}

/**
 * 🎨 Type Guards and Utility Types
 */

/**
 * Check if appointment status allows modifications
 */
export const isModifiableStatus = (status: AppointmentStatus): boolean => {
  return [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(status);
};

/**
 * Check if appointment status is final (completed or cancelled)
 */
export const isFinalStatus = (status: AppointmentStatus): boolean => {
  return [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ].includes(status);
};

/**
 * Get valid status transitions for an appointment
 */
export const getValidStatusTransitions = (currentStatus: AppointmentStatus): AppointmentStatus[] => {
  switch (currentStatus) {
    case AppointmentStatus.PENDING:
      return [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED];
    
    case AppointmentStatus.CONFIRMED:
      return [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.RESCHEDULED,
        AppointmentStatus.NO_SHOW
      ];
    
    case AppointmentStatus.IN_PROGRESS:
      return [AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW];
    
    case AppointmentStatus.RESCHEDULED:
      return [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED];
    
    default:
      return []; // Final statuses cannot be changed
  }
};

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus
): boolean => {
  const validTransitions = getValidStatusTransitions(currentStatus);
  return validTransitions.includes(newStatus);
};

/**
 * 📱 Frontend Integration Constants
 */

/**
 * Default reminder configurations for different appointment types
 */
export const DEFAULT_REMINDER_CONFIGS: Record<AppointmentType, AppointmentReminderConfig[]> = {
  [AppointmentType.CONSULTATION]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    },
    {
      type: AppointmentReminderType.SMS,
      timing: AppointmentReminderTiming.TWO_HOURS,
      enabled: true
    }
  ],
  [AppointmentType.TREATMENT]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    },
    {
      type: AppointmentReminderType.SMS,
      timing: AppointmentReminderTiming.ONE_HOUR,
      enabled: true
    }
  ],
  [AppointmentType.EMERGENCY]: [
    {
      type: AppointmentReminderType.SMS,
      timing: AppointmentReminderTiming.ONE_HOUR,
      enabled: true
    }
  ],
  [AppointmentType.FOLLOW_UP]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    }
  ],
  [AppointmentType.ASSESSMENT]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.TWO_DAYS,
      enabled: true
    },
    {
      type: AppointmentReminderType.SMS,
      timing: AppointmentReminderTiming.ONE_HOUR,
      enabled: true
    }
  ],
  [AppointmentType.CHECKUP]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    }
  ],
  [AppointmentType.TELECONSULTATION]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    },
    {
      type: AppointmentReminderType.PUSH,
      timing: AppointmentReminderTiming.ONE_HOUR,
      enabled: true
    }
  ],
  [AppointmentType.ADMINISTRATIVE]: [
    {
      type: AppointmentReminderType.EMAIL,
      timing: AppointmentReminderTiming.ONE_DAY,
      enabled: true
    }
  ]
};

/**
 * Status colors for UI components
 */
export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: '#FFA726', // Orange
  [AppointmentStatus.CONFIRMED]: '#66BB6A', // Green
  [AppointmentStatus.IN_PROGRESS]: '#42A5F5', // Blue
  [AppointmentStatus.COMPLETED]: '#4CAF50', // Dark Green
  [AppointmentStatus.CANCELLED]: '#EF5350', // Red
  [AppointmentStatus.NO_SHOW]: '#FF7043', // Deep Orange
  [AppointmentStatus.RESCHEDULED]: '#AB47BC' // Purple
};

/**
 * Priority colors for UI components
 */
export const APPOINTMENT_PRIORITY_COLORS: Record<AppointmentPriority, string> = {
  [AppointmentPriority.EMERGENCY]: '#F44336', // Red
  [AppointmentPriority.HIGH]: '#FF9800', // Orange
  [AppointmentPriority.NORMAL]: '#2196F3', // Blue
  [AppointmentPriority.LOW]: '#4CAF50' // Green
};
