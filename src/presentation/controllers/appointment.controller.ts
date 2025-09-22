/**
 * 📅 APPOINTMENT CONTROLLER
 * ✅ REST API pour la gestion des rendez-vous
 * ✅ Inspiré de Doctolib - Consultation et réservation
 * ✅ Pattern standardisé avec recherche paginée
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TOKENS } from '@shared/constants/injection-tokens';
import { User } from '../../domain/entities/user.entity';
import { GetUser } from '../security/decorators/get-user.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

import { BookAppointmentUseCase } from '../../application/use-cases/appointments/book-appointment.use-case';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/appointments/get-available-slots-simple.use-case';

import {
  AppointmentDto,
  AvailableSlotsResponseDto,
  BookAppointmentDto,
  BookAppointmentResponseDto,
  CancelAppointmentDto,
  CancelAppointmentResponseDto,
  GetAvailableSlotsDto,
  ListAppointmentsDto,
  ListAppointmentsResponseDto,
  UpdateAppointmentDto,
  UpdateAppointmentResponseDto,
} from '../dtos/appointment.dto';

@ApiTags('📅 Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(
    @Inject(TOKENS.GET_AVAILABLE_SLOTS_USE_CASE)
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    @Inject(TOKENS.BOOK_APPOINTMENT_USE_CASE)
    private readonly bookAppointmentUseCase: BookAppointmentUseCase,
  ) {}

  /**
   * 🔍 GET AVAILABLE SLOTS - Inspired by Doctolib
   * Récupère les créneaux disponibles par jour/semaine
   */
  @Post('available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 Get available appointment slots',
    description: `
    Récupère les créneaux disponibles pour la réservation.
    Inspiré du système Doctolib avec navigation par jour/semaine.

    ✅ Fonctionnalités :
    - Consultation par jour, semaine actuelle, semaine suivante
    - Filtrage par service, praticien, durée
    - Affichage des créneaux libres uniquement
    - Support des récurrences et exceptions
    - Calcul automatique des heures d'ouverture

    📱 Usage frontend :
    - Calendrier interactif
    - Navigation fluide entre les périodes
    - Affichage temps réel de la disponibilité
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Available slots retrieved successfully',
    type: AvailableSlotsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid request parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  async getAvailableSlots(
    @Body() dto: GetAvailableSlotsDto,
    @GetUser() user: User,
  ): Promise<AvailableSlotsResponseDto> {
    const response = await this.getAvailableSlotsUseCase.execute({
      businessId: dto.businessId,
      serviceId: dto.serviceId,
      calendarId: dto.calendarId,
      staffId: dto.staffId,
      viewMode: dto.viewMode,
      referenceDate: dto.referenceDate,
      duration: dto.duration,
      includeUnavailableReasons: dto.includeUnavailableReasons,
      timeZone: dto.timeZone,
      requestingUserId: user.id,
    });

    return {
      success: true,
      data: {
        viewMode: response.viewMode,
        currentPeriod: response.currentPeriod,
        availableSlots: response.availableSlots.map((slot) => ({
          date: slot.date,
          dayOfWeek: slot.dayOfWeek,
          slots: slot.slots.map((timeSlot) => ({
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            isAvailable: timeSlot.isAvailable,
            price: timeSlot.price,
            staffName: timeSlot.staffName,
            staffId: timeSlot.staffId,
          })),
        })),
        navigation: response.navigation,
        metadata: {
          totalSlots: response.metadata.totalSlots,
          availableSlots: response.metadata.availableSlots,
          bookedSlots: response.metadata.bookedSlots,
          utilizationRate: response.metadata.utilizationRate,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `slots-${Date.now()}`,
      },
    };
  }

  /**
   * 📝 BOOK APPOINTMENT - Inspired by Doctolib booking flow
   * Réserve un rendez-vous avec toutes les validations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '📝 Book a new appointment',
    description: `
    Réserve un nouveau rendez-vous avec le flow complet Doctolib.

    ✅ Processus de réservation :
    1. Validation du créneau et disponibilité
    2. Collecte des informations client
    3. Vérification des conflits en temps réel
    4. Création du rendez-vous confirmé
    5. Envoi des notifications (email/SMS)
    6. Génération du numéro de confirmation

    📧 Notifications automatiques :
    - Email de confirmation immédiat
    - SMS si numéro fourni
    - Rappels programmés avant le RDV

    💳 Gestion des paiements :
    - Pré-autorisation si requise
    - Facturation différée
    - Gestion des annulations
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Appointment booked successfully',
    type: BookAppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid booking data or slot unavailable',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '⚠️ Time slot conflict detected',
  })
  async bookAppointment(
    @Body() dto: BookAppointmentDto,
  ): Promise<BookAppointmentResponseDto> {
    const response = await this.bookAppointmentUseCase.execute({
      businessId: dto.businessId,
      serviceId: dto.serviceId,
      calendarId: dto.calendarId,
      staffId: dto.staffId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      clientInfo: {
        firstName: dto.clientInfo.firstName,
        lastName: dto.clientInfo.lastName,
        email: dto.clientInfo.email,
        phone: dto.clientInfo.phone,
        dateOfBirth: dto.clientInfo.dateOfBirth,
        isNewClient: dto.clientInfo.isNewClient,
        notes: dto.clientInfo.notes,
      },
      type: dto.type,
      title: dto.title,
      description: dto.description,
      isUrgent: dto.isUrgent,
      notificationPreferences: dto.notificationPreferences,
      source: 'ONLINE',
      userAgent: 'WebApp',
      language: 'fr',
    });

    return {
      success: response.success,
      data: {
        appointmentId: response.appointmentId,
        confirmationNumber: response.confirmationNumber,
        status: response.status,
        message: response.message,
        appointmentDetails: response.appointmentDetails,
        clientInfo: response.clientInfo,
        nextSteps: response.nextSteps,
        notifications: response.notifications,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `book-${Date.now()}`,
      },
    };
  }

  /**
   * 📋 LIST APPOINTMENTS - Pattern standardisé
   * Liste paginée avec recherche et filtres avancés
   */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📋 List appointments with advanced search',
    description:
      'Provides comprehensive search, filtering, and pagination for appointments',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ListAppointmentsResponseDto,
  })
  async listAppointments(
    @Body() dto: ListAppointmentsDto,
  ): Promise<ListAppointmentsResponseDto> {
    // TODO: Implémenter le use case ListAppointmentsUseCase

    // Mock response pour l'instant
    return {
      success: true,
      data: [],
      meta: {
        currentPage: dto.page || 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: dto.limit || 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  /**
   * 📄 GET APPOINTMENT BY ID
   */
  @Get(':id')
  @ApiOperation({
    summary: '📄 Get appointment by ID',
    description: 'Retrieve detailed appointment information',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Appointment found',
    type: AppointmentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Appointment not found',
  })
  async getById(): Promise<AppointmentDto> {
    // TODO: Implémenter GetAppointmentByIdUseCase
    throw new Error('Not implemented yet');
  }

  /**
   * ✏️ UPDATE APPOINTMENT
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update appointment',
    description: 'Update appointment details, time, or status',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Appointment updated successfully',
    type: UpdateAppointmentResponseDto,
  })
  async updateAppointment(): Promise<UpdateAppointmentResponseDto> {
    // TODO: Implémenter UpdateAppointmentUseCase
    throw new Error('Not implemented yet');
  }

  /**
   * ❌ CANCEL APPOINTMENT
   */
  @Delete(':id')
  @ApiOperation({
    summary: '❌ Cancel appointment',
    description: 'Cancel an appointment with optional reason',
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Appointment cancelled successfully',
    type: CancelAppointmentResponseDto,
  })
  async cancelAppointment(): Promise<CancelAppointmentResponseDto> {
    // TODO: Implémenter CancelAppointmentUseCase
    throw new Error('Not implemented yet');
  }

  /**
   * 📊 GET APPOINTMENT STATS - Optionnel
   */
  @Get('stats')
  @ApiOperation({
    summary: '📊 Get appointment statistics',
    description: 'Retrieve appointment metrics and analytics',
  })
  @ApiQuery({
    name: 'businessId',
    required: false,
    description: 'Filter by business',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Statistics period',
  })
  async getStats(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
  ) {
    // TODO: Implémenter GetAppointmentStatsUseCase
    return {
      success: true,
      data: {
        totalAppointments: 0,
        confirmedAppointments: 0,
        cancelledAppointments: 0,
        utilizationRate: 0,
        revenue: 0,
      },
    };
  }
}
