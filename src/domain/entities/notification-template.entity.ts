/**
 * @fileoverview NotificationTemplate Domain Entity
 * @module Domain/Entities
 * @version 1.0.0
 */

import { DomainError } from "../exceptions/domain.exceptions";
import { NotificationChannel } from "../value-objects/notification-channel.value-object";

/**
 * Types d'événements pour les templates
 */
export enum NotificationEventType {
  APPOINTMENT_CREATED = "APPOINTMENT_CREATED",
  APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED",
  APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
  APPOINTMENT_RESCHEDULED = "APPOINTMENT_RESCHEDULED",
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED",
  APPOINTMENT_NO_SHOW = "APPOINTMENT_NO_SHOW",
  USER_WELCOME = "USER_WELCOME",
  USER_PASSWORD_RESET = "USER_PASSWORD_RESET",
  USER_EMAIL_VERIFICATION = "USER_EMAIL_VERIFICATION",
  STAFF_SHIFT_ASSIGNED = "STAFF_SHIFT_ASSIGNED",
  STAFF_SCHEDULE_CHANGED = "STAFF_SCHEDULE_CHANGED",
  BUSINESS_NOTIFICATION = "BUSINESS_NOTIFICATION",
  SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

/**
 * Variables de template disponibles
 */
export interface TemplateVariables {
  readonly [key: string]: string | number | Date | boolean;
}

/**
 * Configuration du template par canal
 */
export interface ChannelTemplateConfig {
  readonly subject?: string; // Pour EMAIL
  readonly title: string;
  readonly content: string;
  readonly htmlContent?: string; // Pour EMAIL
  readonly variables: readonly string[]; // Variables requises
}

/**
 * Interface pour les données de création d'un template
 */
export interface CreateNotificationTemplateData {
  readonly name: string;
  readonly eventType: NotificationEventType;
  readonly description?: string;
  readonly businessId?: string; // Template spécifique à une entreprise
  readonly language: string;
  readonly channelConfigs: Map<NotificationChannel, ChannelTemplateConfig>;
  readonly isActive?: boolean;
}

/**
 * Interface pour la reconstruction d'un template
 */
export interface ReconstructNotificationTemplateData
  extends CreateNotificationTemplateData {
  readonly id: string;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entité métier représentant un template de notification
 * Encapsule la logique de génération de contenu personnalisé
 */
export class NotificationTemplate {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _eventType: NotificationEventType,
    private readonly _description: string,
    private readonly _businessId: string | undefined,
    private readonly _language: string,
    private readonly _channelConfigs: Map<
      NotificationChannel,
      ChannelTemplateConfig
    >,
    private readonly _isActive: boolean,
    private readonly _version: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    this.validateInvariants();
  }

  /**
   * Factory method pour créer un nouveau template
   */
  static create(data: CreateNotificationTemplateData): NotificationTemplate {
    const id = this.generateId();
    const description = data.description || "";
    const isActive = data.isActive !== false; // Default to true

    return new NotificationTemplate(
      id,
      data.name,
      data.eventType,
      description,
      data.businessId,
      data.language,
      new Map(data.channelConfigs),
      isActive,
      1, // Initial version
      new Date(),
      new Date(),
    );
  }

  /**
   * Factory method pour reconstruire un template depuis la persistence
   */
  static reconstruct(
    data: ReconstructNotificationTemplateData,
  ): NotificationTemplate {
    return new NotificationTemplate(
      data.id,
      data.name,
      data.eventType,
      data.description || "",
      data.businessId,
      data.language,
      new Map(data.channelConfigs),
      data.isActive !== false,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Génère un ID unique pour le template
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Valide les invariants métier
   */
  private validateInvariants(): void {
    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError("Template ID is required");
    }

    if (!this._name || this._name.trim().length === 0) {
      throw new DomainError("Template name is required");
    }

    if (this._name.length > 100) {
      throw new DomainError("Template name cannot exceed 100 characters");
    }

    if (!Object.values(NotificationEventType).includes(this._eventType)) {
      throw new DomainError("Invalid notification event type");
    }

    if (!this._language || this._language.trim().length === 0) {
      throw new DomainError("Template language is required");
    }

    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(this._language)) {
      throw new DomainError(
        'Invalid language format. Expected format: "en", "fr", "en-US", etc.',
      );
    }

    if (this._channelConfigs.size === 0) {
      throw new DomainError("At least one channel configuration is required");
    }

    if (this._version < 1) {
      throw new DomainError("Template version must be at least 1");
    }

    // Valider chaque configuration de canal
    this._channelConfigs.forEach((config, channel) => {
      this.validateChannelConfig(channel, config);
    });
  }

  /**
   * Valide une configuration de canal
   */
  private validateChannelConfig(
    channel: NotificationChannel,
    config: ChannelTemplateConfig,
  ): void {
    if (!config.title || config.title.trim().length === 0) {
      throw new DomainError(
        `Title is required for channel ${channel.getValue()}`,
      );
    }

    if (!config.content || config.content.trim().length === 0) {
      throw new DomainError(
        `Content is required for channel ${channel.getValue()}`,
      );
    }

    if (config.title.length > 255) {
      throw new DomainError(
        `Title cannot exceed 255 characters for channel ${channel.getValue()}`,
      );
    }

    if (config.content.length > 10000) {
      throw new DomainError(
        `Content cannot exceed 10000 characters for channel ${channel.getValue()}`,
      );
    }

    // Validation spécifique pour EMAIL
    if (channel.isEmail()) {
      if (!config.subject || config.subject.trim().length === 0) {
        throw new DomainError("Subject is required for EMAIL channel");
      }

      if (config.subject.length > 255) {
        throw new DomainError("Email subject cannot exceed 255 characters");
      }
    }

    // Validation spécifique pour SMS
    if (channel.isSms()) {
      if (config.content.length > 160) {
        throw new DomainError("SMS content cannot exceed 160 characters");
      }
    }

    // Valider que les variables sont des chaînes non vides
    config.variables.forEach((variable) => {
      if (!variable || variable.trim().length === 0) {
        throw new DomainError("Variable names cannot be empty");
      }

      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
        throw new DomainError(`Invalid variable name format: ${variable}`);
      }
    });
  }

