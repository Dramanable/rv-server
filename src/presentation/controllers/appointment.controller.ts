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
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TOKENS } from '@shared/constants/injection-tokens';
import { User } from '../../domain/entities/user.entity';
import { GetUser } from '../security/decorators/get-user.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

import { BookAppointmentUseCase } from '../../application/use-cases/appointments/book-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointments/cancel-appointment.use-case';
import { GetAppointmentByIdUseCase } from '../../application/use-cases/appointments/get-appointment-by-id.use-case';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/appointments/get-available-slots-simple.use-case';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointments/list-appointments.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointments/update-appointment.use-case';

import {
  AppointmentDto,
  AppointmentStatsResponseDto,
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
    @Inject(TOKENS.LIST_APPOINTMENTS_USE_CASE)
    private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
    @Inject(TOKENS.GET_APPOINTMENT_BY_ID_USE_CASE)
    private readonly getAppointmentByIdUseCase: GetAppointmentByIdUseCase,
    @Inject(TOKENS.UPDATE_APPOINTMENT_USE_CASE)
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    @Inject(TOKENS.CANCEL_APPOINTMENT_USE_CASE)
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
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
    @GetUser() user: User,
  ): Promise<ListAppointmentsResponseDto> {
    const response = await this.listAppointmentsUseCase.execute({
      requestingUserId: user.id,
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      sorting: {
        sortBy: dto.sortBy || 'startTime',
        sortOrder: dto.sortOrder || 'asc',
      },
      filters: {
        search: dto.search,
        businessId: dto.businessId,
        status: dto.status,
        fromDate: dto.fromDate,
        toDate: dto.toDate,
      },
    });

    return {
      success: true,
      data: response.appointments.map((appointment) => ({
        id: appointment.id.getValue(),
        confirmationNumber: 'RV-' + appointment.id.getValue().substring(0, 8),
        status: appointment.status,
        type: appointment.type,
        startTime: appointment.timeSlot.getStartTime(),
        endTime: appointment.timeSlot.getEndTime(),
        clientName: `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`,
        clientEmail: appointment.clientInfo.email.getValue(),
        businessName: 'Business Name', // TODO: Récupérer depuis business
        serviceName: 'Service Name', // TODO: Récupérer depuis service
        staffName: undefined, // TODO: Récupérer depuis staff
        price: 0, // TODO: Récupérer le prix du service
        createdAt: appointment.createdAt || new Date(),
        updatedAt: appointment.updatedAt || new Date(),
      })),
      meta: response.meta,
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
  async getById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<AppointmentDto> {
    const response = await this.getAppointmentByIdUseCase.execute({
      appointmentId: id,
      requestingUserId: user.id,
    });

    const appointment = response.appointment;

    return {
      id: appointment.id.getValue(),
      confirmationNumber: 'RV-' + appointment.id.getValue().substring(0, 8),
      status: appointment.status,
      type: appointment.type,
      startTime: appointment.timeSlot.getStartTime(),
      endTime: appointment.timeSlot.getEndTime(),
      clientName: `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`,
      clientEmail: appointment.clientInfo.email.getValue(),
      businessName: 'Business Name', // TODO: Récupérer depuis business
      serviceName: 'Service Name', // TODO: Récupérer depuis service
      staffName: undefined, // TODO: Récupérer depuis staff
      price: 0, // TODO: Récupérer le prix du service
      createdAt: appointment.createdAt || new Date(),
      updatedAt: appointment.updatedAt || new Date(),
    };
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
  async updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @GetUser() user: User,
  ): Promise<UpdateAppointmentResponseDto> {
    const response = await this.updateAppointmentUseCase.execute({
      appointmentId: id,
      startTime: dto.startTime,
      endTime: dto.endTime,
      title: dto.title,
      description: dto.description,
      modificationReason: dto.modificationReason,
      requestingUserId: user.id,
    });

    const appointment = response.appointment;

    return {
      success: true,
      data: {
        id: appointment.id.getValue(),
        confirmationNumber: 'RV-' + appointment.id.getValue().substring(0, 8),
        status: appointment.status,
        type: appointment.type,
        startTime: appointment.timeSlot.getStartTime(),
        endTime: appointment.timeSlot.getEndTime(),
        clientName: `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`,
        clientEmail: appointment.clientInfo.email.getValue(),
        businessName: 'Business Name', // TODO: Récupérer depuis business
        serviceName: 'Service Name', // TODO: Récupérer depuis service
        staffName: undefined, // TODO: Récupérer depuis staff
        price: 0, // TODO: Récupérer le prix du service
        createdAt: appointment.createdAt || new Date(),
        updatedAt: appointment.updatedAt || new Date(),
      },
      message: response.message,
    };
  }

  /**
   * ❌ CANCEL APPOINTMENT
   */
  @Delete(':id')
  @ApiOperation({
    summary: '❌ Cancel appointment',
    description: 'Cancel an appointment with reason',
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
  async cancelAppointment(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
    @GetUser() user: User,
  ): Promise<CancelAppointmentResponseDto> {
    const response = await this.cancelAppointmentUseCase.execute({
      appointmentId: id,
      reason: dto.reason,
      notifyClient: dto.notifyClient || false,
      requestingUserId: user.id,
    });

    return {
      success: response.success,
      message: response.message,
      refundAmount: response.refundAmount,
    };
  } /**
   * 📊 APPOINTMENT STATISTICS
   */
  @Get('stats')
  @ApiOperation({
    summary: '📊 Get appointment statistics',
    description: 'Retrieve comprehensive appointment statistics and metrics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Statistics retrieved successfully',
    type: AppointmentStatsResponseDto,
  })
  async getStats(@GetUser() user: User): Promise<AppointmentStatsResponseDto> {
    // TODO: Implémenter GetAppointmentStatsUseCase une fois créé
    // Pour l'instant, retournons des statistiques temporaires
    return {
      success: true,
      data: {
        total: 0,
        byStatus: {
          CONFIRMED: 0,
          PENDING: 0,
          CANCELLED: 0,
          COMPLETED: 0,
          NO_SHOW: 0,
        },
        byPeriod: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          thisYear: 0,
        },
        revenue: {
          total: 0,
          thisMonth: 0,
          averagePerAppointment: 0,
        },
        topServices: [],
        recentActivity: [],
      },
      message: 'Statistics retrieved successfully',
    };
  }
}
