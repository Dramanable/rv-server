/**
 * 🎯 PERMISSIONS DECORATOR - Décorateur pour spécifier les permissions requises
 *
 * Décorateur NestJS avancé utilisé pour définir quelles permissions granulaires
 * sont requises pour accéder à une route ou méthode de contrôleur.
 *
 * Fonctionne avec PermissionsGuard pour la vérification effective.
 *
 * Usage simple:
 * @RequirePermissions(Permission.MANAGE_APPOINTMENTS)
 * @Post('book')
 * async bookAppointment() { ... }
 *
 * Usage avancé avec contexte:
 * @RequirePermissions(
 *   [Permission.MANAGE_STAFF, Permission.VIEW_STAFF_PERFORMANCE],
 *   { requireAll: false, businessId: 'from-param' }
 * )
 * @Get(':businessId/staff')
 * async getStaff() { ... }
 */

import { SetMetadata } from "@nestjs/common";
import { Permission } from "../../../shared/enums/user-role.enum";

export const PERMISSIONS_KEY = "permissions";

export interface PermissionDecoratorOptions {
  /**
   * Si true, l'utilisateur doit avoir TOUTES les permissions listées (AND logic)
   * Si false (défaut), l'utilisateur doit avoir AU MOINS UNE permission (OR logic)
   */
  requireAll?: boolean;

  /**
   * Contexte business spécifique pour la vérification des permissions
   */
  businessId?: string;
  locationId?: string;
  departmentId?: string;
  resourceOwnerId?: string;
}

/**
 * Décorateur pour spécifier les permissions requises (version simple)
 * @param permissions - Permission unique ou liste de permissions
 */
export function RequirePermissions(
  permissions: Permission | Permission[],
): MethodDecorator;

/**
 * Décorateur pour spécifier les permissions requises (version avancée)
 * @param permissions - Permission unique ou liste de permissions
 * @param options - Options avancées pour la vérification
 */
export function RequirePermissions(
  permissions: Permission | Permission[],
  options?: PermissionDecoratorOptions,
): MethodDecorator;

export function RequirePermissions(
  permissions: Permission | Permission[],
  options?: PermissionDecoratorOptions,
): MethodDecorator {
  const permissionsList = Array.isArray(permissions)
    ? permissions
    : [permissions];

  return SetMetadata(PERMISSIONS_KEY, {
    permissions: permissionsList,
    context: options,
  });
}

/**
 * Décorateur pour spécifier qu'AU MOINS UNE des permissions est requise (OR logic)
 * @param permissions - Liste de permissions (au moins une requise)
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  RequirePermissions(permissions, { requireAll: false });

/**
 * Décorateur pour spécifier que TOUTES les permissions sont requises (AND logic)
 * @param permissions - Liste de permissions (toutes requises)
 */
export const RequireAllPermissions = (...permissions: Permission[]) =>
  RequirePermissions(permissions, { requireAll: true });

/**
 * Décorateurs spécialisés pour les permissions courantes
 */

// 🏢 Management Permissions
export const RequireBusinessManagement = () =>
  RequirePermissions(
    [
      Permission.CONFIGURE_BUSINESS_SETTINGS,
      Permission.MANAGE_BUSINESS_LOCATIONS,
      Permission.VIEW_BUSINESS_ANALYTICS,
    ],
    { requireAll: false },
  );

export const RequireStaffManagement = () =>
  RequirePermissions(
    [
      Permission.MANAGE_ALL_STAFF,
      Permission.HIRE_STAFF,
      Permission.ASSIGN_ROLES,
    ],
    { requireAll: false },
  );

// 📅 Calendar & Appointments
export const RequireCalendarManagement = () =>
  RequirePermissions(
    [
      Permission.CONFIGURE_BUSINESS_CALENDAR,
      Permission.MANAGE_CALENDAR_RULES,
      Permission.VIEW_ALL_CALENDARS,
    ],
    { requireAll: false },
  );

export const RequireAppointmentManagement = () =>
  RequirePermissions(
    [
      Permission.BOOK_ANY_APPOINTMENT,
      Permission.RESCHEDULE_ANY_APPOINTMENT,
      Permission.CANCEL_ANY_APPOINTMENT,
      Permission.VIEW_ALL_APPOINTMENTS,
    ],
    { requireAll: false },
  );

// 🛎️ Service Management
export const RequireServiceManagement = () =>
  RequirePermissions(
    [
      Permission.MANAGE_SERVICE_CATALOG,
      Permission.CREATE_SERVICES,
      Permission.UPDATE_SERVICE_PRICING,
    ],
    { requireAll: false },
  );

