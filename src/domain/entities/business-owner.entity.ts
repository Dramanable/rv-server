/**
 * 🏢 BUSINESS OWNER ENTITY
 * ✅ Clean Architecture - Domain Layer
 *
 * Représente un propriétaire d'entreprise dans le contexte SaaS multi-tenant.
 * Cette entité gère les aspects métier spécifiques aux propriétaires :
 * - Abonnements et facturation
 * - Permissions business avancées
 * - Configuration entreprise
 * - Analytics et rapports
 */

import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { BusinessOwnerId } from '@domain/value-objects/business-owner-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';

export enum SubscriptionLevel {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BusinessPermission {
  CONFIGURE_BUSINESS_SETTINGS = 'CONFIGURE_BUSINESS_SETTINGS',
  MANAGE_STAFF = 'MANAGE_STAFF',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_BILLING = 'MANAGE_BILLING',
  CONFIGURE_INTEGRATIONS = 'CONFIGURE_INTEGRATIONS',
  MANAGE_BRANDING = 'MANAGE_BRANDING',
  EXPORT_DATA = 'EXPORT_DATA',
}

export interface BillingInformation {
  readonly subscriptionLevel: SubscriptionLevel;
  readonly billingEmail: string;
  readonly paymentMethod?: string;
  readonly subscriptionStartDate: Date;
  readonly subscriptionEndDate?: Date;
  readonly isActive: boolean;
  readonly lastPaymentDate?: Date;
}

export interface AnalyticsPreferences {
  readonly enableAdvancedReports: boolean;
  readonly emailReportsFrequency: 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  readonly dashboardWidgets: string[];
  readonly dataRetentionMonths: number;
}

export class BusinessOwner {
  constructor(
    private readonly _id: BusinessOwnerId,
    private readonly _userId: UserId,
    private readonly _businessId: BusinessId,
    private _subscriptionLevel: SubscriptionLevel,
    private _permissions: BusinessPermission[],
    private _billingInfo: BillingInformation,
    private _analyticsPreferences: AnalyticsPreferences,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private readonly _createdBy: string,
    private _updatedBy: string,
  ) {}

  // Getters
  getId(): BusinessOwnerId {
    return this._id;
  }

