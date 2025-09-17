export class BusinessName {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;

  constructor(private readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Business name cannot be empty');
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < BusinessName.MIN_LENGTH) {
      throw new Error(
        `Business name must be at least ${BusinessName.MIN_LENGTH} characters long`,
      );
    }

    if (trimmedValue.length > BusinessName.MAX_LENGTH) {
      throw new Error(
        `Business name cannot exceed ${BusinessName.MAX_LENGTH} characters`,
      );
    }

    // Vérifier les caractères interdits
    const forbiddenChars = /[<>{}[\]\\/]/;
    if (forbiddenChars.test(trimmedValue)) {
      throw new Error('Business name contains forbidden characters');
    }
  }

  static create(value: string): BusinessName {
    return new BusinessName(value.trim());
  }

  getValue(): string {
    return this.value.trim();
  }

  getSlug(): string {
    return this.value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .trim();
  }

  equals(other: BusinessName): boolean {
    return this.value.trim().toLowerCase() === other.value.trim().toLowerCase();
  }

  toString(): string {
    return this.value.trim();
  }
}
