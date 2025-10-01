/**
 * ✏️ UPDATE PROSPECT USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer
 * ✅ Mettre à jour un prospect avec validation complète
 */

import { Prospect } from '@domain/entities/prospect.entity';
import { ProspectId } from '@domain/value-objects/prospect-id.value-object';
import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { BusinessSize } from '@domain/enums/business-size.enum';
import { IProspectRepository } from '@domain/repositories/prospect.repository';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IPermissionService } from '@application/ports/permission.port';
import {
  ProspectNotFoundError,
  ProspectPermissionError,
  ProspectValidationError,
} from '@domain/exceptions/prospect.exceptions';

export interface UpdateProspectRequest {
  readonly prospectId: string;

  // 📝 Champs modifiables
  readonly businessName?: string;
  readonly contactEmail?: string;
  readonly contactName?: string;
  readonly contactPhone?: string;
  readonly website?: string;
  readonly source?: string;
  readonly status?: string;
  readonly assignedSalesRep?: string;
  readonly staffCount?: number;
  readonly estimatedValue?: number;
  readonly notes?: string;

  // 🔐 Contexte de sécurité obligatoire
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface UpdateProspectResponse {
  readonly id: string;
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactName: string;
  readonly contactPhone?: string;
  readonly website?: string;
  readonly source: string;
  readonly status: {
    readonly value: string;
    readonly label: string;
    readonly color: string;
    readonly priority: number;
  };
  readonly assignedSalesRep: string;
  readonly staffCount: number;
  readonly estimatedValue: number;
  readonly estimatedMonthlyPrice: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly businessSize: {
    readonly value: string;
    readonly label: string;
    readonly icon: string;
  };
  readonly notes?: string;
  readonly updatedAt: string;
}

export class UpdateProspectUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: UpdateProspectRequest,
  ): Promise<UpdateProspectResponse> {
    this.logger.info('Updating prospect', {
      prospectId: request.prospectId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 Vérification des permissions
      await this.validatePermissions(request);

      // 🔍 Récupération du prospect existant
      const prospectId = ProspectId.fromString(request.prospectId);
      const existingProspect =
        await this.prospectRepository.findById(prospectId);

      if (!existingProspect) {
        throw new ProspectNotFoundError(request.prospectId);
      }

      // 🔐 Vérification des permissions spécifiques
      await this.validateProspectUpdateAccess(existingProspect, request);

      // ✏️ Mise à jour du prospect
      const updatedProspect = await this.updateProspect(
        existingProspect,
        request,
      );

      // 💾 Sauvegarde
      const savedProspect = await this.prospectRepository.save(updatedProspect);

      this.logger.info('Prospect updated successfully', {
        prospectId: request.prospectId,
        businessName: savedProspect.getBusinessName(),
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });

      return this.buildResponse(savedProspect);
    } catch (error) {
      this.logger.error(
        'Failed to update prospect',
        error instanceof Error ? error : new Error(String(error)),
        {
          prospectId: request.prospectId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions de base
   */
  private async validatePermissions(
    request: UpdateProspectRequest,
  ): Promise<void> {
    const hasPermission = await this.permissionService.hasPermission(
      request.requestingUserId,
      'MANAGE_PROSPECTS',
    );

    if (!hasPermission) {
      throw new ProspectPermissionError(
        request.requestingUserId,
        'update prospects',
      );
    }
  }

  /**
   * 🔐 Valider l'accès à la mise à jour du prospect
   */
  private async validateProspectUpdateAccess(
    prospect: Prospect,
    request: UpdateProspectRequest,
  ): Promise<void> {
    const canManageAllProspects = await this.permissionService.hasPermission(
      request.requestingUserId,
      'MANAGE_ALL_PROSPECTS',
    );

    if (!canManageAllProspects) {
      // Les commerciaux ne peuvent modifier que leurs propres prospects
      if (
        prospect.getAssignedSalesRep().getValue() !== request.requestingUserId
      ) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          'update this prospect (not assigned to you)',
        );
      }

      // Les commerciaux ne peuvent pas changer l'assignation
      if (
        request.assignedSalesRep &&
        request.assignedSalesRep !== request.requestingUserId
      ) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          'reassign prospect to another sales representative',
        );
      }
    }
  }

  /**
   * ✏️ Mettre à jour le prospect avec les nouvelles données
   */
  private async updateProspect(
    existingProspect: Prospect,
    request: UpdateProspectRequest,
  ): Promise<Prospect> {
    // Utiliser les méthodes spécifiques de l'entité Prospect
    const updatedProspect = existingProspect;

    if (request.status !== undefined) {
      const newStatus = ProspectStatus.fromString(request.status);
      updatedProspect.updateStatus(newStatus);
    }

    if (request.assignedSalesRep !== undefined) {
      const newAssignedSalesRep = UserId.create(request.assignedSalesRep);
      updatedProspect.assignTo(newAssignedSalesRep);
    }

    if (request.estimatedValue !== undefined) {
      updatedProspect.updateEstimatedValue(request.estimatedValue);
    }

    if (request.staffCount !== undefined) {
      updatedProspect.updateStaffCount(request.staffCount);
    }

    if (request.notes !== undefined) {
      updatedProspect.addNote(request.notes);
    }

    // Pour les autres champs, il faudrait créer des méthodes dans l'entité
    // ou recréer le prospect (pour respecter l'immutabilité)

    return updatedProspect;
  }

  /**
   * 📦 Construire la réponse
   */
  private buildResponse(prospect: Prospect): UpdateProspectResponse {
    const status = prospect.getStatus();
    const businessSize = prospect.getBusinessSize();
    const estimatedPrice = prospect.getEstimatedMonthlyPrice();

    return {
      id: prospect.getId().getValue(),
      businessName: prospect.getBusinessName(),
      contactEmail: prospect.getContactEmail().getValue(),
      contactName: prospect.getContactName(),
      contactPhone: prospect.getContactPhone()?.getValue(),
      website: undefined, // TODO: Ajouter getWebsite() dans l'entité Prospect
      source: prospect.getSource(),
      status: {
        value: status.getValue(),
        label: status.getLabel(),
        color: status.getColor(),
        priority: status.getPriority(),
      },
      assignedSalesRep: prospect.getAssignedSalesRep().getValue(),
      staffCount: prospect.getStaffCount(),
      estimatedValue: prospect.getEstimatedValue().getAmount(),
      estimatedMonthlyPrice: {
        amount: estimatedPrice.getAmount(),
        currency: estimatedPrice.getCurrency(),
      },
      businessSize: {
        value: businessSize.toString(),
        label: BusinessSize.getLabel(prospect.getBusinessSize()),
        icon: BusinessSize.getIcon(prospect.getBusinessSize()),
      },
      notes: prospect.getNotes(),
      updatedAt: prospect.getUpdatedAt().toISOString(),
    };
  }
}
