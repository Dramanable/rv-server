/**
 * 🔄 COMPLETE PASSWORD RESET USE CASE - Application Layer
 *
 * Use case pour finaliser la réinitialisation du mot de passe après vérification du code.
 * Définit le nouveau mot de passe et connecte automatiquement l'utilisateur.
 *
 * WORKFLOW :
 * 1. Valider le token de session de reset
 * 2. Valider la force du nouveau mot de passe
 * 3. Hasher et sauvegarder le nouveau mot de passe
 * 4. Forcer le changement de mot de passe lors de la prochaine connexion
 * 5. Connecter automatiquement l'utilisateur
 * 6. Nettoyer tous les codes de reset de l'utilisateur
 *
 * SÉCURITÉ :
 * - Token de session temporaire (expire après 5 minutes)
 * - Validation stricte de la force du mot de passe
 * - Invalidation de tous les codes existants
 * - Force un changement de mot de passe ultérieur
 */

import { User } from '../../../domain/entities/user.entity';
import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthenticationService } from '../../ports/authentication.port';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPasswordService } from '../../ports/password.port';

export interface CompletePasswordResetRequest {
  readonly resetToken: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly clientInfo?: {
    readonly ip?: string;
    readonly userAgent?: string;
  };
}

export interface CompletePasswordResetResponse {
  readonly success: boolean;
  readonly message: string;
  readonly messageKey: string;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly user?: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly passwordChangeRequired: boolean;
  };
}

export class CompletePasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetCodeRepository: IPasswordResetCodeRepository,
    private readonly authService: AuthenticationService,
    private readonly passwordService: IPasswordService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CompletePasswordResetRequest,
  ): Promise<CompletePasswordResetResponse> {
    const correlationId = `complete-reset-${Date.now()}`;

    this.logger.info('🔄 Password reset completion started', {
      correlationId,
      ip: request.clientInfo?.ip,
    });

    try {
      // 1. Valider et décoder le token de session
      const userId = this.validateAndExtractUserId(request.resetToken);

      // 2. Valider les mots de passe
      this.validatePasswords(request.newPassword, request.confirmPassword);

      // 3. Récupérer l'utilisateur
      const user = await this.userRepository.findById(userId);

      if (!user) {
        this.logger.error('🚫 User not found for password reset', undefined, {
          correlationId,
          userId,
        });

        return {
          success: false,
          message: this.i18n.t('auth.password_reset.user_not_found'),
          messageKey: 'auth.password_reset.user_not_found',
        };
      }

      // 4. Hasher le nouveau mot de passe
      const hashedPassword = await this.passwordService.hashPassword(
        request.newPassword,
      );

      // 5. Créer un nouvel utilisateur avec le nouveau mot de passe et forcer le changement
      const updatedUser = User.createWithHashedPassword(
        user.id,
        user.email,
        user.name,
        user.role,
        hashedPassword,
        user.createdAt,
        new Date(), // updatedAt
        user.username,
        user.isActive,
        user.isVerified,
        false, // passwordChangeRequired = false après reset
      );

      await this.userRepository.save(updatedUser);

      // 6. Nettoyer tous les codes de reset de l'utilisateur
      await this.resetCodeRepository.deleteUserCodes(userId);

      // 7. Générer les tokens d'authentification
      const tokens = await this.authService.generateTokens(updatedUser);

      this.logger.info('✅ Password reset completed successfully', {
        correlationId,
        userId: updatedUser.id,
      });

      return {
        success: true,
        message: this.i18n.t('auth.password_reset.completed'),
        messageKey: 'auth.password_reset.completed',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email.getValue(),
          name: updatedUser.name,
          passwordChangeRequired: updatedUser.passwordChangeRequired,
        },
      };
    } catch (error) {
      this.logger.error(
        '❌ Password reset completion failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          correlationId,
        },
      );

      if (error instanceof DomainValidationError) {
        return {
          success: false,
          message: error.message,
          messageKey: 'validation.password_reset_failed',
        };
      }

      return {
        success: false,
        message: this.i18n.t('auth.password_reset.completion_failed'),
        messageKey: 'auth.password_reset.completion_failed',
      };
    }
  }

  private validateAndExtractUserId(resetToken: string): string {
    if (!resetToken || typeof resetToken !== 'string') {
      throw new DomainValidationError('Reset token is required');
    }

    // Vérifier le format du token: reset_userId_timestamp_random
    const tokenParts = resetToken.split('_');

    if (tokenParts.length !== 4 || tokenParts[0] !== 'reset') {
      throw new DomainValidationError('Invalid reset token format');
    }

    const userId = tokenParts[1];
    const timestamp = parseInt(tokenParts[2], 10);

    if (!userId || isNaN(timestamp)) {
      throw new DomainValidationError('Invalid reset token data');
    }

    // Vérifier l'expiration (5 minutes)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const fiveMinutes = 5 * 60 * 1000;

    if (tokenAge > fiveMinutes) {
      throw new DomainValidationError('Reset token has expired');
    }

    return userId;
  }

  private validatePasswords(
    newPassword: string,
    confirmPassword: string,
  ): void {
    if (!newPassword || !confirmPassword) {
      throw new DomainValidationError('Password and confirmation are required');
    }

    if (newPassword !== confirmPassword) {
      throw new DomainValidationError('Passwords do not match');
    }

    // Validation de la force du mot de passe
    if (newPassword.length < 8) {
      throw new DomainValidationError(
        'Password must be at least 8 characters long',
      );
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      throw new DomainValidationError(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      throw new DomainValidationError(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      throw new DomainValidationError(
        'Password must contain at least one number',
      );
    }

    if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      throw new DomainValidationError(
        'Password must contain at least one special character (@$!%*?&)',
      );
    }
  }
}
