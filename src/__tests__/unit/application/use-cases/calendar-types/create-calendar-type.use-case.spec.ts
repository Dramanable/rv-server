import { IAuditService } from "@application/ports/audit.port";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { CreateCalendarTypeRequest } from "@application/use-cases/calendar-types/calendar-type.types";
import { CreateCalendarTypeUseCase } from "@application/use-cases/calendar-types/create-calendar-type.use-case";
import { CalendarType } from "@domain/entities/calendar-type.entity";
import {
  CalendarTypeAlreadyExistsError,
  CalendarTypeValidationError,
} from "@domain/exceptions/calendar-type.exceptions";
import { ICalendarTypeRepository } from "@domain/repositories/calendar-type.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";

describe("CreateCalendarTypeUseCase", () => {
  let useCase: CreateCalendarTypeUseCase;
  let mockRepository: jest.Mocked<ICalendarTypeRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockAuditService: jest.Mocked<IAuditService>;

  const validBusinessId = "550e8400-e29b-41d4-a716-446655440000";
  const validUserId = "550e8400-e29b-41d4-a716-446655440001";

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByBusinessId: jest.fn(),
      findByBusinessIdAndName: jest.fn(),
      findByBusinessIdAndCode: jest.fn(),
      existsByBusinessIdAndName: jest.fn(),
      existsByBusinessIdAndCode: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      countByBusinessId: jest.fn(),
      countActiveByBusinessId: jest.fn(),
      updateSortOrders: jest.fn(),
      findByBusinessIdOrderedBySortOrder: jest.fn(),
      isReferencedByServices: jest.fn(),
      search: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    // Mock i18n
    mockI18n = {
      translate: jest
        .fn()
        .mockImplementation((key: string) => `Translated: ${key}`),
    } as unknown as jest.Mocked<I18nService>;

    // Mock audit service
    mockAuditService = {
      logOperation: jest.fn(),
      findAuditEntries: jest.fn(),
      getEntityHistory: jest.fn(),
      getUserActions: jest.fn(),
      verifyIntegrity: jest.fn(),
      archiveOldEntries: jest.fn(),
      exportAuditData: jest.fn(),
    };

    useCase = new CreateCalendarTypeUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
      mockAuditService,
    );
  });

  describe("🔴 RED Phase - Parameter Validation", () => {
    it("should throw CalendarTypeValidationError when businessId is missing", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: "", // Empty businessId
        name: "Test Calendar Type",
        code: "TEST",
        icon: "calendar",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeValidationError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        "calendarTypes.validation.businessIdRequired",
      );
    });

    it("should throw CalendarTypeValidationError when name is missing", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "", // Empty name
        code: "TEST",
        icon: "calendar",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeValidationError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        "calendarTypes.validation.nameRequired",
      );
    });

    it("should throw CalendarTypeValidationError when code is missing", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Test Calendar Type",
        code: "", // Empty code
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeValidationError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        "calendarTypes.validation.codeRequired",
      );
    });

    it("should throw CalendarTypeValidationError when requestingUserId is missing", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Test Calendar Type",
        code: "TEST",
        requestingUserId: "", // Empty requestingUserId
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeValidationError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        "calendarTypes.validation.requestingUserRequired",
      );
    });
  });

  describe("🔴 RED Phase - Business Rules Validation", () => {
    it("should throw CalendarTypeAlreadyExistsError when code already exists", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Standard Appointment",
        code: "STANDARD",
        description: "Standard appointment type",
        icon: "calendar",
        color: "#007bff",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(true);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeAlreadyExistsError,
      );
      expect(mockRepository.existsByBusinessIdAndCode).toHaveBeenCalledWith(
        expect.objectContaining({ value: validBusinessId }),
        "STANDARD",
      );
    });

    it("should throw CalendarTypeAlreadyExistsError when name already exists", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Standard Appointment",
        code: "STANDARD2",
        description: "Another standard appointment type",
        icon: "calendar-check",
        color: "#28a745",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(true);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        CalendarTypeAlreadyExistsError,
      );
      expect(mockRepository.existsByBusinessIdAndName).toHaveBeenCalledWith(
        expect.objectContaining({ value: validBusinessId }),
        "Standard Appointment",
      );
    });
  });

  describe("🔴 RED Phase - Successful Creation", () => {
    it("should create calendar type successfully with valid data", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Standard Appointment",
        code: "STANDARD",
        description: "Standard appointment type",
        icon: "calendar",
        color: "#007bff",
        sortOrder: 1,
        isActive: true,
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      const mockCalendarType = CalendarType.create({
        businessId: BusinessId.create(validBusinessId),
        name: "Standard Appointment",
        code: "STANDARD",
        description: "Standard appointment type",
        icon: "calendar",
        color: "#007bff",
        sortOrder: 1,
        isActive: true,
        createdBy: validUserId,
      });

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(mockCalendarType);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.calendarType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: "Standard Appointment",
          _code: "STANDARD",
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Calendar type created successfully",
        expect.any(Object),
      );
    });

    it("should create calendar type with minimal required data", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Basic Appointment",
        code: "BASIC",
        description: "Basic appointment type",
        // icon: omise volontairement pour tester la valeur par défaut
        color: "#6c757d",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      const mockCalendarType = CalendarType.create({
        businessId: BusinessId.create(validBusinessId),
        name: "Basic Appointment",
        code: "BASIC",
        description: "Basic appointment type",
        icon: "calendar-basic",
        color: "#6c757d",
        createdBy: validUserId,
      });

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(mockCalendarType);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.calendarType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          _name: "Basic Appointment",
          _code: "BASIC",
        }),
      );
    });
  });

  describe("🔴 RED Phase - Error Handling", () => {
    it("should handle repository save errors gracefully", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Error Test",
        code: "ERROR",
        description: "Error test appointment type",
        // icon: omise volontairement pour tester la valeur par défaut
        color: "#dc3545",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(false);
      mockRepository.save.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        "Database connection failed",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to create calendar type",
        expect.any(Error),
        expect.objectContaining({
          businessId: "550e8400-e29b-41d4-a716-446655440000",
          calendarTypeName: "Error Test",
          correlationId: "test-correlation-id",
        }),
      );
    });
  });

  describe("🔴 RED Phase - Logging", () => {
    it("should log operation attempt and success", async () => {
      // Given
      const request: CreateCalendarTypeRequest = {
        businessId: validBusinessId,
        name: "Logged Appointment",
        code: "LOGGED",
        description: "Logged appointment type",
        icon: "log",
        color: "#28a745",
        requestingUserId: validUserId,
        correlationId: "test-correlation-id",
        timestamp: new Date(),
      };

      const mockCalendarType = CalendarType.create({
        businessId: BusinessId.create(validBusinessId),
        name: "Logged Appointment",
        code: "LOGGED",
        description: "Logged appointment type",
        icon: "calendar-log",
        color: "#28a745",
        createdBy: validUserId,
      });

      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(mockCalendarType);

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Creating calendar type",
        expect.objectContaining({
          businessId: validBusinessId,
          name: "Logged Appointment",
          code: "LOGGED",
          correlationId: "test-correlation-id",
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Calendar type created successfully",
        expect.objectContaining({
          businessId: validBusinessId,
          calendarTypeName: "Logged Appointment",
          correlationId: "test-correlation-id",
        }),
      );
    });
  });
});
