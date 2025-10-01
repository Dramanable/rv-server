# 💰 ARCHITECTURE FACTURATION NOTIFICATIONS - SYSTÈME DE BILLING INTÉGRÉ

## 🎯 Vision Business

Notre plateforme **facture les services de notifications** aux entreprises clientes selon un modèle **pay-per-use** avec tarification fixée par notre équipe.

### 📊 Modèle de Facturation

#### **Tarifs Fixés par Notre Entreprise**

```typescript
// Tarifs définis par NOUS (Platform Admins)
export const NOTIFICATION_PRICING = {
  EMAIL: {
    unitPrice: 0.02, // 2 centimes par email
    currency: 'EUR',
    description: 'Envoi email avec template personnalisé',
  },
  SMS: {
    unitPrice: 0.08, // 8 centimes par SMS
    currency: 'EUR',
    description: 'Envoi SMS France/Europe',
  },
  SMS_INTERNATIONAL: {
    unitPrice: 0.15, // 15 centimes SMS international
    currency: 'EUR',
    description: 'Envoi SMS international',
  },
  VOICE_CALL: {
    // Future feature
    unitPrice: 0.25,
    currency: 'EUR',
    description: 'Appel vocal automatisé',
  },
} as const;
```

#### **Facturation Par Plan**

- **Starter** (29€/mois) : 100 notifications incluses, puis €0.02/email + €0.08/SMS
- **Professional** (79€/mois) : 500 notifications incluses, puis €0.015/email + €0.06/SMS
- **Enterprise** (199€/mois) : 2000 notifications incluses, puis €0.01/email + €0.05/SMS
- **Custom** : Tarifs négociés selon volume

---

## 🏗️ Architecture Domain-Driven (TDD)

### **1️⃣ DOMAIN LAYER - Entities Business**

```
src/domain/entities/
├── billing/
│   ├── notification-usage.entity.ts          ← Consommation notifications
│   ├── billing-cycle.entity.ts               ← Cycle facturation mensuel
│   ├── invoice.entity.ts                     ← Facture générée
│   └── pricing-plan.entity.ts                ← Plans tarifaires
└── value-objects/
    ├── billing/
    │   ├── notification-cost.value-object.ts ← Coût unitaire
    │   ├── usage-quota.value-object.ts       ← Quota inclus
    │   └── billing-period.value-object.ts    ← Période facturation
```

### **2️⃣ APPLICATION LAYER - Use Cases Billing**

```
src/application/use-cases/billing/
├── track-notification-usage.use-case.ts      ← Traquer consommation
├── calculate-billing-cycle.use-case.ts       ← Calculer facture mensuelle
├── generate-invoice.use-case.ts              ← Générer facture
├── check-quota-limits.use-case.ts            ← Vérifier quotas
└── update-pricing-plan.use-case.ts           ← Changer plan (admin)
```

### **3️⃣ INFRASTRUCTURE LAYER - Billing Services**

```
src/infrastructure/services/billing/
├── notification-usage-tracker.service.ts     ← Service de tracking
├── invoice-generator.service.ts              ← Génération PDF factures
├── payment-processor.service.ts              ← Intégration Stripe
└── quota-enforcer.service.ts                 ← Enforcement limites
```

---

## 📋 DOMAIN ENTITIES - Architecture TDD

### **NotificationUsage Entity**

