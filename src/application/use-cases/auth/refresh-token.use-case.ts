/**
 * 🔄 Refresh Token Use Case - Clean Architecture
 *
 * Rafraîchissement des tokens d'accès via le refresh token
 */

import { AppContextFactory } from '../../../shared/context/app-context';
import { InvalidCredentialsError } from '../../exceptions/auth.exceptions';
import type { AuthenticationService } from '../../ports/authentication.port';
import type { IConfigService } from '../../ports/config.port';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';

export interface RefreshTokenRequest {
  readonly refreshToken: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

export interface RefreshTokenResponse {
  readonly tokens: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
  };
  readonly cookieSettings: {
    readonly accessTokenMaxAge: number;
    readonly refreshTokenMaxAge: number;
    readonly isProduction: boolean;
  };
  readonly message: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // 📝 Contexte d'audit
    const context = AppContextFactory.create()
      .operation('RefreshToken')
      .clientInfo(request.ip || 'unknown', request.userAgent || 'unknown')
      .build();

    this.logger.info(this.i18n.t('operations.auth.token_refresh_attempt'), {
      context: context.correlationId,
    });

    try {
      // 1. ✅ Valider le refresh token
      if (!request.refreshToken) {
        this.logger.warn(this.i18n.t('operations.auth.no_refresh_token'), {
          context: context.correlationId,
        });
        throw new InvalidCredentialsError(
          this.i18n.t('errors.auth.no_refresh_token'),
        );
      }

      // 2. 🎫 Générer de nouveaux tokens
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = await this.authService.refreshTokens(request.refreshToken);

      // 3. 📊 Préparer les paramètres de cookies
      const cookieSettings = this.prepareCookieSettings();

      // 4. 📊 Audit de succès
      this.logger.info(this.i18n.t('operations.auth.token_refresh_success'), {
        context: context.correlationId,
      });

      // 5. 📤 Réponse avec nouveaux tokens et paramètres cookies
      return {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        },
        cookieSettings,
        message: this.i18n.t('success.auth.token_refreshed'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.auth.token_refresh_failed', {
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
  private prepareCookieSettings(): RefreshTokenResponse['cookieSettings'] {
    const accessTokenExpirationSeconds =
      this.configService.getAccessTokenExpirationTime(); // seconds
    const refreshTokenExpirationDays =
      this.configService.getRefreshTokenExpirationDays(); // days
    const isProduction = this.configService.isProduction();

    // Access Token Cookie: même durée que le JWT access token
    const accessTokenMaxAge = accessTokenExpirationSeconds * 1000; // seconds to milliseconds

    // Refresh Token Cookie: même durée que le JWT refresh token
    const refreshTokenMaxAge = refreshTokenExpirationDays * 24 * 60 * 60 * 1000; // days to milliseconds

    this.logger.debug(
      `Cookie settings prepared - AccessToken: ${accessTokenExpirationSeconds}s, RefreshToken: ${refreshTokenExpirationDays}days`,
      { operation: 'prepareCookieSettings' },
    );

    return {
      accessTokenMaxAge,
      refreshTokenMaxAge,
      isProduction,
    };
  }
}
