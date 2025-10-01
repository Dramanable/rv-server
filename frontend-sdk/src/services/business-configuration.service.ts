/**
 * 🏢 Business Configuration Service - Configuration des Entreprises
 *
 * Service pour la gestion des configurations d'entreprise
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum Currency {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  CAD = 'CAD',
  CHF = 'CHF',
  JPY = 'JPY',
  AUD = 'AUD'
}

export enum Timezone {
  EUROPE_PARIS = 'Europe/Paris',
  EUROPE_LONDON = 'Europe/London',
  AMERICA_NEW_YORK = 'America/New_York',
  AMERICA_LOS_ANGELES = 'America/Los_Angeles',
  AMERICA_CHICAGO = 'America/Chicago',
  AMERICA_TORONTO = 'America/Toronto',
  ASIA_TOKYO = 'Asia/Tokyo',
  AUSTRALIA_SYDNEY = 'Australia/Sydney'
}

export enum Locale {
  FR_FR = 'fr-FR',
  EN_US = 'en-US',
  EN_GB = 'en-GB',
  DE_DE = 'de-DE',
  ES_ES = 'es-ES',
  IT_IT = 'it-IT',
  PT_PT = 'pt-PT',
  JA_JP = 'ja-JP'
}

export enum DateFormat {
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD_YYYY = 'MM/DD/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
  DD_MMM_YYYY = 'DD MMM YYYY',
  MMM_DD_YYYY = 'MMM DD, YYYY'
}

export enum TimeFormat {
  TWENTY_FOUR_HOUR = '24h',
  TWELVE_HOUR = '12h'
}

export enum WeekStart {
  MONDAY = 'MONDAY',
  SUNDAY = 'SUNDAY',
  SATURDAY = 'SATURDAY'
}

export enum BusinessType {
  CLINIC = 'CLINIC',
  HOSPITAL = 'HOSPITAL',
  BEAUTY_SALON = 'BEAUTY_SALON',
  SPA = 'SPA',
  FITNESS_CENTER = 'FITNESS_CENTER',
  DENTAL_CLINIC = 'DENTAL_CLINIC',
  VETERINARY = 'VETERINARY',
  CONSULTING = 'CONSULTING',
  THERAPY = 'THERAPY',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER'
}

// Interfaces
export interface BusinessConfiguration {
  readonly id: string;
  readonly businessId: string;
  readonly timezone: Timezone;
  readonly currency: Currency;
  readonly locale: Locale;
  readonly dateFormat: DateFormat;
  readonly timeFormat: TimeFormat;
  readonly weekStart: WeekStart;
  readonly businessType: BusinessType;
  readonly workingHours: WorkingHours;
  readonly bookingSettings: BookingSettings;
  readonly notificationSettings: NotificationSettings;
  readonly paymentSettings: PaymentSettings;
  readonly brandingSettings: BrandingSettings;
  readonly integrationSettings: IntegrationSettings;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export interface WorkingHours {
  readonly monday: DaySchedule;
  readonly tuesday: DaySchedule;
  readonly wednesday: DaySchedule;
  readonly thursday: DaySchedule;
  readonly friday: DaySchedule;
  readonly saturday: DaySchedule;
  readonly sunday: DaySchedule;
  readonly holidays: readonly Holiday[];
}

export interface DaySchedule {
  readonly isWorkingDay: boolean;
  readonly shifts: readonly TimeShift[];
}

export interface TimeShift {
  readonly startTime: string; // Format HH:mm
  readonly endTime: string;   // Format HH:mm
  readonly breakStart?: string;
  readonly breakEnd?: string;
}

export interface Holiday {
  readonly name: string;
  readonly date: string; // Format YYYY-MM-DD
  readonly isRecurring: boolean;
  readonly description?: string;
}

export interface BookingSettings {
  readonly allowOnlineBooking: boolean;
  readonly requireConfirmation: boolean;
  readonly advanceBookingDays: number;
  readonly cancellationDeadlineHours: number;
  readonly allowSameDayBooking: boolean;
  readonly maxBookingsPerDay: number;
  readonly slotDurationMinutes: number;
  readonly bufferTimeMinutes: number;
  readonly allowWaitingList: boolean;
  readonly autoConfirmBookings: boolean;
}

export interface NotificationSettings {
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly reminderSettings: ReminderSettings;
  readonly confirmationSettings: ConfirmationSettings;
}

export interface ReminderSettings {
  readonly enabled: boolean;
  readonly timeBefore24h: boolean;
  readonly timeBefore2h: boolean;
  readonly timeBefore30min: boolean;
  readonly customTimes: readonly number[]; // Minutes before appointment
  readonly channels: readonly ('email' | 'sms' | 'push')[];
}

export interface ConfirmationSettings {
  readonly sendConfirmation: boolean;
  readonly requireConfirmation: boolean;
  readonly confirmationDeadlineHours: number;
  readonly channels: readonly ('email' | 'sms' | 'push')[];
}

export interface PaymentSettings {
  readonly acceptOnlinePayments: boolean;
  readonly requirePrepayment: boolean;
  readonly depositPercentage: number;
  readonly refundPolicy: RefundPolicy;
  readonly acceptedMethods: readonly PaymentMethod[];
  readonly currency: Currency;
}

export interface RefundPolicy {
  readonly allowRefunds: boolean;
  readonly refundDeadlineHours: number;
  readonly refundPercentage: number;
  readonly refundFee: number;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export interface BrandingSettings {
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly accentColor: string;
  readonly logoUrl?: string;
  readonly faviconUrl?: string;
  readonly customCss?: string;
  readonly fontFamily?: string;
  readonly brandName?: string;
  readonly tagline?: string;
}

export interface IntegrationSettings {
  readonly googleCalendar: GoogleCalendarIntegration;
  readonly outlookCalendar: OutlookCalendarIntegration;
  readonly zoom: ZoomIntegration;
  readonly stripe: StripeIntegration;
  readonly mailchimp: MailchimpIntegration;
}

export interface GoogleCalendarIntegration {
  readonly enabled: boolean;
  readonly syncTwoWay: boolean;
  readonly calendarId?: string;
  readonly refreshToken?: string;
}

export interface OutlookCalendarIntegration {
  readonly enabled: boolean;
  readonly syncTwoWay: boolean;
  readonly calendarId?: string;
  readonly refreshToken?: string;
}

export interface ZoomIntegration {
  readonly enabled: boolean;
  readonly autoCreateMeetings: boolean;
  readonly apiKey?: string;
  readonly webhookUrl?: string;
}

export interface StripeIntegration {
  readonly enabled: boolean;
  readonly publishableKey?: string;
  readonly webhookSecret?: string;
  readonly accountId?: string;
}

export interface MailchimpIntegration {
  readonly enabled: boolean;
  readonly autoSubscribe: boolean;
  readonly listId?: string;
  readonly apiKey?: string;
}

export interface UpdateBusinessConfigurationDto {
  readonly timezone?: Timezone;
  readonly currency?: Currency;
  readonly locale?: Locale;
  readonly dateFormat?: DateFormat;
  readonly timeFormat?: TimeFormat;
  readonly weekStart?: WeekStart;
  readonly businessType?: BusinessType;
  readonly workingHours?: Partial<WorkingHours>;
  readonly bookingSettings?: Partial<BookingSettings>;
  readonly notificationSettings?: Partial<NotificationSettings>;
  readonly paymentSettings?: Partial<PaymentSettings>;
  readonly brandingSettings?: Partial<BrandingSettings>;
  readonly integrationSettings?: Partial<IntegrationSettings>;
}

export interface BusinessConfigurationResponse {
  readonly success: boolean;
  readonly data: BusinessConfiguration;
  readonly message: string;
}

/**
 * 🏢 Service principal pour la configuration business
 */
