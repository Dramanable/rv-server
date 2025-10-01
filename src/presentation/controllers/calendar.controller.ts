/**
 * 📅 Calendar Controller - Clean Architecture + NestJS
 *
 * ✅ ENDPOINTS STANDARDISÉS REST
 * ✅ Validation automatique avec DTOs
 * ✅ Documentation Swagger complète
 * ✅ Gestion d'erreurs avec i18n
 * ✅ Authentification et autorisation
 * ✅ Logging et audit trail
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCalendarUseCase } from '../../application/use-cases/calendar/create-calendar.use-case';
import {
  DeleteCalendarRequest,
  DeleteCalendarUseCase,
} from '../../application/use-cases/calendar/delete-calendar.use-case';
import { GetCalendarByIdUseCase } from '../../application/use-cases/calendar/get-calendar-by-id.use-case';
import { ListCalendarsUseCase } from '../../application/use-cases/calendar/list-calendars.use-case';
import {
  UpdateCalendarRequest,
  UpdateCalendarUseCase,
} from '../../application/use-cases/calendar/update-calendar.use-case';
import { CalendarStatus as DomainCalendarStatus } from '../../domain/entities/calendar.entity';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../../shared/constants/injection-tokens';
import {
  CalendarResponseDto,
  CalendarStatus,
  CreateCalendarDto,
  CreateCalendarResponseDto,
  DeleteCalendarResponseDto,
  ListCalendarsDto,
  ListCalendarsResponseDto,
  UpdateCalendarDto,
  UpdateCalendarResponseDto,
  WorkingHoursDto,
} from '../dtos/calendar.dto';
import { CalendarRequestMapper } from '../mappers/calendar-request.mapper';
import { GetUser } from '../security/decorators/get-user.decorator';

@ApiTags('📅 Calendars')
@Controller('calendars')
@ApiBearerAuth()
export class CalendarController {
  constructor(
    @Inject(TOKENS.CREATE_CALENDAR_USE_CASE)
    private readonly createCalendarUseCase: CreateCalendarUseCase,

    @Inject(TOKENS.GET_CALENDAR_USE_CASE)
    private readonly getCalendarUseCase: GetCalendarByIdUseCase,

    @Inject(TOKENS.LIST_CALENDARS_USE_CASE)
    private readonly listCalendarsUseCase: ListCalendarsUseCase,

    @Inject(TOKENS.UPDATE_CALENDAR_USE_CASE)
    private readonly updateCalendarUseCase: UpdateCalendarUseCase,

    @Inject(TOKENS.DELETE_CALENDAR_USE_CASE)
    private readonly deleteCalendarUseCase: DeleteCalendarUseCase,
  ) {}

  /**
   * 🔍 LIST CALENDARS - POST /api/v1/calendars/list
   * Recherche et filtrage avancés avec pagination
   */
  @Post('list')
  @ApiOperation({
    summary: 'List calendars with advanced search and pagination',
    description: `
    Provides comprehensive search, filtering, and pagination for calendars.

    **Features:**
    - Advanced text search across name and description
    - Filter by business, type, status, and active status
    - Flexible sorting by multiple fields
    - Standardized pagination with metadata
    - Permission-based access control

    **Required Permissions:** VIEW_CALENDARS or calendar ownership
    `,
  })
  @ApiBody({ type: ListCalendarsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated list of calendars returned successfully',
    type: ListCalendarsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters (validation failed)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to list calendars',
  })
  async list(
    @Body() dto: ListCalendarsDto,
    @GetUser() user: User,
  ): Promise<ListCalendarsResponseDto> {
    // Utilisation du mapper dédié pour éviter les conflits d'enums
    const request = CalendarRequestMapper.toListCalendarsRequest(dto, user.id);

    const result = await this.listCalendarsUseCase.execute(request);

    return {
      data: result.data.map((calendar) => ({
        id: calendar.id,
        name: calendar.name,
        description:
          calendar.description?.length > 100
            ? calendar.description.substring(0, 100) + '...'
            : calendar.description || '',
        businessId: calendar.businessId,
        type: calendar.type as any,
        status: this.mapDomainStatusToDto(calendar.status),
        timeZone: 'Europe/Paris', // TODO: Add to use case response
        isDefault: false, // TODO: Add to use case response
        color: '#007bff', // TODO: Add to use case response
        createdAt: calendar.createdAt,
        updatedAt: calendar.updatedAt,
      })),
      meta: {
        currentPage: result.meta.currentPage,
        totalPages: result.meta.totalPages,
        totalItems: result.meta.totalItems,
        itemsPerPage: result.meta.itemsPerPage,
        hasNextPage: result.meta.hasNextPage,
        hasPrevPage: result.meta.hasPrevPage,
      },
    };
  }

  /**
   * 📄 GET CALENDAR BY ID - GET /api/v1/calendars/:id
   * Récupère les détails complets d'un calendrier
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get calendar by ID',
    description: `
    Retrieves detailed information about a specific calendar.

    **Features:**
    - Complete calendar information including settings
    - Business association
    - Availability rules and time zones
    - Calendar customization options

    **Required Permissions:** VIEW_CALENDAR or calendar ownership
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar unique identifier (UUID)',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar details returned successfully',
    type: CalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid calendar ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Calendar not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to view this calendar',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<CalendarResponseDto> {
    const request = {
      requestingUserId: user.id,
      calendarId: id,
    };

    const calendar = await this.getCalendarUseCase.execute(request);

    return {
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      businessId: calendar.businessId,
      type: calendar.type as any,
      status: this.mapDomainStatusToDto(calendar.status),
      settings: calendar.settings,
      availability: calendar.availability,
      bookingRulesCount: 0, // TODO: Calculate from actual booking rules
      createdAt: new Date(), // TODO: Add to CalendarDetailsResponse
      updatedAt: new Date(), // TODO: Add to CalendarDetailsResponse
    };
  }

  /**
   * ➕ CREATE CALENDAR - POST /api/v1/calendars
   * Crée un nouveau calendrier
   */
  @Post()
  @ApiOperation({
    summary: 'Create new calendar',
    description: `
    Creates a new calendar with complete configuration.

    **Features:**
    - Complete calendar profile creation
    - Business association
    - Availability rules configuration
    - Custom settings and appearance

    **Required Permissions:** CREATE_CALENDAR (Business Owner or authorized user)
    `,
  })
  @ApiBody({ type: CreateCalendarDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Calendar created successfully',
    type: CreateCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid calendar data (validation failed)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Calendar with this name already exists for the business',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to create calendar',
  })
  async create(
    @Body() dto: CreateCalendarDto,
    @GetUser() user: User,
  ): Promise<CreateCalendarResponseDto> {
    const request = {
      requestingUserId: user.id,
      name: dto.name,
      description: dto.description,
      businessId: dto.businessId,
      type: dto.type as any,
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'FR',
      }, // TODO: Add to DTO or make optional in use case
      workingHours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
      }, // TODO: Add to DTO or make optional in use case
    };

    const result = await this.createCalendarUseCase.execute(request);

    return {
      id: result.id,
      name: result.name,
      description: result.description || '',
      businessId: result.businessId,
      type: result.type as any,
      status: CalendarStatus.ACTIVE, // TODO: Add to CreateCalendarResponse
      createdAt: result.createdAt,
    };
  }

  /**
   * ✏️ UPDATE CALENDAR - PUT /api/v1/calendars/:id
   * Met à jour un calendrier existant
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update calendar',
    description: `
    Updates an existing calendar with new information.

    **Features:**
    - Partial update support (only provided fields are updated)
    - Calendar configuration modification
    - Availability rules update
    - Settings customization

    **Required Permissions:** UPDATE_CALENDAR or calendar ownership
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar unique identifier (UUID)',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCalendarDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar updated successfully',
    type: UpdateCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid calendar data (validation failed)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Calendar not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to update this calendar',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCalendarDto,
    @GetUser() user: User,
  ): Promise<UpdateCalendarResponseDto> {
    const request: UpdateCalendarRequest = {
      requestingUserId: user.id,
      calendarId: id,
      name: dto.name,
      description: dto.description,
      settings: dto.settings
        ? {
            timeZone: dto.settings.timezone,
            workingHours: dto.workingHours
              ? this.mapWorkingHoursToRecord(dto.workingHours)
              : undefined,
            slotDuration: dto.settings.defaultSlotDuration,
            bufferTime: dto.settings.bufferTimeBetweenSlots,
            maxAdvanceBooking: dto.settings.maximumAdvanceBooking,
            minAdvanceBooking: dto.settings.minimumNotice,
            allowWeekendBooking: true, // TODO: Add to DTO
            autoConfirm: dto.settings.autoConfirmBookings,
          }
        : undefined,
    };

    const response = await this.updateCalendarUseCase.execute(request);

    return {
      id: response.calendar.id.getValue(),
      name: response.calendar.name,
      description: response.calendar.description,
      status: this.mapDomainStatusToDto(response.calendar.status),
      updatedAt: response.calendar.updatedAt,
    };
  }

  /**
   * 🗑️ DELETE CALENDAR - DELETE /api/v1/calendars/:id
   * Supprime un calendrier
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete calendar',
    description: `
    Deletes a calendar and handles associated appointments.

    **Warning:** This operation may affect:
    - Existing appointments (will need to be reassigned or cancelled)
    - Default calendar status (will be transferred to another calendar)
    - Availability settings and rules

    **Required Permissions:** DELETE_CALENDAR (Business Owner or authorized user)
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar unique identifier (UUID)',
    example: 'c123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar deleted successfully',
    type: DeleteCalendarResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Calendar not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to delete this calendar',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Cannot delete calendar with active appointments or constraints',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<DeleteCalendarResponseDto> {
    const request: DeleteCalendarRequest = {
      requestingUserId: user.id,
      calendarId: id,
    };

    const response = await this.deleteCalendarUseCase.execute(request);

    return {
      success: true,
      message: response.message,
      deletedId: id,
      deletedAt: new Date(),
    };
  }

  /**
   * 🔄 MAPPER: Convert Domain CalendarStatus to DTO CalendarStatus
   * Pour les réponses API
   */
  private mapDomainStatusToDto(status: DomainCalendarStatus): CalendarStatus {
    switch (status) {
      case DomainCalendarStatus.ACTIVE:
        return CalendarStatus.ACTIVE;
      case DomainCalendarStatus.INACTIVE:
        return CalendarStatus.INACTIVE;
      case DomainCalendarStatus.MAINTENANCE:
        return CalendarStatus.MAINTENANCE;
      default:
        return CalendarStatus.INACTIVE;
    }
  }

  /**
   * 🔄 MAPPER: Convert WorkingHoursDto[] to Record format
   * Pour les use cases
   */
  private mapWorkingHoursToRecord(
    workingHours: WorkingHoursDto[],
  ): Record<string, { start: string; end: string }> {
    const record: Record<string, { start: string; end: string }> = {};

    workingHours.forEach((wh) => {
      if (wh.isWorking) {
        const dayName = this.getDayName(wh.dayOfWeek);
        record[dayName] = {
          start: wh.startTime,
          end: wh.endTime,
        };
      }
    });

    return record;
  }

  /**
   * Helper: Convert day number to name
   */
  private getDayName(dayOfWeek: number): string {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return days[dayOfWeek] || 'monday';
  }
}
