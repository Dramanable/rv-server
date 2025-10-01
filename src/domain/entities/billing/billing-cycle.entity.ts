import { NotificationCost } from '@domain/value-objects/billing/notification-cost.value-object';
import { DomainError } from '@domain/exceptions/domain.exceptions';

export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BillingStatus = 'ACTIVE' | 'FINALIZED' | 'CANCELLED';

export interface BillingCycleProps {
  readonly businessId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly period: BillingPeriod;
  readonly initialCost?: NotificationCost;
}

export interface BillingSummary {
  readonly billingCycleId: string;
  readonly businessId: string;
  readonly period: BillingPeriod;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly emailCount: number;
  readonly smsCount: number;
  readonly totalNotifications: number;
  readonly totalCost: NotificationCost;
  readonly currency: string;
  readonly status: BillingStatus;
  readonly finalizedAt: Date | null;
}

export class BillingCycle {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: string,
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _period: BillingPeriod,
    private _status: BillingStatus,
    private _totalCost: NotificationCost,
    private _emailCount: number,
    private _smsCount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _finalizedAt: Date | null = null,
  ) {
    this.validate();
  }

  static create(props: BillingCycleProps): BillingCycle {
    const id = this.generateId();
    const now = new Date();
    const initialCost = props.initialCost || NotificationCost.zero('EUR');

    return new BillingCycle(
      id,
      props.businessId,
      props.startDate,
      props.endDate,
      props.period,
      'ACTIVE',
      initialCost,
      0, // emailCount
      0, // smsCount
      now, // createdAt
      now, // updatedAt
    );
  }

  static reconstruct(
    id: string,
    businessId: string,
    startDate: Date,
    endDate: Date,
    period: BillingPeriod,
    status: BillingStatus,
    totalCost: NotificationCost,
    emailCount: number,
    smsCount: number,
    createdAt: Date,
    updatedAt: Date,
    finalizedAt: Date | null = null,
  ): BillingCycle {
    return new BillingCycle(
      id,
      businessId,
      startDate,
      endDate,
      period,
      status,
      totalCost,
      emailCount,
      smsCount,
      createdAt,
      updatedAt,
      finalizedAt,
    );
  }

  private static generateId(): string {
    return 'billing_' + Math.random().toString(36).substring(2, 15);
  }

  private validate(): void {
    if (!this._businessId || this._businessId.trim() === '') {
      throw new DomainError('Business ID is required');
    }

    if (this._endDate <= this._startDate) {
      throw new DomainError('End date must be after start date');
    }

    if (!['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(this._period)) {
      throw new DomainError('Period must be MONTHLY, QUARTERLY, or YEARLY');
    }

    // Validation de la durée pour les cycles mensuels
    if (this._period === 'MONTHLY') {
      const durationDays = this.getDurationInDays();
      if (durationDays < 28 || durationDays > 31) {
        throw new DomainError('Monthly cycle must be between 28 and 31 days');
      }
    }
  }

  addUsage(cost: NotificationCost): void {
    if (this._status === 'FINALIZED') {
      throw new DomainError('Cannot add usage to finalized billing cycle');
    }

    // Vérifier la cohérence des devises
    if (
      !this._totalCost.isZero() &&
      this._totalCost.getCurrency() !== cost.getCurrency()
    ) {
      throw new DomainError('All usage costs must be in the same currency');
    }

    this._totalCost = this._totalCost.add(cost);
    this._updatedAt = new Date();

    // Estimation du nombre de notifications basée sur les coûts standards
    // Note: Cette logique pourrait être améliorée avec des métadonnées plus précises
    if (cost.getAmount() > 0) {
      const emailCostEstimate = Math.round(cost.getAmount() / 0.02);
      const smsCostEstimate = Math.round(cost.getAmount() / 0.08);

      // Heuristique simple : si le coût est un multiple de 0.02, c'est probablement des emails
      if (cost.getAmount() % 0.02 === 0) {
        this._emailCount += emailCostEstimate;
      } else {
        this._smsCount += smsCostEstimate;
      }
    }
  }

  finalize(): void {
    if (this._status === 'FINALIZED') {
      throw new DomainError('Billing cycle is already finalized');
    }

    this._status = 'FINALIZED';
    this._finalizedAt = new Date();
    this._updatedAt = new Date();
  }

  isCurrentCycle(currentDate: Date = new Date()): boolean {
    return currentDate >= this._startDate && currentDate <= this._endDate;
  }

  getRemainingDays(currentDate: Date = new Date()): number {
    if (currentDate > this._endDate) {
      return 0;
    }

    const timeDiff = this._endDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private getDurationInDays(): number {
    const timeDiff = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  getBillingSummary(): BillingSummary {
    return {
      billingCycleId: this._id,
      businessId: this._businessId,
      period: this._period,
      startDate: this._startDate,
      endDate: this._endDate,
      emailCount: this._emailCount,
      smsCount: this._smsCount,
      totalNotifications: this._emailCount + this._smsCount,
      totalCost: this._totalCost,
      currency: this._totalCost.getCurrency(),
      status: this._status,
      finalizedAt: this._finalizedAt,
    };
  }

  getVolumeDiscount(): number {
    // Placeholder pour pricing dégressif futur
    return 0;
  }

  // Getters
  getId(): string {
    return this._id;
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

  getPeriod(): BillingPeriod {
    return this._period;
  }

  getStatus(): BillingStatus {
    return this._status;
  }

  getTotalCost(): NotificationCost {
    return this._totalCost;
  }

  getEmailCount(): number {
    return this._emailCount;
  }

  getSmsCount(): number {
    return this._smsCount;
  }

  getTotalNotificationsSent(): number {
    return this._emailCount + this._smsCount;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  getFinalizedAt(): Date | null {
    return this._finalizedAt;
  }

  // Serialization
  toJSON(): any {
    return {
      id: this._id,
      businessId: this._businessId,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      period: this._period,
      status: this._status,
      emailCount: this._emailCount,
      smsCount: this._smsCount,
      totalCost: {
        amount: this._totalCost.getAmount(),
        currency: this._totalCost.getCurrency(),
        formattedAmount: this._totalCost.getFormattedAmount(),
      },
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      finalizedAt: this._finalizedAt?.toISOString() || null,
    };
  }

  toString(): string {
    const startStr = this._startDate.toISOString().split('T')[0];
    const endStr = this._endDate.toISOString().split('T')[0];
    return `BillingCycle(${this._businessId}, ${this._period}, ${startStr} to ${endStr})`;
  }
}
