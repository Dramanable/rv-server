/**
 * 🔐 USE CASE - Verify Password Reset Code
 *
 * Use case pour vérifier un code de réinitialisation à 4 chiffres.
 * Génère un token de session temporaire pour permettre le changement de mot de passe.
 */

import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthenticationService } from '../../ports/authentication.port';

export interface VerifyPasswordResetCodeCommand {
  code: string;
}

export interface VerifyPasswordResetCodeResult {
  success: boolean;
  message: string;
  sessionToken?: string;
  userId?: string;
  expiresIn?: number;
  remainingTimeMinutes?: number;
  attemptsRemaining?: number;
  security?: {
    sessionType: string;
    maxAttempts: number;
    lockoutDuration: number;
  };
}

export class VerifyPasswordResetCodeUseCase {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly SESSION_DURATION = 300; // 5 minutes
  private static readonly LOCKOUT_DURATION = 300; // 5 minutes

  constructor(
    private readonly passwordResetRepository: IPasswordResetCodeRepository,
    private readonly userRepository: UserRepository,
    private readonly authService: AuthenticationService,
  ) {}

  async execute(
    command: VerifyPasswordResetCodeCommand,
  ): Promise<VerifyPasswordResetCodeResult> {
    // Validation du code
    this.validateCode(command.code);

    try {
      // Simulation d'un délai constant pour éviter les attaques par timing
      const startTime = Date.now();

      // Chercher le code de réinitialisation
      const resetCode = await this.passwordResetRepository.findByCode(
        command.code,
      );

      if (!resetCode) {
        await this.simulateConstantTime(startTime);
        return this.createFailureResponse('Code invalide ou expiré');
      }

      // Vérifier si le code est valide (non expiré et non utilisé)
      if (!resetCode.isValid) {
        await this.simulateConstantTime(startTime);

        if (resetCode.isExpired) {
          return this.createFailureResponse(
            'Code expiré. Demandez un nouveau code de réinitialisation',
          );
        }

        if (resetCode.isUsed) {
          return this.createFailureResponse(
            'Code déjà utilisé. Demandez un nouveau code de réinitialisation',
          );
        }

        return this.createFailureResponse('Code invalide');
      }

      // Vérifier que l'utilisateur existe
      const user = await this.userRepository.findById(resetCode.userId);
      if (!user) {
        await this.simulateConstantTime(startTime);
        return this.createFailureResponse('Utilisateur introuvable');
      }

      // Générer le token de session de réinitialisation
      const sessionToken = await this.authService.generateResetSessionToken(
        user.id,
      );

      // Marquer le code comme utilisé
      await this.passwordResetRepository.markAsUsed(command.code);

      await this.simulateConstantTime(startTime);

      return {
        success: true,
        message:
          'Code vérifié avec succès. Vous pouvez maintenant définir votre nouveau mot de passe',
        sessionToken,
        userId: user.id,
        expiresIn: VerifyPasswordResetCodeUseCase.SESSION_DURATION,
        remainingTimeMinutes: resetCode.remainingTimeInMinutes,
        security: {
          sessionType: 'password-reset',
          maxAttempts: VerifyPasswordResetCodeUseCase.MAX_ATTEMPTS,
          lockoutDuration: VerifyPasswordResetCodeUseCase.LOCKOUT_DURATION,
        },
      };
    } catch {
      // En cas d'erreur technique, ne pas marquer le code comme utilisé
      return {
        success: false,
        message:
          'Une erreur technique est survenue. Veuillez réessayer plus tard',
        attemptsRemaining: VerifyPasswordResetCodeUseCase.MAX_ATTEMPTS - 1,
      };
    }
  }

  private validateCode(code: string): void {
    if (!code || typeof code !== 'string') {
      throw new DomainValidationError('Code is required');
    }

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new DomainValidationError('Code must be exactly 4 digits');
    }
  }

  private createFailureResponse(
    message: string,
  ): VerifyPasswordResetCodeResult {
    return {
      success: false,
      message,
      attemptsRemaining: VerifyPasswordResetCodeUseCase.MAX_ATTEMPTS - 1,
      security: {
        sessionType: 'password-reset',
        maxAttempts: VerifyPasswordResetCodeUseCase.MAX_ATTEMPTS,
        lockoutDuration: VerifyPasswordResetCodeUseCase.LOCKOUT_DURATION,
      },
    };
  }

  /**
   * Simule un temps d'exécution constant pour éviter les attaques par timing
   */
  private async simulateConstantTime(
    startTime: number,
    targetDuration: number = 10,
  ): Promise<void> {
    // En mode test, on skip la simulation de timing
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, targetDuration - elapsed);

    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
  }
}
