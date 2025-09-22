/**
 * 🎭 ROLES DECORATOR - Décorateur pour spécifier les rôles requis
 *
 * Décorateur NestJS utilisé pour définir quels rôles utilisateurs
 * sont autorisés à accéder à une route ou méthode de contrôleur.
 *
 * Fonctionne avec RolesGuard pour la vérification effective.
 *
 * Usage:
 * @Roles(UserRole.BUSINESS_OWNER, UserRole.PLATFORM_ADMIN)
 * @Get('protected-route')
 * async protectedMethod() { ... }
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../shared/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles autorisés
 * @param roles - Liste des rôles autorisés à accéder à la route
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
