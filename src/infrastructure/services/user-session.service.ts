/**
 * 👤 USER SESSION SERVICE - Service pour la gestion des sessions utilisateur Redis
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ICacheService } from '../../application/ports/cache.port';
import { IUserSessionService } from '../../application/ports/user-session.port';
import type { Logger } from '../../application/ports/logger.port';
import type { I18nService } from '../../application/ports/i18n.port';
import { User } from '../../domain/entities/user.entity';
import {
  CacheException,
  CacheOperationException,
} from '../../application/exceptions/cache.exceptions';
import { TOKENS } from '../../shared/constants/injection-tokens';

// Temporary exceptions for compilation
class UserSessionException extends CacheException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

class UserSessionNotFoundError extends CacheException {
  constructor(userId: string) {
    super(`User session not found: ${userId}`, { userId });
  }
}

@Injectable()
export class UserSessionService implements IUserSessionService {
  private readonly sessionTtl: number;
  private readonly sessionKeyPrefix = 'user_session:';

  constructor(
    @Inject(TOKENS.CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    private readonly configService: ConfigService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {
    this.sessionTtl = this.configService.get<number>(
      'USER_SESSION_TTL_SECONDS',
      3600, // 1 heure par défaut
    );
  }

  async storeUserSession(userId: string, user: User): Promise<void> {
    try {
      const sessionKey = this.getSessionKey(userId);
      const userData = this.serializeUser(user);

      await this.cacheService.set(sessionKey, userData, this.sessionTtl);

      this.logger.info(this.i18n.t('infrastructure.session.user_stored'), {
        userId,
        ttl: this.sessionTtl,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.store_failed'),
        error as Error,
        { userId },
      );
      throw new UserSessionException(
        `Failed to store user session for user: ${userId}`,
        { userId },
      );
    }
  }

  async getUserSession(userId: string): Promise<User | null> {
    try {
      const sessionKey = this.getSessionKey(userId);
      const userData = await this.cacheService.get(sessionKey);

      if (!userData) {
        this.logger.debug(this.i18n.t('infrastructure.session.not_found'), {
          userId,
        });
        return null;
      }

      const user = this.deserializeUser(userData);

      this.logger.debug(this.i18n.t('infrastructure.session.user_retrieved'), {
        userId,
        email: user.email,
      });

      return user;
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.retrieve_failed'),
        error as Error,
        { userId },
      );
      throw new UserSessionException(
        `Failed to retrieve user session for user: ${userId}`,
        { userId },
      );
    }
  }

  async removeUserSession(userId: string): Promise<void> {
    try {
      const sessionKey = this.getSessionKey(userId);
      await this.cacheService.delete(sessionKey);

      this.logger.info(this.i18n.t('infrastructure.session.user_removed'), {
        userId,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.remove_failed'),
        error as Error,
        { userId },
      );
      throw new UserSessionException(
        `Failed to remove user session for user: ${userId}`,
        { userId },
      );
    }
  }

  async removeAllUserSessions(userId: string): Promise<void> {
    try {
      const pattern = `${this.sessionKeyPrefix}${userId}:*`;
      await this.cacheService.deletePattern(pattern);

      this.logger.info(
        this.i18n.t('infrastructure.session.all_sessions_removed'),
        { userId },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.remove_all_failed'),
        error as Error,
        { userId },
      );
      throw new UserSessionException(
        `Failed to remove all sessions for user: ${userId}`,
        { userId },
      );
    }
  }

  async hasUserSession(userId: string): Promise<boolean> {
    try {
      const sessionKey = this.getSessionKey(userId);
      return await this.cacheService.exists(sessionKey);
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.exists_check_failed'),
        error as Error,
        { userId },
      );
      return false;
    }
  }

  async refreshUserSession(userId: string): Promise<void> {
    try {
      const user = await this.getUserSession(userId);

      if (!user) {
        throw new UserSessionNotFoundError(userId);
      }

      await this.storeUserSession(userId, user);

      this.logger.debug(this.i18n.t('infrastructure.session.refreshed'), {
        userId,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.session.refresh_failed'),
        error as Error,
        { userId },
      );

      if (error instanceof UserSessionNotFoundError) {
        throw error;
      }

      throw new UserSessionException(
        `Failed to refresh user session for user: ${userId}`,
        { userId },
      );
    }
  }

  /**
   * 🔑 Génère la clé de session Redis
   */
  private getSessionKey(userId: string): string {
    return `${this.sessionKeyPrefix}${userId}`;
  }

  /**
   * 📦 Sérialise l'utilisateur en JSON
   */
  private serializeUser(user: User): string {
    return JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
    });
  }

  /**
   * 📤 Désérialise l'utilisateur depuis JSON
   */
  private deserializeUser(userData: string): User {
    try {
      const data = JSON.parse(userData);

      // Recréer l'utilisateur avec les données désérialisées
      return User.restore(
        data.id,
        data.email,
        data.name,
        data.role,
        new Date(data.createdAt),
        new Date(data.updatedAt),
      );
    } catch (error) {
      throw new UserSessionException('Failed to deserialize user data', {
        userData,
      });
    }
  }
}
