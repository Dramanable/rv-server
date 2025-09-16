import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpException,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
  AppointmentListQueryDto,
  PaginatedAppointmentResponseDto,
  AppointmentAvailabilityDto,
  AppointmentStatus,
} from '../dtos/appointment/appointment.dto';

/**
 * 📅 Appointment Management Controller
 * 
 * Comprehensive appointment lifecycle management including:
 * - Appointment booking with intelligent conflict detection
 * - Multi-criteria filtering and search capabilities
 * - Real-time availability checking across calendars
 * - Status management (pending, confirmed, completed, cancelled)
 * - Recurring appointment creation and management
 * - Client communication and reminder systems
 * - Revenue tracking and analytics integration
 * 
 * This controller is designed for complex appointment systems supporting:
 * - Multi-tenant business isolation with security
 * - Cross-calendar availability optimization
 * - Intelligent staff assignment and load balancing
 * - Real-time updates and conflict resolution
 * - Comprehensive audit trails for compliance
 * - Performance optimized queries for high-volume practices
 * 
 * Frontend Integration Examples:
 * ```typescript
 * // Appointment booking service
 * class AppointmentService {
 *   async bookAppointment(appointmentData: CreateAppointmentDto) {
 *     // Pre-validate availability
 *     const availability = await this.checkAvailability({
 *       businessId: appointmentData.businessId,
 *       serviceId: appointmentData.serviceId,
 *       startDate: appointmentData.startTime,
 *       endDate: appointmentData.endTime
 *     });
 *     
 *     if (!availability.available) {
 *       throw new Error('Selected time slot is not available');
 *     }
 *     
 *     const response = await api.post('/appointments', appointmentData);
 *     return response.data; // AppointmentResponseDto
 *   }
 *   
 *   async getAppointments(filters: AppointmentListQueryDto) {
 *     const params = new URLSearchParams({
 *       ...filters,
 *       page: filters.page?.toString() || '1',
 *       limit: filters.limit?.toString() || '20'
 *     });
 *     
 *     const response = await api.get(`/appointments?${params}`);
 *     return response.data; // PaginatedAppointmentResponseDto
 *   }
 *   
 *   async updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string) {
 *     const response = await api.patch(`/appointments/${id}/status`, { 
 *       status, 
 *       notes 
 *     });
 *     return response.data;
 *   }
 *   
 *   async rescheduleAppointment(id: string, newStartTime: string, newEndTime: string) {
 *     const response = await api.put(`/appointments/${id}`, {
 *       startTime: newStartTime,
 *       endTime: newEndTime,
 *       status: AppointmentStatus.RESCHEDULED
 *     });
 *     return response.data;
 *   }
 * }
 * 
 * // Calendar view component integration
 * const CalendarView = ({ businessId, staffId }) => {
 *   const [appointments, setAppointments] = useState([]);
 *   const [selectedDate, setSelectedDate] = useState(new Date());
 *   
 *   useEffect(() => {
 *     const fetchAppointments = async () => {
 *       const startDate = new Date(selectedDate);
 *       startDate.setHours(0, 0, 0, 0);
 *       
 *       const endDate = new Date(selectedDate);
 *       endDate.setHours(23, 59, 59, 999);
 *       
 *       const response = await appointmentService.getAppointments({
 *         businessId,
 *         staffId,
 *         startDate: startDate.toISOString(),
 *         endDate: endDate.toISOString(),
 *         includeCancelled: false
 *       });
 *       
 *       setAppointments(response.data);
 *     };
 *     
 *     fetchAppointments();
 *   }, [businessId, staffId, selectedDate]);
 *   
 *   return (
 *     <div className="calendar-grid">
 *       {appointments.map(appointment => (
 *         <AppointmentCard 
 *           key={appointment.id}
 *           appointment={appointment}
 *           onStatusChange={(newStatus) => 
 *             appointmentService.updateAppointmentStatus(appointment.id, newStatus)
 *           }
 *           onReschedule={(newTime) => 
 *             appointmentService.rescheduleAppointment(appointment.id, newTime)
 *           }
 *         />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
@ApiTags('Appointment Management')
@Controller('appointments')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when authentication is implemented
export class AppointmentController {
  // Inject use cases and services here when implementing
  // constructor(
  //   private readonly createAppointmentUseCase: CreateAppointmentUseCase,
  //   private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
  //   private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
  //   private readonly getAppointmentUseCase: GetAppointmentUseCase,
  //   private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
  //   private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  //   private readonly appointmentAnalyticsUseCase: AppointmentAnalyticsUseCase,
  //   private readonly notificationService: NotificationService,
  //   private readonly logger: Logger,
  //   private readonly i18n: I18nService
  // ) {}

  /**
   * 📋 Get Appointment List with Advanced Filtering
   * 
   * Retrieves appointments with comprehensive filtering for practice management.
   * Supports multi-dimensional filtering, search, and real-time status updates.
   * 
   * Use Cases:
   * - Daily/weekly appointment schedule views
   * - Client appointment history lookup
   * - Staff workload and schedule management
   * - Revenue and booking analytics generation
   * - Appointment conflict identification
   * 
   * Frontend Usage:
   * ```typescript
   * // Get today's appointments for a staff member
   * const todayAppointments = await appointmentService.getAppointments({
   *   staffId: 'staff-uuid',
   *   startDate: '2024-01-26T00:00:00Z',
   *   endDate: '2024-01-26T23:59:59Z',
   *   status: AppointmentStatus.CONFIRMED,
   *   sortBy: 'startTime',
   *   sortOrder: 'asc'
   * });
   * 
   * // Search appointments by client name
   * const clientAppointments = await appointmentService.getAppointments({
   *   search: 'jean dupont',
   *   businessId: 'business-uuid',
   *   includeCancelled: true
   * });
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get appointment list with filtering',
    description: `
      Retrieve appointments with comprehensive filtering for practice management systems.
      
      **Key Features:**
      - Multi-tenant business isolation with security enforcement
      - Real-time appointment status and availability updates
      - Cross-calendar appointment aggregation and filtering
      - Full-text search across client information and notes
      - Date range filtering with timezone awareness
      - Staff workload and utilization analytics
      
      **Performance Optimizations:**
      - Indexed queries for common filter combinations
      - Pagination for handling large appointment volumes
      - Eager loading of related entities (staff, service, calendar)
      - Caching for frequently accessed appointment lists
      - Optimized JSON aggregation for summary statistics
      
      **Business Intelligence:**
      - Appointment summary statistics in response metadata
      - Revenue calculations and trend analysis
      - Utilization rates and capacity planning data
      - Client retention and booking pattern insights
      
      **Error Scenarios:**
      - 403: User lacks permission to view appointments in business
      - 400: Invalid date range or filter parameters
      - 404: Specified business, staff, or service not found
    `
  })
  @ApiQuery({ type: AppointmentListQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment list retrieved successfully',
    type: PaginatedAppointmentResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 'appointment-uuid-123',
            businessId: 'business-uuid-456',
            calendarId: 'calendar-uuid-789',
            serviceId: 'service-uuid-101',
            staffId: 'staff-uuid-202',
            clientId: 'client-uuid-303',
            startTime: '2024-01-26T09:00:00Z',
            endTime: '2024-01-26T09:30:00Z',
            status: 'CONFIRMED',
            clientInfo: {
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean.dupont@email.fr',
              phone: '+33 1 23 45 67 89'
            },
            price: {
              amount: 5000,
              currency: 'EUR'
            },
            notes: 'Initial consultation',
            sendReminders: true,
            service: {
              id: 'service-uuid-101',
              name: 'Consultation Générale',
              category: 'CONSULTATION',
              duration: 30
            },
            staff: {
              id: 'staff-uuid-202',
              firstName: 'Dr. Marie',
              lastName: 'Dupont',
              displayName: 'Dr. Marie Dupont'
            },
            calendar: {
              id: 'calendar-uuid-789',
              name: 'Cabinet Principal',
              type: 'STAFF',
              color: '#4CAF50'
            },
            createdAt: '2024-01-25T15:30:00Z',
            updatedAt: '2024-01-25T15:30:00Z'
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 156,
          totalPages: 8,
          hasNext: true,
          hasPrev: false
        },
        summary: {
          totalAppointments: 156,
          confirmedAppointments: 142,
          pendingAppointments: 8,
          cancelledAppointments: 6,
          totalRevenue: {
            amount: 750000,
            currency: 'EUR'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'validation.appointment.date_range_invalid',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to view appointments',
    schema: {
      example: {
        statusCode: 403,
        message: 'errors.appointment.access_denied',
        error: 'Forbidden'
      }
    }
  })
  async getAppointmentList(@Query() query: AppointmentListQueryDto): Promise<PaginatedAppointmentResponseDto> {
    // TODO: Implement with actual use case
    // return this.listAppointmentsUseCase.execute(query);
    
    // Mock response for development
    return {
      data: [
        {
          id: 'appointment-uuid-123',
          businessId: query.businessId || 'business-uuid-456',
          calendarId: query.calendarId || 'calendar-uuid-789',
          serviceId: query.serviceId || 'service-uuid-101',
          staffId: query.staffId || 'staff-uuid-202',
          clientId: query.clientId || 'client-uuid-303',
          startTime: new Date('2024-01-26T09:00:00Z'),
          endTime: new Date('2024-01-26T09:30:00Z'),
          status: AppointmentStatus.CONFIRMED,
          clientInfo: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.fr',
            phone: '+33 1 23 45 67 89'
          },
          price: {
            amount: 5000,
            currency: 'EUR'
          },
          notes: 'Initial consultation requested',
          sendReminders: true,
          recurrence: undefined,
          metadata: {
            source: 'online_booking',
            referralCode: 'FRIEND2024'
          },
          service: {
            id: 'service-uuid-101',
            name: 'Consultation Générale',
            category: 'CONSULTATION',
            duration: 30,
            price: { amount: 5000, currency: 'EUR' }
          },
          staff: {
            id: 'staff-uuid-202',
            firstName: 'Dr. Marie',
            lastName: 'Dupont',
            displayName: 'Dr. Marie Dupont',
            role: 'PRACTITIONER'
          },
          calendar: {
            id: 'calendar-uuid-789',
            name: 'Cabinet Principal',
            type: 'STAFF',
            color: '#4CAF50'
          },
          createdAt: new Date('2024-01-25T15:30:00Z'),
          updatedAt: new Date('2024-01-25T15:30:00Z'),
          createdBy: 'staff-uuid-202'
        }
      ],
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      summary: {
        totalAppointments: 1,
        confirmedAppointments: 1,
        pendingAppointments: 0,
        cancelledAppointments: 0,
        totalRevenue: {
          amount: 5000,
          currency: 'EUR'
        }
      }
    };
  }

  /**
   * 📅 Get Individual Appointment Details
   * 
   * Retrieves complete appointment information including client details,
   * service information, staff assignments, and audit history.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment by ID',
    description: `
      Retrieve detailed information for a specific appointment.
      
      **Includes:**
      - Complete appointment details with timestamps
      - Client information and contact details
      - Service details with pricing and duration
      - Staff member assignment and qualifications
      - Calendar context and booking rules
      - Payment status and transaction history
      - Audit trail and modification history
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
    example: 'appointment-uuid-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment details retrieved successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'errors.appointment.not_found',
        error: 'Not Found'
      }
    }
  })
  async getAppointmentById(@Param('id', ParseUUIDPipe) id: string): Promise<AppointmentResponseDto> {
    // TODO: Implement with actual use case
    // return this.getAppointmentUseCase.execute({ appointmentId: id });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      calendarId: 'calendar-uuid-789',
      serviceId: 'service-uuid-101',
      staffId: 'staff-uuid-202',
      clientId: 'client-uuid-303',
      startTime: new Date('2024-01-26T09:00:00Z'),
      endTime: new Date('2024-01-26T09:30:00Z'),
      status: AppointmentStatus.CONFIRMED,
      clientInfo: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.fr',
        phone: '+33 1 23 45 67 89',
        dateOfBirth: '1985-03-15',
        notes: 'First-time patient, allergic to latex'
      },
      price: {
        amount: 5000,
        currency: 'EUR'
      },
      notes: 'Initial consultation requested. Patient has concerns about dental health.',
      sendReminders: true,
      recurrence: undefined,
      metadata: {
        source: 'online_booking',
        referralCode: 'FRIEND2024',
        specialRequests: ['wheelchair_access']
      },
      service: {
        id: 'service-uuid-101',
        name: 'Consultation Dentaire Générale',
        category: 'CONSULTATION',
        duration: 30,
        price: { amount: 5000, currency: 'EUR' }
      },
      staff: {
        id: 'staff-uuid-202',
        firstName: 'Dr. Marie',
        lastName: 'Dupont',
        displayName: 'Dr. Marie Dupont',
        role: 'PRACTITIONER'
      },
      calendar: {
        id: 'calendar-uuid-789',
        name: 'Cabinet Principal - Dr. Marie Dupont',
        type: 'STAFF',
        color: '#4CAF50'
      },
      createdAt: new Date('2024-01-25T15:30:00Z'),
      updatedAt: new Date('2024-01-25T15:30:00Z'),
      createdBy: 'staff-uuid-202'
    };
  }

  /**
   * ➕ Book New Appointment
   * 
   * Creates new appointments with intelligent validation and conflict detection.
   * Supports both single appointments and recurring appointment series.
   */
  @Post()
  @ApiOperation({
    summary: 'Book new appointment',
    description: `
      Book a new appointment with comprehensive validation and conflict prevention.
      
      **Intelligent Booking Process:**
      1. Real-time availability verification across calendars
      2. Service duration and calendar compatibility checking
      3. Staff qualification and availability validation
      4. Client information verification and deduplication
      5. Pricing calculation with business rules application
      6. Automatic reminder scheduling and notification setup
      7. Recurring appointment series creation (if specified)
      
      **Business Rules Enforcement:**
      - Minimum advance booking time validation
      - Maximum booking window enforcement
      - Buffer time between appointments
      - Calendar working hours compliance
      - Service-staff compatibility verification
      - Business capacity and resource limits
      
      **Advanced Features:**
      - Smart staff assignment based on availability and qualifications
      - Automatic conflict resolution with alternative suggestions
      - Multi-language client communication setup
      - Integration with payment processing systems
      - Comprehensive audit logging for compliance
    `
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment booked successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid appointment data or booking constraints',
    schema: {
      example: {
        statusCode: 400,
        message: ['validation.appointment.start_time_past', 'validation.client.email_invalid'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Time slot not available or calendar conflict',
    schema: {
      example: {
        statusCode: 409,
        message: 'errors.appointment.time_slot_unavailable',
        error: 'Conflict',
        details: {
          conflictingAppointment: 'appointment-uuid-456',
          alternativeSlots: [
            { startTime: '2024-01-26T09:30:00Z', endTime: '2024-01-26T10:00:00Z' },
            { startTime: '2024-01-26T10:30:00Z', endTime: '2024-01-26T11:00:00Z' }
          ]
        }
      }
    }
  })
  async bookAppointment(@Body() createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    // TODO: Implement with actual use case
    // return this.createAppointmentUseCase.execute(createAppointmentDto);
    
    // Mock response
    return {
      id: 'appointment-uuid-new-123',
      businessId: createAppointmentDto.businessId,
      calendarId: createAppointmentDto.calendarId,
      serviceId: createAppointmentDto.serviceId,
      staffId: createAppointmentDto.staffId,
      clientId: createAppointmentDto.clientId,
      startTime: new Date(createAppointmentDto.startTime),
      endTime: new Date(createAppointmentDto.endTime),
      status: createAppointmentDto.requiresConfirmation ? AppointmentStatus.PENDING : AppointmentStatus.CONFIRMED,
      clientInfo: createAppointmentDto.clientInfo || {
        firstName: 'New',
        lastName: 'Client',
        email: 'newclient@email.com'
      },
      price: createAppointmentDto.price,
      notes: createAppointmentDto.notes,
      sendReminders: createAppointmentDto.sendReminders || true,
      recurrence: createAppointmentDto.recurrence ? {
        ...createAppointmentDto.recurrence,
        endDate: createAppointmentDto.recurrence.endDate ? new Date(createAppointmentDto.recurrence.endDate) : undefined
      } : undefined,
      metadata: createAppointmentDto.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * ✏️ Update Appointment Details
   * 
   * Updates appointment information with validation and conflict checking.
   * Maintains appointment integrity and client communication.
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update appointment details',
    description: `
      Update appointment information with comprehensive validation and impact analysis.
      
      **Updatable Fields:**
      - Appointment timing (start/end times) with availability checking
      - Service assignment with pricing recalculation
      - Staff assignment with qualification validation
      - Client information and contact details
      - Appointment notes and special instructions
      - Reminder and notification preferences
      
      **Smart Conflict Resolution:**
      - Automatic availability checking for time changes
      - Impact analysis on related recurring appointments
      - Alternative slot suggestions for conflicts
      - Client notification management for changes
      - Staff workload rebalancing considerations
      
      **Business Rules:**
      - Changes must comply with business booking policies
      - Time modifications require advance notice compliance
      - Service changes may affect pricing and duration
      - Staff changes require qualification compatibility
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID to update',
    example: 'appointment-uuid-123'
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Update conflicts with existing appointments or policies',
    schema: {
      example: {
        statusCode: 409,
        message: 'errors.appointment.update_conflicts',
        error: 'Conflict',
        details: {
          reason: 'time_slot_unavailable',
          conflictingAppointment: 'appointment-uuid-456'
        }
      }
    }
  })
  async updateAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    // TODO: Implement with actual use case
    // return this.updateAppointmentUseCase.execute({ appointmentId: id, ...updateAppointmentDto });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      calendarId: updateAppointmentDto.calendarId || 'calendar-uuid-789',
      serviceId: updateAppointmentDto.serviceId || 'service-uuid-101',
      staffId: updateAppointmentDto.staffId || 'staff-uuid-202',
      clientId: 'client-uuid-303',
      startTime: updateAppointmentDto.startTime ? new Date(updateAppointmentDto.startTime) : new Date('2024-01-26T09:00:00Z'),
      endTime: updateAppointmentDto.endTime ? new Date(updateAppointmentDto.endTime) : new Date('2024-01-26T09:30:00Z'),
      status: updateAppointmentDto.status || AppointmentStatus.CONFIRMED,
      clientInfo: updateAppointmentDto.clientInfo || {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.fr'
      },
      price: updateAppointmentDto.price,
      notes: updateAppointmentDto.notes || 'Updated appointment',
      sendReminders: updateAppointmentDto.sendReminders !== undefined ? updateAppointmentDto.sendReminders : true,
      metadata: updateAppointmentDto.metadata || {},
      createdAt: new Date('2024-01-25T15:30:00Z'),
      updatedAt: new Date()
    };
  }

  /**
   * 📝 Update Appointment Status
   * 
   * Updates appointment status with proper validation and workflow management.
   * Supports status transitions with business rule enforcement.
   */
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update appointment status',
    description: `
      Update appointment status with proper workflow validation and business rule enforcement.
      
      **Supported Status Transitions:**
      - PENDING → CONFIRMED (staff/system confirmation)
      - PENDING → CANCELLED (client/staff cancellation)
      - CONFIRMED → IN_PROGRESS (appointment start)
      - CONFIRMED → CANCELLED (cancellation with notice)
      - CONFIRMED → RESCHEDULED (time change request)
      - IN_PROGRESS → COMPLETED (successful completion)
      - IN_PROGRESS → NO_SHOW (client absence)
      
      **Business Rule Enforcement:**
      - Status transitions must follow logical workflow
      - Cancellation policies and timing restrictions
      - No-show handling with automatic status updates
      - Completion triggers for billing and follow-up
      - Audit logging for all status changes
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID',
    example: 'appointment-uuid-123'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { enum: Object.values(AppointmentStatus) },
        notes: { type: 'string', maxLength: 500 }
      },
      required: ['status']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment status updated successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
    schema: {
      example: {
        statusCode: 400,
        message: 'errors.appointment.invalid_status_transition',
        error: 'Bad Request',
        details: {
          currentStatus: 'COMPLETED',
          requestedStatus: 'PENDING',
          allowedTransitions: []
        }
      }
    }
  })
  async updateAppointmentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: AppointmentStatus; notes?: string }
  ): Promise<AppointmentResponseDto> {
    // TODO: Implement with actual use case
    // return this.updateAppointmentStatusUseCase.execute({ 
    //   appointmentId: id, 
    //   status: body.status, 
    //   notes: body.notes 
    // });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      calendarId: 'calendar-uuid-789',
      serviceId: 'service-uuid-101',
      staffId: 'staff-uuid-202',
      clientId: 'client-uuid-303',
      startTime: new Date('2024-01-26T09:00:00Z'),
      endTime: new Date('2024-01-26T09:30:00Z'),
      status: body.status,
      clientInfo: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.fr'
      },
      notes: body.notes || 'Status updated',
      sendReminders: true,
      metadata: {},
      createdAt: new Date('2024-01-25T15:30:00Z'),
      updatedAt: new Date()
    };
  }

  /**
   * 🗑️ Cancel Appointment
   * 
   * Cancels appointments with proper policy enforcement and client communication.
   * Handles cancellation fees and rescheduling options.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel appointment',
    description: `
      Cancel an appointment with proper policy enforcement and impact management.
      
      **Cancellation Process:**
      1. Validates cancellation policy compliance (timing, notice period)
      2. Calculates cancellation fees based on business rules
      3. Updates calendar availability for the freed time slot
      4. Sends appropriate notifications to client and staff
      5. Handles recurring appointment series if applicable
      6. Maintains audit trail for compliance and analysis
      
      **Business Policy Enforcement:**
      - Minimum cancellation notice requirements
      - Cancellation fee calculation and application
      - Late cancellation vs. no-show differentiation
      - Refund processing and payment adjustments
      - Waitlist notification for freed slots
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment UUID to cancel',
    example: 'appointment-uuid-123'
  })
  @ApiQuery({
    name: 'reason',
    description: 'Cancellation reason',
    required: false,
    example: 'client_request'
  })
  @ApiQuery({
    name: 'notifyClient',
    description: 'Whether to notify the client',
    required: false,
    type: 'boolean',
    example: true
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment cancelled successfully',
    schema: {
      example: {
        message: 'success.appointment.cancelled',
        appointmentId: 'appointment-uuid-123',
        cancelledAt: '2024-01-25T16:00:00Z',
        cancellationFee: {
          amount: 1000,
          currency: 'EUR'
        },
        refundAmount: {
          amount: 4000,
          currency: 'EUR'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel appointment due to policy restrictions',
    schema: {
      example: {
        statusCode: 400,
        message: 'errors.appointment.cancellation_too_late',
        error: 'Bad Request',
        details: {
          minimumNoticeHours: 24,
          hoursUntilAppointment: 2,
          cancellationFee: {
            amount: 2500,
            currency: 'EUR'
          }
        }
      }
    }
  })
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
    @Query('notifyClient') notifyClient: boolean = true
  ): Promise<{ message: string; appointmentId: string; cancelledAt: Date; cancellationFee?: any; refundAmount?: any }> {
    // TODO: Implement with actual use case
    // return this.cancelAppointmentUseCase.execute({ 
    //   appointmentId: id, 
    //   reason, 
    //   notifyClient 
    // });
    
    // Mock response
    return {
      message: 'success.appointment.cancelled',
      appointmentId: id,
      cancelledAt: new Date(),
      cancellationFee: {
        amount: 1000,
        currency: 'EUR'
      },
      refundAmount: {
        amount: 4000,
        currency: 'EUR'
      }
    };
  }

  /**
   * 🔍 Check Appointment Availability
   * 
   * Intelligent availability checking across calendars with smart suggestions.
   * Optimized for real-time booking interfaces and capacity planning.
   */
  @Post('availability')
  @ApiOperation({
    summary: 'Check appointment availability',
    description: `
      Check availability for appointment booking with intelligent slot suggestions.
      
      **Smart Availability Features:**
      - Real-time calendar aggregation across multiple staff members
      - Service duration matching with buffer time consideration
      - Staff qualification and specialty filtering
      - Business hour and policy compliance checking
      - Intelligent slot optimization and suggestions
      - Load balancing across available resources
      
      **Performance Optimizations:**
      - Cached availability data for popular time ranges
      - Batch processing for multi-day availability checks
      - Optimized database queries with proper indexing
      - Smart filtering to reduce unnecessary calculations
      
      **Business Intelligence:**
      - Capacity utilization analytics
      - Peak time identification and recommendations
      - Staff workload distribution insights
      - Revenue optimization suggestions
    `
  })
  @ApiBody({ type: AppointmentAvailabilityDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability data retrieved successfully',
    schema: {
      example: {
        businessId: 'business-uuid-123',
        serviceId: 'service-uuid-456',
        availableSlots: [
          {
            calendarId: 'calendar-uuid-789',
            staffId: 'staff-uuid-101',
            startTime: '2024-01-26T09:00:00Z',
            endTime: '2024-01-26T09:30:00Z',
            available: true,
            staff: {
              name: 'Dr. Marie Dupont',
              specialties: ['DENTAL_SURGERY'],
              rating: 4.8
            }
          },
          {
            calendarId: 'calendar-uuid-790',
            staffId: 'staff-uuid-102',
            startTime: '2024-01-26T10:00:00Z',
            endTime: '2024-01-26T10:30:00Z',
            available: true,
            staff: {
              name: 'Dr. Jean Martin',
              specialties: ['ORTHODONTICS'],
              rating: 4.9
            }
          }
        ],
        totalSlots: 2,
        recommendations: {
          bestTime: '2024-01-26T09:00:00Z',
          leastBusyPeriod: 'morning',
          alternativeDates: ['2024-01-27', '2024-01-28']
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid availability request parameters'
  })
  async checkAvailability(@Body() availabilityDto: AppointmentAvailabilityDto): Promise<any> {
    // TODO: Implement with actual availability use case
    // return this.checkAvailabilityUseCase.execute(availabilityDto);
    
    // Mock response with realistic availability data
    return {
      businessId: availabilityDto.businessId,
      serviceId: availabilityDto.serviceId,
      availableSlots: [
        {
          calendarId: 'calendar-uuid-789',
          staffId: availabilityDto.staffId || 'staff-uuid-101',
          startTime: '2024-01-26T09:00:00Z',
          endTime: '2024-01-26T09:30:00Z',
          available: true,
          staff: {
            name: 'Dr. Marie Dupont',
            specialties: ['DENTAL_SURGERY'],
            rating: 4.8
          }
        },
        {
          calendarId: 'calendar-uuid-790',
          staffId: 'staff-uuid-102',
          startTime: '2024-01-26T10:00:00Z',
          endTime: '2024-01-26T10:30:00Z',
          available: true,
          staff: {
            name: 'Dr. Jean Martin',
            specialties: ['ORTHODONTICS'],
            rating: 4.9
          }
        },
        {
          calendarId: 'calendar-uuid-789',
          staffId: availabilityDto.staffId || 'staff-uuid-101',
          startTime: '2024-01-26T14:00:00Z',
          endTime: '2024-01-26T14:30:00Z',
          available: true,
          staff: {
            name: 'Dr. Marie Dupont',
            specialties: ['DENTAL_SURGERY'],
            rating: 4.8
          }
        }
      ],
      totalSlots: 3,
      recommendations: {
        bestTime: '2024-01-26T09:00:00Z',
        leastBusyPeriod: 'morning',
        alternativeDates: ['2024-01-27', '2024-01-28']
      }
    };
  }
}
