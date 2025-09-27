import { ClientValidationError } from "@domain/exceptions/client.exceptions";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { ClientId } from "@domain/value-objects/client-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { Phone } from "@domain/value-objects/phone.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";

export interface CreateClientParams {
  readonly userId: UserId;
  readonly businessId: BusinessId;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: Email;
  readonly phone?: Phone;
  readonly dateOfBirth?: Date;
  readonly createdBy: string;
}

export interface ReconstructClientParams {
  readonly id: ClientId;
  readonly userId: UserId;
  readonly businessId: BusinessId;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: Email;
  readonly phone?: Phone;
  readonly dateOfBirth?: Date;
  readonly isActive: boolean;
  readonly hasAppointmentHistory: boolean;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UpdateClientParams {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: Email;
  readonly phone?: Phone;
  readonly dateOfBirth?: Date;
  readonly updatedBy: string;
}

/**
 * 👤 CLIENT ENTITY
 *
 * Représente un client final qui utilise les services d'une entreprise.
 *
 * 🎯 **RÈGLES MÉTIER** :
 * - Un client appartient toujours à une entreprise spécifique (businessId)
 * - Un client est lié à un compte utilisateur (userId) pour l'authentification
 * - Prénom et nom sont obligatoires (minimum 2 caractères)
 * - Email valide obligatoire
 * - Téléphone et date de naissance optionnels
 * - Traçabilité complète (createdBy, updatedBy, timestamps)
 * - Statut actif/inactif pour gérer la capacité de réservation
 * - Historique de rendez-vous pour personnaliser l'expérience
 *
 * 🔒 **SÉCURITÉ** :
 * - Isolation par businessId (tenant isolation)
 * - Validation stricte des données d'entrée
 * - Audit trail complet
 */
export class Client {
  private constructor(
    private readonly _id: ClientId,
    private readonly _userId: UserId,
    private readonly _businessId: BusinessId,
    private _firstName: string,
    private _lastName: string,
    private _email: Email,
    private _isActive: boolean,
    private _hasAppointmentHistory: boolean,
    private readonly _createdBy: string,
    private _updatedBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _phone?: Phone,
    private _dateOfBirth?: Date,
  ) {}

  /**
   * 🎯 FACTORY METHOD - Création d'un nouveau client
   */
  static create(params: CreateClientParams): Client {
    // 🔍 Validation firstName
    if (!params.firstName || params.firstName.trim().length === 0) {
      throw new ClientValidationError("Client first name cannot be empty");
    }
    if (params.firstName.trim().length < 2) {
      throw new ClientValidationError(
        "Client first name must be at least 2 characters long",
      );
    }

    // 🔍 Validation lastName
    if (!params.lastName || params.lastName.trim().length === 0) {
      throw new ClientValidationError("Client last name cannot be empty");
    }
    if (params.lastName.trim().length < 2) {
      throw new ClientValidationError(
        "Client last name must be at least 2 characters long",
      );
    }

    // 🔍 Validation createdBy
    if (!params.createdBy || params.createdBy.trim().length === 0) {
      throw new ClientValidationError("CreatedBy is required");
    }

    const now = new Date();

    return new Client(
      ClientId.generate(),
      params.userId,
      params.businessId,
      params.firstName.trim(),
      params.lastName.trim(),
      params.email,
      true, // isActive par défaut
      false, // hasAppointmentHistory par défaut
      params.createdBy.trim(),
      params.createdBy.trim(), // updatedBy = createdBy initialement
      now, // createdAt
      now, // updatedAt
      params.phone,
      params.dateOfBirth,
    );
  }

  /**
   * 🏗️ FACTORY METHOD - Reconstruction depuis persistence
   */
  static reconstruct(params: ReconstructClientParams): Client {
    return new Client(
      params.id,
      params.userId,
      params.businessId,
      params.firstName,
      params.lastName,
      params.email,
      params.isActive,
      params.hasAppointmentHistory,
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
      params.phone,
      params.dateOfBirth,
    );
  }

