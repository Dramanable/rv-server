/**
 * 👁️ GET PROSPECT BY ID USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer
 * ✅ Récupérer un prospect par son ID avec vérification de permissions
 */

import { Prospect } from "@domain/entities/prospect.entity";
import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { IProspectRepository } from "@domain/repositories/prospect.repository";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import {
  ProspectNotFoundError,
  ProspectPermissionError,
} from "@domain/exceptions/prospect.exceptions";
import { BusinessSize } from "@domain/enums/business-size.enum";

export interface GetProspectByIdRequest {
  readonly prospectId: string;

  // 🔐 Contexte de sécurité obligatoire
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface GetProspectByIdResponse {
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
  readonly estimatedMonthlyPrice: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly staffCount: number;
  readonly businessSize: {
    readonly value: string;
    readonly label: string;
    readonly icon: string;
    readonly basePrice: number;
  };
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class GetProspectByIdUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetProspectByIdRequest,
  ): Promise<GetProspectByIdResponse> {
    this.logger.info("Getting prospect by ID", {
      prospectId: request.prospectId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 Vérification des permissions
      await this.validatePermissions(request);

      // 🔍 Récupération du prospect
      const prospectId = ProspectId.fromString(request.prospectId);
      const prospect = await this.prospectRepository.findById(prospectId);

      if (!prospect) {
        throw new ProspectNotFoundError(request.prospectId);
      }

      // 🔐 Vérification des permissions spécifiques au prospect
      await this.validateProspectAccess(prospect, request.requestingUserId);

      this.logger.info("Prospect retrieved successfully", {
        prospectId: request.prospectId,
        businessName: prospect.getBusinessName(),
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });

      return this.buildResponse(prospect);
    } catch (error) {
      this.logger.error(
        "Failed to get prospect by ID",
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
    request: GetProspectByIdRequest,
  ): Promise<void> {
    const hasPermission = await this.permissionService.hasPermission(
      request.requestingUserId,
      "VIEW_PROSPECTS",
    );

    if (!hasPermission) {
      throw new ProspectPermissionError(
        request.requestingUserId,
        "view prospect details",
      );
    }
  }

  /**
   * 🔐 Valider l'accès au prospect spécifique
   */
  private async validateProspectAccess(
    prospect: Prospect,
    requestingUserId: string,
  ): Promise<void> {
    const canViewAllProspects = await this.permissionService.hasPermission(
      requestingUserId,
      "VIEW_ALL_PROSPECTS",
    );

    if (!canViewAllProspects) {
      // Les commerciaux ne peuvent voir que leurs propres prospects
      if (prospect.getAssignedSalesRep().getValue() !== requestingUserId) {
        throw new ProspectPermissionError(
          requestingUserId,
          "view this prospect (not assigned to you)",
        );
      }
    }
  }

  /**
   * 📦 Construire la réponse
   */
  private buildResponse(prospect: Prospect): GetProspectByIdResponse {
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
      estimatedMonthlyPrice: {
        amount: estimatedPrice.getAmount(),
        currency: estimatedPrice.getCurrency(),
      },
      staffCount: prospect.getStaffCount(),
      businessSize: {
        value: businessSize.toString(),
        label: BusinessSize.getLabel(prospect.getBusinessSize()),
        icon: BusinessSize.getIcon(prospect.getBusinessSize()),
        basePrice: BusinessSize.getBasePrice(prospect.getBusinessSize()),
      },
      notes: prospect.getNotes(),
      createdAt: prospect.getCreatedAt().toISOString(),
      updatedAt: prospect.getUpdatedAt().toISOString(),
    };
  }
}
