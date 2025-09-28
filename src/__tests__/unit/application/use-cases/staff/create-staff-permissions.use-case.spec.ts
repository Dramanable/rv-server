/**
 * 🧪 TDD Test - CreateStaffUseCase avec IPermissionService
 *
 * Test RED → GREEN → REFACTOR pour valider l'utilisation d'IPermissionService
 * au lieu des patterns de permission legacy
 */

import { I18nService } from '../../../../../application/ports/i18n.port';
import { Logger } from '../../../../../application/ports/logger.port';
import { IPermissionService } from '../../../../../application/ports/permission.service.interface';
import {
  CreateStaffRequest,
  CreateStaffUseCase,
} from '../../../../../application/use-cases/staff/create-staff.use-case';
import { BusinessRepository } from '../../../../../domain/repositories/business.repository.interface';
import { StaffRepository } from '../../../../../domain/repositories/staff.repository.interface';
import { Permission } from '../../../../../shared/enums/permission.enum';
import { StaffRole } from '../../../../../shared/enums/staff-role.enum';

// Mocks centralisés
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn().mockReturnThis(),
} as unknown as jest.Mocked<Logger>;

const mockI18n = {
  t: jest.fn().mockReturnValue('Mocked translation'),
  translate: jest.fn().mockReturnValue('Mocked translation'),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn().mockReturnValue(true),
} as jest.Mocked<I18nService>;

const mockPermissionService = {
  requirePermission: jest.fn().mockResolvedValue(undefined),
  hasPermission: jest.fn().mockResolvedValue(true),
  getUserPermissions: jest.fn().mockResolvedValue([]),
  canActOnRole: jest.fn().mockResolvedValue(true),
  getUserRole: jest.fn(),
  hasRole: jest.fn().mockResolvedValue(true),
  hasBusinessPermission: jest.fn().mockResolvedValue(true),
  canManageUser: jest.fn().mockResolvedValue(true),
  isUserInBusiness: jest.fn().mockResolvedValue(true),
  isSuperAdmin: jest.fn().mockResolvedValue(false),
  requireSuperAdminPermission: jest.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<IPermissionService>;

const mockStaffRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByBusinessId: jest.fn(),
  findByBusinessIdAndRole: jest.fn(),
  findAvailableStaff: jest.fn(),
  existsByEmail: jest.fn(),
  getBusinessStaffStatistics: jest.fn(),
  search: jest.fn(),
} as jest.Mocked<StaffRepository>;

const mockBusinessRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findBySectorId: jest.fn(),
  findByName: jest.fn(),
  findBySector: jest.fn(),
  search: jest.fn(),
  existsByName: jest.fn(),
  getBusinessStatistics: jest.fn(),
  getStatistics: jest.fn(),
  findNearLocation: jest.fn(),
} as unknown as jest.Mocked<BusinessRepository>;

describe('CreateStaffUseCase - Permissions Integration', () => {
  let useCase: CreateStaffUseCase;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    useCase = new CreateStaffUseCase(
      mockStaffRepository,
      mockBusinessRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  it('should call IPermissionService.requirePermission with correct parameters', async () => {
    // Given - Mock Staff.create successful flow
    const mockStaff = {
      id: { getValue: () => 'staff-123' },
      profile: { firstName: 'John', lastName: 'Doe' },
      email: { getValue: () => 'john.doe@example.com' },
      role: StaffRole.DOCTOR,
      businessId: { getValue: () => 'f47ac10b-58cc-4372-a567-0e02b2c3d478' },
      isActive: () => true,
      createdAt: new Date(),
    };

    mockStaffRepository.findByEmail.mockResolvedValue(null); // Pas de conflit
    mockStaffRepository.save.mockResolvedValue(mockStaff as any);

    const request: CreateStaffRequest = {
      requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d478',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: StaffRole.DOCTOR,
    };

    // When
    await useCase.execute(request);

    // Then - Vérifier l'appel au service de permissions
    expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      Permission.MANAGE_STAFF,
      { businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d478' },
    );
    expect(mockPermissionService.requirePermission).toHaveBeenCalledTimes(1);
  });

  it('should NOT use legacy validatePermissions or hasPermission patterns', async () => {
    // Given - Pas de patterns legacy attendus dans le code
    const request: CreateStaffRequest = {
      requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d478',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: StaffRole.DOCTOR,
    };

    // Mock des dépendances
    mockStaffRepository.findByEmail.mockResolvedValue(null);
    mockStaffRepository.save.mockResolvedValue({
      id: { getValue: () => 'staff-123' },
      profile: { firstName: 'John', lastName: 'Doe' },
      email: { getValue: () => 'john.doe@example.com' },
      role: StaffRole.DOCTOR,
      businessId: { getValue: () => 'f47ac10b-58cc-4372-a567-0e02b2c3d478' },
      isActive: () => true,
      createdAt: new Date(),
    } as any);

    // When
    await useCase.execute(request);

    // Then - AUCUNE méthode legacy ne doit être appelée
    // Le mock ne contient QUE requirePermission de IPermissionService
    expect(mockPermissionService.requirePermission).toHaveBeenCalled();

    // Vérifier que les anciens patterns NE SONT PAS utilisés
    expect(mockLogger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('permission'),
    );
  });

  it('should handle permission denied correctly', async () => {
    // Given - Permission refusée
    const permissionError = new Error('Permission denied');
    mockPermissionService.requirePermission.mockRejectedValue(permissionError);

    const request: CreateStaffRequest = {
      requestingUserId: 'user-789',
      businessId: 'business-456',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: StaffRole.DOCTOR,
    };

    // When & Then
    await expect(useCase.execute(request)).rejects.toThrow('Permission denied');

    // Vérifier que requirePermission a été appelée
    expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
      'user-789',
      Permission.MANAGE_STAFF,
      { businessId: 'business-456' },
    );

    // Vérifier qu'aucune opération métier n'a été effectuée
    expect(mockStaffRepository.save).not.toHaveBeenCalled();
  });
});
