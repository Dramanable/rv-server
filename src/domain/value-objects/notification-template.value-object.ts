/**
 * @fileoverview Notification Template Value Object
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { DomainError } from "../exceptions/domain.exceptions";

/**
 * Types de templates supportés
 */
export enum NotificationTemplateType {
  APPOINTMENT_CONFIRMATION = "APPOINTMENT_CONFIRMATION",
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  APPOINTMENT_CANCELLATION = "APPOINTMENT_CANCELLATION",
  APPOINTMENT_RESCHEDULED = "APPOINTMENT_RESCHEDULED",
  WELCOME_MESSAGE = "WELCOME_MESSAGE",
  PASSWORD_RESET = "PASSWORD_RESET",
  ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION",
  PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION",
  CUSTOM = "CUSTOM",
}

/**
 * Structure complète des variables de template avec business info
 */
export interface TemplateVariables {
  readonly [key: string]: string | number | Date | boolean | undefined;

  // ✅ Variables Client/Bénéficiaire - Support rendez-vous pour autrui
  readonly clientName?: string; // Nom du client qui prend RDV
  readonly clientEmail?: string; // Email du client qui prend RDV
  readonly clientPhone?: string; // Téléphone du client qui prend RDV
  readonly beneficiaryName?: string; // Nom du bénéficiaire du service (si différent du client)
  readonly beneficiaryAge?: string; // Âge du bénéficiaire (utile pour enfants)
  readonly relationshipToBeneficiary?: string; // "pour votre fils", "pour votre épouse", etc.
  readonly isBookingForSelf?: boolean; // true si client = bénéficiaire

  // ✅ Alias pour compatibilité (à supprimer progressivement)
  readonly patientName?: string; // @deprecated Utiliser beneficiaryName
  readonly patientAge?: string; // @deprecated Utiliser beneficiaryAge
  readonly relationshipToPatient?: string; // @deprecated Utiliser relationshipToBeneficiary

  // ✅ Variables Rendez-vous
  readonly appointmentId?: string;
  readonly appointmentDate?: string;
  readonly appointmentTime?: string;
  readonly serviceName?: string;
  readonly serviceDuration?: string;
  readonly servicePrice?: string;
  readonly staffName?: string;
  readonly appointmentStatus?: string;

  // 🏢 Variables Business (NOUVELLES - OBLIGATOIRES)
  readonly businessName?: string;
  readonly businessPhone?: string;
  readonly businessEmail?: string;
  readonly businessAddress?: string;
  readonly businessCity?: string;
  readonly businessPostalCode?: string;
  readonly businessCountry?: string;
  readonly businessWebsite?: string;

  // 🎨 Variables Branding Business (NOUVELLES)
  readonly businessLogo?: string; // URL du logo
  readonly businessCoverImage?: string; // URL image de couverture
  readonly businessPrimaryColor?: string;
  readonly businessSecondaryColor?: string;

  // 🌐 Variables Réseaux Sociaux Business (NOUVELLES)
  readonly businessFacebook?: string;
  readonly businessInstagram?: string;
  readonly businessLinkedin?: string;
  readonly businessTwitter?: string;

  // ⚙️ Variables Configuration
  readonly timezone?: string;
  readonly currency?: string;
  readonly language?: string;

  // 🔗 Variables Actions
  readonly bookingUrl?: string;
  readonly cancelUrl?: string;
  readonly rescheduleUrl?: string;
  readonly confirmUrl?: string;
}

/**
 * Template de notification avec support des variables
 */
export class NotificationTemplate {
  private constructor(
    private readonly _type: NotificationTemplateType,
    private readonly _subject: string,
    private readonly _bodyTemplate: string,
    private readonly _variables: TemplateVariables,
    private readonly _language: string = "fr",
  ) {
    this.validateTemplate();
  }

  /**
   * Crée un template de notification
   */
  static create(
    type: NotificationTemplateType,
    subject: string,
    bodyTemplate: string,
    variables: TemplateVariables = {},
    language: string = "fr",
  ): NotificationTemplate {
    return new NotificationTemplate(
      type,
      subject,
      bodyTemplate,
      variables,
      language,
    );
  }

