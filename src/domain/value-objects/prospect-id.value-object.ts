/**
 * 🆔 PROSPECT ID VALUE OBJECT - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Identifiant unique pour les prospects commerciaux
 */

import { v4 as uuidv4 } from 'uuid';
import { ProspectValidationError } from '@domain/exceptions/prospect.exceptions';

export class ProspectId {
  private readonly _value: string;

  private constructor(value: string) {
    this.validateId(value);
    this._value = value;
  }

  /**
   * 🆕 Générer un nouvel ID
   */
  static generate(): ProspectId {
    return new ProspectId(uuidv4());
  }

  /**
   * 🔄 Créer depuis une string existante
   */
  static fromString(value: string): ProspectId {
    return new ProspectId(value);
  }

  /**
   * ✅ Validation de l'ID
   */
  private validateId(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new ProspectValidationError(
        'Prospect ID must be a non-empty string',
      );
    }

    // Validation UUID v4 format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ProspectValidationError('Prospect ID must be a valid UUID v4');
    }
  }

  /**
   * 📤 Obtenir la valeur
   */
  getValue(): string {
    return this._value;
  }

  /**
   * 🔄 Comparaison
   */
  equals(other: ProspectId): boolean {
    return this._value === other._value;
  }

  /**
   * 📄 String representation
   */
  toString(): string {
    return this._value;
  }

  /**
   * 🔄 JSON serialization
   */
  toJSON(): string {
    return this._value;
  }
}
