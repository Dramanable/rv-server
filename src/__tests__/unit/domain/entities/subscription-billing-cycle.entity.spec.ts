import { SubscriptionBillingCycle } from '@domain/entities/billing/subscription-billing-cycle.entity';
import { Subscription } from '@domain/entities/billing/subscription.entity';
import { SubscriptionPlan } from '@domain/value-objects/billing/subscription-plan.value-object';
import { DomainError } from '@domain/exceptions/domain.exceptions';

describe('SubscriptionBillingCycle Entity', () => {
  const mockSubscriptionId = 'subscription-123';
  const mockBusinessId = 'business-456';

  describe('🔴 RED - Billing Cycle Creation', () => {
    it('should create pending billing cycle with valid dates', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act
      const cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });

      // Assert
      expect(cycle.getId()).toBeDefined();
      expect(cycle.getSubscriptionId()).toBe(mockSubscriptionId);
      expect(cycle.getBusinessId()).toBe(mockBusinessId);
      expect(cycle.getStartDate()).toEqual(startDate);
      expect(cycle.getEndDate()).toEqual(endDate);
      expect(cycle.getStatus()).toBe('PENDING');
      expect(cycle.isPending()).toBe(true);
    });

    it('should initialize all usage counters to zero', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act
      const cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });

      // Assert
      const usage = cycle.getUsage();
      expect(usage.notifications).toBe(0);
      expect(usage.businesses).toBe(0);
      expect(usage.staff).toBe(0);
      expect(usage.services).toBe(0);
      expect(usage.apiCalls).toBe(0);
      expect(usage.storageUsedGB).toBe(0);
    });

    it('should initialize all charges to zero', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act
      const cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });

      // Assert
      const charges = cycle.getCharges();
      expect(charges.baseCost.isZero()).toBe(true);
      expect(charges.notificationOverage.isZero()).toBe(true);
      expect(charges.setupFees.isZero()).toBe(true);
      expect(charges.discounts.isZero()).toBe(true);
      expect(charges.taxes.isZero()).toBe(true);
      expect(charges.totalCost.isZero()).toBe(true);
    });

    it('should throw error when start date is after end date', () => {
      // Arrange
      const startDate = new Date('2025-01-31');
      const endDate = new Date('2025-01-01'); // Before start date

      // Act & Assert
      expect(() =>
        SubscriptionBillingCycle.create({
          subscriptionId: mockSubscriptionId,
          businessId: mockBusinessId,
          startDate,
          endDate,
        }),
      ).toThrow('Start date must be before end date');
    });

    it('should create billing cycle from subscription', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: 'MONTHLY',
        createdBy: 'user-123',
      });

      // Ajouter de l'usage à l'abonnement
      subscription.recordNotificationUsage(100);
      subscription.recordBusinessUsage(2);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Act
      const cycle = SubscriptionBillingCycle.fromSubscription(
        subscription,
        startDate,
        endDate,
      );

      // Assert
      expect(cycle.getSubscriptionId()).toBe(subscription.getId());
      expect(cycle.getBusinessId()).toBe(mockBusinessId);

      const usage = cycle.getUsage();
      expect(usage.notifications).toBe(100);
      expect(usage.businesses).toBe(2);
    });
  });

  describe('🔴 RED - Usage Recording', () => {
    let cycle: SubscriptionBillingCycle;

    beforeEach(() => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });
    });

    it('should record notification usage correctly', () => {
      // Act
      cycle.recordNotificationUsage(50);
      cycle.recordNotificationUsage(25);

      // Assert
      expect(cycle.getUsage().notifications).toBe(75);
    });

    it('should record business usage with maximum logic', () => {
      // Act
      cycle.recordBusinessUsage(2);
      cycle.recordBusinessUsage(1); // Should not decrease
      cycle.recordBusinessUsage(3); // Should increase to 3

      // Assert
      expect(cycle.getUsage().businesses).toBe(3);
    });

    it('should record staff usage with maximum logic', () => {
      // Act
      cycle.recordStaffUsage(10);
      cycle.recordStaffUsage(5); // Should not decrease
      cycle.recordStaffUsage(15); // Should increase to 15

      // Assert
      expect(cycle.getUsage().staff).toBe(15);
    });

    it('should record service usage with maximum logic', () => {
      // Act
      cycle.recordServiceUsage(20);
      cycle.recordServiceUsage(10); // Should not decrease
      cycle.recordServiceUsage(25); // Should increase to 25

      // Assert
      expect(cycle.getUsage().services).toBe(25);
    });

    it('should record API usage correctly', () => {
      // Act
      cycle.recordApiUsage(100);
      cycle.recordApiUsage(50);

      // Assert
      expect(cycle.getUsage().apiCalls).toBe(150);
    });

    it('should record storage usage with maximum logic', () => {
      // Act
      cycle.recordStorageUsage(5.5);
      cycle.recordStorageUsage(3.2); // Should not decrease
      cycle.recordStorageUsage(8.1); // Should increase to 8.1

      // Assert
      expect(cycle.getUsage().storageUsedGB).toBe(8.1);
    });

    it('should throw error for negative notification usage', () => {
      // Act & Assert
      expect(() => cycle.recordNotificationUsage(-10)).toThrow(
        'Notification usage count cannot be negative',
      );
    });

    it('should throw error for negative business usage', () => {
      // Act & Assert
      expect(() => cycle.recordBusinessUsage(-1)).toThrow(
        'Business usage count cannot be negative',
      );
    });

    it('should throw error for negative storage usage', () => {
      // Act & Assert
      expect(() => cycle.recordStorageUsage(-1.5)).toThrow(
        'Storage usage cannot be negative',
      );
    });
  });

  describe('🔴 RED - Charge Calculations', () => {
    let cycle: SubscriptionBillingCycle;
    let subscription: Subscription;

    beforeEach(() => {
      const plan = SubscriptionPlan.premium();
      subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: 'MONTHLY',
        createdBy: 'user-123',
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      cycle = SubscriptionBillingCycle.create({
        subscriptionId: subscription.getId(),
        businessId: mockBusinessId,
        startDate,
        endDate,
      });
    });

    it('should calculate charges without overage', () => {
      // Arrange
      cycle.recordNotificationUsage(500); // Under limit (1000)

      // Act
      cycle.calculateCharges(subscription);

      // Assert
      const charges = cycle.getCharges();
      expect(charges.baseCost.getAmount()).toBe(29.99); // Premium monthly price
      expect(charges.notificationOverage.isZero()).toBe(true);
      expect(charges.totalCost.getAmount()).toBe(29.99);
    });

    it('should calculate charges with overage', () => {
      // Arrange
      cycle.recordNotificationUsage(1200); // Over limit by 200

      // Act
      cycle.calculateCharges(subscription);

      // Assert
      const charges = cycle.getCharges();
      expect(charges.baseCost.getAmount()).toBe(29.99);
      expect(charges.notificationOverage.getAmount()).toBe(6.0); // 200 * 0.03
      expect(charges.totalCost.getAmount()).toBe(35.99);
    });

    it('should handle yearly subscription charges', () => {
      // Arrange
      const yearlySubscription = Subscription.create({
        businessId: mockBusinessId,
        plan: SubscriptionPlan.premium(),
        billingFrequency: 'YEARLY',
        createdBy: 'user-123',
      });
      cycle.recordNotificationUsage(500);

      // Act
      cycle.calculateCharges(yearlySubscription);

      // Assert
      const charges = cycle.getCharges();
      expect(charges.baseCost.getAmount()).toBe(299.99); // Premium yearly price
    });
  });

  describe('🔴 RED - Status Management', () => {
    let cycle: SubscriptionBillingCycle;

    beforeEach(() => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });
    });

    it('should transition from pending to processing', () => {
      // Act
      cycle.markAsProcessing();

      // Assert
      expect(cycle.getStatus()).toBe('PROCESSING');
      expect(cycle.isProcessing()).toBe(true);
      expect(cycle.isPending()).toBe(false);
    });

    it('should transition from processing to completed', () => {
      // Arrange
      cycle.markAsProcessing();

      // Act
      cycle.markAsCompleted();

      // Assert
      expect(cycle.getStatus()).toBe('COMPLETED');
      expect(cycle.isCompleted()).toBe(true);
      expect(cycle.getProcessedAt()).toBeDefined();
      expect(cycle.getFailureReason()).toBeNull();
    });

    it('should transition from processing to failed', () => {
      // Arrange
      cycle.markAsProcessing();
      const failureReason = 'Payment method declined';

      // Act
      cycle.markAsFailed(failureReason);

      // Assert
      expect(cycle.getStatus()).toBe('FAILED');
      expect(cycle.isFailed()).toBe(true);
      expect(cycle.getFailureReason()).toBe(failureReason);
    });

    it('should retry failed cycle', () => {
      // Arrange
      cycle.markAsProcessing();
      cycle.markAsFailed('Payment failed');

      // Act
      cycle.retry();

      // Assert
      expect(cycle.getStatus()).toBe('PENDING');
      expect(cycle.isPending()).toBe(true);
      expect(cycle.getFailureReason()).toBeNull();
    });

    it('should refund completed cycle', () => {
      // Arrange
      cycle.markAsProcessing();
      cycle.markAsCompleted();
      const refundReason = 'Customer cancellation';

      // Act
      cycle.refund(refundReason);

      // Assert
      expect(cycle.getStatus()).toBe('REFUNDED');
      expect(cycle.isRefunded()).toBe(true);
      expect(cycle.getFailureReason()).toBe(refundReason);
    });

    it('should throw error when processing non-pending cycle', () => {
      // Arrange
      cycle.markAsProcessing();

      // Act & Assert
      expect(() => cycle.markAsProcessing()).toThrow(
        'Cannot process billing cycle with status PROCESSING',
      );
    });

    it('should throw error when completing non-processing cycle', () => {
      // Act & Assert
      expect(() => cycle.markAsCompleted()).toThrow(
        'Can only complete processing billing cycles',
      );
    });

    it('should throw error when failing without reason', () => {
      // Arrange
      cycle.markAsProcessing();

      // Act & Assert
      expect(() => cycle.markAsFailed('')).toThrow(
        'Failure reason is required',
      );
    });

    it('should throw error when retrying non-failed cycle', () => {
      // Act & Assert
      expect(() => cycle.retry()).toThrow(
        'Can only retry failed billing cycles',
      );
    });

    it('should throw error when refunding non-completed cycle', () => {
      // Act & Assert
      expect(() => cycle.refund('Test reason')).toThrow(
        'Can only refund completed billing cycles',
      );
    });
  });

  describe('🔴 RED - Metrics and Calculations', () => {
    let cycle: SubscriptionBillingCycle;

    beforeEach(() => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31'); // 30 days
      cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });
    });

    it('should calculate duration in days correctly', () => {
      // Act & Assert
      expect(cycle.getDurationInDays()).toBe(30); // 30 days from Jan 1 to Jan 31
    });

    it('should identify current period correctly', () => {
      // Arrange
      const now = new Date();
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentCycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate: currentStart,
        endDate: currentEnd,
      });

      // Act & Assert
      expect(currentCycle.isCurrentPeriod()).toBe(true);
      expect(cycle.isCurrentPeriod()).toBe(false); // January 2025 cycle
    });

    it('should calculate usage ratio correctly', () => {
      // Note: Ce test dépend de la date actuelle, donc on mock indirectement
      // En pratique, le ratio devrait être entre 0 and 1
      const ratio = cycle.getUsageRatio();
      expect(ratio).toBeGreaterThanOrEqual(0);
      expect(ratio).toBeLessThanOrEqual(1);
    });

    it('should predict total cost for completed cycle', () => {
      // Arrange
      const plan = SubscriptionPlan.premium();
      const subscription = Subscription.create({
        businessId: mockBusinessId,
        plan: plan,
        billingFrequency: 'MONTHLY',
        createdBy: 'user-123',
      });

      cycle.calculateCharges(subscription);
      cycle.markAsProcessing();
      cycle.markAsCompleted();

      // Act
      const predictedCost = cycle.predictTotalCost(subscription);

      // Assert
      expect(predictedCost.equals(cycle.getCharges().totalCost)).toBe(true);
    });
  });

  describe('🔴 RED - Serialization', () => {
    it('should serialize to JSON correctly', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });

      cycle.recordNotificationUsage(100);
      cycle.recordBusinessUsage(2);

      // Act
      const json = cycle.toJSON();

      // Assert
      expect(json.id).toBeDefined();
      expect(json.subscriptionId).toBe(mockSubscriptionId);
      expect(json.businessId).toBe(mockBusinessId);
      expect(json.period.startDate).toBe(startDate.toISOString());
      expect(json.period.endDate).toBe(endDate.toISOString());
      expect(json.period.durationDays).toBe(30);
      expect(json.status).toBe('PENDING');
      expect(json.usage.notifications).toBe(100);
      expect(json.usage.businesses).toBe(2);
      expect(json.charges.baseCost).toBeDefined();
      expect(json.processing.createdAt).toBeDefined();
      expect(json.metrics.usageRatio).toBeDefined();
    });

    it('should have meaningful string representation', () => {
      // Arrange
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const cycle = SubscriptionBillingCycle.create({
        subscriptionId: mockSubscriptionId,
        businessId: mockBusinessId,
        startDate,
        endDate,
      });

      // Act & Assert
      const str = cycle.toString();
      expect(str).toContain('SubscriptionBillingCycle');
      expect(str).toContain('2025-01-01');
      expect(str).toContain('2025-01-31');
      expect(str).toContain('PENDING');
    });
  });
});
