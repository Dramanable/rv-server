/**
 * 🎭 DOMAIN ENTITY - Role Assignment
 *
 * Entité métier pure représentant l'assignation d'un rôle à un utilisateur
 * avec un contexte métier spécifique (Business, Location, Department).
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Logique métier pure sans dépendance infrastructure
 * - Gestion des contextes hiérarchiques (Business > Location > Department)
 * - Validation des assignations de rôles selon la hiérarchie
 */

import {
  BusinessIdRequiredError,
  DepartmentContextError,
  InvalidExpirationDateError,
  RoleBusinessLevelOnlyError,
  RoleContextViolationError,
  RoleDepartmentLevelOnlyError,
  RoleLocationLevelOnlyError,
} from "@domain/exceptions";
import {
  Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  UserRole,
} from "@shared/enums/user-role.enum";

export interface RoleAssignmentContext {
  readonly businessId: string;
  readonly locationId?: string;
  readonly departmentId?: string;
}

export interface CreateRoleAssignmentParams {
  readonly userId: string;
  readonly role: UserRole;
  readonly context: RoleAssignmentContext;
  readonly assignedBy: string;
  readonly expiresAt?: Date;
  readonly notes?: string;
}

export interface RoleAssignmentData {
  readonly id?: string;
  readonly userId: string;
  readonly role: UserRole;
  readonly context: RoleAssignmentContext;
  readonly assignedBy: string;
  readonly assignedAt: Date;
  readonly expiresAt?: Date;
  readonly isActive: boolean;
  readonly notes?: string;
}

