/**
 * 🔐 USE CASE - Request Password Reset
 *
 * Use case pour demander la réinitialisation de mot de passe avec code à 4 chiffres.
 * Implémentation TDD basée sur les tests définis.
 */

import { PasswordResetCode } from '../../../domain/entities/password-reset-code.entity';
import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.vo';
import { IEmailService, PasswordResetEmailData } from '../../ports/email.port';

export interface RequestPasswordResetCommand {
  email: string;
}

export interface RequestPasswordResetResult {
  success: boolean;
  message: string;
}

export class RequestPasswordResetUseCase {
  constructor(
    private readonly passwordResetRepository: IPasswordResetCodeRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    // Validation de l'email
    this.validateEmail(command.email);

    try {
      // Chercher l'utilisateur par email
      const emailVO = Email.create(command.email);
      const user = await this.userRepository.findByEmail(emailVO);

      if (!user) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        return {
          success: true,
          message:
            'Si cette adresse email existe dans notre système, vous recevrez un code de réinitialisation dans quelques minutes.',
        };
      }

      // Invalider tous les codes existants pour cet utilisateur
      await this.passwordResetRepository.invalidateUserCodes(user.id);

      // Créer un nouveau code de réinitialisation
      const resetCode = PasswordResetCode.create(user.id);

      // Préparer les données de l'email
      const emailData: PasswordResetEmailData = {
        userName: user.firstName || user.name?.split(' ')[0] || 'Utilisateur',
        resetCode: resetCode.code,
        expirationTime: '15 minutes',
        companyName: process.env.COMPANY_NAME || 'Notre équipe',
      };

      // Envoyer l'email avec le code
      const emailResult =
        await this.emailService.sendPasswordResetEmail(emailData);

      if (!emailResult.success) {
        throw new Error('Failed to send email');
      }

      // Sauvegarder le code seulement si l'email a été envoyé avec succès
      await this.passwordResetRepository.save(resetCode);

      return {
        success: true,
        message:
          'Un code de réinitialisation à 4 chiffres a été envoyé à votre adresse email. Il expire dans 15 minutes.',
      };
    } catch {
      // En cas d'erreur technique (email, db, etc.), on renvoie une erreur
      return {
        success: false,
        message:
          'Une erreur technique est survenue. Veuillez réessayer plus tard.',
      };
    }
  }

  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new DomainValidationError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainValidationError('Invalid email format');
    }
  }
}
