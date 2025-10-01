import {
  InvalidFormatError,
  RequiredValueError,
  ValueTooLongError,
  ValueTooShortError,
} from "@domain/exceptions/value-object.exceptions";
import { BusinessName } from "@domain/value-objects/business-name.value-object";

describe("BusinessName", () => {
  describe("create", () => {
    it("should create a valid business name", () => {
      const name = BusinessName.create("Tech Solutions Inc.");
      expect(name.getValue()).toBe("Tech Solutions Inc.");
    });

    it("should trim whitespace", () => {
      const name = BusinessName.create("  Business Name  ");
      expect(name.getValue()).toBe("Business Name");
    });

    it("should throw error for empty name", () => {
      expect(() => BusinessName.create("")).toThrow(RequiredValueError);
      expect(() => BusinessName.create("   ")).toThrow(RequiredValueError);
    });

    it("should throw error for name too short", () => {
      expect(() => BusinessName.create("A")).toThrow(ValueTooShortError);
    });

    it("should throw error for name too long", () => {
      const longName = "A".repeat(101);
      expect(() => BusinessName.create(longName)).toThrow(ValueTooLongError);
    });

    it("should throw error for forbidden characters", () => {
      expect(() => BusinessName.create("Business<Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business>Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business{Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business}Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business[Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business]Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business\\Name")).toThrow(
        InvalidFormatError,
      );
      expect(() => BusinessName.create("Business/Name")).toThrow(
        InvalidFormatError,
      );
    });

    it("should allow common business name formats", () => {
      expect(() => BusinessName.create("Business & Co")).not.toThrow();
      expect(() => BusinessName.create("Business Ltd.")).not.toThrow();
    });
  });

  describe("getValue", () => {
    it("should return the business name value", () => {
      const name = BusinessName.create("Test Business");
      expect(name.getValue()).toBe("Test Business");
    });
  });

  describe("equals", () => {
    it("should return true for equal business names", () => {
      const name1 = BusinessName.create("Same Business");
      const name2 = BusinessName.create("Same Business");
      expect(name1.equals(name2)).toBe(true);
    });

    it("should return false for different business names", () => {
      const name1 = BusinessName.create("Business One");
      const name2 = BusinessName.create("Business Two");
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
