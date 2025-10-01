import { Inject, Injectable, Logger } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';

import { InvalidCachedDataError } from '@infrastructure/exceptions/infrastructure.exceptions';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';

// Interface temporaire pour éviter les erreurs d'import
interface ICacheService {
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  deletePattern(pattern: string): Promise<void>;
}

/**
 * 🧑‍💼 User Cache Service
 *
 * Service de cache pour les utilisateurs avec pattern Cache-Aside :
 * - Cache Redis pour éviter les appels DB répétés
 * - TTL configurable pour l'expiration
 * - Invalidation automatique lors des mises à jour
 * - Gestion des erreurs gracieuse (fallback vers DB)
 */
@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name);
  private readonly CACHE_PREFIX = 'user:';
  private readonly CACHE_TTL = 900; // 15 minutes en secondes

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CacheService')
    private readonly cacheService: ICacheService,
  ) {}

  /**
   * 🔍 Récupère un utilisateur (cache-first)
   * 1. Vérifier le cache Redis
   * 2. Si absent, récupérer de la DB et mettre en cache
   * 3. Si erreur cache, fallback vers DB directement
   */

  async findUserById(userId: string): Promise<User | null> {
    const cacheKey = this.getCacheKey(userId);

    try {
      // 1. Tentative de récupération depuis le cache
      const cachedUser = await this.getUserFromCache(cacheKey);
      if (cachedUser) {
        this.logger.debug(`User ${userId} found in cache`, {
          userId,
          source: 'cache',
        });
        return cachedUser;
      }

      // 2. Cache miss - récupération depuis la DB
      const userFromDb = await this.userRepository.findById(userId);

      if (userFromDb) {
        // 3. Mise en cache asynchrone (non-bloquante)
        this.cacheUserAsync(cacheKey, userFromDb);

        this.logger.debug(`User ${userId} loaded from database and cached`, {
          userId,
          source: 'database',
        });
      }

      return userFromDb;
    } catch (error) {
      this.logger.error(
        `Error retrieving user ${userId}, falling back to database`,
        error,
        { userId },
      );

      // Fallback : récupération directe depuis la DB en cas d'erreur cache
      return this.userRepository.findById(userId);
    }
  }

  /**
   * 🔄 Invalide le cache d'un utilisateur
   * Utilisé lors des mises à jour d'utilisateur
   */
  async invalidateUser(userId: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId);

    try {
      await this.cacheService.delete(cacheKey);

      this.logger.debug(`Cache invalidated for user ${userId}`, {
        userId,
        cacheKey,
      });
    } catch (error) {
      this.logger.warn(`Failed to invalidate cache for user ${userId}`, error, {
        userId,
        cacheKey,
      });
    }
  }

  /**
   * 🔄 Met à jour le cache d'un utilisateur
   * Utilisé après une modification d'utilisateur
   */
  async updateUserCache(user: User): Promise<void> {
    const cacheKey = this.getCacheKey(user.id);

    try {
      await this.cacheService.set(
        cacheKey,
        this.serializeUser(user),
        this.CACHE_TTL,
      );

      this.logger.debug(`Cache updated for user ${user.id}`, {
        userId: user.id,
        cacheKey,
      });
    } catch (error) {
      this.logger.warn(`Failed to update cache for user ${user.id}`, error, {
        userId: user.id,
        cacheKey,
      });
    }
  }

  /**
   * 📊 Pré-charge les utilisateurs actifs en cache
   * Utile pour les utilisateurs fréquemment accédés
   */
  async preloadActiveUsers(userIds: string[]): Promise<void> {
    const promises = userIds.map(async (userId) => {
      try {
        const user = await this.userRepository.findById(userId);
        if (user) {
          await this.updateUserCache(user);
        }
      } catch (error) {
        this.logger.warn(`Failed to preload user ${userId}`, error);
      }
    });

    await Promise.allSettled(promises);

    this.logger.log(`Preloaded ${userIds.length} users in cache`, {
      userCount: userIds.length,
    });
  }

  /**
   * 🔍 Récupère un utilisateur depuis le cache
   */

  private async getUserFromCache(cacheKey: string): Promise<User | null> {
    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        return this.deserializeUser(cachedData);
      }

      return null;
    } catch (error) {
      this.logger.warn(`Cache get failed for key ${cacheKey}`, error);
      return null;
    }
  }

  /**
   * 💾 Met en cache un utilisateur (asynchrone)
   */
  private cacheUserAsync(cacheKey: string, user: User): void {
    // Exécution asynchrone pour ne pas bloquer le thread principal
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setImmediate(async () => {
      try {
        await this.cacheService.set(
          cacheKey,
          this.serializeUser(user),
          this.CACHE_TTL,
        );
      } catch (error) {
        this.logger.warn(`Failed to cache user ${user.id}`, error);
      }
    });
  }

  /**
   * 🔑 Génère la clé de cache pour un utilisateur
   */
  private getCacheKey(userId: string): string {
    return `${this.CACHE_PREFIX}${userId}`;
  }

  /**
   * 📦 Sérialise un utilisateur pour le cache
   */
  private serializeUser(user: User): string {
    const userData = {
      id: user.id,
      email: user.email.getValue(),
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      hashedPassword: user.hashedPassword,
      passwordChangeRequired: user.passwordChangeRequired,
    };

    return JSON.stringify(userData);
  }

  /**
   * 📦 Désérialise un utilisateur depuis le cache
   */
  private deserializeUser(cachedData: string): User {
    try {
      const userData = JSON.parse(cachedData);

      // Reconstruction de l'entité User depuis les données cachées
      return User.restore(
        userData.id,
        userData.email,
        userData.name,
        userData.role,
        new Date(userData.createdAt),
        userData.updatedAt ? new Date(userData.updatedAt) : undefined,
        userData.hashedPassword,
        userData.passwordChangeRequired,
      );
    } catch (error) {
      this.logger.error('Failed to deserialize user from cache', error);
      throw new InvalidCachedDataError(
        'user',
        'Failed to deserialize user from cache',
      );
    }
  }
}
