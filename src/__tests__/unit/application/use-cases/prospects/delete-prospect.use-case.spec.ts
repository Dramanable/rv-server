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

import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
describe("DeleteProspectUseCase", () => {
  let useCase: DeleteProspectUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: DeleteProspectRequest = {
    prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
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
  getId: () => ({ getValue: () => overrides.id || "f47ac10b-58cc-4372-a567-0e02b2c3d479" }),
  getBusinessName: () => overrides.businessName || "TechCorp Solutions",
  getContactEmail: () => ({
    getValue: () => overrides.email || "contact@techcorp.com",
  }),
  getContactName: () => overrides.contactName || "Jean Dupont",
  getContactPhone: () =>
    overrides.phone ? { getValue: () => overrides.phone } : undefined,
  getSource: () => overrides.source || "WEBSITE",
  getStatus: () => ({
    // 🎯 TOUTES LES MÉTHODES PROSPECT STATUS REQUISES
    getValue: () => overrides.status || "LEAD",
    getLabel: () => overrides.statusLabel || "Nouveau lead", 
    getColor: () => overrides.statusColor || "#10B981",
    getPriority: () => overrides.statusPriority || 1,
    
    // ✅ Méthodes de validation de statut (CRITIQUES)
    isActive: jest.fn().mockReturnValue(overrides.isActive !== false),
    isClosed: jest.fn().mockReturnValue(overrides.isClosed || false),
    isClosedWon: jest.fn().mockReturnValue(overrides.isClosedWon || false),
    isClosedLost: jest.fn().mockReturnValue(overrides.isClosedLost || false),
    isInProgress: jest.fn().mockReturnValue(overrides.isInProgress || false),
    isQualified: jest.fn().mockReturnValue(overrides.isQualified || false),
    isLead: jest.fn().mockReturnValue(overrides.isLead !== false),
    isProposal: jest.fn().mockReturnValue(overrides.isProposal || false),
    isNegotiation: jest.fn().mockReturnValue(overrides.isNegotiation || false),
    
    // 🔒 Méthodes de règles métier
    canDelete: jest.fn().mockReturnValue(overrides.canDelete !== false),
    canEdit: jest.fn().mockReturnValue(overrides.canEdit !== false),
    canConvert: jest.fn().mockReturnValue(overrides.canConvert !== false),
    
    // 📊 Méthodes de transition et validation
    canTransitionTo: jest.fn().mockReturnValue(overrides.canTransitionTo !== false),
    getValidTransitions: jest.fn().mockReturnValue(overrides.validTransitions || []),
    isValidTransition: jest.fn().mockReturnValue(overrides.isValidTransition !== false)
  }),
  getAssignedSalesRep: () => ({
    getValue: () => overrides.assignedSalesRep || "a1b2c3d4-e5f6-4789-abc1-234567890def",
  }),
  getStaffCount: () => overrides.staffCount || 15,
  getEstimatedValue: () => ({
    getAmount: () => overrides.estimatedValue || 50000,
    getCurrency: () => "EUR",
  }),
  
  // 🆕 NOUVELLE MÉTHODE MANQUANTE - getAnnualRevenuePotential
  getAnnualRevenuePotential: () => ({
    getAmount: () => overrides.annualRevenuePotential || 120000,
    getCurrency: () => "EUR",
  }),
  
  getBusinessSize: () => overrides.businessSize || "MEDIUM",
  getNotes: () => overrides.notes || "",
  getCreatedAt: () => overrides.createdAt || new Date("2025-01-01T10:00:00Z"),
  getUpdatedAt: () => overrides.updatedAt || new Date("2025-01-01T10:00:00Z"),
  isHighValue: () => overrides.isHighValue || false,
  isHotProspect: () => overrides.isHotProspect || false,
  canBeDeleted: jest.fn().mockReturnValue(overrides.canBeDeleted !== false),
  hasActiveInteractions: jest
    .fn()
    .mockReturnValue(overrides.hasActiveInteractions || false),

  // 🆕 MÉTHODES MANQUANTES POUR UPDATE
  updateBasicInfo: jest.fn().mockImplementation((data) => {
    // Simule la mise à jour en retournant un nouveau mock avec les données mises à jour
    return createMockProspect({ ...overrides, ...data });
  }),
  updateContactInfo: jest.fn().mockImplementation((data) => {
    return createMockProspect({ ...overrides, ...data });
  }),
  updateBusinessInfo: jest.fn().mockImplementation((data) => {
    return createMockProspect({ ...overrides, ...data });
  }),
  updateStatus: jest.fn().mockImplementation((newStatus) => {
    return createMockProspect({ ...overrides, status: newStatus });
  }),

  
  // 🆕 MÉTHODES CRITIQUES MANQUANTES
  getEstimatedMonthlyPrice: () => ({
    getAmount: () => overrides.estimatedMonthlyPrice || 2500,
    getCurrency: () => "EUR",
  }),
  
  // Méthodes d'update manquantes
  updateEstimatedValue: jest.fn().mockImplementation((value) => {
    overrides.estimatedValue = value;
    return createMockProspect({ ...overrides, estimatedValue: value });
  }),
  updateStaffCount: jest.fn().mockImplementation((count) => {
    overrides.staffCount = count;
    return createMockProspect({ ...overrides, staffCount: count });
  }),
  
  // 🆕 MÉTHODE ADDNOTE MANQUANTE (CRITIQUE)
  addNote: jest.fn().mockImplementation((note) => {
    overrides.notes = note;
    return createMockProspect({ ...overrides, notes: note });
  }),

  updateNotes: jest.fn().mockImplementation((notes) => {
    overrides.notes = notes;
    return createMockProspect({ ...overrides, notes: notes });
  }),


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
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          assignedSalesRep: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          status: "LOST", // Status permettant la suppression
        });

        mockProspectRepository.findById.mockResolvedValue(mockProspect);
        mockProspectRepository.delete.mockResolvedValue(undefined);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.success).toBe(true);
        expect(result.message).toBeDefined();
        expect(result.deletedProspectId).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");

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
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-789",
          }),
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect deleted successfully",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            businessName: "TechCorp Solutions",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should allow super admin to delete any prospect", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true); // All permissions

        const mockProspect = createMockProspect({
          assignedSalesRep: "b2c3d4e5-f6a7-4890-bcd1-23456789abcd", // Utilisateur différent
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
        mockProspectRepository.findById.mockResolvedValue({
        ...{
        ...createMockProspect(),
        canDelete: jest.fn().mockReturnValue(false),
        hasActiveInteractions: jest.fn().mockReturnValue(true)
      });

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectValidationError,
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to delete prospect",
          expect.any(Error),
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
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
        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect deleted successfully",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            businessName: "Important Corp",
            estimatedValue: 75000,
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
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

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Prospect deletion attempt failed",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            reason: "Business rules violation",
            correlationId: "correlation-789",
          }),
        );
      });

      it("should log security violations for unauthorized deletions", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );

        expect(mockLogger.info).toHaveBeenCalledWith(
          "Unauthorized prospect deletion attempt",
          expect.objectContaining({
            prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
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
        expect(result.deletedProspectId).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
      });
    });
  });
});
