/**
 * 📧 MOCK EMAIL SERVICE - Infrastructure Implementation
 *
 * Mock du service email pour tests et développement
 * Implémente le port défini dans l'Application Layer
 */

import { Injectable } from "@nestjs/common";
import {
  AppointmentConfirmationEmailData,
  EmailOptions,
  EmailResult,
  EmailTemplateOptions,
  IEmailService,
  PasswordResetEmailData,
  WelcomeEmailData,
} from "../../application/ports/email.port";

@Injectable()
export class MockEmailService implements IEmailService {
  private readonly sentEmails: Array<{
    to: string;
    subject: string;
    body: string;
    timestamp: Date;
  }> = [];

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const emailContent = {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      body: options.html || options.text || "Email content",
      timestamp: new Date(),
    };

    this.sentEmails.push(emailContent);
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`📧 EMAIL SENT: ${emailContent.subject} to ${emailContent.to}`);

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  async sendTemplatedEmail(
    options: EmailTemplateOptions,
  ): Promise<EmailResult> {
    return this.sendEmail({
      ...options,
      subject: options.subject || `Template: ${options.template.templateName}`,
      text: `Template ${options.template.templateName} rendered`,
    });
  }

  async sendTransactionalEmail(options: EmailOptions): Promise<EmailResult> {
    return this.sendEmail(options);
  }

  async sendBackgroundEmail(options: EmailOptions): Promise<EmailResult> {
    return this.sendEmail(options);
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    return this.sendEmail({
      to: data.userEmail,
      subject: `Bienvenue ${data.userName} sur ${data.companyName}!`,
      html: `
        <h1>Bienvenue ${data.userName}!</h1>
        <p>Votre compte a été créé avec succès sur ${data.companyName}.</p>
        ${data.temporaryPassword ? `<p>Mot de passe temporaire : <strong>${data.temporaryPassword}</strong></p>` : ""}
        ${data.activationLink ? `<p><a href="${data.activationLink}">Activer mon compte</a></p>` : ""}
        ${data.loginUrl ? `<p><a href="${data.loginUrl}">Se connecter</a></p>` : ""}
        <p>Cordialement,<br>L'équipe ${data.companyName}</p>
      `,
    });
  }

  async sendPasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: data.userName, // Assuming userName contains email for backward compatibility
      subject: `Réinitialisation de mot de passe - ${data.companyName}`,
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour ${data.userName},</p>
        <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
        <p><a href="${data.resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expire le ${data.expirationTime}</p>
        <p>L'équipe ${data.companyName}</p>
      `,
    });
  }

  async sendAppointmentConfirmationEmail(
    data: AppointmentConfirmationEmailData,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: data.clientName, // Assuming clientName contains email
      subject: `Confirmation de rendez-vous - ${data.appointmentDate}`,
      html: `
        <h1>Rendez-vous confirmé</h1>
        <p>Bonjour ${data.clientName},</p>
        <p>Votre rendez-vous a été confirmé :</p>
        <ul>
          <li>Service : ${data.serviceName}</li>
          <li>Praticien : ${data.practitionerName}</li>
          <li>Date : ${data.appointmentDate}</li>
          <li>Heure : ${data.appointmentTime}</li>
          <li>Lieu : ${data.location}</li>
        </ul>
        ${data.cancelationLink ? `<p><a href="${data.cancelationLink}">Annuler ce rendez-vous</a></p>` : ""}
      `,
    });
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }

  async verifyConfiguration(): Promise<boolean> {
    return true; // Mock always returns true
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
