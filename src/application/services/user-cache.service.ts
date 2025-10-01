/**
 * 💾 User Cache Service - Application Layer
 * ✅ Service pour stocker les utilisateurs en cache après connexion réussie
 * ✅ Clean Architecture - Pure Application Logic
 */

import type { IUserCache } from "../ports/user-cache.port";
import type { Logger } from "../ports/logger.port";
import type { I18nService } from "../ports/i18n.port";
import type { IConfigService } from "../ports/config.port";
import type { User } from "../../domain/entities/user.entity";

export interface StoreUserRequest {
  readonly user: User;
  readonly ttlMinutes?: number;
}

export interface StoreUserResponse {
  readonly success: boolean;
  readonly message: string;
  readonly cachedUntil?: Date;
}

export class UserCacheService {
  constructor(
    private readonly userCache: IUserCache,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly configService: IConfigService,
  ) {}

  async execute(request: StoreUserRequest): Promise<StoreUserResponse> {
    const { user, ttlMinutes } = request;
    const userId = user.id;

    // Utiliser TTL configuré si non spécifié
    const effectiveTTL =
      ttlMinutes ?? this.configService.getUserCacheRetentionMinutes();

    try {
      // 📝 Log de l'opération
      this.logger.info(this.i18n.translate("operations.cache.storing_user"), {
        userId,
        ttlMinutes: effectiveTTL,
      });

      // 💾 Stocker l'utilisateur en cache
      await this.userCache.storeUser(userId, user, effectiveTTL);

      // ⏰ Calculer la date d'expiration du cache
      const cachedUntil = new Date();
      cachedUntil.setMinutes(cachedUntil.getMinutes() + effectiveTTL);

      // 📝 Log de succès
      this.logger.info(this.i18n.translate("operations.cache.user_stored"), {
        userId,
        ttlMinutes: effectiveTTL,
        cachedUntil: cachedUntil.toISOString(),
      });

      return {
        success: true,
        message: this.i18n.translate("success.cache.user_stored"),
        cachedUntil,
      };
    } catch (error) {
      // 🚨 Log et propagation de l'erreur
      this.logger.error(
        this.i18n.translate("operations.cache.cache_error"),
        error instanceof Error ? error : new Error(String(error)),
        {
          userId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      );

      // Re-lancer l'erreur pour que le contrôleur puisse décider quoi faire
      throw error;
    }
  }
}
