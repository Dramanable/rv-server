import { Subscription } from "@domain/entities/billing/subscription.entity";
import { SubscriptionPlan } from "@domain/value-objects/billing/subscription-plan.value-object";
import { DomainError } from "@domain/exceptions/domain.exceptions";

describe("Subscription Entity", () => {
  const mockBusinessId = "business-123";
  const mockUserId = "user-456";

  describe("🔴 RED - Subscription Creation", () => {
    it("should create active subscription without trial", () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });

      // Assert
      expect(subscription.getId()).toBeDefined();
      expect(subscription.getBusinessId()).toBe(mockBusinessId);
      expect(subscription.getPlan().getType()).toBe("PREMIUM");
      expect(subscription.getStatus()).toBe("ACTIVE");
      expect(subscription.getBillingFrequency()).toBe("MONTHLY");
      expect(subscription.getCreatedBy()).toBe(mockUserId);
      expect(subscription.isActive()).toBe(true);
      expect(subscription.isInTrial()).toBe(false);
    });

    it("should create trial subscription with trial period", () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        trialDays: 14,
        createdBy: mockUserId,
      });

      // Assert
      expect(subscription.getStatus()).toBe("TRIALING");
      expect(subscription.isInTrial()).toBe(true);
      expect(subscription.getTrialEndDate()).toBeDefined();
      expect(subscription.getTrialEndDate()!.getTime()).toBeGreaterThan(
        new Date().getTime(),
      );
    });

    it("should create yearly subscription with correct end date", () => {
      // Arrange
      const plan = SubscriptionPlan.enterprise();
      const startDate = new Date("2025-01-01");

      // Act
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "YEARLY",
        startDate: startDate,
        createdBy: mockUserId,
      });

      // Assert
      expect(subscription.getBillingFrequency()).toBe("YEARLY");
      expect(subscription.getStartDate()).toEqual(startDate);
      expect(subscription.getEndDate().getFullYear()).toBe(2026); // +1 an
    });

    it("should initialize usage counters to zero", () => {
      // Arrange
      const plan = SubscriptionPlan.freemium();

      // Act
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });

      // Assert
      const usage = subscription.getCurrentPeriodUsage();
      expect(usage.notifications).toBe(0);
      expect(usage.businesses).toBe(0);
      expect(usage.staff).toBe(0);
      expect(usage.services).toBe(0);
    });
  });

  describe("🔴 RED - Subscription Lifecycle", () => {
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.premium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });
    });

    it("should suspend active subscription", () => {
      // Act
      subscription.suspend(mockUserId);

      // Assert
      expect(subscription.getStatus()).toBe("SUSPENDED");
      expect(subscription.getUpdatedBy()).toBe(mockUserId);
      expect(subscription.isActive()).toBe(false);
    });

    it("should cancel subscription with immediate end", () => {
      // Act
      subscription.cancel(mockUserId, true);

      // Assert
      expect(subscription.getStatus()).toBe("CANCELED");
      expect(subscription.getEndDate().getTime()).toBeLessThanOrEqual(
        new Date().getTime(),
      );
    });

    it("should cancel subscription without immediate end", () => {
      // Arrange
      const originalEndDate = subscription.getEndDate();

      // Act
      subscription.cancel(mockUserId, false);

      // Assert
      expect(subscription.getStatus()).toBe("CANCELED");
      expect(subscription.getEndDate()).toEqual(originalEndDate);
    });

    it("should renew active subscription", () => {
      // Arrange
      const originalEndDate = subscription.getEndDate();

      // Act
      subscription.renew(mockUserId);

      // Assert
      expect(subscription.getStatus()).toBe("ACTIVE");
      expect(subscription.getEndDate().getTime()).toBeGreaterThan(
        originalEndDate.getTime(),
      );
      expect(subscription.getCurrentPeriodUsage().notifications).toBe(0); // Reset
    });

    it("should throw error when trying to activate already active subscription", () => {
      // Act & Assert
      expect(() => subscription.activate(mockUserId)).toThrow(
        "Subscription is already active",
      );
    });

    it("should throw error when trying to suspend already suspended subscription", () => {
      // Arrange
      subscription.suspend(mockUserId);

      // Act & Assert
      expect(() => subscription.suspend(mockUserId)).toThrow(
        "Subscription is already suspended",
      );
    });
  });

  describe("🔴 RED - Usage Recording", () => {
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.premium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });
    });

    it("should record notification usage", () => {
      // Act
      subscription.recordNotificationUsage(50);
      subscription.recordNotificationUsage(25);

      // Assert
      expect(subscription.getCurrentPeriodUsage().notifications).toBe(75);
    });

    it("should record business usage", () => {
      // Act
      subscription.recordBusinessUsage(2);

      // Assert
      expect(subscription.getCurrentPeriodUsage().businesses).toBe(2);
    });

    it("should record staff usage", () => {
      // Act
      subscription.recordStaffUsage(10);

      // Assert
      expect(subscription.getCurrentPeriodUsage().staff).toBe(10);
    });

    it("should record service usage", () => {
      // Act
      subscription.recordServiceUsage(25);

      // Assert
      expect(subscription.getCurrentPeriodUsage().services).toBe(25);
    });

    it("should throw error for negative notification usage", () => {
      // Act & Assert
      expect(() => subscription.recordNotificationUsage(-10)).toThrow(
        "Notification usage count cannot be negative",
      );
    });
  });

  describe("🔴 RED - Financial Calculations", () => {
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.premium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });
    });

    it("should calculate current period cost without overage", () => {
      // Arrange
      subscription.recordNotificationUsage(500); // Under limit (1000)

      // Act
      const cost = subscription.calculateCurrentPeriodCost();

      // Assert
      expect(cost.getAmount()).toBe(29.99); // Base plan cost only
    });

    it("should calculate current period cost with overage", () => {
      // Arrange
      subscription.recordNotificationUsage(1200); // Over limit by 200

      // Act
      const cost = subscription.calculateCurrentPeriodCost();

      // Assert
      expect(cost.getAmount()).toBe(35.99); // 29.99 + (200 * 0.03)
    });

    it("should calculate proration for upgrade", () => {
      // Arrange
      const enterprisePlan = SubscriptionPlan.enterprise();
      const upgradeDate = new Date();
      upgradeDate.setDate(upgradeDate.getDate() + 15); // 15 jours dans la période

      // Act
      const prorationCost = subscription.calculateProrationForUpgrade(
        enterprisePlan,
        upgradeDate,
      );

      // Assert
      expect(prorationCost.getAmount()).toBeGreaterThan(0); // Upgrade coûte plus cher
    });
  });

  describe("🔴 RED - Plan Changes", () => {
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.freemium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });
    });

    it("should change to higher plan successfully", () => {
      // Arrange
      const premiumPlan = SubscriptionPlan.premium();

      // Act
      subscription.changePlan(premiumPlan, mockUserId);

      // Assert
      expect(subscription.getPlan().getType()).toBe("PREMIUM");
      expect(subscription.getUpdatedBy()).toBe(mockUserId);
    });

    it("should throw error when changing plan for inactive subscription", () => {
      // Arrange
      subscription.suspend(mockUserId);
      const premiumPlan = SubscriptionPlan.premium();

      // Act & Assert
      expect(() => subscription.changePlan(premiumPlan, mockUserId)).toThrow(
        "Can only change plan for active subscriptions",
      );
    });

    it("should throw error when current usage exceeds new plan limits", () => {
      // Arrange
      subscription.recordBusinessUsage(2); // Freemium allows only 1 business
      const restrictedPlan = SubscriptionPlan.custom(
        "Restricted Plan",
        "Very limited plan",
        {
          maxNotificationsPerMonth: 50,
          maxBusinesses: 1, // Less than current usage (2)
          maxStaffPerBusiness: 5,
          maxServicesPerBusiness: 5,
          hasAdvancedAnalytics: false,
          hasAPIAccess: false,
          hasPrioritySupport: false,
          hasWhiteLabel: false,
          customBranding: false,
          maxStorageGB: 1,
        },
        {
          monthlyPrice: SubscriptionPlan.freemium().getPricing().monthlyPrice,
          yearlyPrice: SubscriptionPlan.freemium().getPricing().yearlyPrice,
          notificationOveragePrice:
            SubscriptionPlan.freemium().getPricing().notificationOveragePrice,
        },
      );

      // Act & Assert
      expect(() => subscription.changePlan(restrictedPlan, mockUserId)).toThrow(
        "Current usage exceeds new plan limits",
      );
    });
  });

  describe("🔴 RED - Permission Checks", () => {
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.premium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });
    });

    it("should allow actions within plan limits", () => {
      // Arrange
      subscription.recordBusinessUsage(1); // Under limit (3)

      // Act & Assert
      expect(subscription.canPerformAction("createBusiness")).toBe(true);
      expect(subscription.canPerformAction("addStaff")).toBe(true);
      expect(subscription.canPerformAction("addService")).toBe(true);
    });

    it("should deny actions when at plan limits", () => {
      // Arrange
      subscription.recordBusinessUsage(3); // At limit (3)

      // Act & Assert
      expect(subscription.canPerformAction("createBusiness")).toBe(false);
    });

    it("should deny all actions for inactive subscription", () => {
      // Arrange
      subscription.suspend(mockUserId);

      // Act & Assert
      expect(subscription.canPerformAction("createBusiness")).toBe(false);
      expect(subscription.canPerformAction("addStaff")).toBe(false);
      expect(subscription.canPerformAction("addService")).toBe(false);
    });

    it("should check feature availability correctly", () => {
      // Act & Assert
      expect(subscription.hasFeature("hasAdvancedAnalytics")).toBe(true); // Premium has this
      expect(subscription.hasFeature("hasPrioritySupport")).toBe(false); // Premium doesn't have this
    });
  });

  describe("🔴 RED - Status Checks", () => {
    it("should identify expired subscription", () => {
      // Arrange
      const plan = SubscriptionPlan.premium();
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2); // 2 mois dans le passé

      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        startDate: pastDate,
        createdBy: mockUserId,
      });

      // Act & Assert
      expect(subscription.isExpired()).toBe(true);
      expect(subscription.isActive()).toBe(false);
    });

    it("should identify trial subscription correctly", () => {
      // Arrange
      const plan = SubscriptionPlan.premium();
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        trialDays: 14,
        createdBy: mockUserId,
      });

      // Act & Assert
      expect(subscription.isInTrial()).toBe(true);
      expect(subscription.getStatus()).toBe("TRIALING");
    });
  });

  describe("🔴 RED - Serialization", () => {
    it("should serialize to JSON correctly", () => {
      // Arrange
      const plan = SubscriptionPlan.premium();
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "MONTHLY",
        createdBy: mockUserId,
      });

      // Act
      const json = subscription.toJSON();

      // Assert
      expect(json.id).toBeDefined();
      expect(json.businessId).toBe(mockBusinessId);
      expect(json.plan.type).toBe("PREMIUM");
      expect(json.plan.name).toBe("Plan Premium");
      expect(json.status).toBe("ACTIVE");
      expect(json.billingFrequency).toBe("MONTHLY");
      expect(json.currentPeriodUsage).toBeDefined();
      expect(json.createdBy).toBe(mockUserId);
    });

    it("should have meaningful string representation", () => {
      // Arrange
      const plan = SubscriptionPlan.enterprise();
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: "YEARLY",
        createdBy: mockUserId,
      });

      // Act & Assert
      expect(subscription.toString()).toContain("Subscription");
      expect(subscription.toString()).toContain("Plan Enterprise");
      expect(subscription.toString()).toContain("ACTIVE");
    });
  });
});
