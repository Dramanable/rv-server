/**
 * 🚀 Application Bootstrap
 *
 * Point d'entrée principal avec configuration complète:
 * - Middlewares de sécurité (CORS, Helmet)
 * - Middlewares de performance (Compression)
 * - Configuration adaptée à l'environnement
 * - Documentation Swagger (développement uniquement)
 */

import { AppConfigService } from '@infrastructure/config/app-config.service';
import { I18nValidationPipe } from '@infrastructure/validation/i18n-validation.pipe';
import { Logger } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupSwagger } from '@presentation/config/swagger.config';
import { GlobalExceptionFilter } from '@presentation/filters/global-exception.filter';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
// 🛡️ Security imports

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // 🔧 Configuration Service
  const configService = app.get(AppConfigService);

  // �️ Security Middlewares - Couche Présentation
  logger.log('🛡️ Configuring enhanced security middlewares...');

  // 🛡️ Custom Security Headers Middleware (PREMIER)
  // Security middleware configuré via app module
  // app.use(new SecurityHeadersMiddleware().use);

  // CORS Configuration (sécurisé)
  app.enableCors({
    origin: configService.getCorsOrigins(),
    credentials: configService.getCorsCredentials(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Pagination', 'X-RateLimit-Remaining'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 204,
  });

  // Helmet for additional security headers (complément)
  app.use(
    helmet({
      contentSecurityPolicy: configService.isProduction() ? undefined : false, // CSP en prod seulement
      hsts: configService.isProduction(), // HSTS en prod seulement
      crossOriginEmbedderPolicy: false, // Compatible avec Swagger
    }),
  );

  // 🍪 Cookie Parser - CRITICAL pour JWT authentication via cookies
  logger.log('🍪 Configuring secure cookie parser...');
  app.use(cookieParser(configService.getJwtSecret())); // Signer les cookies avec JWT secret

  // ⚡ Performance Middlewares
  logger.log('Configuring performance middlewares...');

  // Compression
  app.use(compression(configService.getCompressionConfig()));

  // Body parser limits
  const bodyConfig = configService.getBodyParserConfig() as {
    json?: Record<string, unknown>;
    urlencoded?: Record<string, unknown>;
  };
  app.useBodyParser('json', bodyConfig.json || {});
  app.useBodyParser('urlencoded', bodyConfig.urlencoded || {});

  // 🎯 Global Configuration
  logger.log('Configuring global settings...');

  // Global exception filter with detailed error logging
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  // Global validation pipe with i18n
  app.useGlobalPipes(new I18nValidationPipe());

  // Trust proxy (pour les déploiements derrière un proxy)
  if (configService.isProduction()) {
    app.set('trust proxy', 1);
  }

  // Global prefix pour l'API
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs', '/api/docs'],
  });

  // 📖 Swagger Documentation (Development Only)
  if (configService.isDevelopment()) {
    logger.log('Setting up Swagger documentation...');
    setupSwagger(app);
    logger.log(
      `📖 Swagger documentation available at http://${configService.getHost()}:${configService.getPort()}/api/docs`,
    );
  }

  // 🎯 Environment-specific configuration
  const environment = configService.getEnvironment();
  const port = configService.getPort();
  const host = configService.getHost();

  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🔧 Configuration loaded successfully`);

  if (configService.isDevelopment()) {
    logger.log('📝 Development mode: Enhanced logging enabled');
    logger.log('🔓 Development mode: Relaxed security policies');
  }

  if (configService.isProduction()) {
    logger.log('🔒 Production mode: Security hardened');
    logger.log('⚡ Production mode: Performance optimized');
  }

  // 🚀 Start Server
  await app.listen(port, host);

  logger.log(`🚀 Application running on http://${host}:${port}`);
  logger.log(`🔗 API Base URL: http://${host}:${port}/api/v1`);
  logger.log(`💊 Health Check: http://${host}:${port}/health`);

  if (configService.isDevelopment()) {
    logger.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
  }

  logger.log('✅ Application started successfully');
}

void bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application', error);
  process.exit(1);
});
