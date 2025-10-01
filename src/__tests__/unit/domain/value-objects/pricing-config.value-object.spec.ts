/**
 * 🧪 PRICING CONFIG VALUE OBJECT TESTS
 * ✅ Domain Layer - TDD Tests
 */

import { Money } from "@domain/value-objects/money.value-object";
import {
  PricingConfig,
  PricingRule,
  PricingType,
  PricingVisibility,
} from "@domain/value-objects/pricing-config.value-object";

describe("PricingConfig Value Object", () => {
  describe("Free Pricing", () => {
    it("should create free pricing configuration", () => {
      // WHEN
      const pricing = PricingConfig.createFree();

      // THEN
      expect(pricing.getType()).toBe(PricingType.FREE);
      expect(pricing.getVisibility()).toBe(PricingVisibility.PUBLIC);
      expect(pricing.getBasePrice()?.getAmount()).toBe(0);
      expect(pricing.isFree()).toBe(true);
      expect(pricing.isVisibleToPublic()).toBe(true);
    });

    it("should create free pricing with custom visibility", () => {
      // WHEN
      const pricing = PricingConfig.createFree(
        PricingVisibility.AUTHENTICATED,
        "Free for members",
      );

      // THEN
      expect(pricing.getVisibility()).toBe(PricingVisibility.AUTHENTICATED);
      expect(pricing.getDescription()).toBe("Free for members");
      expect(pricing.isVisibleToPublic()).toBe(false);
    });

    it("should calculate zero price for free pricing", () => {
      // GIVEN
      const pricing = PricingConfig.createFree();

      // WHEN
      const price = pricing.calculatePrice(60);

      // THEN
      expect(price.getAmount()).toBe(0);
      expect(price.getCurrency()).toBe("EUR");
    });
  });

  describe("Fixed Pricing", () => {
    it("should create fixed pricing configuration", () => {
      // GIVEN
      const basePrice = Money.create(5000, "EUR"); // 50.00 EUR

      // WHEN
      const pricing = PricingConfig.createFixed(basePrice);

      // THEN
      expect(pricing.getType()).toBe(PricingType.FIXED);
      expect(pricing.getBasePrice()?.equals(basePrice)).toBe(true);
      expect(pricing.isFree()).toBe(false);
    });

    it("should reject negative base price", () => {
      // WHEN & THEN - Money itself rejects negative amounts
      expect(() => Money.create(-1000, "EUR")).toThrow(
        "Amount cannot be negative",
      );
    });

    it("should calculate fixed price regardless of duration", () => {
      // GIVEN
      const basePrice = Money.create(5000, "EUR");
      const pricing = PricingConfig.createFixed(basePrice);

      // WHEN
      const price30min = pricing.calculatePrice(30);
      const price120min = pricing.calculatePrice(120);

      // THEN
      expect(price30min.equals(basePrice)).toBe(true);
      expect(price120min.equals(basePrice)).toBe(true);
    });
  });

  describe("Variable Pricing", () => {
    it("should create variable pricing with rules", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 30,
          maxDuration: 60,
          basePrice: Money.create(3000, "EUR"),
          pricePerMinute: Money.create(50, "EUR"),
        },
        {
          minDuration: 61,
          maxDuration: 120,
          basePrice: Money.create(5000, "EUR"),
          pricePerMinute: Money.create(40, "EUR"),
        },
      ];

      // WHEN
      const pricing = PricingConfig.createVariable(rules);

      // THEN
      expect(pricing.getType()).toBe(PricingType.VARIABLE);
      expect(pricing.getRules()).toHaveLength(2);
      expect(pricing.getBasePrice()?.getAmount()).toBe(3000); // Premier prix de base
    });

    it("should reject empty rules", () => {
      // WHEN & THEN
      expect(() => PricingConfig.createVariable([])).toThrow(
        "pricingRules is required",
      );
    });

    it("should calculate price based on duration rules", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 30,
          maxDuration: 60,
          basePrice: Money.create(3000, "EUR"), // 30 EUR base
          pricePerMinute: Money.create(50, "EUR"), // 0.50 EUR/min extra
        },
      ];
      const pricing = PricingConfig.createVariable(rules);

      // WHEN
      const priceExact = pricing.calculatePrice(30); // Prix de base exact
      const priceExtra = pricing.calculatePrice(45); // Prix de base + 15 min extra

      // THEN
      expect(priceExact.getAmount()).toBe(3000); // 30 EUR
      expect(priceExtra.getAmount()).toBe(3750); // 30 EUR + (15 * 0.50) = 37.50 EUR
    });

    it("should throw error for duration without applicable rule", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 30,
          maxDuration: 60,
          basePrice: Money.create(3000, "EUR"),
        },
      ];
      const pricing = PricingConfig.createVariable(rules);

      // WHEN & THEN
      expect(() => pricing.calculatePrice(120)).toThrow(
        "No pricing rule found for duration: 120 minutes",
      );
    });
  });

  describe("Hidden Pricing", () => {
    it("should create hidden pricing configuration", () => {
      // WHEN
      const pricing = PricingConfig.createHidden("Internal pricing");

      // THEN
      expect(pricing.getType()).toBe(PricingType.HIDDEN);
      expect(pricing.getVisibility()).toBe(PricingVisibility.HIDDEN);
      expect(pricing.getBasePrice()).toBeNull();
      expect(pricing.isVisibleToPublic()).toBe(false);
    });

    it("should not allow price calculation for hidden pricing", () => {
      // GIVEN
      const pricing = PricingConfig.createHidden();

      // WHEN & THEN
      expect(() => pricing.calculatePrice(60)).toThrow(
        "Cannot calculate price for hidden or on-demand pricing",
      );
    });
  });

  describe("On-Demand Pricing", () => {
    it("should create on-demand pricing configuration", () => {
      // WHEN
      const pricing = PricingConfig.createOnDemand();

      // THEN
      expect(pricing.getType()).toBe(PricingType.ON_DEMAND);
      expect(pricing.getVisibility()).toBe(PricingVisibility.AUTHENTICATED);
      expect(pricing.getBasePrice()).toBeNull();
    });

    it("should not allow price calculation for on-demand pricing", () => {
      // GIVEN
      const pricing = PricingConfig.createOnDemand();

      // WHEN & THEN
      expect(() => pricing.calculatePrice(60)).toThrow(
        "Cannot calculate price for hidden or on-demand pricing",
      );
    });
  });

  describe("Visibility Logic", () => {
    it("should handle public visibility correctly", () => {
      // GIVEN
      const pricing = PricingConfig.createFixed(
        Money.create(5000, "EUR"),
        PricingVisibility.PUBLIC,
      );

      // THEN
      expect(pricing.isVisibleToUser(false, false)).toBe(true); // Anonyme
      expect(pricing.isVisibleToUser(true, false)).toBe(true); // Connecté
      expect(pricing.isVisibleToUser(true, true)).toBe(true); // Staff
    });

    it("should handle authenticated visibility correctly", () => {
      // GIVEN
      const pricing = PricingConfig.createFixed(
        Money.create(5000, "EUR"),
        PricingVisibility.AUTHENTICATED,
      );

      // THEN
      expect(pricing.isVisibleToUser(false, false)).toBe(false); // Anonyme
      expect(pricing.isVisibleToUser(true, false)).toBe(true); // Connecté
      expect(pricing.isVisibleToUser(true, true)).toBe(true); // Staff
    });

    it("should handle private visibility correctly", () => {
      // GIVEN
      const pricing = PricingConfig.createFixed(
        Money.create(5000, "EUR"),
        PricingVisibility.PRIVATE,
      );

      // THEN
      expect(pricing.isVisibleToUser(false, false)).toBe(false); // Anonyme
      expect(pricing.isVisibleToUser(true, false)).toBe(false); // Connecté
      expect(pricing.isVisibleToUser(true, true)).toBe(true); // Staff
    });

    it("should handle hidden visibility correctly", () => {
      // GIVEN
      const pricing = PricingConfig.createHidden();

      // THEN
      expect(pricing.isVisibleToUser(false, false)).toBe(false); // Anonyme
      expect(pricing.isVisibleToUser(true, false)).toBe(false); // Connecté
      expect(pricing.isVisibleToUser(true, true)).toBe(false); // Staff
    });
  });

  describe("Serialization", () => {
    it("should serialize and deserialize fixed pricing", () => {
      // GIVEN
      const original = PricingConfig.createFixed(
        Money.create(5000, "EUR"),
        PricingVisibility.PUBLIC,
        "Standard pricing",
      );

      // WHEN
      const json = original.toJSON();
      const restored = PricingConfig.fromJSON(json);

      // THEN
      expect(restored.getType()).toBe(original.getType());
      expect(restored.getVisibility()).toBe(original.getVisibility());
      expect(restored.getBasePrice()?.equals(original.getBasePrice()!)).toBe(
        true,
      );
      expect(restored.getDescription()).toBe(original.getDescription());
    });

    it("should serialize and deserialize variable pricing", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 30,
          maxDuration: 60,
          basePrice: Money.create(3000, "EUR"),
          pricePerMinute: Money.create(50, "EUR"),
        },
      ];
      const original = PricingConfig.createVariable(
        rules,
        PricingVisibility.AUTHENTICATED,
      );

      // WHEN
      const json = original.toJSON();
      const restored = PricingConfig.fromJSON(json);

      // THEN
      expect(restored.getType()).toBe(original.getType());
      expect(restored.getRules()).toHaveLength(1);
      expect(restored.getRules()[0].basePrice.equals(rules[0].basePrice)).toBe(
        true,
      );
      expect(
        restored.getRules()[0].pricePerMinute?.equals(rules[0].pricePerMinute!),
      ).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero duration for variable pricing", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 0,
          maxDuration: 30,
          basePrice: Money.create(1000, "EUR"),
        },
      ];
      const pricing = PricingConfig.createVariable(rules);

      // WHEN
      const price = pricing.calculatePrice(0);

      // THEN
      expect(price.getAmount()).toBe(1000);
    });

    it("should handle exact boundary durations", () => {
      // GIVEN
      const rules: PricingRule[] = [
        {
          minDuration: 30,
          maxDuration: 60,
          basePrice: Money.create(3000, "EUR"),
        },
        {
          minDuration: 61,
          maxDuration: 120,
          basePrice: Money.create(5000, "EUR"),
        },
      ];
      const pricing = PricingConfig.createVariable(rules);

      // WHEN
      const price60 = pricing.calculatePrice(60); // Limite haute première règle
      const price61 = pricing.calculatePrice(61); // Limite basse deuxième règle

      // THEN
      expect(price60.getAmount()).toBe(3000);
      expect(price61.getAmount()).toBe(5000);
    });
  });
});
