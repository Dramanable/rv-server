/**
 * 🔐 USER PERMISSION ENTITY - Domain Layer
 *
 * Entité métier pour gérer les permissions accordées à un utilisateur.
 * Système simple : chaque utilisateur peut avoir des permissions CRUD granulaires
 * accordées ou retirées sur des ressources spécifiques.
 */

import { generateId } from "@shared/utils/id.utils";

/**
 * 🎯 Types d'actions CRUD
 */
export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LIST = "LIST",
  MANAGE = "MANAGE", // Toutes les actions
}

/**
 * 🏷️ Types de ressources
 */
export enum ResourceType {
  USER = "USER",
  BUSINESS = "BUSINESS",
  PROSPECT = "PROSPECT",
  APPOINTMENT = "APPOINTMENT",
  SERVICE = "SERVICE",
  STAFF = "STAFF",
  CALENDAR = "CALENDAR",
  NOTIFICATION = "NOTIFICATION",
  ROLE = "ROLE",
  PERMISSION = "PERMISSION",
}

/**
 * 🔐 UserPermission Entity
 *
 * Représente une permission accordée à un utilisateur spécifique
 */
export class UserPermission {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _action: PermissionAction,
    private readonly _resource: ResourceType,
    private readonly _businessId: string | null, // null = permission globale plateforme
    private _isGranted: boolean, // true = accordée, false = refusée explicitement
    private readonly _grantedBy: string, // ID de l'utilisateur qui a accordé
    private readonly _grantedAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * 🏭 Factory method pour accorder une permission
   */
  static grant(data: {
    userId: string;
    action: PermissionAction;
    resource: ResourceType;
    businessId?: string | null;
    grantedBy: string;
  }): UserPermission {
    const now = new Date();

    return new UserPermission(
      generateId(),
      data.userId,
      data.action,
      data.resource,
      data.businessId || null,
      true, // Accordée
      data.grantedBy,
      now,
      now,
    );
  }

  /**
   * 🚫 Factory method pour refuser explicitement une permission
   */
  static deny(data: {
    userId: string;
    action: PermissionAction;
    resource: ResourceType;
    businessId?: string | null;
    grantedBy: string;
  }): UserPermission {
    const now = new Date();

    return new UserPermission(
      generateId(),
      data.userId,
      data.action,
      data.resource,
      data.businessId || null,
      false, // Refusée
      data.grantedBy,
      now,
      now,
    );
  }

  /**
   * 🔄 Reconstuire depuis la persistence
   */
  static reconstruct(data: {
    id: string;
    userId: string;
    action: PermissionAction;
    resource: ResourceType;
    businessId: string | null;
    isGranted: boolean;
    grantedBy: string;
    grantedAt: Date;
    updatedAt: Date;
  }): UserPermission {
    return new UserPermission(
      data.id,
      data.userId,
      data.action,
      data.resource,
      data.businessId,
      data.isGranted,
      data.grantedBy,
      data.grantedAt,
      data.updatedAt,
    );
  }

  /**
   * 🎯 Générer le code de permission (ACTION_RESOURCE)
   */
  getCode(): string {
    return `${this._action}_${this._resource}`;
  }

  /**
   * ✅ Vérifier si cette permission couvre une action donnée
   */
  covers(
    action: PermissionAction,
    resource: ResourceType,
    businessId?: string | null,
  ): boolean {
    // Doit être accordée (pas refusée)
    if (!this._isGranted) return false;

    // Vérifier le contexte business
    if (this._businessId !== businessId) return false;

    // MANAGE couvre toutes les actions sur la ressource
    if (
      this._action === PermissionAction.MANAGE &&
      this._resource === resource
    ) {
      return true;
    }

    // Permission exacte
    return this._action === action && this._resource === resource;
  }

  /**
   * 🌍 Est-ce une permission globale (plateforme) ?
   */
  isGlobal(): boolean {
    return this._businessId === null;
  }

  /**
   * 🏢 Est-ce une permission spécifique à un business ?
   */
  isBusinessSpecific(): boolean {
    return this._businessId !== null;
  }

  /**
   * 🔄 Inverser l'état de la permission (accorder ↔ refuser)
   */
  toggle(): void {
    this._isGranted = !this._isGranted;
    this._updatedAt = new Date();
  }

  /**
   * ✅ Accorder la permission
   */
  grant(): void {
    this._isGranted = true;
    this._updatedAt = new Date();
  }

  /**
   * 🚫 Refuser la permission
   */
  deny(): void {
    this._isGranted = false;
    this._updatedAt = new Date();
  }

  // === GETTERS ===
  getId(): string {
    return this._id;
  }
  getUserId(): string {
    return this._userId;
  }
  getAction(): PermissionAction {
    return this._action;
  }
  getResource(): ResourceType {
    return this._resource;
  }
  getBusinessId(): string | null {
    return this._businessId;
  }
  isGranted(): boolean {
    return this._isGranted;
  }
  getGrantedBy(): string {
    return this._grantedBy;
  }
  getGrantedAt(): Date {
    return this._grantedAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 🎯 Conversion vers objet simple pour serialization
   */
  toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      code: this.getCode(),
      action: this._action,
      resource: this._resource,
      businessId: this._businessId,
      isGranted: this._isGranted,
      isGlobal: this.isGlobal(),
      grantedBy: this._grantedBy,
      grantedAt: this._grantedAt,
      updatedAt: this._updatedAt,
    };
  }
}

/**
 * 🏭 Factory pour créer des ensembles de permissions
 */
export class UserPermissionFactory {
  /**
   * 🎯 Accorder toutes les permissions CRUD sur une ressource
   */
  static grantFullCRUD(data: {
    userId: string;
    resource: ResourceType;
    businessId?: string | null;
    grantedBy: string;
  }): UserPermission[] {
    const actions = [
      PermissionAction.CREATE,
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
      PermissionAction.LIST,
    ];

    return actions.map((action) =>
      UserPermission.grant({
        userId: data.userId,
        action,
        resource: data.resource,
        businessId: data.businessId,
        grantedBy: data.grantedBy,
      }),
    );
  }

  /**
   * 🎯 Accorder seulement les permissions de lecture
   */
  static grantReadOnly(data: {
    userId: string;
    resource: ResourceType;
    businessId?: string | null;
    grantedBy: string;
  }): UserPermission[] {
    const readActions = [PermissionAction.READ, PermissionAction.LIST];

    return readActions.map((action) =>
      UserPermission.grant({
        userId: data.userId,
        action,
        resource: data.resource,
        businessId: data.businessId,
        grantedBy: data.grantedBy,
      }),
    );
  }

  /**
   * 🎯 Permission de gestion complète (MANAGE)
   */
  static grantManage(data: {
    userId: string;
    resource: ResourceType;
    businessId?: string | null;
    grantedBy: string;
  }): UserPermission {
    return UserPermission.grant({
      userId: data.userId,
      action: PermissionAction.MANAGE,
      resource: data.resource,
      businessId: data.businessId,
      grantedBy: data.grantedBy,
    });
  }
}