```typescript
// src/domain/entities/billing/notification-usage.entity.ts

import { DomainError } from '../../exceptions/domain.exceptions';
import { NotificationCost } from '../../value-objects/billing/notification-cost.value-object';

export interface NotificationUsageData {
  readonly businessId: string;
  readonly notificationId: string;
  readonly channel: 'EMAIL' | 'SMS' | 'VOICE' | 'PUSH';
  readonly destination: string; // Email ou numéro de téléphone
  readonly cost: NotificationCost;
  readonly sentAt: Date;
  readonly deliveredAt?: Date;
  readonly failedAt?: Date;
  readonly billingCycleId: string;
  readonly metadata: {
    readonly templateUsed?: string;
    readonly retryCount?: number;
    readonly campaignId?: string;
    readonly appointmentId?: string;
  };
}

export interface ReconstructUsageData extends NotificationUsageData {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entité représentant l'usage d'une notification pour facturation
 */
export class NotificationUsage {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: string,
    private readonly _notificationId: string,
    private readonly _channel: 'EMAIL' | 'SMS' | 'VOICE' | 'PUSH',
    private readonly _destination: string,
    private readonly _cost: NotificationCost,
    private readonly _sentAt: Date,
    private _deliveredAt?: Date,
    private _failedAt?: Date,
    private readonly _billingCycleId: string,
    private readonly _metadata: NotificationUsageData['metadata'],
    private readonly _createdAt: Date = new Date(),
    private readonly _updatedAt: Date = new Date(),
  ) {
    this.validateInvariants();
  }

  static create(data: NotificationUsageData): NotificationUsage {
    const id = crypto.randomUUID();

    return new NotificationUsage(
      id,
      data.businessId,
      data.notificationId,
      data.channel,
      data.destination,
      data.cost,
      data.sentAt,
      data.deliveredAt,
      data.failedAt,
      data.billingCycleId,
      data.metadata,
      new Date(),
      new Date(),
    );
  }

  static reconstruct(data: ReconstructUsageData): NotificationUsage {
    return new NotificationUsage(
      data.id,
      data.businessId,
      data.notificationId,
      data.channel,
      data.destination,
      data.cost,
      data.sentAt,
      data.deliveredAt,
      data.failedAt,
      data.billingCycleId,
      data.metadata,
      data.createdAt,
      data.updatedAt,
    );
  }

  private validateInvariants(): void {
    if (!this._businessId || this._businessId.trim().length === 0) {
      throw new DomainError('Business ID is required for billing');
    }

    if (!this._notificationId || this._notificationId.trim().length === 0) {
      throw new DomainError('Notification ID is required for tracking');
    }

    if (this._cost.getAmount() < 0) {
      throw new DomainError('Notification cost cannot be negative');
    }

    if (this._deliveredAt && this._deliveredAt < this._sentAt) {
      throw new DomainError('Delivered date cannot be before sent date');
    }

    if (this._failedAt && this._failedAt < this._sentAt) {
      throw new DomainError('Failed date cannot be before sent date');
    }
  }

  // Business Methods
  markAsDelivered(deliveredAt: Date = new Date()): NotificationUsage {
    if (this._failedAt) {
      throw new DomainError('Cannot mark failed notification as delivered');
    }

    return new NotificationUsage(
      this._id,
      this._businessId,
      this._notificationId,
      this._channel,
      this._destination,
      this._cost,
      this._sentAt,
      deliveredAt,
      this._failedAt,
      this._billingCycleId,
      this._metadata,
      this._createdAt,
      new Date(), // updatedAt
    );
  }

  markAsFailed(failedAt: Date = new Date()): NotificationUsage {
    if (this._deliveredAt) {
      throw new DomainError('Cannot mark delivered notification as failed');
    }

    return new NotificationUsage(
      this._id,
      this._businessId,
      this._notificationId,
      this._channel,
      this._destination,
      this._cost,
      this._sentAt,
      this._deliveredAt,
      failedAt,
      this._billingCycleId,
      this._metadata,
      this._createdAt,
      new Date(),
    );
  }

  // Getters
  getId(): string {
    return this._id;
  }
  getBusinessId(): string {
    return this._businessId;
  }
  getNotificationId(): string {
    return this._notificationId;
  }
  getChannel(): string {
    return this._channel;
  }
  getDestination(): string {
    return this._destination;
  }
  getCost(): NotificationCost {
    return this._cost;
  }
  getSentAt(): Date {
    return this._sentAt;
  }
  getDeliveredAt(): Date | undefined {
    return this._deliveredAt;
  }
  getFailedAt(): Date | undefined {
    return this._failedAt;
  }
  getBillingCycleId(): string {
    return this._billingCycleId;
  }
  getMetadata(): NotificationUsageData['metadata'] {
    return { ...this._metadata };
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Business Logic
  isDelivered(): boolean {
    return !!this._deliveredAt && !this._failedAt;
  }

  isFailed(): boolean {
    return !!this._failedAt;
  }

  isBillable(): boolean {
    // Ne facturer que les notifications livrées
    return this.isDelivered();
  }

  isRetry(): boolean {
    return (this._metadata.retryCount ?? 0) > 0;
  }
}
```

### **BillingCycle Entity**

