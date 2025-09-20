/**
 * 🗑️ Delete Business Sector Use Case
 *
 * Use case pour la suppression (soft delete) des secteurs d'activité
 * avec validation des permissions et des règles métier.
 */

import { BusinessSector } from '@domain/entities/business-sector.entity';
import { IBusinessSectorRepository } from '@application/ports/business-sector.repository.interface';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { Logger } from '@application/ports/logger.port';
import {
  BusinessSectorNotFoundError,
  BusinessSectorInUseError,
} from '@application/exceptions/business-sector.exceptions';
import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import { Permission } from '@shared/enums/permission.enum';

/**
 * 📋 Requête de suppression de secteur d'activité
 */
export interface DeleteBusinessSectorRequest {
  readonly id: string;
  readonly requestingUserId: string;
  readonly force?: boolean; // Force delete même si utilisé
}

/**
 * 📄 Réponse de suppression de secteur d'activité
 */
export interface DeleteBusinessSectorResponse {
  readonly success: boolean;
  readonly message: string;
  readonly deletedAt: Date;
  readonly sectorId: string;
  readonly sectorName: string;
  readonly wasForced?: boolean;
}

/**
 * 🗑️ Use Case : Suppression de Secteur d'Activité
 *
 * Gère la suppression (soft delete) des secteurs d'activité avec :
 * - Validation des permissions (MANAGE_BUSINESS_SECTORS requis)
 * - Vérification de l'existence du secteur
 * - Validation des règles métier (pas de suppression si en cours d'utilisation)
 * - Support du force delete pour les cas exceptionnels
 * - Logging complet des opérations
 * - Gestion d'erreurs robuste
 */
export class DeleteBusinessSectorUseCase {
  constructor(
    private readonly businessSectorRepository: IBusinessSectorRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
  ) {}

  /**
   * 🚀 Exécuter la suppression du secteur d'activité
   */
  async execute(
    request: DeleteBusinessSectorRequest,
  ): Promise<DeleteBusinessSectorResponse> {
    const { id: sectorId, requestingUserId, force = false } = request;

    this.logger.debug('Deleting business sector', {
      sectorId,
      requestingUserId,
      force,
    });

    try {
      // 🔐 Validation des permissions
      await this.validatePermissions(requestingUserId, sectorId);

      // 🔍 Validation de l'existence du secteur
      const existingSector = await this.validateSectorExists(
        sectorId,
        requestingUserId,
      );

      // 💼 Validation des règles métier
      await this.validateBusinessRules(sectorId, force, requestingUserId);

      // 🗑️ Suppression (soft delete)
      const deletedSector = await this.deleteSector(
        existingSector,
        requestingUserId,
        force,
      );

      // 📊 Log de succès
      this.logger.info('Business sector deactivated successfully', {
        sectorId,
        requestingUserId,
        sectorName: deletedSector.name,
        wasForced: force,
      });

      // 📋 Construction de la réponse
      return this.buildResponse(deletedSector, force);
    } catch (error) {
      this.logger.error(
        'Failed to delete business sector',
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId,
          sectorId,
          force,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions de l'utilisateur
   */
  private async validatePermissions(
    requestingUserId: string,
    sectorId: string,
  ): Promise<void> {
    const hasPermission = await this.permissionService.hasPermission(
      requestingUserId,
      Permission.MANAGE_BUSINESS_SECTORS,
    );

    if (!hasPermission) {
      this.logger.warn('Permission denied for business sector deletion', {
        requestingUserId,
        sectorId,
        requiredPermission: Permission.MANAGE_BUSINESS_SECTORS,
      });

      throw new InsufficientPermissionsError(
        'User does not have permission to manage business sectors',
        {
          requiredPermission: Permission.MANAGE_BUSINESS_SECTORS,
          userId: requestingUserId,
        },
      );
    }
  }

  /**
   * 🔍 Valider l'existence du secteur d'activité
   */
  private async validateSectorExists(
    sectorId: string,
    requestingUserId: string,
  ): Promise<BusinessSector> {
    const existingSector =
      await this.businessSectorRepository.findById(sectorId);

    if (!existingSector) {
      this.logger.warn('Attempted to delete non-existent business sector', {
        sectorId,
        requestingUserId,
      });

      throw new BusinessSectorNotFoundError(
        sectorId,
        'id',
        `Business sector with id ${sectorId} not found`,
      );
    }

    // 🔍 Vérifier si le secteur est déjà inactif
    if (!existingSector.isActive) {
      this.logger.warn('Attempted to delete already inactive business sector', {
        sectorId,
        sectorName: existingSector.name,
        requestingUserId,
      });

      throw new BusinessSectorNotFoundError(
        sectorId,
        'id',
        'Business sector is already inactive',
      );
    }

    return existingSector;
  }

  /**
   * 💼 Valider les règles métier pour la suppression
   */
  private async validateBusinessRules(
    sectorId: string,
    force: boolean,
    requestingUserId: string,
  ): Promise<void> {
    const usageCount =
      await this.businessSectorRepository.countUsageInBusinesses(sectorId);

    if (usageCount > 0 && !force) {
      this.logger.warn('Attempted to delete business sector in use', {
        sectorId,
        usageCount,
        requestingUserId,
      });

      throw new BusinessSectorInUseError(
        sectorId,
        usageCount,
        `Cannot delete business sector: it is currently used by ${usageCount} businesses`,
      );
    }

    // 📊 Log de warning si force delete avec usage
    if (usageCount > 0 && force) {
      this.logger.warn(
        'Business sector forcefully deactivated despite being in use',
        {
          sectorId,
          usageCount,
          requestingUserId,
        },
      );
    }
  }

  /**
   * 🗑️ Effectuer la suppression (soft delete)
   */
  private async deleteSector(
    sector: BusinessSector,
    requestingUserId: string,
    force: boolean,
  ): Promise<BusinessSector> {
    // 🔄 Désactivation du secteur (soft delete)
    const deactivatedSector = sector.deactivate(requestingUserId);

    // 💾 Sauvegarde en base
    return await this.businessSectorRepository.save(deactivatedSector);
  }

  /**
   * 📋 Construire la réponse du use case
   */
  private buildResponse(
    deletedSector: BusinessSector,
    wasForced: boolean,
  ): DeleteBusinessSectorResponse {
    const baseMessage = wasForced
      ? 'Business sector forcefully deactivated'
      : 'Business sector deactivated successfully';

    return {
      success: true,
      message: baseMessage,
      deletedAt: deletedSector.updatedAt || new Date(),
      sectorId: deletedSector.id,
      sectorName: deletedSector.name,
      wasForced,
    };
  }
}
