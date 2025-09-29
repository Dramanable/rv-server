# 🎯 TypeScript Integration Types

This file contains TypeScript interfaces and types that match the API responses. Copy these into your frontend project for full type safety.

## 📋 Core Types

```typescript
// Base types
export type UUID = string;
export type ISODateTime = string;
export type Currency = 'EUR' | 'USD' | 'GBP';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: ISODateTime;
    version: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    timestamp: ISODateTime;
    path: string;
    requestId?: string;
  };
}
```

## 🔐 Authentication Types

```typescript
export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_ADMIN'
  | 'LOCATION_MANAGER'
  | 'PRACTITIONER'
  | 'RECEPTIONIST'
  | 'CLIENT';

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: ISODateTime;
  passwordChangeRequired: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessExpiresAt: ISODateTime;
  refreshExpiresAt: ISODateTime;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  businessInviteCode?: string;
}

export interface RegisterResponse {
  user: User;
  emailVerificationRequired: boolean;
}

export interface LogoutRequest {
  logoutAllDevices?: boolean;
}

export interface RefreshTokenRequest {
  // No body needed - uses cookies
}

export interface RefreshTokenResponse {
  accessExpiresAt: ISODateTime;
  refreshExpiresAt: ISODateTime;
}
```

## 🏢 Business Types

```typescript
export interface BusinessSettings {
  timezone: string;
  currency: Currency;
  locale: string;
  allowOnlineBooking: boolean;
  requireClientApproval: boolean;
  enableNotifications: boolean;
  businessHours: BusinessHours;
  bookingRules?: BookingRules;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:mm format
  closeTime?: string; // HH:mm format
  breaks?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  type?: 'LUNCH' | 'BREAK' | 'APPOINTMENT';
}

export interface BookingRules {
  advanceBookingDays: number;
  cancellationPolicy: {
    allowCancellation: boolean;
    minHoursBeforeAppointment: number;
    cancellationFee?: Money;
  };
  reschedulePolicy: {
    allowReschedule: boolean;
    minHoursBeforeAppointment: number;
    maxRescheduleCount: number;
  };
}

export interface Business {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  businessSectorId: UUID;
  description?: string;
  website?: string;
  address: Address;
  settings: BusinessSettings;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  // Relations
  businessSector?: BusinessSector;
  services?: Service[];
  staff?: Staff[];
}

export interface BusinessSector {
  id: UUID;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: ISODateTime;
}

export interface CreateBusinessRequest {
  name: string;
  email: string;
  phone: string;
  businessSectorId: UUID;
  description?: string;
  website?: string;
  address: Address;
  settings?: Partial<BusinessSettings>;
}

export interface UpdateBusinessRequest {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  website?: string;
  address?: Partial<Address>;
  settings?: Partial<BusinessSettings>;
}

export interface BusinessListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    businessSectorId?: UUID;
    isActive?: boolean;
    allowOnlineBooking?: boolean;
    city?: string;
    country?: string;
  };
}

export interface BusinessListResponse {
  businesses: Business[];
  pagination: PaginationMeta;
}
```

## 💼 Service Types

```typescript
export type ServiceCategory =
  | 'MEDICAL'
  | 'DENTAL'
  | 'WELLNESS'
  | 'BEAUTY'
  | 'FITNESS'
  | 'THERAPY'
  | 'CONSULTATION'
  | 'OTHER';

export type PricingType =
  | 'FREE'
  | 'FIXED'
  | 'VARIABLE'
  | 'HIDDEN'
  | 'ON_DEMAND';

export type PricingVisibility =
  | 'PUBLIC'
  | 'AUTHENTICATED'
  | 'PRIVATE'
  | 'HIDDEN';

export interface PricingConfig {
  type: PricingType;
  visibility: PricingVisibility;
  basePrice: Money;
  variablePricing?: VariablePricing;
  description?: string;
}

export interface VariablePricing {
  factors: PricingFactor[];
}

export interface PricingFactor {
  name: string;
  type: 'DURATION' | 'SERVICE_VARIANT' | 'ADD_ON' | 'CUSTOM';
  options: PricingOption[];
}

export interface PricingOption {
  label: string;
  value?: number;
  priceModifier: number;
  description?: string;
}

export interface ServicePackage {
  id?: UUID;
  name: string;
  description: string;
  type: 'SESSION_BASED' | 'TIME_BASED' | 'UNLIMITED';
  sessionsIncluded?: number;
  validityDays: number;
  packagePrice: Money;
  savings: {
    amount: number;
    percentage: number;
  };
  restrictions?: {
    maxSessionsPerDay?: number;
    maxSessionsPerWeek?: number;
    advanceBookingRequired?: boolean;
    specificServices?: UUID[];
  };
}

export interface Service {
  id: UUID;
  businessId: UUID;
  name: string;
  description: string;
  duration: number; // in minutes
  category: ServiceCategory;
  pricingConfig: PricingConfig;
  packages?: ServicePackage[];
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  prerequisites?: string[];
  tags?: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  // Relations
  business?: Business;
  staff?: Staff[];
}

export interface CreateServiceRequest {
  businessId: UUID;
  name: string;
  description: string;
  duration: number;
  category: ServiceCategory;
  pricingConfig: PricingConfig;
  packages?: Omit<ServicePackage, 'id'>[];
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
  prerequisites?: string[];
  tags?: string[];
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  duration?: number;
  category?: ServiceCategory;
  pricingConfig?: PricingConfig;
  packages?: ServicePackage[];
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
  isActive?: boolean;
  prerequisites?: string[];
  tags?: string[];
}

export interface ServiceListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    businessId?: UUID;
    category?: ServiceCategory;
    allowOnlineBooking?: boolean;
    isActive?: boolean;
    priceRange?: {
      min: number;
      max: number;
    };
    duration?: {
      min: number;
      max: number;
    };
  };
}

export interface ServiceListResponse {
  services: Service[];
  pagination: PaginationMeta;
}
```

