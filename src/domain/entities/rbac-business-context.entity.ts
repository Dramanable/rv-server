/**
 * 🏢 DOMAIN ENTITY - RBAC Business Context
 *
 * Entité métier pure pour le système RBAC représentant le contexte hiérarchique
 * d'assignation des rôles : Business > Location > Department.
 *
 * ⚠️ DISTINCTION : Cette entité est spécifique au système RBAC et différente
 * de BusinessContext utilisé pour les calendriers et autres fonctionnalités.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Logique métier pure de gestion des contextes hiérarchiques RBAC
 * - Validation des contextes pour assignation de rôles
 * - Hiérarchie Business > Location > Department
 */

import {
  BusinessContextCannotHaveParentError,
  BusinessIdRequiredError,
  ContextIdRequiredError,
  ContextMustHaveParentError,
  ContextNameRequiredError,
  ContextNameTooLongError,
  ContextNameTooShortError,
  InvalidContextTypeError,
} from '@domain/exceptions';

export enum RbacContextType {
  BUSINESS = 'BUSINESS',
  LOCATION = 'LOCATION',
  DEPARTMENT = 'DEPARTMENT',
}

export interface RbacBusinessContextData {
  readonly id?: string;
  readonly name: string;
  readonly type: RbacContextType;
  readonly businessId: string;
  readonly parentContextId?: string;
  readonly description?: string;
  readonly code?: string;
  readonly isActive: boolean;
  readonly settings?: Record<string, any>;
  readonly level: number;
  readonly path?: string;
  readonly displayOrder: number;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
  readonly version?: number;
  readonly externalId?: string;
  readonly timezone?: string;
}

