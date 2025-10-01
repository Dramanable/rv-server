/**
 * 🎯 RV Project Frontend SDK - Types TypeScript
 *
 * Définitions de types complètes pour l'API RV Project
 */

// ==========================================
// 🔄 Types Génériques API
// ==========================================

export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly timestamp?: string;
  readonly correlationId?: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: string;
    readonly field?: string;
    readonly timestamp: string;
    readonly path: string;
    readonly correlationId: string;
  };
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

// ==========================================
// 👤 Types Utilisateur
// ==========================================

export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  STAFF_MEMBER = 'STAFF_MEMBER',
  CLIENT = 'CLIENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly isVerified: boolean;
  readonly avatar?: string;
  readonly phone?: string;
  readonly dateOfBirth?: string;
  readonly preferences?: UserPreferences;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserPreferences {
  readonly language: string;
  readonly timezone: string;
  readonly notifications: {
    readonly email: boolean;
    readonly sms: boolean;
    readonly push: boolean;
  };
  readonly theme?: 'light' | 'dark' | 'auto';
}

// Requêtes utilisateur
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly username: string;
  readonly phone?: string;
  readonly role?: UserRole;
}

export interface UpdateUserRequest {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly preferences?: Partial<UserPreferences>;
}

// ⚠️ Note: API uses HttpOnly cookies, not JWT tokens
// These types are kept for backward compatibility but deprecated
export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: string;
}

export interface AuthResponse {
  readonly user: User;
  // Note: API uses cookies, tokens are not returned in response
}

// ==========================================
// 🏢 Types Business & Secteurs
// ==========================================