## 👨‍💼 Staff Types

```typescript
export type StaffRole =
  | 'SENIOR_PRACTITIONER'
  | 'PRACTITIONER'
  | 'JUNIOR_PRACTITIONER'
  | 'SPECIALIST'
  | 'RECEPTIONIST'
  | 'MANAGER'
  | 'ASSISTANT';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: Address;
}

export interface ProfessionalInfo {
  title: string;
  specialization?: string;
  licenseNumber?: string;
  experience: number; // years
  qualifications: string[];
  languages?: string[];
  bio?: string;
}

export interface WorkingHours {
  monday?: WorkingDay;
  tuesday?: WorkingDay;
  wednesday?: WorkingDay;
  thursday?: WorkingDay;
  friday?: WorkingDay;
  saturday?: WorkingDay;
  sunday?: WorkingDay;
}

export interface WorkingDay {
  isWorkingDay: boolean;
  shifts?: TimeSlot[];
}

export interface Staff {
  id: UUID;
  businessId: UUID;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  role: StaffRole;
  permissions: string[];
  serviceIds: UUID[];
  workingHours: WorkingHours;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  // Relations
  business?: Business;
  services?: Service[];
  user?: User;
}

export interface CreateStaffRequest {
  businessId: UUID;
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  role: StaffRole;
  permissions: string[];
  serviceIds?: UUID[];
  workingHours?: WorkingHours;
}

export interface UpdateStaffRequest {
  personalInfo?: Partial<PersonalInfo>;
  professionalInfo?: Partial<ProfessionalInfo>;
  role?: StaffRole;
  permissions?: string[];
  serviceIds?: UUID[];
  workingHours?: WorkingHours;
  isActive?: boolean;
}

export interface StaffListRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    businessId: UUID;
    role?: StaffRole;
    canProvideService?: UUID;
    isActive?: boolean;
    specialization?: string;
  };
}

export interface StaffListResponse {
  staff: Staff[];
  pagination: PaginationMeta;
}

export interface AvailabilityRule {
  type: 'RECURRING' | 'ONE_TIME';
  dayOfWeek?:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
  startTime: string;
  endTime: string;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveUntil?: string; // YYYY-MM-DD
  breakTimes?: TimeSlot[];
}

export interface AvailabilityException {
  date: string; // YYYY-MM-DD
  type: 'UNAVAILABLE' | 'MODIFIED_HOURS' | 'VACATION' | 'SICK_LEAVE';
  startTime?: string;
  endTime?: string;
  reason: string;
  allDay: boolean;
}

export interface StaffAvailabilityRequest {
  availabilityRules: AvailabilityRule[];
  exceptions: AvailabilityException[];
}
```

## 📅 Appointment Types

