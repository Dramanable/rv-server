/**
 * 🏛️ DOMAIN VALUE OBJECT - Email
 *
 * Value Object pour représenter un email avec validation complète
 * Immutable et auto-validant
 */

import { ValueObjectValidationError } from "../exceptions/domain.exceptions";

export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validateNotEmpty(email);
    this.validateLength(email);
    this.validateFormat(email);

    // Normalisation : trim et lowercase
    this.value = email.trim().toLowerCase();
  }

  /**
   * Factory method pour créer un Email
   */
  static create(email: string): Email {
    return new Email(email);
  }

  /**
   * Récupère la valeur de l'email
   */
  getValue(): string {
    return this.value;
  }

  private validateNotEmpty(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new ValueObjectValidationError(
        "EMAIL_EMPTY",
        "Email cannot be empty",
        { email },
      );
    }
  }

  private validateLength(email: string): void {
    if (email.length > 254) {
      // RFC 5321 limite
      throw new ValueObjectValidationError("EMAIL_TOO_LONG", "Email too long", {
        email,
        length: email.length,
      });
    }
  }

  private validateFormat(email: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      throw new ValueObjectValidationError(
        "EMAIL_INVALID_FORMAT",
        "Invalid email format",
        { email },
      );
    }
  }

  /**
   * Compare deux emails par valeur
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Retourne la représentation string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Extrait le domaine de l'email
   */
  getDomain(): string {
    return this.value.split("@")[1];
  }

  /**
   * Extrait la partie locale (avant @)
   */
  getLocalPart(): string {
    return this.value.split("@")[0];
  }
}
