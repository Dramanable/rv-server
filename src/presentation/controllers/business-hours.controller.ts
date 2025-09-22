/**
 * 🕐 BusinessHoursController - Gestion des horaires d'ouverture
 *
 * Contrôleur pour la gestion complète des horaires d'ouverture des business :
 * - Consultation des horaires
 * - Mise à jour des horaires hebdomadaires
 * - Gestion des dates spéciales
 * - Vérification de disponibilité
 * - Configuration rapide par presets
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../security/auth.guard';
import { RolesGuard } from '../security/guards/roles.guard';
import { Roles } from '../security/decorators/roles.decorator';
import { GetUser } from '../security/decorators/get-user.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../../shared/constants/injection-tokens';

import {
  ManageBusinessHoursUseCase,
  GetBusinessHoursRequest,
  GetBusinessHoursResponse,
  UpdateBusinessHoursRequest,
  UpdateBusinessHoursResponse,
  AddSpecialDateRequest,
  AddSpecialDateResponse,
  CheckBusinessAvailabilityRequest,
  CheckBusinessAvailabilityResponse,
} from '../../application/use-cases/business/manage-business-hours.use-case';

// Import DTOs
import {
  GetBusinessHoursDto,
  UpdateBusinessHoursDto,
  AddSpecialDateDto,
  CheckAvailabilityDto,
  BusinessHoursQuickSetupDto,
  BusinessHoursResponseDto,
  UpsertBusinessHoursResponseDto,
  AddSpecialDateResponseDto,
  AvailabilityResponseDto,
} from '../dtos/business-hours.dtos';

// Import exceptions
import { BusinessNotFoundError } from '../../application/exceptions/application.exceptions';

@ApiTags('Business Hours')
@ApiBearerAuth()
@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessHoursController {
  constructor(
    @Inject(TOKENS.MANAGE_BUSINESS_HOURS_USE_CASE)
    private readonly manageBusinessHoursUseCase: ManageBusinessHoursUseCase,
  ) {}

  /**
   * 📖 Consulter les horaires d'ouverture d'un business
   */
  @Get(':businessId/hours')
  @ApiOperation({
    summary: 'Get business opening hours',
    description:
      'Retrieve complete business hours including weekly schedule, special dates, and current status',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Business hours retrieved successfully',
    type: BusinessHoursResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.PLATFORM_ADMIN,
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.REGULAR_CLIENT,
  )
  async getBusinessHours(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @GetUser() user: User,
  ): Promise<BusinessHoursResponseDto> {
    const result = await this.manageBusinessHoursUseCase.getBusinessHours({
      businessId,
      requestingUserId: user.id,
    });

    return {
      businessId: result.businessId,
      businessName: result.businessName,
      weeklySchedule: result.weeklySchedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        timeSlots: day.timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
          name: slot.name,
        })),
        specialNote: day.specialNote,
      })),
      specialDates: result.specialDates.map((date) => ({
        date: date.date.toISOString().split('T')[0], // Convert Date to string
        isOpen: date.isOpen,
        timeSlots: date.timeSlots?.map((slot) => ({
          start: slot.start,
          end: slot.end,
          name: slot.name,
        })),
        reason: date.reason,
      })),
      timezone: result.timezone,
      isCurrentlyOpen: result.isCurrentlyOpen,
      nextOpeningTime: result.nextOpeningTime,
    };
  }

  /**
   * ✏️ Mettre à jour les horaires d'ouverture
   */
  @Put(':businessId/hours')
  @ApiOperation({
    summary: 'Update business opening hours',
    description: 'Update weekly schedule and special dates for a business',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Business hours updated successfully',
    type: UpsertBusinessHoursResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid business hours data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.PLATFORM_ADMIN,
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
  )
  async updateBusinessHours(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() updateDto: Omit<UpdateBusinessHoursDto, 'businessId'>,
    @GetUser() user: User,
  ): Promise<UpsertBusinessHoursResponseDto> {
    const result = await this.manageBusinessHoursUseCase.updateBusinessHours({
      businessId,
      weeklySchedule: updateDto.weeklySchedule.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        timeSlots: day.timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
          name: slot.name,
        })),
        specialNote: day.specialNote,
      })),
      specialDates: updateDto.specialDates?.map((date) => ({
        date: new Date(date.date),
        isOpen: date.isOpen,
        timeSlots: date.timeSlots?.map((slot) => ({
          start: slot.start,
          end: slot.end,
          name: slot.name,
        })),
        reason: date.reason,
      })),
      timezone: updateDto.timezone,
      requestingUserId: user.id,
    });

    return {
      businessId: result.businessId,
      message: result.message,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * ➕ Ajouter une date spéciale
   */
  @Post(':businessId/hours/special-dates')
  @ApiOperation({
    summary: 'Add special date',
    description:
      'Add a special date (holiday, maintenance, etc.) with custom hours',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Special date added successfully',
    type: AddSpecialDateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid special date data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.PLATFORM_ADMIN,
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
  )
  async addSpecialDate(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() addDto: Omit<AddSpecialDateDto, 'businessId'>,
    @GetUser() user: User,
  ): Promise<AddSpecialDateResponseDto> {
    const result = await this.manageBusinessHoursUseCase.addSpecialDate({
      businessId,
      date: addDto.date,
      isOpen: addDto.isOpen,
      timeSlots: addDto.timeSlots?.map((slot) => ({
        start: slot.start,
        end: slot.end,
        name: slot.name,
      })),
      reason: addDto.reason,
      requestingUserId: user.id,
    });

    return {
      businessId: result.businessId,
      specialDate: {
        date: result.specialDate.date.toISOString().split('T')[0],
        isOpen: result.specialDate.isOpen,
        timeSlots: result.specialDate.timeSlots?.map((slot) => ({
          start: slot.start,
          end: slot.end,
          name: slot.name,
        })),
        reason: result.specialDate.reason,
      },
      message: result.message,
    };
  }

  // TODO: Implement removeSpecialDate method in use case

  /**
   * 🔍 Vérifier la disponibilité
   */
  @Post(':businessId/hours/check-availability')
  @ApiOperation({
    summary: 'Check business availability',
    description:
      'Check if business is open on a specific date/time and get available slots',
  })
  @ApiParam({
    name: 'businessId',
    description: 'Business ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability checked successfully',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found',
  })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.PLATFORM_ADMIN,
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.REGULAR_CLIENT,
  )
  async checkAvailability(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() checkDto: Omit<CheckAvailabilityDto, 'businessId'>,
    @GetUser() user: User,
  ): Promise<AvailabilityResponseDto> {
    const result = await this.manageBusinessHoursUseCase.checkAvailability({
      businessId,
      date: checkDto.date,
      time: checkDto.time,
    });

    return {
      businessId: result.businessId,
      date: result.date.toISOString().split('T')[0],
      isOpenOnDate: result.isOpenOnDate,
      availableTimeSlots: result.availableTimeSlots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        name: slot.name,
      })),
      isOpenAtTime: result.isOpenAtTime,
      nextAvailableSlot: result.nextAvailableSlot
        ? {
            start: result.nextAvailableSlot.start,
            end: result.nextAvailableSlot.end,
          }
        : undefined,
    };
  }

  // TODO: Implement quickSetupHours and getBusinessHoursStats methods in use case
}
