/**
 * 📧 Email Service Port - Clean Architecture Interface
 *
 * Port/Adapter pattern pour découpler la logique métier des implémentations
 * techniques d'envoi d'email (Gmail SMTP, SendGrid, AWS SES, etc.)
 */

export interface EmailOptions {
  readonly to: string | string[];
  readonly subject: string;
  readonly text?: string;
  readonly html?: string;
  readonly from?: string;
  readonly cc?: string | string[];
  readonly bcc?: string | string[];
  readonly attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  readonly filename: string;
  readonly content: Buffer | string;
  readonly contentType?: string;
  readonly path?: string; // Alternative à content pour les fichiers
}

export interface EmailTemplate {
  readonly templateName: string;
  readonly variables: Record<string, any>;
  readonly language?: string;
}

export interface EmailTemplateOptions
  extends Omit<EmailOptions, 'html' | 'text'> {
  readonly template: EmailTemplate;
}

export interface EmailResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}

/**
 * Types spécifiques pour les emails transactionnels courants
 */
export interface WelcomeEmailData {
  readonly userName: string;
  readonly userEmail: string;
  readonly temporaryPassword?: string;
  readonly activationLink?: string;
  readonly loginUrl?: string;
  readonly companyName: string;
}

export interface PasswordResetEmailData {
  readonly userName: string;
  readonly resetCode: string;
  readonly expirationTime: string;
  readonly companyName: string;
}

export interface AppointmentConfirmationEmailData {
  readonly clientName: string;
  readonly appointmentDate: string;
  readonly appointmentTime: string;
  readonly serviceName: string;
  readonly practitionerName: string;
  readonly location: string;
  readonly cancelationLink?: string;
}

/**
 * Interface principale pour l'envoi d'emails
 */
export interface IEmailService {
  /**
   * Envoie un email simple avec contenu texte/HTML
   */
  sendEmail(options: EmailOptions): Promise<EmailResult>;

  /**
   * Envoie un email basé sur un template
   */
  sendTemplatedEmail(options: EmailTemplateOptions): Promise<EmailResult>;

  /**
   * Envoie un email de manière transactionnelle (immédiat, critique)
   */
  sendTransactionalEmail(options: EmailOptions): Promise<EmailResult>;

  /**
   * Envoie un email en arrière-plan (queue, non-critique)
   */
  sendBackgroundEmail(options: EmailOptions): Promise<EmailResult>;

  /**
   * Envoie un email de bienvenue avec mot de passe temporaire
   */
  sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult>;

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult>;

  /**
   * Envoie un email de confirmation de rendez-vous
   */
  sendAppointmentConfirmationEmail(
    data: AppointmentConfirmationEmailData,
  ): Promise<EmailResult>;

  /**
   * Envoie un email de notification générique
   */
  sendNotificationEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<EmailResult>;

  /**
   * Vérifie la configuration et la connectivité
   */
  verifyConfiguration(): Promise<boolean>;
}

/**
 * Interface pour la gestion des templates d'emails
 */
export interface IEmailTemplateService {
  /**
   * Rend un template avec les variables fournies
   */
  renderTemplate(
    templateName: string,
    variables: Record<string, any>,
    language?: string,
  ): Promise<{ html: string; text: string; subject: string }>;

  /**
   * Vérifie si un template existe
   */
  templateExists(templateName: string, language?: string): Promise<boolean>;

  /**
   * Liste tous les templates disponibles
   */
  listTemplates(language?: string): Promise<string[]>;
}
