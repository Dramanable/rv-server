/**
 * 🧪 TEST DEBUG - Vérifier problème logger
 */

import { GetServiceUseCase } from "@application/use-cases/service/get-service.use-case";

describe("🔧 Debug Logger Problem", () => {
  it("should instantiate with basic mocks", () => {
    const mockServiceRepository = {
      findById: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByStaffId: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      findMostPopular: jest.fn(),
      getBusinessServiceStatistics: jest.fn(),
      findByName: jest.fn(),
      findPopularServices: jest.fn(),
      getServiceStatistics: jest.fn(),
    };

    const mockPermissionService = {
      requirePermission: jest.fn(),
      hasPermission: jest.fn(),
      getUserPermissions: jest.fn(),
      canActOnRole: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    const mockI18n = {
      translate: jest.fn().mockReturnValue("Test message"),
      t: jest.fn().mockReturnValue("Test message"),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    // Test instantiation - Vérifier chaque paramètre
    console.log("Mock logger direct:", mockLogger);
    console.log("Mock logger error:", mockLogger.error);
    console.log("Mock permission service:", mockPermissionService);

    const useCase = new GetServiceUseCase(
      mockServiceRepository as any,
      mockPermissionService as any,
      mockLogger as any,
      mockI18n as any,
    );

    expect(useCase).toBeDefined();
    console.log("UseCase logger:", (useCase as any).logger);
    console.log(
      "UseCase permissionService:",
      (useCase as any).permissionService,
    );
    console.log("Logger error method:", (useCase as any).logger?.error);
    console.log("Logger type:", typeof (useCase as any).logger?.error);
  });
});
