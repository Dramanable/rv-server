import { DomainError } from "../../exceptions/domain.exceptions";
import { Subscription } from "./subscription.entity";
import { NotificationCost } from "../../value-objects/billing/notification-cost.value-object";
import { generateId } from "../../../shared/utils/id.utils";

export type SubscriptionBillingStatus =
  | "PENDING" // En attente de traitement
  | "PROCESSING" // En cours de traitement
  | "COMPLETED" // Terminé avec succès
  | "FAILED" // Échec de facturation
  | "REFUNDED"; // Remboursé

export interface SubscriptionBillingCycleUsage {
  readonly notifications: number;
  readonly businesses: number;
  readonly staff: number;
  readonly services: number;
  readonly apiCalls: number;
  readonly storageUsedGB: number;
}

export interface SubscriptionBillingCycleCharges {
  readonly baseCost: NotificationCost;
  readonly notificationOverage: NotificationCost;
  readonly setupFees: NotificationCost;
  readonly discounts: NotificationCost;
  readonly taxes: NotificationCost;
  readonly totalCost: NotificationCost;
}

/**
 * Entité représentant un cycle de facturation pour un abonnement
 * Complémentaire à BillingCycle existant mais pour les subscriptions
 */
export class SubscriptionBillingCycle {
  private constructor(
    private readonly _id: string,
    private readonly _subscriptionId: string,
    private readonly _businessId: string,
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private _status: SubscriptionBillingStatus,
    private _usage: SubscriptionBillingCycleUsage,
    private _charges: SubscriptionBillingCycleCharges,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _processedAt: Date | null = null,
    private _failureReason: string | null = null,
  ) {}

  static create(params: {
    subscriptionId: string;
    businessId: string;
    startDate: Date;
    endDate: Date;
  }): SubscriptionBillingCycle {
    // Validation des dates
    if (params.startDate >= params.endDate) {
      throw new DomainError("Start date must be before end date");
    }

    const now = new Date();
    const zeroCost = NotificationCost.zero("EUR");

    return new SubscriptionBillingCycle(
      generateId(),
      params.subscriptionId,
      params.businessId,
      params.startDate,
      params.endDate,
      "PENDING",
      {
        notifications: 0,
        businesses: 0,
        staff: 0,
        services: 0,
        apiCalls: 0,
        storageUsedGB: 0,
      },
      {
        baseCost: zeroCost,
        notificationOverage: zeroCost,
        setupFees: zeroCost,
        discounts: zeroCost,
        taxes: zeroCost,
        totalCost: zeroCost,
      },
      now,
      now,
    );
  }

  static fromSubscription(
    subscription: Subscription,
    startDate: Date,
    endDate: Date,
  ): SubscriptionBillingCycle {
    const cycle = SubscriptionBillingCycle.create({
      subscriptionId: subscription.getId(),
      businessId: subscription.getBusinessId(),
      startDate,
      endDate,
    });

    // Initialiser avec les données de l'abonnement
    const subscriptionUsage = subscription.getCurrentPeriodUsage();
    cycle._usage = {
      notifications: subscriptionUsage.notifications,
      businesses: subscriptionUsage.businesses,
      staff: subscriptionUsage.staff,
      services: subscriptionUsage.services,
      apiCalls: 0, // TODO: Tracker les appels API
      storageUsedGB: 0, // TODO: Tracker le stockage
    };

    return cycle;
  }

  // 🆔 Getters de base
  getId(): string {
    return this._id;
  }
  getSubscriptionId(): string {
    return this._subscriptionId;
  }
  getBusinessId(): string {
    return this._businessId;
  }
  getStartDate(): Date {
    return this._startDate;
  }
  getEndDate(): Date {
    return this._endDate;
  }
  getStatus(): SubscriptionBillingStatus {
    return this._status;
  }
  getUsage(): SubscriptionBillingCycleUsage {
    return { ...this._usage };
  }
  getCharges(): SubscriptionBillingCycleCharges {
    return { ...this._charges };
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }
  getProcessedAt(): Date | null {
    return this._processedAt;
  }
  getFailureReason(): string | null {
    return this._failureReason;
  }

