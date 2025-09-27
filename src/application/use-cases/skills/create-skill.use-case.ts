import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { IAuditService } from '../../ports/audit.port';
import { ISkillRepository } from '../../../domain/repositories/skill.repository';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { Skill } from '../../../domain/entities/skill.entity';
import {
  SkillValidationException,
  SkillNameConflictException,
} from '../../../domain/exceptions/skill.exceptions';

/**
 * 🎯 Create Skill Use Case
 *
 * Crée une nouvelle compétence pour un business avec logging, audit et i18n complets.
 */

export interface CreateSkillRequest {
  // Business data
  readonly businessId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly isCritical: boolean;

  // ⚠️ CONTEXTE OBLIGATOIRE POUR APPLICATION D'ENTREPRISE
  readonly requestingUserId: string; // Qui fait l'action
  readonly correlationId: string; // Traçabilité unique UUID
  readonly clientIp?: string; // IP client pour sécurité
  readonly userAgent?: string; // User agent du client
  readonly timestamp: Date; // Horodatage précis de la requête
}

export interface CreateSkillResponse {
  readonly skillId: string;
  readonly businessId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly isCritical: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly success: boolean;
  readonly correlationId: string;
}

export class CreateSkillUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: Logger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
    private readonly auditService: IAuditService, // ⚠️ OBLIGATOIRE
  ) {}

  async execute(request: CreateSkillRequest): Promise<CreateSkillResponse> {
    // 📊 LOGGING OBLIGATOIRE - Début d'opération
    this.logger.info('Starting skill creation process', {
      businessId: request.businessId,
      skillName: request.name,
      category: request.category,
      isCritical: request.isCritical,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      clientIp: request.clientIp,
      userAgent: request.userAgent,
      timestamp: request.timestamp.toISOString(),
    });

    try {
      // 🔍 Validation du contexte obligatoire
      this.validateRequestContext(request);

      // 🔍 Validation business des données
      await this.validateBusinessRules(request);

      // 🏗️ Création de l'entité Skill
      const businessId = BusinessId.create(request.businessId);
      const skill = Skill.create(
        businessId,
        request.name,
        request.category,
        request.description,
        request.isCritical,
      );

      // 💾 Persistence
      const savedSkill = await this.skillRepository.save(skill);

      // 📊 LOGGING OBLIGATOIRE - Succès
      this.logger.info('Skill created successfully', {
        skillId: savedSkill.getId(),
        businessId: request.businessId,
        skillName: savedSkill.getName(),
        category: savedSkill.getCategory(),
        isCritical: savedSkill.isCritical(),
        correlationId: request.correlationId,
        duration: Date.now() - request.timestamp.getTime(),
      });

      // 🔐 AUDIT TRAIL OBLIGATOIRE
      await this.auditService.logOperation({
        operation: 'CREATE_SKILL',
        entityType: 'SKILL',
        entityId: savedSkill.getId(),
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes: {
          created: savedSkill.toJSON(),
        },
        metadata: {
          clientIp: request.clientIp,
          userAgent: request.userAgent,
          isCritical: savedSkill.isCritical(),
        },
        timestamp: new Date(),
      });

      // 📤 Response avec contexte de traçabilité
      return {
        skillId: savedSkill.getId(),
        businessId: savedSkill.getBusinessId().getValue(),
        name: savedSkill.getName(),
        category: savedSkill.getCategory(),
        description: savedSkill.getDescription(),
        isCritical: savedSkill.isCritical(),
        isActive: savedSkill.isActive(),
        createdAt: savedSkill.getCreatedAt(),
        success: true,
        correlationId: request.correlationId,
      };
    } catch (error) {
      // Type guard pour erreur
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // 📊 LOGGING OBLIGATOIRE - Erreur avec contexte complet
      this.logger.error('Failed to create skill', errorObj, {
        errorCode: (errorObj as any).code,
        errorName: errorObj.name,
        businessId: request.businessId,
        skillName: request.name,
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
        clientIp: request.clientIp,
        duration: Date.now() - request.timestamp.getTime(),
      });

      // Re-lancer avec contexte préservé
      throw errorObj;
    }
  }

  /**
   * 🔍 Validation du contexte obligatoire pour application d'entreprise
   */
  private validateRequestContext(request: CreateSkillRequest): void {
    if (!request.correlationId) {
      throw new SkillValidationException(
        'MISSING_CORRELATION_ID',
        this.i18n.translate('skill.validation.correlationIdRequired'),
        { correlationId: request.correlationId },
      );
    }

    if (!request.requestingUserId) {
      throw new SkillValidationException(
        'MISSING_REQUESTING_USER_ID',
        this.i18n.translate('skill.validation.requestingUserIdRequired'),
        { requestingUserId: request.requestingUserId },
      );
    }

    if (!request.timestamp || isNaN(request.timestamp.getTime())) {
      throw new SkillValidationException(
        'INVALID_TIMESTAMP',
        this.i18n.translate('skill.validation.timestampRequired'),
        { timestamp: request.timestamp },
      );
    }

    // Vérifier que la requête n'est pas trop ancienne (sécurité)
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const age = Date.now() - request.timestamp.getTime();
    if (age > maxAge) {
      throw new SkillValidationException(
        'REQUEST_TOO_OLD',
        this.i18n.translate('skill.validation.requestTooOld'),
        { age, maxAge, timestamp: request.timestamp },
      );
    }
  }

  /**
   * 🔍 Validation des règles métier
   */
  private async validateBusinessRules(
    request: CreateSkillRequest,
  ): Promise<void> {
    // Validation des données requises
    if (!request.businessId) {
      throw new SkillValidationException(
        'BUSINESS_ID_REQUIRED',
        this.i18n.translate('skill.validation.businessIdRequired'),
        { businessId: request.businessId },
      );
    }

    if (!request.name || request.name.trim().length < 2) {
      throw new SkillValidationException(
        'SKILL_NAME_REQUIRED',
        this.i18n.translate('skill.validation.nameRequired'),
        { name: request.name, minimumLength: 2 },
      );
    }

    if (!request.category || request.category.trim().length < 2) {
      throw new SkillValidationException(
        'SKILL_CATEGORY_REQUIRED',
        this.i18n.translate('skill.validation.categoryRequired'),
        { category: request.category, minimumLength: 2 },
      );
    }

    // Vérifier l'unicité du nom dans le business
    const businessId = BusinessId.create(request.businessId);
    const nameExists = await this.skillRepository.isNameTaken(
      businessId,
      request.name.trim(),
    );

    if (nameExists) {
      throw new SkillNameConflictException(
        request.name.trim(),
        request.businessId,
      );
    }

    this.logger.debug('Business rules validation completed', {
      businessId: request.businessId,
      skillName: request.name,
      correlationId: request.correlationId,
    });
  }
}
