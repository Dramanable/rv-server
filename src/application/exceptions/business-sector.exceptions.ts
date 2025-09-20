/**
 * 🚨 Business Sector Exceptions - Application Layer
 *
 * Exceptions spécifiques à la gestion des secteurs d'activité métier.
 * Utilisées par les use cases pour signaler des erreurs métier précises.
 */

import { ApplicationException } from './application.exceptions';

/**
 * 🔍 Erreur : Secteur d'activité introuvable
 */
export class BusinessSectorNotFoundError extends ApplicationException {
  constructor(
    identifier: string,
    identifierType: 'id' | 'code' = 'id',
    message?: string,
  ) {
    const defaultMessage =
      message ||
      `Business sector not found with ${identifierType}: ${identifier}`;

    super(
      defaultMessage,
      'BUSINESS_SECTOR_NOT_FOUND',
      'business-sector.not-found',
      { identifier, identifierType },
    );
  }
}

/**
 * 🔄 Erreur : Secteur d'activité existe déjà
 */
export class BusinessSectorAlreadyExistsError extends ApplicationException {
  constructor(code: string, message?: string) {
    const defaultMessage =
      message || `Business sector with code '${code}' already exists`;

    super(
      defaultMessage,
      'BUSINESS_SECTOR_ALREADY_EXISTS',
      'business-sector.already-exists',
      { code },
    );
  }
}

/**
 * ❌ Erreur : Données de secteur d'activité invalides
 */
export class InvalidBusinessSectorDataError extends ApplicationException {
  constructor(validationErrors: string[], message?: string) {
    const defaultMessage = message || 'Invalid business sector data provided';

    super(
      defaultMessage,
      'INVALID_BUSINESS_SECTOR_DATA',
      'business-sector.invalid-data',
      { validationErrors },
    );
  }
}

/**
 * 🔒 Erreur : Permissions insuffisantes pour la gestion des secteurs
 */
export class InsufficientPermissionsError extends ApplicationException {
  constructor(requiredPermission: string, userId: string, message?: string) {
    const defaultMessage =
      message || `Insufficient permissions. Required: ${requiredPermission}`;

    super(
      defaultMessage,
      'INSUFFICIENT_PERMISSIONS',
      'business-sector.insufficient-permissions',
      { requiredPermission, userId },
    );
  }
}

/**
 * 🚫 Erreur : Secteur d'activité utilisé et ne peut être supprimé
 */
export class BusinessSectorInUseError extends ApplicationException {
  constructor(sectorId: string, usageCount: number, message?: string) {
    const defaultMessage =
      message ||
      `Cannot delete business sector. It is currently used by ${usageCount} users`;

    super(defaultMessage, 'BUSINESS_SECTOR_IN_USE', 'business-sector.in-use', {
      sectorId,
      usageCount,
    });
  }
}

/**
 * 🔄 Erreur : Opération de secteur d'activité échouée
 */
export class BusinessSectorOperationError extends ApplicationException {
  constructor(
    operation: string,
    sectorIdentifier: string,
    cause?: Error,
    message?: string,
  ) {
    const defaultMessage =
      message || `Failed to ${operation} business sector: ${sectorIdentifier}`;

    super(
      defaultMessage,
      'BUSINESS_SECTOR_OPERATION_FAILED',
      'business-sector.operation-failed',
      { operation, sectorIdentifier, cause: cause?.message },
    );
  }
}