```typescript
// src/domain/entities/billing/billing-cycle.entity.ts

import { DomainError } from '../../exceptions/domain.exceptions';
import { NotificationCost } from '../../value-objects/billing/notification-cost.value-object';
import { BillingPeriod } from '../../value-objects/billing/billing-period.value-object';

export interface BillingCycleData {
  readonly businessId: string;
  readonly period: BillingPeriod;
  readonly planType: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
  readonly includedQuota: {
    readonly email: number;
    readonly sms: number;
  };
  readonly unitPrices: {
    readonly email: NotificationCost;
    readonly sms: NotificationCost;
  };
}

export interface BillingCycleSummary {
  readonly totalUsage: {
    readonly email: number;
    readonly sms: number;
  };
  readonly totalCost: NotificationCost;
  readonly overageCharges: NotificationCost;
  readonly includedUsage: NotificationCost; // Valeur des notifications incluses
}

/**
 * Entité représentant un cycle de facturation mensuel
 */
export class BillingCycle {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: string,
    private readonly _period: BillingPeriod,
    private readonly _planType:
      | 'STARTER'
      | 'PROFESSIONAL'
      | 'ENTERPRISE'
      | 'CUSTOM',
    private readonly _includedQuota: BillingCycleData['includedQuota'],
    private readonly _unitPrices: BillingCycleData['unitPrices'],
    private _usageTracked: {
      email: number;
      sms: number;
    } = { email: 0, sms: 0 },
    private _totalCost: NotificationCost = NotificationCost.zero('EUR'),
    private _isFinalized: boolean = false,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    this.validateInvariants();
  }

  static create(data: BillingCycleData): BillingCycle {
    const id = crypto.randomUUID();

    return new BillingCycle(
      id,
      data.businessId,
      data.period,
      data.planType,
      data.includedQuota,
      data.unitPrices,
      { email: 0, sms: 0 },
      NotificationCost.zero('EUR'),
      false,
      new Date(),
      new Date(),
    );
  }

  private validateInvariants(): void {
    if (!this._businessId || this._businessId.trim().length === 0) {
      throw new DomainError('Business ID is required for billing cycle');
    }

    if (this._includedQuota.email < 0 || this._includedQuota.sms < 0) {
      throw new DomainError('Included quotas cannot be negative');
    }

    if (this._usageTracked.email < 0 || this._usageTracked.sms < 0) {
      throw new DomainError('Usage tracked cannot be negative');
    }
  }

  // Business Methods
  trackUsage(channel: 'EMAIL' | 'SMS', count: number = 1): BillingCycle {
    if (this._isFinalized) {
      throw new DomainError('Cannot track usage on finalized billing cycle');
    }

    const newUsage = { ...this._usageTracked };
    const channelKey = channel.toLowerCase() as 'email' | 'sms';
    newUsage[channelKey] += count;

    // Recalculer le coût total
    const newTotalCost = this.calculateTotalCost(newUsage);

    return new BillingCycle(
      this._id,
      this._businessId,
      this._period,
      this._planType,
      this._includedQuota,
      this._unitPrices,
      newUsage,
      newTotalCost,
      this._isFinalized,
      this._createdAt,
      new Date(),
    );
  }

  finalize(): BillingCycle {
    if (this._isFinalized) {
      throw new DomainError('Billing cycle is already finalized');
    }

    return new BillingCycle(
      this._id,
      this._businessId,
      this._period,
      this._planType,
      this._includedQuota,
      this._unitPrices,
      this._usageTracked,
      this._totalCost,
      true, // finalized
      this._createdAt,
      new Date(),
    );
  }

  private calculateTotalCost(usage: {
    email: number;
    sms: number;
  }): NotificationCost {
    const emailOverage = Math.max(0, usage.email - this._includedQuota.email);
    const smsOverage = Math.max(0, usage.sms - this._includedQuota.sms);

    const emailCost = emailOverage * this._unitPrices.email.getAmount();
    const smsCost = smsOverage * this._unitPrices.sms.getAmount();

    return NotificationCost.create(emailCost + smsCost, 'EUR');
  }

  // Business Queries
  getSummary(): BillingCycleSummary {
    const overageEmail = Math.max(
      0,
      this._usageTracked.email - this._includedQuota.email,
    );
    const overageSms = Math.max(
      0,
      this._usageTracked.sms - this._includedQuota.sms,
    );

    const overageCharges = NotificationCost.create(
      overageEmail * this._unitPrices.email.getAmount() +
        overageSms * this._unitPrices.sms.getAmount(),
      'EUR',
    );

    const includedEmailValue = Math.min(
      this._usageTracked.email,
      this._includedQuota.email,
    );
    const includedSmsValue = Math.min(
      this._usageTracked.sms,
      this._includedQuota.sms,
    );

    const includedUsage = NotificationCost.create(
      includedEmailValue * this._unitPrices.email.getAmount() +
        includedSmsValue * this._unitPrices.sms.getAmount(),
      'EUR',
    );

    return {
      totalUsage: { ...this._usageTracked },
      totalCost: this._totalCost,
      overageCharges,
      includedUsage,
    };
  }

  hasExceededQuota(channel: 'EMAIL' | 'SMS'): boolean {
    const channelKey = channel.toLowerCase() as 'email' | 'sms';
    return this._usageTracked[channelKey] > this._includedQuota[channelKey];
  }

  getRemainingQuota(channel: 'EMAIL' | 'SMS'): number {
    const channelKey = channel.toLowerCase() as 'email' | 'sms';
    return Math.max(
      0,
      this._includedQuota[channelKey] - this._usageTracked[channelKey],
    );
  }

  // Getters
  getId(): string {
    return this._id;
  }
  getBusinessId(): string {
    return this._businessId;
  }
  getPeriod(): BillingPeriod {
    return this._period;
  }
  getPlanType(): string {
    return this._planType;
  }
  getIncludedQuota(): BillingCycleData['includedQuota'] {
    return { ...this._includedQuota };
  }
  getUnitPrices(): BillingCycleData['unitPrices'] {
    return { ...this._unitPrices };
  }
  getUsageTracked(): { email: number; sms: number } {
    return { ...this._usageTracked };
  }
  getTotalCost(): NotificationCost {
    return this._totalCost;
  }
  isFinalized(): boolean {
    return this._isFinalized;
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }
}
```

