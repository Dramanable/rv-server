/**
 * @fileoverview NotificationChannel Value Object Tests
 * @module Domain/ValueObjects
 * @version 1.0.0
 */

import { DomainError } from "@domain/exceptions/domain.exceptions";
import {
  NotificationChannel,
  NotificationChannelType,
} from "@domain/value-objects/notification-channel.value-object";

describe("NotificationChannel Value Object", () => {
  describe("🔴 RED Phase - Factory Methods", () => {
    it("should create EMAIL channel", () => {
      const channel = NotificationChannel.email();

      expect(channel.getValue()).toBe("EMAIL");
      expect(channel.isEmail()).toBe(true);
      expect(channel.isSms()).toBe(false);
      expect(channel.isPush()).toBe(false);
      expect(channel.isInApp()).toBe(false);
    });

    it("should create SMS channel", () => {
      const channel = NotificationChannel.sms();

      expect(channel.getValue()).toBe("SMS");
      expect(channel.isSms()).toBe(true);
      expect(channel.isEmail()).toBe(false);
      expect(channel.isPush()).toBe(false);
      expect(channel.isInApp()).toBe(false);
    });

    it("should create PUSH channel", () => {
      const channel = NotificationChannel.push();

      expect(channel.getValue()).toBe("PUSH");
      expect(channel.isPush()).toBe(true);
      expect(channel.isEmail()).toBe(false);
      expect(channel.isSms()).toBe(false);
      expect(channel.isInApp()).toBe(false);
    });

    it("should create IN_APP channel", () => {
      const channel = NotificationChannel.inApp();

      expect(channel.getValue()).toBe("IN_APP");
      expect(channel.isInApp()).toBe(true);
      expect(channel.isEmail()).toBe(false);
      expect(channel.isSms()).toBe(false);
      expect(channel.isPush()).toBe(false);
    });
  });

  describe("🔴 RED Phase - Generic Factory", () => {
    it("should create channel from valid string", () => {
      const channel = NotificationChannel.fromString("EMAIL");

      expect(channel.getValue()).toBe("EMAIL");
      expect(channel.isEmail()).toBe(true);
    });

    it("should throw error for invalid channel type", () => {
      expect(() => {
        NotificationChannel.fromString("INVALID");
      }).toThrow(DomainError);
    });

    it("should throw error for empty channel type", () => {
      expect(() => {
        NotificationChannel.fromString("");
      }).toThrow(DomainError);
    });

    it("should throw error for null channel type", () => {
      expect(() => {
        NotificationChannel.fromString(null as any);
      }).toThrow(DomainError);
    });
  });

  describe("🔴 RED Phase - Business Rules", () => {
    it("should support synchronous delivery for EMAIL", () => {
      const channel = NotificationChannel.email();

      expect(channel.supportsSynchronousDelivery()).toBe(true);
    });

    it("should support synchronous delivery for SMS", () => {
      const channel = NotificationChannel.sms();

      expect(channel.supportsSynchronousDelivery()).toBe(true);
    });

    it("should support synchronous delivery for PUSH", () => {
      const channel = NotificationChannel.push();

      expect(channel.supportsSynchronousDelivery()).toBe(true);
    });

    it("should support synchronous delivery for IN_APP", () => {
      const channel = NotificationChannel.inApp();

      expect(channel.supportsSynchronousDelivery()).toBe(true);
    });

    it("should allow rich content for EMAIL", () => {
      const channel = NotificationChannel.email();

      expect(channel.supportsRichContent()).toBe(true);
    });

    it("should not allow rich content for SMS", () => {
      const channel = NotificationChannel.sms();

      expect(channel.supportsRichContent()).toBe(false);
    });

    it("should allow rich content for PUSH", () => {
      const channel = NotificationChannel.push();

      expect(channel.supportsRichContent()).toBe(true);
    });

    it("should allow rich content for IN_APP", () => {
      const channel = NotificationChannel.inApp();

      expect(channel.supportsRichContent()).toBe(true);
    });

    it("should require recipient info for EMAIL", () => {
      const channel = NotificationChannel.email();

      expect(channel.requiresRecipientInfo()).toBe(true);
    });

    it("should require recipient info for SMS", () => {
      const channel = NotificationChannel.sms();

      expect(channel.requiresRecipientInfo()).toBe(true);
    });

    it("should require recipient info for PUSH", () => {
      const channel = NotificationChannel.push();

      expect(channel.requiresRecipientInfo()).toBe(true);
    });

    it("should not require recipient info for IN_APP", () => {
      const channel = NotificationChannel.inApp();

      expect(channel.requiresRecipientInfo()).toBe(false);
    });
  });

  describe("🔴 RED Phase - Content Limits", () => {
    it("should return unlimited content limit for EMAIL", () => {
      const channel = NotificationChannel.email();

      expect(channel.getMaxContentLength()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("should return 160 character limit for SMS", () => {
      const channel = NotificationChannel.sms();

      expect(channel.getMaxContentLength()).toBe(160);
    });

    it("should return 1000 character limit for PUSH", () => {
      const channel = NotificationChannel.push();

      expect(channel.getMaxContentLength()).toBe(1000);
    });

    it("should return 5000 character limit for IN_APP", () => {
      const channel = NotificationChannel.inApp();

      expect(channel.getMaxContentLength()).toBe(5000);
    });
  });

  describe("🔴 RED Phase - Equality and String Representation", () => {
    it("should be equal when same channel type", () => {
      const channel1 = NotificationChannel.email();
      const channel2 = NotificationChannel.email();

      expect(channel1.equals(channel2)).toBe(true);
    });

    it("should not be equal when different channel types", () => {
      const channel1 = NotificationChannel.email();
      const channel2 = NotificationChannel.sms();

      expect(channel1.equals(channel2)).toBe(false);
    });

    it("should return proper string representation", () => {
      const channel = NotificationChannel.email();

      expect(channel.toString()).toBe("EMAIL");
    });
  });

  describe("🔴 RED Phase - All Valid Channels", () => {
    it("should return all valid channel types", () => {
      const validChannels = NotificationChannel.getAllValidChannels();

      expect(validChannels).toEqual([
        NotificationChannelType.EMAIL,
        NotificationChannelType.SMS,
        NotificationChannelType.PUSH,
        NotificationChannelType.IN_APP,
      ]);
    });

    it("should validate that EMAIL is valid channel", () => {
      expect(NotificationChannel.isValidChannel("EMAIL")).toBe(true);
    });

    it("should validate that SMS is valid channel", () => {
      expect(NotificationChannel.isValidChannel("SMS")).toBe(true);
    });

    it("should validate that PUSH is valid channel", () => {
      expect(NotificationChannel.isValidChannel("PUSH")).toBe(true);
    });

    it("should validate that IN_APP is valid channel", () => {
      expect(NotificationChannel.isValidChannel("IN_APP")).toBe(true);
    });

    it("should validate that INVALID is not valid channel", () => {
      expect(NotificationChannel.isValidChannel("INVALID")).toBe(false);
    });

    it("should validate that empty string is not valid channel", () => {
      expect(NotificationChannel.isValidChannel("")).toBe(false);
    });
  });
});
