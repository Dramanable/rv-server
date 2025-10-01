/**
 * 👨‍⚕️ PROFESSIONAL ENTITY
 * ✅ Clean Architecture - Domain Layer
 *
 * Entité représentant un professionnel rattaché à une entreprise
 * avec gestion complète des statuts et informations métier.
 */

import {
  ProfessionalNotActiveError,
  ProfessionalNotVerifiedError,
  ProfessionalValidationError,
} from "@domain/exceptions/professional.exceptions";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { ProfessionalId } from "@domain/value-objects/professional-id.value-object";

export type ProfessionalStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface ProfessionalProps {
  readonly id: ProfessionalId;
  readonly businessId: BusinessId;
  readonly email: Email;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly status: ProfessionalStatus;
  readonly isVerified: boolean;
  readonly licenseNumber?: string;
  readonly speciality: string;
  readonly phoneNumber?: string;
  readonly profileImage?: string;
  readonly bio?: string;
  readonly experience?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly updatedBy: string;
}

export class Professional {
  private constructor(
    private readonly _id: ProfessionalId,
    private readonly _businessId: BusinessId,
    private readonly _email: Email,
    private _firstName: string,
    private _lastName: string,
    private _phone?: string,
    private _status: ProfessionalStatus = "ACTIVE",
    private _isVerified: boolean = false,
    private _licenseNumber?: string,
    private _speciality: string = "",
    private _phoneNumber?: string,
    private _profileImage?: string,
    private _bio?: string,
    private _experience?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private readonly _createdBy: string = "",
    private _updatedBy: string = "",
  ) {}

  /**
   * Factory pour créer un nouveau professionnel
   */
  static create(params: {
    businessId: BusinessId;
    email: Email;
    firstName: string;
    lastName: string;
    phone?: string;
    licenseNumber?: string;
    speciality?: string;
    phoneNumber?: string;
    profileImage?: string;
    bio?: string;
    experience?: number;
    createdBy: string;
  }): Professional {
    // Validations métier
    if (!params.firstName?.trim()) {
      throw new ProfessionalValidationError("First name is required");
    }

    if (!params.lastName?.trim()) {
      throw new ProfessionalValidationError("Last name is required");
    }

    if (params.firstName.trim().length < 2) {
      throw new ProfessionalValidationError(
        "First name must be at least 2 characters",
      );
    }

    if (params.lastName.trim().length < 2) {
      throw new ProfessionalValidationError(
        "Last name must be at least 2 characters",
      );
    }

    if (!params.speciality?.trim()) {
      throw new ProfessionalValidationError("Speciality is required");
    }

    if (!params.licenseNumber?.trim()) {
      throw new ProfessionalValidationError("License number is required");
    }

    if (params.experience !== undefined && params.experience < 0) {
      throw new ProfessionalValidationError("Experience cannot be negative");
    }

    const now = new Date();

    return new Professional(
      ProfessionalId.generate(),
      params.businessId,
      params.email,
      params.firstName.trim(),
      params.lastName.trim(),
      params.phone?.trim(),
      "ACTIVE",
      false, // Par défaut non vérifié
      params.licenseNumber?.trim(),
      params.speciality?.trim() || "",
      params.phoneNumber?.trim(),
      params.profileImage?.trim(),
      params.bio?.trim(),
      params.experience?.toString(),
      now,
      now,
      params.createdBy,
      params.createdBy,
    );
  }

  /**
   * Factory pour reconstruire un professionnel depuis la persistence
   */
  static reconstruct(props: ProfessionalProps): Professional {
    return new Professional(
      props.id,
      props.businessId,
      props.email,
      props.firstName,
      props.lastName,
      props.phone,
      props.status,
      props.isVerified,
      props.licenseNumber,
      props.speciality,
      props.phoneNumber,
      props.profileImage,
      props.bio,
      props.experience?.toString(),
      props.createdAt,
      props.updatedAt,
      props.createdBy,
      props.updatedBy,
    );
  }

