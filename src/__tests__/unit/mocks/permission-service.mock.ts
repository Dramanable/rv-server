/**
 * 🧪 MOCK CENTRALISÉ - IPermissionService
 *
 * Mock réutilisable du IPermissionService pour tous les tests
 * Respecte exactement l'interface IPermissionService
 */

import type { IPermissionService } from "@application/ports/permission.service.interface";

export const createMockPermissionService =
  (): jest.Mocked<IPermissionService> => {
    return {
      hasPermission: jest.fn().mockResolvedValue(true),
      canActOnRole: jest.fn().mockResolvedValue(true),
      requirePermission: jest.fn().mockResolvedValue(undefined),
      getUserPermissions: jest.fn().mockResolvedValue([]),
      getUserRole: jest.fn().mockResolvedValue("BUSINESS_OWNER" as any),
      hasRole: jest.fn().mockResolvedValue(true),
      hasBusinessPermission: jest.fn().mockResolvedValue(true),
      canManageUser: jest.fn().mockResolvedValue(true),
      requireSuperAdminPermission: jest.fn().mockResolvedValue(undefined),
      isSuperAdmin: jest.fn().mockResolvedValue(false),
      hasAccessToBusiness: jest.fn().mockResolvedValue(true),
    } as jest.Mocked<IPermissionService>;
  };
