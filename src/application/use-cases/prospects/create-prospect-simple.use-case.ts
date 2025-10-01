/**
 * 🆕 CREATE PROSPECT USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer avec système de permissions simplifié
 * ✅ Créer un nouveau prospect commercial
 */

import { Prospect } from '@domain/entities/prospect.entity';
import { IProspectRepository } from '@domain/repositories/prospect.repository';
import { BusinessSizeEnum } from '@domain/enums/business-size.enum';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { ISimplePermissionService } from '@application/ports/simple-permission.port';
import {
  ProspectValidationError,
  ProspectPermissionError,
  ProspectBusinessRuleError,
} from '@domain/exceptions/prospect.exceptions';
import {
  PermissionAction,
  ResourceType,
} from '@domain/entities/user-permission.entity';
import { UserRole } from '@shared/enums/user-role.enum';

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
  readonly requestingUserRole: UserRole; // 🆕 Role de l'utilisateur
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
  readonly assignedSalesRep: string;
  readonly estimatedValue: number;
  readonly currency: string;
  readonly status: string;
  readonly businessSize?: BusinessSizeEnum;
  readonly staffCount?: number;
  readonly source?: string;
  readonly notes?: string;
  readonly currentSolution?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class CreateProspectSimpleUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly simplePermissionService: ISimplePermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CreateProspectRequest,
  ): Promise<CreateProspectResponse> {
    this.logger.info('Creating new prospect with simple permissions', {
      businessName: request.businessName,
      contactEmail: request.contactEmail,
      requestingUserId: request.requestingUserId,
      requestingUserRole: request.requestingUserRole,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 ÉTAPE 1 : Vérifier les permissions avec le système simplifié
      await this.validatePermissions(request);

      // ✅ ÉTAPE 2 : Validation métier
      await this.validateBusinessRules(request);

      // 🏗️ ÉTAPE 3 : Créer l'entité Prospect
      const prospect = this.createProspectEntity(request);

      // 💾 ÉTAPE 4 : Sauvegarder
      const savedProspect = await this.prospectRepository.save(prospect);

      this.logger.info(
        'Prospect created successfully with simple permissions',
        {
          prospectId: savedProspect.getId().getValue(),
          businessName: request.businessName,
          assignedSalesRep: savedProspect.getAssignedSalesRep().getValue(),
          estimatedValue: savedProspect.getEstimatedValue().getAmount(),
          correlationId: request.correlationId,
        },
      );

      // 📤 ÉTAPE 5 : Retourner la réponse
      return this.buildResponse(savedProspect);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create prospect: ${errorMessage}`);

      // Relancer l'erreur pour le gestionnaire global
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions avec le système simplifié
   */
  private async validatePermissions(
    request: CreateProspectRequest,
  ): Promise<void> {
    console.log('🔐 Validateing permissions with simplified system:', {
      userId: request.requestingUserId,
      userRole: request.requestingUserRole,
      action: PermissionAction.CREATE,
      resource: ResourceType.PROSPECT,
    });

    // Vérifier la permission de créer des prospects
    const hasCreatePermission =
      await this.simplePermissionService.hasPermission(
        request.requestingUserId,
        request.requestingUserRole,
        PermissionAction.CREATE,
        ResourceType.PROSPECT,
        null, // Permission globale pour les prospects
      );

    console.log('🔐 Create permission result:', hasCreatePermission);

    if (!hasCreatePermission) {
      this.logger.warn('Permission denied for creating prospect', {
        userId: request.requestingUserId,
        userRole: request.requestingUserRole,
        action: PermissionAction.CREATE,
        resource: ResourceType.PROSPECT,
      });

      throw new ProspectPermissionError(
        request.requestingUserId,
        'create prospect',
      );
    }

    // Si un commercial spécifique est assigné, vérifier qu'on peut l'assigner
    if (
      request.assignedSalesRep &&
      request.assignedSalesRep !== request.requestingUserId
    ) {
      const canManage = await this.simplePermissionService.hasPermission(
        request.requestingUserId,
        request.requestingUserRole,
        PermissionAction.MANAGE,
        ResourceType.PROSPECT,
        null,
      );

      if (!canManage) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          'assign prospects to other sales reps',
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
    // Valider le nom de l'entreprise
    if (!request.businessName || request.businessName.trim().length < 2) {
      throw new ProspectValidationError(
        this.i18n.translate('prospect.validation.businessNameRequired'),
        'BUSINESS_NAME_REQUIRED',
      );
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.contactEmail)) {
      throw new ProspectValidationError(
        this.i18n.translate('prospect.validation.invalidEmail'),
        'INVALID_EMAIL',
      );
    }

    // Valider la valeur estimée
    if (request.estimatedValue < 0) {
      throw new ProspectBusinessRuleError(
        this.i18n.translate('prospect.business.invalidEstimatedValue'),
        'INVALID_ESTIMATED_VALUE',
      );
    }

    // Valider la taille de l'entreprise si fournie
    if (
      request.businessSize &&
      !Object.values(BusinessSizeEnum).includes(request.businessSize)
    ) {
      throw new ProspectValidationError(
        this.i18n.translate('prospect.validation.invalidBusinessSize'),
        'INVALID_BUSINESS_SIZE',
      );
    }
  }

  /**
   * 🏗️ Créer l'entité Prospect
   */
  private createProspectEntity(request: CreateProspectRequest): Prospect {
    return Prospect.create({
      businessName: request.businessName.trim(),
      contactEmail: request.contactEmail.toLowerCase().trim(),
      contactPhone: request.contactPhone?.trim(),
      contactName: request.contactName.trim(),
      assignedSalesRep: request.assignedSalesRep || request.requestingUserId,
      estimatedValue: request.estimatedValue,
      currency: request.currency || 'EUR',
      notes: request.notes?.trim(),
      source: request.source?.trim(),
      businessSize: request.businessSize,
      staffCount: request.staffCount,
      currentSolution: request.currentSolution?.trim(),
    });
  }

  /**
   * 📤 Construire la réponse
   */
  private buildResponse(prospect: Prospect): CreateProspectResponse {
    return {
      id: prospect.getId().getValue(),
      businessName: prospect.getBusinessName(),
      contactEmail: prospect.getContactEmail().getValue(),
      contactPhone: prospect.getContactPhone().getValue(),
      contactName: prospect.getContactName(),
      assignedSalesRep: prospect.getAssignedSalesRep().getValue(),
      estimatedValue: prospect.getEstimatedValue().getAmount(),
      currency: prospect.getEstimatedValue().getCurrency(),
      status: prospect.getStatus().getValue(),
      businessSize: prospect.getBusinessSize(),
      staffCount: prospect.getStaffCount(),
      source: prospect.getSource(),
      notes: prospect.getNotes(),
      currentSolution: prospect.getCurrentSolution(),
      createdAt: prospect.getCreatedAt(),
      updatedAt: prospect.getUpdatedAt(),
    };
  }
}
