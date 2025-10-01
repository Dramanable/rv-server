import { DomainError } from "../../exceptions/domain.exceptions";
import { NotificationCost } from "./notification-cost.value-object";

export type SubscriptionPlanType =
  | "FREEMIUM"
  | "PREMIUM"
  | "ENTERPRISE"
  | "CUSTOM";
export type BillingFrequency = "MONTHLY" | "YEARLY";

export interface SubscriptionPlanFeatures {
  readonly maxNotificationsPerMonth: number;
  readonly maxBusinesses: number;
  readonly maxStaffPerBusiness: number;
  readonly maxServicesPerBusiness: number;
  readonly hasAdvancedAnalytics: boolean;
  readonly hasAPIAccess: boolean;
  readonly hasPrioritySupport: boolean;
  readonly hasWhiteLabel: boolean;
  readonly customBranding: boolean;
  readonly maxStorageGB: number;
}

export interface SubscriptionPlanPricing {
  readonly monthlyPrice: NotificationCost;
  readonly yearlyPrice: NotificationCost;
  readonly setupFee?: NotificationCost;
  readonly notificationOveragePrice: NotificationCost; // Prix par notification supplémentaire
}

export class SubscriptionPlan {
  private constructor(
    private readonly type: SubscriptionPlanType,
    private readonly name: string,
    private readonly description: string,
    private readonly features: SubscriptionPlanFeatures,
    private readonly pricing: SubscriptionPlanPricing,
    private readonly isActive: boolean = true,
  ) {
    this.validate();
  }

  // 🏭 Factory Methods pour les plans prédéfinis
  static freemium(): SubscriptionPlan {
    return new SubscriptionPlan(
      "FREEMIUM",
      "Plan Gratuit",
      "Plan de base gratuit avec fonctionnalités limitées",
      {
        maxNotificationsPerMonth: 100,
        maxBusinesses: 1,
        maxStaffPerBusiness: 3,
        maxServicesPerBusiness: 10,
        hasAdvancedAnalytics: false,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: false,
        maxStorageGB: 1,
      },
      {
        monthlyPrice: NotificationCost.zero("EUR"),
        yearlyPrice: NotificationCost.zero("EUR"),
        notificationOveragePrice: NotificationCost.create(0.05, "EUR"), // 5 centimes par notification supplémentaire
      },
    );
  }

  static premium(): SubscriptionPlan {
    return new SubscriptionPlan(
      "PREMIUM",
      "Plan Premium",
      "Plan professionnel avec fonctionnalités avancées",
      {
        maxNotificationsPerMonth: 1000,
        maxBusinesses: 3,
        maxStaffPerBusiness: 15,
        maxServicesPerBusiness: 50,
        hasAdvancedAnalytics: true,
        hasAPIAccess: true,
        hasPrioritySupport: false,
        hasWhiteLabel: false,
        customBranding: true,
        maxStorageGB: 10,
      },
      {
        monthlyPrice: NotificationCost.create(29.99, "EUR"),
        yearlyPrice: NotificationCost.create(299.99, "EUR"), // 2 mois gratuits
        notificationOveragePrice: NotificationCost.create(0.03, "EUR"), // 3 centimes par notification
      },
    );
  }

  static enterprise(): SubscriptionPlan {
    return new SubscriptionPlan(
      "ENTERPRISE",
      "Plan Enterprise",
      "Plan entreprise avec fonctionnalités complètes et support prioritaire",
      {
        maxNotificationsPerMonth: 10000,
        maxBusinesses: -1, // Illimité
        maxStaffPerBusiness: -1, // Illimité
        maxServicesPerBusiness: -1, // Illimité
        hasAdvancedAnalytics: true,
        hasAPIAccess: true,
        hasPrioritySupport: true,
        hasWhiteLabel: true,
        customBranding: true,
        maxStorageGB: 100,
      },
      {
        monthlyPrice: NotificationCost.create(199.99, "EUR"),
        yearlyPrice: NotificationCost.create(1999.99, "EUR"), // 2 mois gratuits
        setupFee: NotificationCost.create(499.99, "EUR"),
        notificationOveragePrice: NotificationCost.create(0.02, "EUR"), // 2 centimes par notification
      },
    );
  }

  static custom(
    name: string,
    description: string,
    features: SubscriptionPlanFeatures,
    pricing: SubscriptionPlanPricing,
  ): SubscriptionPlan {
    return new SubscriptionPlan("CUSTOM", name, description, features, pricing);
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainError("Subscription plan name cannot be empty");
    }

    if (this.name.length > 100) {
      throw new DomainError(
        "Subscription plan name cannot exceed 100 characters",
      );
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new DomainError("Subscription plan description cannot be empty");
    }

    if (this.features.maxNotificationsPerMonth < 0) {
      throw new DomainError("Max notifications per month cannot be negative");
    }