export class RbacBusinessContext {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _type: RbacContextType,
    private readonly _businessId: string,
    private readonly _parentContextId: string | undefined,
    private readonly _description: string | undefined,
    private readonly _code: string | undefined,
    private _isActive: boolean,
    private readonly _settings: Record<string, any> | undefined,
    private readonly _level: number,
    private readonly _path: string | undefined,
    private readonly _displayOrder: number,
    private readonly _createdBy: string,
    private _updatedBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _version: number,
    private readonly _externalId: string | undefined,
    private readonly _timezone: string | undefined,
  ) {}

  // Getters
  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getType(): RbacContextType {
    return this._type;
  }

  getBusinessId(): string {
    return this._businessId;
  }

  getParentContextId(): string | undefined {
    return this._parentContextId;
  }

  getDescription(): string | undefined {
    return this._description;
  }

  getCode(): string | undefined {
    return this._code;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getSettings(): Record<string, any> | undefined {
    return this._settings;
  }

  getLevel(): number {
    return this._level;
  }

  getPath(): string | undefined {
    return this._path;
  }

  getDisplayOrder(): number {
    return this._displayOrder;
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

  getVersion(): number {
    return this._version;
  }

  getExternalId(): string | undefined {
    return this._externalId;
  }

  getTimezone(): string | undefined {
    return this._timezone;
  }

  /**
   * ✅ Factory Method - Créer un nouveau contexte RBAC
   */
  static create(params: {
    name: string;
    type: RbacContextType;
    businessId: string;
    parentContextId?: string;
    description?: string;
    code?: string;
    settings?: Record<string, any>;
    displayOrder?: number;
    createdBy: string;
    timezone?: string;
  }): RbacBusinessContext {
    // Validation
    this.validateContextData(params);

    // Calculer le niveau hiérarchique
    const level = this.calculateLevel(params.type);

    // Générer un ID unique
    const id = this.generateId();
    const now = new Date();

    return new RbacBusinessContext(
      id,
      params.name.trim(),
      params.type,
      params.businessId,
      params.parentContextId,
      params.description?.trim(),
      params.code?.trim().toUpperCase(),
      true, // isActive par défaut
      params.settings,
      level,
      undefined, // path sera calculé après sauvegarde
      params.displayOrder || 0,
      params.createdBy,
      params.createdBy, // updatedBy = createdBy initialement
      now,
      now,
      1, // version initiale
      undefined, // externalId
      params.timezone,
    );
  }

  /**
   * ✅ Factory Method - Restaurer depuis la persistence
   */
  static reconstruct(data: RbacBusinessContextData): RbacBusinessContext {
    if (!data.id) {
      throw new ContextIdRequiredError();
    }

    return new RbacBusinessContext(
      data.id,
      data.name,
      data.type,
      data.businessId,
      data.parentContextId,
      data.description,
      data.code,
      data.isActive,
      data.settings,
      data.level,
      data.path,
      data.displayOrder,
      data.createdBy,
      data.updatedBy,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
      data.version || 1,
      data.externalId,
      data.timezone,
    );
  }

  /**
   * 🔄 Mettre à jour le contexte
   */
  update(params: {
    name?: string;
    description?: string;
    code?: string;
    settings?: Record<string, any>;
    displayOrder?: number;
    isActive?: boolean;
    updatedBy: string;
    timezone?: string;
  }): void {
    if (params.name !== undefined) {
      RbacBusinessContext.validateName(params.name);
    }

    // Appliquer les modifications
    if (params.name !== undefined) {
      (this as any)._name = params.name.trim();
    }
    if (params.description !== undefined) {
      (this as any)._description = params.description?.trim();
    }
    if (params.code !== undefined) {
      (this as any)._code = params.code?.trim().toUpperCase();
    }
    if (params.settings !== undefined) {
      (this as any)._settings = params.settings;
    }
    if (params.displayOrder !== undefined) {
      (this as any)._displayOrder = params.displayOrder;
    }
    if (params.isActive !== undefined) {
      this._isActive = params.isActive;
    }
    if (params.timezone !== undefined) {
      (this as any)._timezone = params.timezone;
    }

    // Mettre à jour les métadonnées
    this._updatedBy = params.updatedBy;
    this._updatedAt = new Date();
    this._version++;
  }

  /**
   * 🎯 Vérifier si c'est un contexte racine (Business)
   */
  isRootContext(): boolean {
    return this._type === RbacContextType.BUSINESS;
  }

  /**
   * 🌳 Vérifier si ce contexte est parent d'un autre contexte
   */
  isParentOf(childContext: RbacBusinessContext): boolean {
    return childContext.getParentContextId() === this._id;
  }

  /**
   * 👶 Vérifier si ce contexte est enfant d'un autre contexte
   */
  isChildOf(parentContextId: string): boolean {
    return this._parentContextId === parentContextId;
  }

  /**
   * 📊 Obtenir les informations hiérarchiques
   */
  getHierarchyInfo(): {
    level: number;
    type: RbacContextType;
    hasParent: boolean;
    isRoot: boolean;
  } {
    return {
      level: this._level,
      type: this._type,
      hasParent: this._parentContextId !== undefined,
      isRoot: this.isRootContext(),
    };
  }

  /**
   * 🎯 Construire le chemin hiérarchique complet
   */
  buildHierarchicalPath(separator: string = ' > '): string {
    if (!this._path) {
      return this._name;
    }
    return this._path.split('/').join(separator);
  }

  /**
   * ✅ Valider la compatibilité hiérarchique avec un contexte parent
   */
  isValidChild(parentContext: RbacBusinessContext): boolean {
    // Vérifier que le niveau est correct
    if (this._level !== parentContext.getLevel() + 1) {
      return false;
    }

    // Vérifier la hiérarchie type
    const validHierarchies: Record<RbacContextType, RbacContextType[]> = {
      [RbacContextType.BUSINESS]: [RbacContextType.LOCATION],
      [RbacContextType.LOCATION]: [RbacContextType.DEPARTMENT],
      [RbacContextType.DEPARTMENT]: [], // Feuille
    };

    return (
      validHierarchies[parentContext.getType()]?.includes(this._type) || false
    );
  }

  /**
   * 📋 Obtenir les métadonnées pour l'audit
   */
  toAuditData(): {
    id: string;
    name: string;
    type: string;
    businessId: string;
    level: number;
    isActive: boolean;
    updatedBy: string;
    version: number;
  } {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      businessId: this._businessId,
      level: this._level,
      isActive: this._isActive,
      updatedBy: this._updatedBy,
      version: this._version,
    };
  }

  /**
   * 📋 Exporter vers DTO de transfert
   */
  toTransferData(): RbacBusinessContextData {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      businessId: this._businessId,
      parentContextId: this._parentContextId,
      description: this._description,
      code: this._code,
      isActive: this._isActive,
      settings: this._settings,
      level: this._level,
      path: this._path,
      displayOrder: this._displayOrder,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      version: this._version,
      externalId: this._externalId,
      timezone: this._timezone,
    };
  }

  // Validation privée
  private static validateContextData(params: {
    name: string;
    type: RbacContextType;
    businessId: string;
    parentContextId?: string;
  }): void {
    if (!params.name || params.name.trim().length === 0) {
      throw new ContextNameRequiredError();
    }

    this.validateName(params.name);

    if (!params.businessId || params.businessId.trim().length === 0) {
      throw new BusinessIdRequiredError();
    }

    if (!Object.values(RbacContextType).includes(params.type)) {
      throw new InvalidContextTypeError(params.type);
    }

    // Validation hiérarchique
    if (params.type === RbacContextType.BUSINESS && params.parentContextId) {
      throw new BusinessContextCannotHaveParentError();
    }

    if (params.type !== RbacContextType.BUSINESS && !params.parentContextId) {
      throw new ContextMustHaveParentError(params.type);
    }
  }

  private static validateName(name: string): void {
    if (name.trim().length < 2) {
      throw new ContextNameTooShortError();
    }

    if (name.trim().length > 200) {
      throw new ContextNameTooLongError();
    }
  }

  private static calculateLevel(type: RbacContextType): number {
    const levelMap: Record<RbacContextType, number> = {
      [RbacContextType.BUSINESS]: 0,
      [RbacContextType.LOCATION]: 1,
      [RbacContextType.DEPARTMENT]: 2,
    };
    return levelMap[type];
  }

  private static generateId(): string {
    // Simulation d'un générateur UUID simple
    return (
      'rbac-ctx-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
