import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { CalendarType } from "@domain/entities/calendar-type.entity";
import { CalendarTypeNotFoundError } from "@domain/exceptions/calendar-type.exceptions";
import { ICalendarTypeRepository } from "@domain/repositories/calendar-type.repository";
import { CalendarTypeId } from "@domain/value-objects/calendar-type-id.value-object";

export interface GetCalendarTypeByIdRequest {
  readonly calendarTypeId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface GetCalendarTypeByIdResponse {
  readonly calendarType: CalendarType;
}

/**
 * Use Case pour récupérer un type de calendrier par son ID
 * ✅ TDD Clean Architecture
 * ✅ Logging et audit complets
 * ✅ Validation métier
 */
export class GetCalendarTypeByIdUseCase {
  constructor(
    private readonly calendarTypeRepository: ICalendarTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetCalendarTypeByIdRequest,
  ): Promise<GetCalendarTypeByIdResponse> {
    this.logger.info("Getting calendar type by ID", {
      calendarTypeId: request.calendarTypeId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // Validation UUID
      if (!this.isValidUUID(request.calendarTypeId)) {
        throw new CalendarTypeNotFoundError(request.calendarTypeId);
      }

      // Récupération du calendar type
      const calendarTypeId = CalendarTypeId.fromString(request.calendarTypeId);
      const calendarType =
        await this.calendarTypeRepository.findById(calendarTypeId);

      if (!calendarType) {
        this.logger.warn("Calendar type not found", {
          calendarTypeId: request.calendarTypeId,
          correlationId: request.correlationId,
        });

        throw new CalendarTypeNotFoundError(request.calendarTypeId);
      }

      this.logger.info("Calendar type retrieved successfully", {
        calendarTypeId: request.calendarTypeId,
        calendarTypeName: calendarType.getName(),
        correlationId: request.correlationId,
      });

      return {
        calendarType,
      };
    } catch (error) {
      this.logger.error("Failed to get calendar type by ID", error as Error, {
        calendarTypeId: request.calendarTypeId,
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });
      throw error;
    }
  }

  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
