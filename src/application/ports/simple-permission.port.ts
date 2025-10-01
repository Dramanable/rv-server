/**
 * 🔐 SIMPLE PERMISSION SERVICE PORT - Application Layer
 *
 * Interface pour le service de permissions simplifié.
 * Port de l'architecture hexagonale.
 */

import { UserRole } from '@shared/enums/user-role.enum';

export interface ISimplePermissionService {
  /**
   * 🔐 Vérifier si un utilisateur a une permission
   */
  hasPermission(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    businessId?: string | null,
  ): Promise<boolean>;
}
