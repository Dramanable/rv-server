/**
 * ⚠️ RÈGLE CRITIQUE CLEAN ARCHITECTURE :
 * Les exceptions d'infrastructure DOIVENT être utilisées à la place de "throw new Error"
 * dans TOUTE la couche infrastructure pour respecter les principes de Clean Architecture.
 */

import { InfrastructureException } from '@shared/exceptions/shared.exceptions';

/**
 * 🔐 Exceptions de Sécurité et Authentification
 */
export class PasswordHashingError extends InfrastructureException {
  constructor(originalError?: unknown) {
    super('Password hashing operation failed', 'PASSWORD_HASHING_FAILED', {
      originalError: originalError?.toString(),
    });
  }
}

export class TokenGenerationError extends InfrastructureException {
  constructor(tokenType: string, originalError?: unknown) {
    super(
      `Token generation failed for type: ${tokenType}`,
      'TOKEN_GENERATION_FAILED',
      { tokenType, originalError: originalError?.toString() },
    );
  }
}

export class TokenValidationError extends InfrastructureException {
  constructor(tokenType: string, reason: string) {
    super(
      `Token validation failed for type ${tokenType}: ${reason}`,
      'TOKEN_VALIDATION_FAILED',
      { tokenType, reason },
    );
  }
}

export class AuthenticationServiceError extends InfrastructureException {
  constructor(operation: string, originalError?: unknown) {
    super(
      `Authentication service error during ${operation}`,
      'AUTHENTICATION_SERVICE_ERROR',
      { operation, originalError: originalError?.toString() },
    );
  }
}

/**
 * 🗄️ Exceptions de Base de Données et Cache
 */
export class InvalidCachedDataError extends InfrastructureException {
  constructor(dataType: string, reason: string) {
    super(
      `Invalid cached data for type ${dataType}: ${reason}`,
      'INVALID_CACHED_DATA',
      { dataType, reason },
    );
  }
}

export class DatabaseSchemaError extends InfrastructureException {
  constructor(schemaName: string, reason: string) {
    super(
      `Database schema error for '${schemaName}': ${reason}`,
      'DATABASE_SCHEMA_ERROR',
      { schemaName, reason },
    );
  }
}

/**
 * 📂 Exceptions de Stockage et Fichiers
 */
export class FileStorageError extends InfrastructureException {
  constructor(operation: string, fileName?: string, originalError?: unknown) {
    super(
      `File storage error during ${operation}${fileName ? ` for file: ${fileName}` : ''}`,
      'FILE_STORAGE_ERROR',
      { operation, fileName, originalError: originalError?.toString() },
    );
  }
}

export class ImageProcessingError extends InfrastructureException {
  constructor(operation: string, imageId?: string, originalError?: unknown) {
    super(
      `Image processing error during ${operation}${imageId ? ` for image: ${imageId}` : ''}`,
      'IMAGE_PROCESSING_ERROR',
      { operation, imageId, originalError: originalError?.toString() },
    );
  }
}

/**
 * 🔄 Exceptions de Mapping et Transformation
 */
export class MappingError extends InfrastructureException {
  constructor(entityType: string, operation: string, reason?: string) {
    super(
      `Mapping error for ${entityType} during ${operation}${reason ? `: ${reason}` : ''}`,
      'MAPPING_ERROR',
      { entityType, operation, reason },
    );
  }
}

export class DataTransformationError extends InfrastructureException {
  constructor(sourceType: string, targetType: string, reason: string) {
    super(
      `Data transformation error from ${sourceType} to ${targetType}: ${reason}`,
      'DATA_TRANSFORMATION_ERROR',
      { sourceType, targetType, reason },
    );
  }
}

/**
 * 🔐 Exceptions de Permissions et RBAC
 */
export class PermissionServiceError extends InfrastructureException {
  constructor(operation: string, context?: Record<string, unknown>) {
    super(
      `Permission service error during ${operation}`,
      'PERMISSION_SERVICE_ERROR',
      { operation, ...context },
    );
  }
}

/**
 * 🚧 Exceptions de Fonctionnalités Non Implémentées
 */
export class NotImplementedError extends InfrastructureException {
  constructor(methodName: string, phase?: string) {
    super(
      `Method ${methodName} is not implemented yet${phase ? ` - TODO ${phase}` : ''}`,
      'NOT_IMPLEMENTED',
      { methodName, phase },
    );
  }
}

/**
 * ⚙️ Exceptions de Validation d'Entrée
 */
export class InvalidInputError extends InfrastructureException {
  constructor(inputType: string, reason: string) {
    super(`Invalid input for ${inputType}: ${reason}`, 'INVALID_INPUT', {
      inputType,
      reason,
    });
  }
}

/**
 * 🌐 Exceptions de Services Externes
 */
export class ExternalServiceError extends InfrastructureException {
  constructor(serviceName: string, operation: string, originalError?: unknown) {
    super(
      `External service error in ${serviceName} during ${operation}`,
      'EXTERNAL_SERVICE_ERROR',
      { serviceName, operation, originalError: originalError?.toString() },
    );
  }
}
