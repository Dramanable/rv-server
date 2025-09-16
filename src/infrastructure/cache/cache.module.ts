/**
 * 🗄️ CACHE MODULE - Module Redis pour le cache
 */

import { Module } from '@nestjs/common';
import { SimpleCacheService } from '../services/simple-cache.service';
import { CookieService } from '../services/cookie.service';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TOKENS } from '../../shared/constants/injection-tokens';
import type { I18nService } from '../../application/ports/i18n.port';

/**
 * 🌍 Infrastructure I18n Service - Service I18n simplifié pour l'infrastructure
 */
class InfrastructureI18nService implements I18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      'infrastructure.cache.set_success': 'Cache SET successful',
      'infrastructure.cache.set_failed': 'Cache SET failed',
      'infrastructure.cache.get_attempt': 'Cache GET attempt',
      'infrastructure.cache.get_failed': 'Cache GET failed',
      'infrastructure.cache.delete_success': 'Cache DELETE successful',
      'infrastructure.cache.delete_failed': 'Cache DELETE failed',
      'infrastructure.cache.exists_success': 'Cache EXISTS successful',
      'infrastructure.cache.exists_failed': 'Cache EXISTS failed',
      'infrastructure.cache.pattern_delete_success':
        'Cache pattern DELETE successful',
      'infrastructure.cache.pattern_delete_failed':
        'Cache pattern DELETE failed',
      'infrastructure.cache.connection_established':
        'Redis connection established',
      'infrastructure.cache.connection_failed': 'Redis connection failed',
      'infrastructure.cache.connection_closed': 'Redis connection closed',
      'infrastructure.cache.connection_error': 'Redis connection error',
      'infrastructure.cache.reconnecting': 'Redis reconnecting',
      'infrastructure.cache.invalid_user_id':
        'Invalid user ID for cache invalidation',
      'infrastructure.cache.user_cache_invalidated':
        'User cache invalidated successfully',
      'infrastructure.cache.user_cache_invalidation_failed':
        'Failed to invalidate user cache',
      'infrastructure.session.create_attempt': 'Creating user session',
      'infrastructure.session.create_success': 'User session created',
      'infrastructure.session.create_failed': 'Failed to create user session',
      'infrastructure.session.get_attempt': 'Getting user session',
      'infrastructure.session.get_success': 'User session retrieved',
      'infrastructure.session.get_failed': 'Failed to get user session',
      'infrastructure.session.invalidate_attempt': 'Invalidating user session',
      'infrastructure.session.invalidate_success': 'User session invalidated',
      'infrastructure.session.invalidate_failed':
        'Failed to invalidate session',
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

  setDefaultLanguage(_language: string): void {
    // Infrastructure layer doesn't need language switching
  }

  exists(key: string): boolean {
    return key.startsWith('infrastructure.');
  }
}

@Module({
  imports: [
    // 📝 Module de logging global
    PinoLoggerModule,
  ],
  providers: [
    // 🌍 Service I18n pour l'infrastructure
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: InfrastructureI18nService,
    },
    // 🗄️ Service de cache simple
    {
      provide: TOKENS.CACHE_SERVICE,
      useClass: SimpleCacheService,
    },
    // 🍪 Service de gestion des cookies
    {
      provide: TOKENS.COOKIE_SERVICE,
      useClass: CookieService,
    },
  ],
  exports: [TOKENS.CACHE_SERVICE, TOKENS.COOKIE_SERVICE],
})
export class CacheModule {}
