import { DomainError } from "../../exceptions/domain.exceptions";
import {
  SubscriptionPlan,
  BillingFrequency,
  SubscriptionPlanFeatures,
} from "../../value-objects/billing/subscription-plan.value-object";
import { NotificationCost } from "../../value-objects/billing/notification-cost.value-object";

export type SubscriptionStatus =
  | "ACTIVE" // Actif et payé
  | "TRIALING" // En période d'essai
  | "PAST_DUE" // En retard de paiement
  | "CANCELED" // Annulé par le client
  | "SUSPENDED" // Suspendu par admin
  | "EXPIRED"; // Expiré

export class Subscription {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: string,
    private _plan: SubscriptionPlan,
    private _status: SubscriptionStatus,
    private readonly _billingFrequency: BillingFrequency,
    private readonly _startDate: Date,
    private _endDate: Date,
    private _nextBillingDate: Date,
    private _trialEndDate: Date | null,
    private _currentPeriodUsage: {
      notifications: number;
      businesses: number;
      staff: number;
      services: number;
    },
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _createdBy: string,
    private _updatedBy: string,
  ) {
    this.validate();
  }

  // 🏭 Factory Methods
  static create(params: {
    businessId: string;
    plan: SubscriptionPlan;
    billingFrequency: BillingFrequency;
    startDate?: Date;
    trialDays?: number;
    createdBy: string;
  }): Subscription {
    const now = new Date();
    const startDate = params.startDate || now;
    const id = this.generateId();

    // Calculer les dates importantes
    const endDate = this.calculateEndDate(startDate, params.billingFrequency);
    const nextBillingDate = params.trialDays
      ? new Date(startDate.getTime() + params.trialDays * 24 * 60 * 60 * 1000)
      : endDate;

    const trialEndDate = params.trialDays
      ? new Date(startDate.getTime() + params.trialDays * 24 * 60 * 60 * 1000)
      : null;

    const status: SubscriptionStatus = params.trialDays ? "TRIALING" : "ACTIVE";

    return new Subscription(
      id,
      params.businessId,
      params.plan,
      status,
      params.billingFrequency,
      startDate,
      endDate,
      nextBillingDate,
      trialEndDate,
      {
        notifications: 0,
        businesses: 0,
        staff: 0,
        services: 0,
      },
      now,
      now,
      params.createdBy,
      params.createdBy,
    );
  }

  static reconstruct(params: {
    id: string;
    businessId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    billingFrequency: BillingFrequency;
    startDate: Date;
    endDate: Date;
    nextBillingDate: Date;
    trialEndDate: Date | null;
    currentPeriodUsage: {
      notifications: number;
      businesses: number;
      staff: number;
      services: number;
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  }): Subscription {
    return new Subscription(
      params.id,
      params.businessId,
      params.plan,
      params.status,
      params.billingFrequency,
      params.startDate,
      params.endDate,
      params.nextBillingDate,
      params.trialEndDate,
      params.currentPeriodUsage,
      params.createdAt,
      params.updatedAt,
      params.createdBy,
      params.updatedBy,
    );
  }

  private static generateId(): string {
    // Simple UUID v4 generator
    return "sub_" + Math.random().toString(36).substr(2, 9);
  }

  private static calculateEndDate(
    startDate: Date,
    frequency: BillingFrequency,
  ): Date {
    const endDate = new Date(startDate);
    if (frequency === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  private validate(): void {
    if (!this._id || this._id.trim().length === 0) {
      throw new DomainError("Subscription ID cannot be empty");
    }

    if (!this._businessId || this._businessId.trim().length === 0) {
      throw new DomainError("Business ID cannot be empty");
    }

    if (this._startDate >= this._endDate) {
      throw new DomainError("Subscription start date must be before end date");
    }

    if (this._currentPeriodUsage.notifications < 0) {
      throw new DomainError(
        "Current period notification usage cannot be negative",
      );
    }
  }

  // 🔄 Gestion du cycle de vie
  activate(updatedBy: string): void {
    if (this._status === "ACTIVE") {
      throw new DomainError("Subscription is already active");
    }

    if (this._status === "EXPIRED") {
      throw new DomainError("Cannot activate expired subscription");
    }

    this._status = "ACTIVE";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  suspend(updatedBy: string, reason?: string): void {
    if (this._status === "SUSPENDED") {
      throw new DomainError("Subscription is already suspended");
    }

    this._status = "SUSPENDED";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  cancel(updatedBy: string, endImmediately: boolean = false): void {
    if (this._status === "CANCELED") {
      throw new DomainError("Subscription is already canceled");
    }

    this._status = "CANCELED";

    if (endImmediately) {
      this._endDate = new Date();
    }

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  renew(updatedBy: string): void {
    if (this._status !== "ACTIVE" && this._status !== "PAST_DUE") {
      throw new DomainError("Can only renew active or past due subscriptions");
    }

    // Calculer nouvelle période
    const newStartDate = new Date(this._endDate);
    this._endDate = Subscription.calculateEndDate(
      newStartDate,
      this._billingFrequency,
    );
    this._nextBillingDate = new Date(this._endDate);

    // Réinitialiser l'usage
    this._currentPeriodUsage = {
      notifications: 0,
      businesses: this._currentPeriodUsage.businesses, // Garder le nombre de businesses
      staff: this._currentPeriodUsage.staff, // Garder le nombre de staff
      services: this._currentPeriodUsage.services, // Garder le nombre de services
    };

    this._status = "ACTIVE";
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  // 📊 Gestion de l'usage
  recordNotificationUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Notification usage count cannot be negative");
    }

    this._currentPeriodUsage.notifications += count;
    this._updatedAt = new Date();
  }

  recordBusinessUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Business usage count cannot be negative");
    }

    this._currentPeriodUsage.businesses = count;
    this._updatedAt = new Date();
  }

  recordStaffUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Staff usage count cannot be negative");
    }

    this._currentPeriodUsage.staff = count;
    this._updatedAt = new Date();
  }

  recordServiceUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Service usage count cannot be negative");
    }

    this._currentPeriodUsage.services = count;
    this._updatedAt = new Date();
  }

  // 💰 Calculs financiers
  calculateCurrentPeriodCost(): NotificationCost {
    const baseCost = this._plan.calculatePriceForPeriod(this._billingFrequency);

    // Ajouter les coûts de dépassement de notifications
    const excessNotifications = Math.max(
      0,
      this._currentPeriodUsage.notifications -
        this._plan.getFeatures().maxNotificationsPerMonth,
    );

    const overageCost = this._plan.calculateOverageCost(excessNotifications);

    return baseCost.add(overageCost);
  }

  calculateProrationForUpgrade(
    newPlan: SubscriptionPlan,
    upgradeDate: Date,
  ): NotificationCost {
    const remainingDays = Math.max(
      0,
      Math.ceil(
        (this._endDate.getTime() - upgradeDate.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
    const totalDays = this._billingFrequency === "MONTHLY" ? 30 : 365;

    const currentPlanCost = this._plan.calculatePriceForPeriod(
      this._billingFrequency,
    );
    const newPlanCost = newPlan.calculatePriceForPeriod(this._billingFrequency);

    const prorationFactor = remainingDays / totalDays;
    const currentPlanRefund = currentPlanCost.multiply(prorationFactor);
    const newPlanCharge = newPlanCost.multiply(prorationFactor);

    // Si le nouveau plan coûte plus cher, on facture la différence
    // Si il coûte moins cher, on rembourse la différence
    if (newPlanCharge.getAmount() >= currentPlanRefund.getAmount()) {
      return newPlanCharge.subtract(currentPlanRefund);
    } else {
      return NotificationCost.zero(
        newPlanCharge.getCurrency() as "EUR" | "USD",
      );
    }
  }

  // 🔄 Changement de plan
  changePlan(
    newPlan: SubscriptionPlan,
    updatedBy: string,
    effectiveDate?: Date,
  ): void {
    if (this._status !== "ACTIVE") {
      throw new DomainError("Can only change plan for active subscriptions");
    }

    const changeDate = effectiveDate || new Date();

    // Vérifier que les limites actuelles sont compatibles avec le nouveau plan
    if (!this.isUsageCompatibleWithPlan(newPlan)) {
      throw new DomainError("Current usage exceeds new plan limits");
    }

    this._plan = newPlan;
    this._updatedBy = updatedBy;
    this._updatedAt = changeDate;
  }

  private isUsageCompatibleWithPlan(plan: SubscriptionPlan): boolean {
    const features = plan.getFeatures();

    return (
      (features.maxBusinesses === -1 ||
        this._currentPeriodUsage.businesses <= features.maxBusinesses) &&
      (features.maxStaffPerBusiness === -1 ||
        this._currentPeriodUsage.staff <= features.maxStaffPerBusiness) &&
      (features.maxServicesPerBusiness === -1 ||
        this._currentPeriodUsage.services <= features.maxServicesPerBusiness)
    );
  }

  // 🔍 Vérifications d'état
  isActive(): boolean {
    return this._status === "ACTIVE" && !this.isExpired();
  }

  isInTrial(): boolean {
    return (
      this._status === "TRIALING" &&
      this._trialEndDate !== null &&
      new Date() < this._trialEndDate
    );
  }

  isExpired(): boolean {
    return this._status === "EXPIRED" || new Date() > this._endDate;
  }

  isPastDue(): boolean {
    return this._status === "PAST_DUE";
  }

  hasFeature(feature: keyof SubscriptionPlanFeatures): boolean {
    return this._plan.hasFeature(feature);
  }

  canPerformAction(
    action: "createBusiness" | "addStaff" | "addService",
  ): boolean {
    if (!this.isActive()) {
      return false;
    }

    switch (action) {
      case "createBusiness":
        return this._plan.canCreateBusiness(
          this._currentPeriodUsage.businesses,
        );
      case "addStaff":
        return this._plan.canAddStaff(this._currentPeriodUsage.staff);
      case "addService":
        return this._plan.canAddService(this._currentPeriodUsage.services);
      default:
        return false;
    }
  }

  // Getters
  getId(): string {
    return this._id;
  }
  getBusinessId(): string {
    return this._businessId;
  }
  getPlan(): SubscriptionPlan {
    return this._plan;
  }
  getStatus(): SubscriptionStatus {
    return this._status;
  }
  getBillingFrequency(): BillingFrequency {
    return this._billingFrequency;
  }
  getStartDate(): Date {
    return new Date(this._startDate);
  }
  getEndDate(): Date {
    return new Date(this._endDate);
  }
  getNextBillingDate(): Date {
    return new Date(this._nextBillingDate);
  }
  getTrialEndDate(): Date | null {
    return this._trialEndDate ? new Date(this._trialEndDate) : null;
  }
  getCurrentPeriodUsage() {
    return { ...this._currentPeriodUsage };
  }
  getCreatedAt(): Date {
    return new Date(this._createdAt);
  }
  getUpdatedAt(): Date {
    return new Date(this._updatedAt);
  }
  getCreatedBy(): string {
    return this._createdBy;
  }
  getUpdatedBy(): string {
    return this._updatedBy;
  }

  // 🎨 Formatage
  toString(): string {
    return `Subscription ${this._id} - ${this._plan.getName()} (${this._status})`;
  }

  toJSON() {
    return {
      id: this._id,
      businessId: this._businessId,
      plan: {
        type: this._plan.getType(),
        name: this._plan.getName(),
      },
      status: this._status,
      billingFrequency: this._billingFrequency,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      nextBillingDate: this._nextBillingDate.toISOString(),
      trialEndDate: this._trialEndDate?.toISOString() || null,
      currentPeriodUsage: this._currentPeriodUsage,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
    };
  }
}