  /**
   * ✏️ UPDATE METHOD - Mise à jour des informations client
   */
  update(params: UpdateClientParams): void {
    // 🔍 Validation firstName si fourni
    if (params.firstName !== undefined) {
      if (!params.firstName || params.firstName.trim().length === 0) {
        throw new ClientValidationError("Client first name cannot be empty");
      }
      if (params.firstName.trim().length < 2) {
        throw new ClientValidationError(
          "Client first name must be at least 2 characters long",
        );
      }
      this._firstName = params.firstName.trim();
    }

    // 🔍 Validation lastName si fourni
    if (params.lastName !== undefined) {
      if (!params.lastName || params.lastName.trim().length === 0) {
        throw new ClientValidationError("Client last name cannot be empty");
      }
      if (params.lastName.trim().length < 2) {
        throw new ClientValidationError(
          "Client last name must be at least 2 characters long",
        );
      }
      this._lastName = params.lastName.trim();
    }

    // 🔍 Validation updatedBy
    if (!params.updatedBy || params.updatedBy.trim().length === 0) {
      throw new ClientValidationError("UpdatedBy is required");
    }

    // ✅ Appliquer les mises à jour
    if (params.email !== undefined) {
      this._email = params.email;
    }
    if (params.phone !== undefined) {
      this._phone = params.phone;
    }
    if (params.dateOfBirth !== undefined) {
      this._dateOfBirth = params.dateOfBirth;
    }

    this._updatedBy = params.updatedBy.trim();
    this._updatedAt = new Date();
  }

  /**
   * 🔒 BUSINESS METHOD - Désactiver le client
   */
  deactivate(updatedBy: string): void {
    if (!updatedBy || updatedBy.trim().length === 0) {
      throw new ClientValidationError("UpdatedBy is required");
    }

    this._isActive = false;
    this._updatedBy = updatedBy.trim();
    this._updatedAt = new Date();
  }

  /**
   * ✅ BUSINESS METHOD - Réactiver le client
   */
  reactivate(updatedBy: string): void {
    if (!updatedBy || updatedBy.trim().length === 0) {
      throw new ClientValidationError("UpdatedBy is required");
    }

    this._isActive = true;
    this._updatedBy = updatedBy.trim();
    this._updatedAt = new Date();
  }

  /**
   * ✅ BUSINESS METHOD - Activer le client (alias pour reactivate)
   */
  activate(updatedBy: string): void {
    this.reactivate(updatedBy);
  }

  /**
   * 📅 BUSINESS METHOD - Marquer comme ayant un historique de rendez-vous
   */
  markAsHavingAppointmentHistory(updatedBy: string): void {
    if (!updatedBy || updatedBy.trim().length === 0) {
      throw new ClientValidationError("UpdatedBy is required");
    }

    this._hasAppointmentHistory = true;
    this._updatedBy = updatedBy.trim();
    this._updatedAt = new Date();
  }

  // ===========================
  // 📚 GETTERS - Accès aux données
  // ===========================

  getId(): ClientId {
    return this._id;
  }

  getUserId(): UserId {
    return this._userId;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  getFirstName(): string {
    return this._firstName;
  }

  getLastName(): string {
    return this._lastName;
  }

  getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  getEmail(): Email {
    return this._email;
  }

  getPhone(): Phone | undefined {
    return this._phone;
  }

  getDateOfBirth(): Date | undefined {
    return this._dateOfBirth;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getHasAppointmentHistory(): boolean {
    return this._hasAppointmentHistory;
  }

  getCreatedBy(): string {
    return this._createdBy;
  }

  getUpdatedBy(): string {
    return this._updatedBy;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // ===========================
  // 🎯 BUSINESS RULES - Règles métier
  // ===========================

  /**
   * 📅 Vérifie si le client peut réserver des rendez-vous
   */
  canBookAppointments(): boolean {
    return this._isActive;
  }

  /**
   * 🏢 Vérifie si le client a un historique avec une entreprise spécifique
   */
  hasAppointmentHistoryWith(businessId: BusinessId): boolean {
    return this._businessId.equals(businessId) && this._hasAppointmentHistory;
  }

  // ===========================
  // 🔧 UTILITY METHODS
  // ===========================

  /**
   * ⚖️ Comparaison d'égalité basée sur l'ID
   */
  equals(other: Client): boolean {
    if (!other) return false;
    return this._id.equals(other._id);
  }

  /**
   * 📝 Représentation string pour debugging/logging
   */
  toString(): string {
    return `Client(id=${this._id.getValue()}, name="${this.getFullName()}", email="${this._email.getValue()}", businessId=${this._businessId.getValue()}, active=${this._isActive})`;
  }
}
