import { SkillValidationException } from '../exceptions/skill.exceptions';
import { BusinessId } from '../value-objects/business-id.value-object';

/**
 * 🎯 Skill Entity - Compétences Configurables par Business
 *
 * Les compétences sont définies et gérées par chaque business individuellement.
 * Permet une flexibilité totale selon le secteur d'activité.
 */
export class Skill {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: BusinessId,
    private readonly _name: string,
    private readonly _category: string,
    private readonly _description: string,
    private readonly _isCritical: boolean,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
    private readonly _createdBy?: string, // ⚠️ OPTIONNEL - UUID de l'utilisateur
    private readonly _updatedBy?: string, // ⚠️ OPTIONNEL - UUID de l'utilisateur
  ) {}

  /**
   * 🏗️ Factory method pour créer une nouvelle compétence
   */
  static create(
    businessId: BusinessId,
    name: string,
    category: string,
    description: string,
    isCritical: boolean = false,
    createdBy?: string, // ⚠️ OPTIONNEL - UUID de l'utilisateur
  ): Skill {
    // Validation des données d'entrée avec exceptions spécialisées
    if (!name || name.trim().length < 2) {
      throw new SkillValidationException(
        'SKILL_NAME_TOO_SHORT',
        'Le nom de la compétence doit contenir au moins 2 caractères',
        { name, minimumLength: 2 },
      );
    }

    if (!category || category.trim().length < 2) {
      throw new SkillValidationException(
        'SKILL_CATEGORY_TOO_SHORT',
        'La catégorie de la compétence doit contenir au moins 2 caractères',
        { category, minimumLength: 2 },
      );
    }

    if (name.trim().length > 100) {
      throw new SkillValidationException(
        'SKILL_NAME_TOO_LONG',
        'Le nom de la compétence ne peut pas dépasser 100 caractères',
        { name, maximumLength: 100 },
      );
    }

    if (description && description.length > 500) {
      throw new SkillValidationException(
        'SKILL_DESCRIPTION_TOO_LONG',
        'La description de la compétence ne peut pas dépasser 500 caractères',
        { description, maximumLength: 500 },
      );
    }

    const now = new Date();

    return new Skill(
      crypto.randomUUID(), // Generate unique ID
      businessId,
      name.trim(),
      category.trim(),
      description?.trim() || '',
      isCritical,
      true, // Active par défaut
      now,
      now,
      createdBy, // ⚠️ OPTIONNEL
      createdBy, // updatedBy = createdBy initialement
    );
  }

  /**
   * 🔄 Factory method pour reconstruire depuis la persistence
   */
  static reconstruct(data: {
    id: string;
    businessId: BusinessId;
    name: string;
    category: string;
    description: string;
    isCritical: boolean;
    isActive: boolean;
    createdBy?: string; // ⚠️ OPTIONNEL
    updatedBy?: string; // ⚠️ OPTIONNEL
    createdAt: Date;
    updatedAt: Date;
  }): Skill {
    return new Skill(
      data.id,
      data.businessId,
      data.name,
      data.category,
      data.description,
      data.isCritical,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.createdBy, // ⚠️ OPTIONNEL
      data.updatedBy, // ⚠️ OPTIONNEL
    );
  }

  // ✅ Getters
  getId(): string {
    return this._id;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  getName(): string {
    return this._name;
  }

  getCategory(): string {
    return this._category;
  }

  getDescription(): string {
    return this._description;
  }

  isCritical(): boolean {
    return this._isCritical;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // ⚠️ TRAÇABILITÉ OPTIONNELLE
  getCreatedBy(): string | undefined {
    return this._createdBy;
  }

  getUpdatedBy(): string | undefined {
    return this._updatedBy;
  }

  // 🔄 Business Methods

  /**
   * Mettre à jour les informations de la compétence
   */
  update(updates: {
    name?: string;
    category?: string;
    description?: string;
    isCritical?: boolean;
    updatedBy?: string; // ⚠️ OPTIONNEL - UUID de l'utilisateur
  }): Skill {
    const updatedName = updates.name?.trim() || this._name;
    const updatedCategory = updates.category?.trim() || this._category;
    const updatedDescription = updates.description?.trim() || this._description;
    const updatedIsCritical = updates.isCritical ?? this._isCritical;

    // Validation
    if (updatedName.length < 2 || updatedName.length > 100) {
      throw new SkillValidationException(
        'SKILL_NAME_LENGTH_INVALID',
        'Le nom de la compétence doit contenir entre 2 et 100 caractères',
      );
    }

    if (updatedCategory.length < 2) {
      throw new SkillValidationException(
        'SKILL_CATEGORY_TOO_SHORT',
        'La catégorie doit contenir au moins 2 caractères',
      );
    }

    if (updatedDescription.length > 500) {
      throw new SkillValidationException(
        'SKILL_DESCRIPTION_TOO_LONG',
        'La description ne peut pas dépasser 500 caractères',
      );
    }

    return new Skill(
      this._id,
      this._businessId,
      updatedName,
      updatedCategory,
      updatedDescription,
      updatedIsCritical,
      this._isActive,
      this._createdAt,
      new Date(), // Updated timestamp
      this._createdBy, // createdBy ne change pas
      updates.updatedBy, // ⚠️ OPTIONNEL
    );
  }

  /**
   * Activer la compétence
   */
  activate(updatedBy?: string): Skill {
    if (this._isActive) {
      return this; // Déjà active
    }

    return new Skill(
      this._id,
      this._businessId,
      this._name,
      this._category,
      this._description,
      this._isCritical,
      true, // Activée
      this._createdAt,
      new Date(),
      this._createdBy, // createdBy ne change pas
      updatedBy, // ⚠️ OPTIONNEL
    );
  }

  /**
   * Désactiver la compétence
   */
  deactivate(updatedBy?: string): Skill {
    if (!this._isActive) {
      return this; // Déjà inactive
    }

    return new Skill(
      this._id,
      this._businessId,
      this._name,
      this._category,
      this._description,
      this._isCritical,
      false, // Désactivée
      this._createdAt,
      new Date(),
      this._createdBy, // createdBy ne change pas
      updatedBy, // ⚠️ OPTIONNEL
    );
  }

  /**
   * Marquer comme critique
   */
  markAsCritical(updatedBy?: string): Skill {
    if (this._isCritical) {
      return this; // Déjà critique
    }

    return new Skill(
      this._id,
      this._businessId,
      this._name,
      this._category,
      this._description,
      true, // Critique
      this._isActive,
      this._createdAt,
      new Date(),
      this._createdBy, // createdBy ne change pas
      updatedBy, // ⚠️ OPTIONNEL
    );
  }

  /**
   * Retirer le statut critique
   */
  unmarkAsCritical(updatedBy?: string): Skill {
    if (!this._isCritical) {
      return this; // Déjà non-critique
    }

    return new Skill(
      this._id,
      this._businessId,
      this._name,
      this._category,
      this._description,
      false, // Non-critique
      this._isActive,
      this._createdAt,
      new Date(),
      this._createdBy, // createdBy ne change pas
      updatedBy, // ⚠️ OPTIONNEL
    );
  }

  // 🔄 Domain Logic

  /**
   * Vérifier si la compétence peut être supprimée
   */
  canBeDeleted(): boolean {
    // Une compétence critique ne peut pas être supprimée si elle est utilisée
    // Cette logique sera implémentée avec les repositories
    return true; // Placeholder - sera vérifié par le use case
  }

  /**
   * Égalité entre compétences
   */
  equals(other: Skill): boolean {
    return this._id === other._id;
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Skill(${this._name} - ${this._category})`;
  }

  /**
   * Sérialisation pour logging/debugging
   */
  toJSON(): object {
    return {
      id: this._id,
      businessId: this._businessId.getValue(),
      name: this._name,
      category: this._category,
      description: this._description,
      isCritical: this._isCritical,
      isActive: this._isActive,
      // ⚠️ TRAÇABILITÉ OBLIGATOIRE
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
