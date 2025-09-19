/**
 * 🏗️ INFRASTRUCTURE MODULE - Simplified Configuration
 * ✅ Clean Architecture compliant
 * ✅ Simple setup for unit tests focus
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { I18nService } from '../application/ports/i18n.port';

// Import du nouveau module simple
import { DatabaseModule } from './database/database.module';
import { MappersModule } from './mappers/mappers.module';
import { TOKENS } from '../shared/constants/injection-tokens';
import { AppConfigService } from './config/app-config.service';
import { MockEmailService } from './email/mock-email.service';
import { PinoLoggerModule } from './logging/pino-logger.module';
import { MockPasswordGenerator } from './services/mock-password-generator.service';
import { BcryptPasswordService } from './services/bcrypt-password.service';
import { JwtTokenService } from './services/jwt-token.service';
import { CacheModule } from './cache/cache.module';

class InfrastructureI18nService implements I18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      'operations.refresh_token.lookup_attempt': 'Looking up refresh token',
      'operations.refresh_token.lookup_success':
        'Refresh token found successfully',
      'operations.refresh_token.save_attempt': 'Saving refresh token',
      'operations.refresh_token.save_success':
        'Refresh token saved successfully',
      'operations.refresh_token.find_by_token_attempt': 'Finding token by hash',
      'operations.refresh_token.find_by_token_success': 'Token found by hash',
      'operations.login.attempt': 'User login attempt',
      'operations.login.success': 'User login successful',
      'operations.login.user_cached': 'User cached in Redis after login',
      'warnings.refresh_token.token_not_found': 'Refresh token not found',
      'warnings.login.user_not_found': 'User not found during login',
      'warnings.login.invalid_password': 'Invalid password during login',
      'warnings.login.token_revocation_failed':
        'Failed to revoke old tokens during login',
      'warnings.login.user_cache_failed':
        'Failed to cache user in Redis after login',
      'errors.refresh_token.lookup_failed': 'Failed to lookup refresh token',
      'errors.refresh_token.save_failed': 'Failed to save refresh token',
      'errors.refresh_token.find_by_token_failed':
        'Failed to find token by hash',
      'errors.login.user_lookup_failed': 'Failed to lookup user during login',
      'errors.login.invalid_credentials': 'Invalid credentials provided',
      'errors.login.token_save_failed': 'Failed to save refresh token',
      'errors.login.unexpected_error': 'Unexpected error during login',
    };

    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  }

  translate(key: string, params?: Record<string, unknown>): string {
    return this.t(key, params);
  }

  setDefaultLanguage(): void {
    // Mock implementation
  }

  exists(): boolean {
    return true; // Mock - always exists
  }
}

@Module({
  imports: [
    // Module simple
    DatabaseModule,
    MappersModule,

    // Modules existants
    CacheModule,
    JwtModule.registerAsync({
      global: true,
      imports: [
        // Assurer que AppConfigService est disponible
        {
          module: class ConfigModule {},
          providers: [AppConfigService],
          exports: [AppConfigService],
        }
      ],
      useFactory: (config: AppConfigService) => ({
        secret: config.getJwtSecret(),
        signOptions: { expiresIn: `${config.getAccessTokenExpirationTime()}m` },
      }),
      inject: [AppConfigService],
    }),
    PinoLoggerModule,
  ],
  providers: [
    { provide: TOKENS.JWT_TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: TOKENS.TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: TOKENS.PASSWORD_SERVICE, useClass: BcryptPasswordService },
    {
      provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    { provide: TOKENS.EMAIL_SERVICE, useClass: MockEmailService },
    { provide: TOKENS.PASSWORD_GENERATOR, useClass: MockPasswordGenerator },
    AppConfigService,
    { provide: TOKENS.APP_CONFIG, useClass: AppConfigService },
    { provide: TOKENS.CONFIG_SERVICE, useClass: AppConfigService },
    { provide: TOKENS.I18N_SERVICE, useClass: InfrastructureI18nService },
  ],
  exports: [
    DatabaseModule, // ✅ Exports USER_REPOSITORY from database module
    MappersModule, // ✅ Exports domain mappers
    CacheModule, // ✅ Exporte le cache module (inclut USER_CACHE et CACHE_SERVICE)
    PinoLoggerModule, // ✅ Exports PINO_LOGGER
    TOKENS.JWT_TOKEN_SERVICE,
    TOKENS.PASSWORD_SERVICE,
    TOKENS.BCRYPT_PASSWORD_SERVICE, // ✅ Export BcryptPasswordService for strategies
    TOKENS.EMAIL_SERVICE,
    TOKENS.PASSWORD_GENERATOR,
    TOKENS.CONFIG_SERVICE,
    TOKENS.I18N_SERVICE,
    AppConfigService,
  ],
})
export class InfrastructureModule {}
