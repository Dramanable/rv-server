/**
 * 🔐 Login Use Case - Clean Architecture
 *
 * Authentification utilisateur avec access/refresh tokens et cookies HttpOnly
 * Utilise les variables d'environnement et le logger standard NestJS
 */

import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IPasswordService } from '../../ports/password.service.interface';
import type { AuthenticationService } from '../../ports/authentication.port';
import type { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { IConfigService } from '../../ports/config.port';
import { InvalidCredentialsError } from '../../exceptions/auth.exceptions';
import { Email } from '../../../domain/value-objects/email.vo';
import { AppContextFactory } from '../../../shared/context/app-context';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
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
  readonly cookieSettings: {
    readonly accessTokenMaxAge: number;
    readonly refreshTokenMaxAge?: number;
    readonly isProduction: boolean;
  };
  readonly message: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: IPasswordService,
    private readonly authService: AuthenticationService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
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
          this.i18n.t('operations.auth.user_not_found', {
            email: request.email,
          }),
          { context: context.correlationId },
        );
        throw new InvalidCredentialsError(
          this.i18n.t('errors.auth.invalid_credentials'),
        );
      }

      // 2. 🔐 Vérifier le mot de passe
      const isPasswordValid = await this.passwordService.verify(
        request.password,
        user.hashedPassword || '',
      );

      if (!isPasswordValid) {
        this.logger.warn(
          this.i18n.t('operations.auth.invalid_password', { userId: user.id }),
          { context: context.correlationId },
        );
        throw new InvalidCredentialsError(
          this.i18n.t('errors.auth.invalid_credentials'),
        );
      }

      // 3. 🎫 Générer les tokens JWT
      const { accessToken, refreshToken, expiresIn } =
        await this.authService.generateTokens(user);

      // 4. 📊 Préparer les paramètres de cookies pour la couche Presentation
      const cookieSettings = this.prepareCookieSettings(request.rememberMe);

      // 5. 📊 Audit de succès
      this.logger.info(
        this.i18n.t('operations.auth.login_success', { userId: user.id }),
        { context: context.correlationId },
      );

      // 6. 📤 Réponse avec tokens et paramètres de cookies
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
        cookieSettings,
        message: this.i18n.t('success.auth.login_successful'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.auth.login_failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error instanceof Error ? error : undefined,
        { context: context.correlationId },
      );
      throw error;
    }
  }

  /**
   * 📊 Prépare les paramètres de cookies pour la couche Presentation
   * Les durées des cookies correspondent exactement aux durées des tokens JWT
   */
  private prepareCookieSettings(
    rememberMe?: boolean,
  ): LoginResponse['cookieSettings'] {
    const accessTokenExpirationSeconds =
      this.configService.getAccessTokenExpirationTime(); // seconds
    const refreshTokenExpirationDays =
      this.configService.getRefreshTokenExpirationDays(); // days
    const isProduction = this.configService.isProduction();

    // Access Token Cookie: même durée que le JWT access token
    const accessTokenMaxAge = accessTokenExpirationSeconds * 1000; // seconds to milliseconds

    // Refresh Token Cookie: même durée que le JWT refresh token (si rememberMe activé)
    // Si rememberMe = false, cookie de session (supprimé à la fermeture du navigateur)
    const refreshTokenMaxAge = rememberMe
      ? refreshTokenExpirationDays * 24 * 60 * 60 * 1000 // days to milliseconds
      : undefined; // Session cookie if not rememberMe

    this.logger.debug(
      `Cookie settings prepared - AccessToken: ${accessTokenExpirationSeconds}s, RefreshToken: ${refreshTokenMaxAge ? refreshTokenExpirationDays + 'days' : 'session'}`,
      { operation: 'prepareCookieSettings', rememberMe },
    );

    return {
      accessTokenMaxAge,
      refreshTokenMaxAge,
      isProduction,
    };
  }
}
