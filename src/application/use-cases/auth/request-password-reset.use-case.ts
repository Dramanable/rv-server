/**
 * 🔄 REQUEST PASSWORD RESET USE CASE - Application Layer
 *
 * Use case pour initier le processus de réinitialisation de mot de passe
 * avec envoi d'un code temporaire à 4 chiffres par email.
 *
 * WORKFLOW :
 * 1. Valider l'email fourni
 * 2. Générer un code temporaire à 4 chiffres
 * 3. Sauvegarder le code avec expiration (15 minutes)
 * 4. Envoyer le code par email
 *
 * SÉCURITÉ :
 * - Retourne toujours "succès" même si l'email n'existe pas (évite l'énumération)
 * - Code expire après 15 minutes
 * - Un seul code actif par utilisateur (invalide les précédents)
 */

import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { IEmailService } from '../../ports/email.port';
import { Email } from '../../../domain/value-objects/email.value-object';
import { PasswordResetCode } from '../../../domain/entities/password-reset-code.entity';
import { ValidationError } from '../../../domain/exceptions/domain.exceptions';

export interface RequestPasswordResetRequest {
  readonly email: string;
  readonly clientInfo?: {
    readonly ip?: string;
    readonly userAgent?: string;
  };
}

export interface RequestPasswordResetResponse {
  readonly success: boolean;
  readonly message: string;
  readonly messageKey: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetCodeRepository: IPasswordResetCodeRepository,
    private readonly emailService: IEmailService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> {
    const correlationId = `pwd-reset-${Date.now()}`;

    this.logger.info('🔄 Password reset requested', {
      correlationId,
      email: request.email,
      ip: request.clientInfo?.ip,
    });

    try {
      // 1. Valider le format de l'email
      const emailVO = Email.create(request.email);

      // 2. Vérifier si l'utilisateur existe
      const user = await this.userRepository.findByEmail(emailVO);

      if (!user) {
        this.logger.warn('🚫 Password reset requested for non-existent email', {
          correlationId,
          email: request.email,
        });

        // Retourner succès pour éviter l'énumération d'emails
        return {
          success: true,
          message: this.i18n.t('auth.password_reset.code_sent'),
          messageKey: 'auth.password_reset.code_sent',
        };
      }

      // 3. Invalider les anciens codes de cet utilisateur
      await this.resetCodeRepository.invalidateUserCodes(user.id.getValue());

      // 4. Générer un nouveau code à 4 chiffres
      const resetCode = PasswordResetCode.create(user.id.getValue());

      // 5. Sauvegarder le code
      await this.resetCodeRepository.save(resetCode);

      // 6. Envoyer l'email avec le code
      await this.emailService.sendPasswordResetEmail({
        userName: user.name,
        userEmail: user.email.getValue(),
        resetCode: resetCode.code,
        expirationTime: this.formatExpirationTime(resetCode.expiresAt),
        companyName: 'RV Project',
      });

      this.logger.info('✅ Password reset code sent successfully', {
        correlationId,
        userId: user.id.getValue(),
      });

      return {
        success: true,
        message: this.i18n.t('auth.password_reset.code_sent'),
        messageKey: 'auth.password_reset.code_sent',
      };
    } catch (error) {
      this.logger.error('❌ Password reset request failed', {
        correlationId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof ValidationError) {
        return {
          success: false,
          message: error.message,
          messageKey: 'validation.invalid_email',
        };
      }

      // En cas d'erreur technique, on retourne succès pour ne pas révéler l'information
      return {
        success: true,
        message: this.i18n.t('auth.password_reset.code_sent'),
        messageKey: 'auth.password_reset.code_sent',
      };
    }
  }

  private formatExpirationTime(expiresAt: Date): string {
    const now = new Date();
    const diffMinutes = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60),
    );

    return this.i18n.t('auth.password_reset.expires_in_minutes', {
      minutes: diffMinutes,
    });
  }
}
