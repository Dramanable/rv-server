/**
 * 💰 PRICING CONFIG VALUE OBJECT
 * ✅ Clean Architecture - Domain Layer
 * ✅ Configuration flexible de tarification pour services
 */

import { Money } from './money.value-object';

export enum PricingType {
  FREE = 'FREE', // Service gratuit
  FIXED = 'FIXED', // Prix fixe
  VARIABLE = 'VARIABLE', // Prix variable selon durée/options
  HIDDEN = 'HIDDEN', // Prix non visible au public
  ON_DEMAND = 'ON_DEMAND', // Prix sur demande
}

export enum PricingVisibility {
  PUBLIC = 'PUBLIC', // Visible par tous
  AUTHENTICATED = 'AUTHENTICATED', // Visible par utilisateurs connectés
  PRIVATE = 'PRIVATE', // Visible seulement par staff/admin
  HIDDEN = 'HIDDEN', // Complètement masqué
}

export interface PricingRule {
  readonly minDuration?: number; // Durée minimum en minutes
  readonly maxDuration?: number; // Durée maximum en minutes
  readonly basePrice: Money; // Prix de base
  readonly pricePerMinute?: Money; // Prix par minute supplémentaire
}

export class PricingConfig {
  private constructor(
    private readonly _type: PricingType,
    private readonly _visibility: PricingVisibility,
    private readonly _basePrice: Money | null,
    private readonly _rules: readonly PricingRule[],
    private readonly _description?: string,
  ) {
    this.validate();
  }

  static createFree(
    visibility: PricingVisibility = PricingVisibility.PUBLIC,
    description?: string,
  ): PricingConfig {
    return new PricingConfig(
      PricingType.FREE,
      visibility,
      Money.create(0, 'EUR'),
      [],
      description,
    );
  }

  static createFixed(
    basePrice: Money,
    visibility: PricingVisibility = PricingVisibility.PUBLIC,
    description?: string,
  ): PricingConfig {
    return new PricingConfig(
      PricingType.FIXED,
      visibility,
      basePrice,
      [],
      description,
    );
  }

  static createVariable(
    rules: readonly PricingRule[],
    visibility: PricingVisibility = PricingVisibility.PUBLIC,
    description?: string,
  ): PricingConfig {
    if (rules.length === 0) {
      throw new Error('Variable pricing requires at least one rule');
    }

    // Utiliser le prix de base de la première règle
    const basePrice = rules[0].basePrice;

    return new PricingConfig(
      PricingType.VARIABLE,
      visibility,
      basePrice,
      rules,
      description,
    );
  }

  static createHidden(description?: string): PricingConfig {
    return new PricingConfig(
      PricingType.HIDDEN,
      PricingVisibility.HIDDEN,
      null,
      [],
      description,
    );
  }

  static createOnDemand(
    visibility: PricingVisibility = PricingVisibility.AUTHENTICATED,
    description?: string,
  ): PricingConfig {
    return new PricingConfig(
      PricingType.ON_DEMAND,
      visibility,
      null,
      [],
      description,
    );
  }

  private validate(): void {
    switch (this._type) {
      case PricingType.FREE:
        if (!this._basePrice || this._basePrice.getAmount() !== 0) {
          throw new Error('Free pricing must have zero base price');
        }
        break;

      case PricingType.FIXED:
        if (!this._basePrice || this._basePrice.getAmount() < 0) {
          throw new Error('Fixed pricing requires valid base price');
        }
        break;

      case PricingType.VARIABLE:
        if (this._rules.length === 0) {
          throw new Error('Variable pricing requires pricing rules');
        }
        break;

      case PricingType.HIDDEN:
        if (this._visibility !== PricingVisibility.HIDDEN) {
          throw new Error('Hidden pricing must have hidden visibility');
        }
        break;
    }
  }

  // Getters
  getType(): PricingType {
    return this._type;
  }

  getVisibility(): PricingVisibility {
    return this._visibility;
  }

  getBasePrice(): Money | null {
    return this._basePrice;
  }

  getRules(): readonly PricingRule[] {
    return this._rules;
  }

  getDescription(): string | undefined {
    return this._description;
  }

  // Business methods
  isFree(): boolean {
    return this._type === PricingType.FREE;
  }

  isVisibleToPublic(): boolean {
    return this._visibility === PricingVisibility.PUBLIC;
  }

  isVisibleToUser(isAuthenticated: boolean, isStaff: boolean = false): boolean {
    switch (this._visibility) {
      case PricingVisibility.PUBLIC:
        return true;
      case PricingVisibility.AUTHENTICATED:
        return isAuthenticated;
      case PricingVisibility.PRIVATE:
        return isStaff;
      case PricingVisibility.HIDDEN:
        return false;
      default:
        return false;
    }
  }

  calculatePrice(durationMinutes: number, _options?: any): Money {
    switch (this._type) {
      case PricingType.FREE:
        return Money.create(0, this._basePrice!.getCurrency());

      case PricingType.FIXED:
        return this._basePrice!;

      case PricingType.VARIABLE:
        return this.calculateVariablePrice(durationMinutes);

      case PricingType.HIDDEN:
      case PricingType.ON_DEMAND:
        throw new Error(
          'Cannot calculate price for hidden or on-demand pricing',
        );

      default:
        throw new Error(`Unsupported pricing type: ${String(this._type)}`);
    }
  }

  private calculateVariablePrice(durationMinutes: number): Money {
    // Trouver la règle applicable
    const applicableRule = this._rules.find((rule) => {
      const minOk = !rule.minDuration || durationMinutes >= rule.minDuration;
      const maxOk = !rule.maxDuration || durationMinutes <= rule.maxDuration;
      return minOk && maxOk;
    });

    if (!applicableRule) {
      throw new Error(
        `No pricing rule found for duration: ${durationMinutes} minutes`,
      );
    }

    let totalPrice = applicableRule.basePrice;

    // Ajouter le coût par minute si applicable
    if (applicableRule.pricePerMinute && applicableRule.minDuration) {
      const extraMinutes = Math.max(
        0,
        durationMinutes - applicableRule.minDuration,
      );
      if (extraMinutes > 0) {
        const extraCost = Money.create(
          applicableRule.pricePerMinute.getAmount() * extraMinutes,
          applicableRule.pricePerMinute.getCurrency(),
        );
        totalPrice = totalPrice.add(extraCost);
      }
    }

    return totalPrice;
  }

  // Sérialisation pour persistence
  toJSON(): any {
    return {
      type: this._type,
      visibility: this._visibility,
      basePrice: this._basePrice?.toJSON() || null,
      rules: this._rules.map((rule) => ({
        minDuration: rule.minDuration,
        maxDuration: rule.maxDuration,
        basePrice: rule.basePrice.toJSON(),
        pricePerMinute: rule.pricePerMinute?.toJSON() || null,
      })),
      description: this._description,
    };
  }

  static fromJSON(data: any): PricingConfig {
    const basePrice = data.basePrice ? Money.fromJSON(data.basePrice) : null;
    const rules = data.rules.map((rule: any) => ({
      minDuration: rule.minDuration,
      maxDuration: rule.maxDuration,
      basePrice: Money.fromJSON(rule.basePrice),
      pricePerMinute: rule.pricePerMinute
        ? Money.fromJSON(rule.pricePerMinute)
        : undefined,
    }));

    return new PricingConfig(
      data.type,
      data.visibility,
      basePrice,
      rules,
      data.description,
    );
  }
}
