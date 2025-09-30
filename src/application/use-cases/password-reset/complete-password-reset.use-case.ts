/**
 * 🔐 USE CASE - Complete Password Reset
 *
 * Use case pour finaliser la réinitialisation de mot de passe.
 * Valide le token de session, vérifie la force du mot de passe,
 * met à jour l'utilisateur et génère de nouveaux tokens d'authentification.
 */

import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { AuthenticationService } from '../../ports/authentication.port';
import { IPasswordService } from '../../ports/password.port';

export interface CompletePasswordResetCommand {
  sessionToken: string;
  newPassword: string;
}

export interface CompletePasswordResetResult {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  passwordChangeRequired?: boolean;
  passwordErrors?: string[];
}

export class CompletePasswordResetUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthenticationService,
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(
    command: CompletePasswordResetCommand,
  ): Promise<CompletePasswordResetResult> {
    // Validation des inputs
    this.validateInput(command);

    try {
      // Valider le token de session de réinitialisation
      const tokenValidation = await this.authService.validateResetSessionToken(
        command.sessionToken,
      );

      if (!tokenValidation.valid || !tokenValidation.userId) {
        return {
          success: false,
          message:
            'Session invalide ou expirée. Veuillez recommencer la procédure de réinitialisation',
        };
      }

      // Trouver l'utilisateur
      const user = await this.userRepository.findById(tokenValidation.userId);
      if (!user) {
        return {
          success: false,
          message: 'Utilisateur introuvable',
        };
      }

      // Valider la force du mot de passe
      const passwordValidation =
        await this.passwordService.validatePasswordStrength(
          command.newPassword,
        );
      if (!passwordValidation.valid) {
        return {
          success: false,
          message:
            'Mot de passe trop faible. Veuillez choisir un mot de passe plus sécurisé',
          passwordErrors: passwordValidation.errors,
        };
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await this.passwordService.hashPassword(
        command.newPassword,
      );

      // Mettre à jour l'utilisateur avec le nouveau mot de passe
      // Note: Cette logique dépend de votre implémentation d'entité User
      // Pour l'instant, on suppose que l'entité User a une méthode pour changer le mot de passe
      const updatedUser = await this.updateUserPassword(user, hashedPassword);

      // Générer de nouveaux tokens d'authentification
      const authTokens = await this.authService.generateTokens(updatedUser);

      // Invalider le token de session (optionnel, dépend de votre implémentation)
      // await this.authService.revokeResetSessionToken(command.sessionToken);

      return {
        success: true,
        message:
          'Mot de passe réinitialisé avec succès. Vous êtes maintenant connecté',
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        expiresIn: authTokens.expiresIn,
        user: {
          id: user.id,
          email: user.email.value,
          name: user.name,
        },
        passwordChangeRequired: false,
      };
    } catch {
      return {
        success: false,
        message:
          'Une erreur technique est survenue. Veuillez réessayer plus tard',
      };
    }
  }

  private validateInput(command: CompletePasswordResetCommand): void {
    if (
      !command.sessionToken ||
      typeof command.sessionToken !== 'string' ||
      command.sessionToken.trim().length === 0
    ) {
      throw new DomainValidationError('Session token is required');
    }

    if (
      !command.newPassword ||
      typeof command.newPassword !== 'string' ||
      command.newPassword.trim().length === 0
    ) {
      throw new DomainValidationError('New password is required');
    }
  }

  /**
   * Met à jour le mot de passe de l'utilisateur
   * Cette méthode devra être adaptée selon votre implémentation d'entité User
   */
  private async updateUserPassword(
    user: any,
    hashedPassword: string,
  ): Promise<any> {
    // Créer une nouvelle instance utilisateur avec le mot de passe mis à jour
    // Ceci est une implémentation simplifiée - adaptez selon votre entité User
    const updatedUser = {
      ...user,
      hashedPassword,
      passwordChangeRequired: false,
      updatedAt: new Date(),
    };

    return await this.userRepository.save(updatedUser);
  }
}
