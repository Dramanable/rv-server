/**
 * @fileoverview NotificationPriority Value Object
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { DomainError } from "../exceptions/domain.exceptions";

/**
 * Enum pour les niveaux de priorité de notification
 */
export enum NotificationPriorityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/**
 * Value Object pour représenter la priorité d'une notification
 * Encapsule la logique de priorité et les règles métier associées
 */
export class NotificationPriority {
  private constructor(private readonly _level: NotificationPriorityLevel) {}

  /**
   * Factory method pour créer une NotificationPriority
   * @param level - Niveau de priorité
   * @returns NotificationPriority instance
   * @throws DomainError si le niveau n'est pas valide
   */
  static create(level: string): NotificationPriority {
    if (!level || typeof level !== "string") {
      throw new DomainError("Notification priority level is required");
    }

    const normalizedLevel = level.toUpperCase().trim();

    if (
      !Object.values(NotificationPriorityLevel).includes(
        normalizedLevel as NotificationPriorityLevel,
      )
    ) {
      throw new DomainError(
        `Invalid notification priority level: ${level}. Valid levels are: ${Object.values(NotificationPriorityLevel).join(", ")}`,
      );
    }

    return new NotificationPriority(
      normalizedLevel as NotificationPriorityLevel,
    );
  }

  /**
   * Méthodes factory pour chaque niveau
   */
  static low(): NotificationPriority {
    return new NotificationPriority(NotificationPriorityLevel.LOW);
  }

  static medium(): NotificationPriority {
    return new NotificationPriority(NotificationPriorityLevel.MEDIUM);
  }

  static high(): NotificationPriority {
    return new NotificationPriority(NotificationPriorityLevel.HIGH);
  }

  static urgent(): NotificationPriority {
    return new NotificationPriority(NotificationPriorityLevel.URGENT);
  }

  /**
   * Factory method pour créer depuis string
   */
  static fromString(levelString: string): NotificationPriority {
    if (!levelString || typeof levelString !== "string") {
      throw new DomainError("Priority level string is required");
    }

    const normalizedLevel = levelString.toUpperCase().trim();

    if (
      !Object.values(NotificationPriorityLevel).includes(
        normalizedLevel as NotificationPriorityLevel,
      )
    ) {
      throw new DomainError(
        `Invalid priority level: ${levelString}. Valid levels are: ${Object.values(NotificationPriorityLevel).join(", ")}`,
      );
    }

    return new NotificationPriority(
      normalizedLevel as NotificationPriorityLevel,
    );
  }

  /**
   * Getters
   */
  getLevel(): NotificationPriorityLevel {
    return this._level;
  }

  getValue(): string {
    return this._level;
  }

  /**
   * Méthodes métier pour comparaison de priorités
   */
  isLow(): boolean {
    return this._level === NotificationPriorityLevel.LOW;
  }

  isMedium(): boolean {
    return this._level === NotificationPriorityLevel.MEDIUM;
  }

  isHigh(): boolean {
    return this._level === NotificationPriorityLevel.HIGH;
  }

  isUrgent(): boolean {
    return this._level === NotificationPriorityLevel.URGENT;
  }

  /**
   * Retourne la valeur numérique pour comparaison
   */
  getNumericValue(): number {
    switch (this._level) {
      case NotificationPriorityLevel.LOW:
        return 1;
      case NotificationPriorityLevel.MEDIUM:
        return 2;
      case NotificationPriorityLevel.HIGH:
        return 3;
      case NotificationPriorityLevel.URGENT:
        return 4;
      default:
        return 1;
    }
  }

  /**
   * Compare avec une autre priorité
   */
  isHigherThan(other: NotificationPriority): boolean {
    return this.getNumericValue() > other.getNumericValue();
  }

  isLowerThan(other: NotificationPriority): boolean {
    return this.getNumericValue() < other.getNumericValue();
  }

  /**
   * Retourne le délai de traitement recommandé en minutes
   */
  getRecommendedProcessingDelay(): number {
    switch (this._level) {
      case NotificationPriorityLevel.URGENT:
        return 0; // Immédiat
      case NotificationPriorityLevel.HIGH:
        return 1; // 1 minute
      case NotificationPriorityLevel.MEDIUM:
        return 5; // 5 minutes
      case NotificationPriorityLevel.LOW:
        return 15; // 15 minutes
      default:
        return 15;
    }
  }

  /**
   * Retourne le nombre maximal de tentatives de retry
   */
  getMaxRetryAttempts(): number {
    switch (this._level) {
      case NotificationPriorityLevel.URGENT:
        return 5;
      case NotificationPriorityLevel.HIGH:
        return 3;
      case NotificationPriorityLevel.MEDIUM:
        return 2;
      case NotificationPriorityLevel.LOW:
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Equality check
   */
  equals(other: NotificationPriority): boolean {
    return this._level === other._level;
  }

  /**
   * String representation
   */
  toString(): string {
    return this._level;
  }

  /**
   * Récupère toutes les valeurs de priorité autorisées
   */
  static getAllowedValues(): string[] {
    return Object.values(NotificationPriorityLevel);
  }
}
