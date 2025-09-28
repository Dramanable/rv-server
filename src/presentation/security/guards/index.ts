/**
 * 🛡️ SECURITY GUARDS - Index des Guards de Sécurité
 *
 * Export centralisé de tous les guards de sécurité pour une utilisation
 * simple et cohérente dans les contrôleurs.
 */

// Authentication Guards
export { JwtAuthGuard } from './jwt-auth.guard';
export { LocalAuthGuard } from './local-auth.guard';

// Authorization Guards
export {
  BusinessContextGuard,
  PermissionsGuard,
  RoleHierarchyGuard,
} from './permissions.guard';
export { RolesGuard } from './roles.guard';

// Guards Combinés pour usage courant
import { JwtAuthGuard } from './jwt-auth.guard';
import { BusinessContextGuard, PermissionsGuard } from './permissions.guard';

/**
 * 🔒 Guard combiné : Authentication + Permissions
 * À utiliser quand vous avez besoin d'authentification ET de vérification de permissions
 */
export const AuthPermissionsGuards = [JwtAuthGuard, PermissionsGuard];

/**
 * 🏢 Guard combiné : Authentication + Business Context + Permissions
 * À utiliser pour les opérations sensibles dans un contexte business spécifique
 */
export const FullSecurityGuards = [
  JwtAuthGuard,
  BusinessContextGuard,
  PermissionsGuard,
];

/**
 * 🎯 Helper pour créer des guards personnalisés rapidement
 */
export const createSecurityGuards = (options: {
  requireAuth?: boolean;
  requireBusinessContext?: boolean;
  requirePermissions?: boolean;
}) => {
  const guards = [];

  if (options.requireAuth !== false) {
    guards.push(JwtAuthGuard);
  }

  if (options.requireBusinessContext) {
    guards.push(BusinessContextGuard);
  }

  if (options.requirePermissions !== false) {
    guards.push(PermissionsGuard);
  }

  return guards;
};

/**
 * 📋 Guide d'utilisation dans les contrôleurs :
 *
 * // Authentication seule
 * @UseGuards(JwtAuthGuard)
 *
 * // Authentication + Permissions
 * @UseGuards(...AuthPermissionsGuards)
 * @RequirePermissions(Permission.MANAGE_APPOINTMENTS)
 *
 * // Sécurité complète avec contexte business
 * @UseGuards(...FullSecurityGuards)
 * @RequirePermissions(Permission.MANAGE_STAFF)
 *
 * // Personnalisé
 * @UseGuards(...createSecurityGuards({
 *   requireAuth: true,
 *   requireBusinessContext: true
 * }))
 *
 * // Permissions avec décorateurs spécialisés
 * @UseGuards(...AuthPermissionsGuards)
 * @RequireStaffManagement()
 *
 * // Hiérarchie des rôles
 * @UseGuards(JwtAuthGuard, RoleHierarchyGuard)
 * @RequireHierarchyLevel(500) // Niveau SENIOR_PRACTITIONER minimum
 */
