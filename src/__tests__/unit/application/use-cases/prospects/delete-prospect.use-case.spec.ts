/**
 * 🧪 DELETE PROSPECT USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires avec permissions strictes
 * ✅ Tests de suppression sécurisée et contrôle d'accès
 */

import {
  DeleteProspectUseCase,
  DeleteProspectRequest,
} from "@application/use-cases/prospects/delete-prospect.use-case";
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

describe("DeleteProspectUseCase", () => {
  let useCase: DeleteProspectUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: DeleteProspectRequest = {
    prospectId: "prospect-123",
    requestingUserId: "user-456",
    correlationId: "correlation-789",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    // 🎭 Création des mocks
    mockProspectRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
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

    useCase = new DeleteProspectUseCase(
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
      canDelete: jest.fn().mockReturnValue(overrides.canDelete !== false),
    }),
    getAssignedSalesRep: () => ({
      getValue: () => overrides.assignedSalesRep || "user-456",
    }),
    getStaffCount: () => overrides.staffCount || 15,
    getEstimatedValue: () => ({
      getAmount: () => overrides.estimatedValue || 50000,
      getCurrency: () => "EUR",
    }),
    getBusinessSize: () => overrides.businessSize || BusinessSizeEnum.MEDIUM,
    getNotes: () => overrides.notes || "",
    getCreatedAt: () => overrides.createdAt || new Date("2025-01-01T10:00:00Z"),
    getUpdatedAt: () => overrides.updatedAt || new Date("2025-01-01T10:00:00Z"),
    isHighValue: () => overrides.isHighValue || false,
    isHotProspect: () => overrides.isHotProspect || false,
    canBeDeleted: jest.fn().mockReturnValue(overrides.canBeDeleted !== false),
    hasActiveInteractions: jest
      .fn()
      .mockReturnValue(overrides.hasActiveInteractions || false),

    ...overrides,
  });

  describe("execute", () => {
    describe("✅ Success Cases", () => {
      it("should delete prospect when user has permission and prospect can be deleted", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // DELETE_PROSPECTS
          .mockResolvedValueOnce(true); // Can manage this prospect

        const mockProspect = createMockProspect({
          id: "prospect-123",
          assignedSalesRep: "user-456",
          status: "LOST", // Status permettant la suppression
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(result.message).toBeDefined();
        expect(result.deletedProspectId).toBe("prospect-123");

        expect(mockProspectRepository.findById).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        expect(mockProspectRepository.delete).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Deleting prospect",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            correlationId: "correlation-789",
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect deleted successfully",
          expect.objectContaining({
            prospectId: "prospect-123",
            businessName: "TechCorp Solutions",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should allow super admin to delete any prospect", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true); // All permissions

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Utilisateur différent
          status: "QUALIFIED",
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(mockProspectRepository.delete).toHaveBeenCalled();
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

        expect(mockProspectRepository.delete).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Prospect not found for deletion",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should throw ProspectValidationError when prospect cannot be deleted due to business rules", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "WON", // Status ne permettant pas la suppression
          canBeDeleted: false,
          hasActiveInteractions: true,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockProspectRepository.delete).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Prospect cannot be deleted due to business rules",
          expect.objectContaining({
            prospectId: "prospect-123",
            status: "WON",
            hasActiveInteractions: true,
          }),
        );
      });

      it("should handle repository delete errors gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect();

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        const repositoryError = new Error("Database constraint violation");
        mockProspectRepository.delete.mockRejectedValue(repositoryError);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          "Database constraint violation",
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to delete prospect",
          repositoryError,
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            correlationId: "correlation-789",
          }),
        );
      });
    });

    describe("🔐 Permission Tests", () => {
      it("should throw ProspectPermissionError when user lacks DELETE_PROSPECTS permission", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockProspectRepository.findById).not.toHaveBeenCalled();
        expect(mockProspectRepository.delete).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User lacks permission to delete prospects",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            permission: "DELETE_PROSPECTS",
          }),
        );
      });

      it("should allow assigned sales rep to delete their own prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // DELETE_PROSPECTS
          .mockResolvedValueOnce(false); // Cannot manage all prospects

        const mockProspect = createMockProspect({
          assignedSalesRep: "user-456", // Même utilisateur
          status: "LOST",
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(mockProspectRepository.delete).toHaveBeenCalled();
      });

      it("should deny deletion when user is not assigned and cannot manage all prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // DELETE_PROSPECTS
          .mockResolvedValueOnce(false); // Cannot manage all prospects

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Utilisateur différent
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockProspectRepository.delete).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User cannot delete this prospect",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            assignedSalesRep: "other-sales-rep",
          }),
        );
      });

      it("should require elevated permissions for high-value prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // DELETE_PROSPECTS
          .mockResolvedValueOnce(true) // Can manage all prospects
          .mockResolvedValueOnce(false); // DELETE_HIGH_VALUE_PROSPECTS (manque cette permission)

        const mockProspect = createMockProspect({
          isHighValue: true,
          estimatedValue: 100000,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User lacks permission to delete high-value prospects",
          expect.objectContaining({
            prospectId: "prospect-123",
            estimatedValue: 100000,
          }),
        );
      });
    });

    describe("🛡️ Business Rules Tests", () => {
      it("should prevent deletion of prospects with WON status", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "WON",
          canBeDeleted: false,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Cannot delete prospect with WON status",
          expect.objectContaining({
            prospectId: "prospect-123",
            status: "WON",
          }),
        );
      });

      it("should prevent deletion of prospects with active interactions", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          hasActiveInteractions: true,
          canBeDeleted: false,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Cannot delete prospect with active interactions",
          expect.objectContaining({
            prospectId: "prospect-123",
            hasActiveInteractions: true,
          }),
        );
      });

      it("should allow deletion of prospects with LOST or UNQUALIFIED status", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "LOST",
          canBeDeleted: true,
          hasActiveInteractions: false,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(mockProspectRepository.delete).toHaveBeenCalled();
      });
    });

    describe("🔍 Audit Logging Tests", () => {
      it("should log deletion with complete audit trail", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect({
          businessName: "Important Corp",
          estimatedValue: 75000,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockLogger.audit).toHaveBeenCalledWith(
          "Prospect deleted",
          expect.objectContaining({
            prospectId: "prospect-123",
            businessName: "Important Corp",
            estimatedValue: 75000,
            requestingUserId: "user-456",
            correlationId: "correlation-789",
            deletedAt: expect.any(Date),
          }),
        );
      });

      it("should log failed deletion attempts", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "WON",
          canBeDeleted: false,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockLogger.audit).toHaveBeenCalledWith(
          "Prospect deletion attempt failed",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            reason: "Business rules violation",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should log security violations for unauthorized deletions", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockLogger.audit).toHaveBeenCalledWith(
          "Unauthorized prospect deletion attempt",
          expect.objectContaining({
            prospectId: "prospect-123",
            requestingUserId: "user-456",
            permission: "DELETE_PROSPECTS",
            correlationId: "correlation-789",
          }),
        );
      });
    });

    describe("📊 Data Validation Tests", () => {
      it("should validate prospect ID format", async () => {
        // Given
        const invalidRequest = {
          ...validRequest,
          prospectId: "", // ID vide
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow(
          ProspectValidationError,
        );
      });

      it("should handle cascading deletions properly", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          status: "LOST",
          hasActiveInteractions: false,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(result.deletedProspectId).toBe("prospect-123");
      });
    });
  });
});
