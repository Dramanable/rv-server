/**
 * 🧪 Tests ListStaffUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de listage du personnel avec recherche avancée
 * Couche Application - Tests d'orchestration métier
 */

import { ListStaffUseCase } from '../../../../../application/use-cases/staff/list-staff.use-case';
import { StaffRepository } from '../../../../../domain/repositories/staff.repository.interface';
import { Logger } from '../../../../../application/ports/logger.port';
import { I18nService } from '../../../../../application/ports/i18n.port';
import {
  Staff,
  StaffStatus,
} from '../../../../../domain/entities/staff.entity';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { ApplicationValidationError } from '../../../../../application/exceptions/application.exceptions';

describe('ListStaffUseCase', () => {
  let useCase: ListStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockStaff1 = Staff.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'General Medicine',
    },
    role: StaffRole.DOCTOR,
    email: 'john.doe@example.com',
  });

  const mockStaff2 = Staff.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      specialization: 'Dentistry',
    },
    role: StaffRole.DENTIST,
    email: 'jane.smith@example.com',
  });

  const mockStaffList = [mockStaff1, mockStaff2];

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

    useCase = new ListStaffUseCase(mockStaffRepository, mockLogger, mockI18n);
  });

  describe('Parameter validation', () => {
    it('should throw ApplicationValidationError when requestingUserId is missing', async () => {
      const request = {
        requestingUserId: '',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when page is less than 1', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 0, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when limit exceeds maximum', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 150 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError for invalid sort field', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'invalidField', sortOrder: 'desc' as const },
        filters: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Successful listing', () => {
    beforeEach(() => {
      mockStaffRepository.search.mockResolvedValue({
        staff: mockStaffList,
        total: 2,
      });
    });

    it('should return paginated staff list with default parameters', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.meta).toMatchObject({
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('should apply search filters correctly', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {
          search: 'John',
          role: StaffRole.DOCTOR,
          isActive: true,
        },
      };

      await useCase.execute(request);

      expect(mockStaffRepository.search).toHaveBeenCalledWith({
        name: 'John',
        role: StaffRole.DOCTOR,
        isActive: true,
        limit: 10,
        offset: 0,
      });
    });

    it('should return staff with all required properties', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      const result = await useCase.execute(request);

      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        businessId: expect.any(String),
        profile: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          specialization: 'General Medicine',
        }),
        role: StaffRole.DOCTOR,
        email: expect.any(String),
        status: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle pagination correctly for multiple pages', async () => {
      mockStaffRepository.search.mockResolvedValue({
        staff: [mockStaff1],
        total: 25,
      });

      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 2, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      const result = await useCase.execute(request);

      expect(result.meta).toMatchObject({
        currentPage: 2,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10,
        hasNextPage: true,
        hasPrevPage: true,
      });

      expect(mockStaffRepository.search).toHaveBeenCalledWith({
        limit: 10,
        offset: 10, // (page - 1) * limit = (2 - 1) * 10 = 10
      });
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      mockStaffRepository.search.mockResolvedValue({
        staff: mockStaffList,
        total: 2,
      });
    });

    it('should log search attempt', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: { search: 'John' },
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to list staff',
        expect.objectContaining({
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          page: 1,
          limit: 10,
          filters: { search: 'John' },
        }),
      );
    });

    it('should log successful search', async () => {
      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Staff list retrieved successfully',
        expect.objectContaining({
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          totalItems: 2,
          returnedItems: 2,
        }),
      );
    });

    it('should log errors', async () => {
      mockStaffRepository.search.mockRejectedValue(new Error('Database error'));

      const request = {
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error listing staff',
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        }),
      );
    });
  });
});
