import { v4 as uuidv4, validate, version } from "uuid";
import { DomainError } from "../exceptions/domain.exceptions";

/**
 * Value Object pour l'identifiant unique d'un rendez-vous
 * Garantit l'unicité et la validité des identifiants de rendez-vous
 */
export class AppointmentId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Crée un nouvel AppointmentId avec validation stricte
   */
  static create(value: string): AppointmentId {
    if (!value || value.trim().length === 0) {
      throw new DomainError("AppointmentId cannot be empty");
    }

    const trimmedValue = value.trim();

    if (!validate(trimmedValue)) {
      throw new DomainError("Appointment ID must be a valid UUID");
    }

    // Vérifier que c'est un UUID v4
    if (version(trimmedValue) !== 4) {
      throw new DomainError("Appointment ID must be a UUID version 4");
    }

    return new AppointmentId(trimmedValue);
  }

  /**
   * Génère un nouvel AppointmentId unique
   */
  static generate(): AppointmentId {
    return new AppointmentId(uuidv4());
  }

  /**
   * Crée un AppointmentId depuis une string (pour reconstruction)
   */
  static fromString(value: string): AppointmentId {
    return AppointmentId.create(value);
  }

  /**
   * Obtient la valeur de l'identifiant
   */
  getValue(): string {
    return this._value;
  }

  /**
   * Vérifie l'égalité avec un autre AppointmentId
   */
  equals(other: AppointmentId): boolean {
    if (!other) return false;
    return this._value.toLowerCase() === other._value.toLowerCase();
  }

  /**
   * Représentation string
   */
  toString(): string {
    return this._value;
  }
}
