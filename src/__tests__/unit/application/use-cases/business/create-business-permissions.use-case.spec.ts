/**
 * 🧪 TDD Test - CreateBusinessUseCase Permissions
 *
 * 🎯 Test des permissions RBAC granulaires :
 * - Seuls PLATFORM_ADMIN et BUSINESS_OWNER peuvent créer des entreprises
 * - Validation des contextes métier
 * - Gestion des erreurs de permissions
 */
import { InsufficientPermissionsError } from "@application/exceptions/application.exceptions";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import { CreateBusinessUseCase } from "@application/use-cases/business/create-business.use-case";
import { BusinessRepository } from "@domain/repositories/business.repository.interface";

describe("CreateBusinessUseCase - Permissions TDD", () => {
  let useCase: CreateBusinessUseCase;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockBusinessRepository: jest.Mocked<BusinessRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest = {
    requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
    name: "Test Business",
    description: "Test description",
    slogan: "Test slogan",
    address: {
      street: "123 Test St",
      city: "Test City",
      postalCode: "12345",
      country: "France",
      region: "Île-de-France",
    },
    contactInfo: {
      primaryEmail: "test@business.com",
      primaryPhone: "+33123456789",
    },
  };

  beforeEach(() => {
    // 🎭 Mocks - Structure exacte des interfaces
    mockPermissionService = {
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      requirePermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
      hasAccessToBusiness: jest.fn(),
    };

    mockBusinessRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findBySector: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
      findNearLocation: jest.fn(),
      getStatistics: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    mockI18n = {
      translate: jest.fn().mockImplementation((key: string) => key),
      t: jest.fn().mockImplementation((key: string) => key),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    // ⚠️ Attention : CreateBusinessUseCase utilise encore UserRepository !
    // Pour ce test TDD, on teste ce qu'on VEUT (avec IPermissionService)
    // Le use case sera refactorisé après
    useCase = new CreateBusinessUseCase(
      mockBusinessRepository,
      {} as any, // userRepository sera remplacé par mockPermissionService
      mockLogger,
      mockI18n,
    );
  });

  describe("🔐 Permission Validation - RBAC avec IPermissionService", () => {
    it("should require CREATE_BUSINESS permission", async () => {
      // � GREEN - Maintenant le use case utilise IPermissionService !
      mockPermissionService.requirePermission.mockResolvedValue();
      mockBusinessRepository.existsByName.mockResolvedValue(false);
      mockBusinessRepository.save.mockResolvedValue();

      // Créer un use case avec IPermissionService
      const useCase = new CreateBusinessUseCase(
        mockBusinessRepository,
        mockPermissionService,
        mockLogger,
        mockI18n,
      );

      await useCase.execute(validRequest);

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        "CREATE_BUSINESS",
        expect.objectContaining({
          operation: "CREATE_BUSINESS",
          resource: "business",
          requestingUserId: validRequest.requestingUserId,
        }),
      );
    });

    it("should reject users without CREATE_BUSINESS permission", async () => {
      // � GREEN - Test de rejet des permissions
      const permissionError = new InsufficientPermissionsError(
        validRequest.requestingUserId,
        "CREATE_BUSINESS",
        "business",
      );

      mockPermissionService.requirePermission.mockRejectedValue(
        permissionError,
      );

      const useCase = new CreateBusinessUseCase(
        mockBusinessRepository,
        mockPermissionService,
        mockLogger,
        mockI18n,
      );

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        "CREATE_BUSINESS",
        expect.any(Object),
      );
    });

    it("should log permission validation attempts", async () => {
      // � GREEN - Test de logging des permissions
      mockPermissionService.requirePermission.mockResolvedValue();
      mockBusinessRepository.existsByName.mockResolvedValue(false);
      mockBusinessRepository.save.mockResolvedValue();

      const useCase = new CreateBusinessUseCase(
        mockBusinessRepository,
        mockPermissionService,
        mockLogger,
        mockI18n,
      );

      await useCase.execute(validRequest);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("success"),
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
          permission: "CREATE_BUSINESS",
          operation: "CREATE_BUSINESS",
        }),
      );
    });
  });
});
