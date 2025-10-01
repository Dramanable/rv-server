/**
 * 🛡️ SIMPLE Permission Service - Version Simplifiée TDD
 * ✅ TDD - Implémentation après test
 * ✅ Clean Architecture - Pure logique infrastructure
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { ISimplePermissionService } from "@application/ports/simple-permission.port";
import { UserRole } from "@shared/enums/user-role.enum";

@Injectable()
export class SimplePermissionService implements ISimplePermissionService {
  constructor(
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * ✅ Vérifier si un utilisateur a une permission spécifique
   * LOGIQUE SIMPLE : Basée uniquement sur le rôle utilisateur
   */
  async hasPermission(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    businessId?: string | null,
  ): Promise<boolean> {
    try {
      console.log("🔥 SIMPLE PERMISSIONS - Checking permission", {
        userId,
        userRole,
        action,
        resource,
        businessId,
      });

      // RÈGLES SIMPLES par rôle
      switch (userRole) {
        case UserRole.SUPER_ADMIN:
        case UserRole.PLATFORM_ADMIN:
          console.log("🔥 SIMPLE PERMISSIONS - SUPER/PLATFORM ADMIN - GRANTED");
          return true; // Peut tout faire

        case UserRole.BUSINESS_OWNER:
          // Peut gérer les prospects de son business
          if (
            resource === "PROSPECT" &&
            (action === "CREATE" ||
              action === "READ" ||
              action === "LIST" ||
              action === "MANAGE")
          ) {
            console.log(
              "🔥 SIMPLE PERMISSIONS - BUSINESS_OWNER prospect permission - GRANTED",
            );
            return true;
          }
          break;

        default:
          console.log("🔥 SIMPLE PERMISSIONS - DEFAULT - DENIED", {
            userRole,
            action,
            resource,
          });
          return false;
      }

      console.log("🔥 SIMPLE PERMISSIONS - No matching rule - DENIED", {
        userRole,
        action,
        resource,
      });
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error checking simple permission: ${errorMessage}`);
      throw error;
    }
  }
}
