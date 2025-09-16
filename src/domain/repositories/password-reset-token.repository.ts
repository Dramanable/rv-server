/**
 * 🔐 DOMAIN REPOSITORY - Password Reset Token Repository Interface
 *
 * Interface repository pour la gestion des tokens de réinitialisation.
 * Définit les contrats de persistance pour les tokens temporaires.
 *
 * CLEAN ARCHITECTURE :
 * - Interface domaine pure
 * - Implémentation dans la couche infrastructure
 */

import { PasswordResetToken } from '../entities/password-reset-token.entity';

export const PASSWORD_RESET_TOKEN_REPOSITORY = 'PASSWORD_RESET_TOKEN_REPOSITORY';

export interface PasswordResetTokenRepository {
  /**
   * Sauvegarde un token de réinitialisation
   */
  save(token: PasswordResetToken): Promise<void>;

  /**
   * Trouve un token par sa valeur
   */
  findByToken(token: string): Promise<PasswordResetToken | null>;

  /**
   * Supprime tous les tokens d'un utilisateur
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Supprime tous les tokens expirés
   * @returns Nombre de tokens supprimés
   */
  deleteExpiredTokens(): Promise<number>;
}
