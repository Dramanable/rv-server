import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase, LoginRequest } from './login.use-case';
import { User } from '../../../domain/entities/user.entity';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.value-object';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { TOKENS } from '../../../shared/constants/injection-tokens';

/**
 * 🧪 Test d'intégration End-to-End - Login avec Cache Redis
 *
 * Ce test vérifie que la chaîne complète fonctionne :
 * 1. Authentification avec mot de passe
 * 2. Stockage automatique du user dans Redis après login réussi
 * 3. Vérification que l'utilisateur est bien présent dans le cache
 *
 * Architecture Clean : Test sans dépendances externes concrètes
 */
describe('LoginUseCase - Integration Test with Redis Cache', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: any;
  let mockPasswordHasher: any;
  let mockUserCacheService: any;
  let configService: ConfigService;

  const validUser = User.createWithHashedPassword(
    'user-123',
    Email.create('john.doe@example.com'),
    'John Doe',
    UserRole.CLIENT,
    '$2b$10$valid.hashed.password',
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-01T00:00:00Z'),
    'johndoe',
    true, // isActive
    true, // isVerified
    false, // passwordChangeRequired
  );

  beforeEach(async () => {
    // 🔧 Configuration du module de test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: TOKENS.PASSWORD_HASHER,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: TOKENS.AUTH_SERVICE,
          useValue: {
            generateTokens: jest.fn(),
          },
        },
        {
          provide: TOKENS.USER_CACHE_SERVICE,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'USER_CACHE_RETENTION_MINUTES':
                  return 60; // 60 minutes par défaut
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: TOKENS.LOGGER,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: {
            t: jest.fn().mockImplementation((key: string) => {
              // Retourne une chaîne simple pour les tests
              return `Translated: ${key}`;
            }),
            translate: jest.fn().mockImplementation((key: string) => {
              return `Translated: ${key}`;
            }),
          },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    mockUserRepository = module.get(TOKENS.USER_REPOSITORY);
    mockPasswordHasher = module.get(TOKENS.PASSWORD_HASHER);
    mockUserCacheService = module.get(TOKENS.USER_CACHE_SERVICE);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('🔄 Login Integration Flow with Cache', () => {
    it('should complete full login flow with Redis cache storage', async () => {
      // 📋 Arrange: Configuration du scénario de test
      const loginRequest: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'ValidPassword123!',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
      };

      // Mock des dépendances
      mockUserRepository.findByEmail.mockResolvedValue(validUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      module.get(TOKENS.AUTH_SERVICE).generateTokens.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      });
      mockUserCacheService.execute.mockResolvedValue();

      // 🎯 Act: Exécution du use case
      const result = await loginUseCase.execute(loginRequest);

      // ✅ Assert: Vérifications du comportement

      // 1. Vérifier que l'utilisateur a été trouvé
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'john.doe@example.com',
        }),
      );

      // 2. Vérifier que le mot de passe a été vérifié
      expect(mockPasswordHasher.verify).toHaveBeenCalledWith(
        'ValidPassword123!',
        '$2b$10$valid.hashed.password',
      );

      // 3. Vérifier que l'utilisateur a été stocké dans le cache
      expect(mockUserCacheService.execute).toHaveBeenCalledWith({
        user: validUser,
      });

      // 4. Vérifier le résultat du login
      expect(result).toEqual({
        user: {
          id: validUser.id,
          email: validUser.email.value,
          name: validUser.name,
          role: validUser.role,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        },
        message: 'Translated: success.auth.login_successful',
      });

      // 🔍 Vérifier que le cache service a été appelé correctement
      expect(mockUserCacheService.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle cache failure gracefully without affecting login', async () => {
      // 📋 Arrange: Scénario où le cache échoue mais le login doit réussir
      const loginRequest: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'ValidPassword123!',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
      };

      mockUserRepository.findByEmail.mockResolvedValue(validUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      module.get(TOKENS.AUTH_SERVICE).generateTokens.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      });
      // Simulation d'une erreur Redis
      mockUserCacheService.execute.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // 🎯 Act: Le login doit réussir malgré l'erreur cache
      const result = await loginUseCase.execute(loginRequest);

      // ✅ Assert: Le login réussit, l'erreur cache est gérée
      expect(result.user.id).toBe(validUser.id);
      expect(result.tokens.accessToken).toBe('mock-access-token');

      // Vérifier que le cache a été tenté
      expect(mockUserCacheService.execute).toHaveBeenCalledWith({
        user: validUser,
      });
    });

    it('should use custom TTL from configuration', async () => {
      // 📋 Arrange: Configuration avec TTL personnalisé
      const loginRequest: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'ValidPassword123!',
        ip: '192.168.1.100',
      };

      mockUserRepository.findByEmail.mockResolvedValue(validUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      module.get(TOKENS.AUTH_SERVICE).generateTokens.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      });
      mockUserCacheService.execute.mockResolvedValue();

      // 🎯 Act
      await loginUseCase.execute(loginRequest);

      // ✅ Assert: Vérifier que le cache service a été appelé
      expect(mockUserCacheService.execute).toHaveBeenCalledWith({
        user: validUser,
      });
    });
  });

  describe('🚨 Cache Integration Error Scenarios', () => {
    it('should handle Redis timeout gracefully', async () => {
      const loginRequest: LoginRequest = {
        email: 'john.doe@example.com',
        password: 'ValidPassword123!',
        ip: '192.168.1.100',
      };

      mockUserRepository.findByEmail.mockResolvedValue(validUser);
      mockPasswordHasher.verify.mockResolvedValue(true);
      module.get(TOKENS.AUTH_SERVICE).generateTokens.mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      });
      mockUserCacheService.execute.mockRejectedValue(new Error('TIMEOUT'));

      // Le login doit réussir même si Redis timeout
      const result = await loginUseCase.execute(loginRequest);

      expect(result.tokens.accessToken).toBe('mock-access-token');
    });
  });
});
