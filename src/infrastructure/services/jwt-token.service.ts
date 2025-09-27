/**
 * JwtTokenService - Service JWT pour génération et vérification des tokens
 */

import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import type { I18nService } from "../../application/ports/i18n.port";
import type { Logger } from "../../application/ports/logger.port";
import { TOKENS } from "../../shared/constants/injection-tokens";

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  generateAccessToken(
    userId: string,
    email: string,
    role: string,
    secret: string,
    expiresIn: number,
  ): string {
    const context = {
      operation: "GENERATE_ACCESS_TOKEN",
      timestamp: new Date().toISOString(),
      userId,
    };

    this.logger.info(
      this.i18n.t("operations.token.generate_access_attempt"),
      context,
    );

    try {
      const payload = {
        sub: userId,
        email,
      };

      const token = this.jwtService.sign(payload, {
        secret,
        expiresIn,
      });

      this.logger.info(
        this.i18n.t("operations.token.generate_access_success"),
        { ...context, expiresIn },
      );

      return token;
    } catch (error) {
      this.logger.error(
        this.i18n.t("errors.token.generate_access_failed"),
        error as Error,
        context,
      );
      throw error;
    }
  }

  generateRefreshToken(): string {
    const context = {
      operation: "generateRefreshToken",
    };

    this.logger.info(
      this.i18n.t("operations.token.generate_refresh_attempt"),
      context,
    );

    const token = randomBytes(64).toString("base64url");

    this.logger.info(
      this.i18n.t("operations.token.generate_refresh_success"),
      context,
    );

    return token;
  }

  verifyToken(token: string, secret: string): JwtPayload {
    const context = {
      operation: "VERIFY_TOKEN",
      timestamp: new Date().toISOString(),
    };

    this.logger.info(this.i18n.t("operations.token.verify_attempt"), context);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, { secret });

      this.logger.info(this.i18n.t("operations.token.verify_success"), {
        ...context,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        userId: payload.sub,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return payload;
    } catch (error) {
      this.logger.warn(this.i18n.t("warnings.token.verify_failed"), {
        ...context,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
