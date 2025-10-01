/**
 * 📅 APPOINTMENT CONTROLLER - CLEAN ARCHITECTURE
 * ✅ REST API pour la gestion des rendez-vous avec Clean Architecture
 * ✅ Pattern standardisé avec recherche paginée
 * ✅ Mapping Domain ↔ DTO avec AppointmentMapper
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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { User } from "@domain/entities/user.entity";
import { TOKENS } from "@shared/constants/injection-tokens";
import { GetUser } from "../security/decorators/get-user.decorator";

// Use Cases
import { BookAppointmentUseCase } from "@application/use-cases/appointments/book-appointment.use-case";
import { CancelAppointmentUseCase } from "@application/use-cases/appointments/cancel-appointment.use-case";
import { GetAppointmentByIdUseCase } from "@application/use-cases/appointments/get-appointment-by-id.use-case";
import { GetAvailableSlotsUseCase } from "@application/use-cases/appointments/get-available-slots-simple.use-case";
import { ListAppointmentsUseCase } from "@application/use-cases/appointments/list-appointments.use-case";
import { UpdateAppointmentUseCase } from "@application/use-cases/appointments/update-appointment.use-case";

// DTOs
import {
  AppointmentResponseDto,
  AvailableSlotResponseDto,
  BookAppointmentDto,
  BookAppointmentResponseDto,
  CancelAppointmentDto,
  CancelAppointmentResponseDto,
  GetAvailableSlotsDto,
  ListAppointmentsDto,
  ListAppointmentsResponseDto,
  UpdateAppointmentDto,
} from "../dtos/appointments";

// Mapper
import { AppointmentMapper } from "../mappers/appointment.mapper";

@ApiTags("📅 Appointments")
@Controller("appointments")
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
   * 🔍 GET AVAILABLE SLOTS
   * Récupère les créneaux disponibles pour un service
   */
  @Post("available-slots")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "🔍 Get Available Time Slots",
    description: `
    Récupère les créneaux disponibles pour un service donné.

    ✅ Fonctionnalités :
    - Recherche par service et business
    - Filtrage par calendrier spécifique
    - Créneaux disponibles en temps réel
    - Gestion des indisponibilités du staff

    🔐 Permissions requises :
    - BOOK_APPOINTMENTS ou READ_APPOINTMENTS
    - Scoping automatique selon contexte business
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Available slots found successfully",
    type: [AvailableSlotResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid request parameters",
  })
  async getAvailableSlots(
    @Body() dto: GetAvailableSlotsDto,
    @GetUser() user: User,
  ): Promise<AvailableSlotResponseDto[]> {
    const request = AppointmentMapper.toGetAvailableSlotsRequest(dto, user.id);
    const response = await this.getAvailableSlotsUseCase.execute(request);
    return response.availableSlots.map((slot) =>
      AppointmentMapper.toAvailableSlotResponseDto(slot),
    );
  }

  /**
   * 📅 BOOK APPOINTMENT
   * Réservation d'un nouveau rendez-vous
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "📅 Book New Appointment",
    description: `
    Réserve un nouveau rendez-vous avec validation complète.

    ✅ Fonctionnalités :
    - Validation de disponibilité en temps réel
    - Support des réservations familiales (bookedBy)
    - Vérification des permissions de réservation
    - Notifications automatiques

    📋 Règles métier :
    - Service doit autoriser la réservation en ligne
    - Créneaux validés côté serveur
    - Informations client obligatoires

    🔐 Permissions requises :
    - BOOK_APPOINTMENTS
    - Scoping par business context
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Appointment booked successfully",
    type: BookAppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid booking data or business rules violation",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Time slot no longer available",
  })
  async bookAppointment(
    @Body() dto: BookAppointmentDto,
    @GetUser() user: User,
  ): Promise<BookAppointmentResponseDto> {
    const request = AppointmentMapper.toBookAppointmentRequest(dto, user.id);
    const response = await this.bookAppointmentUseCase.execute(request);
    return AppointmentMapper.toBookAppointmentResponseDto(response);
  }

  /**
   * 📋 LIST APPOINTMENTS
   * Recherche avancée paginée des rendez-vous
   */
  @Post("list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "📋 List Appointments with Advanced Search",
    description: `
    Recherche avancée paginée des rendez-vous.

    ✅ Fonctionnalités :
    - Pagination (page, limit)
    - Tri multi-critères
    - Filtres par statut, date, service
    - Recherche textuelle sur client
    - Scoping automatique selon rôle

    🔐 Permissions requises :
    - VIEW_APPOINTMENTS (pour ses propres RDV)
    - MANAGE_APPOINTMENTS (pour tous les RDV du business)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Appointments found successfully",
    type: ListAppointmentsResponseDto,
  })
  async listAppointments(
    @Body() dto: ListAppointmentsDto,
    @GetUser() user: User,
  ): Promise<ListAppointmentsResponseDto> {
    const request = AppointmentMapper.toListAppointmentsRequest(dto, user.id);
    const response = await this.listAppointmentsUseCase.execute(request);
    return AppointmentMapper.toListAppointmentsResponseDto(response);
  }

  /**
   * 🔍 GET APPOINTMENT BY ID
   * Récupère un rendez-vous par son ID
   */
  @Get(":id")
  @ApiOperation({
    summary: "🔍 Get Appointment by ID",
    description:
      "Récupère les détails complets d'un rendez-vous par son identifiant.",
  })
  @ApiParam({
    name: "id",
    description: "UUID de l'appointment",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Appointment found successfully",
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Appointment not found",
  })
  async getAppointmentById(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<AppointmentResponseDto> {
    const response = await this.getAppointmentByIdUseCase.execute({
      appointmentId: id,
      requestingUserId: user.id,
    });
    return AppointmentMapper.toAppointmentResponseDto(response.appointment);
  }

  /**
   * ✏️ UPDATE APPOINTMENT
   * Mise à jour d'un rendez-vous existant
   */
  @Put(":id")
  @ApiOperation({
    summary: "✏️ Update Appointment",
    description: `
    Met à jour un rendez-vous existant avec validation des règles métier.

    ✅ Modifications autorisées :
    - Changement de créneaux horaires
    - Modification des informations client
    - Ajout/modification de notes
    - Réassignation de staff

    🔐 Permissions requises :
    - MANAGE_APPOINTMENTS ou propriétaire du RDV
    `,
  })
  @ApiParam({
    name: "id",
    description: "UUID de l'appointment à modifier",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Appointment updated successfully",
    type: AppointmentResponseDto,
  })
  async updateAppointment(
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentDto,
    @GetUser() user: User,
  ): Promise<AppointmentResponseDto> {
    const request = AppointmentMapper.toUpdateAppointmentRequest(
      dto,
      id,
      user.id,
    );
    const response = await this.updateAppointmentUseCase.execute(request);
    return AppointmentMapper.toAppointmentResponseDto(response.appointment);
  }

  /**
   * ❌ CANCEL APPOINTMENT
   * Annulation d'un rendez-vous
   */
  @Delete(":id")
  @ApiOperation({
    summary: "❌ Cancel Appointment",
    description: `
    Annule un rendez-vous avec gestion des notifications.

    ✅ Fonctionnalités :
    - Annulation avec raison
    - Notifications automatiques
    - Libération du créneau
    - Historique d'annulation

    🔐 Permissions requises :
    - CANCEL_APPOINTMENTS ou propriétaire du RDV
    `,
  })
  @ApiParam({
    name: "id",
    description: "UUID de l'appointment à annuler",
    format: "uuid",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Appointment cancelled successfully",
    type: CancelAppointmentResponseDto,
  })
  async cancelAppointment(
    @Param("id") id: string,
    @Body() dto: CancelAppointmentDto,
    @GetUser() user: User,
  ): Promise<CancelAppointmentResponseDto> {
    const request = AppointmentMapper.toCancelAppointmentRequest(
      dto,
      id,
      user.id,
    );
    const response = await this.cancelAppointmentUseCase.execute(request);
    return AppointmentMapper.toCancelAppointmentResponseDto(
      response,
      response.appointment,
    );
  }
}
