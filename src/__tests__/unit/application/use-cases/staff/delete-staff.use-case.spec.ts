/**
 * 🧪 Tests DeleteStaffUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de suppression d'un membre du personnel
 * Couche Application - Tests d'orchestration métier
 */

import {
  ApplicationValidationError,
  ResourceNotFoundError,
} from '../../../../../application/exceptions/application.exceptions';
import { I18nService } from '../../../../../application/ports/i18n.port';
import { Logger } from '../../../../../application/ports/logger.port';
import { DeleteStaffUseCase } from '../../../../../application/use-cases/staff/delete-staff.use-case';
import { Staff } from '../../../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../../../domain/repositories/staff.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';

describe('DeleteStaffUseCase', () => {
  let useCase: DeleteStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Mock StaffRepository avec tous les méthodes requises
    mockStaffRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByBusinessId: jest.fn(),
      findByRole: jest.fn(),
      count: jest.fn(),
      search: jest.fn(),
      getBusinessStaffStatistics: jest.fn(),
      findByBusinessIdAndRole: jest.fn(),
      findAvailableStaff: jest.fn(),
      existsByEmail: jest.fn(),
    } as jest.Mocked<StaffRepository>;

    // Mock Logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as jest.Mocked<Logger>;

    // Mock I18nService
    mockI18n = {
      translate: jest
        .fn()
        .mockImplementation((key: string) => `Translated: ${key}`),
      t: jest.fn().mockImplementation((key: string) => `Translated: ${key}`),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    } as jest.Mocked<I18nService>;

    // Instancier le use case avec les mocks
    useCase = new DeleteStaffUseCase(mockStaffRepository, mockLogger, mockI18n);
  });

  describe('Parameter validation', () => {
    it('should throw ApplicationValidationError when staffId is missing', async () => {
      const request = {
        staffId: '',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error deleting staff',
        expect.any(ApplicationValidationError),
        expect.objectContaining({
          staffId: '',
        }),
      );
    });

    it('should throw ApplicationValidationError when requestingUserId is missing', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error deleting staff',
        expect.any(ApplicationValidationError),
        expect.objectContaining({
          staffId: '550e8400-e29b-41d4-a716-446655440002',
        }),
      );
    });

    it('should throw ApplicationValidationError when staffId is not a valid UUID', async () => {
      const request = {
        staffId: 'invalid-uuid',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Business rules validation', () => {
    it('should throw ApplicationValidationError when staff cannot be deleted (has active appointments)', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      // Créer un Staff ACTIVE (canBeDeleted() === false)
      const mockStaff = Staff.create({
        businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440003'),
        profile: {
          firstName: 'Test',
          lastName: 'Staff',
          bio: 'Test staff member',
        },
        role: StaffRole.DOCTOR,
        email: 'test.staff@example.com',
        availability: {
          workingHours: [
            {
              dayOfWeek: 1,
              startTime: '09:00',
              endTime: '17:00',
              isWorkingDay: true,
            },
          ],
        },
      });
      // Le staff est ACTIVE par défaut, donc canBeDeleted() === false

      mockStaffRepository.findById.mockResolvedValue(mockStaff);

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        'staff.delete.hasActiveAppointments',
      );
    });
  });

  describe('Staff not found', () => {
    it('should throw ResourceNotFoundError when staff does not exist', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      mockStaffRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        ResourceNotFoundError,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Staff not found',
        expect.any(ResourceNotFoundError),
        expect.objectContaining({
          staffId: request.staffId,
        }),
      );
    });
  });

  describe('Successful deletion', () => {
    let mockStaff: Staff;

    beforeEach(() => {
      mockStaff = Staff.create({
        businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440003'),
        profile: {
          firstName: 'Test',
          lastName: 'Staff',
          bio: 'Test staff member',
        },
        role: StaffRole.DOCTOR,
        email: 'test.staff@example.com',
        availability: {
          workingHours: [
            {
              dayOfWeek: 1,
              startTime: '09:00',
              endTime: '17:00',
              isWorkingDay: true,
            },
          ],
        },
      });

      // Désactiver le staff pour permettre la suppression (canBeDeleted() === true)
      mockStaff.deactivate();

      mockStaffRepository.findById.mockResolvedValue(mockStaff);
      mockStaffRepository.delete.mockResolvedValue();
    });

    it('should delete staff successfully', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.staffId).toBe(request.staffId);
      expect(mockStaffRepository.delete).toHaveBeenCalledWith(mockStaff.id);
    });
  });

  describe('Logging', () => {
    let mockStaff: Staff;

    beforeEach(() => {
      mockStaff = Staff.create({
        businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440003'),
        profile: {
          firstName: 'Test',
          lastName: 'Staff',
          bio: 'Test staff member',
        },
        role: StaffRole.DOCTOR,
        email: 'test.staff@example.com',
        availability: {
          workingHours: [
            {
              dayOfWeek: 1,
              startTime: '09:00',
              endTime: '17:00',
              isWorkingDay: true,
            },
          ],
        },
      });

      // Désactiver le staff pour permettre la suppression (canBeDeleted() === true)
      mockStaff.deactivate();

      mockStaffRepository.findById.mockResolvedValue(mockStaff);
      mockStaffRepository.delete.mockResolvedValue();
    });

    it('should log deletion attempt', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to delete staff',
        expect.objectContaining({
          staffId: request.staffId,
          requestingUserId: request.requestingUserId,
        }),
      );
    });

    it('should log successful deletion', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staff deleted successfully',
        expect.objectContaining({
          staffId: request.staffId,
          staffName: mockStaff.fullName,
        }),
      );
    });

    it('should log errors', async () => {
      const request = {
        staffId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const error = new Error('Database error');
      mockStaffRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error deleting staff',
        expect.any(Error),
        expect.objectContaining({
          staffId: request.staffId,
        }),
      );
    });
  });
});
