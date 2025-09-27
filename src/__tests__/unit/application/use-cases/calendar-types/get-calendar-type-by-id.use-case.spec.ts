import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { GetCalendarTypeByIdUseCase } from "@application/use-cases/calendar-types/get-calendar-type-by-id.use-case";
import { CalendarType } from "@domain/entities/calendar-type.entity";
import { CalendarTypeNotFoundError } from "@domain/exceptions/calendar-type.exceptions";
import { ICalendarTypeRepository } from "@domain/repositories/calendar-type.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { CalendarTypeId } from "@domain/value-objects/calendar-type-id.value-object";

/**
 * 🧪 TDD - RED Phase Tests for GetCalendarTypeByIdUseCase
 * ✅ Tous les tests DOIVENT échouer initialement
 * ✅ Standards entreprise : logging, i18n, audit
 * ✅ Clean Architecture respectée
 */
describe("GetCalendarTypeByIdUseCase", () => {
  let useCase: GetCalendarTypeByIdUseCase;
  let mockCalendarTypeRepository: jest.Mocked<ICalendarTypeRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // 🎭 Mocks setup
    mockCalendarTypeRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByBusinessId: jest.fn(),
      findByBusinessIdAndName: jest.fn(),
      findByBusinessIdAndCode: jest.fn(),
      existsByBusinessIdAndName: jest.fn(),
      existsByBusinessIdAndCode: jest.fn(),
      hardDelete: jest.fn(),
      countByBusinessId: jest.fn(),
      countActiveByBusinessId: jest.fn(),
      updateSortOrders: jest.fn(),
      findByBusinessIdOrderedBySortOrder: jest.fn(),
      isReferencedByServices: jest.fn(),
      search: jest.fn(),
    } as jest.Mocked<ICalendarTypeRepository>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn(),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    } as jest.Mocked<I18nService>;

    // 🏗️ Use Case construction
    useCase = new GetCalendarTypeByIdUseCase(
      mockCalendarTypeRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe("🔴 RED Phase - Successful Retrieval", () => {
    it("should retrieve calendar type successfully with valid ID", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      const businessId = "550e8400-e29b-41d4-a716-446655440000";

      const mockCalendarType = CalendarType.reconstruct({
        id: CalendarTypeId.fromString(calendarTypeId),
        businessId: BusinessId.fromString(businessId),
        name: "Test Calendar",
        code: "TEST_CAL",
        description: "Test calendar description for unit testing",
        color: "#FF5722",
        icon: "test-icon",
        isActive: true,
        isBuiltIn: false,
        sortOrder: 1,
        createdBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        updatedBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T10:00:00.000Z"),
      });

      mockCalendarTypeRepository.findById.mockResolvedValue(mockCalendarType);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-get-calendar-type",
      };

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        calendarType: mockCalendarType,
      });
      expect(mockCalendarTypeRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
    });

    it("should return calendar type with all required properties", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      const businessId = "550e8400-e29b-41d4-a716-446655440000";

      const mockCalendarType = CalendarType.reconstruct({
        id: CalendarTypeId.fromString(calendarTypeId),
        businessId: BusinessId.fromString(businessId),
        name: "Medical Consultation",
        code: "MED_CONSULT",
        description:
          "Calendar for medical consultations and patient follow-ups",
        color: "#4CAF50",
        icon: "medical-calendar",
        isActive: true,
        isBuiltIn: false,
        sortOrder: 2,
        createdBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        updatedBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-20T15:30:00.000Z"),
      });

      mockCalendarTypeRepository.findById.mockResolvedValue(mockCalendarType);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-properties",
      };

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.calendarType.getName()).toBe("Medical Consultation");
      expect(result.calendarType.getCode()).toBe("MED_CONSULT");
      expect(result.calendarType.getDescription()).toBe(
        "Calendar for medical consultations and patient follow-ups",
      );
      expect(result.calendarType.getColor()).toBe("#4CAF50");
      expect(result.calendarType.getIcon()).toBe("medical-calendar");
      expect(result.calendarType.isActive()).toBe(true);
      expect(result.calendarType.isBuiltIn()).toBe(false);
    });
  });

  describe("🔴 RED Phase - Validation Errors", () => {
    it("should throw CalendarTypeNotFoundError when ID is invalid UUID", async () => {
      // Given
      const invalidId = "invalid-uuid-format";
      const request = {
        calendarTypeId: invalidId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-invalid-id",
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeNotFoundError,
      );
    });

    it("should throw CalendarTypeNotFoundError when calendar type does not exist", async () => {
      // Given
      const validId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      mockCalendarTypeRepository.findById.mockResolvedValue(null);

      const request = {
        calendarTypeId: validId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-not-found",
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeNotFoundError,
      );
      expect(mockCalendarTypeRepository.findById).toHaveBeenCalled();
    });
  });

  describe("🔴 RED Phase - Logging and Auditing", () => {
    it("should log retrieval attempt", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      const businessId = "550e8400-e29b-41d4-a716-446655440000";

      const mockCalendarType = CalendarType.reconstruct({
        id: CalendarTypeId.fromString(calendarTypeId),
        businessId: BusinessId.fromString(businessId),
        name: "Test Calendar",
        code: "TEST_CAL",
        description: "Test calendar description for logging test",
        color: "#FF5722",
        icon: "test-icon",
        isActive: true,
        isBuiltIn: false,
        sortOrder: 3,
        createdBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        updatedBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T10:00:00.000Z"),
      });

      mockCalendarTypeRepository.findById.mockResolvedValue(mockCalendarType);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-logging",
      };

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Getting calendar type by ID",
        expect.objectContaining({
          calendarTypeId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        }),
      );
    });

    it("should log successful retrieval", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      const businessId = "550e8400-e29b-41d4-a716-446655440000";

      const mockCalendarType = CalendarType.reconstruct({
        id: CalendarTypeId.fromString(calendarTypeId),
        businessId: BusinessId.fromString(businessId),
        name: "Success Calendar",
        code: "SUCCESS_CAL",
        description: "Calendar for successful retrieval logging test",
        color: "#4CAF50",
        icon: "success-icon",
        isActive: true,
        isBuiltIn: false,
        sortOrder: 4,
        createdBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        updatedBy: "987fcdeb-51a2-43d1-9c15-789456123000",
        createdAt: new Date("2024-01-15T10:00:00.000Z"),
        updatedAt: new Date("2024-01-15T10:00:00.000Z"),
      });

      mockCalendarTypeRepository.findById.mockResolvedValue(mockCalendarType);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-success-log",
      };

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Calendar type retrieved successfully",
        expect.objectContaining({
          calendarTypeId,
          calendarTypeName: "Success Calendar",
          correlationId: request.correlationId,
        }),
      );
    });

    it("should log warning when calendar type not found", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      mockCalendarTypeRepository.findById.mockResolvedValue(null);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-not-found-warning",
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Calendar type not found",
        expect.objectContaining({
          calendarTypeId,
          correlationId: request.correlationId,
        }),
      );
    });
  });

  describe("🔴 RED Phase - Error Handling", () => {
    it("should handle repository errors gracefully", async () => {
      // Given
      const calendarTypeId = "a1b2c3d4-e5f6-4789-8abc-def012345678";
      const repositoryError = new Error("Database connection failed");
      mockCalendarTypeRepository.findById.mockRejectedValue(repositoryError);

      const request = {
        calendarTypeId,
        requestingUserId: "f1e2d3c4-b5a6-4789-8abc-def012345678",
        correlationId: "test-correlation-repository-error",
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        "Database connection failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to get calendar type by ID",
        expect.any(Error),
        expect.objectContaining({
          calendarTypeId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        }),
      );
    });
  });
});
