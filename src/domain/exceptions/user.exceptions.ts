/**
 * 🚨 Domain Exceptions
 *
 * Exceptions métier avec codes d'erreur et support i18n
 */

export abstract class DomainException extends Error {
  public readonly code: string;
  public readonly i18nKey: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    i18nKey: string,
    context?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.i18nKey = i18nKey;
    this.context = context;
  }
}

export class UserNotFoundError extends DomainException {
  constructor(userId: string) {
    super(
      `User with ID ${userId} not found`,
      "USER_NOT_FOUND",
      "errors.user.not_found",
      { userId },
    );
  }
}

export class EmailAlreadyExistsError extends DomainException {
  constructor(email: string) {
    super(
      `Email ${email} already exists`,
      "EMAIL_ALREADY_EXISTS",
      "errors.user.email_already_exists",
      { email },
    );
  }
}

export class InvalidCredentialsError extends DomainException {
  constructor() {
    super(
      "Invalid email or password",
      "INVALID_CREDENTIALS",
      "errors.auth.invalid_credentials",
    );
  }
}

export class InsufficientPermissionsError extends DomainException {
  constructor(permission: string, userRole: string) {
    super(
      `Insufficient permissions: ${permission} required for role ${userRole}`,
      "INSUFFICIENT_PERMISSIONS",
      "errors.auth.insufficient_permissions",
      { permission, userRole },
    );
  }
}

export class InvalidEmailFormatError extends DomainException {
  constructor(email: string) {
    super(
      `Invalid email format: ${email}`,
      "INVALID_EMAIL_FORMAT",
      "errors.validation.invalid_email",
      { email },
    );
  }
}

export class InvalidNameError extends DomainException {
  constructor(name: string, reason: string) {
    super(
      `Invalid name: ${reason}`,
      "INVALID_NAME",
      "errors.validation.invalid_name",
      { name, reason },
    );
  }
}

export class RoleElevationError extends DomainException {
  constructor(fromRole: string, toRole: string) {
    super(
      `Cannot elevate from ${fromRole} to ${toRole}`,
      "ROLE_ELEVATION_FORBIDDEN",
      "errors.auth.role_elevation_forbidden",
      { fromRole, toRole },
    );
  }
}

export class SelfDeletionError extends DomainException {
  constructor(userId: string) {
    super(
      `User cannot delete themselves`,
      "SELF_DELETION_FORBIDDEN",
      "errors.user.self_deletion_forbidden",
      { userId },
    );
  }
}