export class RoleAssignment {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _role: UserRole,
    private readonly _context: RoleAssignmentContext,
    private readonly _assignedBy: string,
    private readonly _assignedAt: Date,
    private readonly _expiresAt?: Date,
    private _isActive: boolean = true,
    private readonly _notes?: string,
  ) {}

  // Getters
  getId(): string {
    return this._id;
  }
  getUserId(): string {
    return this._userId;
  }
  getRole(): UserRole {
    return this._role;
  }
  getContext(): RoleAssignmentContext {
    return this._context;
  }
  getAssignedBy(): string {
    return this._assignedBy;
  }
  getAssignedAt(): Date {
    return this._assignedAt;
  }
  getExpiresAt(): Date | undefined {
    return this._expiresAt;
  }
  isActiveAssignment(): boolean {
    return this._isActive;
  }
  isActive(): boolean {
    return this._isActive;
  }
  isExpired(): boolean {
    return this.hasExpired();
  }
  getNotes(): string | undefined {
    return this._notes;
  }

  /**
   * ✅ Factory Method - Créer une nouvelle assignation de rôle
   */
  static create(params: CreateRoleAssignmentParams): RoleAssignment {
    // Validation métier
    RoleAssignment.validateRoleAssignment(params.role, params.context);

    return new RoleAssignment(
      RoleAssignment.generateId(),
      params.userId,
      params.role,
      params.context,
      params.assignedBy,
      new Date(),
      params.expiresAt,
      true,
      params.notes,
    );
  }

  /**
   * ✅ Factory Method - Restaurer depuis la persistence
   */
  static restore(data: RoleAssignmentData): RoleAssignment {
    return new RoleAssignment(
      data.id || RoleAssignment.generateId(),
      data.userId,
      data.role,
      data.context,
      data.assignedBy,
      data.assignedAt,
      data.expiresAt,
      data.isActive,
      data.notes,
    );
  }

  /**
   * 🎯 Vérifier si l'assignation est valide dans le contexte actuel
   */
  isValidInContext(targetContext: RoleAssignmentContext): boolean {
    // L'assignation doit correspondre au contexte business
    if (this._context.businessId !== targetContext.businessId) {
      return false;
    }

    // Si l'assignation est au niveau business, elle est valide partout dans le business
    if (!this._context.locationId && !this._context.departmentId) {
      return true;
    }

    // Si l'assignation est au niveau location
    if (this._context.locationId && !this._context.departmentId) {
      return this._context.locationId === targetContext.locationId;
    }

    // Si l'assignation est au niveau department
    if (this._context.departmentId) {
      return this._context.departmentId === targetContext.departmentId;
    }

    return false;
  }

  /**
   * 🚨 Vérifier si l'assignation a expiré
   */
  hasExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }
    return new Date() > this._expiresAt;
  }

  /**
   * 📋 Obtenir les permissions effectives de cette assignation
   */
  getEffectivePermissions(): Permission[] {
    if (!this._isActive || this.hasExpired()) {
      return [];
    }

    return [...(ROLE_PERMISSIONS[this._role] || [])];
  }

  /**
   * 🎭 Vérifier si ce rôle peut agir sur un autre rôle
   */
  canActOnRole(targetRole: UserRole): boolean {
    if (!this._isActive || this.hasExpired()) {
      return false;
    }

    const currentLevel = ROLE_HIERARCHY[this._role] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

    return currentLevel > targetLevel;
  }

  /**
   * ⏰ Désactiver l'assignation
   */
  deactivate(): void;
  deactivate(assignedBy: string, reason?: string): void;
  deactivate(assignedBy?: string, reason?: string): void {
    if (!this._isActive) {
      return;
    }

    this._isActive = false;
  }

  /**
   * ✅ Activer l'assignation
   */
  activate(): RoleAssignment {
    if (this._isActive) {
      return this;
    }

    return new RoleAssignment(
      this._id,
      this._userId,
      this._role,
      this._context,
      this._assignedBy,
      this._assignedAt,
      this._expiresAt,
      true,
      this._notes,
    );
  }

  /**
   * 🔧 Étendre la date d'expiration
   */
  extendExpiration(newExpirationDate: Date): RoleAssignment {
    if (newExpirationDate <= new Date()) {
      throw new InvalidExpirationDateError();
    }

    return new RoleAssignment(
      this._id,
      this._userId,
      this._role,
      this._context,
      this._assignedBy,
      this._assignedAt,
      newExpirationDate,
      this._isActive,
      this._notes,
    );
  }

  /**
   * 📝 Ajouter ou modifier les notes
   */
  updateNotes(newNotes: string): RoleAssignment {
    return new RoleAssignment(
      this._id,
      this._userId,
      this._role,
      this._context,
      this._assignedBy,
      this._assignedAt,
      this._expiresAt,
      this._isActive,
      newNotes,
    );
  }

  /**
   * 🔍 Vérifier si cette assignation a une permission spécifique
   */
  hasPermission(permission: Permission): boolean {
    if (!this._isActive || this.hasExpired()) {
      return false;
    }

    const permissions = this.getEffectivePermissions();
    return permissions.includes(permission);
  }

  /**
   * 🏢 Obtenir le scope de l'assignation (BUSINESS, LOCATION, DEPARTMENT)
   */
  getAssignmentScope(): "BUSINESS" | "LOCATION" | "DEPARTMENT" {
    if (this._context.departmentId) {
      return "DEPARTMENT";
    }
    if (this._context.locationId) {
      return "LOCATION";
    }
    return "BUSINESS";
  }

  /**
   * 📊 Obtenir les informations d'audit
   */
  getAuditInfo(): {
    assignedBy: string;
    assignedAt: Date;
    expiresAt?: Date;
    isActive: boolean;
    scope: string;
  } {
    return {
      assignedBy: this._assignedBy,
      assignedAt: this._assignedAt,
      expiresAt: this._expiresAt,
      isActive: this._isActive,
      scope: this.getAssignmentScope(),
    };
  }

  // Méthodes privées de validation
  private static validateRoleAssignment(
    role: UserRole,
    context: RoleAssignmentContext,
  ): void {
    // Validation du businessId obligatoire
    if (!context.businessId || context.businessId.trim().length === 0) {
      throw new BusinessIdRequiredError();
    }

    // Validation du rôle selon le contexte
    if (role === UserRole.SUPER_ADMIN || role === UserRole.PLATFORM_ADMIN) {
      throw new RoleContextViolationError(
        "Super admin and platform admin roles cannot be assigned in business context",
        role,
      );
    }

    // Validation de la hiérarchie des contextes
    if (context.departmentId && !context.locationId) {
      throw new DepartmentContextError();
    }

    // Validation des rôles selon le niveau de contexte
    const businessLevelRoles = [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
    ];
    const locationLevelRoles = [UserRole.LOCATION_MANAGER];
    const departmentLevelRoles = [UserRole.DEPARTMENT_HEAD];

    if (businessLevelRoles.includes(role)) {
      if (context.locationId || context.departmentId) {
        throw new RoleBusinessLevelOnlyError(role);
      }
    }

    if (locationLevelRoles.includes(role)) {
      if (!context.locationId || context.departmentId) {
        throw new RoleLocationLevelOnlyError(role);
      }
    }

    if (departmentLevelRoles.includes(role)) {
      if (!context.departmentId) {
        throw new RoleDepartmentLevelOnlyError(role);
      }
    }
  }

  private static generateId(): string {
    return (
      "role_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
  }
}