---

## 🎯 VALUE OBJECTS - Billing

### **NotificationCost Value Object**

```typescript
// src/domain/value-objects/billing/notification-cost.value-object.ts

import { DomainError } from '../../exceptions/domain.exceptions';

export class NotificationCost {
  private constructor(
    private readonly amount: number,
    private readonly currency: 'EUR' | 'USD',
  ) {
    this.validate();
  }

  static create(amount: number, currency: 'EUR' | 'USD'): NotificationCost {
    return new NotificationCost(amount, currency);
  }

  static zero(currency: 'EUR' | 'USD' = 'EUR'): NotificationCost {
    return new NotificationCost(0, currency);
  }

  static fromEmailCount(count: number, unitPrice = 0.02): NotificationCost {
    return new NotificationCost(count * unitPrice, 'EUR');
  }

  static fromSMSCount(count: number, unitPrice = 0.08): NotificationCost {
    return new NotificationCost(count * unitPrice, 'EUR');
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new DomainError('Notification cost cannot be negative');
    }

    if (!['EUR', 'USD'].includes(this.currency)) {
      throw new DomainError('Currency must be EUR or USD');
    }

    // Validation précision (2 décimales max)
    if (Math.round(this.amount * 100) !== this.amount * 100) {
      throw new DomainError('Cost must have maximum 2 decimal places');
    }
  }

  add(other: NotificationCost): NotificationCost {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add costs with different currencies');
    }
    return new NotificationCost(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): NotificationCost {
    if (factor < 0) {
      throw new DomainError('Factor cannot be negative');
    }
    return new NotificationCost(this.amount * factor, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getFormattedAmount(): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(this.amount);
  }

  equals(other: NotificationCost): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toString(): string {
    return this.getFormattedAmount();
  }
}
```

---

## 🔄 USE CASES - Application Layer TDD

### **TrackNotificationUsageUseCase**