    if (this.features.maxBusinesses < -1 || this.features.maxBusinesses === 0) {
      throw new DomainError(
        "Max businesses must be -1 (unlimited) or positive number",
      );
    }

    // Vérification cohérence pricing
    if (
      this.pricing.yearlyPrice.getAmount() > 0 &&
      this.pricing.monthlyPrice.getAmount() > 0
    ) {
      const yearlyExpected = this.pricing.monthlyPrice.multiply(12);
      if (this.pricing.yearlyPrice.getAmount() >= yearlyExpected.getAmount()) {
        throw new DomainError(
          "Yearly price should be less than 12 monthly payments for discount",
        );
      }
    }
  }

  // 💰 Calculs de prix
  calculatePriceForPeriod(
    frequency: BillingFrequency,
    months: number = 1,
  ): NotificationCost {
    if (frequency === "YEARLY") {
      const years = Math.ceil(months / 12);
      return this.pricing.yearlyPrice.multiply(years);
    }

    return this.pricing.monthlyPrice.multiply(months);
  }

  calculateOverageCost(excessNotifications: number): NotificationCost {
    if (excessNotifications <= 0) {
      return NotificationCost.zero(
        this.pricing.notificationOveragePrice.getCurrency() as "EUR" | "USD",
      );
    }

    return this.pricing.notificationOveragePrice.multiply(excessNotifications);
  }

  // 📊 Vérifications de limites
  canCreateBusiness(currentBusinessCount: number): boolean {
    return (
      this.features.maxBusinesses === -1 ||
      currentBusinessCount < this.features.maxBusinesses
    );
  }

  canAddStaff(currentStaffCount: number): boolean {
    return (
      this.features.maxStaffPerBusiness === -1 ||
      currentStaffCount < this.features.maxStaffPerBusiness
    );
  }

  canAddService(currentServiceCount: number): boolean {
    return (
      this.features.maxServicesPerBusiness === -1 ||
      currentServiceCount < this.features.maxServicesPerBusiness
    );
  }

  hasNotificationQuotaExceeded(currentNotifications: number): boolean {
    return currentNotifications > this.features.maxNotificationsPerMonth;
  }

  // 🎁 Calculs d'économies
  calculateYearlySavings(): NotificationCost {
    if (
      this.pricing.monthlyPrice.isZero() ||
      this.pricing.yearlyPrice.isZero()
    ) {
      return NotificationCost.zero(
        this.pricing.monthlyPrice.getCurrency() as "EUR" | "USD",
      );
    }

    const twelveMonthsCost = this.pricing.monthlyPrice.multiply(12);
    return twelveMonthsCost.subtract(this.pricing.yearlyPrice); // Utiliser subtract au lieu de add(multiply(-1))
  }

  // 📈 Comparaison de plans
  isUpgradeFrom(otherPlan: SubscriptionPlan): boolean {
    const typeHierarchy: Record<SubscriptionPlanType, number> = {
      FREEMIUM: 1,
      PREMIUM: 2,
      ENTERPRISE: 3,
      CUSTOM: 4,
    };

    return typeHierarchy[this.type] > typeHierarchy[otherPlan.type];
  }

  // Getters
  getType(): SubscriptionPlanType {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getFeatures(): SubscriptionPlanFeatures {
    return { ...this.features };
  }

  getPricing(): SubscriptionPlanPricing {
    return {
      monthlyPrice: this.pricing.monthlyPrice,
      yearlyPrice: this.pricing.yearlyPrice,
      setupFee: this.pricing.setupFee,
      notificationOveragePrice: this.pricing.notificationOveragePrice,
    };
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  // 🎨 Formatage
  getFormattedMonthlyPrice(): string {
    return this.pricing.monthlyPrice.getFormattedAmount();
  }

  getFormattedYearlyPrice(): string {
    return this.pricing.yearlyPrice.getFormattedAmount();
  }

  /**
   * Vérifie si le plan a accès à une fonctionnalité spécifique
   */
  hasFeature(feature: keyof SubscriptionPlanFeatures): boolean {
    const featureValue = this.features[feature];
    if (typeof featureValue === "boolean") {
      return featureValue;
    }
    if (typeof featureValue === "number") {
      return featureValue > 0;
    }
    return false;
  }

  toString(): string {
    return `${this.name} (${this.type}) - ${this.getFormattedMonthlyPrice()}/mois`;
  }

  // ⚖️ Égalité
  equals(other: SubscriptionPlan): boolean {
    return (
      this.type === other.type &&
      this.name === other.name &&
      this.pricing.monthlyPrice.equals(other.pricing.monthlyPrice) &&
      this.pricing.yearlyPrice.equals(other.pricing.yearlyPrice)
    );
  }
}
