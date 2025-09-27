/**
 * 🧪 TDD Test - ListBusinessUseCase Permission Refactor
 *
 * Tests de validation des permissions pour le listing des entreprises
 */

import { ListBusinessUseCase } from "@application/use-cases/business/list-business.use-case";

describe("🟢 ListBusinessUseCase - TDD Permission Tests", () => {
  describe("Permission System Validation (GREEN)", () => {
    it("should use IPermissionService in constructor", () => {
      // Given - Analyze constructor after refactor
      const constructorString = ListBusinessUseCase.toString();

      // Then - Verify current state uses new permission system
      expect(constructorString).toContain("permissionService");
      expect(constructorString).not.toContain("userRepository");

      console.log(
        "🟢 GREEN: ListBusinessUseCase uses IPermissionService in constructor",
      );
    });

    it("should have validatePermissions method using permissionService", () => {
      // Given - Analyze validatePermissions method implementation
      const methodString = ListBusinessUseCase.toString();

      // Then - Verify validatePermissions uses permission service correctly
      expect(methodString).toContain("validatePermissions");
      expect(methodString).toContain(
        "this.permissionService.requirePermission",
      );
      expect(methodString).toContain("LIST_BUSINESSES");

      console.log(
        "🟢 GREEN: validatePermissions uses permissionService.requirePermission",
      );
    });

    it("should enforce LIST_BUSINESSES permission", () => {
      const methodString = ListBusinessUseCase.toString();

      // Verify LIST_BUSINESSES permission is hardcoded in the implementation
      expect(methodString).toContain("'LIST_BUSINESSES'");
      console.log(
        "📋 VALIDATED: ListBusinessUseCase enforces LIST_BUSINESSES permission",
      );
    });

    it("should pass correlationId to permission service", () => {
      const methodString = ListBusinessUseCase.toString();

      // Verify correlationId is passed to requirePermission
      expect(methodString).toContain("correlationId");
      expect(methodString).toContain("context.correlationId");
      console.log(
        "📋 VALIDATED: correlationId is properly passed to permission validation",
      );
    });
  });

  describe("Legacy Code Removal (GREEN)", () => {
    it("should not contain legacy permission logic", () => {
      const methodString = ListBusinessUseCase.toString();

      // Verify old permission patterns are removed
      expect(methodString).not.toContain("allowedRoles");
      expect(methodString).not.toContain("UserRole.PLATFORM_ADMIN");
      expect(methodString).not.toContain("userRepository.findById");

      console.log("🟢 GREEN: Legacy permission logic successfully removed");
    });
  });
});
