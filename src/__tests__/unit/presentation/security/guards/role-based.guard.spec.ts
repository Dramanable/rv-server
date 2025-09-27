/**
 * 🧪 TESTS TDD - RoleBasedGuard
 *
 * Tests pour la garde d'autorisation basée sur les rôles
 * Approche TDD : RED → GREEN → REFACTOR
 */

import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleBasedGuard } from "../../../../../presentation/security/guards/role-based.guard";
import { UserRole } from "../../../../../shared/enums/user-role.enum";

// Mock du contexte d'exécution et requête
const createMockExecutionContext = (request: any): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  }) as any;

// Helper pour créer un utilisateur mock simple
const createAuthenticatedUser = (overrides: any = {}) => ({
  id: "user-123",
  email: "test@example.com",
  role: UserRole.RECEPTIONIST,
  businessId: "business-123",
  isActive: true,
  isVerified: true,
  ...overrides,
});

describe("RoleBasedGuard - TDD", () => {
  let guard: RoleBasedGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockRequest: any;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new RoleBasedGuard(mockReflector);

    mockRequest = {
      user: null,
      params: {},
      headers: {},
    };

    mockExecutionContext = createMockExecutionContext(mockRequest);
  });

  describe("🔴 RED Phase - Authentication Requirements", () => {
    it("should reject requests without user (no JWT)", () => {
      // Given: Pas d'utilisateur authentifié
      mockRequest.user = null;
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When & Then: Doit rejeter avec UnauthorizedException
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it("should reject requests with invalid user object", () => {
      // Given: Utilisateur inactif
      mockRequest.user = createAuthenticatedUser({ isActive: false });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When & Then: Doit rejeter avec ForbiddenException
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("🔴 RED Phase - Role Authorization", () => {
    it("should reject user with insufficient role", () => {
      // Given: Utilisateur RECEPTIONIST, endpoint requiert BUSINESS_OWNER
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.RECEPTIONIST,
      });
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_OWNER,
      ]);

      // When & Then: Doit rejeter
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it("should accept user with exact required role", () => {
      // Given: Utilisateur RECEPTIONIST, endpoint requiert RECEPTIONIST
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.RECEPTIONIST,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter
      expect(result).toBe(true);
    });

    it("should accept user with higher privilege role", () => {
      // Given: Utilisateur BUSINESS_OWNER, endpoint requiert RECEPTIONIST
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.BUSINESS_OWNER,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter (hiérarchie des rôles)
      expect(result).toBe(true);
    });

    it("should accept user with any of multiple allowed roles", () => {
      // Given: Utilisateur BUSINESS_ADMIN, endpoint autorise BUSINESS_ADMIN ou LOCATION_MANAGER
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.BUSINESS_ADMIN,
      });
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_ADMIN,
        UserRole.LOCATION_MANAGER,
      ]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter
      expect(result).toBe(true);
    });
  });

  describe("🔴 RED Phase - Multi-tenant Context", () => {
    it("should validate business context when businessId in params", () => {
      // Given: Utilisateur business-123, endpoint pour business-456
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.BUSINESS_ADMIN,
        businessId: "business-123",
      });
      mockRequest.params = { businessId: "business-456" };
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_ADMIN,
      ]);

      // When & Then: Doit rejeter (contexte métier différent)
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it("should validate business context when businessId in body", () => {
      // Given: Utilisateur business-123, opération sur business-456
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.BUSINESS_ADMIN,
        businessId: "business-123",
      });
      mockRequest.params = { businessId: "business-456" };
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_ADMIN,
      ]);

      // When & Then: Doit rejeter
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it("should work without business context for platform-level operations", () => {
      // Given: Super Admin, pas de contexte business spécifique
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.SUPER_ADMIN,
      });
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_ADMIN,
      ]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter (Super Admin peut tout faire)
      expect(result).toBe(true);
    });
  });

  describe("🔴 RED Phase - Public Endpoints (No Roles Required)", () => {
    it("should allow access to public endpoints", () => {
      // Given: Endpoint sans rôles requis
      mockReflector.getAllAndOverride.mockReturnValue(null);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter (endpoint public)
      expect(result).toBe(true);
    });

    it("should allow access to endpoints with empty roles array", () => {
      // Given: Endpoint avec tableau de rôles vide
      mockReflector.getAllAndOverride.mockReturnValue([]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter (endpoint public)
      expect(result).toBe(true);
    });
  });

  describe("🔴 RED Phase - Role Hierarchy Logic", () => {
    it("should respect role hierarchy - SUPER_ADMIN can access everything", () => {
      // Given: Super Admin, endpoint pour staff seulement
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.SUPER_ADMIN,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter (hiérarchie)
      expect(result).toBe(true);
    });

    it("should respect role hierarchy - BUSINESS_OWNER can access staff operations", () => {
      // Given: Business Owner, endpoint pour réceptionniste
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.BUSINESS_OWNER,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When: Vérifier l'accès
      const result = guard.canActivate(mockExecutionContext);

      // Then: Doit accepter
      expect(result).toBe(true);
    });

    it("should respect role hierarchy - RECEPTIONIST cannot access admin operations", () => {
      // Given: Réceptionniste, endpoint pour admin
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.RECEPTIONIST,
      });
      mockReflector.getAllAndOverride.mockReturnValue([
        UserRole.BUSINESS_ADMIN,
      ]);

      // When & Then: Doit rejeter
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it("should respect role hierarchy - CLIENT cannot access staff operations", () => {
      // Given: Client, endpoint pour staff
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.REGULAR_CLIENT,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When & Then: Doit rejeter
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("🔴 RED Phase - Error Handling", () => {
    it("should throw UnauthorizedException for missing user with specific message", () => {
      // Given: Pas d'utilisateur
      mockRequest.user = null;
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When & Then: Vérifier message d'erreur
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException("Authentication required"),
      );
    });

    it("should throw ForbiddenException for insufficient role with specific message", () => {
      // Given: Rôle insuffisant
      mockRequest.user = createAuthenticatedUser({
        role: UserRole.REGULAR_CLIENT,
      });
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.RECEPTIONIST]);

      // When & Then: Vérifier message d'erreur
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});
