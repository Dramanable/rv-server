# 🎯 Staff & Service Management APIs - Swagger Documentation

## 📋 Overview

Cette documentation détaille les APIs REST pour la gestion du personnel (Staff) et des services, créées selon les principes de Clean Architecture avec documentation Swagger complète.

## 🏗️ Architecture Implementation Status

### ✅ **Staff Management - 100% Complete**

- **Domain** : ✅ Staff Entity + Value Objects + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List)
- **Infrastructure** : ✅ StaffOrmEntity + TypeOrmStaffRepository + Mappers + Migration
- **Presentation** : ✅ StaffController + All DTOs with Swagger documentation

### ✅ **Service Management - 100% Complete**

- **Domain** : ✅ Service Entity + Value Objects + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List)
- **Infrastructure** : ✅ ServiceOrmEntity + TypeOrmServiceRepository + Mappers + Migration
- **Presentation** : ✅ ServiceController + All DTOs with Swagger documentation

## 🎯 Staff Management APIs

### **POST /api/v1/staff/list**

**Description** : Recherche avancée paginée du personnel
**Security** : Requires JWT authentication
**Request Body** :

```typescript
{
  "page": 1,              // Optional, default: 1
  "limit": 10,            // Optional, default: 10, max: 100
  "sortBy": "createdAt",  // Optional, enum: ['createdAt', 'firstName', 'lastName', 'role', 'email']
  "sortOrder": "desc",    // Optional, enum: ['asc', 'desc']
  "search": "Dr. Jean",   // Optional, search in name/email/specialization
  "role": "DOCTOR",       // Optional, filter by staff role
  "isActive": true,       // Optional, filter by active status
  "businessId": "uuid"    // Optional, filter by business
}
```

**Response** :

```typescript
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "businessId": "uuid",
      "profile": {
        "firstName": "Dr. Jean",
        "lastName": "Dupont",
        "specialization": "Médecine Générale"
      },
      "role": "DOCTOR",
      "email": "dr.dupont@clinic.fr",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-01T10:00:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **GET /api/v1/staff/:id**

**Description** : Récupérer un membre du personnel par ID
**Security** : Requires JWT authentication
**Parameters** : `id` (UUID) - Staff member identifier

**Response** :

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessId": "uuid",
    "profile": {
      "firstName": "Dr. Jean",
      "lastName": "Dupont",
      "title": "Dr.",
      "specialization": "Médecine Générale",
      "bio": "Médecin expérimenté...",
      "profileImageUrl": "https://...",
      "certifications": ["Diplôme de Médecine"],
      "languages": ["French", "English"]
    },
    "role": "DOCTOR",
    "email": "dr.dupont@clinic.fr",
    "phone": "+33123456789",
    "status": "ACTIVE",
    "availability": { /* configuration */ },
    "calendarIntegration": { /* settings */ },
    "hireDate": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  },
  "meta": {
    "timestamp": "2025-01-01T10:00:00Z",
    "requestId": "staff-1234567890"
  }
}
```

### **POST /api/v1/staff**

**Description** : Créer un nouveau membre du personnel
**Security** : Requires JWT authentication
**Request Body** :

```typescript
{
  "businessId": "uuid",           // Required
  "firstName": "Jean",            // Required, 2-50 chars
  "lastName": "Dupont",           // Required, 2-50 chars
  "email": "j.dupont@clinic.fr",  // Required, valid email
  "phone": "+33123456789",        // Optional
  "role": "DOCTOR",               // Required, enum StaffRole
  "jobTitle": "Médecin Généraliste", // Optional, max 100 chars
  "specialization": "Consultation", // Optional, max 200 chars
  "bio": "Médecin expérimenté...",  // Optional, max 1000 chars
  "certifications": ["Diplôme"],    // Optional, array of strings
  "languages": ["French"],          // Optional, array of strings
  "workingHours": {                 // Optional, weekly schedule
    "monday": { "start": "09:00", "end": "17:00" },
    "tuesday": { "start": "09:00", "end": "17:00" }
    // ... other days
  }
}
```