export interface BusinessSector {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Address {
  readonly street: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
  readonly region?: string;
  readonly coordinates?: {
    readonly latitude: number;
    readonly longitude: number;
  };
}

export interface ContactInfo {
  readonly email?: string;
  readonly phone?: string;
  readonly website?: string;
  readonly socialMedia?: {
    readonly facebook?: string;
    readonly instagram?: string;
    readonly twitter?: string;
    readonly linkedin?: string;
  };
}

export interface BusinessHours {
  readonly monday?: TimeSlot[];
  readonly tuesday?: TimeSlot[];
  readonly wednesday?: TimeSlot[];
  readonly thursday?: TimeSlot[];
  readonly friday?: TimeSlot[];
  readonly saturday?: TimeSlot[];
  readonly sunday?: TimeSlot[];
}

export interface TimeSlot {
  readonly start: string; // Format HH:mm
  readonly end: string;   // Format HH:mm
}

export interface Business {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly businessSectorId: string;
  readonly businessSector?: BusinessSector;
  readonly address: Address;
  readonly contactInfo: ContactInfo;
  readonly businessHours?: BusinessHours;
  readonly images?: readonly string[];
  readonly logo?: string;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly ownerId: string;
  readonly owner?: User;
  readonly rating?: number;
  readonly reviewCount?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Requêtes Business
export interface CreateBusinessRequest {
  readonly name: string;
  readonly description?: string;
  readonly businessSectorId: string;
  readonly address: Address;
  readonly contactInfo: ContactInfo;
  readonly businessHours?: BusinessHours;
  readonly logo?: string;
}

export interface UpdateBusinessRequest {
  readonly name?: string;
  readonly description?: string;
  readonly businessSectorId?: string;
  readonly address?: Partial<Address>;
  readonly contactInfo?: Partial<ContactInfo>;
  readonly businessHours?: Partial<BusinessHours>;
  readonly logo?: string;
  readonly isActive?: boolean;
}

export interface SearchBusinessRequest {
  readonly search?: string;
  readonly businessSectorId?: string;
  readonly city?: string;
  readonly isActive?: boolean;
  readonly isVerified?: boolean;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// ==========================================
// 💼 Types Services
// ==========================================

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export enum PricingType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
  PACKAGE = 'PACKAGE',
  FREE = 'FREE'
}

export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export interface PricingOption {
  readonly label: string;
  readonly priceModifier: number; // Montant à ajouter/soustraire
  readonly description?: string;
}

export interface PricingFactor {
  readonly name: string;
  readonly required: boolean;
  readonly options: readonly PricingOption[];
}

export interface VariablePricing {
  readonly factors: readonly PricingFactor[];
  readonly calculationMethod: 'ADDITIVE' | 'MULTIPLICATIVE';
}

export interface PackagePricing {
  readonly sessions: number;
  readonly discountPercent: number;
  readonly validityDays?: number;
}

export interface PricingConfig {
  readonly type: PricingType;
  readonly visibility: 'PUBLIC' | 'PRIVATE' | 'QUOTE_ONLY';
  readonly basePrice: Money;
  readonly variablePricing?: VariablePricing;
  readonly packagePricing?: PackagePricing;
  readonly rules?: readonly string[];
}

export interface ServiceSettings {
  readonly isOnlineBookingEnabled: boolean;
  readonly requiresApproval: boolean;
  readonly maxAdvanceBookingDays?: number;
  readonly minAdvanceBookingHours?: number;
  readonly cancellationPolicy?: {
    readonly allowCancellation: boolean;
    readonly minHoursBeforeCancellation?: number;
    readonly refundPolicy?: string;
  };
  readonly reminderSettings?: {
    readonly sendReminders: boolean;
    readonly reminderHours?: readonly number[];
  };
}

export interface Service {
  readonly id: string;
  readonly businessId: string;
  readonly business?: Business;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly duration: number; // en minutes
  readonly pricingConfig: PricingConfig;
  readonly settings: ServiceSettings;
  readonly status: ServiceStatus;
  readonly images?: readonly string[];
  readonly tags?: readonly string[];
  readonly requirements?: readonly string[];
  readonly staffMembers?: readonly string[]; // IDs des staff members
  readonly createdAt: string;
  readonly updatedAt: string;
}

// Requêtes Services
export interface CreateServiceRequest {
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly duration: number;
  readonly pricingConfig: PricingConfig;
  readonly settings: ServiceSettings;
  readonly images?: readonly string[];
  readonly tags?: readonly string[];
  readonly requirements?: readonly string[];
  readonly staffMembers?: readonly string[];
}

export interface UpdateServiceRequest {
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly duration?: number;
  readonly pricingConfig?: Partial<PricingConfig>;
  readonly settings?: Partial<ServiceSettings>;
  readonly status?: ServiceStatus;
  readonly images?: readonly string[];
  readonly tags?: readonly string[];
  readonly requirements?: readonly string[];
  readonly staffMembers?: readonly string[];
}

export interface SearchServicesRequest {
  readonly businessId?: string;
  readonly search?: string;
  readonly category?: string;
  readonly status?: ServiceStatus;
  readonly pricingType?: PricingType;
  readonly isOnlineBookingEnabled?: boolean;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// ==========================================
// 📅 Types Rendez-vous
// ==========================================

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export interface ClientInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly notes?: string;
}

export interface AppointmentPricing {
  readonly basePrice: Money;
  readonly selectedOptions?: Record<string, string>;
  readonly totalPrice: Money;
  readonly breakdown?: {
    readonly item: string;
    readonly price: Money;
  }[];
}

export interface Appointment {
  readonly id: string;
  readonly businessId: string;
  readonly business?: Business;
  readonly serviceId: string;
  readonly service?: Service;
  readonly clientInfo: ClientInfo;
  readonly staffMemberId?: string;
  readonly scheduledAt: string; // ISO datetime
  readonly duration: number; // en minutes
  readonly status: AppointmentStatus;
  readonly pricing: AppointmentPricing;
  readonly clientNotes?: string;
  readonly internalNotes?: string;
  readonly cancellationReason?: string;
  readonly remindersSent?: readonly string[]; // timestamps des rappels envoyés
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AvailableSlot {
  readonly start: string; // ISO datetime
  readonly end: string;   // ISO datetime
  readonly staffMemberId?: string;
  readonly isPreferred?: boolean;
}

// Requêtes Rendez-vous
export interface BookAppointmentRequest {
  readonly businessId: string;
  readonly serviceId: string;
  readonly clientInfo: ClientInfo;
  readonly scheduledAt: string; // ISO datetime
  readonly staffMemberId?: string;
  readonly selectedOptions?: Record<string, string>;
  readonly notes?: string;
}

export interface UpdateAppointmentRequest {
  readonly scheduledAt?: string;
  readonly status?: AppointmentStatus;
  readonly clientInfo?: Partial<ClientInfo>;
  readonly staffMemberId?: string;
  readonly clientNotes?: string;
  readonly internalNotes?: string;
}

export interface GetAvailableSlotsRequest {
  readonly businessId: string;
  readonly serviceId: string;
  readonly date: string; // YYYY-MM-DD
  readonly staffMemberId?: string;
  readonly timeRange?: {
    readonly start: string; // HH:mm
    readonly end: string;   // HH:mm
  };
}

export interface SearchAppointmentsRequest {
  readonly businessId?: string;
  readonly serviceId?: string;
  readonly status?: AppointmentStatus;
  readonly clientEmail?: string;
  readonly dateFrom?: string; // YYYY-MM-DD
  readonly dateTo?: string;   // YYYY-MM-DD
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

// ==========================================
// 🚨 Types d'Erreurs
// ==========================================

export class RVProjectSDKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'RVProjectSDKError';
  }
}

export class ValidationError extends RVProjectSDKError {
  constructor(
    message: string,
    public readonly field?: string,
    details?: any
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends RVProjectSDKError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends RVProjectSDKError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends RVProjectSDKError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends RVProjectSDKError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT_ERROR', 409, details);
    this.name = 'ConflictError';
  }
}

export class NetworkError extends RVProjectSDKError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends RVProjectSDKError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 408);
    this.name = 'TimeoutError';
  }
}

