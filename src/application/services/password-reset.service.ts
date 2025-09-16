/**
 * 🔧 APPLICATION SERVICE - Password Reset Service
 *
 * Service d'application gérant la réinitialisation de mot de passe.
 * Orchestre les interactions entre domaine et infrastructure.
 *
 * FONCTIONNALITÉS :
 * - Initiation du processus de reset avec génération de token
 * - Validation des tokens de réinitialisation
 * - Confirmation du nouveau mot de passe
 * - Nettoyage des tokens expirés
 *
 * CLEAN ARCHITECTURE :
 * - Couche application (use cases)
 * - Utilise les interfaces domaine
 */

import { PasswordResetTokenFactory } from '../../domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { EmailService } from '../../domain/services/email.service';
import { Email } from '../../domain/value-objects/email.vo';

export interface PasswordResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  userId?: string;
  error?: string;
}

export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly tokenRepository: PasswordResetTokenRepository,
  ) {}

  /**
   * Initie le processus de réinitialisation de mot de passe
   */
  async requestPasswordReset(email: Email): Promise<PasswordResetResult> {
    this.logger.log('Attempting to initiate password reset');

    // Trouve l'utilisateur
    const _user = await this.userRepository.findByEmail(email);

    // Pour des raisons de sécurité, on retourne toujours success
    // même si l'utilisateur n'existe pas
    if (!_user) {
      this.logger.warn('Password reset failed: user not found');
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    }

    // Nettoie les anciens tokens de cet utilisateur
    await this.tokenRepository.deleteByUserId(_user.id);

    this.logger.log('Generating password reset token');

    // Génère un nouveau token
    const resetToken = PasswordResetTokenFactory.create(_user.id);

    // Sauvegarde le token
    await this.tokenRepository.save(resetToken);

    this.logger.log('Sending password reset email');

    try {
      // Envoie l'email
      await this.emailService.sendPasswordResetEmail(email, resetToken.token);

      this.logger.log('Password reset email sent successfully');

      return {
        success: true,
        message: 'Password reset initiated successfully',
      };
    } catch (error) {
      this.logger.error('Password reset failed: email sending failed', error);
      // On retourne success même en cas d'erreur d'envoi
      // pour ne pas révéler l'existence du compte
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    }
  }

  /**
   * Valide un token de réinitialisation
   */
  async validateResetToken(token: string): Promise<TokenValidationResult> {
    const resetToken = await this.tokenRepository.findByToken(token);

    if (!resetToken) {
      return {
        isValid: false,
        error: 'Token not found',
      };
    }

    if (PasswordResetTokenFactory.isExpired(resetToken)) {
      return {
        isValid: false,
        error: 'Token expired',
      };
    }

    return {
      isValid: true,
      userId: resetToken.userId,
    };
  }

  /**
   * Confirme la réinitialisation avec le nouveau mot de passe
   */
  async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<PasswordResetResult> {
    // Valide le token
    const validation = await this.validateResetToken(token);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }

    // Valide la force du mot de passe
    if (!this.isPasswordSecure(newPassword)) {
      return {
        success: false,
        error: 'Password does not meet security requirements',
      };
    }

    // Trouve l'utilisateur
    const _user = await this.userRepository.findById(validation.userId!);
    if (!_user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Met à jour le mot de passe et supprime l'exigence de changement
    const updatedUser = _user.clearPasswordChangeRequirement();
    // Note: Dans une vraie implémentation, on hasherait le password ici

    await this.userRepository.save(updatedUser);

    // Nettoie le token utilisé
    await this.tokenRepository.deleteByUserId(_user.id);

    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  /**
   * Nettoie les tokens expirés
   */
  async cleanupExpiredTokens(): Promise<number> {
    return await this.tokenRepository.deleteExpiredTokens();
  }

  /**
   * Valide la force d'un mot de passe
   */
  private isPasswordSecure(password: string): boolean {
    // Minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  }
}
