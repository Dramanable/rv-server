import { v4 as uuidv4 } from "uuid";

export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("UserId cannot be empty");
    }
    this.validateFormat(value);
  }

  private validateFormat(value: string): void {
    // Validation UUID v4
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error("UserId must be a valid UUID v4");
    }
  }

  static generate(): UserId {
    return new UserId(uuidv4());
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
