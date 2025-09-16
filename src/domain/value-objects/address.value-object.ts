export class Address {
  constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly postalCode: string,
    private readonly country: string,
    private readonly region?: string,
    private readonly additionalInfo?: string,
    private readonly latitude?: number,
    private readonly longitude?: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.street || this.street.trim().length === 0) {
      throw new Error('Street address is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!this.postalCode || this.postalCode.trim().length === 0) {
      throw new Error('Postal code is required');
    }

    if (!this.country || this.country.trim().length === 0) {
      throw new Error('Country is required');
    }

    // Validation du code postal français
    if (
      this.country.toLowerCase() === 'france' ||
      this.country.toLowerCase() === 'fr'
    ) {
      const frenchPostalRegex = /^[0-9]{5}$/;
      if (!frenchPostalRegex.test(this.postalCode.trim())) {
        throw new Error('Invalid French postal code format');
      }
    }

    // Validation des coordonnées géographiques
    if (this.latitude !== undefined) {
      if (this.latitude < -90 || this.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
      }
    }

    if (this.longitude !== undefined) {
      if (this.longitude < -180 || this.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
      }
    }
  }

  static create(data: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    region?: string;
    additionalInfo?: string;
    latitude?: number;
    longitude?: number;
  }): Address {
    return new Address(
      data.street.trim(),
      data.city.trim(),
      data.postalCode.trim(),
      data.country.trim(),
      data.region?.trim(),
      data.additionalInfo?.trim(),
      data.latitude,
      data.longitude,
    );
  }

  // Getters
  getStreet(): string {
    return this.street;
  }

  getCity(): string {
    return this.city;
  }

  getPostalCode(): string {
    return this.postalCode;
  }

  getCountry(): string {
    return this.country;
  }

  getRegion(): string | undefined {
    return this.region;
  }

  getAdditionalInfo(): string | undefined {
    return this.additionalInfo;
  }

  getLatitude(): number | undefined {
    return this.latitude;
  }

  getLongitude(): number | undefined {
    return this.longitude;
  }

  // Utility methods
  getFullAddress(): string {
    const parts = [this.street];

    if (this.additionalInfo) {
      parts.push(this.additionalInfo);
    }

    parts.push(`${this.postalCode} ${this.city}`);

    if (this.region) {
      parts.push(this.region);
    }

    parts.push(this.country);

    return parts.join(', ');
  }

  getShortAddress(): string {
    return `${this.street}, ${this.postalCode} ${this.city}`;
  }

  hasCoordinates(): boolean {
    return this.latitude !== undefined && this.longitude !== undefined;
  }

  getCoordinates(): { latitude: number; longitude: number } | null {
    if (this.hasCoordinates()) {
      return {
        latitude: this.latitude!,
        longitude: this.longitude!,
      };
    }
    return null;
  }

  // Distance calculation (approximation using Haversine formula)
  distanceFrom(other: Address): number | null {
    const coords1 = this.getCoordinates();
    const coords2 = other.getCoordinates();

    if (!coords1 || !coords2) {
      return null; // Cannot calculate distance without coordinates
    }

    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(coords2.latitude - coords1.latitude);
    const dLon = this.toRadians(coords2.longitude - coords1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coords1.latitude)) *
        Math.cos(this.toRadians(coords2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en kilomètres
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Comparison methods
  equals(other: Address): boolean {
    return (
      this.street.toLowerCase() === other.street.toLowerCase() &&
      this.city.toLowerCase() === other.city.toLowerCase() &&
      this.postalCode === other.postalCode &&
      this.country.toLowerCase() === other.country.toLowerCase()
    );
  }

  isSameCity(other: Address): boolean {
    return (
      this.city.toLowerCase() === other.city.toLowerCase() &&
      this.postalCode === other.postalCode &&
      this.country.toLowerCase() === other.country.toLowerCase()
    );
  }

  toString(): string {
    return this.getFullAddress();
  }

  // Serialization
  toJSON(): {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    region?: string;
    additionalInfo?: string;
    latitude?: number;
    longitude?: number;
  } {
    return {
      street: this.street,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      region: this.region,
      additionalInfo: this.additionalInfo,
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  static fromJSON(data: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    region?: string;
    additionalInfo?: string;
    latitude?: number;
    longitude?: number;
  }): Address {
    return Address.create(data);
  }
}