  /**
   * Getters
   */
  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getEventType(): NotificationEventType {
    return this._eventType;
  }

  getDescription(): string {
    return this._description;
  }

  getBusinessId(): string | undefined {
    return this._businessId;
  }

  getLanguage(): string {
    return this._language;
  }

  getChannelConfigs(): Map<NotificationChannel, ChannelTemplateConfig> {
    return new Map(this._channelConfigs);
  }

  isActive(): boolean {
    return this._isActive;
  }

  getVersion(): number {
    return this._version;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Méthodes métier
   */

  /**
   * Vérifie si le template supporte un canal donné
   */
  supportsChannel(channel: NotificationChannel): boolean {
    return this._channelConfigs.has(channel);
  }

  /**
   * Récupère la configuration pour un canal
   */
  getChannelConfig(
    channel: NotificationChannel,
  ): ChannelTemplateConfig | undefined {
    return this._channelConfigs.get(channel);
  }

  /**
   * Vérifie si le template est global (pas spécifique à une entreprise)
   */
  isGlobal(): boolean {
    return !this._businessId;
  }

  /**
   * Vérifie si le template appartient à une entreprise donnée
   */
  belongsToBusinessOrGlobal(businessId?: string): boolean {
    return this.isGlobal() || this._businessId === businessId;
  }

  /**
   * Génère le contenu d'une notification pour un canal donné
   */
  generateContent(
    channel: NotificationChannel,
    variables: TemplateVariables,
  ): {
    title: string;
    content: string;
    subject?: string;
    htmlContent?: string;
  } {
    if (!this._isActive) {
      throw new DomainError("Cannot generate content from inactive template");
    }

    const config = this._channelConfigs.get(channel);
    if (!config) {
      throw new DomainError(
        `Template does not support channel: ${channel.getValue()}`,
      );
    }

    // Vérifier que toutes les variables requises sont fournies
    const missingVariables = config.variables.filter(
      (variable) => !(variable in variables),
    );
    if (missingVariables.length > 0) {
      throw new DomainError(
        `Missing required variables: ${missingVariables.join(", ")}`,
      );
    }

    // Remplacer les variables dans le contenu
    const title = this.replaceVariables(config.title, variables);
    const content = this.replaceVariables(config.content, variables);
    const subject = config.subject
      ? this.replaceVariables(config.subject, variables)
      : undefined;
    const htmlContent = config.htmlContent
      ? this.replaceVariables(config.htmlContent, variables)
      : undefined;

    return {
      title,
      content,
      subject,
      htmlContent,
    };
  }

  /**
   * Remplace les variables dans un texte
   */
  private replaceVariables(text: string, variables: TemplateVariables): string {
    let result = text;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const replacement = this.formatVariableValue(value);
      result = result.replace(new RegExp(placeholder, "g"), replacement);
    });

    return result;
  }

  /**
   * Formate une valeur de variable pour l'affichage
   */
  private formatVariableValue(value: string | number | Date | boolean): string {
    if (value instanceof Date) {
      return value.toLocaleString(this._language);
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }

    return String(value);
  }

  /**
   * Active le template
   */
  activate(): NotificationTemplate {
    if (this._isActive) {
      return this; // Déjà actif
    }

    return new NotificationTemplate(
      this._id,
      this._name,
      this._eventType,
      this._description,
      this._businessId,
      this._language,
      this._channelConfigs,
      true, // isActive
      this._version,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Désactive le template
   */
  deactivate(): NotificationTemplate {
    if (!this._isActive) {
      return this; // Déjà inactif
    }

    return new NotificationTemplate(
      this._id,
      this._name,
      this._eventType,
      this._description,
      this._businessId,
      this._language,
      this._channelConfigs,
      false, // isActive
      this._version,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Crée une nouvelle version du template avec des modifications
   */
  createNewVersion(
    updates: Partial<CreateNotificationTemplateData>,
  ): NotificationTemplate {
    return new NotificationTemplate(
      this._id,
      updates.name || this._name,
      updates.eventType || this._eventType,
      updates.description !== undefined
        ? updates.description
        : this._description,
      updates.businessId !== undefined ? updates.businessId : this._businessId,
      updates.language || this._language,
      updates.channelConfigs
        ? new Map(updates.channelConfigs)
        : this._channelConfigs,
      updates.isActive !== undefined ? updates.isActive : this._isActive,
      this._version + 1, // Increment version
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Equality check
   */
  equals(other: NotificationTemplate): boolean {
    return this._id === other._id && this._version === other._version;
  }

  /**
   * String representation
   */
  toString(): string {
    return `NotificationTemplate(${this._id}): ${this._name} v${this._version} - ${this._eventType}`;
  }
}
