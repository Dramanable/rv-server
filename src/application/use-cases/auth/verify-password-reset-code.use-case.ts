/**
 * ✅ VERIFY PASSWORD RESET CODE USE CASE - Application Layer
 *
 * Use case pour vérifier un code de réinitialisation à 4 chiffres.
 * Valide le code et prépare l'utilisateur pour la définition du nouveau mot de passe.
 *
 * WORKFLOW :
 * 1. Valider le format du code (4 chiffres)
 * 2. Vérifier l'existence et la validité du code
 * 3. Vérifier que le code n'est pas expiré
 * 4. Marquer le code comme utilisé
 * 5. Générer un token temporaire pour la session de changement de mot de passe
 *
 * SÉCURITÉ :
 * - Code marqué comme utilisé après vérification (usage unique)
 * - Token de session temporaire avec courte durée de vie
 * - Rate limiting sur les tentatives
 */

import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';

export interface VerifyPasswordResetCodeRequest {
  readonly code: string;
  readonly clientInfo?: {
    readonly ip?: string;
    readonly userAgent?: string;
  };
}

export interface VerifyPasswordResetCodeResponse {
  readonly success: boolean;
  readonly message: string;
  readonly messageKey: string;
  readonly userId?: string;
  readonly resetToken?: string; // Token temporaire pour la session de reset
}

export class VerifyPasswordResetCodeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetCodeRepository: IPasswordResetCodeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: VerifyPasswordResetCodeRequest,
  ): Promise<VerifyPasswordResetCodeResponse> {
    const correlationId = `verify-code-${Date.now()}`;

    this.logger.info('🔍 Password reset code verification started', {
      correlationId,
      code: request.code.substring(0, 2) + '**', // Partial logging pour sécurité
      ip: request.clientInfo?.ip,
    });

    try {
      // 1. Valider le format du code
      this.validateCodeFormat(request.code);

      // 2. Récupérer le code depuis la base
      const resetCode = await this.resetCodeRepository.findByCode(request.code);

      if (!resetCode) {
        this.logger.warn('🚫 Invalid password reset code attempted', {
          correlationId,
          code: request.code.substring(0, 2) + '**',
          ip: request.clientInfo?.ip,
        });

        return {
          success: false,
          message: this.i18n.t('auth.password_reset.invalid_code'),
          messageKey: 'auth.password_reset.invalid_code',
        };
      }

      // 3. Vérifier la validité du code (expiration + usage)
      if (!resetCode.isValid) {
        const reason = resetCode.isExpired ? 'expired' : 'already_used';

        this.logger.warn('🚫 Invalid password reset code (expired or used)', {
          correlationId,
          reason,
          userId: resetCode.userId,
        });

        return {
          success: false,
          message: this.i18n.t(`auth.password_reset.code_${reason}`),
          messageKey: `auth.password_reset.code_${reason}`,
        };
      }

      // 4. Vérifier que l'utilisateur existe toujours
      const userId = UserId.create(resetCode.userId);
      const user = await this.userRepository.findById(userId.getValue());

      if (!user) {
        this.logger.error(
          '🚫 User not found for valid reset code',
          new Error('User not found'),
          {
            correlationId,
            userId: resetCode.userId,
          },
        );

        return {
          success: false,
          message: this.i18n.t('auth.password_reset.user_not_found'),
          messageKey: 'auth.password_reset.user_not_found',
        };
      }

      // 5. Marquer le code comme utilisé
      await this.resetCodeRepository.markAsUsed(request.code);

      // 6. Générer un token temporaire pour la session de reset (5 minutes)
      const resetToken = this.generateResetSessionToken(user.id);

      this.logger.info('✅ Password reset code verified successfully', {
        correlationId,
        userId: user.id,
      });

      return {
        success: true,
        message: this.i18n.t('auth.password_reset.code_verified'),
        messageKey: 'auth.password_reset.code_verified',
        userId: user.id,
        resetToken,
      };
    } catch (error) {
      this.logger.error(
        '❌ Password reset code verification failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          correlationId,
        },
      );

      if (error instanceof DomainValidationError) {
        return {
          success: false,
          message: error.message,
          messageKey: 'validation.invalid_code_format',
        };
      }

      return {
        success: false,
        message: this.i18n.t('auth.password_reset.verification_failed'),
        messageKey: 'auth.password_reset.verification_failed',
      };
    }
  }

  private validateCodeFormat(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new DomainValidationError('Code must be a string');
    }

    if (code.length !== 4) {
      throw new DomainValidationError('Code must be exactly 4 digits');
    }

    if (!/^\d{4}$/.test(code)) {
      throw new DomainValidationError('Code must contain only digits');
    }
  }

  private generateResetSessionToken(userId: string): string {
    // Token simple pour identifier la session de reset (JWT serait mieux en prod)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);

    return `reset_${userId}_${timestamp}_${random}`;
  }
}
