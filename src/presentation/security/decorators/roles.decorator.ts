/**
 * � ROLES DECORATOR - Simple Role-Based Access Control
 *
 * Décorateur simple pour spécifier quels rôles sont autorisés.
 * Utilisé avec RoleBasedGuard pour vérification multi-tenant.
 *
 * PHILOSOPHIE :
 * - Simple et focalisé sur les rôles uniquement
 * - Pas de logique métier complexe (c'est pour les use cases)
 * - Support multi-tenant natif
 * - Hiérarchie des rôles respectée
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../shared/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles autorisés à accéder à une route
 *
 * @param roles - Rôle unique ou liste de rôles autorisés
 *
 * @example
 * // Rôle unique
 * @RequireRoles(UserRole.BUSINESS_OWNER)
 * @Post('create-business')
 * async createBusiness() { ... }
 *
 * @example
 * // Plusieurs rôles (OR logic - au moins un des rôles)
 * @RequireRoles([UserRole.BUSINESS_ADMIN, UserRole.LOCATION_MANAGER])
 * @Get('staff')
 * async getStaff() { ... }
 */
export const RequireRoles = (roles: UserRole | UserRole[]) =>
  SetMetadata(ROLES_KEY, Array.isArray(roles) ? roles : [roles]);

// Alias pour compatibilité
export const Roles = (...roles: UserRole[]) => RequireRoles(roles);

/**
 * Décorateurs de convenance pour les cas courants
 */

// 🔴 Platform Level (Super Admin)
export const RequirePlatformAdmin = () =>
  RequireRoles([UserRole.SUPER_ADMIN, UserRole.PLATFORM_ADMIN]);

// 🟠 Business Level (Ownership & Administration)
export const RequireBusinessOwnership = () =>
  RequireRoles([UserRole.BUSINESS_OWNER]);

export const RequireBusinessAdmin = () =>
  RequireRoles([UserRole.BUSINESS_OWNER, UserRole.BUSINESS_ADMIN]);

// 🟡 Management Level
export const RequireManagement = () =>
  RequireRoles([
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.DEPARTMENT_HEAD,
  ]);

// 🟢 Staff Level (All Staff)
export const RequireStaff = () =>
  RequireRoles([
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.SENIOR_PRACTITIONER,
    UserRole.PRACTITIONER,
    UserRole.JUNIOR_PRACTITIONER,
    UserRole.RECEPTIONIST,
    UserRole.ASSISTANT,
    UserRole.SCHEDULER,
  ]);

// 🔵 Practitioner Level (Medical/Professional Staff)
export const RequirePractitioner = () =>
  RequireRoles([
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.SENIOR_PRACTITIONER,
    UserRole.PRACTITIONER,
    UserRole.JUNIOR_PRACTITIONER,
  ]);

// 🟣 Client Level
export const RequireClient = () =>
  RequireRoles([
    UserRole.CORPORATE_CLIENT,
    UserRole.REGULAR_CLIENT,
    UserRole.VIP_CLIENT,
    UserRole.GUEST_CLIENT,
  ]);

// 🎯 Combined Access (Staff + Clients for shared endpoints)
export const RequireStaffOrClient = () =>
  RequireRoles([
    // Staff
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.DEPARTMENT_HEAD,
    UserRole.SENIOR_PRACTITIONER,
    UserRole.PRACTITIONER,
    UserRole.JUNIOR_PRACTITIONER,
    UserRole.RECEPTIONIST,
    UserRole.ASSISTANT,
    UserRole.SCHEDULER,
    // Clients
    UserRole.CORPORATE_CLIENT,
    UserRole.REGULAR_CLIENT,
    UserRole.VIP_CLIENT,
  ]);
