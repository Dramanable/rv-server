/**
 * @fileoverview NotificationChannel Value Object
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { DomainError } from '../exceptions/domain.exceptions';

/**
 * Enum pour les canaux de notification supportés
 */
export enum NotificationChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

/**
 * Value Object pour représenter un canal de notification
 * Encapsule la logique de validation et les règles métier des canaux
 */
export class NotificationChannel {
  private constructor(private readonly _type: NotificationChannelType) {}

  /**
   * Factory method pour créer un NotificationChannel
   * @param type - Type de canal de notification
   * @returns NotificationChannel instance
   * @throws DomainError si le type n'est pas valide
   */
  static create(type: string): NotificationChannel {
    if (!type || typeof type !== 'string') {
      throw new DomainError('Notification channel type is required');
    }

    const normalizedType = type.toUpperCase().trim();

    if (
      !Object.values(NotificationChannelType).includes(
        normalizedType as NotificationChannelType,
      )
    ) {
      throw new DomainError(
        `Invalid notification channel type: ${type}. Valid types are: ${Object.values(NotificationChannelType).join(', ')}`,
      );
    }

    return new NotificationChannel(normalizedType as NotificationChannelType);
  }

  /**
   * Factory method alternatif pour créer depuis string
   * @param typeString - Type de canal comme string
   * @returns NotificationChannel instance
   */
  static fromString(typeString: string): NotificationChannel {
    return NotificationChannel.create(typeString);
  }

  /**
   * Méthodes factory pour chaque type de canal
   */
  static email(): NotificationChannel {
    return new NotificationChannel(NotificationChannelType.EMAIL);
  }

  static sms(): NotificationChannel {
    return new NotificationChannel(NotificationChannelType.SMS);
  }

  static push(): NotificationChannel {
    return new NotificationChannel(NotificationChannelType.PUSH);
  }

  static inApp(): NotificationChannel {
    return new NotificationChannel(NotificationChannelType.IN_APP);
  }

  /**
   * Getters
   */
  getType(): NotificationChannelType {
    return this._type;
  }

  getValue(): string {
    return this._type;
  }

  /**
   * Méthodes métier pour validation des canaux
   */
  isEmail(): boolean {
    return this._type === NotificationChannelType.EMAIL;
  }

  isSms(): boolean {
    return this._type === NotificationChannelType.SMS;
  }

  isPush(): boolean {
    return this._type === NotificationChannelType.PUSH;
  }

  isInApp(): boolean {
    return this._type === NotificationChannelType.IN_APP;
  }

  /**
   * Vérifie si le canal nécessite une connexion internet
   */
  requiresInternet(): boolean {
    return [
      NotificationChannelType.EMAIL,
      NotificationChannelType.PUSH,
      NotificationChannelType.IN_APP,
    ].includes(this._type);
  }

  /**
   * Vérifie si le canal est instantané
   */
  isInstantaneous(): boolean {
    return [
      NotificationChannelType.PUSH,
      NotificationChannelType.IN_APP,
    ].includes(this._type);
  }

  /**
   * Retourne la priorité par défaut pour ce canal
   */
  getDefaultPriority(): 'LOW' | 'MEDIUM' | 'HIGH' {
    switch (this._type) {
      case NotificationChannelType.EMAIL:
        return 'LOW';
      case NotificationChannelType.SMS:
        return 'HIGH';
      case NotificationChannelType.PUSH:
        return 'MEDIUM';
      case NotificationChannelType.IN_APP:
        return 'MEDIUM';
      default:
        return 'LOW';
    }
  }

  /**
   * Vérifie si le canal supporte le contenu riche (HTML, images, etc.)
   */
  supportsRichContent(): boolean {
    return [
      NotificationChannelType.EMAIL,
      NotificationChannelType.IN_APP,
      NotificationChannelType.PUSH,
    ].includes(this._type);
  }

  /**
   * Vérifie si le canal nécessite un numéro de téléphone
   */
  requiresPhoneNumber(): boolean {
    return this._type === NotificationChannelType.SMS;
  }

  /**
   * Vérifie si le canal nécessite un email
   */
  requiresEmail(): boolean {
    return this._type === NotificationChannelType.EMAIL;
  }

  /**
   * Vérifie si le canal nécessite un device token
   */
  requiresDeviceToken(): boolean {
    return this._type === NotificationChannelType.PUSH;
  }

  /**
   * Retourne les types de canaux qui supportent le contenu riche
   */
  static getRichContentChannels(): NotificationChannel[] {
    return [
      NotificationChannel.email(),
      NotificationChannel.inApp(),
      NotificationChannel.push(),
    ];
  }

  /**
   * Retourne les types de canaux instantanés
   */
  static getInstantaneousChannels(): NotificationChannel[] {
    return [NotificationChannel.push(), NotificationChannel.inApp()];
  }

  /**
   * Retourne tous les canaux supportés
   */
  static getAllChannels(): NotificationChannel[] {
    return [
      NotificationChannel.email(),
      NotificationChannel.sms(),
      NotificationChannel.push(),
      NotificationChannel.inApp(),
    ];
  }

  /**
   * Vérifie si un type de canal donné est valide
   */
  static isValidChannelType(type: string): boolean {
    if (!type || typeof type !== 'string') {
      return false;
    }

    const normalizedType = type.toUpperCase().trim();
    return Object.values(NotificationChannelType).includes(
      normalizedType as NotificationChannelType,
    );
  }

  /**
   * Vérifie si le canal supporte la livraison synchrone
   */
  supportsSynchronousDelivery(): boolean {
    // Tous les canaux supportent la livraison synchrone dans notre système
    return true;
  }

  /**
   * Vérifie si le canal nécessite des informations de destinataire spécifiques
   */
  requiresRecipientInfo(): boolean {
    // IN_APP ne nécessite pas d'info spécifique (utilisateur connecté)
    return this._type !== NotificationChannelType.IN_APP;
  }

  /**
   * Retourne la longueur maximale du contenu pour ce canal
   */
  getMaxContentLength(): number {
    switch (this._type) {
      case NotificationChannelType.EMAIL:
        return Number.MAX_SAFE_INTEGER; // Pas de limite pratique
      case NotificationChannelType.SMS:
        return 160;
      case NotificationChannelType.PUSH:
        return 1000;
      case NotificationChannelType.IN_APP:
        return 5000;
      default:
        return 1000;
    }
  }

  /**
   * Retourne tous les types de canaux valides
   */
  static getAllValidChannels(): NotificationChannelType[] {
    return Object.values(NotificationChannelType);
  }

  /**
   * Alias pour isValidChannelType (compatibilité avec les tests)
   */
  static isValidChannel(type: string): boolean {
    return NotificationChannel.isValidChannelType(type);
  }

  /**
   * Equality check
   */
  equals(other: NotificationChannel): boolean {
    return this._type === other._type;
  }

  /**
   * String representation - Format attendu par les tests
   */
  toString(): string {
    return this._type;
  }

  /**
   * Récupère toutes les valeurs de canal autorisées
   */
  static getAllowedValues(): string[] {
    return Object.values(NotificationChannelType);
  }
}
