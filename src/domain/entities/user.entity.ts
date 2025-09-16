/**
 * 🏛️ DOMAIN ENTITY - User avec Système de Rôles
 *
 * Entité métier pure représentant un utilisateur avec rôles et permissions.
 * Contient la logique métier et les règles de validation.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Pas de dépendance vers l'infrastructure
 * - Logique métier pure avec système de permissions
 * - Entité auto-validante avec Email Value Object
 */

import {
  Permission,
  ROLE_PERMISSIONS,
  UserRole,
} from '../../shared/enums/user-role.enum';
import { Email } from '../value-objects/email.vo';

export class User {
  public readonly id: string;
  public readonly email: Email;
  public readonly name: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;
  public readonly updatedAt?: Date;
  public readonly hashedPassword?: string; // Hash du mot de passe pour l'authentification
  public readonly passwordChangeRequired: boolean; // Indique si l'utilisateur doit changer son mot de passe
  public readonly username?: string; // Nom d'utilisateur optionnel
  public readonly isActive?: boolean; // Statut actif
  public readonly isVerified?: boolean; // Statut vérifié
  public readonly firstName?: string; // Prénom séparé
  public readonly lastName?: string; // Nom de famille séparé

  constructor(
    email: Email,
    name: string,
    role: UserRole,
    options?: { passwordChangeRequired?: boolean },
  ) {
    this.validateName(name);

    this.id = this.generateId();
    this.email = email;
    this.name = name.trim();
    this.role = role;
    this.createdAt = new Date();
    this.passwordChangeRequired = options?.passwordChangeRequired ?? false;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.role];
    return rolePermissions?.includes(permission) ?? false;
  }

  /**
   * Vérifie si l'utilisateur est admin plateforme
   */
  isPlatformAdmin(): boolean {
    return this.role === UserRole.PLATFORM_ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est propriétaire d'entreprise
   */
  isBusinessOwner(): boolean {
    return this.role === UserRole.BUSINESS_OWNER;
  }

  /**
   * Vérifie si l'utilisateur est admin d'entreprise
   */
  isBusinessAdmin(): boolean {
    return this.role === UserRole.BUSINESS_ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est manager (tous types)
   */
  isManager(): boolean {
    return [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
      UserRole.LOCATION_MANAGER,
      UserRole.DEPARTMENT_HEAD,
    ].includes(this.role);
  }

  /**
   * Vérifie si l'utilisateur est praticien (tous niveaux)
   */
  isPractitioner(): boolean {
    return [
      UserRole.SENIOR_PRACTITIONER,
      UserRole.PRACTITIONER,
      UserRole.JUNIOR_PRACTITIONER,
    ].includes(this.role);
  }

  /**
   * Vérifie si l'utilisateur est personnel de support
   */
  isSupportStaff(): boolean {
    return [
      UserRole.RECEPTIONIST,
      UserRole.ASSISTANT,
      UserRole.SCHEDULER,
    ].includes(this.role);
  }

  /**
   * Vérifie si l'utilisateur est client
   */
  isClient(): boolean {
    return [
      UserRole.CORPORATE_CLIENT,
      UserRole.VIP_CLIENT,
      UserRole.REGULAR_CLIENT,
      UserRole.GUEST_CLIENT,
    ].includes(this.role);
  }

  /**
   * Obtient le niveau hiérarchique du rôle (plus élevé = plus de pouvoir)
   */
  getRoleLevel(): number {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.PLATFORM_ADMIN]: 1000,
      [UserRole.BUSINESS_OWNER]: 900,
      [UserRole.BUSINESS_ADMIN]: 800,
      [UserRole.LOCATION_MANAGER]: 700,
      [UserRole.DEPARTMENT_HEAD]: 600,
      [UserRole.SENIOR_PRACTITIONER]: 500,
      [UserRole.PRACTITIONER]: 400,
      [UserRole.JUNIOR_PRACTITIONER]: 300,
      [UserRole.SCHEDULER]: 250,
      [UserRole.RECEPTIONIST]: 200,
      [UserRole.ASSISTANT]: 150,
      [UserRole.CORPORATE_CLIENT]: 100,
      [UserRole.VIP_CLIENT]: 80,
      [UserRole.REGULAR_CLIENT]: 60,
      [UserRole.GUEST_CLIENT]: 40,
    };
    return hierarchy[this.role] || 0;
  }

  /**
   * Compare les emails de deux utilisateurs
   */
  hasSameEmail(other: User): boolean {
    return this.email.equals(other.email);
  }

  /**
   * Peut-il effectuer une action sur un autre utilisateur ?
   * Règles métier basées sur la hiérarchie des rôles :
   * - Platform admin peut tout faire
   * - Niveaux supérieurs peuvent agir sur niveaux inférieurs
   * - Même niveau peut agir seulement sur soi-même
   * - Clients ne peuvent agir que sur eux-mêmes
   */
  canActOnUser(targetUser: User): boolean {
    // Platform admin peut tout
    if (this.isPlatformAdmin()) {
      return true;
    }

    // Peut toujours agir sur soi-même
    if (this.hasSameEmail(targetUser)) {
      return true;
    }

    // Les clients ne peuvent agir que sur eux-mêmes
    if (this.isClient()) {
      return false;
    }

    // Hiérarchie : niveau supérieur peut agir sur niveau inférieur
    return this.getRoleLevel() > targetUser.getRoleLevel();
  }

  /**
   * Factory method pour créer un utilisateur standard
   */
  static create(email: Email, name: string, role: UserRole): User {
    return new User(email, name, role);
  }

  /**
   * Factory method pour restaurer un utilisateur depuis des données persistées
   */
  static restore(
    id: string,
    email: string,
    name: string,
    role: UserRole,
    createdAt: Date,
    updatedAt?: Date,
    hashedPassword?: string,
    passwordChangeRequired?: boolean,
  ): User {
    const emailVo = Email.create(email);
    const user = new User(emailVo, name, role, { passwordChangeRequired });

    // Assignment des propriétés readonly via Object.assign
    Object.assign(user, {
      id,
      hashedPassword,
      createdAt,
      updatedAt,
    });

    return user;
  }

  /**
   * Factory method pour créer un utilisateur avec mot de passe hashé (pour le mapping ORM)
   */
  static createWithHashedPassword(
    id: string,
    email: Email,
    name: string,
    role: UserRole,
    hashedPassword: string,
    createdAt: Date,
    updatedAt?: Date,
    username?: string,
    isActive?: boolean,
    isVerified?: boolean,
    passwordChangeRequired?: boolean,
  ): User {
    const user = new User(email, name, role, { passwordChangeRequired });

    // Assignment des propriétés readonly via Object.assign
    Object.assign(user, {
      id,
      hashedPassword,
      createdAt,
      updatedAt,
      username,
      isActive,
      isVerified,
    });

    return user;
  }

  /**
   * Crée un utilisateur temporaire qui doit changer son mot de passe
   */
  static createTemporary(email: Email, name: string, role: UserRole): User {
    return new User(email, name, role, { passwordChangeRequired: true });
  }

  /**
   * Force l'utilisateur à changer son mot de passe
   * Retourne un nouvel utilisateur avec passwordChangeRequired = true
   */
  requirePasswordChange(): User {
    if (this.passwordChangeRequired) {
      return this; // Déjà requis, retourne l'instance actuelle
    }

    return this.cloneWith({ passwordChangeRequired: true });
  }

  /**
   * Supprime l'exigence de changement de mot de passe
   * Retourne un nouvel utilisateur avec passwordChangeRequired = false
   */
  clearPasswordChangeRequirement(): User {
    if (!this.passwordChangeRequired) {
      return this; // Déjà clair, retourne l'instance actuelle
    }

    return this.cloneWith({ passwordChangeRequired: false });
  }

  /**
   * Clone l'utilisateur avec des propriétés modifiées
   */
  private cloneWith(changes: { passwordChangeRequired?: boolean }): User {
    const newUser = new User(this.email, this.name, this.role, {
      passwordChangeRequired:
        changes.passwordChangeRequired ?? this.passwordChangeRequired,
    });

    // Copie des propriétés via Object.assign pour éviter les erreurs TypeScript
    Object.assign(newUser, {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      hashedPassword: this.hashedPassword,
    });

    return newUser;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