// ==========================================
// 🔧 Types Configuration SDK
// ==========================================

export interface RVProjectClientConfig {
  readonly baseURL: string;
  readonly timeout?: number;
  readonly debug?: boolean;
  readonly onAuthenticationError?: () => void;
}

export interface SDKAuthState {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: User;
  readonly expiresAt: number;
}

// ==========================================
// 🎯 Types Utilitaires
// ==========================================

export interface FileUpload {
  readonly file: File | Blob;
  readonly fieldName: string;
  readonly fileName?: string;
}

export interface PasswordStrength {
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly feedback: readonly string[];
  readonly isValid: boolean;
}

export interface CacheItem<T> {
  readonly data: T;
  readonly timestamp: number;
  readonly ttl: number;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// ==========================================
// 📊 Types Statistiques & Analytics
// ==========================================

export interface BusinessStats {
  readonly totalAppointments: number;
  readonly totalRevenue: Money;
  readonly averageRating: number;
  readonly totalServices: number;
  readonly activeClients: number;
  readonly period: {
    readonly start: string;
    readonly end: string;
  };
}

export interface ServiceStats {
  readonly totalBookings: number;
  readonly revenue: Money;
  readonly averageRating: number;
  readonly popularTimeSlots: readonly string[];
  readonly clientRetentionRate: number;
}

// ==========================================
// 🔔 Types Notifications
// ==========================================

export enum NotificationType {
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  BUSINESS_VERIFIED = 'BUSINESS_VERIFIED',
  SERVICE_UPDATED = 'SERVICE_UPDATED'
}

export interface Notification {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, any>;
  readonly isRead: boolean;
  readonly createdAt: string;
}

// ==========================================
// 🌐 Types i18n
// ==========================================

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'it';

export interface LocalizedString {
  readonly fr?: string;
  readonly en?: string;
  readonly es?: string;
  readonly de?: string;
  readonly it?: string;
}

// ==========================================
// ==========================================
// �️ Configuration SDK
// ==========================================

/**
 * Configuration principale du SDK RV Project
 */
export interface RVProjectConfig {
  readonly baseURL: string;
  readonly timeout?: number;
  readonly retries?: number;
  readonly debug?: boolean;
  readonly apiKey?: string;
}

// �📝 Export des types principaux
// ==========================================

