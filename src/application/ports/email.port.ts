/**
 * 📧 Email Service Port
 *
 * Interface pour l'envoi d'emails
 * Abstraction pour différents providers (SendGrid, Mailgun, AWS SES, etc.)
 */

export interface IEmailService {
  /**
   * Envoie un email de bienvenue avec mot de passe temporaire
   */
  sendWelcomeEmail(
    to: string,
    userName: string,
    temporaryPassword: string,
    loginUrl?: string,
  ): Promise<void>;

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void>;

  /**
   * Envoie un email de notification générique
   */
  sendNotificationEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void>;
}
