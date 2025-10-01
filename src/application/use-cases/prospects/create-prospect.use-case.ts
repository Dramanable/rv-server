/**
 * 🆕 CREATE PROSPECT USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer
 * ✅ Créer un nouveau prospect commercial
 */

import { Prospect } from "@domain/entities/prospect.entity";
import { IProspectRepository } from "@domain/repositories/prospect.repository";
import { BusinessSizeEnum } from "@domain/enums/business-size.enum";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.port";
import {
  ProspectValidationError,
  ProspectPermissionError,
  ProspectBusinessRuleError,
} from "@domain/exceptions/prospect.exceptions";

export interface CreateProspectRequest {
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactName: string;
  readonly assignedSalesRep?: string; // Si non fourni, c'est le requester
  readonly estimatedValue: number;
  readonly currency?: string;
  readonly notes?: string;
  readonly source?: string;
  readonly businessSize?: BusinessSizeEnum;
  readonly staffCount?: number;
  readonly currentSolution?: string;

  // 🔐 Contexte de sécurité obligatoire
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface CreateProspectResponse {
  readonly id: string;
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactName: string;
  readonly status: string;
  readonly assignedSalesRep: string;
  readonly estimatedValue: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly estimatedMonthlyPrice: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly annualRevenuePotential: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly notes: string;
  readonly source: string;
  readonly businessSize: BusinessSizeEnum;
  readonly staffCount: number;
  readonly currentSolution?: string;
  readonly isHotProspect: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class CreateProspectUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CreateProspectRequest,
  ): Promise<CreateProspectResponse> {
    this.logger.info("Creating new prospect", {
      businessName: request.businessName,
      contactEmail: request.contactEmail,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 ÉTAPE 1 : Vérifier les permissions
      await this.validatePermissions(request);

      // ✅ ÉTAPE 2 : Validation métier
      await this.validateBusinessRules(request);

      // 🏗️ ÉTAPE 3 : Créer l'entité Prospect
      const prospect = this.createProspectEntity(request);

      // 💾 ÉTAPE 4 : Sauvegarder
      const savedProspect = await this.prospectRepository.save(prospect);

      this.logger.info("Prospect created successfully", {
        prospectId: savedProspect.getId().getValue(),
        businessName: request.businessName,
        assignedSalesRep: savedProspect.getAssignedSalesRep().getValue(),
        estimatedValue: savedProspect.getEstimatedValue().getAmount(),
        correlationId: request.correlationId,
      });

      // 📤 ÉTAPE 5 : Retourner la réponse
      return this.buildResponse(savedProspect);
    } catch (error) {
      this.logger.error(
        "Failed to create prospect",
        error instanceof Error ? error : new Error(String(error)),
        {
          businessName: request.businessName,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions
   */
  private async validatePermissions(
    request: CreateProspectRequest,
  ): Promise<void> {
    // Vérifier que l'utilisateur est dans un rôle commercial ou admin
    const hasPermission = await this.permissionService.hasPermission(
      request.requestingUserId,
      "CREATE_PROSPECT",
    );

    if (!hasPermission) {
      throw new ProspectPermissionError(
        request.requestingUserId,
        "create prospect",
      );
    }

    // Si un commercial spécifique est assigné, vérifier qu'on peut l'assigner
    if (
      request.assignedSalesRep &&
      request.assignedSalesRep !== request.requestingUserId
    ) {
      const canAssign = await this.permissionService.hasPermission(
        request.requestingUserId,
        "ASSIGN_PROSPECTS",
      );

      if (!canAssign) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          "assign prospects to other sales reps",
        );
      }
    }
  }

  /**
   * ✅ Validation des règles métier
   */
  private async validateBusinessRules(
    request: CreateProspectRequest,
  ): Promise<void> {
    // Vérifier que l'email n'existe pas déjà
    const emailExists = await this.prospectRepository.existsByContactEmail(
      request.contactEmail,
    );
    if (emailExists) {
      throw new ProspectBusinessRuleError(
        "A prospect with this email already exists",
      );
    }

    // Vérifier que l'entreprise n'existe pas déjà
    const businessExists = await this.prospectRepository.existsByBusinessName(
      request.businessName,
    );
    if (businessExists) {
      throw new ProspectBusinessRuleError(
        "A prospect with this business name already exists",
      );
    }

    // Validation des valeurs numériques
    if (request.estimatedValue < 0) {
      throw new ProspectValidationError("Estimated value must be positive");
    }

    if (request.staffCount && request.staffCount < 1) {
      throw new ProspectValidationError("Staff count must be at least 1");
    }
  }

  /**
   * 🏗️ Créer l'entité Prospect
   */
  private createProspectEntity(request: CreateProspectRequest): Prospect {
    return Prospect.create({
      businessName: request.businessName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      contactName: request.contactName,
      assignedSalesRep: request.assignedSalesRep || request.requestingUserId,
      estimatedValue: request.estimatedValue,
      currency: request.currency || "EUR",
      notes: request.notes,
      source: request.source,
      businessSize: request.businessSize,
      staffCount: request.staffCount,
      currentSolution: request.currentSolution,
    });
  }

  /**
   * 📤 Construire la réponse
   */
  private buildResponse(prospect: Prospect): CreateProspectResponse {
    const prospectJson = prospect.toJSON();

    return {
      id: prospect.getId().getValue(),
      businessName: prospect.getBusinessName(),
      contactEmail: prospect.getContactEmail().getValue(),
      contactPhone: prospect.getContactPhone().getValue(),
      contactName: prospect.getContactName(),
      status: prospect.getStatus().getValue(),
      assignedSalesRep: prospect.getAssignedSalesRep().getValue(),
      estimatedValue: {
        amount: prospect.getEstimatedValue().getAmount(),
        currency: prospect.getEstimatedValue().getCurrency(),
      },
      estimatedMonthlyPrice: prospectJson.estimatedMonthlyPrice as {
        amount: number;
        currency: string;
      },
      annualRevenuePotential: prospectJson.annualRevenuePotential as {
        amount: number;
        currency: string;
      },
      notes: prospect.getNotes(),
      source: prospect.getSource(),
      businessSize: prospect.getBusinessSize(),
      staffCount: prospect.getStaffCount(),
      currentSolution: prospect.getCurrentSolution(),
      isHotProspect: prospectJson.isHotProspect as boolean,
      createdAt: prospect.getCreatedAt().toISOString(),
      updatedAt: prospect.getUpdatedAt().toISOString(),
    };
  }
}
