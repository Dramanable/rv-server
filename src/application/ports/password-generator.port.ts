/**
 * 🔐 Password Generator Port
 *
 * Interface pour la génération de mots de passe sécurisés
 */

export interface IPasswordGenerator {
  /**
   * Génère un mot de passe temporaire sécurisé
   * @param length Longueur du mot de passe (défaut: 12)
   * @param includeSpecialChars Inclure des caractères spéciaux (défaut: true)
   */
  generateTemporaryPassword(
    length?: number,
    includeSpecialChars?: boolean,
  ): Promise<string>;

  /**
   * Génère un token de réinitialisation
   * @param length Longueur du token (défaut: 32)
   */
  generateResetToken(length?: number): Promise<string>;

  /**
   * Valide la force d'un mot de passe
   */
  validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    score: number; // 0-4
    feedback: string[];
  }>;
}
