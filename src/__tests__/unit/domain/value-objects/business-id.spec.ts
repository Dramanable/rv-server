import { BusinessId } from "@domain/value-objects/business-id.value-object";

/**
 * 🧪 BusinessId Value Object Unit Tests
 * ✅ Tests unitaires seulement
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles
 */
describe("BusinessId", () => {
  describe("create", () => {
    it("should create a valid business ID with UUID v4", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const businessId = BusinessId.create(validUuid);

      expect(businessId).toBeInstanceOf(BusinessId);
      expect(businessId.getValue()).toBe(validUuid);
    });

    it("should throw error for empty ID", () => {
      expect(() => BusinessId.create("")).toThrow("BusinessId cannot be empty");
    });

    it("should throw error for whitespace only", () => {
      expect(() => BusinessId.create("   ")).toThrow(
        "BusinessId cannot be empty",
      );
    });

    it("should throw error for invalid UUID format", () => {
      expect(() => BusinessId.create("invalid-uuid")).toThrow(
        "BusinessId must be a valid UUID v4",
      );
      expect(() => BusinessId.create("123456789")).toThrow(
        "BusinessId must be a valid UUID v4",
      );
      expect(() => BusinessId.create("not-a-uuid-at-all")).toThrow(
        "BusinessId must be a valid UUID v4",
      );
    });

    it("should throw error for UUID v1 (not v4)", () => {
      const uuidV1 = "550e8400-e29b-11d4-a716-446655440000"; // UUID v1
      expect(() => BusinessId.create(uuidV1)).toThrow(
        "BusinessId must be a valid UUID v4",
      );
    });

    it("should accept valid UUID v4", () => {
      const uuidV4 = "550e8400-e29b-41d4-a716-446655440000"; // UUID v4
      expect(() => BusinessId.create(uuidV4)).not.toThrow();
    });
  });

  describe("generate", () => {
    it("should generate a valid UUID v4", () => {
      const businessId = BusinessId.generate();

      expect(businessId).toBeInstanceOf(BusinessId);
      expect(businessId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("should generate unique IDs", () => {
      const id1 = BusinessId.generate();
      const id2 = BusinessId.generate();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });

    it("should generate multiple unique IDs", () => {
      const ids = Array.from({ length: 10 }, () => BusinessId.generate());
      const uniqueIds = new Set(ids.map((id) => id.getValue()));

      expect(uniqueIds.size).toBe(10);
    });
  });

  describe("getValue", () => {
    it("should return the UUID string", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const businessId = BusinessId.create(uuid);

      expect(businessId.getValue()).toBe(uuid);
    });
  });

  describe("equals", () => {
    it("should return true for same UUID", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id1 = BusinessId.create(uuid);
      const id2 = BusinessId.create(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different UUIDs", () => {
      const id1 = BusinessId.create("550e8400-e29b-41d4-a716-446655440000");
      const id2 = BusinessId.create("550e8400-e29b-41d4-a716-446655440001");

      expect(id1.equals(id2)).toBe(false);
    });

    it("should be case insensitive", () => {
      const id1 = BusinessId.create("550e8400-e29b-41d4-a716-446655440000");
      const id2 = BusinessId.create("550E8400-E29B-41D4-A716-446655440000");

      expect(id1.equals(id2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the UUID string", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const businessId = BusinessId.create(uuid);

      expect(businessId.toString()).toBe(uuid);
    });
  });
});
