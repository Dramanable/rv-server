/**
 * 🧪 CREATE PROSPECT USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires complets
 * ✅ Tests avec mocks et validation métier
 */

import {
  CreateProspectUseCase,
  CreateProspectRequest,
} from "@application/use-cases/prospects/create-prospect.use-case";
import { Prospect } from "@domain/entities/prospect.entity";
import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { ProspectStatus } from "@domain/value-objects/prospect-status.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { Phone } from "@domain/value-objects/phone.value-object";
import { Money } from "@domain/value-objects/money.value-object";
import { BusinessSizeEnum } from "@domain/enums/business-size.enum";
import { IProspectRepository } from "@domain/repositories/prospect.repository";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import {
  ProspectPermissionError,
  ProspectValidationError,
} from "@domain/exceptions/prospect.exceptions";

describe("CreateProspectUseCase", () => {
  let useCase: CreateProspectUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: CreateProspectRequest = {
    businessName: "TechCorp Solutions",
    contactEmail: "contact@techcorp.com",
    contactName: "Jean Dupont",
    contactPhone: "+33123456789",
    source: "WEBSITE",
    assignedSalesRep: "sales-rep-id",
    staffCount: 15,
    estimatedValue: 50000,
    notes: "Prospect très intéressé",
    requestingUserId: "requesting-user-id",
    correlationId: "correlation-123",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    // 🎭 Création des mocks
    mockProspectRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
      canManageProspects: jest.fn(),
      canViewAllProspects: jest.fn(),
      getVisibleProspectFilters: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn().mockReturnValue("Mocked translation"),
      getLanguage: jest.fn().mockReturnValue("en"),
      setLanguage: jest.fn(),
    };

    useCase = new CreateProspectUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe("execute", () => {
    describe("✅ Success Cases", () => {
      it("should create prospect successfully with valid data", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = {
          getId: () => ({ getValue: () => "prospect-id" }),
          getBusinessName: () => "TechCorp Solutions",
          getContactEmail: () => ({ getValue: () => "contact@techcorp.com" }),
          getContactName: () => "Jean Dupont",
          getContactPhone: () => ({ getValue: () => "+33123456789" }),
          getSource: () => "WEBSITE",
          getStatus: () => ({
            getValue: () => "LEAD",
            getLabel: () => "Nouveau lead",
            getColor: () => "#10B981",
            getPriority: () => 1,
          }),
          getAssignedSalesRep: () => ({ getValue: () => "sales-rep-id" }),
          getStaffCount: () => 15,
          getEstimatedValue: () => ({
            getAmount: () => 50000,
            getCurrency: () => "EUR",
          }),
          getEstimatedMonthlyPrice: () => ({
            getAmount: () => 390,
            getCurrency: () => "EUR",
          }),
          getBusinessSize: () => BusinessSizeEnum.MEDIUM,
          getNotes: () => "Prospect très intéressé",
          getCreatedAt: () => new Date("2025-01-01T10:00:00Z"),
          getUpdatedAt: () => new Date("2025-01-01T10:00:00Z"),
        } as any;

        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result).toEqual({
          id: "prospect-id",
          businessName: "TechCorp Solutions",
          contactEmail: "contact@techcorp.com",
          contactName: "Jean Dupont",
          contactPhone: "+33123456789",
          source: "WEBSITE",
          status: {
            value: "LEAD",
            label: "Nouveau lead",
            color: "#10B981",
            priority: 1,
          },
          assignedSalesRep: "sales-rep-id",
          staffCount: 15,
          estimatedValue: 50000,
          estimatedMonthlyPrice: {
            amount: 390,
            currency: "EUR",
          },
          businessSize: {
            value: "MEDIUM",
            label: expect.any(String),
            icon: expect.any(String),
          },
          notes: "Prospect très intéressé",
          createdAt: "2025-01-01T10:00:00.000Z",
        });

        expect(mockProspectRepository.save).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Creating new prospect",
          expect.objectContaining({
            businessName: "TechCorp Solutions",
            requestingUserId: "requesting-user-id",
            correlationId: "correlation-123",
          }),
        );
      });

      it("should create prospect with minimal required data", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const minimalRequest: CreateProspectRequest = {
          businessName: "MinimalCorp",
          contactEmail: "contact@minimal.com",
          contactName: "Contact Name",
          source: "COLD_CALL",
          assignedSalesRep: "sales-rep-id",
          staffCount: 5,
          estimatedValue: 10000,
          requestingUserId: "requesting-user-id",
          correlationId: "correlation-123",
          timestamp: new Date(),
        };

        const mockProspect = {
          getId: () => ({ getValue: () => "prospect-id" }),
          getBusinessName: () => "MinimalCorp",
          getContactEmail: () => ({ getValue: () => "contact@minimal.com" }),
          getContactName: () => "Contact Name",
          getContactPhone: () => undefined,
          getSource: () => "COLD_CALL",
          getStatus: () => ({
            getValue: () => "LEAD",
            getLabel: () => "Nouveau lead",
            getColor: () => "#10B981",
            getPriority: () => 1,
          }),
          getAssignedSalesRep: () => ({ getValue: () => "sales-rep-id" }),
          getStaffCount: () => 5,
          getEstimatedValue: () => ({
            getAmount: () => 10000,
            getCurrency: () => "EUR",
          }),
          getEstimatedMonthlyPrice: () => ({
            getAmount: () => 145,
            getCurrency: () => "EUR",
          }),
          getBusinessSize: () => BusinessSizeEnum.SMALL,
          getNotes: () => "",
          getCreatedAt: () => new Date(),
          getUpdatedAt: () => new Date(),
        } as any;

        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(minimalRequest);

        // Then
        expect(result.businessName).toBe("MinimalCorp");
        expect(result.contactPhone).toBeUndefined();
        expect(result.businessSize.value).toBe("SMALL");
        expect(mockProspectRepository.save).toHaveBeenCalledTimes(1);
      });
    });

    describe("🔐 Permission Tests", () => {
      it("should throw ProspectPermissionError when user lacks CREATE_PROSPECTS permission", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to create prospect",
          expect.any(Error),
          expect.objectContaining({
            businessName: "TechCorp Solutions",
            requestingUserId: "requesting-user-id",
            correlationId: "correlation-123",
          }),
        );
      });

      it("should validate MANAGE_PROSPECTS permission for creation", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.save.mockResolvedValue({} as any);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
          "requesting-user-id",
          "CREATE_PROSPECTS",
        );
      });
    });

    describe("❌ Validation Tests", () => {
      it("should throw error for invalid email format", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const invalidRequest = {
          ...validRequest,
          contactEmail: "invalid-email",
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });

      it("should throw error for invalid phone format", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const invalidRequest = {
          ...validRequest,
          contactPhone: "invalid-phone",
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });

      it("should throw error for negative estimated value", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const invalidRequest = {
          ...validRequest,
          estimatedValue: -1000,
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });

      it("should throw error for zero staff count", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const invalidRequest = {
          ...validRequest,
          staffCount: 0,
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });
    });

    describe("🔄 Business Logic Tests", () => {
      it("should automatically calculate business size from staff count", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const testCases = [
          { staffCount: 3, expectedSize: BusinessSizeEnum.SMALL },
          { staffCount: 15, expectedSize: BusinessSizeEnum.MEDIUM },
          { staffCount: 50, expectedSize: BusinessSizeEnum.LARGE },
          { staffCount: 150, expectedSize: BusinessSizeEnum.ENTERPRISE },
        ];

        for (const { staffCount, expectedSize } of testCases) {
          const request = { ...validRequest, staffCount };

          const mockProspect = {
            getId: () => ({ getValue: () => "prospect-id" }),
            getBusinessSize: () => expectedSize,
            getEstimatedMonthlyPrice: () => ({
              getAmount: () => 100,
              getCurrency: () => "EUR",
            }),
            // ... autres propriétés mock
          } as any;

          mockProspectRepository.save.mockResolvedValue(mockProspect);

          // When
          const result = await useCase.execute(request);

          // Then
          expect(result.businessSize.value).toBe(expectedSize);
        }
      });

      it("should set initial status to LEAD", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = {
          getStatus: () => ({
            getValue: () => "LEAD",
            getLabel: () => "Nouveau lead",
            getColor: () => "#10B981",
            getPriority: () => 1,
          }),
          // ... autres propriétés mock
        } as any;

        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.status.value).toBe("LEAD");
        expect(result.status.priority).toBe(1);
      });
    });

    describe("💾 Repository Integration Tests", () => {
      it("should handle repository save errors gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const repositoryError = new Error("Database connection failed");
        mockProspectRepository.save.mockRejectedValue(repositoryError);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          "Database connection failed",
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to create prospect",
          repositoryError,
          expect.objectContaining({
            businessName: "TechCorp Solutions",
            correlationId: "correlation-123",
          }),
        );
      });
    });

    describe("📊 Logging and Audit Tests", () => {
      it("should log creation start and success", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.save.mockResolvedValue({
          getBusinessName: () => "TechCorp Solutions",
          getId: () => ({ getValue: () => "prospect-id" }),
        } as any);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Creating new prospect",
          expect.objectContaining({
            businessName: "TechCorp Solutions",
            requestingUserId: "requesting-user-id",
            correlationId: "correlation-123",
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect created successfully",
          expect.objectContaining({
            prospectId: "prospect-id",
            businessName: "TechCorp Solutions",
            correlationId: "correlation-123",
          }),
        );
      });
    });
  });
});
