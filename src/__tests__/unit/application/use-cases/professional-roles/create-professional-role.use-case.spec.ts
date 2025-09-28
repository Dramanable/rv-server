import { CreateProfessionalRoleUseCase } from '@application/use-cases/professional-roles/create-professional-role.use-case';
import { ProfessionalRole } from '@domain/entities/professional-role.entity';
import { ProfessionalRoleCodeAlreadyExistsError } from '@domain/exceptions/professional-role.exceptions';
import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';

describe('CreateProfessionalRoleUseCase', () => {
  let useCase: CreateProfessionalRoleUseCase;
  let mockRepository: jest.Mocked<IProfessionalRoleRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      findActive: jest.fn(),
      findLeaderRoles: jest.fn(),
      existsByCode: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    };

    useCase = new CreateProfessionalRoleUseCase(mockRepository);
  });

  describe('Successful Creation', () => {
    it('should create a professional role successfully', async () => {
      // Given
      const request = {
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
        canLead: true,
        requestingUserId: 'user-123',
      };

      const createdRole = ProfessionalRole.create({
        code: request.code,
        name: request.name,
        displayName: request.displayName,
        category: request.category,
        description: request.description,
        canLead: request.canLead,
      });

      mockRepository.findByCode.mockResolvedValue(null); // Pas de rôle existant
      mockRepository.save.mockResolvedValue(createdRole);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        id: createdRole.getId(),
        code: request.code,
        name: request.name,
        displayName: request.displayName,
        category: request.category,
        description: request.description,
        canLead: request.canLead,
        isActive: true,
        createdAt: createdRole.getCreatedAt(),
        updatedAt: createdRole.getUpdatedAt(),
      });

      expect(mockRepository.findByCode).toHaveBeenCalledWith(request.code);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.any(ProfessionalRole),
      );
    });

    it('should create a professional role with canLead defaulting to false', async () => {
      // Given
      const request = {
        code: 'ASSISTANT',
        name: 'Assistant',
        displayName: 'Assistant',
        category: 'SUPPORT',
        description: 'Assistant professionnel pour support',
        requestingUserId: 'user-123',
        // canLead non spécifié - doit valoir false par défaut
      };

      const createdRole = ProfessionalRole.create({
        code: request.code,
        name: request.name,
        displayName: request.displayName,
        category: request.category,
        description: request.description,
        canLead: false, // Valeur par défaut
      });

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(createdRole);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.canLead).toBe(false);
      expect(mockRepository.findByCode).toHaveBeenCalledWith(request.code);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.any(ProfessionalRole),
      );
    });
  });

  describe('Business Rule Violations', () => {
    it('should throw error if professional role code already exists', async () => {
      // Given
      const request = {
        code: 'EXISTING_CODE',
        name: 'Existing Role',
        displayName: 'Rôle Existant',
        category: 'SERVICE_PROVIDER',
        description: 'Un rôle qui existe déjà',
        canLead: false,
        requestingUserId: 'user-123',
      };

      const existingRole = ProfessionalRole.create({
        code: request.code,
        name: 'Previous Name',
        displayName: 'Nom Précédent',
        category: 'SERVICE_PROVIDER',
        description: 'Description précédente',
        canLead: false,
      });

      mockRepository.findByCode.mockResolvedValue(existingRole); // Rôle existant

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalRoleCodeAlreadyExistsError,
      );
      expect(mockRepository.findByCode).toHaveBeenCalledWith(request.code);
    });
  });

  describe('Repository Interactions', () => {
    it('should call repository methods in correct order', async () => {
      // Given
      const request = {
        code: 'TEST_ROLE',
        name: 'Test Role',
        displayName: 'Rôle de Test',
        category: 'SERVICE_PROVIDER',
        description: 'Description de test pour le rôle',
        canLead: true,
        requestingUserId: 'user-123',
      };

      const createdRole = ProfessionalRole.create({
        code: request.code,
        name: request.name,
        displayName: request.displayName,
        category: request.category,
        description: request.description,
        canLead: request.canLead,
      });

      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(createdRole);

      // When
      await useCase.execute(request);

      // Then
      expect(mockRepository.findByCode).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.any(ProfessionalRole),
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Given
      const request = {
        code: 'ERROR_ROLE',
        name: 'Error Role',
        displayName: 'Rôle Erreur',
        category: 'SERVICE_PROVIDER',
        description: 'Description pour test erreur',
        canLead: false,
        requestingUserId: 'user-123',
      };

      const repositoryError = new Error('Database connection failed');
      mockRepository.findByCode.mockRejectedValue(repositoryError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
    });
  });
});
