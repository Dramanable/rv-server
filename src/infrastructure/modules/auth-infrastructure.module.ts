/**
 * 🏗️ Auth Infrastructure Module
 *
 * Module NestJS qui configure l'infrastructure d'authentification
 * Provides les implémentations concrètes des ports
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Infrastructure Services
import { JwtAuthenticationService } from '../services/jwt-authentication.service';
import { BcryptPasswordService } from '../services/bcrypt-password.service';
import { BcryptPasswordHasher } from '../services/bcrypt-password-hasher.service'; // ✅ NOUVEAU: Clean Architecture
import { NestJsConfigServiceAdapter } from '../config/nestjs-config.adapter';

// Application Ports
import { AuthenticationService } from '../../application/ports/authentication.port';
import { IPasswordService } from '../../application/ports/password.service.interface';
import { IPasswordHasher } from '../../application/ports/password-hasher.port'; // ✅ NOUVEAU: Clean Architecture
import { IConfigService } from '../../application/ports/config.port';
import { Logger } from '../../application/ports/logger.port';
import { I18nService } from '../../application/ports/i18n.port';
import { UserCacheService } from '../../application/services/user-cache.service'; // ✅ NOUVEAU: Service de cache

// Use Cases
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';

// Repositories
import { UserRepository } from '../../domain/repositories/user.repository.interface';

// Shared Constants
import { TOKENS } from '../../shared/constants/injection-tokens';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('ACCESS_TOKEN_EXPIRATION', 3600)}s`,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    // Config Service Adapter
    {
      provide: TOKENS.APP_CONFIG,
      useClass: NestJsConfigServiceAdapter,
    },

    // Authentication Service
    {
      provide: TOKENS.AUTH_SERVICE,
      useClass: JwtAuthenticationService,
    },

    // Password Service
    {
      provide: TOKENS.PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },

    // Password Hasher Service ✅ NOUVEAU: Clean Architecture
    {
      provide: TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    // Logger Service (using NestJS Logger)
    {
      provide: TOKENS.LOGGER,
      useFactory: () => ({
        info: (message: string, context?: any) => console.log(message, context),
        warn: (message: string, context?: any) =>
          console.warn(message, context),
        error: (message: string, error?: Error, context?: any) =>
          console.error(message, error, context),
        debug: (message: string, context?: any) =>
          console.debug(message, context),
      }),
    },

    // I18n Service (mock implementation for now)
    {
      provide: TOKENS.I18N_SERVICE,
      useFactory: () => ({
        t: (key: string, params?: any) => key, // Simple mock
        translate: (key: string, params?: any) => key,
        setDefaultLanguage: (lang: string) => {},
        exists: (key: string) => true,
      }),
    },

    // Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useFactory: (
        userRepository: UserRepository,
        passwordHasher: IPasswordHasher, // ✅ NOUVEAU: Port Clean Architecture
        authService: AuthenticationService,
        configService: IConfigService,
        logger: Logger,
        i18n: I18nService,
        userCacheService: UserCacheService, // ✅ NOUVEAU: Service de cache utilisateur
      ) =>
        new LoginUseCase(
          userRepository,
          passwordHasher, // ✅ NOUVEAU: Utilise le port IPasswordHasher
          authService,
          configService,
          logger,
          i18n,
          userCacheService, // ✅ NOUVEAU: Service de cache utilisateur
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER, // ✅ NOUVEAU: Utilise le port Clean Architecture
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE, // ✅ NOUVEAU: Service de cache utilisateur
      ],
    },

    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useFactory: (
        authService: AuthenticationService,
        configService: IConfigService,
        logger: Logger,
        i18n: I18nService,
      ) => new RefreshTokenUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useFactory: (
        authService: AuthenticationService,
        configService: IConfigService,
        logger: Logger,
        i18n: I18nService,
      ) => new LogoutUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
  ],
  exports: [
    TOKENS.LOGIN_USE_CASE,
    TOKENS.REFRESH_TOKEN_USE_CASE,
    TOKENS.LOGOUT_USE_CASE,
    TOKENS.AUTH_SERVICE,
    TOKENS.PASSWORD_SERVICE,
    TOKENS.APP_CONFIG,
  ],
})
export class AuthInfrastructureModule {}
