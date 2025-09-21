import { Test, TestingModule } from '@nestjs/testing';
import {
  Service,
  ServiceCategory,
} from '../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';
import {
  createMockI18nService,
  createMockLogger,
  createMockServiceRepository,
} from '../../mocks/typed-mocks';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { ListServicesUseCase } from './list-services.use-case';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const requestingUserId = 'user-uuid-456';
  const businessId = BusinessId.create('11111111-1111-4000-8000-111111111111');

  beforeEach(async () => {
    mockServiceRepository = createMockServiceRepository();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ListServicesUseCase,
          useFactory: () =>
            new ListServicesUseCase(
              mockServiceRepository,
              mockLogger,
              mockI18n,
            ),
        },
      ],
    }).compile();

    useCase = module.get<ListServicesUseCase>(ListServicesUseCase);
  });

  describe('execute', () => {
    it('should return paginated list of services with default parameters', async () => {
      // Arrange
      const mockServices = [
        Service.create({
          businessId,
          name: 'Service 1',
          description: 'Description 1',
          category: ServiceCategory.CONSULTATION,
          basePrice: 50.0,
          currency: 'EUR',
          duration: 30,
        }),
        Service.create({
          businessId,
          name: 'Service 2',
          description: 'Description 2',
          category: ServiceCategory.TREATMENT,
          basePrice: 75.0,
          currency: 'EUR',
          duration: 45,
        }),
      ];

      mockServiceRepository.search.mockResolvedValue({
        services: mockServices,
        total: 2,
      });

      const request = {
        requestingUserId,
        businessId: businessId.getValue(),
        pagination: {
          page: 1,
          limit: 10,
        },
        sorting: {
          sortBy: 'createdAt',
          sortOrder: 'desc' as const,
        },
        filters: {},
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: 'Service 1',
            category: ServiceCategory.CONSULTATION,
          }),
          expect.objectContaining({
            id: expect.any(String),
            name: 'Service 2',
            category: ServiceCategory.TREATMENT,
          }),
        ]),
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      expect(mockServiceRepository.search).toHaveBeenCalledWith({
        businessId,
        limit: 10,
        offset: 0,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Services listed successfully',
        {
          businessId: businessId.getValue(),
          requestingUserId,
          totalFound: 2,
          page: 1,
          limit: 10,
        },
      );
    });

    it('should apply search filters correctly', async () => {
      // Arrange
      const mockServices = [
        Service.create({
          businessId,
          name: 'Consultation Test',
          description: 'Test consultation',
          category: ServiceCategory.CONSULTATION,
          basePrice: 50.0,
          currency: 'EUR',
          duration: 30,
        }),
      ];

      mockServiceRepository.search.mockResolvedValue({
        services: mockServices,
        total: 1,
      });

      const request = {
        requestingUserId,
        businessId: businessId.getValue(),
        pagination: {
          page: 1,
          limit: 5,
        },
        sorting: {
          sortBy: 'name',
          sortOrder: 'asc' as const,
        },
        filters: {
          name: 'Test',
          category: ServiceCategory.CONSULTATION,
          isActive: true,
          minPrice: 40,
          maxPrice: 60,
        },
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);

      expect(mockServiceRepository.search).toHaveBeenCalledWith({
        businessId,
        name: 'Test',
        category: ServiceCategory.CONSULTATION,
        isActive: true,
        minPrice: 40,
        maxPrice: 60,
        limit: 5,
        offset: 0,
      });
    });

    it('should calculate pagination correctly', async () => {
      // Arrange
      const mockServices = Array.from({ length: 15 }, (_, i) =>
        Service.create({
          businessId,
          name: `Service ${i + 1}`,
          description: `Description ${i + 1}`,
          category: ServiceCategory.CONSULTATION,
          basePrice: 50.0,
          currency: 'EUR',
          duration: 30,
        }),
      );

      mockServiceRepository.search.mockResolvedValue({
        services: mockServices.slice(10, 15), // Page 2 avec 5 éléments
        total: 15,
      });

      const request = {
        requestingUserId,
        businessId: businessId.getValue(),
        pagination: {
          page: 2,
          limit: 5,
        },
        sorting: {
          sortBy: 'createdAt',
          sortOrder: 'desc' as const,
        },
        filters: {},
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.meta).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 15,
        itemsPerPage: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });

      expect(mockServiceRepository.search).toHaveBeenCalledWith({
        businessId,
        limit: 5,
        offset: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
      });
    });

    it('should validate required parameters', async () => {
      // Arrange & Act & Assert
      await expect(
        useCase.execute({
          requestingUserId: '',
          businessId: businessId.getValue(),
          pagination: { page: 1, limit: 10 },
          sorting: { sortBy: 'createdAt', sortOrder: 'desc' },
          filters: {},
        }),
      ).rejects.toThrow(ApplicationValidationError);

      await expect(
        useCase.execute({
          requestingUserId,
          businessId: '',
          pagination: { page: 1, limit: 10 },
          sorting: { sortBy: 'createdAt', sortOrder: 'desc' },
          filters: {},
        }),
      ).rejects.toThrow(ApplicationValidationError);

      await expect(
        useCase.execute({
          requestingUserId,
          businessId: businessId.getValue(),
          pagination: { page: 0, limit: 10 },
          sorting: { sortBy: 'createdAt', sortOrder: 'desc' },
          filters: {},
        }),
      ).rejects.toThrow(ApplicationValidationError);

      await expect(
        useCase.execute({
          requestingUserId,
          businessId: businessId.getValue(),
          pagination: { page: 1, limit: 150 },
          sorting: { sortBy: 'createdAt', sortOrder: 'desc' },
          filters: {},
        }),
      ).rejects.toThrow(ApplicationValidationError);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockServiceRepository.search.mockRejectedValue(repositoryError);

      const request = {
        requestingUserId,
        businessId: businessId.getValue(),
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error listing services',
        repositoryError,
        {
          businessId: businessId.getValue(),
          requestingUserId,
        },
      );
    });

    it('should return empty list when no services found', async () => {
      // Arrange
      mockServiceRepository.search.mockResolvedValue({
        services: [],
        total: 0,
      });

      const request = {
        requestingUserId,
        businessId: businessId.getValue(),
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' as const },
        filters: {},
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });
  });
});
