/**
 * 🏢 BUSINESS SECTOR ENTITY - Domain Layer
 *
 * Entité domaine pour les secteurs d'activité créés dynamiquement par le super-admin
 * Respecte les principes de Clean Architecture - ZÉRO dépendance framework
 */

import { DomainError } from '../exceptions/domain.exceptions';

export class BusinessSector {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _code: string,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _createdBy: string,
    private _updatedAt?: Date,
    private _updatedBy?: string,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  // 🏭 FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  static create(
    name: string,
    description: string,
    code: string,
    createdBy: string,
  ): BusinessSector {
    // Validation métier
    BusinessSector.validateName(name);
    BusinessSector.validateDescription(description);
    BusinessSector.validateCode(code);
    BusinessSector.validateCreatedBy(createdBy);

    return new BusinessSector(
      BusinessSector.generateId(),
      name.trim(),
      description.trim(),
      code.trim().toUpperCase(),
      true, // Actif par défaut
      new Date(),
      createdBy,
    );
  }

  static restore(
    id: string,
    name: string,
    description: string,
    code: string,
    isActive: boolean,
    createdAt: Date,
    createdBy: string,
    updatedAt?: Date,
    updatedBy?: string,
  ): BusinessSector {
    return new BusinessSector(
      id,
      name,
      description,
      code,
      isActive,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 📋 GETTERS
  // ═══════════════════════════════════════════════════════════════

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get code(): string {
    return this._code;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  get updatedBy(): string | undefined {
    return this._updatedBy;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  update(name: string, description: string, updatedBy: string): BusinessSector {
    // Validation métier
    BusinessSector.validateName(name);
    BusinessSector.validateDescription(description);
    BusinessSector.validateCreatedBy(updatedBy);

    return BusinessSector.restore(
      this._id,
      name.trim(),
      description.trim(),
      this._code, // Le code ne change pas après création
      this._isActive,
      this._createdAt,
      this._createdBy,
      new Date(),
      updatedBy,
    );
  }

  activate(updatedBy: string): BusinessSector {
    BusinessSector.validateCreatedBy(updatedBy);

    return BusinessSector.restore(
      this._id,
      this._name,
      this._description,
      this._code,
      true,
      this._createdAt,
      this._createdBy,
      new Date(),
      updatedBy,
    );
  }

  deactivate(updatedBy: string): BusinessSector {
    BusinessSector.validateCreatedBy(updatedBy);

    return BusinessSector.restore(
      this._id,
      this._name,
      this._description,
      this._code,
      false,
      this._createdAt,
      this._createdBy,
      new Date(),
      updatedBy,
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔍 QUERY METHODS
  // ═══════════════════════════════════════════════════════════════

  isCreatedBy(userId: string): boolean {
    return this._createdBy === userId;
  }

  canBeUsedForBusiness(): boolean {
    return this._isActive;
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ PRIVATE VALIDATION METHODS
  // ═══════════════════════════════════════════════════════════════

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainError('Business sector name cannot be empty');
    }

    if (name.trim().length < 2) {
      throw new DomainError(
        'Business sector name must be at least 2 characters long',
      );
    }

    if (name.length > 100) {
      throw new DomainError(
        'Business sector name must be less than 100 characters',
      );
    }

    // Vérifier les caractères autorisés (lettres, chiffres, espaces, tirets)
    const allowedPattern = /^[a-zA-Z0-9\s\-&'.(),]+$/;
    if (!allowedPattern.test(name)) {
      throw new DomainError('Business sector name contains invalid characters');
    }
  }

  private static validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new DomainError('Business sector description cannot be empty');
    }

    if (description.trim().length < 10) {
      throw new DomainError(
        'Business sector description must be at least 10 characters long',
      );
    }

    if (description.length > 500) {
      throw new DomainError(
        'Business sector description must be less than 500 characters',
      );
    }
  }

  private static validateCode(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new DomainError('Business sector code cannot be empty');
    }

    const cleanCode = code.trim().toUpperCase();

    if (cleanCode.length < 2) {
      throw new DomainError(
        'Business sector code must be at least 2 characters long',
      );
    }

    if (cleanCode.length > 20) {
      throw new DomainError(
        'Business sector code must be less than 20 characters',
      );
    }

    // Code doit être alphanumérique avec underscores uniquement
    const allowedPattern = /^[A-Z0-9_]+$/;
    if (!allowedPattern.test(cleanCode)) {
      throw new DomainError(
        'Business sector code must contain only uppercase letters, numbers and underscores',
      );
    }
  }

  private static validateCreatedBy(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new DomainError('CreatedBy user ID cannot be empty');
    }
  }

  private static generateId(): string {
    // Génération d'ID simple pour les tests - en production utiliser UUID
    return `bs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 EQUALITY & COMPARISON
  // ═══════════════════════════════════════════════════════════════

  equals(other: BusinessSector): boolean {
    return other instanceof BusinessSector && this._id === other._id;
  }

  isSame(other: BusinessSector): boolean {
    return (
      this.equals(other) &&
      this._name === other._name &&
      this._code === other._code
    );
  }
}