```typescript
// src/application/use-cases/billing/track-notification-usage.use-case.ts

import { INotificationUsageRepository } from '@domain/repositories/notification-usage.repository.interface';
import { IBillingCycleRepository } from '@domain/repositories/billing-cycle.repository.interface';
import { NotificationUsage } from '@domain/entities/billing/notification-usage.entity';
import { NotificationCost } from '@domain/value-objects/billing/notification-cost.value-object';
import { Logger } from '@application/ports/logger.port';

export interface TrackNotificationUsageRequest {
  readonly businessId: string;
  readonly notificationId: string;
  readonly channel: 'EMAIL' | 'SMS' | 'VOICE' | 'PUSH';
  readonly destination: string;
  readonly sentAt: Date;
  readonly deliveredAt?: Date;
  readonly failedAt?: Date;
  readonly metadata?: {
    readonly templateUsed?: string;
    readonly retryCount?: number;
    readonly campaignId?: string;
    readonly appointmentId?: string;
  };
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface TrackNotificationUsageResponse {
  readonly usageId: string;
  readonly cost: NotificationCost;
  readonly billingCycleId: string;
  readonly isOverQuota: boolean;
  readonly remainingQuota: {
    readonly email: number;
    readonly sms: number;
  };
}

export class TrackNotificationUsageUseCase {
  constructor(
    private readonly usageRepository: INotificationUsageRepository,
    private readonly billingCycleRepository: IBillingCycleRepository,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: TrackNotificationUsageRequest,
  ): Promise<TrackNotificationUsageResponse> {
    this.logger.info('Tracking notification usage for billing', {
      businessId: request.businessId,
      notificationId: request.notificationId,
      channel: request.channel,
      correlationId: request.correlationId,
    });

    try {
      // 1. Récupérer le cycle de facturation actuel
      const currentCycle =
        await this.billingCycleRepository.findCurrentByBusinessId(
          request.businessId,
        );

      if (!currentCycle) {
        throw new Error(
          `No active billing cycle found for business ${request.businessId}`,
        );
      }

      // 2. Calculer le coût selon le plan et les tarifs
      const cost = this.calculateNotificationCost(
        request.channel,
        currentCycle,
      );

      // 3. Créer l'entrée d'usage
      const usage = NotificationUsage.create({
        businessId: request.businessId,
        notificationId: request.notificationId,
        channel: request.channel,
        destination: request.destination,
        cost,
        sentAt: request.sentAt,
        deliveredAt: request.deliveredAt,
        failedAt: request.failedAt,
        billingCycleId: currentCycle.getId(),
        metadata: request.metadata || {},
      });

      // 4. Sauvegarder l'usage
      const savedUsage = await this.usageRepository.save(usage);

      // 5. Mettre à jour le cycle de facturation si la notification est facturée
      let updatedCycle = currentCycle;
      if (savedUsage.isBillable()) {
        updatedCycle = currentCycle.trackUsage(request.channel, 1);
        await this.billingCycleRepository.save(updatedCycle);

        this.logger.info('Usage tracked and billing cycle updated', {
          usageId: savedUsage.getId(),
          businessId: request.businessId,
          cost: cost.getFormattedAmount(),
          correlationId: request.correlationId,
        });
      } else {
        this.logger.warn('Notification not billable - failed delivery', {
          usageId: savedUsage.getId(),
          notificationId: request.notificationId,
          correlationId: request.correlationId,
        });
      }

      // 6. Vérifier si quotas dépassés
      const isOverQuota = updatedCycle.hasExceededQuota(request.channel);

      if (isOverQuota) {
        this.logger.warn('Business has exceeded quota for channel', {
          businessId: request.businessId,
          channel: request.channel,
          correlationId: request.correlationId,
        });
      }

      return {
        usageId: savedUsage.getId(),
        cost,
        billingCycleId: updatedCycle.getId(),
        isOverQuota,
        remainingQuota: {
          email: updatedCycle.getRemainingQuota('EMAIL'),
          sms: updatedCycle.getRemainingQuota('SMS'),
        },
      };
    } catch (error) {
      this.logger.error('Failed to track notification usage', {
        error: error.message,
        businessId: request.businessId,
        notificationId: request.notificationId,
        correlationId: request.correlationId,
      });
      throw error;
    }
  }

  private calculateNotificationCost(
    channel: 'EMAIL' | 'SMS' | 'VOICE' | 'PUSH',
    billingCycle: BillingCycle,
  ): NotificationCost {
    const unitPrices = billingCycle.getUnitPrices();

    switch (channel) {
      case 'EMAIL':
        return unitPrices.email;
      case 'SMS':
        return unitPrices.sms;
      case 'VOICE':
        // Future: implement voice pricing
        return NotificationCost.create(0.25, 'EUR');
      case 'PUSH':
        // Push notifications are free
        return NotificationCost.zero('EUR');
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }
}
```

---

## 🧪 TESTS TDD - Domain Entities

### **NotificationUsage Entity Tests**

