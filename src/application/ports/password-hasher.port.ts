/**
 * 🔐 Password Hasher Port
 * ✅ Clean Architecture - Application Layer
 * ✅ Interface pour l'abstraction du hachage de mots de passe
 * ✅ Implémentation dans Infrastructure Layer
 */

export interface IPasswordHasher {
  /**
   * Hache un mot de passe en clair
   * @param plainPassword Mot de passe en clair
   * @returns Hash du mot de passe
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Vérifie un mot de passe en clair contre un hash
   * @param plainPassword Mot de passe en clair
   * @param hashedPassword Hash à vérifier
   * @returns True si le mot de passe correspond
   */
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;

  /**
   * Valide le format d'un hash
   * @param hash Hash à valider
   * @returns True si le format est valide
   */
  isValidHashFormat(hash: string): boolean;
}
