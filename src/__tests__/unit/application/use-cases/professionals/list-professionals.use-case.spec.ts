/**
 * @fileoverview ListProfessionalsUseCase - TDD Unit Tests
 * @module __tests__/unit/application/use-cases/professionals/list-professionals.use-case.spec
 * @description Tests unitaires       expect(mockLogger.info).toHaveBeenCalledWith('Successfully listed professionals', {
        businessId: mockBusinessId.getValue(),
        correlationId: 'correlation-123',
        count: 0,
      });EN-REFACTOR pour ListProfessionalsUseCase
 */

import { IAuditService } from "@application/ports/audit.port";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { ListProfessionalsRequest } from "@application/use-cases/professionals/list-professionals.types";
import { ListProfessionalsUseCase } from "@application/use-cases/professionals/list-professionals.use-case";
import { Professional } from "@domain/entities/professional.entity";
import { ProfessionalValidationError } from "@domain/exceptions/professional.exceptions";
import { IProfessionalRepository } from "@domain/repositories/professional.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { ProfessionalId } from "@domain/value-objects/professional-id.value-object";

describe("ListProfessionalsUseCase - TDD", () => {
  const mockBusinessId = BusinessId.generate();
  const mockRequestingUserId = "requesting-user-123";
  const mockCorrelationId = "correlation-123";

  function createMockProfessional(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
  ): Professional {
    const mockEmail = Email.create(email);
    const mockBusinessId = BusinessId.fromString(
      "09eb324d-0354-4cfb-b48e-ca7b409d2f81",
    );

    return {
      getId: () => ProfessionalId.fromString(id),
      getFirstName: () => firstName,
      getLastName: () => lastName,
      getEmail: () => mockEmail,
      getBusinessId: () => mockBusinessId,
      getIsActive: () => true,
      getSpecialization: () => "General",
      getPhone: () => undefined,
      getBio: () => "Test bio",
      getCreatedAt: () => new Date(),
      getUpdatedAt: () => new Date(),
      getCreatedBy: () => "admin",
      getUpdatedBy: () => "admin",
      toJSON: () => ({
        id: id,
        firstName,
        lastName,
        email: mockEmail.getValue(),
        businessId: mockBusinessId.getValue(),
        isActive: true,
        specialization: "General",
        phone: null,
        bio: "Test bio",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "admin",
        updatedBy: "admin",
      }),
    } as unknown as Professional;
  } // ✅ Mock Repository
  let mockProfessionalRepository: jest.Mocked<IProfessionalRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    mockProfessionalRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByLicenseNumber: jest.fn(),
      findAll: jest.fn(),
      findByBusinessId: jest.fn(),
      deleteById: jest.fn(),
      existsById: jest.fn(),
      existsByEmail: jest.fn(),
      existsByLicenseNumber: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn().mockImplementation((key: string) => {
        if (key === "professional.success.listed")
          return "Professionals listed successfully";
        if (key === "professional.validation.invalidId")
          return "Invalid professional ID format";
        if (key === "common.validation.requiredField")
          return "Required field missing";
        return key;
      }),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    mockAuditService = {
      logOperation: jest.fn(),
      findAuditEntries: jest.fn(),
      getEntityHistory: jest.fn(),
      getUserActions: jest.fn(),
      verifyIntegrity: jest.fn(),
      archiveOldEntries: jest.fn(),
      exportAuditData: jest.fn(),
    };
  });

  describe("� GREEN - Professional List Success", () => {
    let useCase: ListProfessionalsUseCase;

    beforeEach(() => {
      useCase = new ListProfessionalsUseCase(
        mockProfessionalRepository,
        mockLogger,
        mockI18n,
        mockAuditService,
      );
    });

    it("should list professionals with pagination successfully", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: {
          page: 1,
          limit: 10,
        },
        filters: {
          search: "John",
          isActive: true,
        },
        sorting: {
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      };

      const mockProfessionals = [
        createMockProfessional(
          "3e5d7c89-4c2a-4b1f-8e6a-9d8c7b5a4f2e",
          "John",
          "Doe",
          "john.doe@example.com",
        ),
      ];

      // ✅ Repository returns structured data
      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: mockProfessionals,
        total: mockProfessionals.length,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        data: mockProfessionals,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      expect(mockProfessionalRepository.findByBusinessId).toHaveBeenCalledWith(
        mockBusinessId.getValue(),
        {
          pagination: { page: 1, limit: 10 },
          sorting: { sortBy: "createdAt", sortOrder: "desc" },
          search: "John",
          filters: {
            isActive: true,
            specialization: undefined,
          },
        },
      );
    });

    it("should log list operation with context", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
      };

      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: [],
        total: 0,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith("Listing professionals", {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        pagination: { page: 1, limit: 10 },
        filters: undefined,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Successfully listed professionals",
        {
          businessId: mockBusinessId.getValue(),
          count: 0,
          correlationId: mockCorrelationId,
        },
      );
    });
  });

  describe("� GREEN - Input Validation", () => {
    let useCase: ListProfessionalsUseCase;

    beforeEach(() => {
      useCase = new ListProfessionalsUseCase(
        mockProfessionalRepository,
        mockLogger,
        mockI18n,
        mockAuditService,
      );
    });

    it("should throw error for invalid business ID format", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: "", // Invalid empty business ID
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });

    it("should validate required context fields", async () => {
      // Arrange
      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: [],
        total: 0,
      });

      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: "", // Invalid empty user ID
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });

    it("should validate pagination parameters", async () => {
      // Arrange
      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: [],
        total: 0,
      });

      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: {
          page: 0, // Invalid page number
          limit: 10,
        },
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });

    it("should validate limit parameters", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: {
          page: 1,
          limit: 150, // Invalid limit (too high)
        },
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });
  });

  describe("� GREEN - Repository Error Handling", () => {
    let useCase: ListProfessionalsUseCase;

    beforeEach(() => {
      useCase = new ListProfessionalsUseCase(
        mockProfessionalRepository,
        mockLogger,
        mockI18n,
        mockAuditService,
      );
    });

    it("should handle repository errors gracefully", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
      };

      const repositoryError = new Error("Database connection failed");
      mockProfessionalRepository.findByBusinessId.mockRejectedValue(
        repositoryError,
      );

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        "Database connection failed",
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to list professionals",
        repositoryError,
        expect.objectContaining({
          businessId: mockBusinessId.getValue(),
          correlationId: mockCorrelationId,
        }),
      );
    });
  });

  describe("� GREEN - Search and Filtering", () => {
    let useCase: ListProfessionalsUseCase;

    beforeEach(() => {
      useCase = new ListProfessionalsUseCase(
        mockProfessionalRepository,
        mockLogger,
        mockI18n,
        mockAuditService,
      );
    });

    it("should apply search filters correctly", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
        filters: {
          search: "John",
          isActive: true,
          specialization: "Dentist",
        },
      };

      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: [],
        total: 0,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockProfessionalRepository.findByBusinessId).toHaveBeenCalledWith(
        mockBusinessId.getValue(),
        {
          pagination: { page: 1, limit: 10 },
          sorting: { sortBy: "createdAt", sortOrder: "desc" },
          search: "John",
          filters: {
            isActive: true,
            specialization: "Dentist",
          },
        },
      );
    });

    it("should handle empty search results", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 1, limit: 10 },
        filters: {
          search: "NonExistentName",
        },
      };

      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: [],
        total: 0,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });
  });

  describe("� GREEN - Pagination Edge Cases", () => {
    let useCase: ListProfessionalsUseCase;

    beforeEach(() => {
      useCase = new ListProfessionalsUseCase(
        mockProfessionalRepository,
        mockLogger,
        mockI18n,
        mockAuditService,
      );
    });

    it("should handle large datasets with proper pagination", async () => {
      // Arrange
      const request: ListProfessionalsRequest = {
        businessId: mockBusinessId.getValue(),
        requestingUserId: mockRequestingUserId,
        correlationId: mockCorrelationId,
        timestamp: new Date(),
        pagination: { page: 2, limit: 5 },
      };

      const mockProfessionals = Array.from({ length: 5 }, (_, i) =>
        createMockProfessional(
          `3e5d7c89-4c2a-4b1f-8e6a-9d8c7b5a4f${i.toString().padStart(2, "0")}`,
          `User${i + 6}`,
          "Professional",
          `user${i + 6}@example.com`,
        ),
      );

      mockProfessionalRepository.findByBusinessId.mockResolvedValue({
        professionals: mockProfessionals,
        total: 5,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.meta).toEqual({
        currentPage: 2,
        totalPages: 1,
        totalItems: 5,
        itemsPerPage: 5,
        hasNextPage: false,
        hasPrevPage: true,
      });
    });
  });
});
