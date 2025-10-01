/**
 * @fileoverview Notification Domain Entity
 * @module Domain/Entities
 * @version 1.0.0
 */

import { DomainError } from "../exceptions/domain.exceptions";
import { NotificationChannel } from "../value-objects/notification-channel.value-object";
import { NotificationPriority } from "../value-objects/notification-priority.value-object";
import { NotificationStatus } from "../value-objects/notification-status.value-object";

/**
 * Interface pour les métadonnées de notification
 */
export interface NotificationMetadata {
  readonly appointmentId?: string;
  readonly businessId?: string;
  readonly serviceId?: string;
  readonly staffId?: string;
  readonly templateId?: string;
  readonly originalEventType?: string;
  readonly retryCount?: number;
  readonly scheduledFor?: Date;
  readonly expiresAt?: Date;
  readonly correlationId?: string;
}

/**
 * Interface pour les données de création d'une notification
 */
export interface CreateNotificationData {
  readonly recipientId: string;
  readonly title: string;
  readonly content: string;
  readonly channel: NotificationChannel;
  readonly priority?: NotificationPriority;
  readonly status?: NotificationStatus;
  readonly metadata?: NotificationMetadata;
  readonly scheduledFor?: Date;
}

/**
 * Interface pour la reconstruction d'une notification
 */
export interface ReconstructNotificationData extends CreateNotificationData {
  readonly id: string;
  readonly status: NotificationStatus;
  readonly sentAt?: Date;
  readonly deliveredAt?: Date;
  readonly readAt?: Date;
  readonly failureReason?: string;
  readonly retryCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entité métier représentant une notification
 * Encapsule toute la logique métier liée aux notifications
 */
export class Notification {
  private constructor(
    private readonly _id: string,
    private readonly _recipientId: string,
    private readonly _title: string,
    private readonly _content: string,
    private readonly _channel: NotificationChannel,
    private readonly _priority: NotificationPriority,
    private readonly _status: NotificationStatus,
    private readonly _metadata: NotificationMetadata,
    private readonly _sentAt?: Date,
    private readonly _deliveredAt?: Date,
    private readonly _readAt?: Date,
    private readonly _failureReason?: string,
    private readonly _retryCount: number = 0,
    private readonly _scheduledFor?: Date,
    private readonly _createdAt: Date = new Date(),
    private readonly _updatedAt: Date = new Date(),
  ) {
    this.validateInvariants();
  }

  /**
   * Factory method pour créer une nouvelle notification
   */
  static create(data: CreateNotificationData): Notification {
    const id = this.generateId();
    const priority = data.priority || NotificationPriority.medium();
    const status = NotificationStatus.pending();
    const metadata = data.metadata || {};

    return new Notification(
      id,
      data.recipientId,
      data.title,
      data.content,
      data.channel,
      priority,
      status,
      metadata,
      undefined, // sentAt
      undefined, // deliveredAt
      undefined, // readAt
      undefined, // failureReason
      0, // retryCount
      data.scheduledFor,
      new Date(), // createdAt
      new Date(), // updatedAt
    );
  }

  /**
   * Factory method pour reconstruire une notification depuis la persistence
   */
  static reconstruct(data: ReconstructNotificationData): Notification {
    return new Notification(
      data.id,
      data.recipientId,
      data.title,
      data.content,
      data.channel,
      data.priority || NotificationPriority.medium(),
      data.status,
      data.metadata || {},
      data.sentAt,
      data.deliveredAt,
      data.readAt,
      data.failureReason,
      data.retryCount,
      data.scheduledFor,
      data.createdAt,
      data.updatedAt,
    );
  }

  /**
   * Génère un ID unique pour la notification
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Valide les invariants métier
   */
  private validateInvariants(): void {
    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError("Notification ID is required");
    }

    if (!this._recipientId || this._recipientId.trim().length === 0) {
      throw new DomainError("Recipient ID is required");
    }

    if (!this._title || this._title.trim().length === 0) {
      throw new DomainError("Notification title is required");
    }

    if (!this._content || this._content.trim().length === 0) {
      throw new DomainError("Notification content is required");
    }

    if (this._title.length > 255) {
      throw new DomainError("Notification title cannot exceed 255 characters");
    }

    if (this._content.length > 2000) {
      throw new DomainError(
        "Notification content cannot exceed 2000 characters",
      );
    }

    if (this._retryCount < 0) {
      throw new DomainError("Retry count cannot be negative");
    }

    if (this._retryCount > 10) {
      throw new DomainError("Maximum retry count exceeded");
    }

    // Validation des dates logiques
    if (this._sentAt && this._sentAt < this._createdAt) {
      throw new DomainError("Sent date cannot be before creation date");
    }

    if (this._deliveredAt && this._sentAt && this._deliveredAt < this._sentAt) {
      throw new DomainError("Delivered date cannot be before sent date");
    }

    if (this._readAt && this._deliveredAt && this._readAt < this._deliveredAt) {
      throw new DomainError("Read date cannot be before delivered date");
    }
  }

  /**
   * Getters
   */
  getId(): string {
    return this._id;
  }

  getRecipientId(): string {
    return this._recipientId;
  }

