/**
 * 🧪 Test Mocks - Mocks Typés pour Tests Unitaires
 * ✅ Mocks robustes pour éviter les erreurs de type
 * ✅ Compatible avec les interfaces Clean Architecture
 */

import type { IAuditService } from "@application/ports/audit.port";
import type { ICacheService } from "@application/ports/cache.port";
import type { I18nService } from "@application/ports/i18n.port";
import type { Logger } from "@application/ports/logger.port";
import type { IPasswordService } from "@application/ports/password.service.interface";
import type { IPermissionService } from "@application/ports/permission.service.interface";
import type { IServiceTypeRepository } from "@domain/repositories/service-type.repository";
import type { UserRepository } from "@domain/repositories/user.repository.interface";
import type { ExecutionContext } from "@nestjs/common";
import type { Request, Response } from "express";

// 🎭 Mock ExecutionContext
export const createMockExecutionContext = (
  request?: Partial<Request>,
): jest.Mocked<ExecutionContext> => {
  const mockRequest = {
    path: "/test",
    method: "GET",
    ip: "127.0.0.1",
    headers: { "user-agent": "test-agent" },
    ...request,
  } as Request;

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue({} as Response),
    }),
    getHandler: jest.fn().mockReturnValue({ name: "testHandler" }),
    getClass: jest.fn().mockReturnValue({ name: "TestController" }),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as jest.Mocked<ExecutionContext>;
};

// 🗄️ Mock UserRepository (méthodes principales pour les tests)
export const createMockUserRepository = () =>
  ({
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findByRole: jest.fn(),
    emailExists: jest.fn(),
    existsByUsername: jest.fn(),
    updatePassword: jest.fn(),
    updateActiveStatus: jest.fn(),
    countSuperAdmins: jest.fn(),
    count: jest.fn(),
    // Méthodes supplémentaires (si nécessaires dans les tests)
    countWithFilters: jest.fn(),
    update: jest.fn(),
    updateBatch: jest.fn(),
    deleteBatch: jest.fn(),
    export: jest.fn(),
  }) as jest.Mocked<UserRepository>;

// 🗂️ Mock CacheService
export const createMockCacheService = (): jest.Mocked<ICacheService> => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  deletePattern: jest.fn(),
  invalidateUserCache: jest.fn(),
});

// 📝 Mock Logger
export const createMockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn().mockReturnThis(),
});

// 🌐 Mock I18nService
export const createMockI18nService = (): jest.Mocked<I18nService> => ({
  translate: jest.fn().mockReturnValue("Mocked message"),
  t: jest.fn().mockReturnValue("Mocked message"),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn().mockReturnValue(true),
});

// 🔐 Mock PasswordService
export const createMockPasswordService = (): jest.Mocked<IPasswordService> => ({
  hash: jest.fn(),
  verify: jest.fn(),
});

// 🎯 Mock ConfigService
export const createMockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    const config = {
      "jwt.secret": "test-secret",
      "jwt.expiresIn": "15m",
      "jwt.refreshExpiresIn": "7d",
    };
    return config[key as keyof typeof config];
  }),
});

// 📅 Mock AppointmentRepository
export const createMockAppointmentRepository = () => ({
  findById: jest.fn(),
  findByBusinessId: jest.fn(),
  findByCalendarId: jest.fn(),
  findByServiceId: jest.fn(),
  findByClientEmail: jest.fn(),
  findByStaffId: jest.fn(),
  findByStatus: jest.fn(),
  search: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findConflictingAppointments: jest.fn(),
  findAvailableSlots: jest.fn(),
  getStatistics: jest.fn(),
  getUpcomingAppointments: jest.fn(),
  getOverdueAppointments: jest.fn(),
  findRecurringAppointments: jest.fn(),
  getAppointmentsForReminders: jest.fn(),
  bulkUpdateStatus: jest.fn(),
  bulkCancel: jest.fn(),
  getClientHistory: jest.fn(),
  findAppointmentsNeedingFollowUp: jest.fn(),
  getCalendarUtilization: jest.fn(),
  count: jest.fn(),
  export: jest.fn(),
});

// 🏢 Mock BusinessRepository
export const createMockBusinessRepository = () => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findBySector: jest.fn(),
  search: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  existsByName: jest.fn(),
  count: jest.fn(),
  getStatistics: jest.fn(),
});

// 🛠️ Mock ServiceRepository
export const createMockServiceRepository = () => ({
  findById: jest.fn(),
  findByBusinessId: jest.fn(),
  findActiveByBusinessId: jest.fn(),
  findByCategory: jest.fn(),
  findByStaffId: jest.fn(),
  search: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  existsByName: jest.fn(),
  bulkUpdateStatus: jest.fn(),
  findMostPopular: jest.fn(),
  getBusinessServiceStatistics: jest.fn(),
});

// 📅 Mock CalendarRepository
export const createMockCalendarRepository = () => ({
  findById: jest.fn(),
  findByBusinessId: jest.fn(),
  findByOwnerId: jest.fn(),
  findByType: jest.fn(),
  findAvailableSlots: jest.fn(),
  getBookedSlots: jest.fn(),
  search: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  bulkUpdateStatus: jest.fn(),
  getUtilizationStats: jest.fn(),
  getRecurringPatterns: jest.fn(),
});

// 🔐 Mock PermissionService
export const createMockPermissionService =
  (): jest.Mocked<IPermissionService> => ({
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
    hasAccessToBusiness: jest.fn(),
  });

// 📊 Mock AuditService
export const createMockAuditService = (): jest.Mocked<IAuditService> => ({
  logOperation: jest.fn(),
  findAuditEntries: jest.fn(),
  getEntityHistory: jest.fn(),
  getUserActions: jest.fn(),
  verifyIntegrity: jest.fn(),
  archiveOldEntries: jest.fn(),
  exportAuditData: jest.fn(),
});

// 🏷️ Mock ServiceTypeRepository
export const createMockServiceTypeRepository =
  (): jest.Mocked<IServiceTypeRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByBusinessIdAndCode: jest.fn(),
    findByBusinessIdAndName: jest.fn(),
    findByBusinessId: jest.fn(),
    findActiveByBusinessId: jest.fn(),
    search: jest.fn(),
    existsByBusinessIdAndCode: jest.fn(),
    existsByBusinessIdAndName: jest.fn(),
    countByBusinessId: jest.fn(),
    countActiveByBusinessId: jest.fn(),
    delete: jest.fn(),
    hardDelete: jest.fn(),
    isReferencedByServices: jest.fn(),
    findByBusinessIdOrderedBySortOrder: jest.fn(),
    updateSortOrders: jest.fn(),
  });
