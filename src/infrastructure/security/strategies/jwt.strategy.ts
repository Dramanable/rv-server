/**
 * 🔐 JWT STRATEGY - Passport.js JWT Strategy with Clean Architecture
 *
 * Strategy Passport.js qui valide les tokens JWT et peuple req.user
 * Compatible avec le système d'authentification existant
 */

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../shared/enums/user-role.enum';
import type { UserRepository } from "../../../domain/repositories/user.repository.interface";
import type { ICacheService } from '../../../application/ports/cache.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { TOKENS } from '../../../shared/constants/injection-tokens';

interface JwtPayload {
  sub: string; // User ID
  email: string; // User Email
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {
    super({
      // 🍪 Extraction du token depuis les cookies (compatible avec le système existant)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.access_token;
          if (!token) {
            // Fallback vers Authorization header si pas de cookie
            return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
      passReqToCallback: true,
    } as any);
  }

  /**
   * 🎯 Validation du payload JWT et récupération de l'utilisateur
   * Cette méthode est appelée automatiquement par Passport après décodage du JWT
   */
  async validate(req: Request, payload: JwtPayload): Promise<User> {
    const context = {
      operation: 'JwtStrategy.validate',
      userId: payload.sub,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };

    this.logger.debug(this.i18n.t('auth.jwt_validation_attempt'), context);

    try {
      // 👤 Récupérer l'utilisateur avec cache Redis (même pattern que GlobalAuthGuard)
      const user = await this.getUserWithCache(payload.sub);

      if (!user) {
        this.logger.warn(this.i18n.t('auth.user_not_found'), {
          ...context,
          email: payload.email,
        });
        throw new UnauthorizedException(this.i18n.t('auth.user_not_found'));
      }

      this.logger.info(this.i18n.t('auth.jwt_validation_success'), {
        ...context,
        userEmail: user.email.value,
        userRole: user.role,
      });

      // ✅ Retourner l'utilisateur (Passport l'injectera automatiquement dans req.user)
      return user;
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.jwt_validation_failed'),
        error as Error,
        context,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }
  }

  /**
   * 🎯 Récupère l'utilisateur avec cache Redis et fallback DB
   * Pattern Cache-Aside identique au GlobalAuthGuard pour cohérence
   */
  private async getUserWithCache(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}:auth`;

    try {
      // 🔍 Vérifier le cache Redis d'abord
      const cachedUserJson = await this.cacheService.get(cacheKey);

      if (cachedUserJson) {
        this.logger.debug('User found in cache (JWT Strategy)', {
          userId,
          operation: 'getUserWithCache',
        });
        // 🔄 Reconstruire l'objet User depuis le cache JSON
        const userData = JSON.parse(cachedUserJson) as {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          createdAt: string;
          updatedAt?: string;
          hashedPassword?: string;
          passwordChangeRequired?: boolean;
        };
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
      }

      // 🗄️ Fallback vers la base de données
      const user = await this.userRepository.findById(userId);

      if (user) {
        // 💾 Mettre en cache pour les prochaines requêtes (TTL: 15 minutes)
        await this.cacheService.set(cacheKey, JSON.stringify(user), 15 * 60);

        this.logger.debug('User cached from database (JWT Strategy)', {
          userId,
          operation: 'getUserWithCache',
        });
      }

      return user;
    } catch (cacheError) {
      // 🛡️ Si Redis est indisponible, fallback direct vers DB
      this.logger.warn('Cache unavailable, falling back to database (JWT)', {
        userId,
        operation: 'getUserWithCache',
        error: (cacheError as Error).message,
      });

      return this.userRepository.findById(userId);
    }
  }
}
