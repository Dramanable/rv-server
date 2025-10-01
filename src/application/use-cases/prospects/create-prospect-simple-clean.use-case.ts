/**
 * 🎯 CREATE PROSPECT SIMPLE USE CASE - Application Layer
 * ✅ TDD - Implémentation après test
 * ✅ Clean Architecture - Pure logique applicative
 */

import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { ISimplePermissionService } from '@application/ports/simple-permission.port';
import { IProspectRepository } from '@domain/repositories/prospect.repository';
import { Prospect } from '@domain/entities/prospect.entity';
import { UserRole } from '@shared/enums/user-role.enum';
import { BusinessSizeEnum } from '@domain/enums/business-size.enum';
import { ProspectPermissionError } from '@domain/exceptions/prospect.exceptions';

export interface CreateProspectRequest {
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactName: string;
  readonly assignedSalesRep?: string;
  readonly estimatedValue: number;
  readonly currency?: string;
  readonly businessSize?: BusinessSizeEnum;
  readonly staffCount?: number;
  readonly notes?: string;
  readonly source?: string;
  readonly currentSolution?: string;
  // Context
  readonly requestingUserId: string;
  readonly requestingUserRole: UserRole;
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
          correlationId: request.correlationId,
        },
      );

      // 📤 ÉTAPE 5 : Retourner la réponse
      return this.buildResponse(savedProspect);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create prospect: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions avec le système simplifié
   */
  private async validatePermissions(
    request: CreateProspectRequest,
  ): Promise<void> {
    console.log('🔐 Validating permissions with simplified system:', {
      userId: request.requestingUserId,
      userRole: request.requestingUserRole,
      action: 'CREATE',
      resource: 'PROSPECT',
    });

    const hasCreatePermission =
      await this.simplePermissionService.hasPermission(
        request.requestingUserId,
        request.requestingUserRole,
        'CREATE',
        'PROSPECT',
        null, // Permission globale pour les prospects
      );

    console.log('🔐 Create permission result:', hasCreatePermission);

    if (!hasCreatePermission) {
      this.logger.warn('Permission denied for creating prospect', {
        userId: request.requestingUserId,
        userRole: request.requestingUserRole,
        action: 'CREATE',
        resource: 'PROSPECT',
      });

      throw new ProspectPermissionError(
        request.requestingUserId,
        'create prospect',
      );
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
      throw new Error(
        this.i18n.translate('prospect.validation.businessNameRequired'),
      );
    }

    // Valider l'email
    if (!request.contactEmail || !request.contactEmail.includes('@')) {
      throw new Error(
        this.i18n.translate('prospect.validation.contactEmailInvalid'),
      );
    }

    // Valider le nom du contact
    if (!request.contactName || request.contactName.trim().length < 2) {
      throw new Error(
        this.i18n.translate('prospect.validation.contactNameRequired'),
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
      contactPhone: request.contactPhone?.trim() || '',
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
