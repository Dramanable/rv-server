/**
 * 🎯 Register Use Case - Clean Architecture
 * ✅ Pure Application Layer - SANS préoccupations HTTP/cookies
 *
 * Inscription d'un nouvel utilisateur avec génération automatique de tokens JWT
 * Auto-registration pour les clients avec rôle CLIENT par défaut
 */

import type { AuthenticationService } from '@application/ports/authentication.port';
import type { IConfigService } from '@application/ports/config.port';
import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';
import type { IPasswordHasher } from '@application/ports/password-hasher.port';
import type { UserCacheService } from '@application/services/user-cache.service';
import { User } from '@domain/entities/user.entity';
import { EmailAlreadyExistsError } from '@domain/exceptions/user.exceptions';
import type { UserRepository } from '@domain/repositories/user.repository.interface';
import { Email } from '@domain/value-objects/email.vo';
import { AppContextFactory } from '@shared/context/app-context';
import { UserRole } from '@shared/enums/user-role.enum';
import { randomUUID } from 'crypto';

export interface RegisterRequest {
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly ip?: string;
  readonly userAgent?: string;
}

export interface RegisterResponse {
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

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly authService: AuthenticationService,
    private readonly configService: IConfigService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly userCacheService: UserCacheService,
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    // 📝 Contexte d'audit
    const context = AppContextFactory.create()
      .operation('Register')
      .clientInfo(request.ip || 'unknown', request.userAgent || 'unknown')
      .build();

    this.logger.info(
      this.i18n.t('operations.auth.register_attempt', { email: request.email }),
      { context: context.correlationId },
    );

    try {
      // 1. ✅ Validation de l'email
      const email = Email.create(request.email);

      // 2. 🔍 Vérifier si l'utilisateur existe déjà
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        this.logger.warn(
          this.i18n.t('warnings.auth.email_already_exists', {
            email: request.email,
          }),
          { context: context.correlationId },
        );
        throw new EmailAlreadyExistsError(
          this.i18n.t('errors.auth.email_already_exists'),
        );
      }

      // 3. 🔐 Hacher le mot de passe
      const hashedPassword = await this.passwordHasher.hash(request.password);

      // 4. 👤 Créer le nouvel utilisateur (REGULAR_CLIENT par défaut pour l'auto-registration)
      const newUser = User.createWithHashedPassword(
        randomUUID(), // ID généré automatiquement
        email,
        request.name.trim(),
        UserRole.REGULAR_CLIENT, // Rôle par défaut pour auto-registration
        hashedPassword,
        new Date(), // createdAt
        new Date(), // updatedAt
        undefined, // username généré automatiquement
        true, // isActive par défaut
        false, // isVerified - nécessite vérification email
        false, // passwordChangeRequired
      );

      // 5. 💾 Sauvegarder l'utilisateur
      const savedUser = await this.userRepository.save(newUser);

      // 6. 🎫 Générer les tokens d'authentification
      const tokens = await this.authService.generateTokens(savedUser);

      // 7. 💾 Mettre en cache l'utilisateur
      await this.userCacheService.execute({ user: savedUser });

      // 8. 📊 Log de succès
      this.logger.info(
        this.i18n.t('operations.auth.register_success', {
          email: savedUser.email.value,
          userId: savedUser.id,
        }),
        { context: context.correlationId },
      );

      // 9. 📤 Retourner la réponse avec l'utilisateur et les tokens
      return {
        user: {
          id: savedUser.id,
          email: savedUser.email.value,
          name: savedUser.name,
          role: savedUser.role,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
        message: this.i18n.t('success.auth.register_successful'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.auth.register_failed', {
          email: request.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error instanceof Error ? error : undefined,
        { context: context.correlationId },
      );
      throw error;
    }
  }
}