### **PUT /api/v1/staff/:id**

**Description** : Mettre à jour un membre du personnel
**Security** : Requires JWT authentication
**Request Body** : Partial update with nested objects

```typescript
{
  "profile": {                      // Optional, profile updates
    "firstName": "Jean-Pierre",
    "specialization": "Cardiologie"
  },
  "role": "SENIOR_DOCTOR",          // Optional, role change
  "status": "ON_LEAVE",             // Optional, status change
  "contactInfo": {                  // Optional, contact updates
    "email": "new@email.com",
    "phone": "+33987654321"
  },
  "availability": { /* config */ }, // Optional, availability updates
  "calendarIntegration": { /* */ }  // Optional, calendar updates
}
```

### **DELETE /api/v1/staff/:id**

**Description** : Supprimer un membre du personnel
**Security** : Requires JWT authentication
**Response** :

```typescript
{
  "success": true,
  "data": {
    "staffId": "uuid",
    "message": "Staff member deleted successfully"
  },
  "meta": {
    "timestamp": "2025-01-01T10:00:00Z",
    "requestId": "delete-staff-1234567890"
  }
}
```

## 🎯 Service Management APIs

### **POST /api/v1/services/list**

**Description** : Recherche avancée paginée des services
**Security** : Requires JWT authentication
**Request Body** :

```typescript
{
  "page": 1,              // Optional, default: 1
  "limit": 10,            // Optional, default: 10, max: 100
  "sortBy": "name",       // Optional, enum: ['name', 'price', 'duration', 'createdAt']
  "sortOrder": "asc",     // Optional, enum: ['asc', 'desc']
  "search": "Consultation", // Optional, search in name/description
  "category": "MEDICAL",  // Optional, filter by category
  "isActive": true,       // Optional, filter by active status
  "businessId": "uuid"    // Optional, filter by business
}
```

### **GET /api/v1/services/:id**

