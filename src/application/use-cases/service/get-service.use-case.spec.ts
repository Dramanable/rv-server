import { Test, TestingModule } from '@nestjs/testing';
import {
  Service,
  ServiceCategory,
} from '../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { ServiceNotFoundError } from '../../exceptions/application.exceptions';
import {
  createMockI18nService,
  createMockLogger,
  createMockServiceRepository,
} from '../../mocks/typed-mocks';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { GetServiceUseCase } from './get-service.use-case';

describe('GetServiceUseCase', () => {
  let useCase: GetServiceUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validServiceId = ServiceId.create(
    '12345678-1234-4000-8000-123456789012',
  );
  const requestingUserId = 'user-uuid-456';

  beforeEach(async () => {
    mockServiceRepository = createMockServiceRepository();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetServiceUseCase,
          useFactory: () =>
            new GetServiceUseCase(mockServiceRepository, mockLogger, mockI18n),
        },
      ],
    }).compile();

    useCase = module.get<GetServiceUseCase>(GetServiceUseCase);
  });

  describe('execute', () => {
    it('should return service when found', async () => {
      // Arrange
      const mockService = Service.create({
        businessId: BusinessId.create('11111111-1111-4000-8000-111111111111'),
        name: 'Test Service',
        description: 'Service description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 99.5,
        currency: 'EUR',
        duration: 60,
        allowOnlineBooking: true,
        requiresApproval: false,
      });
      mockServiceRepository.findById.mockResolvedValue(mockService);

      const request = {
        serviceId: validServiceId.getValue(),
        requestingUserId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: mockService.id.getValue(),
        name: mockService.name,
        description: mockService.description,
        businessId: mockService.businessId.getValue(),
        category: mockService.category,
        pricing: mockService.pricing,
        scheduling: mockService.scheduling,
        requirements: mockService.requirements,
        imageUrl: mockService.imageUrl?.getUrl(),
        assignedStaffIds: mockService.assignedStaffIds.map((id) =>
          id.getValue(),
        ),
        status: mockService.status,
        createdAt: mockService.createdAt,
        updatedAt: mockService.updatedAt,
      });

      expect(mockServiceRepository.findById).toHaveBeenCalledWith(
        validServiceId,
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service retrieved successfully',
        { serviceId: validServiceId.getValue(), requestingUserId },
      );
    });

    it('should throw ServiceNotFoundError when service does not exist', async () => {
      // Arrange
      const nonExistentServiceId = ServiceId.create(
        '87654321-4321-4000-8000-210987654321',
      );
      mockServiceRepository.findById.mockResolvedValue(null);
      mockI18n.translate.mockReturnValue('Service not found');

      const request = {
        serviceId: nonExistentServiceId.getValue(),
        requestingUserId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceNotFoundError,
      );
      expect(mockServiceRepository.findById).toHaveBeenCalledWith(
        nonExistentServiceId,
      );
      expect(mockLogger.warn).toHaveBeenCalledWith('Service not found', {
        serviceId: nonExistentServiceId.getValue(),
        requestingUserId,
      });
    });

    it('should validate required parameters', async () => {
      // Arrange & Act & Assert
      await expect(
        useCase.execute({
          serviceId: '',
          requestingUserId,
        }),
      ).rejects.toThrow();

      await expect(
        useCase.execute({
          serviceId: validServiceId.getValue(),
          requestingUserId: '',
        }),
      ).rejects.toThrow();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockServiceRepository.findById.mockRejectedValue(repositoryError);

      const request = {
        serviceId: validServiceId.getValue(),
        requestingUserId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving service',
        repositoryError,
        {
          serviceId: validServiceId.getValue(),
          requestingUserId,
        },
      );
    });
  });
});