```typescript
// src/domain/entities/billing/__tests__/notification-usage.entity.spec.ts

import { NotificationUsage } from '../notification-usage.entity';
import { NotificationCost } from '../../../value-objects/billing/notification-cost.value-object';
import { DomainError } from '../../../exceptions/domain.exceptions';

describe('NotificationUsage Entity', () => {
  const validUsageData = {
    businessId: 'business-123',
    notificationId: 'notif-456',
    channel: 'EMAIL' as const,
    destination: 'client@example.com',
    cost: NotificationCost.create(0.02, 'EUR'),
    sentAt: new Date(),
    billingCycleId: 'cycle-789',
    metadata: {
      templateUsed: 'appointment-reminder',
      appointmentId: 'appt-123',
    },
  };

  describe('create', () => {
    it('should create a valid notification usage', () => {
      // Arrange & Act
      const usage = NotificationUsage.create(validUsageData);

      // Assert
      expect(usage.getBusinessId()).toBe(validUsageData.businessId);
      expect(usage.getNotificationId()).toBe(validUsageData.notificationId);
      expect(usage.getChannel()).toBe(validUsageData.channel);
      expect(usage.getDestination()).toBe(validUsageData.destination);
      expect(usage.getCost()).toBe(validUsageData.cost);
      expect(usage.getSentAt()).toBe(validUsageData.sentAt);
      expect(usage.getBillingCycleId()).toBe(validUsageData.billingCycleId);
      expect(usage.getId()).toBeDefined();
      expect(usage.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should throw error when businessId is empty', () => {
      // Arrange
      const invalidData = { ...validUsageData, businessId: '' };

      // Act & Assert
      expect(() => NotificationUsage.create(invalidData)).toThrow(DomainError);
      expect(() => NotificationUsage.create(invalidData)).toThrow(
        'Business ID is required for billing',
      );
    });

    it('should throw error when notificationId is empty', () => {
      // Arrange
      const invalidData = { ...validUsageData, notificationId: '' };

      // Act & Assert
      expect(() => NotificationUsage.create(invalidData)).toThrow(
        'Notification ID is required for tracking',
      );
    });

    it('should throw error when cost is negative', () => {
      // Arrange
      const invalidData = {
        ...validUsageData,
        cost: NotificationCost.create(-0.01, 'EUR'),
      };

      // Act & Assert
      expect(() => NotificationUsage.create(invalidData)).toThrow(
        'Notification cost cannot be negative',
      );
    });
  });

  describe('markAsDelivered', () => {
    it('should mark notification as delivered', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);
      const deliveredAt = new Date();

      // Act
      const deliveredUsage = usage.markAsDelivered(deliveredAt);

      // Assert
      expect(deliveredUsage.getDeliveredAt()).toBe(deliveredAt);
      expect(deliveredUsage.isDelivered()).toBe(true);
      expect(deliveredUsage.isBillable()).toBe(true);
      expect(deliveredUsage.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw error when marking failed notification as delivered', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);
      const failedUsage = usage.markAsFailed();

      // Act & Assert
      expect(() => failedUsage.markAsDelivered()).toThrow(
        'Cannot mark failed notification as delivered',
      );
    });
  });

  describe('markAsFailed', () => {
    it('should mark notification as failed', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);
      const failedAt = new Date();

      // Act
      const failedUsage = usage.markAsFailed(failedAt);

      // Assert
      expect(failedUsage.getFailedAt()).toBe(failedAt);
      expect(failedUsage.isFailed()).toBe(true);
      expect(failedUsage.isBillable()).toBe(false);
    });

    it('should throw error when marking delivered notification as failed', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);
      const deliveredUsage = usage.markAsDelivered();

      // Act & Assert
      expect(() => deliveredUsage.markAsFailed()).toThrow(
        'Cannot mark delivered notification as failed',
      );
    });
  });

  describe('business logic', () => {
    it('should identify retry notifications', () => {
      // Arrange
      const retryData = {
        ...validUsageData,
        metadata: { ...validUsageData.metadata, retryCount: 2 },
      };
      const usage = NotificationUsage.create(retryData);

      // Act & Assert
      expect(usage.isRetry()).toBe(true);
    });

    it('should identify non-retry notifications', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);

      // Act & Assert
      expect(usage.isRetry()).toBe(false);
    });

    it('should only bill delivered notifications', () => {
      // Arrange
      const usage = NotificationUsage.create(validUsageData);

      // Act & Assert
      expect(usage.isBillable()).toBe(false); // Not delivered yet

      const deliveredUsage = usage.markAsDelivered();
      expect(deliveredUsage.isBillable()).toBe(true); // Now billable

      const failedUsage = usage.markAsFailed();
      expect(failedUsage.isBillable()).toBe(false); // Failed, not billable
    });
  });
});
```

---

## 🔗 INTÉGRATION AVEC SYSTÈME NOTIFICATIONS

### **Modification du NotificationProcessor**

