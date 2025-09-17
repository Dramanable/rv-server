/**
 * 🔐 Login Use Case - Clean Architecture
 * ✅ Pure Application Layer - SANS préoccupations HTTP/cookies
 * 
 * Authentification utilisateur avec génération de tokens JWT
 * La gestion des cookies se fait dans la couche Presentation
 */

import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '../../ports/password-hasher.port'; // ✅ NOUVEAU: Port Clean Architecture
import type { AuthenticationService } from '../../ports/authentication.port';
import type { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { IConfigService } from '../../ports/config.port';
import type { UserCacheService } from '../../services/user-cache.service';
import { InvalidCredentialsError, UserNotFoundError, AuthenticationFailedError } from '../../exceptions/auth.exceptions';
import { Email } from '../../../domain/value-objects/email.vo';
import { AppContextFactory } from '../../../shared/context/app-context';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

export interface LoginResponse {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly role: string;
  };
  readonly tokens: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
  };
  readonly message: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher, // ✅ NOUVEAU: Utilise le port Clean Architecture
    private readonly authService: AuthenticationService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly userCacheService: UserCacheService, // ✅ NOUVEAU: Service de cache utilisateur
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // 📝 Contexte d'audit
    const context = AppContextFactory.create()
      .operation('Login')
      .clientInfo(request.ip || 'unknown', request.userAgent || 'unknown')
      .build();

    this.logger.info(
      this.i18n.t('operations.auth.login_attempt', { email: request.email }),
      { context: context.correlationId },
    );

    try {
      // 1. 🔍 Rechercher l'utilisateur par email
      const email = Email.create(request.email);
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        this.logger.warn(
          this.i18n.translate('operations.auth.user_not_found', {
            email: request.email,
          }),
          { context: context.correlationId },
        );
        throw new UserNotFoundError(
          this.i18n.translate('errors.auth.user_not_found'),
        );
      }

      // 2. 🔐 Vérifier le mot de passe avec le port IPasswordHasher
      const isPasswordValid = await this.passwordHasher.verify(
        request.password,
        user.hashedPassword || '',
      );

      if (!isPasswordValid) {
        this.logger.warn(
          this.i18n.translate('operations.auth.invalid_password', { userId: user.id }),
          { context: context.correlationId },
        );
        throw new AuthenticationFailedError(
          this.i18n.translate('errors.auth.invalid_credentials'),
        );
      }

      // 3. 🎫 Générer les tokens JWT
      const { accessToken, refreshToken, expiresIn } =
        await this.authService.generateTokens(user);

      // 4. � Stocker l'utilisateur en cache Redis pour les requêtes futures
      try {
        await this.userCacheService.execute({ user });
        this.logger.info(
          this.i18n.translate('operations.auth.user_cached'),
          { userId: user.id, context: context.correlationId },
        );
      } catch (error) {
        // ⚠️ Le cache n'est pas critique - on log mais on continue
        this.logger.warn(
          this.i18n.translate('warnings.auth.user_cache_failed'),
          { 
            userId: user.id, 
            error: error instanceof Error ? error.message : 'Unknown error',
            context: context.correlationId,
          },
        );
      }

      // 5. �📊 Audit de succès
      this.logger.info(
        this.i18n.translate('operations.auth.login_success', { userId: user.id }),
        { context: context.correlationId },
      );

      // 5. 📤 Réponse PURE Application (sans détails HTTP/cookies)
      return {
        user: {
          id: user.id,
          email: user.email.value,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
        },
        message: this.i18n.translate('success.auth.login_successful'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.translate('operations.auth.login_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error instanceof Error ? error : undefined,
        { context: context.correlationId },
      );
      throw error;
    }
  }


}
