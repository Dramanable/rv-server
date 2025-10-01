/**
 * 🗑️ DELETE PROSPECT USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer
 * ✅ Supprimer un prospect avec vérification de permissions strictes
 */

import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { IProspectRepository } from "@domain/repositories/prospect.repository";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import {
  ProspectNotFoundError,
  ProspectPermissionError,
  ProspectValidationError,
} from "@domain/exceptions/prospect.exceptions";

export interface DeleteProspectRequest {
  readonly prospectId: string;

  // 🔐 Contexte de sécurité obligatoire
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface DeleteProspectResponse {
  readonly success: true;
  readonly message: string;
  readonly deletedProspectId: string;
  readonly deletedAt: string;
}

export class DeleteProspectUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: DeleteProspectRequest,
  ): Promise<DeleteProspectResponse> {
    this.logger.info("Deleting prospect", {
      prospectId: request.prospectId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 Vérification des permissions strictes
      await this.validateDeletePermissions(request);

      // 🔍 Récupération du prospect
      const prospectId = ProspectId.fromString(request.prospectId);
      const prospect = await this.prospectRepository.findById(prospectId);

      if (!prospect) {
        throw new ProspectNotFoundError(request.prospectId);
      }

      // 🔐 Vérification des permissions spécifiques au prospect
      await this.validateProspectDeleteAccess(prospect, request);

      // 🚨 Vérification des règles métier pour la suppression
      this.validateBusinessRulesForDeletion(prospect);

      // 🗑️ Suppression du prospect
      await this.prospectRepository.delete(prospectId);

      const deletedAt = new Date();

      this.logger.info("Prospect deleted successfully", {
        prospectId: request.prospectId,
        businessName: prospect.getBusinessName(),
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
        deletedAt: deletedAt.toISOString(),
      });

      return {
        success: true,
        message: this.i18n.translate("prospect.deleted.success"),
        deletedProspectId: request.prospectId,
        deletedAt: deletedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(
        "Failed to delete prospect",
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
   * 🔐 Valider les permissions de suppression (très restrictives)
   */
  private async validateDeletePermissions(
    request: DeleteProspectRequest,
  ): Promise<void> {
    // Seuls les SUPER_ADMIN et SALES_MANAGER peuvent supprimer des prospects
    const canDeleteProspects = await this.permissionService.hasPermission(
      request.requestingUserId,
      "DELETE_PROSPECTS",
    );

    if (!canDeleteProspects) {
      throw new ProspectPermissionError(
        request.requestingUserId,
        "delete prospects (requires SALES_MANAGER or higher role)",
      );
    }
  }

  /**
   * 🔐 Valider l'accès à la suppression du prospect spécifique
   */
  private async validateProspectDeleteAccess(
    prospect: any,
    request: DeleteProspectRequest,
  ): Promise<void> {
    // Même les managers ne peuvent supprimer que certains prospects
    const canDeleteAllProspects = await this.permissionService.hasPermission(
      request.requestingUserId,
      "DELETE_ALL_PROSPECTS",
    );

    if (!canDeleteAllProspects) {
      // SALES_MANAGER peut seulement supprimer les prospects assignés à son équipe
      const canDeleteTeamProspects = await this.permissionService.hasPermission(
        request.requestingUserId,
        "DELETE_TEAM_PROSPECTS",
      );

      if (!canDeleteTeamProspects) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          "delete this prospect (insufficient permissions)",
        );
      }
    }
  }

  /**
   * ⚖️ Valider les règles métier pour la suppression
   */
  private validateBusinessRulesForDeletion(prospect: any): void {
    // ❌ Ne pas supprimer les prospects convertis (CLOSED_WON)
    if (prospect.getStatus().isClosedWon()) {
      throw new ProspectValidationError(
        "Cannot delete converted prospects (CLOSED_WON). Archive them instead.",
      );
    }

    // ❌ Ne pas supprimer les prospects avec des activités récentes importantes
    const daysSinceLastUpdate = Math.floor(
      (Date.now() - prospect.getUpdatedAt().getTime()) / (1000 * 60 * 60 * 24),
    );

    if (
      daysSinceLastUpdate < 7 &&
      prospect.getStatus().isInActiveNegotiation()
    ) {
      throw new ProspectValidationError(
        "Cannot delete prospects with recent activity in active negotiation. Wait 7 days or archive instead.",
      );
    }

    // ⚠️ Avertir si prospect à forte valeur
    if (
      prospect.isHighValue() &&
      prospect.getEstimatedValue().getAmount() > 5000
    ) {
      this.logger.warn("Deleting high-value prospect", {
        prospectId: prospect.getId().getValue(),
        estimatedValue: prospect.getEstimatedValue().getAmount(),
        businessName: prospect.getBusinessName(),
      });
    }
  }
}
