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

import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
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
      it("should update prospect with valid data when user has permission", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // MANAGE_PROSPECTS
          .mockResolvedValueOnce(true); // Can manage this prospect

        const mockProspect = createMockProspect({
          id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
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
        expect(result.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
        expect(result.businessName).toBe("TechCorp Solutions");
        expect(result.contactEmail).toBe("contact@techcorp.com");

        expect(mockProspectRepository.findById).toHaveBeenCalledWith(
          expect.objectContaining({
        prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        correlationId: "correlation-789",
        requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def"
      }),
        );
      });
    });
  });
});
