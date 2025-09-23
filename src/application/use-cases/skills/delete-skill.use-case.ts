import { ISkillRepository } from '../../../domain/repositories/skill.repository';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { IAuditService } from '../../ports/audit.port';
import {
  SkillNotFoundException,
  SkillInUseException,
  SkillValidationException,
} from '../../../domain/exceptions/skill.exceptions';

export interface DeleteSkillRequest {
  readonly skillId: string;
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly force?: boolean; // Force delete even if in use (admin only)
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface DeleteSkillResponse {
  readonly success: boolean;
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: Date;
    readonly deletedBy: string;
    readonly skillData: {
      readonly id: string;
      readonly name: string;
      readonly category: string;
      readonly isCritical: boolean;
    };
  };
}

export class DeleteSkillUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  async execute(request: DeleteSkillRequest): Promise<DeleteSkillResponse> {
    this.logger.info('Deleting skill', {
      skillId: request.skillId,
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      force: request.force || false,
    });

    try {
      // Validate request
      this.validateRequest(request);

      // Get existing skill
      const existingSkill = await this.skillRepository.findById(
        request.skillId,
      );
      if (!existingSkill) {
        this.logger.warn('Skill not found for deletion', {
          skillId: request.skillId,
          businessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      // Validate business ownership
      if (existingSkill.getBusinessId().getValue() !== request.businessId) {
        this.logger.warn('Skill deletion denied - wrong business', {
          skillId: request.skillId,
          skillBusinessId: existingSkill.getBusinessId().getValue(),
          requestingBusinessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      // Check if skill is in use (unless force delete)
      if (!request.force) {
        const isInUse = await this.skillRepository.isSkillInUse(
          request.skillId,
        );
        if (isInUse) {
          this.logger.warn('Cannot delete skill - currently in use', {
            skillId: request.skillId,
            skillName: existingSkill.getName(),
            businessId: request.businessId,
            correlationId: request.correlationId,
          });
          throw new SkillInUseException(request.skillId, {
            staffMembersCount: 1, // À récupérer depuis un service ou repository
            servicesCount: 0, // À récupérer depuis un service ou repository
            appointmentsCount: 0, // À récupérer depuis un service ou repository
          });
        }
      }

      // Validate critical skill deletion (extra security)
      if (existingSkill.isCritical() && !request.force) {
        this.logger.warn('Cannot delete critical skill without force flag', {
          skillId: request.skillId,
          skillName: existingSkill.getName(),
          businessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillValidationException(
          this.i18n.translate('skill.errors.criticalSkillRestricted', {
            operation: 'DELETE',
          }),
          'CRITICAL_SKILL_DELETE_RESTRICTED',
          { skillId: request.skillId, skillName: existingSkill.getName() },
        );
      }

      // Capture skill data for audit before deletion
      const skillData = {
        id: existingSkill.getId(),
        name: existingSkill.getName(),
        category: existingSkill.getCategory(),
        description: existingSkill.getDescription(),
        isCritical: existingSkill.isCritical(),
        isActive: existingSkill.isActive(),
        businessId: existingSkill.getBusinessId().getValue(),
        createdAt: existingSkill.getCreatedAt(),
        updatedAt: existingSkill.getUpdatedAt(),
      };

      // Delete the skill
      await this.skillRepository.delete(request.skillId);

      // Audit the operation
      await this.auditService.logOperation({
        operation: 'DELETE_SKILL',
        entityType: 'SKILL',
        entityId: request.skillId,
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes: {
          deleted: skillData,
        },
        metadata: {
          force: request.force || false,
          clientIp: request.clientIp,
          userAgent: request.userAgent,
        },
        timestamp: new Date(),
      });

      this.logger.info('Skill deleted successfully', {
        skillId: request.skillId,
        skillName: skillData.name,
        businessId: request.businessId,
        force: request.force || false,
        correlationId: request.correlationId,
      });

      return {
        success: true,
        metadata: {
          requestId: request.correlationId,
          timestamp: new Date(),
          deletedBy: request.requestingUserId,
          skillData: {
            id: skillData.id,
            name: skillData.name,
            category: skillData.category,
            isCritical: skillData.isCritical,
          },
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to delete skill',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          skillId: request.skillId,
          businessId: request.businessId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  private validateRequest(request: DeleteSkillRequest): void {
    if (!request.correlationId) {
      throw new SkillValidationException(
        this.i18n.translate('skill.validation.correlationIdRequired'),
        'CORRELATION_ID_REQUIRED',
        { skillId: request.skillId },
      );
    }

    if (!request.requestingUserId) {
      throw new SkillValidationException(
        this.i18n.translate('skill.validation.requestingUserIdRequired'),
        'REQUESTING_USER_ID_REQUIRED',
        { skillId: request.skillId },
      );
    }

    if (!request.timestamp) {
      throw new SkillValidationException(
        this.i18n.translate('skill.validation.timestampRequired'),
        'TIMESTAMP_REQUIRED',
        { skillId: request.skillId },
      );
    }

    if (!request.businessId) {
      throw new SkillValidationException(
        this.i18n.translate('skill.validation.businessIdRequired'),
        'BUSINESS_ID_REQUIRED',
        { skillId: request.skillId },
      );
    }

    if (!request.skillId) {
      throw new SkillValidationException(
        'Skill ID is required',
        'SKILL_ID_REQUIRED',
        {},
      );
    }

    // Check if request is not too old (5 minutes)
    const requestAge = Date.now() - request.timestamp.getTime();
    if (requestAge > 5 * 60 * 1000) {
      throw new SkillValidationException(
        this.i18n.translate('skill.validation.requestTooOld'),
        'REQUEST_TOO_OLD',
        { skillId: request.skillId },
      );
    }
  }
}
