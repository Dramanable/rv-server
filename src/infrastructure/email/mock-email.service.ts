/**
 * 📧 MOCK EMAIL SERVICE - Infrastructure Implementation
 *
 * Mock du service email pour tests et développement
 * Implémente le port défini dans l'Application Layer
 */

import { Injectable } from '@nestjs/common';
import { IEmailService } from '../../application/ports/email.port';

@Injectable()
export class MockEmailService implements IEmailService {
  private readonly sentEmails: Array<{
    to: string;
    subject: string;
    body: string;
    timestamp: Date;
  }> = [];

  async sendWelcomeEmail(
    to: string,
    userName: string,
    temporaryPassword: string,
    loginUrl: string,
  ): Promise<void> {
    // Simulation d'envoi d'email
    const emailContent = {
      to,
      subject: `Bienvenue ${userName} !`,
      body: `
        Bonjour ${userName},
        
        Votre compte a été créé avec succès !
        
        Votre mot de passe temporaire : ${temporaryPassword}
        Lien de connexion : ${loginUrl}
        
        Veuillez changer votre mot de passe lors de votre première connexion.
        
        Cordialement,
        L'équipe
      `,
      timestamp: new Date(),
    };

    this.sentEmails.push(emailContent);

    // Simulation délai réseau
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`📧 EMAIL SENT: ${emailContent.subject} to ${to}`);
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const emailContent = {
      to,
      subject: 'Réinitialisation de mot de passe',
      body: `
        Bonjour ${userName},
        
        Une demande de réinitialisation de mot de passe a été effectuée.
        
        Token de réinitialisation : ${resetToken}
        Lien de réinitialisation : ${resetUrl}
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe
      `,
      timestamp: new Date(),
    };

    this.sentEmails.push(emailContent);
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`🔑 PASSWORD RESET EMAIL SENT to ${to}`);
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void> {
    // Simulation d'envoi d'email de notification
    const emailContent = {
      to,
      subject,
      body: htmlContent || textContent || 'Notification email',
      timestamp: new Date(),
    };

    this.sentEmails.push(emailContent);
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`📧 NOTIFICATION EMAIL SENT to ${to}: ${subject}`);
  }

  // 🧪 Méthodes utilitaires pour les tests
  getSentEmails(): Array<{
    to: string;
    subject: string;
    body: string;
    timestamp: Date;
  }> {
    return [...this.sentEmails];
  }

  getLastEmailTo(email: string): unknown {
    return this.sentEmails
      .filter((e) => e.to === email)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  clearSentEmails(): void {
    this.sentEmails.length = 0;
  }

  getSentEmailsCount(): number {
    return this.sentEmails.length;
  }
}