  getTitle(): string {
    return this._title;
  }

  getContent(): string {
    return this._content;
  }

  getChannel(): NotificationChannel {
    return this._channel;
  }

  getPriority(): NotificationPriority {
    return this._priority;
  }

  getStatus(): NotificationStatus {
    return this._status;
  }

  getMetadata(): NotificationMetadata {
    return { ...this._metadata };
  }

  getSentAt(): Date | undefined {
    return this._sentAt;
  }

  getDeliveredAt(): Date | undefined {
    return this._deliveredAt;
  }

  getReadAt(): Date | undefined {
    return this._readAt;
  }

  getFailureReason(): string | undefined {
    return this._failureReason;
  }

  getRetryCount(): number {
    return this._retryCount;
  }

  getScheduledFor(): Date | undefined {
    return this._scheduledFor;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Méthodes métier pour la gestion du cycle de vie
   */

  /**
   * Marque la notification comme envoyée
   */
  markAsSent(): Notification {
    if (!this._status.canTransitionTo(NotificationStatus.sent())) {
      throw new DomainError(
        `Cannot mark notification as sent from status: ${this._status.getValue()}`,
      );
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.sent(),
      this._metadata,
      new Date(), // sentAt
      this._deliveredAt,
      this._readAt,
      this._failureReason,
      this._retryCount,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Marque la notification comme livrée
   */
  markAsDelivered(): Notification {
    if (!this._status.canTransitionTo(NotificationStatus.delivered())) {
      throw new DomainError(
        `Cannot mark notification as delivered from status: ${this._status.getValue()}`,
      );
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.delivered(),
      this._metadata,
      this._sentAt,
      new Date(), // deliveredAt
      this._readAt,
      this._failureReason,
      this._retryCount,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Marque la notification comme lue
   */
  markAsRead(): Notification {
    if (!this._status.canTransitionTo(NotificationStatus.read())) {
      throw new DomainError(
        `Cannot mark notification as read from status: ${this._status.getValue()}`,
      );
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.read(),
      this._metadata,
      this._sentAt,
      this._deliveredAt,
      new Date(), // readAt
      this._failureReason,
      this._retryCount,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Marque la notification comme échouée
   */
  markAsFailed(reason: string): Notification {
    if (!this._status.canTransitionTo(NotificationStatus.failed())) {
      throw new DomainError(
        `Cannot mark notification as failed from status: ${this._status.getValue()}`,
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainError("Failure reason is required");
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.failed(),
      this._metadata,
      this._sentAt,
      this._deliveredAt,
      this._readAt,
      reason.trim(),
      this._retryCount,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Annule la notification
   */
  cancel(): Notification {
    if (!this._status.canTransitionTo(NotificationStatus.cancelled())) {
      throw new DomainError(
        `Cannot cancel notification from status: ${this._status.getValue()}`,
      );
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.cancelled(),
      this._metadata,
      this._sentAt,
      this._deliveredAt,
      this._readAt,
      this._failureReason,
      this._retryCount,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Incrémente le compteur de retry
   */
  incrementRetryCount(): Notification {
    if (!this._status.canRetry()) {
      throw new DomainError("Cannot retry notification with current status");
    }

    const maxRetries = this._priority.getMaxRetryAttempts();
    if (this._retryCount >= maxRetries) {
      throw new DomainError(`Maximum retry attempts (${maxRetries}) exceeded`);
    }

    return new Notification(
      this._id,
      this._recipientId,
      this._title,
      this._content,
      this._channel,
      this._priority,
      NotificationStatus.pending(), // Reset to pending for retry
      this._metadata,
      undefined, // Reset sentAt
      undefined, // Reset deliveredAt
      this._readAt,
      undefined, // Clear failure reason
      this._retryCount + 1,
      this._scheduledFor,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  /**
   * Méthodes métier pour la logique business
   */

  /**
   * Vérifie si la notification est prête à être envoyée
   */
  isReadyToSend(): boolean {
    if (!this._status.isPending()) {
      return false;
    }

    if (this._scheduledFor && this._scheduledFor > new Date()) {
      return false; // Pas encore l'heure
    }

    return true;
  }

  /**
   * Vérifie si la notification a expiré
   */
  isExpired(): boolean {
    if (!this._metadata.expiresAt) {
      return false;
    }

    return new Date() > this._metadata.expiresAt;
  }

  /**
   * Vérifie si la notification peut être supprimée
   */
  canBeDeleted(): boolean {
    return this._status.isTerminal() || this.isExpired();
  }

  /**
   * Retourne l'âge de la notification en minutes
   */
  getAgeInMinutes(): number {
    return Math.floor(
      (new Date().getTime() - this._createdAt.getTime()) / (1000 * 60),
    );
  }

  /**
   * Vérifie si la notification est relative à un rendez-vous
   */
  isAppointmentRelated(): boolean {
    return !!this._metadata.appointmentId;
  }

  /**
   * Equality check
   */
  equals(other: Notification): boolean {
    return this._id === other._id;
  }

  /**
   * String representation
   */
  toString(): string {
    return `Notification(${this._id}): ${this._title} - ${this._status.getValue()}`;
  }
}