  /**
   * Mettre à jour les informations du professionnel
   */
  update(params: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    licenseNumber?: string;
    speciality?: string;
    phoneNumber?: string;
    profileImage?: string;
    bio?: string;
    experience?: number;
    email?: Email;
    updatedBy: string;
  }): void {
    if (params.firstName !== undefined) {
      if (!params.firstName.trim()) {
        throw new ProfessionalValidationError("First name is required");
      }
      if (params.firstName.trim().length < 2) {
        throw new ProfessionalValidationError(
          "First name must be at least 2 characters",
        );
      }
      this._firstName = params.firstName.trim();
    }

    if (params.lastName !== undefined) {
      if (!params.lastName.trim()) {
        throw new ProfessionalValidationError("Last name is required");
      }
      if (params.lastName.trim().length < 2) {
        throw new ProfessionalValidationError(
          "Last name must be at least 2 characters",
        );
      }
      this._lastName = params.lastName.trim();
    }

    if (params.phone !== undefined) {
      this._phone = params.phone.trim() || undefined;
    }

    if (params.licenseNumber !== undefined) {
      this._licenseNumber = params.licenseNumber.trim() || undefined;
    }

    if (params.speciality !== undefined) {
      this._speciality = params.speciality.trim() || "";
    }

    if (params.phoneNumber !== undefined) {
      this._phoneNumber = params.phoneNumber.trim() || undefined;
    }

    if (params.profileImage !== undefined) {
      this._profileImage = params.profileImage.trim() || undefined;
    }

    if (params.bio !== undefined) {
      this._bio = params.bio.trim() || undefined;
    }

    if (params.experience !== undefined) {
      if (params.experience < 0) {
        throw new ProfessionalValidationError("Experience cannot be negative");
      }
      this._experience = params.experience.toString();
    }

    if (params.email !== undefined) {
      // Changer l'email (temporairement mutable pour le use case)
      (this._email as any) = params.email;
    }

    this._updatedBy = params.updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Activer le professionnel
   */
  activate(updatedBy: string): void {
    this._status = "ACTIVE";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Désactiver le professionnel
   */
  deactivate(updatedBy: string): void {
    this._status = "INACTIVE";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Suspendre le professionnel
   */
  suspend(updatedBy: string): void {
    this._status = "SUSPENDED";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Vérifier le professionnel
   */
  verify(updatedBy: string): void {
    this._isVerified = true;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Vérifier la licence du professionnel (alias pour verify)
   */
  verifyLicense(updatedBy: string): void {
    this.verify(updatedBy);
  }

  /**
   * Retirer la vérification du professionnel
   */
  unverify(updatedBy: string): void {
    this._isVerified = false;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Vérifier que le professionnel est actif
   */
  ensureIsActive(): void {
    if (!this.isActive()) {
      throw new ProfessionalNotActiveError(this._id.getValue());
    }
  }

  /**
   * Vérifier que le professionnel est vérifié
   */
  ensureIsVerified(): void {
    if (!this._isVerified) {
      throw new ProfessionalNotVerifiedError(this._id.getValue());
    }
  }

  /**
   * Vérifier si le professionnel est actif
   */
  isActive(): boolean {
    return this._status === "ACTIVE";
  }

  /**
   * Vérifier si le professionnel appartient à une entreprise
   */
  belongsToBusiness(businessId: BusinessId): boolean {
    return this._businessId.getValue() === businessId.getValue();
  }

  /**
   * Obtenir le nom complet
   */
  getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  /**
   * Vérifier si le professionnel est vérifié
   */
  isVerified(): boolean {
    return this._isVerified;
  }

  /**
   * Représentation JSON pour sérialisation
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this._id.getValue(),
      businessId: this._businessId.getValue(),
      email: this._email.toString(),
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.getFullName(),
      phone: this._phone,
      phoneNumber: this._phoneNumber,
      status: this._status,
      isActive: this.isActive(),
      isVerified: this._isVerified,
      licenseNumber: this._licenseNumber,
      speciality: this._speciality,
      profileImage: this._profileImage,
      bio: this._bio,
      experience: this._experience,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
    };
  }

  /**
   * Représentation en chaîne pour debugging
   */
  toString(): string {
    return `Professional(${this._id.getValue()}) - ${this.getFullName()} [${this._status}]`;
  }

  // ✅ GETTERS - Accès lecture seule aux propriétés
  getId(): ProfessionalId {
    return this._id;
  }
  getBusinessId(): BusinessId {
    return this._businessId;
  }
  getEmail(): Email {
    return this._email;
  }
  getFirstName(): string {
    return this._firstName;
  }
  getLastName(): string {
    return this._lastName;
  }
  getPhone(): string | undefined {
    return this._phone;
  }
  getPhoneNumber(): string | undefined {
    return this._phoneNumber;
  }
  getStatus(): ProfessionalStatus {
    return this._status;
  }
  getIsVerified(): boolean {
    return this._isVerified;
  }
  getLicenseNumber(): string | undefined {
    return this._licenseNumber;
  }
  getSpeciality(): string {
    return this._speciality;
  }
  getProfileImage(): string | undefined {
    return this._profileImage;
  }
  getBio(): string | undefined {
    return this._bio;
  }
  getExperience(): string | undefined {
    return this._experience;
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }
  getCreatedBy(): string {
    return this._createdBy;
  }
  getUpdatedBy(): string {
    return this._updatedBy;
  }

  /**
   * Vérifie si le professionnel a des rendez-vous actifs/futurs
   * TODO: Implémenter avec repository des appointments
   * Pour l'instant, retourne false pour permettre la suppression
   */
  hasActiveAppointments(): boolean {
    // TODO: Cette méthode devrait interroger le repository des appointments
    // pour vérifier s'il existe des rendez-vous futurs ou en cours pour ce professionnel
    //
    // const futureAppointments = await appointmentRepository.findByProfessionalId(
    //   this._id,
    //   { status: ['BOOKED', 'CONFIRMED'], fromDate: new Date() }
    // );
    // return futureAppointments.length > 0;

    // Implémentation temporaire - permet la suppression
    return false;
  }
}
