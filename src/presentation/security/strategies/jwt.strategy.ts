/**
 * 🔐 JWT STRATEGY - Presentation Layer Security Strategy
 *
 * Strategy Passport.js qui valide les tokens JWT et peuple req.user
 * Couche présentation/sécurité - configuration et extraction des tokens HTTP
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ICacheService } from '../../../application/ports/cache.port';
import type { IConfigService } from '../../../application/ports/config.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import { User } from '../../../domain/entities/user.entity';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { UserRole } from '../../../shared/enums/user-role.enum';

interface JwtPayload {
  sub: string; // User ID
  email: string; // User Email
  role: string; // User Role
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(TOKENS.CONFIG_SERVICE)
    private readonly configService: IConfigService,
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
      // 🍪 Extraction du token depuis les cookies sécurisés (couche présentation)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // 1. Priorité aux cookies sécurisés (production)
          const cookieToken = request?.cookies?.accessToken;
          if (cookieToken) {
            return cookieToken;
          }

          // 2. Fallback vers Authorization header (développement/tests)
          const authHeader = request?.headers?.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
          }

          // 3. Aucun token trouvé
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getAccessTokenSecret(),
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
      path: req.path,
    };

    this.logger.debug('JWT validation attempt', context);

    try {
      // 👤 Récupérer l'utilisateur avec cache (pattern optimisé)
      const user = await this.getUserWithCache(payload.sub);

      if (!user) {
        this.logger.warn('JWT validation failed - user not found', {
          ...context,
          email: payload.email,
        });
        throw new UnauthorizedException('User not found or account disabled');
      }

      // ✅ Vérification additionnelle de cohérence
      if (user.email.value !== payload.email) {
        this.logger.error(
          'JWT payload email mismatch',
          new Error('Token integrity violation'),
          {
            ...context,
            payloadEmail: payload.email,
            userEmail: user.email.value,
          },
        );
        throw new UnauthorizedException('Token integrity violation');
      }

      this.logger.debug('JWT validation successful', {
        ...context,
        userEmail: user.email.value,
        userRole: user.role,
      });

      // ✅ Retourner l'utilisateur (Passport l'injectera dans req.user)
      return user;
    } catch (error) {
      this.logger.error('JWT validation error', error as Error, context);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * 🎯 Récupère l'utilisateur avec cache Redis et fallback DB
   * Pattern Cache-Aside optimisé pour les requêtes fréquentes
   */
  private async getUserWithCache(userId: string): Promise<User | null> {
    const cacheKey = `auth:user:${userId}`;

    try {
      // 🔍 Vérifier le cache Redis d'abord (performance)
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
        const userJson = JSON.stringify({
          id: user.id,
          email: user.email.value,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt?.toISOString(),
          hashedPassword: user.hashedPassword,
          passwordChangeRequired: user.passwordChangeRequired,
        });

        await this.cacheService.set(cacheKey, userJson, 15 * 60);

        this.logger.debug('User cached from database (JWT Strategy)', {
          userId,
          operation: 'getUserWithCache',
        });
      }

      return user;
    } catch (cacheError) {
      // 🛡️ Si Redis est indisponible, fallback direct vers DB
      this.logger.warn('Cache unavailable, using database fallback (JWT)', {
        userId,
        operation: 'getUserWithCache',
        error: (cacheError as Error).message,
      });

      return this.userRepository.findById(userId);
    }
  }
}
