# 🚀 API Testing Guide - Postman & cURL Examples

## 📋 Quick Testing Setup

### 🔧 Environment Variables

Set up these variables in Postman or your shell:

```bash
# Environment Configuration
export API_BASE_URL="http://localhost:3000"
export API_DOCS_URL="http://localhost:3000/api/docs"

# Will be set after login
export ACCESS_TOKEN=""
export REFRESH_TOKEN=""
```

## 🔐 Authentication Flow

### 1. Login (Get Cookies)

```bash
# Login and capture cookies
curl -c cookies.txt -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "rememberMe": true
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "BUSINESS_OWNER",
      "isActive": true,
      "emailVerified": true
    },
    "accessExpiresAt": "2025-09-29T11:00:00Z",
    "refreshExpiresAt": "2025-10-29T10:30:00Z"
  }
}
```

### 2. Get Current User Info

```bash
# Check authentication status
curl -b cookies.txt -X GET "${API_BASE_URL}/auth/me"
```

### 3. Logout

```bash
# Logout (single device)
curl -b cookies.txt -X POST "${API_BASE_URL}/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{"logoutAllDevices": false}'

# Logout (all devices)
curl -b cookies.txt -X POST "${API_BASE_URL}/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{"logoutAllDevices": true}'
```

## 🏢 Business Management

### Create Business

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/businesses" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Medical Clinic",
    "email": "contact@downtownmed.com",
    "phone": "+33123456789",
    "businessSectorId": "healthcare-uuid",
    "description": "Complete healthcare services for the community",
    "website": "https://downtownmed.com",
    "address": {
      "street": "456 Health Boulevard",
      "city": "Paris",
      "zipCode": "75002",
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
      "enableNotifications": true,
      "businessHours": {
        "monday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00"},
        "tuesday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00"},
        "wednesday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00"},
        "thursday": {"isOpen": true, "openTime": "08:00", "closeTime": "18:00"},
        "friday": {"isOpen": true, "openTime": "08:00", "closeTime": "17:00"},
        "saturday": {"isOpen": false},
        "sunday": {"isOpen": false}
      }
    }
  }'
```

### List Businesses with Filters

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/businesses/list" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 20,
    "search": "medical",
    "sortBy": "name",
    "sortOrder": "asc",
    "filters": {
      "businessSectorId": "healthcare-uuid",
      "isActive": true,
      "allowOnlineBooking": true,
      "city": "Paris"
    }
  }'
```

### Update Business

```bash
curl -b cookies.txt -X PATCH "${API_BASE_URL}/api/v1/businesses/{businessId}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Medical Clinic - Updated",
    "description": "Premier healthcare services with extended hours",
    "settings": {
      "allowOnlineBooking": true,
      "requireClientApproval": true
    }
  }'
```

## 💼 Service Management

### Create Service with Fixed Pricing

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "name": "General Medical Consultation",
    "description": "Comprehensive medical examination and consultation",
    "duration": 30,
    "category": "MEDICAL",
    "pricingConfig": {
      "type": "FIXED",
      "visibility": "PUBLIC",
      "basePrice": {
        "amount": 75.00,
        "currency": "EUR"
      },
      "description": "Standard consultation fee"
    },
    "allowOnlineBooking": true,
    "requiresApproval": false,
    "prerequisites": [
      "Valid ID required",
      "Insurance card recommended"
    ],
    "tags": ["consultation", "general", "medical"]
  }'
```

### Create Service with Variable Pricing

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "name": "Physical Therapy Session",
    "description": "Personalized physical therapy treatment",
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
            "name": "Session Duration",
            "type": "DURATION",
            "options": [
              {"label": "30 minutes", "value": 30, "priceModifier": 0},
              {"label": "45 minutes", "value": 45, "priceModifier": 25.00},
              {"label": "60 minutes", "value": 60, "priceModifier": 50.00}
            ]
          },
          {
            "name": "Session Type",
            "type": "SERVICE_VARIANT",
            "options": [
              {"label": "Standard Therapy", "priceModifier": 0},
              {"label": "Specialized Treatment", "priceModifier": 30.00},
              {"label": "Home Visit", "priceModifier": 40.00}
            ]
          }
        ]
      }
    },
    "allowOnlineBooking": true
  }'
```