```typescript
// src/infrastructure/queues/processors/notification.processor.ts

import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TrackNotificationUsageUseCase } from '@application/use-cases/billing/track-notification-usage.use-case';

@Processor(NotificationQueue.IMMEDIATE)
export class NotificationProcessor {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly sendSMSUseCase: SendSMSUseCase,
    private readonly trackUsageUseCase: TrackNotificationUsageUseCase, // ⚠️ NOUVEAU
    private readonly logger: Logger,
  ) {}

  @Process('send-notification')
  async handleNotification(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, channel, businessId } = job.data;

    this.logger.info('Processing notification', {
      notificationId,
      channel,
      businessId,
      jobId: job.id,
    });

    try {
      // 1. Récupérer la notification depuis la DB
      const notification =
        await this.notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      let deliveredAt: Date | undefined;
      let failedAt: Date | undefined;

      // 2. Envoyer selon le canal
      try {
        switch (channel) {
          case 'EMAIL':
            await this.sendEmailUseCase.execute({
              recipientEmail: notification.getRecipientId(), // Assuming it's email
              subject: notification.getTitle(),
              content: notification.getContent(),
              // ... autres params
            });
            deliveredAt = new Date();
            break;

          case 'SMS':
            await this.sendSMSUseCase.execute({
              recipientPhone: notification.getRecipientId(), // Assuming it's phone
              message: notification.getContent(),
              // ... autres params
            });
            deliveredAt = new Date();
            break;

          default:
            throw new Error(`Unsupported channel: ${channel}`);
        }

        // 3. Marquer comme envoyé en DB
        const sentNotification = notification.markAsSent();
        if (deliveredAt) {
          const deliveredNotification = sentNotification.markAsDelivered();
          await this.notificationRepository.save(deliveredNotification);
        }
      } catch (sendError) {
        // 3bis. Marquer comme échoué en DB
        failedAt = new Date();
        const failedNotification = notification.markAsFailed(sendError.message);
        await this.notificationRepository.save(failedNotification);
        throw sendError; // Re-throw pour retry BullMQ
      }

      // 4. ⚠️ NOUVEAU : Tracker l'usage pour facturation
      await this.trackUsageUseCase.execute({
        businessId,
        notificationId,
        channel,
        destination: this.getDestinationFromNotification(notification),
        sentAt: notification.getSentAt() || new Date(),
        deliveredAt,
        failedAt,
        metadata: {
          templateUsed: job.data.templateId,
          retryCount: job.attemptsMade,
          appointmentId: job.data.metadata?.appointmentId,
        },
        requestingUserId: 'system',
        correlationId: job.data.correlationId,
      });

      this.logger.info(
        'Notification processed and usage tracked successfully',
        {
          notificationId,
          channel,
          businessId,
          delivered: !!deliveredAt,
          jobId: job.id,
        },
      );
    } catch (error) {
      this.logger.error('Failed to process notification', {
        error: error.message,
        notificationId,
        channel,
        businessId,
        jobId: job.id,
      });
      throw error; // Important: re-throw pour BullMQ retry
    }
  }

  private getDestinationFromNotification(notification: Notification): string {
    // Logique pour extraire email/phone selon le type de notification
    // Cette méthode dépend de votre modèle de données
    return notification.getRecipientId();
  }
}
```

---

## 📊 DASHBOARD FACTURATION - API Endpoints

### **Controllers pour Billing**

```typescript
// src/presentation/controllers/billing.controller.ts

@ApiTags('💰 Billing & Usage')
@Controller('api/v1/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  @Get('current-cycle')
  @ApiOperation({
    summary: '📊 Get Current Billing Cycle',
    description: 'Retrieve current billing cycle with usage and costs',
  })
  @Roles('BUSINESS_OWNER', 'PLATFORM_ADMIN')
  async getCurrentCycle(
    @GetUser() user: User,
    @Query('businessId') businessId?: string,
  ): Promise<BillingCycleResponseDto> {
    // Implementation avec use case
  }

  @Get('usage/notifications')
  @ApiOperation({
    summary: '📈 Get Notifications Usage Details',
    description: 'Detailed breakdown of notification usage for billing period',
  })
  async getNotificationUsage(
    @GetUser() user: User,
    @Query() query: GetUsageQueryDto,
  ): Promise<NotificationUsageResponseDto> {
    // Implementation avec use case
  }

  @Get('invoices')
  @ApiOperation({
    summary: '🧾 List Generated Invoices',
    description: 'List all invoices for business with download links',
  })
  async getInvoices(
    @GetUser() user: User,
    @Query() query: ListInvoicesQueryDto,
  ): Promise<InvoiceListResponseDto> {
    // Implementation avec use case
  }

  @Post('invoices/:id/download')
  @ApiOperation({
    summary: '⬇️ Download Invoice PDF',
    description: 'Generate and download invoice as PDF',
  })
  async downloadInvoice(
    @Param('id') invoiceId: string,
    @GetUser() user: User,
    @Res() response: Response,
  ): Promise<void> {
    // Generate PDF and stream to response
  }

  // ⚠️ PLATFORM ADMIN ONLY
  @Patch('pricing')
  @ApiOperation({
    summary: '💎 Update Notification Pricing (Admin Only)',
    description: 'Update platform-wide notification pricing',
  })
  @Roles('PLATFORM_ADMIN')
  async updatePricing(
    @Body() dto: UpdatePricingDto,
    @GetUser() user: User,
  ): Promise<PricingUpdateResponseDto> {
    // Implementation avec use case
  }
}
```

