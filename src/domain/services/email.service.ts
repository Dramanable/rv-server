/**
 * 📧 DOMAIN SERVICE - Email Service Interface
 *
 * Interface pour l'envoi d'emails dans le contexte métier.
 * Définit les contrats pour l'envoi d'emails de réinitialisation de mot de passe.
 *
 * CLEAN ARCHITECTURE :
 * - Interface domaine pure (pas d'implémentation)
 * - Sera implémentée dans la couche infrastructure
 */

import { Email } from '../value-objects/email.vo';

export interface EmailService {
  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param email - Email du destinataire
   * @param resetToken - Token de réinitialisation
   */
  sendPasswordResetEmail(email: Email, resetToken: string): Promise<void>;

  /**
   * Envoie un email de bienvenue
   * @param email - Email du destinataire
   * @param userName - Nom de l'utilisateur
   * @param welcomeData - Données additionnelles pour l'email de bienvenue
   */
  sendWelcomeEmail(
    email: string,
    userName: string,
    welcomeData: string,
  ): Promise<void>;
}