```typescript
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type AppointmentSource =
  | 'ONLINE_BOOKING'
  | 'PHONE'
  | 'WALK_IN'
  | 'STAFF_CREATED'
  | 'MOBILE_APP';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'INSURANCE'
  | 'PACKAGE'
  | 'FREE';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'REFUNDED'
  | 'FAILED';

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  preferences?: {
    language?: string;
    notifications?: ('EMAIL' | 'SMS' | 'PUSH')[];
    reminderSettings?: {
      email24h?: boolean;
      sms2h?: boolean;
      emailFollowup?: boolean;
    };
  };
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

export interface PricingSelection {
  selectedPackage?: UUID;
  variableOptions?: Record<string, string>;
  addOns?: string[];
}

export interface PaymentInfo {
  method: PaymentMethod;
  status?: PaymentStatus;
  amount: Money;
  paymentIntentId?: string;
  transactionId?: string;
  receiptUrl?: string;
}

export interface Appointment {
  id: UUID;
  businessId: UUID;
  serviceId: UUID;
  staffId?: UUID;
  clientInfo: ClientInfo;
  startTime: ISODateTime;
  endTime: ISODateTime;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes?: string;
  internalNotes?: string;
  pricingSelection?: PricingSelection;
  paymentInfo?: PaymentInfo;
  totalAmount: Money;
  confirmationRequired: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  // Relations
  business?: Business;
  service?: Service;
  staff?: Staff;
}

export interface CreateAppointmentRequest {
  businessId: UUID;
  serviceId: UUID;
  staffId?: UUID;
  startTime: ISODateTime;
  endTime: ISODateTime;
  clientInfo: ClientInfo;
  notes?: string;
  pricingSelection?: PricingSelection;
  paymentInfo?: PaymentInfo;
  source?: AppointmentSource;
  confirmationRequired?: boolean;
}

export interface UpdateAppointmentRequest {
  status?: AppointmentStatus;
  notes?: string;
  internalNotes?: string;
  paymentInfo?: Partial<PaymentInfo>;
}

export interface RescheduleAppointmentRequest {
  newStartTime: ISODateTime;
  newEndTime: ISODateTime;
  newStaffId?: UUID;
  reason: string;
  notifyClient?: boolean;
  rescheduleBy: 'CLIENT' | 'STAFF' | 'BUSINESS';
  additionalNotes?: string;
}

export interface CancelAppointmentRequest {
  reason:
    | 'CLIENT_REQUEST'
    | 'STAFF_UNAVAILABLE'
    | 'BUSINESS_CLOSURE'
    | 'NO_SHOW'
    | 'OTHER';
  notes?: string;
  refundAmount?: Money;
  notifyClient?: boolean;
  cancellationFee?: Money;
}

export interface AppointmentListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    businessId?: UUID;
    serviceId?: UUID;
    staffId?: UUID;
    status?: AppointmentStatus[];
    source?: AppointmentSource[];
    dateRange?: {
      startDate: ISODateTime;
      endDate: ISODateTime;
    };
    clientEmail?: string;
    paymentStatus?: PaymentStatus;
  };
  includeDetails?: {
    clientInfo?: boolean;
    serviceDetails?: boolean;
    staffInfo?: boolean;
    paymentInfo?: boolean;
  };
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: PaginationMeta;
}

export interface AvailableSlotsRequest {
  businessId: UUID;
  serviceId: UUID;
  staffId?: UUID;
  date: string; // YYYY-MM-DD
  duration: number;
  preferences?: {
    timeRange?: {
      earliestTime: string; // HH:mm
      latestTime: string; // HH:mm
    };
    bufferTime?: number; // minutes
    excludeBreaks?: boolean;
  };
}

export interface AvailableSlotsResponse {
  slots: string[]; // Array of "HH:mm" time slots
  date: string;
  staffInfo?: {
    id: UUID;
    name: string;
    title: string;
  };
}
```

## 📊 Analytics Types

```typescript
export interface AnalyticsRequest {
  dateRange: {
    startDate: ISODateTime;
    endDate: ISODateTime;
  };
  metrics: AnalyticsMetric[];
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
  includeComparisons?: boolean;
  filters?: {
    businessId?: UUID;
    serviceIds?: UUID[];
    staffIds?: UUID[];
  };
}

export type AnalyticsMetric =
  | 'APPOINTMENT_COUNT'
  | 'REVENUE_TOTAL'
  | 'AVERAGE_APPOINTMENT_VALUE'
  | 'CLIENT_RETENTION_RATE'
  | 'SERVICE_POPULARITY'
  | 'STAFF_UTILIZATION'
  | 'CANCELLATION_RATE'
  | 'NO_SHOW_RATE';

export interface AnalyticsResponse {
  metrics: Record<AnalyticsMetric, AnalyticsData>;
  period: {
    startDate: ISODateTime;
    endDate: ISODateTime;
  };
  comparisons?: {
    previousPeriod: Record<AnalyticsMetric, AnalyticsData>;
    changePercentage: Record<AnalyticsMetric, number>;
  };
}

export interface AnalyticsData {
  value: number;
  unit: string;
  breakdown?: {
    date: string;
    value: number;
  }[];
}
```

## 🚀 Usage Examples

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useAppointments(filters: AppointmentListRequest = {}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/appointments/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(filters),
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data: ApiResponse<AppointmentListResponse> = await response.json();
      setAppointments(data.data.appointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [JSON.stringify(filters)]);

  return { appointments, loading, error, refetch: fetchAppointments };
}
```

### API Service Class Example

```typescript
class AppointmentAPI {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  async bookAppointment(
    request: CreateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await fetch(`${this.baseURL}/api/v1/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message);
    }

    const data: ApiResponse<Appointment> = await response.json();
    return data.data;
  }

  async getAvailableSlots(request: AvailableSlotsRequest): Promise<string[]> {
    const response = await fetch(
      `${this.baseURL}/api/v1/appointments/available-slots`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(request),
      },
    );

    if (!response.ok) throw new Error('Failed to get available slots');

    const data: ApiResponse<AvailableSlotsResponse> = await response.json();
    return data.data.slots;
  }
}

export const appointmentAPI = new AppointmentAPI();
```

Copy these types into your project and enjoy full TypeScript intellisense and type safety when working with the API!
