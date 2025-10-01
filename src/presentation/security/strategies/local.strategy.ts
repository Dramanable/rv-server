/**
 * 🔐 LOCAL STRATEGY - Presentation Layer Security Strategy
 *
 * Strategy qui fait UNIQUEMENT la validation technique (email + password)
 * La logique business complète reste dans AuthController + LoginUseCase
 * Couche présentation/sécurité - validation des credentials HTTP
 */

import { Injectable, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Request } from "express";
import { TOKENS } from "../../../shared/constants/injection-tokens";
import type { UserRepository } from "../../../domain/repositories/user.repository.interface";
import type { Logger } from "../../../application/ports/logger.port";
import { Email } from "../../../domain/value-objects/email.vo";

/**
 * 📋 Interface pour les données retournées par la strategy vers req.user
 */
export interface LocalStrategyResult {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.BCRYPT_PASSWORD_SERVICE)
    private readonly passwordService: {
      compare: (plain: string, hashed: string) => Promise<boolean>;
    },
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
  ) {
    // 📧 Configuration pour utiliser 'email' au lieu de 'username'
    super({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // Pour avoir accès à req dans validate()
    });
  }

  /**
   * 🔍 Validation technique des identifiants UNIQUEMENT
   *
   * Valide seulement les credentials (email + password)
   * AuthController fera le reste (tokens, audit, business logic via LoginUseCase)
   *
   * @param req - Request Express
   * @param email - Email de connexion
   * @param password - Mot de passe
   */
  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<LocalStrategyResult | null> {
    const context = {
      operation: "LocalStrategy.validate",
      email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      path: req.path,
    };

    this.logger.debug("Local strategy validation attempt", context);

    try {
      // 1. Validation format email (couche présentation)
      const emailVO = Email.create(email);

      // 2. Rechercher l'utilisateur
      const user = await this.userRepository.findByEmail(emailVO);
      if (!user) {
        this.logger.warn("Local strategy - user not found", {
          ...context,
          reason: "USER_NOT_FOUND",
        });
        return null; // Passport → 401 Unauthorized
      }

      // 3. Vérifier le mot de passe
      const isPasswordValid = await this.passwordService.compare(
        password,
        user.hashedPassword || "",
      );

      if (!isPasswordValid) {
        this.logger.warn("Local strategy - invalid password", {
          ...context,
          userId: user.id,
          reason: "INVALID_PASSWORD",
        });
        return null; // Passport → 401 Unauthorized
      }

      // 4. Succès - retourner les données utilisateur minimales
      this.logger.debug("Local strategy validation successful", {
        ...context,
        userId: user.id,
        userRole: user.role,
      });

      return {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };
    } catch (error) {
      // 🛡️ Toute erreur → 401 Unauthorized (sécurité)
      this.logger.error(
        "Local strategy validation error",
        error as Error,
        context,
      );
      return null;
    }
  }
}
