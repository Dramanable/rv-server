/**
 * 🔐 DOMAIN ENTITY - Password Reset Code
 *
 * Entité métier pour les codes de réinitialisation de mot de passe à 4 chiffres.
 * Implémentation TDD suivant les tests définis.
 *
 * BUSINESS RULES :
 * - Code à exactement 4 chiffres
 * - Expire après 15 minutes
 * - Un seul usage possible
 * - Évite les patterns prévisibles
 */

import { DomainValidationError } from "../exceptions/domain.exceptions";

export interface PasswordResetCodeData {
  readonly id?: string;
  readonly code: string;
  readonly userId: string;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly usedAt: Date | null;
  readonly isExpired: boolean;
  readonly isUsed: boolean;
  readonly isValid: boolean;
  readonly remainingTimeInMinutes: number;
}

export class PasswordResetCode {
  private readonly _code: string;
  private readonly _userId: string;
  private readonly _expiresAt: Date;
  private readonly _createdAt: Date;
  private _usedAt: Date | null;
  public readonly id?: string;

  private constructor(
    code: string,
    userId: string,
    expiresAt: Date,
    createdAt: Date,
    usedAt: Date | null = null,
    id?: string,
  ) {
    this.validateCode(code);
    this._code = code;
    this._userId = userId;
    this._expiresAt = expiresAt;
    this._createdAt = createdAt;
    this._usedAt = usedAt;
    this.id = id;
  }

  // === FACTORY METHODS ===

  static create(userId: string): PasswordResetCode {
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new DomainValidationError(
        "UserId is required for password reset code",
      );
    }

    const code = this.generateSecureCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const createdAt = new Date();

    return new PasswordResetCode(code, userId, expiresAt, createdAt);
  }

  static fromData(data: {
    id?: string;
    code: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    usedAt: Date | null;
  }): PasswordResetCode {
    return new PasswordResetCode(
      data.code,
      data.userId,
      data.expiresAt,
      data.createdAt,
      data.usedAt,
      data.id,
    );
  }

  // === GETTERS ===

  get code(): string {
    return this._code;
  }

  get userId(): string {
    return this._userId;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get usedAt(): Date | null {
    return this._usedAt;
  }

  get isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  get isUsed(): boolean {
    return this._usedAt !== null;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isUsed;
  }

  get remainingTimeInMinutes(): number {
    if (this.isExpired) return 0;

    const now = new Date();
    const diffMs = this._expiresAt.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60));
  }

  // === BUSINESS METHODS ===

  matches(inputCode: string): boolean {
    this.validateCode(inputCode);
    return this._code === inputCode;
  }

  markAsUsed(): void {
    if (this.isExpired) {
      throw new DomainValidationError("Cannot use expired password reset code");
    }

    if (this.isUsed) {
      throw new DomainValidationError(
        "Password reset code has already been used",
      );
    }

    this._usedAt = new Date();
  }

  toData(): PasswordResetCodeData {
    return {
      id: this.id,
      code: this._code,
      userId: this._userId,
      expiresAt: this._expiresAt,
      createdAt: this._createdAt,
      usedAt: this._usedAt,
      isExpired: this.isExpired,
      isUsed: this.isUsed,
      isValid: this.isValid,
      remainingTimeInMinutes: this.remainingTimeInMinutes,
    };
  }

  // === PRIVATE METHODS ===

  private static generateSecureCode(): string {
    const avoidPatterns = [
      "0000",
      "1111",
      "2222",
      "3333",
      "4444",
      "5555",
      "6666",
      "7777",
      "8888",
      "9999",
      "1234",
      "4321",
    ];

    let code: string;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      attempts++;

      if (attempts > maxAttempts) {
        break; // Évite une boucle infinie improbable
      }
    } while (avoidPatterns.includes(code));

    return code;
  }

  private validateCode(code: string): void {
    if (
      !code ||
      typeof code !== "string" ||
      code.length !== 4 ||
      !/^\d{4}$/.test(code)
    ) {
      throw new DomainValidationError(
        "Password reset code must be exactly 4 digits",
      );
    }
  }
}
