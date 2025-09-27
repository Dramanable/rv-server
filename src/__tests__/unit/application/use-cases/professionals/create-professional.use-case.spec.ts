/**
 * @fileoverview CreateProfessionalUseCase - TDD Unit Tests
 * @module __tests__/unit/application/use-cases/professionals/create-professional.use-case.spec
 * @description Tests unitaires RED-GREEN-REFACTOR pour CreateProfessionalUseCase
 */

import { IAuditService } from "@application/ports/audit.port";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { CreateProfessionalUseCase } from "@application/use-cases/professionals/create-professional.use-case";
import { Professional } from "@domain/entities/professional.entity";
import { ProfessionalValidationError } from "@domain/exceptions/professional.exceptions";
import { IProfessionalRepository } from "@domain/repositories/professional.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { Email } from "@domain/value-objects/email.vo";

describe("CreateProfessionalUseCase - TDD", () => {
  // ✅ Test Data Factory
  const createValidRequest = () => ({
    businessId: BusinessId.generate().getValue(),
    firstName: "Dr. Marie",
    lastName: "Martin",
    email: "marie.martin@clinic.com",
    speciality: "Cardiologie",
    licenseNumber: "ORDRE-789012",
    phoneNumber: "+33187654321",
    bio: "Cardiologue expérimentée avec 15 ans de pratique",
    experience: 15,
    requestingUserId: "admin-user-id",
    correlationId: "test-correlation-123",
    timestamp: new Date(),
  });

  // ✅ Helper pour créer requests avec timestamp
  const createRequestWithOverrides = (
    overrides: Partial<ReturnType<typeof createValidRequest>> = {},
  ) => ({
    ...createValidRequest(),
    ...overrides,
  });

  // ✅ Mock Repository
  let mockProfessionalRepository: jest.Mocked<IProfessionalRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockAuditService: jest.Mocked<IAuditService>;
  let useCase: CreateProfessionalUseCase;

  beforeEach(() => {
    mockProfessionalRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByLicenseNumber: jest.fn(),
      findAll: jest.fn(),
      deleteById: jest.fn(),
      existsById: jest.fn(),
      existsByEmail: jest.fn(),
      existsByLicenseNumber: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn().mockReturnValue("Translated message"),
      t: jest.fn().mockReturnValue("Translated message"),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    } as jest.Mocked<I18nService>;

    mockAuditService = {
      logOperation: jest.fn().mockResolvedValue(undefined),
      findAuditEntries: jest.fn(),
      getEntityHistory: jest.fn(),
      getUserActions: jest.fn(),
      verifyIntegrity: jest.fn(),
      archiveOldEntries: jest.fn(),
      exportAuditData: jest.fn(),
    } as jest.Mocked<IAuditService>;

    useCase = new CreateProfessionalUseCase(
      mockProfessionalRepository,
      mockLogger,
      mockI18n,
      mockAuditService,
    );
  });

  describe("🔴 RED - Professional Creation Success", () => {
    it("should create professional with valid data", async () => {
      // Given
      const request = createValidRequest();
      const expectedProfessional = Professional.create({
        businessId: BusinessId.fromString(request.businessId),
        email: Email.create(request.email),
        firstName: request.firstName,
        lastName: request.lastName,
        speciality: request.speciality,
        licenseNumber: request.licenseNumber,
        phoneNumber: request.phoneNumber,
        bio: request.bio,
        experience: request.experience,
        createdBy: request.requestingUserId,
      });

      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(false);
      mockProfessionalRepository.save.mockResolvedValue(expectedProfessional);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBeDefined();
      expect(result.data.firstName).toBe(request.firstName);
      expect(result.data.lastName).toBe(request.lastName);
      expect(result.data.email).toBe(request.email);
      expect(result.data.speciality).toBe(request.speciality);
      expect(result.data.licenseNumber).toBe(request.licenseNumber);
      expect(result.data.isActive).toBe(true);
      expect(result.data.isVerified).toBe(false);

      // Repository interactions
      expect(mockProfessionalRepository.existsByEmail).toHaveBeenCalledWith(
        Email.create(request.email),
      );
      expect(
        mockProfessionalRepository.existsByLicenseNumber,
      ).toHaveBeenCalledWith(request.licenseNumber);
      expect(mockProfessionalRepository.save).toHaveBeenCalledWith(
        expect.any(Professional),
      );
    });

    it("should create professional with minimal required data", async () => {
      // Given
      const request = {
        businessId: BusinessId.generate().getValue(),
        firstName: "Dr. Paul",
        lastName: "Dubois",
        email: "paul.dubois@clinic.com",
        speciality: "Médecine générale",
        licenseNumber: "ORDRE-345678",
        requestingUserId: "admin-user-id",
        correlationId: "test-correlation-456",
        timestamp: new Date(),
      };

      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(false);
      mockProfessionalRepository.save.mockImplementation(
        async (professional) => professional,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.firstName).toBe(request.firstName);
      expect(result.data.lastName).toBe(request.lastName);
      expect(result.data.email).toBe(request.email);
      expect(result.data.speciality).toBe(request.speciality);
      expect(result.data.phoneNumber).toBeUndefined();
      expect(result.data.bio).toBeUndefined();
    });
  });

  describe("🔴 RED - Professional Validation Errors", () => {
    it("should throw error for empty first name", async () => {
      // Given
      const request = createRequestWithOverrides({
        firstName: "", // ❌ Empty first name
      });

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for empty last name", async () => {
      // Given
      const request = {
        ...createValidRequest(),
        lastName: "",
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for invalid email format", async () => {
      // Given
      const request = {
        ...createValidRequest(),
        email: "invalid-email",
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(Error);
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for empty speciality", async () => {
      // Given
      const request = {
        ...createValidRequest(),
        speciality: "",
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for empty license number", async () => {
      // Given
      const request = {
        ...createValidRequest(),
        licenseNumber: "",
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for negative experience", async () => {
      // Given
      const request = {
        ...createValidRequest(),
        experience: -5,
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("🔴 RED - Professional Business Rules", () => {
    it("should throw error for duplicate email", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(true);

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error for duplicate license number", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(true);

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
      expect(mockProfessionalRepository.save).not.toHaveBeenCalled();
    });

    it("should validate business context", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(false);
      mockProfessionalRepository.save.mockImplementation(
        async (professional) => professional,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.businessId).toBe(request.businessId);
      expect(result.data.createdBy).toBe(request.requestingUserId);
      expect(result.data.updatedBy).toBe(request.requestingUserId);
    });
  });

  describe("🔴 RED - Professional Response Mapping", () => {
    it("should return complete professional response", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(false);
      mockProfessionalRepository.save.mockImplementation(
        async (professional) => professional,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          businessId: request.businessId,
          firstName: request.firstName,
          lastName: request.lastName,
          fullName: `${request.firstName} ${request.lastName}`,
          email: request.email,
          speciality: request.speciality,
          licenseNumber: request.licenseNumber,
          phoneNumber: request.phoneNumber,
          bio: request.bio,
          experience: request.experience.toString(),
          isActive: true,
          isVerified: false,
          status: "ACTIVE",
          createdBy: request.requestingUserId,
          updatedBy: request.requestingUserId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        meta: {
          correlationId: request.correlationId,
          timestamp: expect.any(Date),
        },
      });
    });
  });

  describe("🔴 RED - Repository Error Handling", () => {
    it("should handle repository save errors", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockResolvedValue(false);
      mockProfessionalRepository.save.mockRejectedValue(
        new Error("Database connection failed"),
      );

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle email existence check errors", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockRejectedValue(
        new Error("DB query failed"),
      );

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow("DB query failed");
    });

    it("should handle license existence check errors", async () => {
      // Given
      const request = createValidRequest();
      mockProfessionalRepository.existsByEmail.mockResolvedValue(false);
      mockProfessionalRepository.existsByLicenseNumber.mockRejectedValue(
        new Error("DB query failed"),
      );

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow("DB query failed");
    });
  });
});
