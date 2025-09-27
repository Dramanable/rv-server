import { ISkillRepository } from "../../../domain/repositories/skill.repository";
import { Logger } from "../../ports/logger.port";
import { I18nService } from "../../ports/i18n.port";
import { Skill } from "../../../domain/entities/skill.entity";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";

export interface ListSkillsRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
  };
  readonly filters?: {
    readonly search?: string;
    readonly category?: string;
    readonly isActive?: boolean;
    readonly isCritical?: boolean;
  };
  readonly sorting?: {
    readonly sortBy: "name" | "category" | "createdAt" | "updatedAt";
    readonly sortOrder: "asc" | "desc";
  };
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface ListSkillsResponse {
  readonly skills: Skill[];
  readonly metadata: {
    readonly totalCount: number;
    readonly pageCount: number;
    readonly currentPage: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly requestId: string;
    readonly timestamp: Date;
    readonly retrievedBy: string;
  };
}

export interface SkillSearchCriteria {
  readonly businessId: string;
  readonly search?: string;
  readonly category?: string;
  readonly isActive?: boolean;
  readonly isCritical?: boolean;
  readonly page: number;
  readonly limit: number;
  readonly sortBy: string;
  readonly sortOrder: "asc" | "desc";
}

export class ListSkillsUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListSkillsRequest): Promise<ListSkillsResponse> {
    this.logger.info("Listing skills with criteria", {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      filters: request.filters,
      pagination: request.pagination,
    });

    try {
      // Validate request
      this.validateRequest(request);

      // Build search criteria
      const criteria = this.buildSearchCriteria(request);

      // Get skills from repository
      const result = await this.skillRepository.findWithFilters({
        businessId: BusinessId.create(criteria.businessId),
        search: criteria.search,
        category: criteria.category,
        isActive: criteria.isActive,
        isCritical: criteria.isCritical,
        page: criteria.page,
        limit: criteria.limit,
        sortBy: criteria.sortBy as
          | "name"
          | "category"
          | "createdAt"
          | "updatedAt",
        sortOrder: criteria.sortOrder,
      });

      const {
        skills,
        total: totalCount,
        totalPages,
        currentPage: resultCurrentPage,
      } = result;

      // Calculate pagination metadata
      const itemsPerPage = criteria.limit;
      const hasNextPage = resultCurrentPage < totalPages;
      const hasPrevPage = resultCurrentPage > 1;

      this.logger.info("Skills retrieved successfully", {
        businessId: request.businessId,
        skillsCount: skills.length,
        totalCount,
        currentPage: resultCurrentPage,
        correlationId: request.correlationId,
      });

      return {
        skills,
        metadata: {
          totalCount,
          pageCount: totalPages,
          currentPage: resultCurrentPage,
          itemsPerPage,
          hasNextPage,
          hasPrevPage,
          requestId: request.correlationId,
          timestamp: new Date(),
          retrievedBy: request.requestingUserId,
        },
      };
    } catch (error) {
      this.logger.error(
        "Failed to list skills",
        error instanceof Error ? error : new Error("Unknown error"),
        {
          businessId: request.businessId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  private validateRequest(request: ListSkillsRequest): void {
    if (!request.correlationId) {
      throw new Error(
        this.i18n.translate("skill.validation.correlationIdRequired"),
      );
    }

    if (!request.requestingUserId) {
      throw new Error(
        this.i18n.translate("skill.validation.requestingUserIdRequired"),
      );
    }

    if (!request.timestamp) {
      throw new Error(
        this.i18n.translate("skill.validation.timestampRequired"),
      );
    }

    if (!request.businessId) {
      throw new Error(
        this.i18n.translate("skill.validation.businessIdRequired"),
      );
    }

    // Check if request is not too old (5 minutes)
    const requestAge = Date.now() - request.timestamp.getTime();
    if (requestAge > 5 * 60 * 1000) {
      throw new Error(this.i18n.translate("skill.validation.requestTooOld"));
    }

    // Validate pagination
    if (request.pagination) {
      if (request.pagination.page < 1) {
        throw new Error("Page must be greater than 0");
      }
      if (request.pagination.limit < 1 || request.pagination.limit > 100) {
        throw new Error("Limit must be between 1 and 100");
      }
    }
  }

  private buildSearchCriteria(request: ListSkillsRequest): SkillSearchCriteria {
    return {
      businessId: request.businessId,
      search: request.filters?.search,
      category: request.filters?.category,
      isActive: request.filters?.isActive,
      isCritical: request.filters?.isCritical,
      page: request.pagination?.page || 1,
      limit: request.pagination?.limit || 10,
      sortBy: request.sorting?.sortBy || "createdAt",
      sortOrder: request.sorting?.sortOrder || "desc",
    };
  }
}