  // 📊 Calculs et mise à jour
  calculateCharges(subscription: Subscription): void {
    const plan = subscription.getPlan();
    const baseCost = plan.calculatePriceForPeriod(
      subscription.getBillingFrequency(),
    );

    // Calcul des dépassements de notifications
    const planFeatures = plan.getFeatures();
    const excessNotifications = Math.max(
      0,
      this._usage.notifications - planFeatures.maxNotificationsPerMonth,
    );
    const notificationOverage = plan.calculateOverageCost(excessNotifications);

    // TODO: Calculer les taxes selon les règles locales
    const taxes = NotificationCost.zero(
      baseCost.getCurrency() as "EUR" | "USD",
    );

    // TODO: Appliquer les remises si applicables
    const discounts = NotificationCost.zero(
      baseCost.getCurrency() as "EUR" | "USD",
    );

    // Frais de configuration (une seule fois pour nouveau client)
    const setupFees = NotificationCost.zero(
      baseCost.getCurrency() as "EUR" | "USD",
    );

    const totalCost = baseCost
      .add(notificationOverage)
      .add(setupFees)
      .add(taxes)
      .subtract(discounts);

    this._charges = {
      baseCost,
      notificationOverage,
      setupFees,
      discounts,
      taxes,
      totalCost,
    };

    this._updatedAt = new Date();
  }

