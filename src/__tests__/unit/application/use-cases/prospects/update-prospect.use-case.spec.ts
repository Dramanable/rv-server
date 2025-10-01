/**
 * 🧪 UPDATE PROSPECT USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires avec validation et permissions
 * ✅ Tests de mise à jour et contrôle d'accès
 */

import {
  UpdateProspectUseCase,
  UpdateProspectRequest,
} from "@application/use-cases/prospects/update-prospect.use-case";
import { Prospect } from "@domain/entities/prospect.entity";
import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { ProspectStatus } from "@domain/value-objects/prospect-status.value-object";
import { BusinessSizeEnum } from "@domain/enums/business-size.enum";
import { IProspectRepository } from "@domain/repositories/prospect.repository";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import {
  ProspectNotFoundError,
  ProspectPermissionError,
  ProspectValidationError,
} from "@domain/exceptions/prospect.exceptions";

describe("UpdateProspectUseCase", () => {
  let useCase: UpdateProspectUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: UpdateProspectRequest = {
    prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    businessName: "Super Business Updated",
    contactEmail: "updated@techcorp.com",
    contactName: "Jean Dupont",
    contactPhone: "+33123456789",
    website: "https://techcorp-updated.com",
    source: "REFERRAL",
    status: "QUALIFIED",
    estimatedValue: 85000,
    staffCount: 20,
    notes: "Notes mises à jour après qualification",
    requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
    correlationId: "correlation-789",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    // 🎭 Création des mocks
    mockProspectRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IProspectRepository>;

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
      t: jest.fn().mockReturnValue("Mocked translation"),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new UpdateProspectUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  const createMockProspect = (overrides: any = {}): any => ({
    getId: () => ({ getValue: () => overrides.id || "prospect-123" }),
    getBusinessName: () => overrides.businessName || "TechCorp Solutions",
    getContactEmail: () => ({
      getValue: () => overrides.email || "contact@techcorp.com",
    }),
    getContactName: () => overrides.contactName || "Jean Dupont",
    getContactPhone: () =>
      overrides.phone ? { getValue: () => overrides.phone } : undefined,
    getSource: () => overrides.source || "WEBSITE",
    getStatus: () => ({
      getValue: () => overrides.status || "LEAD",
      getLabel: () => "Nouveau lead",
      getColor: () => "#10B981",
      getPriority: () => 1,
      canTransitionTo: jest
        .fn()
        .mockReturnValue(overrides.canTransition !== false),
    }),
    getAssignedSalesRep: () => ({
      getValue: () =>
        overrides.assignedSalesRep || "a1b2c3d4-e5f6-4789-abc1-234567890def",
    }),
    getStaffCount: () => overrides.staffCount || 15,
    getEstimatedValue: () => ({
      getAmount: () => overrides.estimatedValue || 50000,
      getCurrency: () => "EUR",
    }),
    getEstimatedMonthlyPrice: () => ({
      getAmount: () => overrides.monthlyPrice || 390,
      getCurrency: () => "EUR",
    }),
    getBusinessSize: () => overrides.businessSize || BusinessSizeEnum.MEDIUM,
    getNotes: () => overrides.notes || "",
    getCreatedAt: () => overrides.createdAt || new Date("2025-01-01T10:00:00Z"),
    getUpdatedAt: () => overrides.updatedAt || new Date("2025-01-01T10:00:00Z"),
    isHighValue: () => overrides.isHighValue || false,
    isHotProspect: () => overrides.isHotProspect || false,

    // 🔧 Méthodes de modification
    updateBasicInfo: jest.fn(),
    updateContactInfo: jest.fn(),
    updateStatus: jest.fn(),
    updateEstimatedValue: jest.fn(),
    updateStaffCount: jest.fn(),
    updateNotes: jest.fn(),
    addNote: jest.fn(),

    ...overrides,
  });

  describe("execute", () => {
    describe("✅ Success Cases", () => {
      it("should update prospect with valid data when user has permission", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // MANAGE_PROSPECTS
          .mockResolvedValueOnce(true); // Can manage this prospect

        const mockProspect = createMockProspect({
          id: "prospect-123",
          assignedSalesRep: "a1b2c3d4-e5f6-4789-abc1-234567890def",
        });

        const updatedMockProspect = createMockProspect({
          ...mockProspect,
          businessName: "TechCorp Solutions Updated",
          contactEmail: "updated@techcorp.com",
          status: "QUALIFIED",
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(updatedMockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.id).toBe("prospect-123");
        expect(result.businessName).toBe("TechCorp Solutions Updated");
        expect(result.contactEmail).toBe("updated@techcorp.com");

        expect(mockProspectRepository.findById).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        expect(mockProspectRepository.save).toHaveBeenCalledWith(mockProspect);

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Updating prospect",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect updated successfully",
          expect.objectContaining({
            prospectId: "prospect-123",
            updatedFields: expect.any(Array),
            correlationId: "correlation-789",
          }),
        );
      });

      it("should update only provided fields", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect();
        const partialUpdateRequest = {
          prospectId: "prospect-123",
          businessName: "New Business Name",
          status: "QUALIFIED",
          // Autres champs non fournis
          requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          correlationId: "correlation-789",
          timestamp: new Date(),
        };

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        await useCase.execute(partialUpdateRequest);

        // Then
        expect(mockProspect.updateBasicInfo).toHaveBeenCalledWith(
          expect.objectContaining({
            businessName: "New Business Name",
          }),
        );

        expect(mockProspect.updateStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
          "a1b2c3d4-e5f6-4789-abc1-234567890def",
        );

        // Vérifier que les méthodes non concernées ne sont pas appelées
        expect(mockProspect.updateContactInfo).not.toHaveBeenCalled();
      });

      it("should handle status transitions with validation", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "LEAD",
          canTransition: true,
        });

        const statusUpdateRequest = {
          prospectId: "prospect-123",
          status: "QUALIFIED",
          requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          correlationId: "correlation-789",
          timestamp: new Date(),
        };

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        await useCase.execute(statusUpdateRequest);

        // Then
        expect(mockProspect.getStatus().canTransitionTo).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        expect(mockProspect.updateStatus).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
          "a1b2c3d4-e5f6-4789-abc1-234567890def",
        );
      });
    });

    describe("❌ Error Cases", () => {
      it("should throw ProspectNotFoundError when prospect does not exist", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.findById.mockResolvedValue(null);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectNotFoundError,
        );

        expect(mockProspectRepository.save).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Prospect not found for update",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should throw ProspectValidationError for invalid status transition", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "LOST",
          canTransition: false,
        });

        const invalidTransitionRequest = {
          ...validRequest,
          status: "QUALIFIED", // Transition invalide depuis LOST
        };

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(invalidTransitionRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });

      it("should handle repository save errors gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect();

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        const repositoryError = new Error("Database connection failed");
        mockProspectRepository.save.mockRejectedValue(repositoryError);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          "Database connection failed",
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to update prospect",
          repositoryError,
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });
    });

    describe("🔐 Permission Tests", () => {
      it("should throw ProspectPermissionError when user lacks MANAGE_PROSPECTS permission", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockProspectRepository.findById).not.toHaveBeenCalled();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });

      it("should allow assigned sales rep to update their prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // MANAGE_PROSPECTS
          .mockResolvedValueOnce(false); // Cannot manage all prospects

        const mockProspect = createMockProspect({
          assignedSalesRep: "a1b2c3d4-e5f6-4789-abc1-234567890def", // Même utilisateur
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result).toBeDefined();
        expect(mockProspectRepository.save).toHaveBeenCalled();
      });

      it("should deny access when user is not assigned and cannot manage all prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // MANAGE_PROSPECTS
          .mockResolvedValueOnce(false); // Cannot manage all prospects

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Utilisateur différent
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockProspectRepository.save).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User cannot manage this prospect",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            assignedSalesRep: "other-sales-rep",
          }),
        );
      });

      it("should allow managers to update any prospect", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true); // All permissions

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Utilisateur différent
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result).toBeDefined();
        expect(mockProspectRepository.save).toHaveBeenCalled();
      });
    });

    describe("🧪 Data Validation Tests", () => {
      it("should validate email format when updating contact info", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const invalidEmailRequest = {
          ...validRequest,
          contactEmail: "invalid-email-format",
        };

        // When & Then
        await expect(useCase.execute(invalidEmailRequest)).rejects.toThrow(
          ProspectValidationError,
        );
      });

      it("should validate phone number format when updating contact info", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const invalidPhoneRequest = {
          ...validRequest,
          contactPhone: "123", // Format invalide
        };

        // When & Then
        await expect(useCase.execute(invalidPhoneRequest)).rejects.toThrow(
          ProspectValidationError,
        );
      });

      it("should validate estimated value range", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const invalidValueRequest = {
          ...validRequest,
          estimatedValue: -1000, // Valeur négative
        };

        // When & Then
        await expect(useCase.execute(invalidValueRequest)).rejects.toThrow(
          ProspectValidationError,
        );
      });

      it("should validate staff count range", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const invalidStaffRequest = {
          ...validRequest,
          staffCount: 0, // Staff count invalide
        };

        // When & Then
        await expect(useCase.execute(invalidStaffRequest)).rejects.toThrow(
          ProspectValidationError,
        );
      });
    });

    describe("🔍 Audit Logging Tests", () => {
      it("should log all update operations with audit trail", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect();

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockLogger.audit).toHaveBeenCalledWith(
          "Prospect updated",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            updatedFields: expect.any(Array),
            correlationId: "correlation-789",
          }),
        );
      });

      it("should track which fields were updated", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect();

        const specificUpdateRequest = {
          prospectId: "prospect-123",
          businessName: "New Name",
          status: "QUALIFIED",
          estimatedValue: 75000,
          requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          correlationId: "correlation-789",
          timestamp: new Date(),
        };

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        await useCase.execute(specificUpdateRequest);

        // Then
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect updated successfully",
          expect.objectContaining({
            updatedFields: expect.arrayContaining([
              "businessName",
              "status",
              "estimatedValue",
            ]),
          }),
        );
      });
    });
  });
});
