# 🚀 Complete API Documentation - Appointment Management System

## 📋 Table of Contents

- [🎯 Overview](#overview)
- [🔐 Authentication](#authentication)
- [🏢 Business Management](#business-management)
- [👥 User Management](#user-management)
- [💼 Services & Pricing](#services--pricing)
- [📅 Appointments](#appointments)
- [👨‍💼 Staff Management](#staff-management)
- [📊 Calendar Management](#calendar-management)
- [🛡️ Security & Permissions](#security--permissions)
- [🔧 Integration Examples](#integration-examples)

## 🎯 Overview

### Base URL

```
Development: http://localhost:3000
Production: https://api.yourdomain.com
```

### API Version

```
Current Version: v3.0.0
Base Path: /api/v1
Documentation: /api/docs
```

### Response Format

All API endpoints follow a consistent response format:

#### ✅ Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    },
    "timestamp": "2025-09-29T10:30:00Z",
    "version": "3.0.0"
  }
}
```

#### ❌ Error Response

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "field": "fieldInError",
    "timestamp": "2025-09-29T10:30:00Z",
    "path": "/api/v1/endpoint",
    "requestId": "uuid-request-id"
  }
}
```

## 🔐 Authentication

### Cookie-Based Authentication

This API uses **secure HttpOnly cookies** for authentication. No manual token handling required!

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "BUSINESS_OWNER",
      "isActive": true,
      "emailVerified": true,
      "lastLoginAt": "2025-09-29T10:30:00Z"
    },
    "accessExpiresAt": "2025-09-29T10:45:00Z",
    "refreshExpiresAt": "2025-10-06T10:30:00Z"
  }
}
```

**Cookies Set:**

- `accessToken`: JWT token (15 minutes validity)
- `refreshToken`: Refresh token (7-30 days validity)

#### Current User Info

```http
GET /auth/me
Cookie: accessToken=...; refreshToken=...
```

#### Logout

```http
POST /auth/logout
Cookie: accessToken=...; refreshToken=...

{
  "logoutAllDevices": false
}
```

### JavaScript Integration

```javascript
// All requests automatically include cookies
const response = await fetch('/api/v1/businesses', {
  method: 'GET',
  credentials: 'include', // ✅ REQUIRED for cookie authentication
});

// Login example
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'owner@business.com',
    password: 'SecurePass123!',
    rememberMe: true,
  }),
});
```

## 🏢 Business Management

### Create Business

```http
POST /api/v1/businesses
Cookie: accessToken=...
Content-Type: application/json

{
  "name": "Medical Clinic Downtown",
  "email": "contact@clinic.com",
  "phone": "+33123456789",
  "businessSectorId": "healthcare-sector-uuid",
  "description": "Complete medical services for families",
  "website": "https://clinic.com",
  "address": {
    "street": "123 Health Avenue",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "coordinates": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  },
  "settings": {
    "timezone": "Europe/Paris",
    "currency": "EUR",
    "locale": "fr-FR",
    "allowOnlineBooking": true,
    "requireClientApproval": false,
    "enableNotifications": true
  }
}
```

### List Businesses (with Advanced Filtering)

```http
POST /api/v1/businesses/list
Cookie: accessToken=...
Content-Type: application/json

{
  "page": 1,
  "limit": 20,
  "search": "medical",
  "sortBy": "name",
  "sortOrder": "asc",
  "filters": {
    "businessSectorId": "healthcare-sector-uuid",
    "isActive": true,
    "allowOnlineBooking": true,
    "city": "Paris"
  }
}
```

## 💼 Services & Pricing

### Flexible Pricing System

#### Fixed Price Service

```http
POST /api/v1/services
Cookie: accessToken=...
Content-Type: application/json

{
  "businessId": "business-uuid",
  "name": "General Consultation",
  "description": "Standard medical consultation",
  "duration": 30,
  "category": "MEDICAL",
  "pricingConfig": {
    "type": "FIXED",
    "visibility": "PUBLIC",
    "basePrice": {
      "amount": 60.00,
      "currency": "EUR"
    },
    "description": "Standard consultation fee"
  },
  "allowOnlineBooking": true,
  "requiresApproval": false
}
```

#### Variable Pricing Service

```http
POST /api/v1/services
Cookie: accessToken=...
Content-Type: application/json

{
  "businessId": "business-uuid",
  "name": "Therapy Session",
  "description": "Customizable therapy session",
  "category": "THERAPY",
  "pricingConfig": {
    "type": "VARIABLE",
    "visibility": "PUBLIC",
    "basePrice": {
      "amount": 80.00,
      "currency": "EUR"
    },
    "variablePricing": {
      "factors": [
        {
          "name": "Duration",
          "type": "DURATION",
          "options": [
            {
              "label": "30 minutes",
              "value": 30,
              "priceModifier": 0
            },
            {
              "label": "60 minutes",
              "value": 60,
              "priceModifier": 40.00
            },
            {
              "label": "90 minutes",
              "value": 90,
              "priceModifier": 80.00
            }
          ]
        }
      ]
    }
  }
}
```

#### Service with Packages

```http
POST /api/v1/services
Cookie: accessToken=...
Content-Type: application/json

{
  "businessId": "business-uuid",
  "name": "Yoga Class",
  "pricingConfig": {
    "type": "FIXED",
    "basePrice": {
      "amount": 25.00,
      "currency": "EUR"
    }
  },
  "packages": [
    {
      "name": "Monthly Pass",
      "description": "Unlimited classes for 30 days",
      "type": "UNLIMITED",
      "packagePrice": {
        "amount": 120.00,
        "currency": "EUR"
      },
      "validityDays": 30,
      "savings": {
        "amount": 60.00,
        "percentage": 33
      }
    },
    {
      "name": "10-Class Package",
      "description": "10 classes with 3 month validity",
      "type": "SESSION_BASED",
      "sessionsIncluded": 10,
      "packagePrice": {
        "amount": 200.00,
        "currency": "EUR"
      },
      "validityDays": 90,
      "savings": {
        "amount": 50.00,
        "percentage": 20
      }
    }
  ]
}
```

### Search Services

```http
POST /api/v1/services/list
Cookie: accessToken=...
Content-Type: application/json

{
  "page": 1,
  "limit": 20,
  "search": "massage",
  "sortBy": "price",
  "sortOrder": "asc",
  "filters": {
    "businessId": "business-uuid",
    "category": "WELLNESS",
    "allowOnlineBooking": true,
    "priceRange": {
      "min": 50,
      "max": 150
    },
    "duration": {
      "min": 30,
      "max": 120
    }
  }
}
```

## 📅 Appointments

### Book Appointment

```http
POST /api/v1/appointments
Cookie: accessToken=...
Content-Type: application/json

{
  "businessId": "business-uuid",
  "serviceId": "service-uuid",
  "staffId": "staff-uuid",
  "startTime": "2025-10-15T14:00:00Z",
  "endTime": "2025-10-15T14:30:00Z",
  "clientInfo": {
    "firstName": "Marie",
    "lastName": "Dubois",
    "email": "marie.dubois@email.com",
    "phone": "+33123456789",
    "dateOfBirth": "1985-03-15",
    "preferences": {
      "language": "fr",
      "notifications": ["EMAIL", "SMS"]
    }
  },
  "notes": "First visit, has back pain",
  "pricingSelection": {
    "selectedPackage": null,
    "variableOptions": {
      "Duration": "60 minutes"
    }
  },
  "paymentInfo": {
    "method": "CASH",
    "amount": {
      "amount": 80.00,
      "currency": "EUR"
    }
  }
}
```

### List Appointments

```http
POST /api/v1/appointments/list
Cookie: accessToken=...
Content-Type: application/json

{
  "page": 1,
  "limit": 50,
  "sortBy": "startTime",
  "sortOrder": "asc",
  "filters": {
    "businessId": "business-uuid",
    "staffId": "staff-uuid",
    "status": ["CONFIRMED", "PENDING"],
    "dateRange": {
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-10-31T23:59:59Z"
    },
    "clientEmail": "marie.dubois@email.com"
  }
}
```

### Reschedule Appointment

```http
PUT /api/v1/appointments/{appointmentId}/reschedule
Cookie: accessToken=...
Content-Type: application/json

{
  "newStartTime": "2025-10-16T15:00:00Z",
  "newEndTime": "2025-10-16T15:30:00Z",
  "reason": "Client requested different time",
  "notifyClient": true
}
```

## 👨‍💼 Staff Management

### Create Staff Member

```http
POST /api/v1/staff
Cookie: accessToken=...
Content-Type: application/json

{
  "businessId": "business-uuid",
  "personalInfo": {
    "firstName": "Dr. Jean",
    "lastName": "Martin",
    "email": "dr.martin@clinic.com",
    "phone": "+33123456789",
    "dateOfBirth": "1980-05-20"
  },
  "professionalInfo": {
    "title": "Medical Doctor",
    "specialization": "General Medicine",
    "licenseNumber": "MD123456",
    "experience": 15,
    "qualifications": [
      "MD - University of Medicine",
      "Cardiology Specialist Certification"
    ]
  },
  "role": "PRACTITIONER",
  "permissions": [
    "MANAGE_OWN_APPOINTMENTS",
    "VIEW_CLIENT_INFO",
    "CREATE_MEDICAL_NOTES"
  ],
  "workingHours": {
    "monday": {
      "isWorkingDay": true,
      "shifts": [
        {
          "startTime": "09:00",
          "endTime": "12:00"
        },
        {
          "startTime": "14:00",
          "endTime": "18:00"
        }
      ]
    },
    "tuesday": {
      "isWorkingDay": true,
      "shifts": [
        {
          "startTime": "09:00",
          "endTime": "17:00"
        }
      ]
    }
  }
}
```

### Set Staff Availability

```http
POST /api/v1/staff/{staffId}/availability
Cookie: accessToken=...
Content-Type: application/json

{
  "availabilityRules": [
    {
      "type": "RECURRING",
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "17:00",
      "effectiveFrom": "2025-10-01",
      "effectiveUntil": null
    }
  ],
  "exceptions": [
    {
      "date": "2025-10-15",
      "type": "UNAVAILABLE",
      "reason": "Medical conference",
      "allDay": true
    },
    {
      "date": "2025-10-20",
      "type": "MODIFIED_HOURS",
      "startTime": "14:00",
      "endTime": "18:00",
      "reason": "Morning appointment"
    }
  ]
}
```

## 🔧 Integration Examples

### React/TypeScript Integration

#### API Service Setup

```typescript
// api.service.ts
class ApiService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include', // ✅ Always include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error?.message || 'Request failed', error);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string, rememberMe = false) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
  }

  // Business Management
  async createBusiness(businessData: CreateBusinessRequest) {
    return this.request<BusinessResponse>('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async searchServices(filters: ServiceSearchFilters) {
    return this.request<ServiceListResponse>('/api/v1/services/list', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Appointments
  async bookAppointment(appointmentData: CreateAppointmentRequest) {
    return this.request<AppointmentResponse>('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }
}

export const apiService = new ApiService();
```

#### React Hook for Services

```typescript
// hooks/useServices.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

export const useServices = (businessId: string) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchServices = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await apiService.searchServices({
        page: 1,
        limit: 20,
        filters: { businessId, ...filters },
      });
      setServices(response.data.services);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      searchServices();
    }
  }, [businessId]);

  return { services, loading, error, searchServices };
};
```

#### Vue.js 3 Composition API

```typescript
// composables/useAppointments.ts
import { ref, computed } from 'vue';
import { apiService } from '../services/api.service';

