/**
 * 🧪 Tests GetStaffUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de récupération d'un staff
 * Couche Application - Tests d'orchestration métier
 */

import { ApplicationValidationError } from '../../../../../application/exceptions/application.exceptions';
import { I18nService } from '../../../../../application/ports/i18n.port';
import { Logger } from '../../../../../application/ports/logger.port';
import { GetStaffUseCase } from '../../../../../application/use-cases/staff/get-staff.use-case';
import { Staff } from '../../../../../domain/entities/staff.entity';
import { StaffNotFoundError } from '../../../../../domain/exceptions/staff.exceptions';
import { StaffRepository } from '../../../../../domain/repositories/staff.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';

describe('GetStaffUseCase', () => {
  let useCase: GetStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockStaff = Staff.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'Consultation and Treatment',
    },
    role: StaffRole.DOCTOR,
    email: 'john.doe@example.com',
    availability: {
      workingHours: [
        {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          isWorkingDay: true,
        },
        {
          dayOfWeek: 2,
          startTime: '09:00',
          endTime: '17:00',
          isWorkingDay: true,
        },
        {
          dayOfWeek: 3,
          startTime: '09:00',
          endTime: '17:00',
          isWorkingDay: true,
        },
        {
          dayOfWeek: 4,
          startTime: '09:00',
          endTime: '17:00',
          isWorkingDay: true,
        },
        {
          dayOfWeek: 5,
          startTime: '09:00',
          endTime: '17:00',
          isWorkingDay: true,
        },
      ],
    },
  });

  beforeEach(() => {
    mockStaffRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByBusinessId: jest.fn(),
      findByBusinessIdAndRole: jest.fn(),
      findAvailableStaff: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
      getBusinessStaffStatistics: jest.fn(),
      search: jest.fn(),
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
      translate: jest.fn(),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    useCase = new GetStaffUseCase(mockStaffRepository, mockLogger, mockI18n);
  });

  describe('Parameter validation', () => {
    it('should throw ApplicationValidationError when staffId is missing', async () => {
      const request = {
        staffId: '',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when requestingUserId is missing', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when staffId is not a valid UUID', async () => {
      const request = {
        staffId: 'invalid-uuid',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Staff not found', () => {
    it('should throw StaffNotFoundError when staff does not exist', async () => {
      mockStaffRepository.findById.mockResolvedValue(null);
      mockI18n.translate.mockReturnValue('Staff member not found');

      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        StaffNotFoundError,
      );
    });
  });

  describe('Successful retrieval', () => {
    beforeEach(() => {
      mockStaffRepository.findById.mockResolvedValue(mockStaff);
    });

    it('should return staff successfully with valid staffId', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockStaff.id.toString());
      expect(result.profile.firstName).toBe('John');
      expect(result.profile.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.role).toBe(StaffRole.DOCTOR);
      expect(result.profile.specialization).toBe('Consultation and Treatment');
      expect(result.availability).toBeDefined();
    });

    it('should return all staff properties correctly', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      const result = await useCase.execute(request);

      expect(result).toMatchObject({
        id: expect.any(String),
        businessId: expect.any(String),
        profile: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          specialization: 'Consultation and Treatment',
        }),
        email: expect.any(String),
        role: StaffRole.DOCTOR,
        availability: expect.any(Object),
        status: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      mockStaffRepository.findById.mockResolvedValue(mockStaff);
    });

    it('should log retrieval attempt', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to retrieve staff',
        {
          staffId: '550e8400-e29b-41d4-a716-446655440003',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
        },
      );
    });

    it('should log successful retrieval', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staff retrieved successfully',
        expect.objectContaining({
          staffId: '550e8400-e29b-41d4-a716-446655440003',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
          staffName: 'John Doe',
        }),
      );
    });

    it('should log errors', async () => {
      mockStaffRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
      };

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving staff',
        expect.any(Error),
        {
          staffId: '550e8400-e29b-41d4-a716-446655440003',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440002',
        },
      );
    });
  });
});