**Description** : Récupérer un service par ID
**Response** :

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessId": "uuid",
    "name": "Consultation Médecine Générale",
    "description": "Consultation complète...",
    "category": "MEDICAL",
    "price": {
      "amount": 75.50,
      "currency": "EUR"
    },
    "duration": 30,           // minutes
    "isActive": true,
    "settings": {
      "allowOnlineBooking": true,
      "requiresPreparation": false,
      "maxAdvanceBookingDays": 90
    },
    "requirements": [
      "Bring ID card",
      "Arrive 10 minutes early"
    ],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  }
}
```

### **POST /api/v1/services**

**Description** : Créer un nouveau service
**Request Body** :

```typescript
{
  "businessId": "uuid",              // Required
  "name": "Consultation Générale",   // Required, 2-200 chars
  "description": "Consultation...",  // Optional, max 1000 chars
  "category": "Medical",             // Required, string type
  "price": {                         // Required
    "amount": 75.50,                 // Required, min: 0, max decimals: 2
    "currency": "EUR"                // Required, enum: ['EUR', 'USD', 'GBP', 'CAD']
  },
  "duration": 30,                    // Required, minutes, 5-480
  "settings": {                      // Optional
    "allowOnlineBooking": true,
    "requiresPreparation": false,
    "maxAdvanceBookingDays": 90
  },
  "requirements": [                  // Optional, max 10 items
    "Bring ID card"
  ]
}
```

### **PUT /api/v1/services/:id**

**Description** : Mettre à jour un service
**Request Body** : Partial update

```typescript
{
  "name": "Updated Service Name",    // Optional
  "price": {                         // Optional
    "amount": 85.00,
    "currency": "EUR"
  },
  "duration": 45,                    // Optional
  "isActive": false                  // Optional
}
```

### **DELETE /api/v1/services/:id**

**Description** : Supprimer un service
**Response** :

```typescript
{
  "success": true,
  "data": {
    "serviceId": "uuid",
    "message": "Service deleted successfully"
  }
}
```

## 🚨 Error Responses

Toutes les APIs suivent le format d'erreur standardisé :

```typescript
{
  "success": false,
  "error": {
    "code": "STAFF_NOT_FOUND",           // Code d'erreur technique
    "message": "Staff member not found", // Message utilisateur (i18n)
    "details": "Staff ID: abc-123",      // Détails techniques (dev only)
    "field": "staffId",                  // Champ en erreur (validation)
    "timestamp": "2025-01-01T10:00:00Z", // ISO timestamp
    "path": "/api/v1/staff/abc-123",     // Endpoint appelé
    "correlationId": "req-1234567890"    // ID pour tracing
  }
}
```

### **HTTP Status Codes**

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity (business rule violation)
- `500` - Internal Server Error (system error)

## 🔐 Authentication & Authorization

### **JWT Authentication**

- **Header** : `Authorization: Bearer <jwt-token>`
- **Cookie** : `accessToken=<jwt-token>` (HttpOnly, Secure)

### **Required Permissions**

- **Staff Management** : Requires `MANAGE_STAFF` permission
- **Service Management** : Requires `MANAGE_SERVICES` permission
- **Read Operations** : Requires appropriate read permissions based on user role

### **Role-Based Access**

- **PLATFORM_ADMIN** : Full access to all operations
- **BUSINESS_OWNER** : Access to their business data only
- **BUSINESS_ADMIN** : Limited management operations
- **Other Roles** : Read-only access based on business relationship

## 📊 Validation Rules

### **Staff Validation**

- `firstName`, `lastName` : 2-50 characters
- `email` : Valid email format, unique per business
- `phone` : Optional, valid phone format
- `role` : Must be valid StaffRole enum value
- `specialization` : Max 200 characters
- `bio` : Max 1000 characters

### **Service Validation**

- `name` : 2-200 characters
- `description` : Max 1000 characters
- `price.amount` : ≥ 0, max 2 decimal places
- `duration` : 5-480 minutes
- `requirements` : Max 10 items, each max 200 characters

## 🎯 Business Rules

### **Staff Management**

- Staff cannot be deleted if they have active appointments
- Role changes require appropriate permissions
- Email must be unique within the business
- Status transitions follow business logic (ACTIVE ↔ INACTIVE ↔ ON_LEAVE)

### **Service Management**

- Services cannot be deleted if they have future appointments
- Price changes don't affect existing appointments
- Duration changes require admin approval
- Category changes may affect booking rules

## 📈 Performance & Scalability

### **Pagination**

- Default page size : 10 items
- Maximum page size : 100 items
- Offset-based pagination with metadata

### **Search & Filtering**

- Full-text search on relevant fields
- Multiple filter combinations supported
- Sorting on indexed columns
- Optimized database queries

### **Caching Strategy**

- Staff profiles cached for 15 minutes
- Service definitions cached for 30 minutes
- Search results cached for 5 minutes
- Cache invalidation on updates

---

## 🔧 Swagger Integration

Les APIs sont entièrement documentées avec Swagger/OpenAPI 3.0 :

- **Documentation URL** : `http://localhost:3000/api/docs`
- **Swagger JSON** : `http://localhost:3000/api/docs-json`
- **Redoc UI** : `http://localhost:3000/api/redoc`

### **Swagger Features Implemented**

- ✅ Complete API documentation with examples
- ✅ Request/Response schema validation
- ✅ Authentication integration (JWT Bearer)
- ✅ Error response documentation
- ✅ Business rule explanations
- ✅ Interactive API testing interface
- ✅ Schema validation with class-validator integration
- ✅ Multilingual error messages (i18n)

Cette documentation Swagger complète permet aux développeurs frontend et aux intégrateurs tiers de comprendre et utiliser facilement les APIs Staff et Service Management.
