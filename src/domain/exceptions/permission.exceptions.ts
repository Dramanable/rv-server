/**
 * Permission Domain Exceptions
 * Clean Architecture - Domain Layer - Business exceptions
 */

export class PermissionException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = "PermissionException";
  }
}

export class PermissionNotFoundError extends PermissionException {
  constructor(identifier: string, searchBy: "id" | "name" = "id") {
    super(
      `Permission not found with ${searchBy}: ${identifier}`,
      "PERMISSION_NOT_FOUND",
      { identifier, searchBy },
    );
  }
}

export class PermissionAlreadyExistsError extends PermissionException {
  constructor(name: string) {
    super(
      `Permission already exists with name: ${name}`,
      "PERMISSION_ALREADY_EXISTS",
      { name },
    );
  }
}

export class SystemPermissionModificationError extends PermissionException {
  constructor(permissionName: string, operation: string) {
    super(
      `Cannot ${operation} system permission: ${permissionName}`,
      "SYSTEM_PERMISSION_MODIFICATION_ERROR",
      { permissionName, operation },
    );
  }
}

export class PermissionValidationError extends PermissionException {
  constructor(field: string, value: any, requirement: string) {
    super(
      `Permission validation failed for ${field}: ${requirement}`,
      "PERMISSION_VALIDATION_ERROR",
      { field, value, requirement },
    );
  }
}

export class PermissionInUseError extends PermissionException {
  constructor(permissionId: string, usedBy: string[]) {
    super(
      `Permission ${permissionId} cannot be deleted because it is in use by: ${usedBy.join(", ")}`,
      "PERMISSION_IN_USE_ERROR",
      { permissionId, usedBy },
    );
  }
}
