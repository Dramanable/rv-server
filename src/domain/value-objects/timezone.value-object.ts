/**
 * 🌍 Timezone Value Object
 *
 * Gestion stricte des fuseaux horaires avec validation et support IANA.
 */

import { DomainValidationError } from "@domain/exceptions/domain.exceptions";

export class Timezone {
  private constructor(private readonly value: string) {
    this.validateTimezone(value);
  }

  private validateTimezone(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new DomainValidationError(
        "TIMEZONE_EMPTY",
        "Timezone cannot be empty",
        { value },
      );
    }

    // Validation basique des formats IANA
    const validTimezonePattern =
      /^[A-Z][a-z_]+\/[A-Z][a-z_]+(?:\/[A-Z][a-z_]+)*$/;
    if (!validTimezonePattern.test(value) && !this.isUtcOffset(value)) {
      throw new DomainValidationError(
        "TIMEZONE_INVALID_FORMAT",
        "Timezone must be a valid IANA timezone or UTC offset",
        {
          value,
          examples: ["Europe/Paris", "America/New_York", "UTC", "+02:00"],
        },
      );
    }

    // Vérification supplémentaire pour les timezones communes
    if (!this.isSupportedTimezone(value)) {
      throw new DomainValidationError(
        "TIMEZONE_NOT_SUPPORTED",
        "Timezone is not in the supported list",
        { value, supportedExample: "Europe/Paris" },
      );
    }
  }

  private isUtcOffset(value: string): boolean {
    return /^UTC([+-]\d{2}:\d{2})?$|^[+-]\d{2}:\d{2}$/.test(value);
  }

  private isSupportedTimezone(value: string): boolean {
    const supportedTimezones = [
      // Europe
      "Europe/Paris",
      "Europe/London",
      "Europe/Berlin",
      "Europe/Rome",
      "Europe/Madrid",
      "Europe/Amsterdam",
      "Europe/Brussels",
      "Europe/Vienna",
      "Europe/Zurich",
      "Europe/Stockholm",
      "Europe/Oslo",
      "Europe/Helsinki",
      "Europe/Copenhagen",
      "Europe/Dublin",
      "Europe/Lisbon",
      "Europe/Prague",
      "Europe/Warsaw",
      "Europe/Budapest",
      "Europe/Bucharest",
      "Europe/Sofia",
      "Europe/Athens",
      "Europe/Istanbul",
      "Europe/Kiev",
      "Europe/Moscow",

      // Americas
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Toronto",
      "America/Vancouver",
      "America/Montreal",
      "America/Mexico_City",
      "America/Sao_Paulo",
      "America/Buenos_Aires",
      "America/Lima",
      "America/Bogota",
      "America/Caracas",

      // Asia-Pacific
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Hong_Kong",
      "Asia/Singapore",
      "Asia/Bangkok",
      "Asia/Jakarta",
      "Asia/Seoul",
      "Asia/Taipei",
      "Asia/Manila",
      "Asia/Kuala_Lumpur",
      "Asia/Mumbai",
      "Asia/Dubai",
      "Asia/Riyadh",
      "Asia/Tel_Aviv",
      "Asia/Ankara",

      // Africa
      "Africa/Cairo",
      "Africa/Lagos",
      "Africa/Nairobi",
      "Africa/Johannesburg",
      "Africa/Casablanca",
      "Africa/Tunis",
      "Africa/Algiers",

      // Australia/Oceania
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Brisbane",
      "Australia/Perth",
      "Australia/Adelaide",
      "Australia/Darwin",
      "Pacific/Auckland",
      "Pacific/Fiji",
      "Pacific/Honolulu",

      // UTC and offsets
      "UTC",
      "+00:00",
      "+01:00",
      "+02:00",
      "+03:00",
      "+04:00",
      "+05:00",
      "+06:00",
      "+07:00",
      "+08:00",
      "+09:00",
      "+10:00",
      "+11:00",
      "+12:00",
      "-01:00",
      "-02:00",
      "-03:00",
      "-04:00",
      "-05:00",
      "-06:00",
      "-07:00",
      "-08:00",
      "-09:00",
      "-10:00",
      "-11:00",
      "-12:00",
    ];

    return supportedTimezones.includes(value);
  }

  /**
   * Factory methods
   */
  static create(value: string): Timezone {
    return new Timezone(value.trim());
  }

  static createDefault(): Timezone {
    return new Timezone("Europe/Paris");
  }

  static createUtc(): Timezone {
    return new Timezone("UTC");
  }

  static fromUserLocation(countryCode: string): Timezone {
    const countryTimezones: Record<string, string> = {
      FR: "Europe/Paris",
      GB: "Europe/London",
      DE: "Europe/Berlin",
      US: "America/New_York",
      CA: "America/Toronto",
      JP: "Asia/Tokyo",
      CN: "Asia/Shanghai",
      IN: "Asia/Mumbai",
      AU: "Australia/Sydney",
      BR: "America/Sao_Paulo",
      MX: "America/Mexico_City",
      ES: "Europe/Madrid",
      IT: "Europe/Rome",
      NL: "Europe/Amsterdam",
      BE: "Europe/Brussels",
      CH: "Europe/Zurich",
    };

    const timezone = countryTimezones[countryCode.toUpperCase()];
    return timezone ? new Timezone(timezone) : Timezone.createDefault();
  }

  /**
   * Business logic
   */
  getValue(): string {
    return this.value;
  }

  getOffset(): string {
    if (this.isUtcOffset(this.value)) {
      return this.value.replace("UTC", "");
    }

    // Pour les timezones IANA, on retourne un offset approximatif
    // En réalité, cela devrait utiliser une vraie librairie comme date-fns-tz
    const offsetMap: Record<string, string> = {
      "Europe/Paris": "+01:00",
      "Europe/London": "+00:00",
      "Europe/Berlin": "+01:00",
      "America/New_York": "-05:00",
      "America/Los_Angeles": "-08:00",
      "Asia/Tokyo": "+09:00",
      "Asia/Shanghai": "+08:00",
      UTC: "+00:00",
    };

    return offsetMap[this.value] || "+00:00";
  }

  isUtc(): boolean {
    return this.value === "UTC" || this.value === "+00:00";
  }

  getDisplayName(): string {
    const displayNames: Record<string, string> = {
      "Europe/Paris": "Europe/Paris (CET/CEST)",
      "Europe/London": "Europe/London (GMT/BST)",
      "Europe/Berlin": "Europe/Berlin (CET/CEST)",
      "America/New_York": "America/New_York (EST/EDT)",
      "America/Los_Angeles": "America/Los_Angeles (PST/PDT)",
      "Asia/Tokyo": "Asia/Tokyo (JST)",
      "Asia/Shanghai": "Asia/Shanghai (CST)",
      UTC: "UTC (Coordinated Universal Time)",
    };

    return displayNames[this.value] || `${this.value} (${this.getOffset()})`;
  }

  /**
   * Comparison and conversion
   */
  equals(other: Timezone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }

  /**
   * Validation helpers
   */
  static isValidTimezone(value: string): boolean {
    try {
      new Timezone(value);
      return true;
    } catch {
      return false;
    }
  }

  static getSupportedTimezones(): string[] {
    return [
      "Europe/Paris",
      "Europe/London",
      "Europe/Berlin",
      "Europe/Rome",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Mumbai",
      "Australia/Sydney",
      "UTC",
    ];
  }
}