---

## 💰 BUSINESS METRICS & ANALYTICS

### **Métriques Business Importantes**

```typescript
// Types pour analytics financières
export interface NotificationRevenueMetrics {
  readonly totalRevenue: NotificationCost;
  readonly revenueByChannel: {
    readonly email: NotificationCost;
    readonly sms: NotificationCost;
    readonly voice: NotificationCost;
  };
  readonly revenueByPlan: {
    readonly starter: NotificationCost;
    readonly professional: NotificationCost;
    readonly enterprise: NotificationCost;
    readonly custom: NotificationCost;
  };
  readonly avgRevenuePerBusiness: NotificationCost;
  readonly topPayingBusinesses: Array<{
    readonly businessId: string;
    readonly businessName: string;
    readonly revenue: NotificationCost;
    readonly notificationCount: number;
  }>;
}
```

### **Dashboard Métriques**

```typescript
// Endpoints pour Platform Admins
@Get('admin/revenue-analytics')
@Roles('PLATFORM_ADMIN')
async getRevenueAnalytics(
  @Query('period') period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  @Query('startDate') startDate?: Date,
  @Query('endDate') endDate?: Date,
): Promise<NotificationRevenueMetrics> {
  // Analytics sur les revenus notifications
}

@Get('admin/cost-optimization')
@Roles('PLATFORM_ADMIN')
async getCostOptimization(): Promise<CostOptimizationReport> {
  // Rapport d'optimisation des coûts
  // - Channels les plus rentables
  // - Businesses qui consomment le plus
  // - Opportunités d'upsell
}
```

---

## ✅ PLAN D'IMPLÉMENTATION TDD

### **Sprint 1 : Domain & Value Objects**

- [ ] **Jour 1** : NotificationUsage Entity + Tests
- [ ] **Jour 2** : BillingCycle Entity + Tests
- [ ] **Jour 3** : NotificationCost Value Object + Tests
- [ ] **Jour 4** : BillingPeriod & autres Value Objects + Tests
- [ ] **Jour 5** : Repository Interfaces + Domain Services

### **Sprint 2 : Application Use Cases**

- [ ] **Jour 1** : TrackNotificationUsageUseCase + Tests
- [ ] **Jour 2** : CalculateBillingCycleUseCase + Tests
- [ ] **Jour 3** : GenerateInvoiceUseCase + Tests
- [ ] **Jour 4** : CheckQuotaLimitsUseCase + Tests
- [ ] **Jour 5** : Integration Tests Use Cases

### **Sprint 3 : Infrastructure & Integration**

- [ ] **Jour 1** : TypeORM Repositories (Usage, BillingCycle)
- [ ] **Jour 2** : Modification NotificationProcessor avec billing
- [ ] **Jour 3** : Invoice Generator Service (PDF)
- [ ] **Jour 4** : Quota Enforcer Service
- [ ] **Jour 5** : Migration base de données + Tests

### **Sprint 4 : Presentation & Dashboard**

- [ ] **Jour 1** : BillingController + DTOs
- [ ] **Jour 2** : Dashboard Components (usage, coûts)
- [ ] **Jour 3** : Admin Analytics & Revenue Metrics
- [ ] **Jour 4** : Tests E2E complets
- [ ] **Jour 5** : Documentation + Review

---

## 🎯 Validation Business

**Coûts estimés avec facturation :**

### **Revenus Mensuels Potentiels**

- **1000 businesses actives**
- **Moyenne 100 notifications/business/mois**
- **Mix : 70% Email (€0.02) + 30% SMS (€0.08)**
- **Revenu moyen** : (70 × €0.02) + (30 × €0.08) = €1.40 + €2.40 = **€3.80/business/mois**
- **Total mensuel** : 1000 × €3.80 = **€3 800/mois** en revenus notifications

### **Coûts Notre Côté**

- **SendGrid** : ~€30/mois
- **Twilio SMS** : ~€2 500/mois (après négociation volume)
- **Marge nette** : €3 800 - €2 530 = **€1 270/mois** (33% de marge)

**Très viable financièrement ! 💰**

---

**Prêt à démarrer l'implémentation TDD ? 🚀**
