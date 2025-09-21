/**
 * 📝 Update Business Sector Use Case
 *
 * Use case pour la mise à jour de secteurs d'activité
 * Seuls les super-admins peuvent modifier les secteurs d'activité
 */

import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import {
  BusinessSectorNotFoundError,
  InvalidBusinessSectorDataError,
} from '@application/exceptions/business-sector.exceptions';
import type { IBusinessSectorRepository } from '@application/ports/business-sector.repository.interface';
import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';
import type { IPermissionService } from '@application/ports/permission.service.interface';
import { BusinessSector } from '@domain/entities/business-sector.entity';

// Types pour les requêtes et réponses
export interface UpdateBusinessSectorRequest {
  id: string;
  requestingUserId: string;
  name?: string;
  description?: string;
}

export interface UpdateBusinessSectorResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateBusinessSectorUseCase {
  constructor(
    private readonly businessSectorRepository: IBusinessSectorRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(
    request: UpdateBusinessSectorRequest,
  ): Promise<UpdateBusinessSectorResponse> {
    const { id, requestingUserId, name, description } = request;

    // 📊 Log de démarrage
    this.logger.info('Updating business sector', {
      sectorId: id,
      requestingUserId,
      hasName: !!name,
      hasDescription: !!description,
    });

    try {
      // 🔐 Vérification des permissions super-admin
      await this.validatePermissions(requestingUserId, id);

      // ✅ Validation des données d'entrée
      this.validateInput(request);

      // 🔍 Vérification de l'existence du secteur
      const existingSector = await this.validateSectorExists(
        id,
        requestingUserId,
      );

      // 🔄 Mise à jour du secteur
      const updatedSector = this.updateSectorFields(existingSector, request);

      // 💾 Sauvegarde en base
      const savedSector =
        await this.businessSectorRepository.save(updatedSector);

      // 📊 Log de succès
      this.logger.info('Business sector updated successfully', {
        sectorId: id,
        requestingUserId,
        sectorName: savedSector.name,
      });

      // 📋 Construction de la réponse
      return this.buildResponse(savedSector);
    } catch (error) {
      this.logger.error(
        'Failed to update business sector',
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId,
          sectorId: id,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Vérifier les permissions super-admin
   */
  private async validatePermissions(
    requestingUserId: string,
    sectorId: string,
  ): Promise<void> {
    try {
      const hasPermission = await this.permissionService.hasPermission(
        requestingUserId,
        'MANAGE_BUSINESS_SECTORS',
      );

      if (!hasPermission) {
        const errorMessage = this.i18n.t(
          'business-sector.insufficient-permissions',
        );

        this.logger.warn('Unauthorized attempt to update business sector', {
          requestingUserId,
          sectorId,
        });

        throw new InsufficientPermissionsError(errorMessage);
      }
    } catch (error) {
      if (error instanceof InsufficientPermissionsError) {
        throw error;
      }

      this.logger.error(
        'Error checking permissions for business sector update',
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId,
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Valider les données d'entrée
   */
  private validateInput(request: UpdateBusinessSectorRequest): void {
    const { name, description } = request;
    const errors: string[] = [];

    // Vérifier qu'au moins un champ est fourni pour la mise à jour
    if (!name && !description) {
      const errorMessage = this.i18n.t('business-sector.validation.no-fields');
      throw new InvalidBusinessSectorDataError([errorMessage], errorMessage);
    }

    // Validation du nom si fourni
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        errors.push(this.i18n.t('business-sector.validation.name-empty'));
      } else if (name.trim().length < 2) {
        errors.push(this.i18n.t('business-sector.validation.name-too-short'));
      } else if (name.trim().length > 100) {
        errors.push(this.i18n.t('business-sector.validation.name-too-long'));
      }
    }

    // Validation de la description si fournie
    if (description !== undefined) {
      if (description && description.trim().length > 0) {
        if (description.trim().length < 10) {
          errors.push(
            this.i18n.t('business-sector.validation.description-too-short'),
          );
        } else if (description.trim().length > 500) {
          errors.push(
            this.i18n.t('business-sector.validation.description-too-long'),
          );
        }
      }
    }

    if (errors.length > 0) {
      const errorMessage = this.i18n.t(
        'business-sector.validation.invalid-data',
      );
      throw new InvalidBusinessSectorDataError(errors, errorMessage);
    }
  }

  /**
   * 🔍 Vérifier l'existence du secteur d'activité
   */
  private async validateSectorExists(
    id: string,
    requestingUserId: string,
  ): Promise<BusinessSector> {
    const sector = await this.businessSectorRepository.findById(id);

    if (!sector) {
      const errorMessage = this.i18n.t('business-sector.not-found', { id });

      this.logger.warn('Business sector not found for update', {
        sectorId: id,
        requestingUserId,
      });

      throw new BusinessSectorNotFoundError(id, 'id', errorMessage);
    }

    return sector;
  }

  /**
   * 🔄 Mettre à jour les champs du secteur
   */
  private updateSectorFields(
    sector: BusinessSector,
    request: UpdateBusinessSectorRequest,
  ): BusinessSector {
    const { name, description, requestingUserId } = request;

    if (name !== undefined || description !== undefined) {
      const newName = name !== undefined ? name.trim() : sector.name;
      const newDescription =
        description !== undefined
          ? description.trim() || undefined
          : sector.description;

      return sector.update(newName, newDescription || '', requestingUserId);
    }

    return sector;
  }

  /**
   * 📋 Construire la réponse du use case
   */
  private buildResponse(sector: BusinessSector): UpdateBusinessSectorResponse {
    return {
      id: sector.id,
      name: sector.name,
      code: sector.code,
      description: sector.description || undefined,
      isActive: sector.isActive,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt || new Date(),
    };
  }
}
