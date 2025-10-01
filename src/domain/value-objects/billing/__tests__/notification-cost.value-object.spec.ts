import { NotificationCost } from "../notification-cost.value-object";
import { DomainError } from "../../../exceptions/domain.exceptions";

describe("NotificationCost Value Object", () => {
  describe("create", () => {
    it("should create valid notification cost", () => {
      // Arrange & Act
      const cost = NotificationCost.create(0.02, "EUR");

      // Assert
      expect(cost.getAmount()).toBe(0.02);
      expect(cost.getCurrency()).toBe("EUR");
      expect(cost.getFormattedAmount()).toBe("0,02 €");
    });

    it("should create zero cost", () => {
      // Arrange & Act
      const cost = NotificationCost.zero("EUR");

      // Assert
      expect(cost.getAmount()).toBe(0);
      expect(cost.isZero()).toBe(true);
    });

    it("should throw error for negative amount", () => {
      // Act & Assert
      expect(() => NotificationCost.create(-0.01, "EUR")).toThrow(DomainError);
      expect(() => NotificationCost.create(-0.01, "EUR")).toThrow(
        "Notification cost cannot be negative",
      );
    });

    it("should throw error for invalid currency", () => {
      // Act & Assert
      expect(() => NotificationCost.create(0.02, "GBP" as any)).toThrow(
        "Currency must be EUR or USD",
      );
    });

    it("should throw error for more than 2 decimal places", () => {
      // Act & Assert
      expect(() => NotificationCost.create(0.001, "EUR")).toThrow(
        "Cost must have maximum 2 decimal places",
      );
    });
  });

  describe("factory methods", () => {
    it("should create cost from email count with default price", () => {
      // Arrange & Act
      const cost = NotificationCost.fromEmailCount(10);

      // Assert
      expect(cost.getAmount()).toBe(0.2); // 10 * 0.02
      expect(cost.getCurrency()).toBe("EUR");
    });

    it("should create cost from email count with custom price", () => {
      // Arrange & Act
      const cost = NotificationCost.fromEmailCount(5, 0.015);

      // Assert
      expect(cost.getAmount()).toBe(0.075); // 5 * 0.015
    });

    it("should create cost from SMS count with default price", () => {
      // Arrange & Act
      const cost = NotificationCost.fromSMSCount(3);

      // Assert
      expect(cost.getAmount()).toBe(0.24); // 3 * 0.08
    });

    it("should create cost from SMS count with custom price", () => {
      // Arrange & Act
      const cost = NotificationCost.fromSMSCount(2, 0.06);

      // Assert
      expect(cost.getAmount()).toBe(0.12); // 2 * 0.06
    });
  });

  describe("operations", () => {
    it("should add costs with same currency", () => {
      // Arrange
      const cost1 = NotificationCost.create(0.02, "EUR");
      const cost2 = NotificationCost.create(0.08, "EUR");

      // Act
      const total = cost1.add(cost2);

      // Assert
      expect(total.getAmount()).toBe(0.1);
      expect(total.getCurrency()).toBe("EUR");
    });

    it("should throw error when adding costs with different currencies", () => {
      // Arrange
      const eurCost = NotificationCost.create(0.02, "EUR");
      const usdCost = NotificationCost.create(0.02, "USD");

      // Act & Assert
      expect(() => eurCost.add(usdCost)).toThrow(
        "Cannot add costs with different currencies",
      );
    });

    it("should multiply cost by factor", () => {
      // Arrange
      const cost = NotificationCost.create(0.08, "EUR");

      // Act
      const multiplied = cost.multiply(5);

      // Assert
      expect(multiplied.getAmount()).toBe(0.4);
      expect(multiplied.getCurrency()).toBe("EUR");
    });

    it("should throw error when multiplying by negative factor", () => {
      // Arrange
      const cost = NotificationCost.create(0.08, "EUR");

      // Act & Assert
      expect(() => cost.multiply(-1)).toThrow("Factor cannot be negative");
    });
  });

  describe("comparison", () => {
    it("should identify equal costs", () => {
      // Arrange
      const cost1 = NotificationCost.create(0.02, "EUR");
      const cost2 = NotificationCost.create(0.02, "EUR");

      // Act & Assert
      expect(cost1.equals(cost2)).toBe(true);
    });

    it("should identify different amounts as not equal", () => {
      // Arrange
      const cost1 = NotificationCost.create(0.02, "EUR");
      const cost2 = NotificationCost.create(0.08, "EUR");

      // Act & Assert
      expect(cost1.equals(cost2)).toBe(false);
    });

    it("should identify different currencies as not equal", () => {
      // Arrange
      const eurCost = NotificationCost.create(0.02, "EUR");
      const usdCost = NotificationCost.create(0.02, "USD");

      // Act & Assert
      expect(eurCost.equals(usdCost)).toBe(false);
    });

    it("should identify zero costs", () => {
      // Arrange
      const zeroCost = NotificationCost.zero("EUR");
      const nonZeroCost = NotificationCost.create(0.01, "EUR");

      // Act & Assert
      expect(zeroCost.isZero()).toBe(true);
      expect(nonZeroCost.isZero()).toBe(false);
    });
  });

  describe("formatting", () => {
    it("should format EUR currency correctly", () => {
      // Arrange
      const cost = NotificationCost.create(1.5, "EUR");

      // Act & Assert
      expect(cost.getFormattedAmount()).toBe("1,50 €");
      expect(cost.toString()).toBe("1,50 €");
    });

    it("should format USD currency correctly", () => {
      // Arrange
      const cost = NotificationCost.create(1.5, "USD");

      // Act & Assert
      expect(cost.getFormattedAmount()).toBe("1,50 $US");
      expect(cost.toString()).toBe("1,50 $US");
    });

    it("should format small amounts correctly", () => {
      // Arrange
      const cost = NotificationCost.create(0.01, "EUR");

      // Act & Assert
      expect(cost.getFormattedAmount()).toBe("0,01 €");
    });

    it("should format zero amounts correctly", () => {
      // Arrange
      const cost = NotificationCost.zero("EUR");

      // Act & Assert
      expect(cost.getFormattedAmount()).toBe("0,00 €");
    });
  });
});
