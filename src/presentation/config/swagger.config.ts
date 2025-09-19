/**
 * 📚 SWAGGER CONFIGURATION - Presentation Layer Documentation
 *
 * Configuration complète de la documentation API Swagger
 * Orientée développeurs frontend avec exemples détaillés
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('🚀 Enterprise Authentication API')
    .setDescription(
      `
# 🎯 Clean Architecture Authentication System

## 🔐 Security-First Approach
This API implements **enterprise-grade authentication** with:
- **JWT tokens** in secure HttpOnly cookies
- **Rate limiting** to prevent brute force attacks
- **Token rotation** for enhanced security
- **CORS protection** and security headers
- **Input validation** and sanitization

## 🍪 Cookie-Based Authentication
**Important for Frontend Developers:**
- All JWT tokens are stored in **secure HttpOnly cookies**
- No need to handle tokens manually in JavaScript
- Cookies are automatically sent with each request
- Use \`credentials: 'include'\` in fetch requests

## 📱 Frontend Integration Guide

### Login Example
\`\`\`javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ✅ REQUIRED for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    rememberMe: false
  })
});

if (response.ok) {
  const data = await response.json();
  console.log('User logged in:', data.user);
  // Tokens are automatically stored in secure cookies
}
\`\`\`

### Making Authenticated Requests
\`\`\`javascript
const response = await fetch('/api/protected-endpoint', {
  credentials: 'include' // ✅ Automatically sends auth cookies
});

if (response.status === 401) {
  // Token expired, try refresh or redirect to login
  await refreshToken();
}
\`\`\`

### Registration with Auto-Login
\`\`\`javascript
const response = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'newuser@example.com',
    name: 'John Doe',
    password: 'SecurePass123!'
  })
});
// User is automatically logged in after registration
\`\`\`

### Token Refresh
\`\`\`javascript
const refreshToken = async () => {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    credentials: 'include', // Refresh token from cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}) // Empty body
  });

  if (response.ok) {
    console.log('Tokens refreshed successfully');
    return true;
  }

  // Refresh failed, redirect to login
  window.location.href = '/login';
  return false;
};
\`\`\`

### Logout
\`\`\`javascript
const logout = async (logoutAllDevices = false) => {
  const response = await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logoutAllDevices })
  });

  if (response.ok) {
    // All cookies cleared, user logged out
    window.location.href = '/login';
  }
};
\`\`\`

## 🔄 Automatic Token Refresh
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7-30 days** (depending on rememberMe)
- **Automatic rotation** prevents token replay attacks
- Frontend doesn't need to handle refresh logic manually

## 🚨 Error Handling
All endpoints return standardized error responses:

\`\`\`javascript
{
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "statusCode": 400,
  "action": "SUGGESTED_ACTION" // LOGIN_REQUIRED, REFRESH_TOKEN, etc.
}
\`\`\``,
    )
    .setVersion('2.0.0')
    .addTag('Authentication', '🔐 Login, Register, Refresh, Logout operations')
    .addTag('Users', '👥 User management and profile operations')
    .addTag('Password Reset', '🔄 Password recovery and reset operations')
    .addTag('Business', '🏢 Business and location management')
    .addTag('Health', '💚 System health and monitoring endpoints')

    // 🍪 Cookie-based authentication (production)
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

    // 🔑 Bearer token auth (development/testing only)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description:
          '🔐 JWT Bearer token for API testing (use cookies in production)',
        in: 'header',
      },
      'JWT',
    )

    // 🌍 Servers
    .addServer('http://localhost:3000', '🔧 Development server (local testing)')
    .addServer('https://api.yourdomain.com', '🚀 Production server')
    .addServer('https://staging-api.yourdomain.com', '🧪 Staging server')

    // 📞 Contact & License
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

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    ignoreGlobalPrefix: false,
  });

  // 🎨 Enhanced Swagger UI setup
  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      docExpansion: 'none', // Start collapsed for better UX
      persistAuthorization: true,
      displayOperationId: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tryItOutEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      syntaxHighlight: {
        activated: true,
        theme: 'agate',
      },
    },
    customSiteTitle: '🚀 Enterprise Authentication API - Developer Portal',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-bottom: 3px solid #3b82f6;
      }
      .swagger-ui .topbar .download-url-wrapper .select-label,
      .swagger-ui .topbar .download-url-wrapper .download-url-input {
        color: #ffffff;
      }
      .swagger-ui .info .title {
        color: #1f2937;
        font-size: 2.5rem;
        font-weight: 700;
      }
      .swagger-ui .info .description {
        font-size: 1.1rem;
        line-height: 1.6;
      }
      .swagger-ui .scheme-container {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .swagger-ui .auth-wrapper {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .swagger-ui .auth-wrapper h4 {
        color: #92400e;
        margin-bottom: 15px;
        font-weight: 600;
      }
      .swagger-ui .opblock.opblock-post {
        border-color: #059669;
        background: rgba(5, 150, 105, 0.1);
      }
      .swagger-ui .opblock.opblock-get {
        border-color: #0ea5e9;
        background: rgba(14, 165, 233, 0.1);
      }
      .swagger-ui .opblock.opblock-put {
        border-color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }
      .swagger-ui .opblock.opblock-delete {
        border-color: #dc2626;
        background: rgba(220, 38, 38, 0.1);
      }
      .swagger-ui .opblock .opblock-summary {
        cursor: pointer;
        padding: 15px;
      }
      .swagger-ui .responses-inner {
        border-radius: 8px;
        overflow: hidden;
      }
      .swagger-ui .parameter__name {
        font-weight: 600;
      }
      .swagger-ui .parameter__type {
        color: #6366f1;
        font-weight: 500;
      }
      .swagger-ui .response-col_status {
        font-weight: 600;
      }
      .swagger-ui table thead tr td,
      .swagger-ui table thead tr th {
        background: #f8fafc;
        font-weight: 600;
      }
      /* Cookie security notice */
      .swagger-ui .auth-container .auth-wrapper:first-child::before {
        content: "🍪 Production uses secure HttpOnly cookies automatically sent by browser";
        display: block;
        background: #dbeafe;
        color: #1e40af;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 15px;
        font-weight: 500;
        border: 1px solid #3b82f6;
      }
    `,
  });

  // 📊 Log setup completion
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  📚 Swagger UI Documentation Available                   ║
║  🔗 URL: http://localhost:3000/api/docs                  ║
║  🎯 Optimized for Frontend Developers                   ║
║  🍪 Cookie-based Authentication Examples                ║
╚══════════════════════════════════════════════════════════╝
  `);
}