### Create Service with Packages

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/services" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "name": "Wellness Massage",
    "description": "Relaxing full-body massage therapy",
    "duration": 60,
    "category": "WELLNESS",
    "pricingConfig": {
      "type": "FIXED",
      "visibility": "PUBLIC",
      "basePrice": {
        "amount": 90.00,
        "currency": "EUR"
      }
    },
    "packages": [
      {
        "name": "Wellness Package - 5 Sessions",
        "description": "Five massage sessions with 15% discount",
        "type": "SESSION_BASED",
        "sessionsIncluded": 5,
        "packagePrice": {
          "amount": 380.00,
          "currency": "EUR"
        },
        "validityDays": 90,
        "savings": {
          "amount": 70.00,
          "percentage": 15.6
        }
      },
      {
        "name": "Monthly Unlimited",
        "description": "Unlimited massages for 30 days",
        "type": "UNLIMITED",
        "packagePrice": {
          "amount": 300.00,
          "currency": "EUR"
        },
        "validityDays": 30,
        "restrictions": {
          "maxSessionsPerDay": 1,
          "advanceBookingRequired": true
        }
      }
    ],
    "allowOnlineBooking": true
  }'
```

### Search Services

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/services/list" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 20,
    "search": "massage",
    "sortBy": "name",
    "sortOrder": "asc",
    "filters": {
      "businessId": "business-uuid",
      "category": "WELLNESS",
      "allowOnlineBooking": true,
      "isActive": true,
      "priceRange": {
        "min": 50,
        "max": 200
      },
      "duration": {
        "min": 30,
        "max": 120
      }
    }
  }'
```

## 👨‍💼 Staff Management

### Create Staff Member

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/staff" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "personalInfo": {
      "firstName": "Dr. Sarah",
      "lastName": "Johnson",
      "email": "dr.johnson@clinic.com",
      "phone": "+33123456790",
      "dateOfBirth": "1985-06-15"
    },
    "professionalInfo": {
      "title": "Senior Medical Doctor",
      "specialization": "Internal Medicine",
      "licenseNumber": "MD789012",
      "experience": 12,
      "qualifications": [
        "MD - Harvard Medical School",
        "Board Certified Internal Medicine",
        "Advanced Cardiac Life Support (ACLS)"
      ],
      "languages": ["English", "French", "Spanish"]
    },
    "role": "SENIOR_PRACTITIONER",
    "permissions": [
      "MANAGE_OWN_APPOINTMENTS",
      "VIEW_CLIENT_RECORDS",
      "CREATE_PRESCRIPTIONS",
      "MENTOR_JUNIOR_STAFF"
    ],
    "serviceIds": ["consultation-service-uuid", "checkup-service-uuid"],
    "workingHours": {
      "monday": {
        "isWorkingDay": true,
        "shifts": [
          {"startTime": "09:00", "endTime": "12:30"},
          {"startTime": "14:00", "endTime": "17:30"}
        ]
      },
      "tuesday": {
        "isWorkingDay": true,
        "shifts": [{"startTime": "08:00", "endTime": "16:00"}]
      },
      "wednesday": {"isWorkingDay": false},
      "thursday": {
        "isWorkingDay": true,
        "shifts": [{"startTime": "10:00", "endTime": "18:00"}]
      },
      "friday": {
        "isWorkingDay": true,
        "shifts": [{"startTime": "09:00", "endTime": "15:00"}]
      }
    }
  }'
```

### Set Staff Availability

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/staff/{staffId}/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "availabilityRules": [
      {
        "type": "RECURRING",
        "dayOfWeek": "MONDAY",
        "startTime": "09:00",
        "endTime": "17:00",
        "effectiveFrom": "2025-10-01",
        "effectiveUntil": null,
        "breakTimes": [
          {"startTime": "12:30", "endTime": "13:30", "type": "LUNCH"},
          {"startTime": "15:00", "endTime": "15:15", "type": "BREAK"}
        ]
      }
    ],
    "exceptions": [
      {
        "date": "2025-10-15",
        "type": "UNAVAILABLE",
        "reason": "Medical Conference",
        "allDay": true
      },
      {
        "date": "2025-10-22",
        "type": "MODIFIED_HOURS",
        "startTime": "14:00",
        "endTime": "20:00",
        "reason": "Evening clinic coverage"
      },
      {
        "date": "2025-10-30",
        "type": "VACATION",
        "allDay": true,
        "reason": "Personal vacation day"
      }
    ]
  }'
```

