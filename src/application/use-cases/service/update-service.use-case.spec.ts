import { Test, TestingModule } from '@nestjs/testing';
import { UpdateServiceUseCase } from './update-service.use-case';
import { ServiceRepository } from '../../../domain/repositories/service.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import {
  Service,
  ServiceCategory,
} from '../../../domain/entities/service.entity';
import {
  ServiceNotFoundError,
  ApplicationValidationError,
} from '../../exceptions/application.exceptions';
import { createMockServiceRepository } from '../../mocks/typed-mocks';
import { createMockLogger } from '../../mocks/typed-mocks';
import { createMockI18nService } from '../../mocks/typed-mocks';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const serviceId = ServiceId.create('12345678-1234-4000-8000-123456789012');
  const businessId = BusinessId.create('11111111-1111-4000-8000-111111111111');
  const requestingUserId = 'user-uuid-456';

  beforeEach(async () => {
    mockServiceRepository = createMockServiceRepository();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateServiceUseCase,
          useFactory: () =>
            new UpdateServiceUseCase(
              mockServiceRepository,
              mockLogger,
              mockI18n,
            ),
        },
      ],
    }).compile();

    useCase = module.get<UpdateServiceUseCase>(UpdateServiceUseCase);
  });

  describe('execute', () => {
    it('should update service successfully with valid data', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });
      existingService.forceId(serviceId); // Forcer l'ID pour le test

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.save.mockResolvedValue();

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: {
          name: 'Updated Service Name',
          description: 'Updated description',
          category: ServiceCategory.TREATMENT,
          pricing: {
            basePrice: 75.0,
            currency: 'EUR',
          },
          scheduling: {
            duration: 45,
            allowOnlineBooking: true,
            requiresApproval: false,
          },
        },
      };

      // Act
      const result = await useCase.execute(updateRequest);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'Updated Service Name',
        description: 'Updated description',
        category: ServiceCategory.TREATMENT,
        pricing: {
          basePrice: {
            amount: 75.0,
            currency: 'EUR',
          },
        },
        scheduling: {
          duration: 45,
          allowOnlineBooking: true,
          requiresApproval: false,
        },
        updatedAt: expect.any(Date),
      });

      expect(mockServiceRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(mockServiceRepository.save).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service updated successfully',
        {
          serviceId: serviceId.getValue(),
          requestingUserId,
          updatedFields: expect.arrayContaining([
            'name',
            'description',
            'category',
          ]),
        },
      );
    });

    it('should update only provided fields (partial update)', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.save.mockResolvedValue();

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: {
          name: 'Partially Updated Name',
          // Seulement le nom est mis à jour
        },
      };

      // Act
      const result = await useCase.execute(updateRequest);

      // Assert
      expect(result.name).toBe('Partially Updated Name');
      expect(result.description).toBe('Original description'); // Inchangé
      expect(result.category).toBe(ServiceCategory.CONSULTATION); // Inchangé

      expect(mockServiceRepository.save).toHaveBeenCalled();
    });

    it('should throw ServiceNotFoundError when service does not exist', async () => {
      // Arrange
      mockServiceRepository.findById.mockResolvedValue(null);

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: {
          name: 'Updated Name',
        },
      };

      // Act & Assert
      await expect(useCase.execute(updateRequest)).rejects.toThrow(
        ServiceNotFoundError,
      );
      expect(mockServiceRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(mockServiceRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Service not found for update',
        { serviceId: serviceId.getValue(), requestingUserId },
      );
    });

    it('should validate required parameters', async () => {
      // Arrange & Act & Assert
      await expect(
        useCase.execute({
          serviceId: '',
          requestingUserId,
          updates: { name: 'Test' },
        }),
      ).rejects.toThrow(ApplicationValidationError);

      await expect(
        useCase.execute({
          serviceId: serviceId.getValue(),
          requestingUserId: '',
          updates: { name: 'Test' },
        }),
      ).rejects.toThrow(ApplicationValidationError);

      await expect(
        useCase.execute({
          serviceId: serviceId.getValue(),
          requestingUserId,
          updates: {},
        }),
      ).rejects.toThrow(ApplicationValidationError);
    });

    it('should validate update data business rules', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);

      // Act & Assert - Nom trop court
      await expect(
        useCase.execute({
          serviceId: serviceId.getValue(),
          requestingUserId,
          updates: { name: 'A' },
        }),
      ).rejects.toThrow(ApplicationValidationError);

      // Act & Assert - Prix négatif
      await expect(
        useCase.execute({
          serviceId: serviceId.getValue(),
          requestingUserId,
          updates: {
            pricing: { basePrice: -10, currency: 'EUR' },
          },
        }),
      ).rejects.toThrow(ApplicationValidationError);

      // Act & Assert - Durée invalide
      await expect(
        useCase.execute({
          serviceId: serviceId.getValue(),
          requestingUserId,
          updates: {
            scheduling: { duration: 0 },
          },
        }),
      ).rejects.toThrow(ApplicationValidationError);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);

      const repositoryError = new Error('Database connection failed');
      mockServiceRepository.save.mockRejectedValue(repositoryError);

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: { name: 'Updated Name' },
      };

      // Act & Assert
      await expect(useCase.execute(updateRequest)).rejects.toThrow(
        repositoryError,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error updating service',
        repositoryError,
        {
          serviceId: serviceId.getValue(),
          requestingUserId,
        },
      );
    });

    it('should check service name uniqueness within business when updating name', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.existsByName.mockResolvedValue(true); // Nom déjà utilisé

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: {
          name: 'Existing Service Name',
        },
      };

      // Act & Assert
      await expect(useCase.execute(updateRequest)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockServiceRepository.existsByName).toHaveBeenCalledWith(
        businessId,
        'Existing Service Name',
        serviceId,
      );
    });

    it('should log operation attempt and success', async () => {
      // Arrange
      const existingService = Service.create({
        businessId,
        name: 'Original Service',
        description: 'Original description',
        category: ServiceCategory.CONSULTATION,
        basePrice: 50.0,
        currency: 'EUR',
        duration: 30,
      });

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.save.mockResolvedValue();

      const updateRequest = {
        serviceId: serviceId.getValue(),
        requestingUserId,
        updates: { name: 'Updated Name' },
      };

      // Act
      await useCase.execute(updateRequest);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to update service',
        { serviceId: serviceId.getValue(), requestingUserId },
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service updated successfully',
        {
          serviceId: serviceId.getValue(),
          requestingUserId,
          updatedFields: ['name'],
        },
      );
    });
  });
});
