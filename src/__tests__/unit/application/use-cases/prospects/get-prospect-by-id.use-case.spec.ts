/**
 * 🧪 GET PROSPECT BY ID USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires avec permissions
 * ✅ Tests de récupération et contrôle d'accès
 */

import {
  GetProspectByIdUseCase,
  GetProspectByIdRequest,
} from "@application/use-cases/prospects/get-prospect-by-id.use-case";
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
} from "@domain/exceptions/prospect.exceptions";

describe("GetProspectByIdUseCase", () => {
  let useCase: GetProspectByIdUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: GetProspectByIdRequest = {
    prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
    correlationId: "correlation-789",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    // 🎭 Création des mocks
    mockProspectRepository = {
      findById: jest.fn(),
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

    useCase = new GetProspectByIdUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  const createMockProspect = (overrides: any = {}): any => ({
    getId: () => ({
      getValue: () => overrides.id || "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    }),
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
      canTransitionTo: () => true,
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
    getNotes: () => overrides.notes || "Notes initiales",
    getCreatedAt: () => overrides.createdAt || new Date("2025-01-01T10:00:00Z"),
    getUpdatedAt: () => overrides.updatedAt || new Date("2025-01-01T10:00:00Z"),
    isHighValue: () => overrides.isHighValue || false,
    isHotProspect: () => overrides.isHotProspect || false,
    getNextActions: () => overrides.nextActions || [],
    getInteractionHistory: () => overrides.interactionHistory || [],
    ...overrides,
  });

  describe("execute", () => {
    describe("✅ Success Cases", () => {
      it("should return prospect details when user has permission and prospect exists", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          businessName: "TechCorp Solutions",
          assignedSalesRep: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          estimatedValue: 75000,
          isHighValue: true,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
        expect(result.businessName).toBe("TechCorp Solutions");
        expect(result.contactEmail).toBe("contact@techcorp.com");
        expect(result.estimatedMonthlyPrice.amount).toBe(390);
        expect(result.estimatedMonthlyPrice.currency).toBe("EUR");

        expect(mockProspectRepository.findById).toHaveBeenCalledWith(
          expect.objectContaining({
            getValue: expect.any(Function),
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Getting prospect by ID",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should include detailed information in response", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspect = createMockProspect({
          businessName: "Enterprise Corp",
          contactName: "Marie Martin",
          staffCount: 250,
          businessSize: BusinessSizeEnum.LARGE,
          notes: "Prospect très intéressé par nos solutions",
          isHotProspect: true,
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.businessName).toBe("Enterprise Corp");
        expect(result.contactName).toBe("Marie Martin");
        expect(result.staffCount).toBe(250);
        expect(result.businessSize.value).toBe(BusinessSizeEnum.LARGE);
        expect(result.notes).toBe("Prospect très intéressé par nos solutions");

        // Vérifier la structure des objets complexes
        expect(result.status).toEqual(
          expect.objectContaining({
            value: expect.any(String),
            label: expect.any(String),
            color: expect.any(String),
            priority: expect.any(Number),
          }),
        );

        expect(result.estimatedMonthlyPrice).toEqual(
          expect.objectContaining({
            amount: expect.any(Number),
            currency: "EUR",
          }),
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

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Prospect not found",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should handle repository errors gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const repositoryError = new Error("Database connection failed");
        mockProspectRepository.findById.mockRejectedValue(repositoryError);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          "Database connection failed",
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to get prospect by ID",
          repositoryError,
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });
    });

    describe("🔐 Permission Tests", () => {
      it("should throw ProspectPermissionError when user lacks VIEW_PROSPECTS permission", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockProspectRepository.findById).not.toHaveBeenCalled();

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User lacks permission to view prospect",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            permission: "VIEW_PROSPECTS",
          }),
        );
      });

      it("should allow access when user can view all prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // VIEW_PROSPECTS
          .mockResolvedValueOnce(true); // VIEW_ALL_PROSPECTS

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Différent de l'utilisateur
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result).toBeDefined();
        expect(result.assignedSalesRep).toBe("other-sales-rep");
      });

      it("should deny access when user cannot view all prospects and is not assigned", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // VIEW_PROSPECTS
          .mockResolvedValueOnce(false); // VIEW_ALL_PROSPECTS

        const mockProspect = createMockProspect({
          assignedSalesRep: "other-sales-rep", // Différent de l'utilisateur
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User cannot access this prospect",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            assignedSalesRep: "other-sales-rep",
          }),
        );
      });

      it("should allow access when user is assigned to the prospect", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // VIEW_PROSPECTS
          .mockResolvedValueOnce(false); // VIEW_ALL_PROSPECTS

        const mockProspect = createMockProspect({
          assignedSalesRep: "a1b2c3d4-e5f6-4789-abc1-234567890def", // Même utilisateur
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result).toBeDefined();
        expect(result.assignedSalesRep).toBe(
          "a1b2c3d4-e5f6-4789-abc1-234567890def",
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
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
      });

      it("should handle prospects with minimal data", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const minimalProspect = createMockProspect({
          contactPhone: undefined,
          notes: "",
          nextActions: [],
          interactionHistory: [],
        });

        mockProspectRepository.findById.mockResolvedValue(minimalProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.contactPhone).toBeUndefined();
        expect(result.notes).toBe("");
      });

      it("should handle prospects with all fields present", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const fullProspect = createMockProspect({
          contactPhone: "+33123456789",
          notes: "Prospect à fort potentiel avec budget confirmé",
          businessSize: BusinessSizeEnum.LARGE,
          estimatedValue: 120000,
        });

        mockProspectRepository.findById.mockResolvedValue(fullProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.contactPhone).toBe("+33123456789");
        expect(result.notes).toBe(
          "Prospect à fort potentiel avec budget confirmé",
        );
        expect(result.businessSize.value).toBe(BusinessSizeEnum.LARGE);
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      });
    });

    describe("🔍 Logging Tests", () => {
      it("should log successful prospect retrieval", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const mockProspect = createMockProspect();
        mockProspectRepository.findById.mockResolvedValue(mockProspect);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Getting prospect by ID",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect retrieved successfully",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            businessName: "TechCorp Solutions",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should log permission checks", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "User lacks permission to view prospect",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            permission: "VIEW_PROSPECTS",
          }),
        );
      });
    });
  });
});