// 👤 Client Management
export const RequireClientManagement = () =>
  RequirePermissions(
    [
      Permission.MANAGE_ALL_CLIENTS,
      Permission.VIEW_CLIENT_HISTORY,
      Permission.CREATE_CLIENT_ACCOUNTS,
    ],
    { requireAll: false },
  );

// 💰 Financial Management
export const RequireFinancialManagement = () =>
  RequirePermissions(
    [
      Permission.MANAGE_PRICING,
      Permission.VIEW_FINANCIAL_REPORTS,
      Permission.PROCESS_PAYMENTS,
    ],
    { requireAll: false },
  );

// 📊 Reporting & Analytics
export const RequireReporting = () =>
  RequirePermissions(
    [
      Permission.VIEW_DETAILED_REPORTS,
      Permission.EXPORT_DATA,
      Permission.VIEW_STAFF_UTILIZATION,
    ],
    { requireAll: false },
  );

// 🎯 Personal Permissions (self-service)
export const RequirePersonalAccess = () =>
  RequirePermissions(
    [
      Permission.MANAGE_OWN_SCHEDULE,
      Permission.VIEW_OWN_APPOINTMENTS,
      Permission.UPDATE_OWN_PROFILE,
    ],
    { requireAll: false },
  );

// 🏥 Client Permissions
export const RequireClientAccess = () =>
  RequirePermissions(
    [
      Permission.BOOK_APPOINTMENT,
      Permission.VIEW_OWN_APPOINTMENTS,
      Permission.RESCHEDULE_OWN_APPOINTMENTS,
    ],
    { requireAll: false },
  );

/**
 * Décorateur pour vérifier que l'utilisateur peut agir sur une ressource spécifique
 * @param resourceType - Type de ressource (staff, appointment, client, etc.)
 */
export const RequireResourceAccess = (
  resourceType: "staff" | "appointment" | "client" | "service",
) => {
  const permissionMap = {
    staff: [Permission.MANAGE_ALL_STAFF, Permission.VIEW_STAFF_PERFORMANCE],
    appointment: [
      Permission.VIEW_ALL_APPOINTMENTS,
      Permission.MANAGE_WAITING_LIST,
    ],
    client: [Permission.MANAGE_ALL_CLIENTS, Permission.VIEW_CLIENT_HISTORY],
    service: [Permission.MANAGE_SERVICE_CATALOG, Permission.CREATE_SERVICES],
  };

  return RequirePermissions(permissionMap[resourceType], { requireAll: false });
};

/**
 * Décorateur pour les permissions de praticien (self-service + assigned clients)
 */
export const RequirePractitionerAccess = () =>
  RequirePermissions(
    [
      Permission.MANAGE_OWN_SCHEDULE,
      Permission.SET_OWN_AVAILABILITY,
      Permission.VIEW_OWN_APPOINTMENTS,
      Permission.CONFIRM_APPOINTMENTS, // Pour ses propres RDV
    ],
    { requireAll: false },
  );

/**
 * Décorateur pour les permissions hiérarchiques (peut agir sur des rôles inférieurs)
 */
export const RequireHierarchyLevel =
  (minLevel: number) =>
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata("hierarchyLevel", minLevel)(target, propertyKey, descriptor);
  };

/**
 * Exemples d'usage dans les contrôleurs :
 *
 * // Permission simple
 * @RequirePermissions(Permission.MANAGE_APPOINTMENTS)
 * @Post('appointments')
 * async createAppointment() { ... }
 *
 * // Permissions multiples (OR logic - au moins une)
 * @RequirePermissions([Permission.MANAGE_STAFF, Permission.VIEW_STAFF_PERFORMANCE])
 * @Get('staff')
 * async getStaff() { ... }
 *
 * // Permissions multiples (AND logic - toutes requises)
 * @RequireAllPermissions(Permission.MANAGE_STAFF, Permission.ASSIGN_ROLES)
 * @Post('staff/assign-role')
 * async assignRole() { ... }
 *
 * // Décorateur spécialisé
 * @RequireStaffManagement()
 * @Delete('staff/:id')
 * async deleteStaff() { ... }
 *
 * // Combinaison avec hiérarchie
 * @RequirePermissions(Permission.ASSIGN_ROLES)
 * @RequireHierarchyLevel(500) // Niveau SENIOR_PRACTITIONER minimum
 * @Post('assign-junior-role')
 * async assignJuniorRole() { ... }
 */
