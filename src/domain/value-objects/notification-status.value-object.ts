/**
 * @fileoverview NotificationStatus Value Object
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { DomainError } from '../exceptions/domain.exceptions';

/**
 * Enum pour les statuts de notification
 */
export enum NotificationStatusType {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Value Object pour représenter le statut d'une notification
 * Encapsule la logique de transition d'état et les règles métier
 */
export class NotificationStatus {
  private constructor(private readonly _status: NotificationStatusType) {}

  /**
   * Factory method pour créer un NotificationStatus
   * @param status - Statut de la notification
   * @returns NotificationStatus instance
   * @throws DomainError si le statut n'est pas valide
   */
  static create(status: string): NotificationStatus {
    if (!status || typeof status !== 'string') {
      throw new DomainError('Notification status is required');
    }

    const normalizedStatus = status.toUpperCase().trim();

    if (
      !Object.values(NotificationStatusType).includes(
        normalizedStatus as NotificationStatusType,
      )
    ) {
      throw new DomainError(
        `Invalid notification status: ${status}. Valid statuses are: ${Object.values(NotificationStatusType).join(', ')}`,
      );
    }

    return new NotificationStatus(normalizedStatus as NotificationStatusType);
  }

  /**
   * Méthodes factory pour chaque statut
   */
  static pending(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.PENDING);
  }

  static sent(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.SENT);
  }

  static delivered(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.DELIVERED);
  }

  static read(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.READ);
  }

  static failed(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.FAILED);
  }

  static cancelled(): NotificationStatus {
    return new NotificationStatus(NotificationStatusType.CANCELLED);
  }

  /**
   * Factory method pour créer depuis string
   */
  static fromString(statusString: string): NotificationStatus {
    if (!statusString || typeof statusString !== 'string') {
      throw new DomainError('Status string is required');
    }

    const normalizedStatus = statusString.toUpperCase().trim();

    if (
      !Object.values(NotificationStatusType).includes(
        normalizedStatus as NotificationStatusType,
      )
    ) {
      throw new DomainError(
        `Invalid notification status: ${statusString}. Valid statuses are: ${Object.values(NotificationStatusType).join(', ')}`,
      );
    }

    return new NotificationStatus(normalizedStatus as NotificationStatusType);
  }

  /**
   * Getters
   */
  getStatus(): NotificationStatusType {
    return this._status;
  }

  getValue(): string {
    return this._status;
  }

  /**
   * Méthodes métier pour vérification des statuts
   */
  isPending(): boolean {
    return this._status === NotificationStatusType.PENDING;
  }

  isSent(): boolean {
    return this._status === NotificationStatusType.SENT;
  }

  isDelivered(): boolean {
    return this._status === NotificationStatusType.DELIVERED;
  }

  isRead(): boolean {
    return this._status === NotificationStatusType.READ;
  }

  isFailed(): boolean {
    return this._status === NotificationStatusType.FAILED;
  }

  isCancelled(): boolean {
    return this._status === NotificationStatusType.CANCELLED;
  }

  /**
   * Statuts terminaux (ne peuvent plus changer)
   */
  isTerminal(): boolean {
    return [
      NotificationStatusType.READ,
      NotificationStatusType.FAILED,
      NotificationStatusType.CANCELLED,
    ].includes(this._status);
  }

  /**
   * Statuts actifs (peuvent encore évoluer)
   */
  isActive(): boolean {
    return [
      NotificationStatusType.PENDING,
      NotificationStatusType.SENT,
      NotificationStatusType.DELIVERED,
    ].includes(this._status);
  }

  /**
   * Vérifie si la transition vers un nouveau statut est valide
   */
  canTransitionTo(newStatus: NotificationStatus): boolean {
    if (this.isTerminal()) {
      return false; // Les statuts terminaux ne peuvent pas changer
    }

    const currentStatus = this._status;
    const targetStatus = newStatus._status;

    // Règles de transition valides
    const validTransitions: Record<
      NotificationStatusType,
      NotificationStatusType[]
    > = {
      [NotificationStatusType.PENDING]: [
        NotificationStatusType.SENT,
        NotificationStatusType.FAILED,
        NotificationStatusType.CANCELLED,
      ],
      [NotificationStatusType.SENT]: [
        NotificationStatusType.DELIVERED,
        NotificationStatusType.FAILED,
        NotificationStatusType.CANCELLED,
      ],
      [NotificationStatusType.DELIVERED]: [
        NotificationStatusType.READ,
        NotificationStatusType.FAILED,
      ],
      [NotificationStatusType.READ]: [], // Terminal
      [NotificationStatusType.FAILED]: [], // Terminal
      [NotificationStatusType.CANCELLED]: [], // Terminal
    };

    return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
  }

  /**
   * Retourne les statuts suivants possibles
   */
  getNextPossibleStatuses(): NotificationStatus[] {
    if (this.isTerminal()) {
      return [];
    }

    const transitions: Record<
      NotificationStatusType,
      NotificationStatusType[]
    > = {
      [NotificationStatusType.PENDING]: [
        NotificationStatusType.SENT,
        NotificationStatusType.FAILED,
        NotificationStatusType.CANCELLED,
      ],
      [NotificationStatusType.SENT]: [
        NotificationStatusType.DELIVERED,
        NotificationStatusType.FAILED,
        NotificationStatusType.CANCELLED,
      ],
      [NotificationStatusType.DELIVERED]: [
        NotificationStatusType.READ,
        NotificationStatusType.FAILED,
      ],
      [NotificationStatusType.READ]: [],
      [NotificationStatusType.FAILED]: [],
      [NotificationStatusType.CANCELLED]: [],
    };

    return (
      transitions[this._status]?.map(
        (status) => new NotificationStatus(status),
      ) ?? []
    );
  }

  /**
   * Vérifie si une nouvelle tentative est possible
   */
  canRetry(): boolean {
    return this._status === NotificationStatusType.FAILED;
  }

  /**
   * Equality check
   */
  equals(other: NotificationStatus): boolean {
    return this._status === other._status;
  }

  /**
   * String representation
   */
  toString(): string {
    return this._status;
  }
}
