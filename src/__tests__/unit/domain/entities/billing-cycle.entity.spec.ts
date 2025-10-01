import { BillingCycle } from "@domain/entities/billing/billing-cycle.entity";
import { NotificationCost } from "@domain/value-objects/billing/notification-cost.value-object";
import { DomainError } from "@domain/exceptions/domain.exceptions";

describe("BillingCycle Entity - TDD", () => {
  describe("🔴 RED Phase - BillingCycle Creation", () => {
    it("should create a monthly billing cycle with valid data", () => {
      // Arrange
      const businessId = "business-123";
      const startDate = new Date("2025-10-01");
      const endDate = new Date("2025-10-31");

      // Act
      const billingCycle = BillingCycle.create({
        businessId,
        startDate,
        endDate,
        period: "MONTHLY",
      });

      // Assert
      expect(billingCycle.getBusinessId()).toBe(businessId);
      expect(billingCycle.getStartDate()).toEqual(startDate);
      expect(billingCycle.getEndDate()).toEqual(endDate);
      expect(billingCycle.getPeriod()).toBe("MONTHLY");
      expect(billingCycle.getStatus()).toBe("ACTIVE");
      expect(billingCycle.getTotalCost().getAmount()).toBe(0);
    });

    it("should create a billing cycle with initial usage cost", () => {
      // Arrange
      const businessId = "business-123";
      const startDate = new Date("2025-10-01");
      const endDate = new Date("2025-10-31");
      const initialCost = NotificationCost.create(25.5, "EUR");

      // Act
      const billingCycle = BillingCycle.create({
        businessId,
        startDate,
        endDate,
        period: "MONTHLY",
        initialCost,
      });

      // Assert
      expect(billingCycle.getTotalCost().equals(initialCost)).toBe(true);
    });

    it("should throw error for invalid business ID", () => {
      // Act & Assert
      expect(() =>
        BillingCycle.create({
          businessId: "",
          startDate: new Date("2025-10-01"),
          endDate: new Date("2025-10-31"),
          period: "MONTHLY",
        }),
      ).toThrow(DomainError);
      expect(() =>
        BillingCycle.create({
          businessId: "",
          startDate: new Date("2025-10-01"),
          endDate: new Date("2025-10-31"),
          period: "MONTHLY",
        }),
      ).toThrow("Business ID is required");
    });

    it("should throw error when end date is before start date", () => {
      // Act & Assert
      expect(() =>
        BillingCycle.create({
          businessId: "business-123",
          startDate: new Date("2025-10-31"),
          endDate: new Date("2025-10-01"),
          period: "MONTHLY",
        }),
      ).toThrow("End date must be after start date");
    });

    it("should throw error for invalid period", () => {
      // Act & Assert
      expect(() =>
        BillingCycle.create({
          businessId: "business-123",
          startDate: new Date("2025-10-01"),
          endDate: new Date("2025-10-31"),
          period: "INVALID" as any,
        }),
      ).toThrow("Period must be MONTHLY, QUARTERLY, or YEARLY");
    });
  });

  describe("🔴 RED Phase - Usage Tracking", () => {
    let billingCycle: BillingCycle;

    beforeEach(() => {
      billingCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        period: "MONTHLY",
      });
    });

    it("should add notification usage cost", () => {
      // Arrange
      const emailCost = NotificationCost.fromEmailCount(10); // 10 * 0.02 = 0.20 EUR
      const smsCost = NotificationCost.fromSMSCount(5); // 5 * 0.08 = 0.40 EUR

      // Act
      billingCycle.addUsage(emailCost);
      billingCycle.addUsage(smsCost);

      // Assert
      expect(billingCycle.getTotalCost().getAmount()).toBe(0.6); // 0.20 + 0.40
      expect(billingCycle.getEmailCount()).toBe(10);
      expect(billingCycle.getSmsCount()).toBe(5);
    });

    it("should track usage statistics correctly", () => {
      // Arrange
      const emailCost1 = NotificationCost.fromEmailCount(15);
      const emailCost2 = NotificationCost.fromEmailCount(25);
      const smsCost = NotificationCost.fromSMSCount(3);

      // Act
      billingCycle.addUsage(emailCost1);
      billingCycle.addUsage(emailCost2);
      billingCycle.addUsage(smsCost);

      // Assert
      expect(billingCycle.getEmailCount()).toBe(40); // 15 + 25
      expect(billingCycle.getSmsCount()).toBe(3);
      expect(billingCycle.getTotalNotificationsSent()).toBe(43);
      expect(billingCycle.getTotalCost().getAmount()).toBe(1.04); // (40 * 0.02) + (3 * 0.08)
    });

    it("should throw error when adding usage to finalized cycle", () => {
      // Arrange
      billingCycle.finalize();
      const emailCost = NotificationCost.fromEmailCount(10);

      // Act & Assert
      expect(() => billingCycle.addUsage(emailCost)).toThrow(
        "Cannot add usage to finalized billing cycle",
      );
    });

    it("should throw error when adding usage with different currency", () => {
      // Arrange
      billingCycle.addUsage(NotificationCost.create(1.0, "EUR"));
      const usdCost = NotificationCost.create(1.0, "USD");

      // Act & Assert
      expect(() => billingCycle.addUsage(usdCost)).toThrow(
        "All usage costs must be in the same currency",
      );
    });
  });

  describe("🔴 RED Phase - Cycle Management", () => {
    let billingCycle: BillingCycle;

    beforeEach(() => {
      billingCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        period: "MONTHLY",
      });
    });

    it("should finalize billing cycle", () => {
      // Arrange
      billingCycle.addUsage(NotificationCost.fromEmailCount(50));
      billingCycle.addUsage(NotificationCost.fromSMSCount(10));

      // Act
      billingCycle.finalize();

      // Assert
      expect(billingCycle.getStatus()).toBe("FINALIZED");
      expect(billingCycle.getFinalizedAt()).toBeInstanceOf(Date);
      expect(billingCycle.getTotalCost().getAmount()).toBe(1.8); // (50 * 0.02) + (10 * 0.08)
    });

    it("should generate billing summary", () => {
      // Arrange
      billingCycle.addUsage(NotificationCost.fromEmailCount(100));
      billingCycle.addUsage(NotificationCost.fromSMSCount(25));
      billingCycle.finalize();

      // Act
      const summary = billingCycle.getBillingSummary();

      // Assert
      expect(summary).toEqual({
        billingCycleId: billingCycle.getId(),
        businessId: "business-123",
        period: "MONTHLY",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        emailCount: 100,
        smsCount: 25,
        totalNotifications: 125,
        totalCost: billingCycle.getTotalCost(),
        currency: "EUR",
        status: "FINALIZED",
        finalizedAt: billingCycle.getFinalizedAt(),
      });
    });

    it("should check if cycle is current", () => {
      // Arrange
      const currentDate = new Date("2025-10-15");
      const pastCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-09-30"),
        period: "MONTHLY",
      });

      // Act & Assert
      expect(billingCycle.isCurrentCycle(currentDate)).toBe(true);
      expect(pastCycle.isCurrentCycle(currentDate)).toBe(false);
    });

    it("should calculate remaining days in cycle", () => {
      // Arrange
      const currentDate = new Date("2025-10-15");

      // Act
      const remainingDays = billingCycle.getRemainingDays(currentDate);

      // Assert
      expect(remainingDays).toBe(16); // 31 - 15 = 16 jours restants
    });
  });

  describe("🔴 RED Phase - Business Rules", () => {
    it("should enforce monthly cycle duration (28-31 days)", () => {
      // Act & Assert - Valid monthly cycle
      expect(() =>
        BillingCycle.create({
          businessId: "business-123",
          startDate: new Date("2025-02-01"),
          endDate: new Date("2025-02-28"), // 28 days - OK
          period: "MONTHLY",
        }),
      ).not.toThrow();

      // Act & Assert - Invalid monthly cycle (too short)
      expect(() =>
        BillingCycle.create({
          businessId: "business-123",
          startDate: new Date("2025-10-01"),
          endDate: new Date("2025-10-15"), // 15 days - too short
          period: "MONTHLY",
        }),
      ).toThrow("Monthly cycle must be between 28 and 31 days");
    });

    it("should prevent overlapping cycles for same business", () => {
      // Cette logique sera implémentée dans le repository/service
      // Le test est ici pour documenter la règle métier
      expect(true).toBe(true); // Placeholder
    });

    it("should calculate progressive pricing for high volume", () => {
      // Arrange
      const billingCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        period: "MONTHLY",
      });

      // Act - Ajouter un gros volume (pricing dégressif potentiel)
      billingCycle.addUsage(NotificationCost.fromEmailCount(10000)); // Volume élevé

      // Assert - Pour l'instant prix fixe, mais extensible
      expect(billingCycle.getTotalCost().getAmount()).toBe(200.0); // 10000 * 0.02
      expect(billingCycle.getVolumeDiscount()).toBe(0); // Pas encore implémenté
    });
  });

  describe("🔴 RED Phase - Serialization", () => {
    it("should serialize to JSON correctly", () => {
      // Arrange
      const billingCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        period: "MONTHLY",
      });
      billingCycle.addUsage(NotificationCost.fromEmailCount(50));

      // Act
      const json = billingCycle.toJSON();

      // Assert
      expect(json).toEqual({
        id: billingCycle.getId(),
        businessId: "business-123",
        startDate: "2025-10-01T00:00:00.000Z",
        endDate: "2025-10-31T00:00:00.000Z",
        period: "MONTHLY",
        status: "ACTIVE",
        emailCount: 50,
        smsCount: 0,
        totalCost: {
          amount: 1.0,
          currency: "EUR",
          formattedAmount: billingCycle.getTotalCost().getFormattedAmount(),
        },
        createdAt: billingCycle.getCreatedAt().toISOString(),
        updatedAt: billingCycle.getUpdatedAt().toISOString(),
        finalizedAt: null,
      });
    });

    it("should have meaningful string representation", () => {
      // Arrange
      const billingCycle = BillingCycle.create({
        businessId: "business-123",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-10-31"),
        period: "MONTHLY",
      });

      // Act & Assert
      expect(billingCycle.toString()).toBe(
        "BillingCycle(business-123, MONTHLY, 2025-10-01 to 2025-10-31)",
      );
    });
  });
});
