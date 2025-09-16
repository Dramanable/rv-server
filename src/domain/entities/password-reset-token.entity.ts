/**
 * 🔐 DOMAIN ENTITY - Password Reset Token
 *
 * Entité représentant un token de réinitialisation de mot de passe.
 * Gère la logique métier des tokens temporaires avec expiration.
 */

export interface PasswordResetToken {
  readonly token: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
}

/**
 * Factory pour créer des tokens de réinitialisation
 */
export class PasswordResetTokenFactory {
  private static readonly TOKEN_VALIDITY_HOURS = 1;

  /**
   * Crée un nouveau token de réinitialisation
   */
  static create(userId: string): PasswordResetToken {
    const token = this.generateSecureToken();
    const expiresAt = new Date(
      Date.now() + this.TOKEN_VALIDITY_HOURS * 60 * 60 * 1000,
    );

    return {
      token,
      userId,
      expiresAt,
      createdAt: new Date(),
    };
  }

  /**
   * Vérifie si un token est expiré
   */
  static isExpired(token: PasswordResetToken): boolean {
    return new Date() > token.expiresAt;
  }

  /**
   * Génère un token sécurisé aléatoire
   */
  private static generateSecureToken(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