  // 📈 Enregistrement d'usage
  recordNotificationUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Notification usage count cannot be negative");
    }

    this._usage = {
      ...this._usage,
      notifications: this._usage.notifications + count,
    };

    this._updatedAt = new Date();
  }

  recordBusinessUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Business usage count cannot be negative");
    }

    this._usage = {
      ...this._usage,
      businesses: Math.max(this._usage.businesses, count), // Utilisation maximum dans la période
    };

    this._updatedAt = new Date();
  }

  recordStaffUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Staff usage count cannot be negative");
    }

    this._usage = {
      ...this._usage,
      staff: Math.max(this._usage.staff, count), // Utilisation maximum dans la période
    };

    this._updatedAt = new Date();
  }

  recordServiceUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("Service usage count cannot be negative");
    }

    this._usage = {
      ...this._usage,
      services: Math.max(this._usage.services, count), // Utilisation maximum dans la période
    };

    this._updatedAt = new Date();
  }

  recordApiUsage(count: number): void {
    if (count < 0) {
      throw new DomainError("API usage count cannot be negative");
    }

    this._usage = {
      ...this._usage,
      apiCalls: this._usage.apiCalls + count,
    };

    this._updatedAt = new Date();
  }

  recordStorageUsage(sizeGB: number): void {
    if (sizeGB < 0) {
      throw new DomainError("Storage usage cannot be negative");
    }

    this._usage = {
      ...this._usage,
      storageUsedGB: Math.max(this._usage.storageUsedGB, sizeGB), // Utilisation maximum dans la période
    };

    this._updatedAt = new Date();
  }

  // 🔄 Gestion du statut
  markAsProcessing(): void {
    if (this._status !== "PENDING") {
      throw new DomainError(
        `Cannot process billing cycle with status ${this._status}`,
      );
    }

    this._status = "PROCESSING";
    this._updatedAt = new Date();
  }

  markAsCompleted(): void {
    if (this._status !== "PROCESSING") {
      throw new DomainError("Can only complete processing billing cycles");
    }

    this._status = "COMPLETED";
    this._processedAt = new Date();
    this._updatedAt = new Date();
    this._failureReason = null;
  }

  markAsFailed(reason: string): void {
    if (this._status !== "PROCESSING") {
      throw new DomainError("Can only fail processing billing cycles");
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainError("Failure reason is required");
    }

    this._status = "FAILED";
    this._failureReason = reason.trim();
    this._updatedAt = new Date();
  }

  retry(): void {
    if (this._status !== "FAILED") {
      throw new DomainError("Can only retry failed billing cycles");
    }

    this._status = "PENDING";
    this._failureReason = null;
    this._updatedAt = new Date();
  }

  refund(reason: string): void {
    if (this._status !== "COMPLETED") {
      throw new DomainError("Can only refund completed billing cycles");
    }

    if (!reason || reason.trim().length === 0) {
      throw new DomainError("Refund reason is required");
    }

    this._status = "REFUNDED";
    this._failureReason = reason.trim(); // Réutiliser pour la raison du remboursement
    this._updatedAt = new Date();
  }

  // 🔍 Vérifications d'état
  isPending(): boolean {
    return this._status === "PENDING";
  }

  isProcessing(): boolean {
    return this._status === "PROCESSING";
  }

  isCompleted(): boolean {
    return this._status === "COMPLETED";
  }

  isFailed(): boolean {
    return this._status === "FAILED";
  }

  isRefunded(): boolean {
    return this._status === "REFUNDED";
  }

  isCurrentPeriod(): boolean {
    const now = new Date();
    return now >= this._startDate && now <= this._endDate;
  }

  // 📊 Métriques
  getDurationInDays(): number {
    return Math.ceil(
      (this._endDate.getTime() - this._startDate.getTime()) /
        (24 * 60 * 60 * 1000),
    );
  }

  getUsageRatio(): number {
    const duration = this.getDurationInDays();
    const elapsed = Math.min(
      duration,
      Math.ceil(
        (new Date().getTime() - this._startDate.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
    return Math.max(0, Math.min(1, elapsed / duration));
  }

  // 💰 Prédictions de coût
  predictTotalCost(subscription: Subscription): NotificationCost {
    if (this.isCompleted() || this.isRefunded()) {
      return this._charges.totalCost;
    }

    const usageRatio = this.getUsageRatio();
    if (usageRatio === 0) {
      return NotificationCost.zero(
        this._charges.baseCost.getCurrency() as "EUR" | "USD",
      );
    }

    // Prédiction basée sur l'usage actuel projeté sur la période complète
    const projectedNotifications = Math.ceil(
      this._usage.notifications / usageRatio,
    );
    const plan = subscription.getPlan();
    const planFeatures = plan.getFeatures();
    const projectedExcess = Math.max(
      0,
      projectedNotifications - planFeatures.maxNotificationsPerMonth,
    );
    const projectedOverage = plan.calculateOverageCost(projectedExcess);

    return this._charges.baseCost.add(projectedOverage);
  }

  // 📄 Sérialisation
  toJSON(): any {
    return {
      id: this._id,
      subscriptionId: this._subscriptionId,
      businessId: this._businessId,
      period: {
        startDate: this._startDate.toISOString(),
        endDate: this._endDate.toISOString(),
        durationDays: this.getDurationInDays(),
        isCurrentPeriod: this.isCurrentPeriod(),
      },
      status: this._status,
      usage: this._usage,
      charges: {
        baseCost: this._charges.baseCost.toJSON(),
        notificationOverage: this._charges.notificationOverage.toJSON(),
        setupFees: this._charges.setupFees.toJSON(),
        discounts: this._charges.discounts.toJSON(),
        taxes: this._charges.taxes.toJSON(),
        totalCost: this._charges.totalCost.toJSON(),
      },
      processing: {
        createdAt: this._createdAt.toISOString(),
        updatedAt: this._updatedAt.toISOString(),
        processedAt: this._processedAt?.toISOString() || null,
        failureReason: this._failureReason,
      },
      metrics: {
        usageRatio: this.getUsageRatio(),
      },
    };
  }

  toString(): string {
    const period = `${this._startDate.toISOString().split("T")[0]} - ${this._endDate.toISOString().split("T")[0]}`;
    return `SubscriptionBillingCycle(${this._id}) - ${period} - ${this._status} - ${this._charges.totalCost.getFormattedAmount()}`;
  }
}