export default class BusinessConfigurationService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Obtenir la configuration d'une entreprise
   */
  async getConfiguration(businessId: string): Promise<BusinessConfiguration> {
    const response = await this.client.get(`/api/v1/businesses/${businessId}/configuration`);
    return response.data.data;
  }

  /**
   * ✏️ Mettre à jour la configuration d'une entreprise
   */
  async updateConfiguration(
    businessId: string,
    data: UpdateBusinessConfigurationDto
  ): Promise<BusinessConfigurationResponse> {
    const response = await this.client.patch(`/api/v1/businesses/${businessId}/configuration`, data);
    return response.data;
  }

  /**
   * 🔄 Réinitialiser la configuration aux valeurs par défaut
   */
  async resetToDefaults(businessId: string): Promise<BusinessConfigurationResponse> {
    const response = await this.client.post(`/api/v1/businesses/${businessId}/configuration/reset`);
    return response.data;
  }

  /**
   * 📤 Exporter la configuration
   */
  async exportConfiguration(businessId: string): Promise<Blob> {
    const response = await this.client.get(
      `/api/v1/businesses/${businessId}/configuration/export`
    );
    return response.data;
  }

  /**
   * 📥 Importer une configuration
   */
  async importConfiguration(businessId: string, configFile: File): Promise<BusinessConfigurationResponse> {
    const formData = new FormData();
    formData.append('configuration', configFile);

    const response = await this.client.post(
      `/api/v1/businesses/${businessId}/configuration/import`,
      formData
    );

    return response.data;
  }

  /**
   * ⏰ Mettre à jour les heures de travail
   */
  async updateWorkingHours(businessId: string, workingHours: WorkingHours): Promise<BusinessConfigurationResponse> {
    return this.updateConfiguration(businessId, { workingHours });
  }

  /**
   * 📅 Mettre à jour les paramètres de réservation
   */
  async updateBookingSettings(businessId: string, bookingSettings: BookingSettings): Promise<BusinessConfigurationResponse> {
    return this.updateConfiguration(businessId, { bookingSettings });
  }

  /**
   * 🔔 Mettre à jour les paramètres de notification
   */
  async updateNotificationSettings(businessId: string, notificationSettings: NotificationSettings): Promise<BusinessConfigurationResponse> {
    return this.updateConfiguration(businessId, { notificationSettings });
  }

  /**
   * 💳 Mettre à jour les paramètres de paiement
   */
  async updatePaymentSettings(businessId: string, paymentSettings: PaymentSettings): Promise<BusinessConfigurationResponse> {
    return this.updateConfiguration(businessId, { paymentSettings });
  }

  /**
   * 🎨 Mettre à jour les paramètres de branding
   */
  async updateBrandingSettings(businessId: string, brandingSettings: BrandingSettings): Promise<BusinessConfigurationResponse> {
    return this.updateConfiguration(businessId, { brandingSettings });
  }

  /**
   * 🔗 Activer/désactiver une intégration
   */
  async toggleIntegration(
    businessId: string,
    integration: keyof IntegrationSettings,
    enabled: boolean
  ): Promise<BusinessConfigurationResponse> {
    const integrationSettings = {
      [integration]: { enabled }
    };

    return this.updateConfiguration(businessId, { integrationSettings });
  }

  /**
   * ✅ Tester la configuration
   */
  async testConfiguration(businessId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.client.post(`/api/v1/businesses/${businessId}/configuration/test`);
    return response.data.data;
  }

  /**
   * 📊 Obtenir les métriques de configuration
   */
  async getConfigurationMetrics(businessId: string): Promise<{
    completionPercentage: number;
    missingFields: string[];
    recommendedSettings: string[];
  }> {
    const response = await this.client.get(`/api/v1/businesses/${businessId}/configuration/metrics`);
    return response.data.data;
  }

  /**
   * 🌍 Obtenir les fuseaux horaires disponibles
   */
  static getTimezones(): Timezone[] {
    return Object.values(Timezone);
  }

  /**
   * 💰 Obtenir les devises disponibles
   */
  static getCurrencies(): Currency[] {
    return Object.values(Currency);
  }

  /**
   * 🌐 Obtenir les locales disponibles
   */
  static getLocales(): Locale[] {
    return Object.values(Locale);
  }

  /**
   * 📅 Obtenir les formats de date disponibles
   */
  static getDateFormats(): DateFormat[] {
    return Object.values(DateFormat);
  }

  /**
   * ⏰ Obtenir les formats d'heure disponibles
   */
  static getTimeFormats(): TimeFormat[] {
    return Object.values(TimeFormat);
  }

  /**
   * 📊 Obtenir les types d'entreprise disponibles
   */
  static getBusinessTypes(): BusinessType[] {
    return Object.values(BusinessType);
  }

  /**
   * 💳 Obtenir les méthodes de paiement disponibles
   */
  static getPaymentMethods(): PaymentMethod[] {
    return Object.values(PaymentMethod);
  }

  /**
   * 🔧 Générer une configuration par défaut
   */
  static generateDefaultConfiguration(businessId: string): Omit<BusinessConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'> {
    return {
      businessId,
      timezone: Timezone.EUROPE_PARIS,
      currency: Currency.EUR,
      locale: Locale.FR_FR,
      dateFormat: DateFormat.DD_MM_YYYY,
      timeFormat: TimeFormat.TWENTY_FOUR_HOUR,
      weekStart: WeekStart.MONDAY,
      businessType: BusinessType.CLINIC,
      workingHours: {
        monday: { isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '17:00' }] },
        tuesday: { isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '17:00' }] },
        wednesday: { isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '17:00' }] },
        thursday: { isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '17:00' }] },
        friday: { isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '17:00' }] },
        saturday: { isWorkingDay: false, shifts: [] },
        sunday: { isWorkingDay: false, shifts: [] },
        holidays: []
      },
      bookingSettings: {
        allowOnlineBooking: true,
        requireConfirmation: false,
        advanceBookingDays: 30,
        cancellationDeadlineHours: 24,
        allowSameDayBooking: true,
        maxBookingsPerDay: 20,
        slotDurationMinutes: 30,
        bufferTimeMinutes: 5,
        allowWaitingList: true,
        autoConfirmBookings: true
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        reminderSettings: {
          enabled: true,
          timeBefore24h: true,
          timeBefore2h: false,
          timeBefore30min: false,
          customTimes: [],
          channels: ['email']
        },
        confirmationSettings: {
          sendConfirmation: true,
          requireConfirmation: false,
          confirmationDeadlineHours: 2,
          channels: ['email']
        }
      },
      paymentSettings: {
        acceptOnlinePayments: false,
        requirePrepayment: false,
        depositPercentage: 0,
        refundPolicy: {
          allowRefunds: true,
          refundDeadlineHours: 24,
          refundPercentage: 100,
          refundFee: 0
        },
        acceptedMethods: [PaymentMethod.CASH],
        currency: Currency.EUR
      },
      brandingSettings: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1F2937',
        accentColor: '#10B981'
      },
      integrationSettings: {
        googleCalendar: { enabled: false, syncTwoWay: false },
        outlookCalendar: { enabled: false, syncTwoWay: false },
        zoom: { enabled: false, autoCreateMeetings: false },
        stripe: { enabled: false },
        mailchimp: { enabled: false, autoSubscribe: false }
      }
    };
  }

  /**
   * ✅ Valider une configuration
   */
  static validateConfiguration(config: Partial<BusinessConfiguration>): string[] {
    const errors: string[] = [];

    if (config.timezone && !Object.values(Timezone).includes(config.timezone)) {
      errors.push('Fuseau horaire invalide');
    }

    if (config.currency && !Object.values(Currency).includes(config.currency)) {
      errors.push('Devise invalide');
    }

    if (config.locale && !Object.values(Locale).includes(config.locale)) {
      errors.push('Locale invalide');
    }

    if (config.bookingSettings) {
      const booking = config.bookingSettings;

      if (booking.advanceBookingDays !== undefined && (booking.advanceBookingDays < 1 || booking.advanceBookingDays > 365)) {
        errors.push('Les jours de réservation à l\'avance doivent être entre 1 et 365');
      }

      if (booking.slotDurationMinutes !== undefined && (booking.slotDurationMinutes < 15 || booking.slotDurationMinutes > 480)) {
        errors.push('La durée des créneaux doit être entre 15 et 480 minutes');
      }

      if (booking.maxBookingsPerDay !== undefined && (booking.maxBookingsPerDay < 1 || booking.maxBookingsPerDay > 100)) {
        errors.push('Le nombre maximum de réservations par jour doit être entre 1 et 100');
      }
    }

    if (config.paymentSettings?.depositPercentage !== undefined) {
      const deposit = config.paymentSettings.depositPercentage;
      if (deposit < 0 || deposit > 100) {
        errors.push('Le pourcentage de dépôt doit être entre 0 et 100');
      }
    }

    if (config.brandingSettings?.primaryColor) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(config.brandingSettings.primaryColor)) {
        errors.push('Couleur primaire invalide (format hexadécimal attendu)');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires de configuration
   */
  static readonly utils = {
    /**
     * Formater une date selon le format configuré
     */
    formatDate: (date: Date, format: DateFormat): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      switch (format) {
        case DateFormat.DD_MM_YYYY: return `${day}/${month}/${year}`;
        case DateFormat.MM_DD_YYYY: return `${month}/${day}/${year}`;
        case DateFormat.YYYY_MM_DD: return `${year}-${month}-${day}`;
        case DateFormat.DD_MMM_YYYY: return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        case DateFormat.MMM_DD_YYYY: return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        default: return date.toLocaleDateString();
      }
    },

    /**
     * Formater une heure selon le format configuré
     */
    formatTime: (date: Date, format: TimeFormat): string => {
      if (format === TimeFormat.TWELVE_HOUR) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Obtenir le symbole d'une devise
     */
    getCurrencySymbol: (currency: Currency): string => {
      const symbols: Record<Currency, string> = {
        [Currency.EUR]: '€',
        [Currency.USD]: '$',
        [Currency.GBP]: '£',
        [Currency.CAD]: 'C$',
        [Currency.CHF]: 'CHF',
        [Currency.JPY]: '¥',
        [Currency.AUD]: 'A$'
      };
      return symbols[currency] || currency;
    },

    /**
     * Obtenir le nom d'un fuseau horaire
     */
    getTimezoneName: (timezone: Timezone): string => {
      const names: Record<Timezone, string> = {
        [Timezone.EUROPE_PARIS]: 'Europe/Paris (CET)',
        [Timezone.EUROPE_LONDON]: 'Europe/London (GMT)',
        [Timezone.AMERICA_NEW_YORK]: 'America/New_York (EST)',
        [Timezone.AMERICA_LOS_ANGELES]: 'America/Los_Angeles (PST)',
        [Timezone.AMERICA_CHICAGO]: 'America/Chicago (CST)',
        [Timezone.AMERICA_TORONTO]: 'America/Toronto (EST)',
        [Timezone.ASIA_TOKYO]: 'Asia/Tokyo (JST)',
        [Timezone.AUSTRALIA_SYDNEY]: 'Australia/Sydney (AEST)'
      };
      return names[timezone] || timezone;
    },

    /**
     * Calculer le pourcentage de complétion de la configuration
     */
    calculateCompletionPercentage: (config: BusinessConfiguration): number => {
      const requiredFields = [
        'timezone', 'currency', 'locale', 'businessType',
        'workingHours', 'bookingSettings', 'notificationSettings'
      ];

      const completedFields = requiredFields.filter(field => {
        const value = (config as any)[field];
        return value !== undefined && value !== null;
      });

      return Math.round((completedFields.length / requiredFields.length) * 100);
    }
  };
}