## 📅 Appointment Management

### Book Appointment

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "serviceId": "service-uuid",
    "staffId": "staff-uuid",
    "startTime": "2025-10-15T14:00:00Z",
    "endTime": "2025-10-15T14:30:00Z",
    "clientInfo": {
      "firstName": "Marie",
      "lastName": "Dubois",
      "email": "marie.dubois@email.com",
      "phone": "+33987654321",
      "dateOfBirth": "1990-03-15",
      "preferences": {
        "language": "fr",
        "notifications": ["EMAIL", "SMS"],
        "reminderSettings": {
          "email24h": true,
          "sms2h": true,
          "emailFollowup": true
        }
      },
      "medicalInfo": {
        "allergies": ["Penicillin"],
        "medications": ["Aspirin 100mg daily"],
        "conditions": ["Hypertension"]
      }
    },
    "notes": "First consultation - patient reports lower back pain for 2 weeks",
    "pricingSelection": {
      "selectedPackage": null,
      "variableOptions": {
        "Session Duration": "45 minutes",
        "Session Type": "Standard Therapy"
      }
    },
    "paymentInfo": {
      "method": "CARD",
      "amount": {
        "amount": 105.00,
        "currency": "EUR"
      },
      "paymentIntentId": "pi_stripe_payment_intent"
    },
    "source": "ONLINE_BOOKING",
    "confirmationRequired": false
  }'
```

### List Appointments with Advanced Filtering

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/appointments/list" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 50,
    "sortBy": "startTime",
    "sortOrder": "asc",
    "filters": {
      "businessId": "business-uuid",
      "staffId": "staff-uuid",
      "status": ["CONFIRMED", "IN_PROGRESS"],
      "dateRange": {
        "startDate": "2025-10-01T00:00:00Z",
        "endDate": "2025-10-31T23:59:59Z"
      },
      "serviceCategory": "MEDICAL",
      "clientEmail": "marie.dubois@email.com",
      "paymentStatus": "PAID",
      "source": ["ONLINE_BOOKING", "PHONE"]
    },
    "includeDetails": {
      "clientInfo": true,
      "serviceDetails": true,
      "staffInfo": true,
      "paymentInfo": false
    }
  }'
```

### Update Appointment Status

```bash
curl -b cookies.txt -X PATCH "${API_BASE_URL}/api/v1/appointments/{appointmentId}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "notes": "Appointment confirmed via phone call",
    "notifyClient": true,
    "updatedBy": "staff-uuid"
  }'
```

### Reschedule Appointment

```bash
curl -b cookies.txt -X PUT "${API_BASE_URL}/api/v1/appointments/{appointmentId}/reschedule" \
  -H "Content-Type: application/json" \
  -d '{
    "newStartTime": "2025-10-16T15:00:00Z",
    "newEndTime": "2025-10-16T15:30:00Z",
    "newStaffId": "different-staff-uuid",
    "reason": "Client requested different time and practitioner",
    "notifyClient": true,
    "rescheduleBy": "STAFF",
    "additionalNotes": "Patient prefers afternoon appointments"
  }'
```

### Cancel Appointment

```bash
curl -b cookies.txt -X PUT "${API_BASE_URL}/api/v1/appointments/{appointmentId}/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "CLIENT_REQUEST",
    "notes": "Client emergency - family situation",
    "refundAmount": {
      "amount": 50.00,
      "currency": "EUR"
    },
    "notifyClient": true,
    "cancellationFee": {
      "amount": 0.00,
      "currency": "EUR"
    }
  }'
```

## 🔍 Advanced Search & Analytics

### Get Available Time Slots

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/appointments/available-slots" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "serviceId": "service-uuid",
    "staffId": "staff-uuid",
    "date": "2025-10-15",
    "duration": 30,
    "preferences": {
      "timeRange": {
        "earliestTime": "09:00",
        "latestTime": "17:00"
      },
      "bufferTime": 15,
      "excludeBreaks": true
    }
  }'