export const useAppointments = () => {
  const appointments = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const upcomingAppointments = computed(() =>
    appointments.value.filter((apt) => new Date(apt.startTime) > new Date()),
  );

  const bookAppointment = async (appointmentData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await apiService.bookAppointment(appointmentData);
      appointments.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAppointments = async (filters = {}) => {
    loading.value = true;
    try {
      const response = await apiService.request('/api/v1/appointments/list', {
        method: 'POST',
        body: JSON.stringify({ page: 1, limit: 50, ...filters }),
      });
      appointments.value = response.data.appointments;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    appointments,
    upcomingAppointments,
    loading,
    error,
    bookAppointment,
    fetchAppointments,
  };
};
```

### Error Handling Best Practices

#### Frontend Error Handler

```typescript
// utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public response?: any,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: ApiError) => {
  switch (error.response?.error?.code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      window.location.href = '/login';
      break;
    case 'BUSINESS_NOT_FOUND':
      // Show business not found message
      showNotification('Business not found', 'error');
      break;
    case 'APPOINTMENT_CONFLICT':
      // Show conflict resolution options
      showConflictDialog(error.response.error.details);
      break;
    default:
      // Show generic error
      showNotification(error.message, 'error');
  }
};
```

## 🛡️ Security & Rate Limiting

### Rate Limits

- **Authentication endpoints**: 5 requests per 5 minutes
- **Standard API endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute

### CORS Configuration

```javascript
// Allowed origins in production
const allowedOrigins = [
  'https://yourdomain.com',
  'https://admin.yourdomain.com',
  'https://booking.yourdomain.com',
];
```

### Content Security Policy

The API sets appropriate CSP headers for enhanced security.

---

## 📞 Support & Resources

- **Swagger UI**: `/api/docs`
- **Health Check**: `/health`
- **API Status**: `/api/v1/health`
- **Support Email**: dev-support@yourdomain.com

This documentation provides everything needed to integrate with the Appointment Management API. For additional examples or specific use cases, refer to the interactive Swagger documentation at `/api/docs`.
