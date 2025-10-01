/**
 * 🏢 Business Configuration Controller - Presentation Layer
 *
 * REST API endpoints for business configuration management
 * Handles dynamic timezone, currency, and locale configuration
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  HttpStatus,
  Logger,
  HttpException,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

// Application layer
import { UpdateBusinessConfigurationUseCase } from "@application/use-cases/business/update-business-configuration.use-case";
import { ApplicationValidationError } from "@application/exceptions/application.exceptions";

// Domain layer
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { DomainValidationError } from "@domain/exceptions/domain.exceptions";

// Presentation layer
import {
  UpdateBusinessConfigurationDto,
  BusinessConfigurationResponseDto,
  ErrorResponseDto,
} from "@presentation/dtos/business-configuration.dto";
import { BusinessConfigurationMapper } from "@presentation/mappers/business-configuration.mapper";

// Shared
import { TOKENS } from "@shared/constants/injection-tokens";

@ApiTags("Business Configuration")
@Controller("api/v1/businesses/:businessId/configuration")
export class BusinessConfigurationController {
  private readonly logger = new Logger(BusinessConfigurationController.name);

  constructor(
    @Inject(TOKENS.UPDATE_BUSINESS_CONFIGURATION_USE_CASE)
    private readonly updateBusinessConfigurationUseCase: UpdateBusinessConfigurationUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get Business Configuration",
    description:
      "Retrieve current configuration (timezone, currency, locale, business rules) for a business",
  })
  @ApiParam({
    name: "businessId",
    type: "string",
    format: "uuid",
    description: "Business unique identifier",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business configuration retrieved successfully",
    type: BusinessConfigurationResponseDto,
  })
  async getConfiguration(
    @Param("businessId") businessId: string,
  ): Promise<BusinessConfigurationResponseDto> {
    try {
      this.logger.debug(`Getting configuration for business: ${businessId}`);

      // Return default configuration for now
      return BusinessConfigurationMapper.createDefaultResponseDto(businessId);
    } catch (error) {
      this.logger.error("Failed to get business configuration", error);
      throw this.handleError(error);
    }
  }

  @Patch()
  @ApiOperation({
    summary: "Update Business Configuration",
    description:
      "Update business configuration including timezone, currency, locale, and business operation rules",
  })
  @ApiParam({
    name: "businessId",
    type: "string",
    format: "uuid",
    description: "Business unique identifier",
  })
  @ApiBody({
    type: UpdateBusinessConfigurationDto,
    description: "Configuration update data",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business configuration updated successfully",
    type: BusinessConfigurationResponseDto,
  })
  async updateConfiguration(
    @Param("businessId") businessId: string,
    @Body() updateDto: UpdateBusinessConfigurationDto,
  ): Promise<BusinessConfigurationResponseDto> {
    try {
      this.logger.log(`Updating configuration for business: ${businessId}`);

      // Validate business ID
      const businessIdVO = BusinessId.create(businessId);

      // Execute use case
      const request = {
        businessId: businessIdVO.getValue(),
        requestingUserId: "system", // TODO: Get from auth context
        timezone: updateDto.timezone,
        currency: updateDto.currency,
        locale: updateDto.locale,
        firstDayOfWeek: updateDto.firstDayOfWeek,
        businessWeekDays: updateDto.businessWeekDays,
        correlationId: `config-${Date.now()}`,
        timestamp: new Date(),
      };

      const result =
        await this.updateBusinessConfigurationUseCase.execute(request);

      // Map to response DTO
      const response = BusinessConfigurationMapper.toResponseDto(
        businessId,
        result.configuration,
        result.updatedAt,
      );

      this.logger.log(
        `Configuration updated successfully for business: ${businessId}`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Failed to update business configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw this.handleError(error);
    }
  }

  /**
   * Handle various error types and convert to appropriate HTTP responses
   */
  private handleError(error: unknown): HttpException {
    if (error instanceof DomainValidationError) {
      throw new HttpException(
        {
          message: error.message,
          code: "DOMAIN_VALIDATION_ERROR",
          details: [
            {
              field: error.field,
              value: error.value,
              message: error.message,
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (error instanceof ApplicationValidationError) {
      throw new HttpException(
        {
          message: error.message,
          code: "APPLICATION_VALIDATION_ERROR",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generic error handling
    throw new HttpException(
      {
        message:
          "An unexpected error occurred while processing business configuration",
        code: "INTERNAL_SERVER_ERROR",
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
