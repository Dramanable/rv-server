import { ISkillRepository } from "../../../domain/repositories/skill.repository";
import { Logger } from "../../ports/logger.port";
import { I18nService } from "../../ports/i18n.port";
import { IAuditService } from "../../ports/audit.port";
import { Skill } from "../../../domain/entities/skill.entity";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import {
  SkillNotFoundException,
  SkillNameConflictException,
  SkillValidationException,
} from "../../../domain/exceptions/skill.exceptions";

export interface UpdateSkillRequest {
  readonly skillId: string;
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly updates: {
    readonly name?: string;
    readonly category?: string;
    readonly description?: string;
    readonly isCritical?: boolean;
    readonly isActive?: boolean;
  };
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface UpdateSkillResponse {
  readonly skill: Skill;
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: Date;
    readonly updatedBy: string;
    readonly changes: Record<string, { from: unknown; to: unknown }>;
  };
}

export class UpdateSkillUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly auditService: IAuditService,
  ) {}

  async execute(request: UpdateSkillRequest): Promise<UpdateSkillResponse> {
    this.logger.info("Updating skill", {
      skillId: request.skillId,
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      updateFields: Object.keys(request.updates),
    });

    try {
      // Validate request
      this.validateRequest(request);

      // Get existing skill
      const existingSkill = await this.skillRepository.findById(
        request.skillId,
      );
      if (!existingSkill) {
        this.logger.warn("Skill not found for update", {
          skillId: request.skillId,
          businessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      // Validate business ownership
      if (existingSkill.getBusinessId().getValue() !== request.businessId) {
        this.logger.warn("Skill update denied - wrong business", {
          skillId: request.skillId,
          skillBusinessId: existingSkill.getBusinessId().getValue(),
          requestingBusinessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      // Check name conflict if name is being updated
      if (
        request.updates.name &&
        request.updates.name !== existingSkill.getName()
      ) {
        const nameExists = await this.skillRepository.isNameTaken(
          BusinessId.create(request.businessId),
          request.updates.name,
          request.skillId,
        );

        if (nameExists) {
          this.logger.warn("Skill name conflict during update", {
            skillId: request.skillId,
            newName: request.updates.name,
            businessId: request.businessId,
            correlationId: request.correlationId,
          });
          throw new SkillNameConflictException(
            request.updates.name,
            request.businessId,
          );
        }
      }

      // Track changes for audit
      const changes: Record<string, { from: unknown; to: unknown }> = {};

      // Track changes for audit
      if (
        request.updates.name !== undefined &&
        request.updates.name !== existingSkill.getName()
      ) {
        changes.name = {
          from: existingSkill.getName(),
          to: request.updates.name,
        };
      }

      if (
        request.updates.category !== undefined &&
        request.updates.category !== existingSkill.getCategory()
      ) {
        changes.category = {
          from: existingSkill.getCategory(),
          to: request.updates.category,
        };
      }

      if (
        request.updates.description !== undefined &&
        request.updates.description !== existingSkill.getDescription()
      ) {
        changes.description = {
          from: existingSkill.getDescription(),
          to: request.updates.description,
        };
      }

      if (
        request.updates.isCritical !== undefined &&
        request.updates.isCritical !== existingSkill.isCritical()
      ) {
        changes.isCritical = {
          from: existingSkill.isCritical(),
          to: request.updates.isCritical,
        };
      }

      if (
        request.updates.isActive !== undefined &&
        request.updates.isActive !== existingSkill.isActive()
      ) {
        changes.isActive = {
          from: existingSkill.isActive(),
          to: request.updates.isActive,
        };
      }

      // Apply updates using entity methods
      let updatedSkill = existingSkill;

      // Update non-active fields first
      const entityUpdates: {
        name?: string;
        category?: string;
        description?: string;
        isCritical?: boolean;
      } = {};

      if (request.updates.name !== undefined) {
        entityUpdates.name = request.updates.name;
      }

      if (request.updates.category !== undefined) {
        entityUpdates.category = request.updates.category;
      }

      if (request.updates.description !== undefined) {
        entityUpdates.description = request.updates.description;
      }

      if (request.updates.isCritical !== undefined) {
        entityUpdates.isCritical = request.updates.isCritical;
      }

      // Apply entity updates if any
      if (Object.keys(entityUpdates).length > 0) {
        updatedSkill = updatedSkill.update(entityUpdates);
      }

      // Handle isActive separately using activate/deactivate methods
      if (
        request.updates.isActive !== undefined &&
        request.updates.isActive !== updatedSkill.isActive()
      ) {
        if (request.updates.isActive) {
          updatedSkill = updatedSkill.activate();
        } else {
          updatedSkill = updatedSkill.deactivate();
        }
      }

      // Save updated skill
      const savedSkill = await this.skillRepository.save(updatedSkill);

      // Audit the operation
      await this.auditService.logOperation({
        operation: "UPDATE_SKILL",
        entityType: "SKILL",
        entityId: request.skillId,
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes,
        timestamp: new Date(),
      });

      this.logger.info("Skill updated successfully", {
        skillId: request.skillId,
        skillName: savedSkill.getName(),
        businessId: request.businessId,
        changes: Object.keys(changes),
        correlationId: request.correlationId,
      });

      return {
        skill: savedSkill,
        metadata: {
          requestId: request.correlationId,
          timestamp: new Date(),
          updatedBy: request.requestingUserId,
          changes,
        },
      };
    } catch (error) {
      this.logger.error(
        "Failed to update skill",
        error instanceof Error ? error : new Error("Unknown error"),
        {
          skillId: request.skillId,
          businessId: request.businessId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  private validateRequest(request: UpdateSkillRequest): void {
    if (!request.correlationId) {
      throw new SkillValidationException(
        this.i18n.translate("skill.validation.correlationIdRequired"),
        "CORRELATION_ID_REQUIRED",
        { skillId: request.skillId },
      );
    }

    if (!request.requestingUserId) {
      throw new SkillValidationException(
        this.i18n.translate("skill.validation.requestingUserIdRequired"),
        "REQUESTING_USER_ID_REQUIRED",
        { skillId: request.skillId },
      );
    }

    if (!request.timestamp) {
      throw new SkillValidationException(
        this.i18n.translate("skill.validation.timestampRequired"),
        "TIMESTAMP_REQUIRED",
        { skillId: request.skillId },
      );
    }

    if (!request.businessId) {
      throw new SkillValidationException(
        this.i18n.translate("skill.validation.businessIdRequired"),
        "BUSINESS_ID_REQUIRED",
        { skillId: request.skillId },
      );
    }

    if (!request.skillId) {
      throw new SkillValidationException(
        "Skill ID is required",
        "SKILL_ID_REQUIRED",
        {},
      );
    }

    // Check if request is not too old (5 minutes)
    const requestAge = Date.now() - request.timestamp.getTime();
    if (requestAge > 5 * 60 * 1000) {
      throw new SkillValidationException(
        this.i18n.translate("skill.validation.requestTooOld"),
        "REQUEST_TOO_OLD",
        { skillId: request.skillId },
      );
    }

    // Validate at least one update field is provided
    const updateFields = Object.keys(request.updates);
    if (updateFields.length === 0) {
      throw new SkillValidationException(
        "At least one field must be provided for update",
        "NO_UPDATE_FIELDS",
        { skillId: request.skillId },
      );
    }

    // Validate update field values
    if (request.updates.name !== undefined) {
      if (!request.updates.name || request.updates.name.trim().length < 2) {
        throw new SkillValidationException(
          this.i18n.translate("skill.validation.nameRequired"),
          "NAME_INVALID",
          { skillId: request.skillId, name: request.updates.name },
        );
      }
      if (request.updates.name.length > 100) {
        throw new SkillValidationException(
          this.i18n.translate("skill.validation.nameTooLong"),
          "NAME_TOO_LONG",
          { skillId: request.skillId, name: request.updates.name },
        );
      }
    }

    if (request.updates.category !== undefined) {
      if (
        !request.updates.category ||
        request.updates.category.trim().length < 2
      ) {
        throw new SkillValidationException(
          this.i18n.translate("skill.validation.categoryRequired"),
          "CATEGORY_INVALID",
          { skillId: request.skillId, category: request.updates.category },
        );
      }
    }

    if (request.updates.description !== undefined) {
      if (
        request.updates.description &&
        request.updates.description.length > 500
      ) {
        throw new SkillValidationException(
          this.i18n.translate("skill.validation.descriptionTooLong"),
          "DESCRIPTION_TOO_LONG",
          {
            skillId: request.skillId,
            description: request.updates.description,
          },
        );
      }
    }
  }
}
