import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('🏥 Complete Appointment Management API')
    .setDescription(
      `
# 🎯 Clean Architecture Appointment System

## 🏗️ Complete Business Management Platform
This comprehensive API provides **enterprise-grade appointment management** with:
- **🔐 Authentication & Authorization** with JWT tokens in secure HttpOnly cookies  
- **🏢 Business Management** - Multi-location business operations
- **👥 Staff Management** - Personnel, roles, and scheduling
- **💼 Service Management** - Flexible pricing, packages, and booking rules
- **📅 Appointment Booking** - Advanced scheduling with conflict resolution
- **📊 Calendar Management** - Personal and business calendars
- **🛡️ Security** - Rate limiting, CORS protection, input validation

## 🍪 Cookie-Based Authentication
**Important for Frontend Developers:**
- All JWT tokens are stored in **secure HttpOnly cookies**
- No need to handle tokens manually in JavaScript
- Cookies are automatically sent with each request
- Use \`credentials: 'include'\` in fetch requests

## 📱 Frontend Integration Guide

### 🔐 Authentication Flow
\`\`\`javascript
// Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ✅ REQUIRED for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    rememberMe: false
  })
});

// Get current user info
const userResponse = await fetch('/auth/me', {
  credentials: 'include' // ✅ Automatically sends auth cookies
});
\`\`\`

### 🏢 Business Management
\`\`\`javascript
// Create business
const businessResponse = await fetch('/api/v1/businesses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'My Medical Clinic',
    email: 'contact@clinic.com',
    phone: '+33123456789',
    businessSectorId: 'uuid-sector-id',
    address: {
      street: '123 Health Street',
      city: 'Paris',
      zipCode: '75001',
      country: 'France'
    }
  })
});
\`\`\`

### 💼 Service Management with Flexible Pricing
\`\`\`javascript
// Create service with flexible pricing
const serviceResponse = await fetch('/api/v1/services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    businessId: 'business-uuid',
    name: 'Medical Consultation',
    description: 'General medical consultation',
    duration: 30, // minutes
    category: 'MEDICAL',
    pricingConfig: {
      type: 'FIXED', // FREE, FIXED, VARIABLE, HIDDEN, ON_DEMAND
      visibility: 'PUBLIC', // PUBLIC, AUTHENTICATED, PRIVATE, HIDDEN
      basePrice: { amount: 50.00, currency: 'EUR' },
      rules: [],
      description: 'Standard consultation fee'
    },
    packages: [
      {
        name: '5-Session Package',
        description: 'Discounted package for regular patients',
        sessionsIncluded: 5,
        packagePrice: { amount: 200.00, currency: 'EUR' },
        validityDays: 90
      }
    ]
  })
});
\`\`\`

### 📅 Appointment Booking
\`\`\`javascript
// Book appointment
const appointmentResponse = await fetch('/api/v1/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    businessId: 'business-uuid',
    serviceId: 'service-uuid',
    staffId: 'staff-uuid', // optional
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T14:30:00Z',
    clientInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+33123456789'
    },
    notes: 'First consultation'
  })
});
\`\`\`

### 🔍 Advanced Search & Filtering
\`\`\`javascript
// Search services with advanced filters
const servicesResponse = await fetch('/api/v1/services/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    page: 1,
    limit: 20,
    search: 'consultation',
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {
      businessId: 'business-uuid',
      category: 'MEDICAL',
      isActive: true,
      allowOnlineBooking: true
    }
  })
});
\`\`\`

## 🔄 Automatic Token Refresh
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7-30 days** (depending on rememberMe)
- **Automatic rotation** prevents token replay attacks
- Frontend doesn't need to handle refresh logic

## 🚨 Standardized Error Handling
All endpoints return consistent error responses:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "Business not found",
    "details": "No business found with ID: uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/businesses/uuid"
  }
}
\`\`\`

## 💡 Business Rules & Features

### 🏢 Multi-Business Support
- **Business Owners** can manage multiple locations
- **Staff** can be assigned to specific businesses
- **Services** are business-specific with flexible pricing

### 💰 Flexible Pricing System
- **FREE** services (0 cost)
- **FIXED** pricing independent of duration
- **VARIABLE** pricing based on duration rules
- **HIDDEN** pricing not visible to clients
- **ON_DEMAND** pricing requires quote

### 📦 Package Deals
- **Multi-session packages** with discounted rates
- **Validity periods** for package expiration
- **Automatic calculation** of savings vs individual sessions

### 🔒 Advanced Permissions
- **Role-based access control** (Platform Admin, Business Owner, Staff, Client)
- **Business scoping** - users only see their business data
- **Service booking rules** - only public services can be booked online
    `,
    )
    .setVersion('3.0.0')
    .addTag('🔐 Authentication', 'Login, Register, Refresh, Logout operations')
    .addTag('👥 Users', 'User management and profile operations')
    .addTag('🔄 Password Reset', 'Password recovery and reset operations')
    .addTag(
      '🏢 Business Management',
      'Business creation, updates, and multi-location management',
    )
    .addTag(
      '� Business Sectors',
      'Industry categories and business classification',
    )
    .addTag(
      '👨‍💼 Staff Management',
      'Personnel management, roles, and staff scheduling',
    )
    .addTag(
      '💼 Services',
      'Service management with flexible pricing and packages',
    )
    .addTag(
      '📅 Appointments',
      'Appointment booking, scheduling, and management',
    )
    .addTag('📊 Calendars', 'Personal and business calendar management')
    .addTag('⏰ Business Hours', 'Working hours and availability management')
    .addTag('🏥 Health', 'System health checks and monitoring')
    .addCookieAuth('accessToken', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        '🔐 Access token stored in secure HttpOnly cookie (automatically handled by browser)',
    })
    .addCookieAuth('refreshToken', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        '🔄 Refresh token stored in secure HttpOnly cookie (automatically handled by browser)',
    })
    .addSecurity('JWT', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        '🔐 JWT Bearer token for API access (for testing only - production uses cookies)',
    })
    .addServer('http://localhost:3000', '🔧 Development server (local testing)')
    .addServer('https://api.yourdomain.com', '🚀 Production server')
    .addServer('https://staging-api.yourdomain.com', '🧪 Staging server')
    .setContact(
      'Development Team',
      'https://yourdomain.com/support',
      'dev-support@yourdomain.com',
    )
    .setLicense('Proprietary', 'https://yourdomain.com/license')
    .setExternalDoc(
      'Complete API Documentation',
      'https://docs.yourdomain.com/api',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      docExpansion: 'none', // Start collapsed for better UX
      persistAuthorization: true,
      displayOperationId: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3, // Show more model details
      defaultModelExpandDepth: 3,
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      onComplete: () => {
        console.log('📋 Swagger UI loaded successfully');
      },
      presets: [
        'SwaggerUIBundle.presets.apis',
        'SwaggerUIBundle.presets.standalone',
      ],
      layout: 'BaseLayout',
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: '🚀 Enterprise Authentication API - Developer Portal',
    customfavIcon: '/favicon.ico',
    customJs: [
      // Ajout de JavaScript personnalisé pour améliorer l'UX
      '/swagger-custom.js',
    ],
    customCssUrl: [
      // Ajout de CSS personnalisé pour le branding
      '/swagger-custom.css',
    ],
    customCss: `
      .swagger-ui .topbar {
        background-color: #1f2937;
        border-bottom: 3px solid #3b82f6;
      }
      .swagger-ui .topbar .download-url-wrapper .select-label {
        color: #ffffff;
      }
      .swagger-ui .info .title {
        color: #1f2937;
      }
      .swagger-ui .scheme-container {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;
        margin: 10px 0;
      }
      .swagger-ui .auth-wrapper {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 6px;
        padding: 15px;
        margin: 15px 0;
      }
      .swagger-ui .auth-wrapper h4 {
        color: #92400e;
        margin-bottom: 10px;
      }
      .swagger-ui .responses-inner {
        border-radius: 6px;
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #059669;
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #0ea5e9;
      }
      .swagger-ui .opblock.opblock-put {
        border-color: #dc2626;
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #dc2626;
      }
    `,
  });
}
