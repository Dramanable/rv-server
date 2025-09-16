/**
 * 🔐 LocalStrategy - Passport.js Local Authentication (Clean Architecture)
 *
 * Strategy qui fait UNIQUEMENT la validation technique (email + password)
 * La logique business complète reste dans AuthController + LoginUseCase
 *
 * 🎯 Approche Clean Architecture :
 * - Strategy = Validation technique simple
 * - AuthController = Orchestration + appel LoginUseCase
 * - LoginUseCase = Logique business complète
 */

import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.vo';

/**
 * 📋 Interface pour les données retournées par la strategy vers req.user
 */
export interface LocalStrategyResult {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.BCRYPT_PASSWORD_SERVICE)
    private readonly passwordService: {
      compare: (plain: string, hashed: string) => Promise<boolean>;
    },
  ) {
    // 📧 Configuration pour utiliser 'email' au lieu de 'username'
    super({
      usernameField: 'email',
      passwordField: 'password',
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
    try {
      // 1. Validation format email
      const emailVO = Email.create(email);

      // 2. Rechercher l'utilisateur
      const user = await this.userRepository.findByEmail(emailVO);
      if (!user) {
        return null; // Passport → 401 Unauthorized
      }

      // 3. Vérifier le mot de passe
      const isPasswordValid = await this.passwordService.compare(
        password,
        user.hashedPassword || '',
      );

      if (!isPasswordValid) {
        return null; // Passport → 401 Unauthorized
      }

      // 4. Retourner UNIQUEMENT les données utilisateur
      // AuthController se chargera du reste via LoginUseCase
      return {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
      };
    } catch {
      // 🛡️ Toute erreur → 401 Unauthorized
      return null;
    }
  }
}
