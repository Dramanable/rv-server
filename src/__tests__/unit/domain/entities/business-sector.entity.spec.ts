/**
 * 🧪 BUSINESS SECTOR ENTITY - Tests TDD
 *
 * Tests unitaires pour l'entité BusinessSector
 * Valide la logique métier et les règles de validation
 */

import { BusinessSector } from "@domain/entities/business-sector.entity";
import { DomainError } from "@domain/exceptions/domain.exceptions";

describe("BusinessSector Entity", () => {
  // ═══════════════════════════════════════════════════════════════
  // 🏭 FACTORY METHODS TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("create", () => {
    it("should create a valid business sector", () => {
      // Given
      const name = "Technologie";
      const description =
        "Secteur des technologies de l'information et de la communication";
      const code = "TECH";
      const createdBy = "super-admin-id";

      // When
      const businessSector = BusinessSector.create(
        name,
        description,
        code,
        createdBy,
      );

      // Then
      expect(businessSector.name).toBe(name);
      expect(businessSector.description).toBe(description);
      expect(businessSector.code).toBe("TECH"); // Uppercase
      expect(businessSector.isActive).toBe(true);
      expect(businessSector.createdBy).toBe(createdBy);
      expect(businessSector.id).toMatch(/^bs_\d+_[a-z0-9]+$/);
      expect(businessSector.createdAt).toBeInstanceOf(Date);
      expect(businessSector.updatedAt).toBeUndefined();
    });

    it("should trim and uppercase code when creating", () => {
      // Given
      const name = "Finance";
      const description =
        "Services financiers et bancaires pour les entreprises";
      const code = "  finance  ";
      const createdBy = "super-admin-id";

      // When
      const businessSector = BusinessSector.create(
        name,
        description,
        code,
        createdBy,
      );

      // Then
      expect(businessSector.code).toBe("FINANCE");
    });

    it("should throw error for empty name", () => {
      // Given
      const name = "";
      const description = "Valid description";
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector name cannot be empty");
    });

    it("should throw error for short name", () => {
      // Given
      const name = "A";
      const description = "Valid description";
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector name must be at least 2 characters long");
    });

    it("should throw error for long name", () => {
      // Given
      const name = "A".repeat(101);
      const description = "Valid description";
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector name must be less than 100 characters");
    });

    it("should throw error for invalid name characters", () => {
      // Given
      const name = "Tech@#$%";
      const description = "Valid description";
      const code = "TECH";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector name contains invalid characters");
    });

    it("should throw error for empty description", () => {
      // Given
      const name = "Valid Name";
      const description = "";
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector description cannot be empty");
    });

    it("should throw error for short description", () => {
      // Given
      const name = "Valid Name";
      const description = "Short";
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(
        "Business sector description must be at least 10 characters long",
      );
    });

    it("should throw error for long description", () => {
      // Given
      const name = "Valid Name";
      const description = "A".repeat(501);
      const code = "VALID";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector description must be less than 500 characters");
    });

    it("should throw error for empty code", () => {
      // Given
      const name = "Valid Name";
      const description = "Valid description with enough characters";
      const code = "";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector code cannot be empty");
    });

    it("should throw error for short code", () => {
      // Given
      const name = "Valid Name";
      const description = "Valid description with enough characters";
      const code = "A";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector code must be at least 2 characters long");
    });

    it("should throw error for long code", () => {
      // Given
      const name = "Valid Name";
      const description = "Valid description with enough characters";
      const code = "A".repeat(21);
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("Business sector code must be less than 20 characters");
    });

    it("should throw error for invalid code characters", () => {
      // Given
      const name = "Valid Name";
      const description = "Valid description with enough characters";
      const code = "TECH-123@";
      const createdBy = "super-admin-id";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(
        "Business sector code must contain only uppercase letters, numbers and underscores",
      );
    });

    it("should throw error for empty createdBy", () => {
      // Given
      const name = "Valid Name";
      const description = "Valid description with enough characters";
      const code = "VALID";
      const createdBy = "";

      // When & Then
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow(DomainError);
      expect(() =>
        BusinessSector.create(name, description, code, createdBy),
      ).toThrow("CreatedBy user ID cannot be empty");
    });

    it("should accept valid code with underscores and numbers", () => {
      // Given
      const name = "Finance & Technology";
      const description = "Secteur financier avec technologies numériques";
      const code = "FIN_TECH_2024";
      const createdBy = "super-admin-id";

      // When
      const businessSector = BusinessSector.create(
        name,
        description,
        code,
        createdBy,
      );

      // Then
      expect(businessSector.code).toBe("FIN_TECH_2024");
    });
  });

  describe("restore", () => {
    it("should restore a business sector from persisted data", () => {
      // Given
      const id = "bs-123";
      const name = "Healthcare";
      const description = "Services de santé et médicaux";
      const code = "HEALTH";
      const isActive = true;
      const createdAt = new Date("2024-01-01");
      const createdBy = "super-admin-id";
      const updatedAt = new Date("2024-01-02");
      const updatedBy = "admin-id";

      // When
      const businessSector = BusinessSector.restore(
        id,
        name,
        description,
        code,
        isActive,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      );

      // Then
      expect(businessSector.id).toBe(id);
      expect(businessSector.name).toBe(name);
      expect(businessSector.description).toBe(description);
      expect(businessSector.code).toBe(code);
      expect(businessSector.isActive).toBe(isActive);
      expect(businessSector.createdAt).toBe(createdAt);
      expect(businessSector.createdBy).toBe(createdBy);
      expect(businessSector.updatedAt).toBe(updatedAt);
      expect(businessSector.updatedBy).toBe(updatedBy);
    });

    it("should restore a business sector without optional fields", () => {
      // Given
      const id = "bs-123";
      const name = "Education";
      const description = "Services éducatifs et formation";
      const code = "EDU";
      const isActive = false;
      const createdAt = new Date("2024-01-01");
      const createdBy = "super-admin-id";

      // When
      const businessSector = BusinessSector.restore(
        id,
        name,
        description,
        code,
        isActive,
        createdAt,
        createdBy,
      );

      // Then
      expect(businessSector.updatedAt).toBeUndefined();
      expect(businessSector.updatedBy).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 BUSINESS METHODS TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("update", () => {
    it("should update name and description", () => {
      // Given
      const originalSector = BusinessSector.create(
        "Technology",
        "Original tech description",
        "TECH",
        "super-admin-id",
      );
      const newName = "Information Technology";
      const newDescription =
        "Updated description for IT services and solutions";
      const updatedBy = "admin-id";

      // When
      const updatedSector = originalSector.update(
        newName,
        newDescription,
        updatedBy,
      );

      // Then
      expect(updatedSector.name).toBe(newName);
      expect(updatedSector.description).toBe(newDescription);
      expect(updatedSector.code).toBe(originalSector.code); // Code unchanged
      expect(updatedSector.id).toBe(originalSector.id); // ID unchanged
      expect(updatedSector.updatedBy).toBe(updatedBy);
      expect(updatedSector.updatedAt).toBeInstanceOf(Date);
      expect(updatedSector.updatedAt!.getTime()).toBeGreaterThanOrEqual(
        originalSector.createdAt.getTime(),
      );
    });

    it("should validate name when updating", () => {
      // Given
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        "super-admin-id",
      );

      // When & Then
      expect(() => sector.update("", "Valid description", "admin-id")).toThrow(
        "Business sector name cannot be empty",
      );
    });
  });

  describe("activate", () => {
    it("should activate a deactivated business sector", () => {
      // Given
      const sector = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Tech description",
        "TECH",
        false, // Inactive
        new Date("2024-01-01"),
        "super-admin-id",
      );
      const updatedBy = "admin-id";

      // When
      const activatedSector = sector.activate(updatedBy);

      // Then
      expect(activatedSector.isActive).toBe(true);
      expect(activatedSector.updatedBy).toBe(updatedBy);
      expect(activatedSector.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("deactivate", () => {
    it("should deactivate an active business sector", () => {
      // Given
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        "super-admin-id",
      );
      const updatedBy = "admin-id";

      // When
      const deactivatedSector = sector.deactivate(updatedBy);

      // Then
      expect(deactivatedSector.isActive).toBe(false);
      expect(deactivatedSector.updatedBy).toBe(updatedBy);
      expect(deactivatedSector.updatedAt).toBeInstanceOf(Date);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔍 QUERY METHODS TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("isCreatedBy", () => {
    it("should return true for matching creator", () => {
      // Given
      const createdBy = "super-admin-id";
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        createdBy,
      );

      // When & Then
      expect(sector.isCreatedBy(createdBy)).toBe(true);
    });

    it("should return false for different creator", () => {
      // Given
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        "super-admin-id",
      );

      // When & Then
      expect(sector.isCreatedBy("other-admin-id")).toBe(false);
    });
  });

  describe("canBeUsedForBusiness", () => {
    it("should return true for active sector", () => {
      // Given
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        "super-admin-id",
      );

      // When & Then
      expect(sector.canBeUsedForBusiness()).toBe(true);
    });

    it("should return false for inactive sector", () => {
      // Given
      const sector = BusinessSector.create(
        "Technology",
        "Tech description",
        "TECH",
        "super-admin-id",
      ).deactivate("admin-id");

      // When & Then
      expect(sector.canBeUsedForBusiness()).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 EQUALITY & COMPARISON TESTS
  // ═══════════════════════════════════════════════════════════════

  describe("equals", () => {
    it("should return true for same ID", () => {
      // Given
      const sector1 = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );
      const sector2 = BusinessSector.restore(
        "bs-123",
        "Different Name",
        "Different description",
        "DIFF",
        false,
        new Date(),
        "other-admin-id",
      );

      // When & Then
      expect(sector1.equals(sector2)).toBe(true);
    });

    it("should return false for different ID", () => {
      // Given
      const sector1 = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );
      const sector2 = BusinessSector.restore(
        "bs-456",
        "Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );

      // When & Then
      expect(sector1.equals(sector2)).toBe(false);
    });
  });

  describe("isSame", () => {
    it("should return true for same ID, name and code", () => {
      // Given
      const sector1 = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );
      const sector2 = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Different description",
        "TECH",
        false,
        new Date(),
        "other-admin-id",
      );

      // When & Then
      expect(sector1.isSame(sector2)).toBe(true);
    });

    it("should return false for different name", () => {
      // Given
      const sector1 = BusinessSector.restore(
        "bs-123",
        "Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );
      const sector2 = BusinessSector.restore(
        "bs-123",
        "Different Technology",
        "Tech description",
        "TECH",
        true,
        new Date(),
        "super-admin-id",
      );

      // When & Then
      expect(sector1.isSame(sector2)).toBe(false);
    });
  });
});