  getUserId(): UserId {
    return this._userId;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  getSubscriptionLevel(): SubscriptionLevel {
    return this._subscriptionLevel;
  }

  getPermissions(): BusinessPermission[] {
    return [...this._permissions];
  }

  getBillingInfo(): BillingInformation {
    return this._billingInfo;
  }

  getAnalyticsPreferences(): AnalyticsPreferences {
    return this._analyticsPreferences;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  getCreatedBy(): string {
    return this._createdBy;
  }

  getUpdatedBy(): string {
    return this._updatedBy;
  }

  // Factory method
  static create(data: {
    userId: UserId;
    businessId: BusinessId;
    subscriptionLevel: SubscriptionLevel;
    billingEmail: string;
    createdBy: string;
  }): BusinessOwner {
    const now = new Date();
    const permissions = this.getDefaultPermissions(data.subscriptionLevel);

    const billingInfo: BillingInformation = {
      subscriptionLevel: data.subscriptionLevel,
      billingEmail: data.billingEmail,
      subscriptionStartDate: now,
      isActive: true,
    };

    const analyticsPreferences: AnalyticsPreferences = {
      enableAdvancedReports: data.subscriptionLevel !== SubscriptionLevel.FREE,
      emailReportsFrequency: 'WEEKLY',
      dashboardWidgets: ['appointments', 'revenue', 'staff_performance'],
      dataRetentionMonths:
        data.subscriptionLevel === SubscriptionLevel.ENTERPRISE ? 60 : 24,
    };

    return new BusinessOwner(
      BusinessOwnerId.generate(),
      data.userId,
      data.businessId,
      data.subscriptionLevel,
      permissions,
      billingInfo,
      analyticsPreferences,
      true, // isActive
      now, // createdAt
      now, // updatedAt
      data.createdBy,
      data.createdBy, // createdBy = updatedBy initially
    );
  }

  // Reconstruction method for persistence
  static reconstruct(data: {
    id: BusinessOwnerId;
    userId: UserId;
    businessId: BusinessId;
    subscriptionLevel: SubscriptionLevel;
    permissions: BusinessPermission[];
    billingInfo: BillingInformation;
    analyticsPreferences: AnalyticsPreferences;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  }): BusinessOwner {
    return new BusinessOwner(
      data.id,
      data.userId,
      data.businessId,
      data.subscriptionLevel,
      data.permissions,
      data.billingInfo,
      data.analyticsPreferences,
      data.isActive,
      data.createdAt,
      data.updatedAt,
      data.createdBy,
      data.updatedBy,
    );
  }

  // Business logic methods
  canConfigureBusiness(): boolean {
    return (
      this._isActive &&
      this._permissions.includes(BusinessPermission.CONFIGURE_BUSINESS_SETTINGS)
    );
  }

  hasAccessToAnalytics(): boolean {
    return (
      this._isActive &&
      this._permissions.includes(BusinessPermission.VIEW_ANALYTICS)
    );
  }

  canManageStaff(): boolean {
    return (
      this._isActive &&
      this._permissions.includes(BusinessPermission.MANAGE_STAFF)
    );
  }

  canManageBilling(): boolean {
    return (
      this._isActive &&
      this._permissions.includes(BusinessPermission.MANAGE_BILLING)
    );
  }

  getBillingStatus(): 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' {
    if (!this._billingInfo.isActive) return 'SUSPENDED';

    if (
      this._billingInfo.subscriptionEndDate &&
      this._billingInfo.subscriptionEndDate < new Date()
    ) {
      return 'EXPIRED';
    }

    return 'ACTIVE';
  }

  hasPermission(permission: BusinessPermission): boolean {
    return this._isActive && this._permissions.includes(permission);
  }

  // Update methods
  updateSubscription(data: {
    subscriptionLevel: SubscriptionLevel;
    billingInfo: Partial<BillingInformation>;
    updatedBy: string;
  }): void {
    this._subscriptionLevel = data.subscriptionLevel;
    this._permissions = BusinessOwner.getDefaultPermissions(
      data.subscriptionLevel,
    );

    this._billingInfo = {
      ...this._billingInfo,
      ...data.billingInfo,
      subscriptionLevel: data.subscriptionLevel,
    };

    this._updatedBy = data.updatedBy;
    this._updatedAt = new Date();
  }

  updateAnalyticsPreferences(
    preferences: Partial<AnalyticsPreferences>,
    updatedBy: string,
  ): void {
    this._analyticsPreferences = {
      ...this._analyticsPreferences,
      ...preferences,
    };

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  activate(updatedBy: string): void {
    this._isActive = true;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  deactivate(updatedBy: string): void {
    this._isActive = false;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  // Private helper methods
  private static getDefaultPermissions(
    subscriptionLevel: SubscriptionLevel,
  ): BusinessPermission[] {
    const basePermissions = [
      BusinessPermission.CONFIGURE_BUSINESS_SETTINGS,
      BusinessPermission.MANAGE_STAFF,
    ];

    switch (subscriptionLevel) {
      case SubscriptionLevel.FREE:
        return basePermissions;

      case SubscriptionLevel.BASIC:
        return [
          ...basePermissions,
          BusinessPermission.VIEW_ANALYTICS,
          BusinessPermission.MANAGE_BRANDING,
        ];

      case SubscriptionLevel.PREMIUM:
        return [
          ...basePermissions,
          BusinessPermission.VIEW_ANALYTICS,
          BusinessPermission.MANAGE_BILLING,
          BusinessPermission.MANAGE_BRANDING,
          BusinessPermission.CONFIGURE_INTEGRATIONS,
        ];

      case SubscriptionLevel.ENTERPRISE:
        return Object.values(BusinessPermission);

      default:
        return basePermissions;
    }
  }
}
