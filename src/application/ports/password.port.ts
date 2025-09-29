/**
 * 🔐 PASSWORD SERVICE PORT
 *
 * Interface pour la gestion complète des mots de passe :
 * - Hachage sécurisé
 * - Validation de force
 * - Vérification
 */

export interface PasswordStrengthResult {
  valid: boolean;
  errors: string[];
  score?: number; // 0-4 (optionnel)
}

export interface IPasswordService {
  /**
   * Hache un mot de passe de manière sécurisée
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Vérifie un mot de passe contre son hash
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /**
   * Valide la force d'un mot de passe
   */
  validatePasswordStrength(password: string): Promise<PasswordStrengthResult>;

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  generateTemporaryPassword?(): Promise<string>;
}
