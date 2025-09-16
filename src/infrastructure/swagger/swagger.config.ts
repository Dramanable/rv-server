import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription(
      'Clean Architecture User Management System with comprehensive features',
    )
    .setVersion('1.0.0')
    .addTag('users', 'User management operations')
    .addTag('auth', 'Authentication and authorization')
    .addTag('password-reset', 'Password reset operations')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for authentication',
      },
      'api-key',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.example.com', 'Production server')
    .setContact(
      'Support Team',
      'https://example.com/support',
      'support@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('API Documentation', 'https://docs.example.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      docExpansion: 'list',
      persistAuthorization: true,
      displayOperationId: false,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'User Management API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [],
    customCssUrl: [],
  });
}
