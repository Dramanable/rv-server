/**
 * 🔐 JWT Authentication Service - Implementation
 *
 * Service d'authentification utilisant JWT pour access/refresh tokens
 * Implémentation concrète pour la couche Infrastructure avec NestJS
 */

import {
  AuthenticationService,
  AuthTokens,
  TokenPayload,
} from "@application/ports/authentication.port";
import type { Logger } from "@application/ports/logger.port";
import { User } from "@domain/entities/user.entity";
import { Email } from "@domain/value-objects/email.vo";
import {
  AuthenticationServiceError,
  TokenGenerationError,
  TokenValidationError,
} from "@infrastructure/exceptions/infrastructure.exceptions";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TOKENS } from "@shared/constants/injection-tokens";

@Injectable()
export class JwtAuthenticationService implements AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
  ) {}

  async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email.getValue(),
      role: user.role,
    };

    const accessTokenExpiration = this.configService.get<number>(
      "ACCESS_TOKEN_EXPIRATION",
      3600,
    ); // seconds
    const refreshTokenExpirationDays = this.configService.get<number>(
      "REFRESH_TOKEN_EXPIRATION_DAYS",
      30,
    );

    try {
      // Générer l'access token (courte durée)
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: `${accessTokenExpiration}s`,
        issuer: this.configService.get<string>("JWT_ISSUER", "clean-arch-app"),
        audience: this.configService.get<string>(
          "JWT_AUDIENCE",
          "clean-arch-users",
        ),
      });

      // Générer le refresh token (longue durée)
      const refreshToken = this.jwtService.sign(
        { userId: user.id }, // Payload minimal pour refresh token
        {
          secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
          expiresIn: `${refreshTokenExpirationDays}d`,
          issuer: this.configService.get<string>(
            "JWT_ISSUER",
            "clean-arch-app",
          ),
          audience: this.configService.get<string>(
            "JWT_AUDIENCE",
            "clean-arch-users",
          ),
        },
      );

      this.logger.info(`Tokens generated for user: ${user.id}`);

      return Promise.resolve({
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiration,
      });
    } catch (error) {
      this.logger.error(
        `Failed to generate tokens for user ${user.id}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw new TokenGenerationError("access/refresh tokens", error);
    }
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        issuer: this.configService.get<string>("JWT_ISSUER", "clean-arch-app"),
        audience: this.configService.get<string>(
          "JWT_AUDIENCE",
          "clean-arch-users",
        ),
      });

      return payload;
    } catch (error) {
      this.logger.warn(
        `Invalid access token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw new TokenValidationError(
        "access token",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  async validateRefreshToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
        issuer: this.configService.get<string>("JWT_ISSUER", "clean-arch-app"),
        audience: this.configService.get<string>(
          "JWT_AUDIENCE",
          "clean-arch-users",
        ),
      });

      return payload;
    } catch (error) {
      this.logger.warn(
        `Invalid refresh token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw new TokenValidationError(
        "refresh token",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Valider le refresh token
      const payload = await this.validateRefreshToken(refreshToken);

      // Créer un objet User minimal pour générer de nouveaux tokens
      // Note: En production, vous devriez récupérer l'utilisateur complet depuis la DB
      const user = {
        id: payload.userId,
        email: Email.create(payload.email),
        role: payload.role,
        name: "Unknown",
        createdAt: new Date(),
        passwordChangeRequired: false,
      } as unknown as User;

      // Générer de nouveaux tokens
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error(
        `Failed to refresh tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw new AuthenticationServiceError("token refresh", error);
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    // Dans une implémentation complète, vous ajouteriez le token à une blacklist
    // ou le stockeriez dans une base de données avec un statut "révoqué"
    this.logger.info(`Refresh token revoked: ${token.substring(0, 10)}...`, {
      service: "JWT Auth Service",
    });

    // TODO: Implémenter la logique de révocation (blacklist, DB, etc.)
    // Pour le moment, on log simplement l'action
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Dans une implémentation complète, vous révoqueriez tous les tokens de l'utilisateur
    this.logger.info(`All tokens revoked for user: ${userId}`, {
      service: "JWT Auth Service",
    });

    // TODO: Implémenter la logique de révocation massive
    // Cela pourrait impliquer une mise à jour en base de données ou un incrément
    // d'un numéro de version des tokens pour l'utilisateur
  }

  async generateResetSessionToken(userId: string): Promise<string> {
    try {
      // Générer un token temporaire valide 5 minutes pour la réinitialisation
      const resetToken = `reset_${userId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      this.logger.info(`Generated reset session token for user: ${userId}`, {
        service: "JWT Auth Service",
      });

      return resetToken;
    } catch (error) {
      this.logger.error(
        `Failed to generate reset session token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw new TokenGenerationError("reset session token generation", error);
    }
  }

  async validateResetSessionToken(
    token: string,
  ): Promise<{ userId: string; valid: boolean }> {
    try {
      // Parser le token de format: reset_userId_timestamp_random
      const parts = token.split("_");

      if (parts.length !== 4 || parts[0] !== "reset") {
        return { userId: "", valid: false };
      }

      const userId = parts[1];
      const timestamp = parseInt(parts[2], 10);

      if (!userId || isNaN(timestamp)) {
        return { userId: "", valid: false };
      }

      // Vérifier l'expiration (5 minutes)
      const now = Date.now();
      const tokenAge = now - timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      const valid = tokenAge <= fiveMinutes;

      this.logger.info(
        `Reset session token validation result: ${valid} for user: ${userId}`,
        {
          service: "JWT Auth Service",
        },
      );

      return { userId, valid };
    } catch (error) {
      this.logger.error(
        `Failed to validate reset session token: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return { userId: "", valid: false };
    }
  }
}
