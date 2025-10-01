/**
 * 🧪 LIST PROSPECTS USE CASE TESTS - Application Layer
 * ✅ TDD Clean Architecture - Tests unitaires avec pagination et filtres
 * ✅ Tests de permissions et scoping
 */

import {
  ListProspectsUseCase,
  ListProspectsRequest,
} from "@application/use-cases/prospects/list-prospects.use-case";
import { Prospect } from "@domain/entities/prospect.entity";
import {
  ProspectStatus,
  ProspectStatusEnum,
} from "@domain/value-objects/prospect-status.value-object";
import {
  BusinessSizeEnum,
  BusinessSize,
} from "@domain/enums/business-size.enum";
import {
  IProspectRepository,
  ProspectSearchResult,
} from "@domain/repositories/prospect.repository";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import { ProspectPermissionError } from "@domain/exceptions/prospect.exceptions";

describe("ListProspectsUseCase", () => {
  let useCase: ListProspectsUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: ListProspectsRequest = {
    search: "TechCorp",
    status: "LEAD",
    businessSize: BusinessSizeEnum.MEDIUM,
    source: "WEBSITE",
    sortBy: "businessName",
    sortOrder: "asc",
    page: 1,
    limit: 10,
    requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
    correlationId: "correlation-456",
    timestamp: new Date("2025-01-01T10:00:00Z"),
  };

  beforeEach(() => {
    // 🎭 Création des mocks
    mockProspectRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
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
      t: jest.fn().mockReturnValue("Mocked translation"),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new ListProspectsUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  const createMockProspect = (overrides: any = {}): any => ({
    getId: () => ({ getValue: () => overrides.id || "prospect-1" }),
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
    ...overrides,
  });

  describe("execute", () => {
    describe("✅ Success Cases", () => {
      it("should list prospects with pagination and filters", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // VIEW_PROSPECTS
          .mockResolvedValueOnce(true); // VIEW_ALL_PROSPECTS

        const mockProspects = [
          createMockProspect({ id: "prospect-1", businessName: "TechCorp A" }),
          createMockProspect({ id: "prospect-2", businessName: "TechCorp B" }),
        ];

        const mockSearchResult: ProspectSearchResult = {
          prospects: mockProspects,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        mockProspectRepository.findAll.mockResolvedValue(mockSearchResult);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.data).toHaveLength(2);
        expect(result.data[0].businessName).toBe("TechCorp A");
        expect(result.data[1].businessName).toBe("TechCorp B");

        expect(result.meta).toEqual({
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        });

        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "TechCorp",
            businessSize: BusinessSizeEnum.MEDIUM,
            source: "WEBSITE",
          }),
          expect.objectContaining({
            field: "businessName",
            direction: "ASC",
          }),
          expect.objectContaining({
            page: 1,
            limit: 10,
          }),
        );
      });

      it("should return default pagination when no pagination params provided", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const requestWithoutPagination = {
          ...validRequest,
          page: undefined,
          limit: undefined,
          sortBy: undefined,
          sortOrder: undefined,
        };

        const mockSearchResult: ProspectSearchResult = {
          prospects: [createMockProspect()],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        mockProspectRepository.findAll.mockResolvedValue(mockSearchResult);

        // When
        const result = await useCase.execute(requestWithoutPagination);

        // Then
        expect(result.meta.currentPage).toBe(1);
        expect(result.meta.itemsPerPage).toBe(10);

        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            field: "updatedAt",
            direction: "DESC",
          }),
          expect.objectContaining({
            page: 1,
            limit: 10,
          }),
        );
      });

      it("should include summary statistics", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const mockProspects = [
          createMockProspect({
            status: "LEAD",
            businessSize: BusinessSizeEnum.SMALL,
            estimatedValue: 10000,
            isHighValue: false,
          }),
          createMockProspect({
            status: "QUALIFIED",
            businessSize: BusinessSizeEnum.LARGE,
            estimatedValue: 100000,
            isHighValue: true,
          }),
        ];

        const mockSearchResult: ProspectSearchResult = {
          prospects: mockProspects,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        mockProspectRepository.findAll.mockResolvedValue(mockSearchResult);

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.summary).toBeDefined();
        expect(result.summary.totalValue).toBe(110000);
        expect(result.summary.averageValue).toBe(55000);
        expect(result.summary.hotProspectsCount).toBe(1);
        expect(result.summary.conversionRate).toBeGreaterThanOrEqual(0);
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
        expect(mockProspectRepository.findAll).not.toHaveBeenCalled();
      });

      it("should filter prospects by assigned sales rep when user cannot view all prospects", async () => {
        // Given
        mockPermissionService.hasPermission
          .mockResolvedValueOnce(true) // VIEW_PROSPECTS
          .mockResolvedValueOnce(false); // VIEW_ALL_PROSPECTS

        const mockSearchResult: ProspectSearchResult = {
          prospects: [createMockProspect()],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        mockProspectRepository.findAll.mockResolvedValue(mockSearchResult);

        // When
        await useCase.execute(validRequest);

        // Then
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            assignedSalesRep: expect.objectContaining({
              getValue: expect.any(Function),
            }),
          }),
          expect.any(Object),
          expect.any(Object),
        );
      });

      it("should allow filtering by specific sales rep when user can view all prospects", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const requestWithSalesRepFilter = {
          ...validRequest,
          assignedSalesRep: "other-sales-rep-id",
        };

        const mockSearchResult: ProspectSearchResult = {
          prospects: [
            createMockProspect({ assignedSalesRep: "other-sales-rep-id" }),
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        };

        mockProspectRepository.findAll.mockResolvedValue(mockSearchResult);

        // When
        await useCase.execute(requestWithSalesRepFilter);

        // Then
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            assignedSalesRep: expect.objectContaining({
              getValue: expect.any(Function),
            }),
          }),
          expect.any(Object),
          expect.any(Object),
        );
      });
    });

    describe("🔍 Filter Tests", () => {
      it("should apply all filters correctly", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const fullFilterRequest = {
          ...validRequest,
          search: "TechCorp",
          status: "QUALIFIED",
          businessSize: BusinessSizeEnum.LARGE,
          source: "REFERRAL",
          isHotProspect: true,
          createdAfter: "2025-01-01",
          createdBefore: "2025-12-31",
        };

        mockProspectRepository.findAll.mockResolvedValue({
          prospects: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });

        // When
        await useCase.execute(fullFilterRequest);

        // Then
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "TechCorp",
            businessSize: BusinessSizeEnum.LARGE,
            source: "REFERRAL",
            isHotProspect: true,
            createdAfter: expect.any(Date),
            createdBefore: expect.any(Date),
            status: expect.objectContaining({
              getValue: expect.any(Function),
            }),
          }),
          expect.any(Object),
          expect.any(Object),
        );
      });

      it("should handle empty filters gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);

        const emptyFilterRequest = {
          requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
          correlationId: "correlation-456",
          timestamp: new Date(),
        };

        mockProspectRepository.findAll.mockResolvedValue({
          prospects: [createMockProspect()],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        });

        // When
        const result = await useCase.execute(emptyFilterRequest);

        // Then
        expect(result.data).toHaveLength(1);
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            search: undefined,
            businessSize: undefined,
            source: undefined,
          }),
          expect.any(Object),
          expect.any(Object),
        );
      });
    });

    describe("📊 Sorting Tests", () => {
      it("should sort by business name ascending", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.findAll.mockResolvedValue({
          prospects: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });

        const sortRequest = {
          ...validRequest,
          sortBy: "businessName" as const,
          sortOrder: "asc" as const,
        };

        // When
        await useCase.execute(sortRequest);

        // Then
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            field: "businessName",
            direction: "ASC",
          }),
          expect.any(Object),
        );
      });

      it("should sort by updated date descending by default", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.findAll.mockResolvedValue({
          prospects: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });

        const defaultSortRequest = {
          ...validRequest,
          sortBy: undefined,
          sortOrder: undefined,
        };

        // When
        await useCase.execute(defaultSortRequest);

        // Then
        expect(mockProspectRepository.findAll).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            field: "updatedAt",
            direction: "DESC",
          }),
          expect.any(Object),
        );
      });
    });

    describe("💾 Repository Integration Tests", () => {
      it("should handle repository errors gracefully", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        const repositoryError = new Error("Database connection failed");
        mockProspectRepository.findAll.mockRejectedValue(repositoryError);

        // When & Then
        await expect(useCase.execute(validRequest)).rejects.toThrow(
          "Database connection failed",
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "Failed to list prospects",
          repositoryError,
          expect.objectContaining({
            requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
            correlationId: "correlation-456",
          }),
        );
      });
    });

    describe("📊 Metadata Tests", () => {
      it("should include filter metadata in response", async () => {
        // Given
        mockPermissionService.hasPermission.mockResolvedValue(true);
        mockProspectRepository.findAll.mockResolvedValue({
          prospects: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });

        // When
        const result = await useCase.execute(validRequest);

        // Then
        expect(result.filters).toBeDefined();
        expect(result.filters.available.statuses).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(String),
              label: expect.any(String),
              color: expect.any(String),
            }),
          ]),
        );

        expect(result.filters.available.businessSizes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(String),
              label: expect.any(String),
              icon: expect.any(String),
            }),
          ]),
        );

        expect(Array.isArray(result.filters.available.sources)).toBe(true);
      });
    });
  });
});
