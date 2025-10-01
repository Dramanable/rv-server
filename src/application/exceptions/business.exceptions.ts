/**
 * 🏢 Business Domain Exceptions
 *
 * Exceptions spécifiques au domaine Business avec support i18n
 */

export class InvalidBusinessDataError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "InvalidBusinessDataError";
    this.field = field;
  }
}

export class BusinessAlreadyExistsError extends Error {
  public readonly businessName: string;
  public readonly email: string;

  constructor(businessName: string, email: string) {
    super(`Business '${businessName}' with email '${email}' already exists`);
    this.name = "BusinessAlreadyExistsError";
    this.businessName = businessName;
    this.email = email;
  }
}

export class BusinessNotFoundError extends Error {
  public readonly businessId: string;

  constructor(businessId: string) {
    super(`Business with ID '${businessId}' not found`);
    this.name = "BusinessNotFoundError";
    this.businessId = businessId;
  }
}

export class BusinessInactiveError extends Error {
  public readonly businessId: string;

  constructor(businessId: string) {
    super(`Business with ID '${businessId}' is inactive`);
    this.name = "BusinessInactiveError";
    this.businessId = businessId;
  }
}

export class BusinessPermissionError extends Error {
  public readonly businessId: string;
  public readonly userId: string;
  public readonly requiredPermission: string;

  constructor(businessId: string, userId: string, requiredPermission: string) {
    super(
      `User '${userId}' lacks permission '${requiredPermission}' for business '${businessId}'`,
    );
    this.name = "BusinessPermissionError";
    this.businessId = businessId;
    this.userId = userId;
    this.requiredPermission = requiredPermission;
  }
}
