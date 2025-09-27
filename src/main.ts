/**
 * 🚀 Application Bootstrap - Fastify Edition
 *
 * Point d'entrée principal avec configuration complète Fastify:
 * - Plugins de sécurité (CORS, Helmet)
 * - Plugins de performance (Rate Limiting)
 * - Configuration adaptée à l'environnement
 * - Documentation Swagger (développement uniquement)
 */

import { AppConfigService } from '@infrastructure/config/app-config.service';
import { I18nValidationPipe } from '@infrastructure/validation/i18n-validation.pipe';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupSwagger } from '@presentation/config/swagger.config';
import { AppModule } from './app.module';

// 🚀 Fastify imports
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastify from 'fastify';

async function bootstrap(): Promise<void> {
  // 🚀 Create Fastify application with optimized configuration
  const fastifyInstance = fastify({
    logger: false,
    bodyLimit: 50 * 1024 * 1024,
    maxParamLength: 500,
    caseSensitive: true,
    ignoreTrailingSlash: false,
    // 🔧 Use process.env for initial Fastify setup, configService will be used later
    trustProxy: process.env.NODE_ENV === 'production',
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
    {
      bufferLogs: false,
      abortOnError: false,
    },
  );

  const logger = new Logger('Bootstrap');
  const configService = app.get(AppConfigService);

  logger.log('🛡️ Configuring enhanced security plugins...');

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: configService.isProduction() ? undefined : false,
    hsts: configService.isProduction()
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await app.register(fastifyCors, {
    origin: configService.getCorsOrigins(),
    credentials: configService.getCorsCredentials(),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
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
    maxAge: 86400,
    optionsSuccessStatus: 204,
  });

  logger.log('🍪 Configuring secure cookie parser...');
  await app.register(fastifyCookie, {
    secret: configService.getJwtSecret(),
    parseOptions: {
      httpOnly: true,
      secure: configService.isProduction(),
      sameSite: configService.isProduction() ? 'strict' : 'lax',
      path: '/',
    },
  });

  logger.log('📤 Configuring multipart file upload support...');
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 5, // Maximum 5 files per request
      fieldSize: 1024 * 1024, // 1MB max field size
      fields: 10, // Maximum 10 fields per request
    },
    attachFieldsToBody: true,
    sharedSchemaId: 'MultipartFileType',
  });

  logger.log('🚦 Configuring rate limiting...');
  await app.register(fastifyRateLimit, {
    max: configService.getRateLimitMax(),
    timeWindow: configService.getRateLimitWindowMs(),
    skipOnError: true,
    errorResponseBuilder: (_request: unknown, _context: unknown) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded, please try again later.',
    }),
  });

  logger.log('Configuring global settings...');
  app.useGlobalPipes(new I18nValidationPipe());

  // ✅ CORRECT - Utiliser seulement globalPrefix pour éviter double /v1/v1/
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/docs', '/api/docs'],
  });

  if (configService.isDevelopment()) {
    logger.log('Setting up Swagger documentation...');
    setupSwagger(app);
    logger.log(
      `📖 Swagger documentation available at http://${configService.getHost()}:${configService.getPort()}/api/docs`,
    );
  }

  const environment = configService.getEnvironment();
  const port = configService.getPort();
  const host = configService.getHost();

  logger.log(`🌍 Environment: ${environment}`);
  logger.log(`🚀 Platform: Fastify (High Performance)`);
  logger.log(`🔧 Configuration loaded successfully`);

  if (configService.isDevelopment()) {
    logger.log('📝 Development mode: Enhanced logging enabled');
    logger.log('🔓 Development mode: Relaxed security policies');
  }

  if (configService.isProduction()) {
    logger.log('🔒 Production mode: Security hardened');
    logger.log('⚡ Production mode: Performance optimized');
    logger.log('🚀 Production mode: Fastify performance boost enabled');
  }

  await app.listen(port, host);

  logger.log(`🚀 Application running on http://${host}:${port}`);
  logger.log(`🔗 API Base URL: http://${host}:${port}/api/v1`);
  logger.log(`💊 Health Check: http://${host}:${port}/health`);

  if (configService.isDevelopment()) {
    logger.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
  }

  logger.log('✅ Fastify application started successfully');
}

void bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application', error);
  process.exit(1);
});
