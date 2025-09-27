/**
 * 🏥 DOMAIN ENTITY - ProfessionalRole
 * Clean Architecture - Domain Layer
 * Entité métier pour les rôles professionnels dans une équipe (MVP neutre)
 */

import { generateId } from '@shared/utils/id.utils';

export class ProfessionalRole {
  private constructor(
    private readonly _id: string,
    private readonly _code: string,
    private readonly _name: string,
    private _displayName: string,
    private readonly _category: ProfessionalCategory,
    private _description: string,
    private _canLead: boolean,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // 🎯 Factory method for creating new professional role
  static create(params: {
    code: string;
    name: string;
    displayName: string;
    category: ProfessionalCategory;
    description: string;
    canLead?: boolean;
  }): ProfessionalRole {
    const now = new Date();

    // Validation du code
    if (!params.code || params.code.trim().length < 2 || params.code.trim().length > 20) {
      throw new Error('Professional role code must be between 2 and 20 characters');
    }

    // Validation du nom
    if (!params.name || params.name.trim().length < 2) {
      throw new Error('Professional role name must be at least 2 characters');
    }

    // Validation du displayName
    if (!params.displayName || params.displayName.trim().length < 2) {
      throw new Error(
        'Professional role display name must be at least 2 characters',
      );
    }

    // Validation de la description
    if (!params.description || params.description.trim().length < 10) {
      throw new Error(
        'Professional role description must be at least 10 characters',
      );
    }

    // Validation de la catégorie (flexible pour MVP)
    if (!params.category || params.category.trim().length < 2) {
      throw new Error('Professional category must be at least 2 characters');
    }

    return new ProfessionalRole(
      generateId(),
      params.code.trim().toUpperCase(),
      params.name.trim(),
      params.displayName.trim(),
      params.category,
      params.description.trim(),
      params.canLead || false,
      true, // Active par défaut
      now,
      now,
    );
  }

  // 🔧 Factory method for reconstructing from persistence
  static reconstruct(params: {
    id: string;
    code: string;
    name: string;
    displayName: string;
    category: ProfessionalCategory;
    description: string;
    canLead: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProfessionalRole {
    return new ProfessionalRole(
      params.id,
      params.code,
      params.name,
      params.displayName,
      params.category,
      params.description,
      params.canLead,
      params.isActive,
      params.createdAt,
      params.updatedAt,
    );
  }

  // 🎯 Getters
  getId(): string {
    return this._id;
  }

  getCode(): string {
    return this._code;
  }

  getName(): string {
    return this._name;
  }

  getDisplayName(): string {
    return this._displayName;
  }

  getCategory(): ProfessionalCategory {
    return this._category;
  }

  getDescription(): string {
    return this._description;
  }

  getCanLead(): boolean {
    return this._canLead;
  }

  getIsActive(): boolean {
    return this._isActive;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // 🎯 Business Logic Methods
  canBeLeader(): boolean {
    return this._canLead && this._isActive;
  }

  isPrimaryRole(): boolean {
    return this._category === DefaultProfessionalCategories.PRIMARY;
  }

  isSupportRole(): boolean {
    return this._category === DefaultProfessionalCategories.SUPPORT;
  }

  isManagementRole(): boolean {
    return this._category === DefaultProfessionalCategories.MANAGEMENT;
  }

  // Méthode générique pour vérifier une catégorie
  isCategoryOf(category: string): boolean {
    return this._category === category;
  }

  canWorkWith(otherRole: ProfessionalRole): boolean {
    // Dans un MVP, tous les rôles peuvent travailler ensemble
    return this._isActive && otherRole.getIsActive();
  }

  // 🔄 Update methods
  updateDisplayName(newDisplayName: string): void {
    if (!newDisplayName || newDisplayName.trim().length < 2) {
      throw new Error('Display name must be at least 2 characters');
    }
    this._displayName = newDisplayName.trim();
    this._updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }
    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  setCanLead(canLead: boolean): void {
    this._canLead = canLead;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  // 🔄 Update method for use cases
  update(params: {
    displayName?: string;
    description?: string;
    canLead?: boolean;
    isActive?: boolean;
  }): void {
    if (params.displayName !== undefined) {
      this.updateDisplayName(params.displayName);
    }
    if (params.description !== undefined) {
      this.updateDescription(params.description);
    }
    if (params.canLead !== undefined) {
      this.setCanLead(params.canLead);
    }
    if (params.isActive !== undefined) {
      if (params.isActive) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
  }

  // 🎯 Validation methods
  isValid(): boolean {
    return (
      this._code.length >= 2 &&
      this._name.length >= 2 &&
      this._displayName.length >= 2 &&
      this._category.length >= 2
    );
  }

  // 🔄 Serialization
  toJSON(): {
    id: string;
    code: string;
    name: string;
    displayName: string;
    category: string;
    description: string;
    canLead: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this._id,
      code: this._code,
      name: this._name,
      displayName: this._displayName,
      category: this._category,
      description: this._description,
      canLead: this._canLead,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}

// 🎯 Professional categories for MVP - flexible approach
export type ProfessionalCategory = string;

// 🎯 Default categories for MVP (can be extended)
export const DefaultProfessionalCategories = {
  PRIMARY: 'PRIMARY',
  SUPPORT: 'SUPPORT',
  MANAGEMENT: 'MANAGEMENT',
} as const;

// 🎯 Predefined professional roles for MVP
export class PredefinedProfessionalRoles {
  static readonly SPECIALIST = 'SPECIALIST';
  static readonly ASSISTANT = 'ASSISTANT';
  static readonly SUPERVISOR = 'SUPERVISOR';
  static readonly COORDINATOR = 'COORDINATOR';
  static readonly TECHNICIAN = 'TECHNICIAN';
  static readonly RECEPTIONIST = 'RECEPTIONIST';

  static getAllPredefinedRoles(): Array<{
    code: string;
    name: string;
    displayName: string;
    category: ProfessionalCategory;
    description: string;
    canLead: boolean;
  }> {
    return [
      {
        code: this.SPECIALIST,
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: DefaultProfessionalCategories.PRIMARY,
        description: 'Professionnel spécialisé dans la prestation de services',
        canLead: true,
      },
      {
        code: this.ASSISTANT,
        name: 'Assistant',
        displayName: 'Assistant(e)',
        category: DefaultProfessionalCategories.SUPPORT,
        description: "Assistant pour l'accompagnement et le support",
        canLead: false,
      },
      {
        code: this.SUPERVISOR,
        name: 'Supervisor',
        displayName: 'Superviseur',
        category: DefaultProfessionalCategories.MANAGEMENT,
        description: 'Responsable de la supervision et du management',
        canLead: true,
      },
      {
        code: this.COORDINATOR,
        name: 'Coordinator',
        displayName: 'Coordinateur',
        category: DefaultProfessionalCategories.MANAGEMENT,
        description: 'Responsable de la coordination des activités',
        canLead: true,
      },
      {
        code: this.TECHNICIAN,
        name: 'Technician',
        displayName: 'Technicien',
        category: 'TECHNICAL', // Flexible category
        description: 'Support technique et maintenance',
        canLead: false,
      },
      {
        code: this.RECEPTIONIST,
        name: 'Receptionist',
        displayName: 'Réceptionniste',
        category: 'ADMINISTRATIVE', // Flexible category
        description: 'Accueil et gestion administrative',
        canLead: false,
      },
    ];
  }
}
