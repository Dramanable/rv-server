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
\`\`\`

### Making Authenticated Requests
\`\`\`javascript
const response = await fetch('/api/protected-endpoint', {
  credentials: 'include' // ✅ Automatically sends auth cookies
});
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

## 🔄 Automatic Token Refresh
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7-30 days** (depending on rememberMe)
- **Automatic rotation** prevents token replay attacks
- Frontend doesn't need to handle refresh logic

## 🚨 Error Handling
All endpoints return standardized error responses with:
- Clear error messages in multiple languages
- Appropriate HTTP status codes
- Rate limiting information when applicable
    `,
    )
    .setVersion('2.0.0')
    .addTag('Authentication', '🔐 Login, Register, Refresh, Logout operations')
    .addTag('Users', '👥 User management and profile operations')
    .addTag('Password Reset', '🔄 Password recovery and reset operations')
    .addTag('Business', '🏢 Business and location management')
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