  /**
   * Crée un template depuis un type prédéfini
   */
  static fromType(
    type: NotificationTemplateType,
    variables: TemplateVariables = {},
    language: string = "fr",
  ): NotificationTemplate {
    const predefinedTemplate = this.getPredefinedTemplate(type, language);

    return new NotificationTemplate(
      type,
      predefinedTemplate.subject,
      predefinedTemplate.body,
      variables,
      language,
    );
  }

  /**
   * Obtient les templates prédéfinis
   */
  private static getPredefinedTemplate(
    type: NotificationTemplateType,
    language: string,
  ): { subject: string; body: string } {
    const templates: Record<
      string,
      Partial<
        Record<NotificationTemplateType, { subject: string; body: string }>
      >
    > = {
      fr: {
        [NotificationTemplateType.APPOINTMENT_CONFIRMATION]: {
          subject: "Confirmation de rendez-vous - {{businessName}}",
          body: `
{{#if businessLogo}}
<img src="{{businessLogo}}" alt="Logo {{businessName}}" style="max-width: 200px; margin-bottom: 20px;">
{{/if}}

Bonjour {{clientName}},

Votre rendez-vous a été confirmé avec succès !

📅 **Détails du rendez-vous :**
- **Date :** {{appointmentDate}}
- **Heure :** {{appointmentTime}}
- **Service :** {{serviceName}}
- **Durée :** {{serviceDuration}}
- **Professionnel :** {{staffName}}
- **Prix :** {{servicePrice}} {{currency}}

📍 **Lieu de rendez-vous :**
**{{businessName}}**
{{businessAddress}}
{{businessCity}}, {{businessPostalCode}}
{{businessCountry}}

📞 **Contact :**
- Téléphone : {{businessPhone}}
- Email : {{businessEmail}}
{{#if businessWebsite}}
- Site web : {{businessWebsite}}
{{/if}}

🔗 **Actions rapides :**
{{#if confirmUrl}}
- [Confirmer le rendez-vous]({{confirmUrl}})
{{/if}}
{{#if rescheduleUrl}}
- [Reprogrammer]({{rescheduleUrl}})
{{/if}}
{{#if cancelUrl}}
- [Annuler]({{cancelUrl}})
{{/if}}

{{#if businessFacebook}}
🌐 **Suivez-nous :**
{{#if businessFacebook}}
- [Facebook]({{businessFacebook}})
{{/if}}
{{#if businessInstagram}}
- [Instagram]({{businessInstagram}})
{{/if}}
{{#if businessLinkedin}}
- [LinkedIn]({{businessLinkedin}})
{{/if}}
{{/if}}

**Note importante :** Pour modifier ou annuler votre rendez-vous, contactez-nous au moins 24h à l'avance.

Cordialement,
L'équipe {{businessName}}

{{#if businessCoverImage}}
<img src="{{businessCoverImage}}" alt="{{businessName}}" style="width: 100%; max-width: 600px; margin-top: 20px;">
{{/if}}
          `,
        },
        [NotificationTemplateType.APPOINTMENT_REMINDER]: {
          subject: "⏰ Rappel : RDV {{appointmentTime}} - {{businessName}}",
          body: `
{{#if businessLogo}}
<img src="{{businessLogo}}" alt="Logo {{businessName}}" style="max-width: 200px; margin-bottom: 20px;">
{{/if}}

Bonjour {{clientName}},

⏰ **Rappel important** : Votre rendez-vous est prévu **demain** !

📅 **Détails de votre rendez-vous :**
- 📆 **Date :** {{appointmentDate}}
- ⏰ **Heure :** {{appointmentTime}}
- � **Service :** {{serviceName}} ({{serviceDuration}})
- 👨‍💼 **Professionnel :** {{staffName}}
- � **Prix :** {{servicePrice}} {{currency}}

📍 **Rendez-vous chez :**
**{{businessName}}**
{{businessAddress}}
{{businessCity}}, {{businessPostalCode}}
{{businessCountry}}

�️ **Comment nous trouver :**
{{#if businessWebsite}}
- Voir plan d'accès : {{businessWebsite}}
{{/if}}
- GPS/Maps : "{{businessName}} {{businessAddress}} {{businessCity}}"

💡 **Conseils pratiques :**
{{#if servicePreparation}}
- {{servicePreparation}}
{{/if}}
- ✅ Arrivez 10 minutes avant l'heure
- 📋 N'oubliez pas vos documents si nécessaire
- 🚗 Prévoyez du temps pour le stationnement

📞 **Contact en cas d'urgence :**
- Téléphone : **{{businessPhone}}**
- Email : {{businessEmail}}

🔗 **Besoin de modifier ?**
{{#if rescheduleUrl}}
- [Reprogrammer le rendez-vous]({{rescheduleUrl}})
{{/if}}
{{#if cancelUrl}}
- [Annuler le rendez-vous]({{cancelUrl}})
{{/if}}

{{#if businessFacebook}}
🌐 **Restez connecté :**
{{#if businessFacebook}}[Facebook]({{businessFacebook}}) | {{/if}}{{#if businessInstagram}}[Instagram]({{businessInstagram}}) | {{/if}}{{#if businessLinkedin}}[LinkedIn]({{businessLinkedin}}){{/if}}
{{/if}}

À très bientôt !
L'équipe {{businessName}} 🌟
          `,
        },
        [NotificationTemplateType.APPOINTMENT_CANCELLATION]: {
          subject: "Annulation de rendez-vous - {{businessName}}",
          body: `
Bonjour {{clientName}},

Nous vous confirmons l'annulation de votre rendez-vous :

🚫 **Rendez-vous annulé :**
- **Date :** {{appointmentDate}} à {{appointmentTime}}
- **Service :** {{serviceName}}
- **Professionnel :** {{staffName}}

{{#if cancellationReason}}
**Motif :** {{cancellationReason}}
{{/if}}

{{#if refundAmount}}
💰 **Remboursement :** {{refundAmount}} sera crédité sous 3-5 jours ouvrés
{{/if}}

Pour reprendre un nouveau rendez-vous :
📞 {{businessPhone}}
🌐 {{bookingUrl}}

Nous nous excusons pour la gêne occasionnée.

Cordialement,
L'équipe {{businessName}}
          `,
        },
        [NotificationTemplateType.WELCOME_MESSAGE]: {
          subject: "Bienvenue chez {{businessName}} ! 🎉",
          body: `
Bonjour {{clientName}},

Bienvenue dans notre communauté ! 🎉

Nous sommes ravis de vous compter parmi nos clients. Chez {{businessName}}, nous nous engageons à vous offrir la meilleure expérience possible.

🎯 **Vos avantages :**
- Réservation en ligne 24h/24
- Rappels automatiques
- Historique de vos rendez-vous
- Offres exclusives

🚀 **Pour commencer :**
1. Explorez nos services : {{servicesUrl}}
2. Réservez votre premier rendez-vous : {{bookingUrl}}
3. Suivez-nous sur les réseaux : {{socialLinks}}

Une question ? Notre équipe est à votre disposition :
📞 {{businessPhone}}
📧 {{businessEmail}}

À très bientôt !
L'équipe {{businessName}}
          `,
        },
      },
      en: {
        [NotificationTemplateType.APPOINTMENT_CONFIRMATION]: {
          subject: "Appointment Confirmation - {{businessName}}",
          body: `
Hello {{clientName}},

Your appointment has been successfully confirmed!

📅 **Appointment Details:**
- **Date:** {{appointmentDate}}
- **Time:** {{appointmentTime}}
- **Service:** {{serviceName}}
- **Duration:** {{serviceDuration}}
- **Professional:** {{staffName}}
- **Price:** {{servicePrice}}

📍 **Location:**
{{businessName}}
{{businessAddress}}

📞 **Contact:** {{businessPhone}}

To modify or cancel your appointment, please contact us at least 24 hours in advance.

Best regards,
The {{businessName}} team
          `,
        },
        // Autres templates en anglais...
      },
    };

    const languageTemplates = templates[language];
    if (!languageTemplates) {
      throw new DomainError(`Template language not supported: ${language}`);
    }

    const template = languageTemplates[type];
    if (!template) {
      throw new DomainError(`Template type not found: ${type}`);
    }

    return template;
  }

