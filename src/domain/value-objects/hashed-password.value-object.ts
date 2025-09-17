/**
 * 🔐 HashedPassword Value Object
 * ✅ Clean Architecture - Domain Layer
 * ✅ Immutable Value Object PURE (sans dépendances externes)
 * ✅ Encapsule seulement la validation et l'égalité
 */

import { DomainError } from '../exceptions/domain.error';

export class HashedPassword {
  private constructor(private readonly _value: string) {
    this.validateNotEmpty(_value);
  }

  /**
   * Obtient la valeur du hash
   */
  get value(): string {
    return this._value;
  }

  /**
   * Crée une instance depuis un hash existant
   * ⚠️ IMPORTANT: La validation du format se fait via IPasswordHasher (Infrastructure)
   */
  static create(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  /**
   * Compare deux instances HashedPassword
   */
  equals(other: HashedPassword): boolean {
    if (!(other instanceof HashedPassword)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Validation basique (seulement non-vide)
   * ⚠️ La validation du format se fait via IPasswordHashher (Infrastructure)
   */
  private validateNotEmpty(hash: string): void {
    if (!hash || hash.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
  }

  /**
   * Sérialisation pour persistance
   */
  toString(): string {
    return this._value;
  }
}
