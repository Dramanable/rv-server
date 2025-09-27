/**
 * 🚪 Logout Use Case - Clean Architecture
 *
 * Déconnexion utilisateur avec révocation des tokens et nettoyage des cookies
 */

import type { AuthenticationService } from "../../ports/authentication.port";
import type { Logger } from "../../ports/logger.port";
import type { I18nService } from "../../ports/i18n.port";
import type { IConfigService } from "../../ports/config.port";
import { AppContextFactory } from "../../../shared/context/app-context";

export interface LogoutRequest {
  readonly refreshToken?: string;
  readonly userId?: string;
  readonly ip?: string;
  readonly userAgent?: string;
  readonly logoutAllDevices?: boolean;
}

export interface LogoutResponse {
  readonly cookieSettings: {
    readonly isProduction: boolean;
  };
  readonly message: string;
}

export class LogoutUseCase {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: LogoutRequest): Promise<LogoutResponse> {
    // 📝 Contexte d'audit
    const context = AppContextFactory.create()
      .operation("Logout")
      .clientInfo(request.ip || "unknown", request.userAgent || "unknown")
      .build();

    this.logger.info(this.i18n.t("operations.auth.logout_attempt"), {
      context: context.correlationId,
    });

    try {
      // 1. �️ Révoquer les tokens si disponibles
      if (request.refreshToken) {
        if (request.logoutAllDevices && request.userId) {
          // Révoquer tous les tokens de l'utilisateur
          await this.authService.revokeAllUserTokens(request.userId);
          this.logger.info(
            this.i18n.t("operations.auth.all_tokens_revoked", {
              userId: request.userId,
            }),
            { context: context.correlationId },
          );
        } else {
          // Révoquer seulement le token actuel
          await this.authService.revokeRefreshToken(request.refreshToken);
          this.logger.info(
            this.i18n.t("operations.auth.current_token_revoked"),
            { context: context.correlationId },
          );
        }
      }

      // 2. 📊 Audit de succès
      this.logger.info(this.i18n.t("operations.auth.logout_success"), {
        context: context.correlationId,
      });

      // 3. 📤 Réponse avec paramètres pour nettoyer les cookies
      return {
        cookieSettings: {
          isProduction: this.configService.isProduction(),
        },
        message: this.i18n.t("success.auth.logout_successful"),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t("operations.auth.logout_error", {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        error instanceof Error ? error : undefined,
        { context: context.correlationId },
      );

      // On retourne quand même un succès pour la sécurité
      return {
        cookieSettings: {
          isProduction: this.configService.isProduction(),
        },
        message: this.i18n.t("success.auth.logout_successful"),
      };
    }
  }
}
