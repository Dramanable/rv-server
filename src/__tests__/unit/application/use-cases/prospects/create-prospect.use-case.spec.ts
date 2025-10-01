/**
 * 🧪 CREATE PROSPECT USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires complets
 * ✅ Tests avec mocks et validation métier
 */

import {
  CreateProspectUseCase,
  CreateProspectRequest,
} from '@application/use-cases/prospects/create-prospect.use-case';
import { IProspectRepository } from '@domain/repositories/prospect.repository';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IPermissionService } from '@application/ports/permission.port';
import { ProspectPermissionError } from '@domain/exceptions/prospect.exceptions';
import { Prospect } from '@domain/entities/prospect.entity';

const createMockProspect = (overrides: any = {}): any => ({
  getId: () => ({
    getValue: () => overrides.id || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  }),
  getBusinessName: () => overrides.businessName || 'TechCorp Solutions',
  getContactEmail: () => ({
    getValue: () => overrides.email || 'contact@techcorp.com',
  }),
  getContactName: () => overrides.contactName || 'Jean Dupont',
  getContactPhone: () =>
    overrides.phone ? { getValue: () => overrides.phone } : undefined,
  getSource: () => overrides.source || 'WEBSITE',
  getStatus: () => ({
    // 🎯 TOUTES LES MÉTHODES PROSPECT STATUS REQUISES
    getValue: () => overrides.status || 'LEAD',
    getLabel: () => overrides.statusLabel || 'Nouveau lead',
    getColor: () => overrides.statusColor || '#10B981',
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
    canTransitionTo: jest
      .fn()
      .mockReturnValue(overrides.canTransitionTo !== false),
    getValidTransitions: jest
      .fn()
      .mockReturnValue(overrides.validTransitions || []),
    isValidTransition: jest
      .fn()
      .mockReturnValue(overrides.isValidTransition !== false),
  }),
  getAssignedSalesRep: () => ({
    getValue: () =>
      overrides.assignedSalesRep || 'a1b2c3d4-e5f6-4789-abc1-234567890def',
  }),
  getStaffCount: () => overrides.staffCount || 15,
  getEstimatedValue: () => ({
    getAmount: () => overrides.estimatedValue || 50000,
    getCurrency: () => 'EUR',
  }),

  // 🆕 NOUVELLE MÉTHODE MANQUANTE - getAnnualRevenuePotential
  getAnnualRevenuePotential: () => ({
    getAmount: () => overrides.annualRevenuePotential || 120000,
    getCurrency: () => 'EUR',
  }),

  getBusinessSize: () => overrides.businessSize || 'MEDIUM',
  getNotes: () => overrides.notes || '',
  getCreatedAt: () => overrides.createdAt || new Date('2025-01-01T10:00:00Z'),
  getUpdatedAt: () => overrides.updatedAt || new Date('2025-01-01T10:00:00Z'),
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
    getCurrency: () => 'EUR',
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

describe('CreateProspectUseCase', () => {
  let useCase: CreateProspectUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Setup des mocks
    mockProspectRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByAssignedSalesRep: jest.fn(),
      findByStatus: jest.fn(),
      findHotProspects: jest.fn(),
      countByStatus: jest.fn(),
      countBySalesRep: jest.fn(),
      getTotalPipelineValue: jest.fn(),
      findByDateRange: jest.fn(),
      searchByText: jest.fn(),
      getPipelineMetrics: jest.fn(),
      getStatsByBusinessSize: jest.fn(),
      getConvertedProspects: jest.fn(),
      findStaleProspects: jest.fn(),
      existsByContactEmail: jest.fn(),
      existsByBusinessName: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
      canManageProspects: jest.fn(),
      canViewAllProspects: jest.fn(),
      getVisibleProspectFilters: jest.fn(),
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
      translate: jest.fn((key: string) => key),
      t: jest.fn((key: string) => key),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new CreateProspectUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe('execute', () => {
    const validRequest: CreateProspectRequest = {
      businessName: 'TechCorp Solutions',
      contactEmail: 'contact@techcorp.com',
      contactName: 'Jean Dupont',
      contactPhone: '+33123456789',
      notes: 'Prospect très intéressé',
      source: 'WEBSITE',
      assignedSalesRep: 'a1b2c3d4-e5f6-4789-abc1-234567890def',
      staffCount: 50,
      estimatedValue: 75000,
      requestingUserId: 'a1b2c3d4-e5f6-4789-abc1-234567890def',
      correlationId: 'correlation-123',
      timestamp: new Date('2025-01-01T10:00:00Z'),
    };

    describe('✅ Success Cases', () => {
      it('should create prospect successfully with valid data', async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockPermissionService.canManageProspects.mockResolvedValue(true);
        mockProspectRepository.existsByContactEmail.mockResolvedValue(false);
        mockProspectRepository.existsByBusinessName.mockResolvedValue(false);

        // Mock prospect avec méthodes de base
        const mockProspect = {
          getId: jest.fn().mockReturnValue({
            getValue: () => 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          }),
          getBusinessName: jest.fn().mockReturnValue('TechCorp Solutions'),
          getContactEmail: jest.fn().mockReturnValue({
            getValue: () => 'contact@techcorp.com',
          }),
          getContactPhone: jest.fn().mockReturnValue({
            getValue: () => '+33123456789',
          }),
          getContactName: jest.fn().mockReturnValue('Jean Dupont'),
          getStatus: jest.fn().mockReturnValue({
            getValue: () => 'ACTIVE',
          }),
          getAssignedSalesRep: jest.fn().mockReturnValue({
            getValue: () => 'a1b2c3d4-e5f6-4789-abc1-234567890def',
          }),
          getEstimatedValue: jest.fn().mockReturnValue({
            getAmount: () => 75000,
            getCurrency: () => 'EUR',
          }),
          getNotes: jest.fn().mockReturnValue(''),
          getSource: jest.fn().mockReturnValue('WEBSITE'),
          getBusinessSize: jest
            .fn()
            .mockReturnValue({ getValue: () => 'MEDIUM' }),
          getCurrentSolution: jest
            .fn()
            .mockReturnValue({ getValue: () => 'None' }),
          getStaffCount: jest.fn().mockReturnValue({ getValue: () => 50 }),
          getCreatedAt: jest
            .fn()
            .mockReturnValue(new Date('2025-01-01T10:00:00Z')),
          getUpdatedAt: jest
            .fn()
            .mockReturnValue(new Date('2025-01-01T10:00:00Z')),
          toJSON: jest.fn().mockReturnValue({
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            businessName: 'TechCorp Solutions',
            contactEmail: 'contact@techcorp.com',
          }),
        } as unknown as Prospect;

        mockProspectRepository.save.mockResolvedValue(mockProspect);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.businessName).toBe('TechCorp Solutions');
        expect(result.contactEmail).toBe('contact@techcorp.com');
        expect(mockProspectRepository.save).toHaveBeenCalledTimes(1);
        expect(mockLogger.info).toHaveBeenCalledWith(
          'Prospect created successfully',
          expect.objectContaining({
            businessName: 'TechCorp Solutions',
          }),
        );
      });
    });

    describe('🔐 Permission Tests', () => {
      it('should throw ProspectPermissionError when user lacks CREATE_PROSPECTS permission', async () => {
        // Given
        mockPermissionService.canManageProspects.mockResolvedValue(false);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          ProspectPermissionError,
        );
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('❌ Validation Tests', () => {
      it('should throw error for invalid email format', async () => {
        // Given
        mockPermissionService.canManageProspects.mockResolvedValue(true);
        const invalidRequest = {
          ...validRequest,
          contactEmail: 'invalid-email',
        };

        // When & Then
        await expect(useCase.execute(invalidRequest)).rejects.toThrow();
        expect(mockProspectRepository.save).not.toHaveBeenCalled();
      });
    });
  });
});