  /**
   * Génère le contenu final en remplaçant les variables
   */
  generateContent(): { subject: string; body: string } {
    return {
      subject: this.replaceVariables(this._subject),
      body: this.replaceVariables(this._bodyTemplate),
    };
  }

  /**
   * Remplace les variables dans le texte
   */
  private replaceVariables(text: string): string {
    let result = text;

    // Remplacement des variables simples {{variable}}
    Object.entries(this._variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      const stringValue = this.formatValue(value);
      result = result.replace(regex, stringValue);
    });

    // Support basique des conditions {{#if variable}}...{{/if}}
    result = this.processConditionals(result);

    return result;
  }

  /**
   * Traite les conditions dans le template
   */
  private processConditionals(text: string): string {
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;

    return text.replace(conditionalRegex, (match, variable, content) => {
      const value = this._variables[variable];
      return value ? content : "";
    });
  }

  /**
   * Formate une valeur pour l'affichage
   */
  private formatValue(
    value: string | number | Date | boolean | undefined,
  ): string {
    if (value === undefined || value === null) {
      return "";
    }

    if (value instanceof Date) {
      return value.toLocaleString(this._language === "fr" ? "fr-FR" : "en-US");
    }

    if (typeof value === "boolean") {
      return this._language === "fr"
        ? value
          ? "Oui"
          : "Non"
        : value
          ? "Yes"
          : "No";
    }

    return String(value);
  }

  /**
   * Valide le template
   */
  private validateTemplate(): void {
    if (!this._subject.trim()) {
      throw new DomainError("Template subject cannot be empty");
    }

    if (!this._bodyTemplate.trim()) {
      throw new DomainError("Template body cannot be empty");
    }

    if (!["fr", "en", "es", "de", "it"].includes(this._language)) {
      throw new DomainError(`Unsupported language: ${this._language}`);
    }
  }

  /**
   * Obtient les variables requises pour ce template
   */
  getRequiredVariables(): string[] {
    const variableRegex = /{{(\w+)}}/g;
    const variables = new Set<string>();

    let match;
    while (
      (match = variableRegex.exec(this._subject + this._bodyTemplate)) !== null
    ) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Vérifie si toutes les variables requises sont fournies
   */
  validateVariables(): { valid: boolean; missingVariables: string[] } {
    const required = this.getRequiredVariables();
    const provided = Object.keys(this._variables);
    const missing = required.filter((variable) => !provided.includes(variable));

    return {
      valid: missing.length === 0,
      missingVariables: missing,
    };
  }

  // Getters
  getType(): NotificationTemplateType {
    return this._type;
  }
  getSubject(): string {
    return this._subject;
  }
  getBodyTemplate(): string {
    return this._bodyTemplate;
  }
  getVariables(): TemplateVariables {
    return { ...this._variables };
  }
  getLanguage(): string {
    return this._language;
  }

  /**
   * Crée une copie avec de nouvelles variables
   */
  withVariables(variables: TemplateVariables): NotificationTemplate {
    return new NotificationTemplate(
      this._type,
      this._subject,
      this._bodyTemplate,
      { ...this._variables, ...variables },
      this._language,
    );
  }

  /**
   * Égalité
   */
  equals(other: NotificationTemplate): boolean {
    return (
      this._type === other._type &&
      this._subject === other._subject &&
      this._bodyTemplate === other._bodyTemplate &&
      this._language === other._language &&
      JSON.stringify(this._variables) === JSON.stringify(other._variables)
    );
  }

  /**
   * Représentation string pour debug
   */
  toString(): string {
    return `NotificationTemplate(${this._type}, ${this._language})`;
  }
}
