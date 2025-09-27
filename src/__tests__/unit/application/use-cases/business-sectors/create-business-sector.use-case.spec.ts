/**
 * 📝 Create Business Sector Use Case - Tests TDD
 *
 * Tests complets pour la création de secteurs d'activité
 * avec validation des permissions super-admin uniquement.
 */

import {
  BusinessSectorAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidBusinessSectorDataError,
} from "@application/exceptions/business-sector.exceptions";
import { IBusinessSectorRepository } from "@application/ports/business-sector.repository.interface";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import { CreateBusinessSectorUseCase } from "@application/use-cases/business-sectors/create-business-sector.use-case";
import { BusinessSector } from "@domain/entities/business-sector.entity";

describe("CreateBusinessSectorUseCase", () => {
  let useCase: CreateBusinessSectorUseCase;
  let mockRepository: jest.Mocked<IBusinessSectorRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockPermissionService: jest.Mocked<IPermissionService>;

  beforeEach(() => {
    // Création des mocks avec tous les méthodes nécessaires
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      isCodeUnique: jest.fn(),
      count: jest.fn(),
      searchByText: jest.fn(),
      findActiveOnly: jest.fn(),
      updateStatus: jest.fn(),
      findMostUsed: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn(),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      requirePermission: jest.fn(),
    };

    useCase = new CreateBusinessSectorUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  describe("🎯 Use Case Construction", () => {
    it("should create use case with all dependencies", () => {
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(CreateBusinessSectorUseCase);
    });
  });

  describe("✅ Successful Business Sector Creation", () => {
    const validRequest = {
      requestingUserId: "admin-123",
      name: "Technology Services",
      code: "TECH_SERVICES",
      description: "Information technology and digital services sector",
    };

    it("should create business sector successfully with valid data", async () => {
      // Arrange
      const expectedSector = BusinessSector.create(
        validRequest.name,
        validRequest.description || "",
        validRequest.code,
        validRequest.requestingUserId,
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(expectedSector);
      mockI18n.t.mockReturnValue("Business sector created successfully");

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.code).toBe(validRequest.code);
      expect(result.name).toBe(validRequest.name);
      expect(result.description).toBe(validRequest.description);
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);

      // Verify method calls
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        "MANAGE_BUSINESS_SECTORS",
      );
      expect(mockRepository.isCodeUnique).toHaveBeenCalledWith(
        validRequest.code,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          code: validRequest.code,
          name: validRequest.name,
          description: validRequest.description,
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Business sector created"),
        expect.objectContaining({
          sectorCode: validRequest.code,
          requestingUserId: validRequest.requestingUserId,
        }),
      );
    });

    it("should create business sector with minimal required data", async () => {
      // Arrange
      const minimalRequest = {
        requestingUserId: "admin-123",
        name: "Healthcare",
        code: "HEALTHCARE",
        description: "Healthcare services and medical facilities",
      };

      const expectedSector = BusinessSector.create(
        minimalRequest.name,
        minimalRequest.description,
        minimalRequest.code,
        minimalRequest.requestingUserId,
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(expectedSector);

      // Act
      const result = await useCase.execute(minimalRequest);

      // Assert
      expect(result.code).toBe(minimalRequest.code);
      expect(result.name).toBe(minimalRequest.name);
      expect(result.description).toBe(minimalRequest.description);
    });
  });

  describe("🚨 Permission Validation", () => {
    const validRequest = {
      requestingUserId: "regular-user-123",
      name: "Finance",
      code: "FINANCE",
      description: "Financial services sector",
    };

    it("should throw InsufficientPermissionsError when user lacks MANAGE_BUSINESS_SECTORS permission", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      mockI18n.t.mockReturnValue(
        "Insufficient permissions to manage business sectors",
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        "MANAGE_BUSINESS_SECTORS",
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should log permission denial attempt", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      mockI18n.t.mockReturnValue("Permission denied");

      // Act
      try {
        await useCase.execute(validRequest);
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Permission denied"),
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
          attemptedAction: "CREATE_BUSINESS_SECTOR",
        }),
      );
    });
  });

  describe("🔍 Code Uniqueness Validation", () => {
    const validRequest = {
      requestingUserId: "admin-123",
      name: "Education",
      code: "EDUCATION",
      description: "Educational services sector",
    };

    it("should throw BusinessSectorAlreadyExistsError when code already exists", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(false);
      mockI18n.t.mockReturnValue(
        "Business sector with this code already exists: EDUCATION",
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        BusinessSectorAlreadyExistsError,
      );

      expect(mockRepository.isCodeUnique).toHaveBeenCalledWith(
        validRequest.code,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should log code duplication attempt", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(false);
      mockI18n.t.mockReturnValue("Code already exists");

      // Act
      try {
        await useCase.execute(validRequest);
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Duplicate business sector code"),
        expect.objectContaining({
          code: validRequest.code,
          requestingUserId: validRequest.requestingUserId,
        }),
      );
    });
  });

  describe("❌ Input Validation", () => {
    const baseRequest = {
      requestingUserId: "admin-123",
    };

    it("should throw InvalidBusinessSectorDataError for missing name", async () => {
      // Arrange
      const invalidRequest = {
        ...baseRequest,
        code: "MISSING_NAME",
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t.mockReturnValue("Business sector name is required");

      // Act & Assert
      await expect(useCase.execute(invalidRequest as any)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it("should throw InvalidBusinessSectorDataError for missing code", async () => {
      // Arrange
      const invalidRequest = {
        ...baseRequest,
        name: "Missing Code Sector",
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t.mockReturnValue("Business sector code is required");

      // Act & Assert
      await expect(useCase.execute(invalidRequest as any)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it("should throw InvalidBusinessSectorDataError for empty name", async () => {
      // Arrange
      const invalidRequest = {
        ...baseRequest,
        name: "   ",
        code: "EMPTY_NAME",
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t.mockReturnValue("Business sector name cannot be empty");

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it("should throw InvalidBusinessSectorDataError for empty code", async () => {
      // Arrange
      const invalidRequest = {
        ...baseRequest,
        name: "Valid Name",
        code: "   ",
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t.mockReturnValue("Business sector code cannot be empty");

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it("should throw InvalidBusinessSectorDataError for invalid code format", async () => {
      // Arrange - Code trop long qui échouera même après normalisation (plus de 50 caractères)
      const invalidRequest = {
        ...baseRequest,
        name: "Valid Name",
        code: "THIS_IS_A_VERY_LONG_CODE_THAT_EXCEEDS_THE_MAXIMUM_ALLOWED_LENGTH",
        description: "Valid description for testing",
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t
        .mockReturnValueOnce("Business sector code format is invalid") // code-invalid-format
        .mockReturnValueOnce("Invalid business sector data"); // invalid-data

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });
  });

  describe("🔧 Error Handling", () => {
    const validRequest = {
      requestingUserId: "admin-123",
      name: "Manufacturing",
      code: "MANUFACTURING",
      description: "Manufacturing and production sector",
    };

    it("should handle repository save errors gracefully", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.save.mockRejectedValue(
        new Error("Database connection failed"),
      );
      mockI18n.t.mockReturnValue("Failed to create business sector");

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database connection failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to create business sector"),
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
          sectorCode: validRequest.code,
          sectorName: validRequest.name,
        }),
      );
    });

    it("should handle permission service errors gracefully", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockRejectedValue(
        new Error("Permission service unavailable"),
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Permission service unavailable",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error checking permissions"),
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
        }),
      );
    });
  });

  describe("🎯 Business Rules Validation", () => {
    it("should normalize business sector code to uppercase", async () => {
      // Arrange
      const requestWithLowercaseCode = {
        requestingUserId: "admin-123",
        name: "Retail",
        code: "retail_trade",
        description: "Retail and trade sector",
      };

      const expectedSector = BusinessSector.create(
        requestWithLowercaseCode.name,
        requestWithLowercaseCode.description || "",
        "RETAIL_TRADE",
        requestWithLowercaseCode.requestingUserId,
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(expectedSector);

      // Act
      const result = await useCase.execute(requestWithLowercaseCode);

      // Assert
      expect(result.code).toBe("RETAIL_TRADE");
      expect(mockRepository.isCodeUnique).toHaveBeenCalledWith("RETAIL_TRADE");
    });

    it("should trim whitespace from name and description", async () => {
      // Arrange
      const requestWithWhitespace = {
        requestingUserId: "admin-123",
        name: "  Transportation  ",
        code: "TRANSPORTATION",
        description: "  Transport and logistics services  ",
      };

      const expectedSector = BusinessSector.create(
        "Transportation",
        "Transport and logistics services",
        requestWithWhitespace.code,
        requestWithWhitespace.requestingUserId,
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.isCodeUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(expectedSector);

      // Act
      const result = await useCase.execute(requestWithWhitespace);

      // Assert
      expect(result.name).toBe("Transportation");
      expect(result.description).toBe("Transport and logistics services");
    });
  });
});
