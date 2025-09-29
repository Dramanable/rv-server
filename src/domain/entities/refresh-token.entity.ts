/**
 * 🏛️ DOMAIN ENTITY - Refresh Token
 *
 * Entité métier pour la gestion des tokens de rafraîchissement.
 * Gère le cycle de vie des tokens avec rotation automatique et sécurité.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Aucune dépendance vers l'infrastructure
 * - Logique métier pure pour la sécurité des tokens
 * - Entité auto-validante avec expiration
 */

import {
  TokenAlreadyRevokedError,
  TokenValidationError,
} from '../exceptions/auth.exceptions';

export class RefreshToken {
  public readonly id: string;
  public readonly userId: string;
  public readonly tokenHash: string; // Token hashé pour stockage sécurisé
  public readonly deviceId?: string;
  public readonly userAgent?: string;
  public readonly ipAddress?: string;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;
  public readonly isRevoked: boolean;
  public readonly revokedAt?: Date;
  public readonly revokedReason?: string;

  constructor(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceId?: string,
    userAgent?: string,
    ipAddress?: string,
    skipValidation = false,
  ) {
    if (!skipValidation) {
      this.validateInputs(userId, token, expiresAt);
    } else {
      this.validateBasicInputs(userId, token);
    }

    this.id = this.generateId();
    this.userId = userId;
    this.tokenHash = this.hashToken(token); // Hash du token pour sécurité
    this.deviceId = deviceId;
    this.userAgent = userAgent;
    this.ipAddress = ipAddress;
    this.expiresAt = expiresAt;
    this.createdAt = new Date();
    this.isRevoked = false;
  }

  /**
   * Révoque le token avec une raison
   */
  revoke(reason: string): RefreshToken {
    if (this.isRevoked) {
      throw new TokenAlreadyRevokedError('Token is already revoked');
    }

    return new RefreshToken(
      this.userId,
      'dummy-token-for-revoked-with-minimum-length-32chars', // Token dummy valide
      this.expiresAt,
      this.deviceId,
      this.userAgent,
      this.ipAddress,
      true, // Skip validation pour token révoqué
    ).withRevocation(reason);
  }

  /**
   * Vérifie si le token fourni correspond au hash stocké
   */
  verifyToken(plainToken: string): boolean {
    return this.hashToken(plainToken) === this.tokenHash;
  }

  /**
   * Vérifie si le token est valide (non expiré et non révoqué)
   */
  isValid(): boolean {
    const now = new Date();
    return !this.isRevoked && now < this.expiresAt;
  }

  /**
   * Vérifie si le token est expiré
   */
  isExpired(): boolean {
    const now = new Date();
    return now >= this.expiresAt;
  }

  /**
   * Calcule le temps restant avant expiration en secondes
   */
  getTimeToExpiry(): number {
    const now = new Date();
    const diffMs = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }

  /**
   * Vérifie si le token correspond à un appareil spécifique
   */
  matchesDevice(deviceId?: string, userAgent?: string): boolean {
    if (this.deviceId && deviceId) {
      return this.deviceId === deviceId;
    }

    if (this.userAgent && userAgent) {
      return this.userAgent === userAgent;
    }

    return true; // Si pas d'info d'appareil, on accepte
  }

  /**
   * Crée une version révoquée du token
   */
  private withRevocation(reason: string): RefreshToken {
    const revoked = Object.create(RefreshToken.prototype) as RefreshToken;
    Object.assign(revoked, this);

    Object.defineProperties(revoked, {
      isRevoked: { value: true, writable: false },
      revokedAt: { value: new Date(), writable: false },
      revokedReason: { value: reason, writable: false },
    });

    return revoked;
  }

  /**
   * Validation des entrées
   */
  private validateInputs(userId: string, token: string, expiresAt: Date): void {
    this.validateBasicInputs(userId, token);

    if (expiresAt <= new Date()) {
      throw new TokenValidationError('Expiration date must be in the future');
    }

    // Vérification que l'expiration n'est pas trop lointaine (max 1 an)
    const maxExpiry = new Date();
    maxExpiry.setFullYear(maxExpiry.getFullYear() + 1);

    if (expiresAt > maxExpiry) {
      throw new TokenValidationError(
        'Expiration date cannot be more than 1 year in the future',
      );
    }
  }

  /**
   * Validation basique (sans vérification de date)
   */
  private validateBasicInputs(userId: string, token: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new TokenValidationError('User ID cannot be empty');
    }

    if (!token || token.trim().length === 0) {
      throw new TokenValidationError('Token cannot be empty');
    }

    if (token.length < 32) {
      throw new TokenValidationError(
        'Token must be at least 32 characters long',
      );
    }
  }

  /**
   * Hash le token pour stockage sécurisé
   */
  private hashToken(token: string): string {
    // Simulation d'un hash crypto - en production, utiliser crypto.createHash
    // ou bcrypt pour le hashing sécurisé
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Génère un ID unique pour le token
   */
  private generateId(): string {
    // Simulation d'un UUID - en production, utiliser crypto.randomUUID()
    return (
      'rt_' +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Égalité basée sur l'ID
   */
  equals(other: RefreshToken): boolean {
    return this.id === other.id;
  }

  /**
   * Représentation string pour debug
   */
  toString(): string {
    return `RefreshToken(id=${this.id}, userId=${this.userId}, valid=${this.isValid()})`;
  }

  /**
   * 🔄 Méthode de reconstruction pour les repositories
   * Permet de recréer une entité depuis les données persistées
   */
  static reconstruct(
    id: string,
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    metadata: {
      deviceId?: string;
      userAgent?: string;
      ipAddress?: string;
    },
    isRevoked: boolean = false,
    revokedAt?: Date,
    createdAt?: Date,
  ): RefreshToken {
    // Créer un token temporaire pour la reconstruction
    const tempToken = 'temp-reconstruction-token-32chars-min';
    const instance = new RefreshToken(
      userId,
      tempToken,
      expiresAt,
      metadata.deviceId,
      metadata.userAgent,
      metadata.ipAddress,
      true, // Skip validation pour reconstruction
    );

    // Override les propriétés avec les vraies valeurs
    Object.defineProperty(instance, 'id', { value: id, writable: false });
    Object.defineProperty(instance, 'tokenHash', {
      value: tokenHash,
      writable: false,
    });
    Object.defineProperty(instance, 'isRevoked', {
      value: isRevoked,
      writable: false,
    });
    Object.defineProperty(instance, 'revokedAt', {
      value: revokedAt,
      writable: false,
    });
    Object.defineProperty(instance, 'createdAt', {
      value: createdAt || new Date(),
      writable: false,
    });

    return instance;
  }
}