```

### Business Analytics

```bash
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/analytics/business/{businessId}" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRange": {
      "startDate": "2025-10-01T00:00:00Z",
      "endDate": "2025-10-31T23:59:59Z"
    },
    "metrics": [
      "APPOINTMENT_COUNT",
      "REVENUE_TOTAL",
      "AVERAGE_APPOINTMENT_VALUE",
      "CLIENT_RETENTION_RATE",
      "SERVICE_POPULARITY",
      "STAFF_UTILIZATION"
    ],
    "groupBy": "DAY",
    "includeComparisons": true
  }'
```

## 📊 System Health & Monitoring

### Health Check

```bash
# Basic health check
curl "${API_BASE_URL}/health"

# Detailed system health
curl -b cookies.txt -X GET "${API_BASE_URL}/api/v1/health/detailed"
```

### API Version Info

```bash
curl "${API_BASE_URL}/api/v1/version"
```

## 🧪 Postman Collection

### Generate Postman Collection

```bash
# Export OpenAPI/Swagger JSON
curl "${API_BASE_URL}/api/docs-json" > api-collection.json

# Import this file into Postman:
# 1. Open Postman
# 2. Click "Import"
# 3. Select "api-collection.json"
# 4. All endpoints will be automatically available
```

### Environment Setup for Postman

Create a new environment in Postman with these variables:

```json
{
  "name": "Appointment API - Development",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "enabled": true
    },
    {
      "key": "apiUrl",
      "value": "{{baseUrl}}/api/v1",
      "enabled": true
    },
    {
      "key": "accessToken",
      "value": "",
      "enabled": true
    },
    {
      "key": "businessId",
      "value": "",
      "enabled": true
    },
    {
      "key": "serviceId",
      "value": "",
      "enabled": true
    },
    {
      "key": "staffId",
      "value": "",
      "enabled": true
    }
  ]
}
```

## 🔧 Testing Workflow

### 1. Complete Authentication Flow

```bash
# 1. Login and save cookies
curl -c cookies.txt -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "rememberMe": true}'

# 2. Verify authentication
curl -b cookies.txt "${API_BASE_URL}/auth/me"

# 3. Test protected endpoint
curl -b cookies.txt "${API_BASE_URL}/api/v1/businesses/list" \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 10}'

# 4. Logout
curl -b cookies.txt -X POST "${API_BASE_URL}/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{"logoutAllDevices": false}'
```

### 2. Full Appointment Booking Flow

```bash
# 1. Get available services
BUSINESS_ID="your-business-uuid"
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/services/list" \
  -H "Content-Type: application/json" \
  -d "{\"filters\": {\"businessId\": \"$BUSINESS_ID\", \"allowOnlineBooking\": true}}"

# 2. Get available staff
SERVICE_ID="selected-service-uuid"
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/staff/list" \
  -H "Content-Type: application/json" \
  -d "{\"filters\": {\"businessId\": \"$BUSINESS_ID\", \"canProvideService\": \"$SERVICE_ID\"}}"

# 3. Check available time slots
STAFF_ID="selected-staff-uuid"
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/appointments/available-slots" \
  -H "Content-Type: application/json" \
  -d "{\"businessId\": \"$BUSINESS_ID\", \"serviceId\": \"$SERVICE_ID\", \"staffId\": \"$STAFF_ID\", \"date\": \"2025-10-15\", \"duration\": 30}"

# 4. Book the appointment
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d "{\"businessId\": \"$BUSINESS_ID\", \"serviceId\": \"$SERVICE_ID\", \"staffId\": \"$STAFF_ID\", \"startTime\": \"2025-10-15T14:00:00Z\", \"endTime\": \"2025-10-15T14:30:00Z\", \"clientInfo\": {\"firstName\": \"Test\", \"lastName\": \"Client\", \"email\": \"test.client@example.com\", \"phone\": \"+33123456789\"}}"
```

## 🚨 Error Testing

### Test Rate Limiting

```bash
# Trigger rate limiting (5 requests in 5 minutes for auth)
for i in {1..6}; do
  curl -X POST "${API_BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@example.com", "password": "wrongpassword"}'
  echo "Request $i completed"
done
```

### Test Validation Errors

```bash
# Missing required fields
curl -b cookies.txt -X POST "${API_BASE_URL}/api/v1/businesses" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Invalid email format
curl -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "password123"}'
```

This testing guide provides comprehensive examples for all major API endpoints and workflows. Use these examples to test the API thoroughly and integrate it into your applications.
