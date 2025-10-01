import { Injectable } from '@nestjs/common';
import {
  AppointmentConfirmationEmailData,
  EmailOptions,
  EmailResult,
  EmailTemplateOptions,
  IEmailService,
  PasswordResetEmailData,
  WelcomeEmailData,
} from '../../application/ports/email.port';
import { Logger } from '../../application/ports/logger.port';

@Injectable()
export class MockEmailService implements IEmailService {
  private readonly emailsLog: Array<{
    timestamp: Date;
    to: string;
    subject: string;
    messageId: string;
    content: string;
  }> = [];

  constructor(private readonly logger: Logger) {}

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    await this.simulateDelay(200, 500);

    const messageId = this.generateMessageId();
    const recipient = Array.isArray(options.to)
      ? options.to.join(', ')
      : options.to;
    const content = options.html || options.text || 'No content';

    this.emailsLog.push({
      timestamp: new Date(),
      to: recipient,
      subject: options.subject,
      messageId,
      content,
    });

    this.logger.info('Mock Email Sent', {
      to: recipient,
      subject: options.subject,
      messageId,
      contentLength: content.length,
    });

    return {
      success: true,
      messageId,
    };
  }

  async sendTemplatedEmail(
    options: EmailTemplateOptions,
  ): Promise<EmailResult> {
    return this.sendEmail({
      ...options,
      subject: options.subject || `Template: ${options.template.templateName}`,
      html: this.renderTemplate(
        options.template.templateName,
        options.template.variables,
      ),
    });
  }

  async sendTransactionalEmail(options: EmailOptions): Promise<EmailResult> {
    this.logger.info('Sending Transactional Email', {
      subject: options.subject,
    });
    return this.sendEmail(options);
  }

  async sendBackgroundEmail(options: EmailOptions): Promise<EmailResult> {
    this.logger.info('Sending Background Email', { subject: options.subject });
    await this.simulateDelay(1000, 2000);
    return this.sendEmail(options);
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
    const htmlContent = this.generateWelcomeEmailHtml(data);
    return this.sendEmail({
      to: data.userEmail,
      subject: `Bienvenue ${data.userName} sur ${data.companyName}!`,
      html: htmlContent,
    });
  }

  async sendPasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<EmailResult> {
    const htmlContent = this.generatePasswordResetEmailHtml(data);
    return this.sendEmail({
      to: data.userName,
      subject: `Réinitialisation de mot de passe - ${data.companyName}`,
      html: htmlContent,
    });
  }

  async sendAppointmentConfirmationEmail(
    data: AppointmentConfirmationEmailData,
  ): Promise<EmailResult> {
    const htmlContent = this.generateAppointmentConfirmationEmailHtml(data);
    return this.sendEmail({
      to: data.clientName,
      subject: `Confirmation de rendez-vous - ${data.appointmentDate}`,
      html: htmlContent,
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
    this.logger.info('Mock Email Service - Configuration verified');
    return true;
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `mock-${timestamp}-${random}`;
  }

  private renderTemplate(
    templateName: string,
    variables: Record<string, any>,
  ): string {
    let content = `<h1>Template: ${templateName}</h1>`;
    content += '<h2>Variables:</h2><ul>';
    for (const [key, value] of Object.entries(variables)) {
      content += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    content += '</ul>';
    return content;
  }

  private generateWelcomeEmailHtml(data: WelcomeEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bienvenue ${data.userName}!</h1>
        <p>Votre compte a été créé avec succès sur <strong>${data.companyName}</strong>.</p>
        ${
          data.temporaryPassword
            ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Mot de passe temporaire :</strong> <code>${data.temporaryPassword}</code></p>
            <p style="font-size: 14px; color: #dc2626;">Veuillez changer ce mot de passe lors de votre première connexion.</p>
          </div>
        `
            : ''
        }
        ${
          data.activationLink
            ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.activationLink}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Activer mon compte
            </a>
          </div>
        `
            : ''
        }
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Cordialement,<br>
          L'équipe ${data.companyName}
        </p>
      </div>
    `;
  }

  private generatePasswordResetEmailHtml(data: PasswordResetEmailData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Réinitialisation de mot de passe</h1>
        <p>Bonjour <strong>${data.userName}</strong>,</p>
        <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>Code de réinitialisation :</strong></p>
          <p style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 3px; margin: 10px 0;">${data.resetCode}</p>
          <p style="font-size: 14px; color: #dc2626; margin: 0;">Ce code expire le ${data.expirationTime}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Cordialement,<br>
          L'équipe ${data.companyName}
        </p>
      </div>
    `;
  }

  private generateAppointmentConfirmationEmailHtml(
    data: AppointmentConfirmationEmailData,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Rendez-vous confirmé</h1>
        <p>Bonjour <strong>${data.clientName}</strong>,</p>
        <p>Votre rendez-vous a été confirmé avec succès !</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">Détails de votre rendez-vous</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Service :</strong> ${data.serviceName}</li>
            <li style="margin: 8px 0;"><strong>Praticien :</strong> ${data.practitionerName}</li>
            <li style="margin: 8px 0;"><strong>Date :</strong> ${data.appointmentDate}</li>
            <li style="margin: 8px 0;"><strong>Heure :</strong> ${data.appointmentTime}</li>
            <li style="margin: 8px 0;"><strong>Lieu :</strong> ${data.location}</li>
          </ul>
        </div>
        ${
          data.cancelationLink
            ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.cancelationLink}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">
              Annuler ce rendez-vous
            </a>
          </div>
        `
            : ''
        }
        <p style="color: #6b7280; font-size: 14px;">
          À bientôt !
        </p>
      </div>
    `;
  }

  getSentEmails(): Array<{
    timestamp: Date;
    to: string;
    subject: string;
    messageId: string;
    content: string;
  }> {
    return [...this.emailsLog];
  }

  clearSentEmails(): void {
    this.emailsLog.length = 0;
    this.logger.info('Mock Email Log cleared');
  }

  getSentEmailsCount(): number {
    return this.emailsLog.length;
  }
}
