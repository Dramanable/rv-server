import { SubscriptionPlan } from '@domain/value-objects/billing/subscription-plan.value-object';
import { NotificationCost } from '@domain/value-objects/billing/notification-cost.value-object';
import { DomainError } from '@domain/exceptions/domain.exceptions';

describe('SubscriptionPlan Value Object', () => {
  describe('🔴 RED - Factory Methods', () => {
    it('should create freemium plan with correct features', () => {
      // Arrange & Act
      const plan = SubscriptionPlan.freemium();

      // Assert
      expect(plan.getType()).toBe('FREEMIUM');
      expect(plan.getName()).toBe('Plan Gratuit');
      expect(plan.getFeatures().maxNotificationsPerMonth).toBe(100);
      expect(plan.getFeatures().maxBusinesses).toBe(1);
      expect(plan.getFeatures().hasAdvancedAnalytics).toBe(false);
      expect(plan.getPricing().monthlyPrice.isZero()).toBe(true);
    });

    it('should create premium plan with correct features', () => {
      // Arrange & Act
      const plan = SubscriptionPlan.premium();

      // Assert
      expect(plan.getType()).toBe('PREMIUM');
      expect(plan.getName()).toBe('Plan Premium');
      expect(plan.getFeatures().maxNotificationsPerMonth).toBe(1000);
      expect(plan.getFeatures().maxBusinesses).toBe(3);
      expect(plan.getFeatures().hasAdvancedAnalytics).toBe(true);
      expect(plan.getPricing().monthlyPrice.getAmount()).toBe(29.99);
    });

    it('should create enterprise plan with unlimited features', () => {
      // Arrange & Act
      const plan = SubscriptionPlan.enterprise();

      // Assert
      expect(plan.getType()).toBe('ENTERPRISE');
      expect(plan.getName()).toBe('Plan Enterprise');
      expect(plan.getFeatures().maxNotificationsPerMonth).toBe(10000);
      expect(plan.getFeatures().maxBusinesses).toBe(-1); // Illimité
      expect(plan.getFeatures().maxStaffPerBusiness).toBe(-1); // Illimité
      expect(plan.getFeatures().hasPrioritySupport).toBe(true);
      expect(plan.getPricing().setupFee?.getAmount()).toBe(499.99);
    });

    it('should create custom plan with provided parameters', () => {
      // Arrange
      const features = {
        maxNotificationsPerMonth: 500,
        maxBusinesses: 2,
        maxStaffPerBusiness: 10,
        maxServicesPerBusiness: 25,
        hasAdvancedAnalytics: true,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: false,
        maxStorageGB: 5,
      };

      const pricing = {
        monthlyPrice: NotificationCost.create(19.99, 'EUR'),
        yearlyPrice: NotificationCost.create(199.99, 'EUR'),
        notificationOveragePrice: NotificationCost.create(0.04, 'EUR'),
      };

      // Act
      const plan = SubscriptionPlan.custom(
        'Plan Personnalisé',
        'Plan sur mesure',
        features,
        pricing,
      );

      // Assert
      expect(plan.getType()).toBe('CUSTOM');
      expect(plan.getName()).toBe('Plan Personnalisé');
      expect(plan.getFeatures().maxNotificationsPerMonth).toBe(500);
    });
  });

  describe('🔴 RED - Validation', () => {
    it('should throw error for empty plan name', () => {
      // Arrange
      const features = {
        maxNotificationsPerMonth: 100,
        maxBusinesses: 1,
        maxStaffPerBusiness: 5,
        maxServicesPerBusiness: 10,
        hasAdvancedAnalytics: false,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: false,
        maxStorageGB: 1,
      };

      const pricing = {
        monthlyPrice: NotificationCost.create(10, 'EUR'),
        yearlyPrice: NotificationCost.create(100, 'EUR'),
        notificationOveragePrice: NotificationCost.create(0.05, 'EUR'),
      };

      // Act & Assert
      expect(() =>
        SubscriptionPlan.custom('', 'Description', features, pricing),
      ).toThrow('Subscription plan name cannot be empty');
    });

    it('should throw error for plan name too long', () => {
      // Arrange
      const longName = 'a'.repeat(101);
      const features = {
        maxNotificationsPerMonth: 100,
        maxBusinesses: 1,
        maxStaffPerBusiness: 5,
        maxServicesPerBusiness: 10,
        hasAdvancedAnalytics: false,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: false,
        maxStorageGB: 1,
      };

      const pricing = {
        monthlyPrice: NotificationCost.create(10, 'EUR'),
        yearlyPrice: NotificationCost.create(100, 'EUR'),
        notificationOveragePrice: NotificationCost.create(0.05, 'EUR'),
      };

      // Act & Assert
      expect(() =>
        SubscriptionPlan.custom(longName, 'Description', features, pricing),
      ).toThrow('Subscription plan name cannot exceed 100 characters');
    });

    it('should throw error for negative max notifications', () => {
      // Arrange
      const features = {
        maxNotificationsPerMonth: -1,
        maxBusinesses: 1,
        maxStaffPerBusiness: 5,
        maxServicesPerBusiness: 10,
        hasAdvancedAnalytics: false,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: false,
        maxStorageGB: 1,
      };

      const pricing = {
        monthlyPrice: NotificationCost.create(10, 'EUR'),
        yearlyPrice: NotificationCost.create(100, 'EUR'),
        notificationOveragePrice: NotificationCost.create(0.05, 'EUR'),
      };

      // Act & Assert
      expect(() =>
        SubscriptionPlan.custom('Plan Test', 'Description', features, pricing),
      ).toThrow('Max notifications per month cannot be negative');
    });
  });

  describe('🔴 RED - Price Calculations', () => {
    it('should calculate monthly price correctly', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const price = plan.calculatePriceForPeriod('MONTHLY', 3);

      // Assert
      expect(price.getAmount()).toBe(89.97); // 29.99 * 3
    });

    it('should calculate yearly price correctly', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const price = plan.calculatePriceForPeriod('YEARLY', 12);

      // Assert
      expect(price.getAmount()).toBe(299.99); // Prix annuel
    });

    it('should calculate overage cost for excess notifications', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const overageCost = plan.calculateOverageCost(50);

      // Assert
      expect(overageCost.getAmount()).toBe(1.5); // 50 * 0.03
    });

    it('should return zero overage cost for no excess notifications', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const overageCost = plan.calculateOverageCost(0);

      // Assert
      expect(overageCost.isZero()).toBe(true);
    });

    it('should calculate yearly savings correctly', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act
      const savings = plan.calculateYearlySavings();

      // Assert
      expect(savings.getAmount()).toBe(59.89); // (29.99 * 12) - 299.99
    });
  });

  describe('🔴 RED - Feature Limits', () => {
    it('should allow creating business when under limit', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act & Assert
      expect(plan.canCreateBusiness(1)).toBe(true); // 1 < 3
      expect(plan.canCreateBusiness(2)).toBe(true); // 2 < 3
    });

    it('should not allow creating business when at limit', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act & Assert
      expect(plan.canCreateBusiness(3)).toBe(false); // 3 = 3 (limit atteint)
    });

    it('should allow unlimited businesses for enterprise plan', () => {
      // Arrange
      const plan = SubscriptionPlan.enterprise();

      // Act & Assert
      expect(plan.canCreateBusiness(100)).toBe(true); // Illimité
      expect(plan.canCreateBusiness(1000)).toBe(true); // Illimité
    });

    it('should detect notification quota exceeded', () => {
      // Arrange
      const plan = SubscriptionPlan.freemium();

      // Act & Assert
      expect(plan.hasNotificationQuotaExceeded(50)).toBe(false); // 50 < 100
      expect(plan.hasNotificationQuotaExceeded(100)).toBe(false); // 100 = 100
      expect(plan.hasNotificationQuotaExceeded(150)).toBe(true); // 150 > 100
    });
  });

  describe('🔴 RED - Plan Comparison', () => {
    it('should identify upgrade from freemium to premium', () => {
      // Arrange
      const freemium = SubscriptionPlan.freemium();
      const premium = SubscriptionPlan.premium();

      // Act & Assert
      expect(premium.isUpgradeFrom(freemium)).toBe(true);
      expect(freemium.isUpgradeFrom(premium)).toBe(false);
    });

    it('should identify upgrade from premium to enterprise', () => {
      // Arrange
      const premium = SubscriptionPlan.premium();
      const enterprise = SubscriptionPlan.enterprise();

      // Act & Assert
      expect(enterprise.isUpgradeFrom(premium)).toBe(true);
      expect(premium.isUpgradeFrom(enterprise)).toBe(false);
    });

    it('should compare plans for equality', () => {
      // Arrange
      const plan1 = SubscriptionPlan.premium();
      const plan2 = SubscriptionPlan.premium();
      const plan3 = SubscriptionPlan.enterprise();

      // Act & Assert
      expect(plan1.equals(plan2)).toBe(true);
      expect(plan1.equals(plan3)).toBe(false);
    });
  });

  describe('🔴 RED - Formatting', () => {
    it('should format monthly price correctly', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act & Assert
      expect(plan.getFormattedMonthlyPrice()).toContain('29,99');
      expect(plan.getFormattedMonthlyPrice()).toContain('€');
    });

    it('should format yearly price correctly', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act & Assert
      expect(plan.getFormattedYearlyPrice()).toContain('299,99');
      expect(plan.getFormattedYearlyPrice()).toContain('€');
    });

    it('should have meaningful string representation', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();

      // Act & Assert
      expect(plan.toString()).toContain('Plan Premium');
      expect(plan.toString()).toContain('PREMIUM');
      expect(plan.toString()).toContain('/mois');
    });
  });
});
