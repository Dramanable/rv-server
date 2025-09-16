/**
 * 🏛️ DOMAIN VALUE OBJECT - Email
 *
 * Value Object pour représenter un email avec validation complète
 * Immutable et auto-validant
 */

export class Email {
  public readonly value: string;

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

  private validateNotEmpty(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }
  }

  private validateLength(email: string): void {
    if (email.length > 254) {
      // RFC 5321 limite
      throw new Error('Email too long');
    }
  }

  private validateFormat(email: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format');
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
    return this.value.split('@')[1];
  }

  /**
   * Extrait la partie locale (avant @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }
}
