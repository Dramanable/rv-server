import { Skill } from "../../../domain/entities/skill.entity";
import { SkillNotFoundException } from "../../../domain/exceptions/skill.exceptions";
import { ISkillRepository } from "../../../domain/repositories/skill.repository";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";
import { I18nService } from "../../ports/i18n.port";
import { Logger } from "../../ports/logger.port";

export interface GetSkillByIdRequest {
  readonly skillId: string;
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface GetSkillByIdResponse {
  readonly skill: Skill;
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: Date;
    readonly retrievedBy: string;
  };
}

export class GetSkillByIdUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetSkillByIdRequest): Promise<GetSkillByIdResponse> {
    this.logger.info("Getting skill by ID", {
      skillId: request.skillId,
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // Validate request
      this.validateRequest(request);

      // Get skill from repository
      const skill = await this.skillRepository.findById(request.skillId);

      if (!skill) {
        this.logger.warn("Skill not found", {
          skillId: request.skillId,
          businessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      // Validate business ownership
      if (skill.getBusinessId().getValue() !== request.businessId) {
        this.logger.warn("Skill access denied - wrong business", {
          skillId: request.skillId,
          skillBusinessId: skill.getBusinessId().getValue(),
          requestingBusinessId: request.businessId,
          correlationId: request.correlationId,
        });
        throw new SkillNotFoundException(request.skillId);
      }

      this.logger.info("Skill retrieved successfully", {
        skillId: request.skillId,
        skillName: skill.getName(),
        businessId: request.businessId,
        correlationId: request.correlationId,
      });

      return {
        skill,
        metadata: {
          requestId: request.correlationId,
          timestamp: new Date(),
          retrievedBy: request.requestingUserId,
        },
      };
    } catch (error) {
      this.logger.error(
        "Failed to get skill by ID",
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

  private validateRequest(request: GetSkillByIdRequest): void {
    if (!request.correlationId) {
      throw new ApplicationValidationError(
        "correlationId",
        "required",
        this.i18n.translate("skill.validation.correlationIdRequired"),
      );
    }

    if (!request.requestingUserId) {
      throw new ApplicationValidationError(
        "requestingUserId",
        "required",
        this.i18n.translate("skill.validation.requestingUserIdRequired"),
      );
    }

    if (!request.timestamp) {
      throw new ApplicationValidationError(
        "timestamp",
        "required",
        this.i18n.translate("skill.validation.timestampRequired"),
      );
    }

    if (!request.businessId) {
      throw new ApplicationValidationError(
        "businessId",
        "required",
        this.i18n.translate("skill.validation.businessIdRequired"),
      );
    }

    if (!request.skillId) {
      throw new ApplicationValidationError(
        "skillId",
        "required",
        "Skill ID is required",
      );
    }

    // Check if request is not too old (5 minutes)
    const requestAge = Date.now() - request.timestamp.getTime();
    if (requestAge > 5 * 60 * 1000) {
      throw new ApplicationValidationError(
        "timestamp",
        "too_old",
        this.i18n.translate("skill.validation.requestTooOld"),
      );
    }
  }
}
