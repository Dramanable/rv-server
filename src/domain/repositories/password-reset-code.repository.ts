/**
 * 🗄️ DOMAIN REPOSITORY INTERFACE - Password Reset Code Repository
 *
 * Interface domaine pour la persistance des codes de réinitialisation.
 * Définit les contrats pour gérer les codes temporaires à 4 chiffres.
 *
 * CLEAN ARCHITECTURE :
 * - Interface dans le domaine
 * - Implémentation dans l'infrastructure
 * - Utilisée par les use cases d'application
 */

import { PasswordResetCode } from '../entities/password-reset-code.entity';

export interface IPasswordResetCodeRepository {
  /**
   * Sauvegarde un nouveau code de réinitialisation
   */
  save(resetCode: PasswordResetCode): Promise<void>;

  /**
   * Trouve un code par sa valeur
   */
  findByCode(code: string): Promise<PasswordResetCode | null>;

  /**
   * Trouve tous les codes valides pour un utilisateur
   */
  findValidCodesByUserId(userId: string): Promise<PasswordResetCode[]>;

  /**
   * Invalide tous les codes d'un utilisateur
   * (utilisé quand on génère un nouveau code)
   */
  invalidateUserCodes(userId: string): Promise<void>;

  /**
   * Marque un code comme utilisé
   */
  markAsUsed(code: string): Promise<void>;

  /**
   * Supprime les codes expirés (tâche de nettoyage)
   */
  deleteExpiredCodes(): Promise<number>;

  /**
   * Supprime tous les codes d'un utilisateur
   */
  deleteUserCodes(userId: string): Promise<void>;

  /**
   * Vérifie si un code existe et est valide
   */
  isCodeValid(code: string): Promise<boolean>;
}
