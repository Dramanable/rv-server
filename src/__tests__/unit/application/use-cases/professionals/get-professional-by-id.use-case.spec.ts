/**
 * @fileoverview GetProfessionalByIdUseCase - TDD Unit Tests
 * @module __tests__/unit/application/use-cases/professionals/get-professional-by-id.use-case.spec
 * @description Tests unitaires RED-GREEN-REFACTOR pour GetProfessionalByIdUseCase
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  Professional,
  ProfessionalStatus,
} from '@domain/entities/professional.entity';
import { ProfessionalNotFoundError } from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';
import {
  GetProfessionalByIdRequest,
  GetProfessionalByIdUseCase,
} from '@application/use-cases/professionals/get-professional-by-id.use-case';

describe('GetProfessionalByIdUseCase - TDD', () => {
  // ✅ Test Data Factory
  const createValidRequest = () => ({
    professionalId: ProfessionalId.generate().getValue(),
    requestingUserId: 'admin-user-id',
    correlationId: 'test-correlation-123',
    timestamp: new Date(),
  });

  const createProfessionalEntity = () => {
    return Professional.create({
      businessId: BusinessId.generate(),
      email: Email.create('marie.martin@clinic.com'),
      firstName: 'Dr. Marie',
      lastName: 'Martin',
      speciality: 'Cardiologie',
      licenseNumber: 'ORDRE-789012',
      phoneNumber: '+33187654321',
      bio: 'Cardiologue expérimentée avec 15 ans de pratique',
      experience: 15,
      createdBy: 'admin-user-id',
    });
  };

  // ✅ Mock Services
  let mockProfessionalRepository: jest.Mocked<IProfessionalRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let useCase: GetProfessionalByIdUseCase;

  beforeEach(() => {
    mockProfessionalRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByLicenseNumber: jest.fn(),
      findByBusinessId: jest.fn(),
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
    } as any;

    mockI18n = {
      translate: jest.fn().mockReturnValue('Translated message'),
      t: jest.fn().mockReturnValue('Translated message'),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new GetProfessionalByIdUseCase(
      mockProfessionalRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('🔴 RED - Professional Retrieval Success', () => {
    it('should retrieve professional by valid ID', async () => {
      // Given
      const request = createValidRequest();
      const expectedProfessional = createProfessionalEntity();

      mockProfessionalRepository.findById.mockResolvedValue(
        expectedProfessional,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(expectedProfessional.getId().getValue());
      expect(result.data.email).toBe(
        expectedProfessional.getEmail().toString(),
      );
      expect(result.data.firstName).toBe(expectedProfessional.getFirstName());
      expect(result.data.lastName).toBe(expectedProfessional.getLastName());
      expect(result.data.speciality).toBe(expectedProfessional.getSpeciality());
      expect(result.data.licenseNumber).toBe(
        expectedProfessional.getLicenseNumber(),
      );

      // Verify repository was called correctly
      expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(
        ProfessionalId.fromString(request.professionalId),
      );

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Professional retrieved successfully',
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
          requestingUserId: request.requestingUserId,
          businessId: expect.any(String),
        }),
      );
    });

    it('should log retrieval operation with context', async () => {
      // Given
      const request = createValidRequest();
      const professional = createProfessionalEntity();

      mockProfessionalRepository.findById.mockResolvedValue(professional);

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Retrieving professional by ID',
        expect.objectContaining({
          professionalId: request.professionalId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Professional retrieved successfully',
        expect.objectContaining({
          professionalId: request.professionalId,
          businessId: professional.getBusinessId().getValue(),
        }),
      );
    });
  });

  describe('🔴 RED - Professional Not Found', () => {
    it('should throw error when professional does not exist', async () => {
      // Given
      const request = createValidRequest();

      mockProfessionalRepository.findById.mockResolvedValue(null);

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalNotFoundError,
      );

      expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(
        ProfessionalId.fromString(request.professionalId),
      );

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Professional not found',
        expect.any(Error),
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should use i18n for error messages', async () => {
      // Given
      const request = createValidRequest();

      mockProfessionalRepository.findById.mockResolvedValue(null);
      mockI18n.translate.mockReturnValue('Professional not found');

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Professional not found',
      );

      expect(mockI18n.translate).toHaveBeenCalledWith(
        'professional.errors.notFound',
        { professionalId: request.professionalId },
      );
    });
  });

  describe('🔴 RED - Input Validation', () => {
    it('should throw error for invalid professional ID format', async () => {
      // Given
      const request = {
        ...createValidRequest(),
        professionalId: 'invalid-uuid-format',
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockProfessionalRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for empty professional ID', async () => {
      // Given
      const request = {
        ...createValidRequest(),
        professionalId: '',
      };

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockProfessionalRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('🔴 RED - Repository Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Given
      const request = createValidRequest();

      mockProfessionalRepository.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve professional',
        expect.any(Error),
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should handle unexpected repository responses', async () => {
      // Given
      const request = createValidRequest();

      // Simulate repository returning undefined instead of null
      mockProfessionalRepository.findById.mockResolvedValue(undefined as any);

      // When/Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalNotFoundError,
      );
    });
  });

  describe('🔴 RED - Response Mapping', () => {
    it('should return complete professional response', async () => {
      // Given
      const request = createValidRequest();
      const professional = createProfessionalEntity();

      mockProfessionalRepository.findById.mockResolvedValue(professional);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        success: true,
        data: {
          id: professional.getId().getValue(),
          businessId: professional.getBusinessId().getValue(),
          email: professional.getEmail().toString(),
          firstName: professional.getFirstName(),
          lastName: professional.getLastName(),
          speciality: professional.getSpeciality(),
          licenseNumber: professional.getLicenseNumber(),
          phone: professional.getPhoneNumber(),
          bio: professional.getBio(),
          experience: professional.getExperience(),
          profileImageUrl: professional.getProfileImage(),
          isActive: professional.isActive(),
          createdBy: professional.getCreatedBy(),
          updatedBy: professional.getUpdatedBy(),
          createdAt: professional.getCreatedAt(),
          updatedAt: professional.getUpdatedAt(),
        },
        meta: {
          timestamp: expect.any(String),
          correlationId: request.correlationId,
        },
      });
    });

    it('should handle professionals with minimal data', async () => {
      // Given
      const request = createValidRequest();
      const minimalProfessional = Professional.create({
        businessId: BusinessId.fromString(
          'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
        ),
        email: Email.create('minimal@clinic.com'),
        firstName: 'Dr. Min',
        lastName: 'Mal',
        speciality: 'General',
        licenseNumber: 'LICENSE-123',
        createdBy: 'admin',
      });

      mockProfessionalRepository.findById.mockResolvedValue(
        minimalProfessional,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.phone).toBeUndefined();
      expect(result.data.bio).toBeUndefined();
      expect(result.data.experience).toBeUndefined();
    });
  });
});

// ✅ OBLIGATOIRE - Helper functions pour tests cohérents
function createValidRequest(): GetProfessionalByIdRequest {
  return {
    professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    requestingUserId: 'admin-user-id',
    correlationId: 'test-correlation-123',
    timestamp: new Date(),
  };
}

function createProfessionalEntity(): Professional {
  return Professional.reconstruct({
    id: ProfessionalId.fromString('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'), // ✅ CRITIQUE : Même ID que la requête
    businessId: BusinessId.fromString('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff'), // ✅ Utiliser un UUID v4 valide
    email: Email.create('doctor@clinic.com'),
    firstName: 'Dr. Marie',
    lastName: 'Martin',
    speciality: 'Cardiologie',
    licenseNumber: 'ORDRE-789012',
    phone: '+33187654321',
    profileImage: 'https://example.com/profile.jpg',
    bio: 'Cardiologue expérimentée',
    experience: '15',
    status: 'ACTIVE' as ProfessionalStatus,
    isVerified: true,
    createdBy: 'admin-user-id',
    updatedBy: 'admin-user-id',
    createdAt: new Date('2023-09-24T16:35:11.143Z'),
    updatedAt: new Date('2025-09-24T16:35:11.143Z'),
  });
}
