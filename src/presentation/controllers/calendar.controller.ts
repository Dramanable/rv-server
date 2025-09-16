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
  CreateCalendarDto,
  UpdateCalendarDto,
  CalendarResponseDto,
  CalendarListQueryDto,
  PaginatedCalendarResponseDto,
  CalendarAvailabilityQueryDto,
  CalendarAvailabilityResponseDto,
} from '../dtos/calendar/calendar.dto';

/**
 * 📅 Calendar Management Controller
 * 
 * Manages calendar systems for businesses and staff including:
 * - Calendar CRUD operations with multi-location support
 * - Working hours configuration and recurrence patterns
 * - Availability checking with smart slot calculation
 * - Booking rules and constraints management
 * - Address-linked calendar management
 * - Real-time availability updates
 * 
 * This controller is architected for complex appointment systems:
 * - Multi-tenant calendar isolation
 * - Staff-specific and business-wide calendars
 * - Location-based calendar distribution
 * - Time zone aware operations
 * - Conflict detection and resolution
 * - Performance optimized availability queries
 * 
 * Frontend Integration Examples:
 * ```typescript
 * // Calendar management service
 * class CalendarService {
 *   async getBusinessCalendars(businessId: string) {
 *     const response = await api.get(`/calendars?businessId=${businessId}`);
 *     return response.data; // PaginatedCalendarResponseDto
 *   }
 *   
 *   async createStaffCalendar(calendarData: CreateCalendarDto) {
 *     const response = await api.post('/calendars', calendarData);
 *     return response.data; // CalendarResponseDto
 *   }
 *   
 *   async checkAvailability(calendarId: string, date: string) {
 *     const params = {
 *       startDate: `${date}T00:00:00Z`,
 *       endDate: `${date}T23:59:59Z`,
 *       durationMinutes: 30
 *     };
 *     
 *     const response = await api.get(`/calendars/${calendarId}/availability`, { params });
 *     return response.data; // CalendarAvailabilityResponseDto
 *   }
 *   
 *   async updateWorkingHours(calendarId: string, workingHours: WorkingHoursDto) {
 *     const response = await api.put(`/calendars/${calendarId}`, { workingHours });
 *     return response.data;
 *   }
 * }
 * 
 * // Booking widget integration
 * const AvailabilityWidget = ({ staffId, serviceId }) => {
 *   const [availability, setAvailability] = useState([]);
 *   
 *   useEffect(() => {
 *     const fetchAvailability = async () => {
 *       const calendars = await calendarService.getStaffCalendars(staffId);
 *       const slots = await Promise.all(
 *         calendars.data.map(calendar => 
 *           calendarService.checkAvailability(calendar.id, selectedDate)
 *         )
 *       );
 *       setAvailability(slots.flat());
 *     };
 *     
 *     fetchAvailability();
 *   }, [staffId, selectedDate]);
 *   
 *   return (
 *     <div className="availability-grid">
 *       {availability.map(slot => (
 *         <TimeSlot 
 *           key={`${slot.start}-${slot.end}`}
 *           start={slot.start}
 *           end={slot.end}
 *           available={slot.available}
 *           onSelect={() => handleSlotSelection(slot)}
 *         />
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
@ApiTags('Calendar Management')
@Controller('calendars')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when authentication is implemented
export class CalendarController {
  // Inject use cases and services here when implementing
  // constructor(
  //   private readonly createCalendarUseCase: CreateCalendarUseCase,
  //   private readonly updateCalendarUseCase: UpdateCalendarUseCase,
  //   private readonly deleteCalendarUseCase: DeleteCalendarUseCase,
  //   private readonly getCalendarUseCase: GetCalendarUseCase,
  //   private readonly listCalendarsUseCase: ListCalendarsUseCase,
  //   private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  //   private readonly calendarAnalyticsUseCase: CalendarAnalyticsUseCase,
  //   private readonly logger: Logger,
  //   private readonly i18n: I18nService
  // ) {}

  /**
   * 📋 Get Calendar List with Advanced Filtering
   * 
   * Retrieves calendars with multi-dimensional filtering for complex appointment systems.
   * Supports business-wide view, staff-specific calendars, and location-based filtering.
   * 
   * Use Cases:
   * - Display all calendars in business admin dashboard
   * - Show staff member's personal calendars
   * - Filter calendars by business location/address
   * - Generate calendar management reports
   * - Build calendar selection interfaces for booking
   * 
   * Frontend Usage:
   * ```typescript
   * // Get all calendars for a business location
   * const locationCalendars = await calendarService.getCalendars({
   *   businessId: 'business-uuid',
   *   addressId: 'address-uuid',
   *   isActive: true,
   *   type: CalendarType.STAFF
   * });
   * 
   * // Get calendars for appointment booking interface
   * const availableCalendars = await calendarService.getCalendars({
   *   businessId: 'business-uuid',
   *   isActive: true,
   *   includeAvailability: true
   * });
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get calendar list with filtering',
    description: `
      Retrieve calendars with comprehensive filtering for appointment management systems.
      
      **Key Features:**
      - Multi-tenant business isolation with security checks
      - Staff-specific and business-wide calendar filtering
      - Location/address-based calendar grouping
      - Calendar type filtering (staff, resource, business)
      - Real-time active status filtering
      - Search across calendar names and descriptions
      
      **Performance Optimizations:**
      - Indexed queries for common filter combinations
      - Lazy loading of related staff and address data
      - Caching for frequently accessed calendar lists
      - Pagination to handle large calendar sets
      
      **Business Logic:**
      - Respects user permissions (staff see own + authorized calendars)
      - Includes calendar utilization metrics
      - Shows upcoming appointment counts
      - Indicates calendar conflicts and overlaps
      
      **Error Scenarios:**
      - 403: User lacks permission to view calendars in specified business
      - 400: Invalid filter parameters or date ranges
      - 404: Specified business or address not found
    `
  })
  @ApiQuery({ type: CalendarListQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar list retrieved successfully',
    type: PaginatedCalendarResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 'calendar-uuid-123',
            businessId: 'business-uuid-456',
            staffId: 'staff-uuid-789',
            addressId: 'address-uuid-101',
            name: 'Dr. Marie Dupont - Cabinet Principal',
            description: 'Consultations dentaires et chirurgie',
            type: 'STAFF',
            workingHours: {
              monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00' }] },
              tuesday: { start: '08:00', end: '18:00' }
            },
            bookingRules: {
              minAdvanceHours: 2,
              maxAdvanceDays: 60,
              bufferMinutes: 15,
              allowSameDayCancellation: false,
              requireConfirmation: true
            },
            settings: {
              timezone: 'Europe/Paris',
              defaultServiceDuration: 30,
              autoConfirm: false
            },
            color: '#4CAF50',
            isActive: true,
            staff: {
              id: 'staff-uuid-789',
              firstName: 'Marie',
              lastName: 'Dupont',
              displayName: 'Dr. Marie Dupont',
              role: 'PRACTITIONER'
            },
            address: {
              id: 'address-uuid-101',
              name: 'Cabinet Principal',
              street: '123 Rue de la Santé',
              city: 'Paris',
              postalCode: '75013',
              country: 'France'
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z'
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 8,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
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
        message: 'validation.calendar.business_id_invalid',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to view calendars',
    schema: {
      example: {
        statusCode: 403,
        message: 'errors.calendar.access_denied',
        error: 'Forbidden'
      }
    }
  })
  async getCalendarList(@Query() query: CalendarListQueryDto): Promise<PaginatedCalendarResponseDto> {
    // TODO: Implement with actual use case
    // return this.listCalendarsUseCase.execute(query);
    
    // Mock response for development
    return {
      data: [
        {
          id: 'calendar-uuid-123',
          businessId: query.businessId || 'business-uuid-456',
          staffId: query.staffId || 'staff-uuid-789',
          addressId: query.addressId || 'address-uuid-101',
          name: 'Dr. Marie Dupont - Cabinet Principal',
          description: 'Consultations dentaires et chirurgie',
          type: 'STAFF' as any,
          workingHours: {
            monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] },
            tuesday: { start: '08:00', end: '18:00' }
          },
          bookingRules: {
            minAdvanceHours: 2,
            maxAdvanceDays: 60,
            bufferMinutes: 15,
            allowSameDayCancellation: false,
            requireConfirmation: true,
            allowOnlineBooking: true
          },
          settings: {
            timezone: 'Europe/Paris',
            defaultServiceDuration: 30,
            autoConfirm: false
          },
          color: '#4CAF50',
          isActive: true,
          staff: {
            id: 'staff-uuid-789',
            firstName: 'Marie',
            lastName: 'Dupont',
            displayName: 'Dr. Marie Dupont',
            role: 'PRACTITIONER'
          },
          address: {
            id: 'address-uuid-101',
            name: 'Cabinet Principal',
            street: '123 Rue de la Santé',
            city: 'Paris',
            postalCode: '75013',
            country: 'France'
          },
          createdAt: new Date('2024-01-15T10:00:00Z'),
          updatedAt: new Date('2024-01-20T14:30:00Z')
        }
      ],
      meta: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  /**
   * 📅 Get Individual Calendar Details
   * 
   * Retrieves complete calendar information including working hours,
   * booking rules, staff details, and location information.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get calendar by ID',
    description: `
      Retrieve detailed information for a specific calendar.
      
      **Includes:**
      - Complete calendar configuration
      - Working hours with break periods
      - Booking rules and constraints
      - Staff member information (if staff calendar)
      - Address/location details
      - Recent appointment statistics
      - Availability summary for current week
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar UUID',
    example: 'calendar-uuid-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar details retrieved successfully',
    type: CalendarResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Calendar not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'errors.calendar.not_found',
        error: 'Not Found'
      }
    }
  })
  async getCalendarById(@Param('id', ParseUUIDPipe) id: string): Promise<CalendarResponseDto> {
    // TODO: Implement with actual use case
    // return this.getCalendarUseCase.execute({ calendarId: id });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      staffId: 'staff-uuid-789',
      addressId: 'address-uuid-101',
      name: 'Dr. Marie Dupont - Cabinet Principal',
      description: 'Consultations dentaires et chirurgie orthodontique',
      type: 'STAFF' as any,
      workingHours: {
        monday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] },
        tuesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] },
        wednesday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] },
        thursday: { start: '08:00', end: '18:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] },
        friday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '14:00', title: 'Déjeuner' }] }
      },
      bookingRules: {
        minAdvanceHours: 2,
        maxAdvanceDays: 60,
        bufferMinutes: 15,
        allowSameDayCancellation: false,
        requireConfirmation: true,
        allowOnlineBooking: true
      },
      settings: {
        timezone: 'Europe/Paris',
        defaultServiceDuration: 30,
        autoConfirm: false,
        reminderEnabled: true,
        reminderHours: 24
      },
      color: '#4CAF50',
      isActive: true,
      staff: {
        id: 'staff-uuid-789',
        firstName: 'Marie',
        lastName: 'Dupont',
        displayName: 'Dr. Marie Dupont',
        role: 'PRACTITIONER'
      },
      address: {
        id: 'address-uuid-101',
        name: 'Cabinet Principal',
        street: '123 Rue de la Santé',
        city: 'Paris',
        postalCode: '75013',
        country: 'France'
      },
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-20T14:30:00Z')
    };
  }

  /**
   * ➕ Create New Calendar
   * 
   * Creates a calendar for staff members or business resources with
   * comprehensive configuration and validation.
   */
  @Post()
  @ApiOperation({
    summary: 'Create new calendar',
    description: `
      Create a new calendar with comprehensive configuration for appointment booking.
      
      **Process:**
      1. Validates business and staff permissions
      2. Checks address association and availability
      3. Validates working hours format and logic
      4. Sets up default booking rules based on business type
      5. Creates calendar with proper timezone configuration
      6. Initializes availability cache for performance
      
      **Business Rules:**
      - Each staff member can have multiple calendars (different locations)
      - Calendar must be linked to a valid business address
      - Working hours cannot exceed 24 hours per day
      - Buffer time must be reasonable (0-120 minutes)
      - Calendar name must be unique within business
      
      **Address Integration:**
      - Each calendar MUST be associated with a business address
      - Supports multi-location businesses with distributed staff
      - Enables location-based appointment filtering
      - Facilitates resource allocation and capacity planning
    `
  })
  @ApiBody({ type: CreateCalendarDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Calendar created successfully',
    type: CalendarResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid calendar data or business constraints',
    schema: {
      example: {
        statusCode: 400,
        message: ['validation.calendar.name_length', 'validation.calendar.working_hours_invalid'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Calendar name already exists in business',
    schema: {
      example: {
        statusCode: 409,
        message: 'errors.calendar.name_exists',
        error: 'Conflict'
      }
    }
  })
  async createCalendar(@Body() createCalendarDto: CreateCalendarDto): Promise<CalendarResponseDto> {
    // TODO: Implement with actual use case
    // return this.createCalendarUseCase.execute(createCalendarDto);
    
    // Mock response
    return {
      id: 'calendar-uuid-new-123',
      businessId: createCalendarDto.businessId,
      staffId: createCalendarDto.staffId,
      addressId: createCalendarDto.addressId,
      name: createCalendarDto.name,
      description: createCalendarDto.description,
      type: createCalendarDto.type,
      workingHours: createCalendarDto.workingHours,
      bookingRules: createCalendarDto.bookingRules || {
        minAdvanceHours: 2,
        maxAdvanceDays: 30,
        bufferMinutes: 15,
        allowSameDayCancellation: true,
        requireConfirmation: false,
        allowOnlineBooking: true
      },
      settings: createCalendarDto.settings || {
        timezone: 'Europe/Paris',
        defaultServiceDuration: 30,
        autoConfirm: false
      },
      color: createCalendarDto.color || '#4CAF50',
      isActive: createCalendarDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * ✏️ Update Calendar Configuration
   * 
   * Updates calendar settings with validation and conflict checking.
   * Maintains appointment integrity during configuration changes.
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update calendar configuration',
    description: `
      Update calendar configuration with comprehensive validation and conflict prevention.
      
      **Updatable Configuration:**
      - Calendar name and description
      - Working hours and break periods
      - Booking rules and constraints
      - Color scheme and display settings
      - Timezone and locale preferences
      - Active status management
      
      **Smart Conflict Resolution:**
      - Checks impact on existing appointments when changing working hours
      - Validates new booking rules against scheduled appointments
      - Prevents changes that would invalidate future bookings
      - Offers suggestions for resolving calendar conflicts
      
      **Business Rules:**
      - Working hour changes cannot conflict with existing appointments
      - Booking rule changes apply only to future appointments
      - Name changes require uniqueness validation within business
      - Deactivation prevents new bookings but preserves existing ones
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar UUID to update',
    example: 'calendar-uuid-123'
  })
  @ApiBody({ type: UpdateCalendarDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar updated successfully',
    type: CalendarResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Calendar not found'
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Update conflicts with existing appointments',
    schema: {
      example: {
        statusCode: 409,
        message: 'errors.calendar.update_conflicts_appointments',
        error: 'Conflict',
        details: {
          conflictingAppointments: 3,
          suggestedResolution: 'Move appointments or adjust working hours'
        }
      }
    }
  })
  async updateCalendar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCalendarDto: UpdateCalendarDto
  ): Promise<CalendarResponseDto> {
    // TODO: Implement with actual use case
    // return this.updateCalendarUseCase.execute({ calendarId: id, ...updateCalendarDto });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      staffId: 'staff-uuid-789',
      addressId: 'address-uuid-101',
      name: updateCalendarDto.name || 'Dr. Marie Dupont - Cabinet Principal',
      description: updateCalendarDto.description || 'Consultations dentaires et chirurgie',
      type: updateCalendarDto.type || ('STAFF' as any),
      workingHours: updateCalendarDto.workingHours || {},
      bookingRules: updateCalendarDto.bookingRules || {},
      settings: updateCalendarDto.settings || {},
      color: updateCalendarDto.color || '#4CAF50',
      isActive: updateCalendarDto.isActive !== undefined ? updateCalendarDto.isActive : true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date()
    };
  }

  /**
   * 🗑️ Deactivate Calendar
   * 
   * Safely deactivates calendar while preserving appointment history
   * and handling active appointments gracefully.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Deactivate calendar',
    description: `
      Safely deactivate a calendar while preserving appointment data and handling transitions.
      
      **Process:**
      1. Validates user permissions for calendar management
      2. Checks for future appointments (prevents deactivation if any exist)
      3. Offers appointment transfer options to other calendars
      4. Soft deletes calendar record (sets isActive = false)
      5. Maintains all historical appointment data
      6. Sends notifications to affected clients and staff
      
      **Data Preservation:**
      - All appointment history remains intact
      - Financial records stay linked and accessible
      - Audit logs preserve calendar configuration history
      - Can be reactivated with previous settings restored
      
      **Appointment Handling:**
      - Prevents deletion if future appointments exist
      - Provides transfer options to other staff calendars
      - Enables graceful client notification and rebooking
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar UUID to deactivate',
    example: 'calendar-uuid-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar deactivated successfully',
    schema: {
      example: {
        message: 'success.calendar.deactivated',
        calendarId: 'calendar-uuid-123',
        deactivatedAt: '2024-01-25T15:30:00Z',
        transferredAppointments: 0
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot deactivate calendar with future appointments',
    schema: {
      example: {
        statusCode: 400,
        message: 'errors.calendar.has_future_appointments',
        error: 'Bad Request',
        details: {
          futureAppointments: 12,
          nextAppointment: '2024-01-26T09:00:00Z',
          transferOptions: ['calendar-uuid-456', 'calendar-uuid-789']
        }
      }
    }
  })
  async deactivateCalendar(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string; calendarId: string; deactivatedAt: Date }> {
    // TODO: Implement with actual use case
    // return this.deleteCalendarUseCase.execute({ calendarId: id });
    
    // Mock response
    return {
      message: 'success.calendar.deactivated',
      calendarId: id,
      deactivatedAt: new Date()
    };
  }

  /**
   * 🔍 Check Calendar Availability
   * 
   * Intelligent availability checking with smart slot calculation,
   * buffer time consideration, and conflict detection.
   */
  @Get(':id/availability')
  @ApiOperation({
    summary: 'Check calendar availability',
    description: `
      Check calendar availability with intelligent slot calculation and conflict detection.
      
      **Smart Features:**
      - Real-time availability calculation based on current appointments
      - Buffer time consideration between appointments
      - Service duration matching for optimal slot suggestions
      - Break period detection and exclusion
      - Recurring appointment pattern recognition
      
      **Performance Optimizations:**
      - Cached availability data for frequently requested periods
      - Batch processing for multi-day availability checks
      - Optimized database queries with proper indexing
      - Lazy loading for extended date ranges
      
      **Business Logic:**
      - Respects working hours and break periods
      - Considers minimum advance booking time
      - Excludes past time slots automatically
      - Handles timezone conversions correctly
      - Integrates with holiday and leave management
      
      **Use Cases:**
      - Real-time booking widget availability display
      - Appointment scheduling interface
      - Staff workload planning and optimization
      - Business capacity analytics
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Calendar UUID',
    example: 'calendar-uuid-123'
  })
  @ApiQuery({ type: CalendarAvailabilityQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability data retrieved successfully',
    type: CalendarAvailabilityResponseDto,
    schema: {
      example: {
        calendarId: 'calendar-uuid-123',
        date: '2024-01-26',
        availableSlots: [
          { start: '09:00', end: '09:30', available: true, reason: 'Available for booking' },
          { start: '09:30', end: '10:00', available: true, reason: 'Available for booking' },
          { start: '10:00', end: '10:30', available: false, reason: 'Already booked' },
          { start: '10:30', end: '11:00', available: true, reason: 'Available for booking' },
          { start: '14:00', end: '14:30', available: true, reason: 'Available after break' }
        ],
        totalAvailableSlots: 12,
        workingHours: {
          start: '08:00',
          end: '18:00',
          breaks: [{ start: '12:00', end: '14:00', title: 'Lunch Break' }]
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date range or parameters',
    schema: {
      example: {
        statusCode: 400,
        message: 'validation.calendar.end_date_before_start',
        error: 'Bad Request'
      }
    }
  })
  async checkAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CalendarAvailabilityQueryDto
  ): Promise<CalendarAvailabilityResponseDto> {
    // TODO: Implement with actual availability use case
    // return this.checkAvailabilityUseCase.execute({ 
    //   calendarId: id, 
    //   ...query 
    // });
    
    // Mock response with realistic availability pattern
    const date = new Date(query.startDate).toISOString().split('T')[0];
    
    return {
      calendarId: id,
      date,
      availableSlots: [
        { start: '09:00', end: '09:30', available: true, reason: 'Available for booking' },
        { start: '09:30', end: '10:00', available: true, reason: 'Available for booking' },
        { start: '10:00', end: '10:30', available: false, reason: 'Already booked' },
        { start: '10:30', end: '11:00', available: true, reason: 'Available for booking' },
        { start: '11:00', end: '11:30', available: true, reason: 'Available for booking' },
        { start: '11:30', end: '12:00', available: false, reason: 'Already booked' },
        { start: '14:00', end: '14:30', available: true, reason: 'Available after break' },
        { start: '14:30', end: '15:00', available: true, reason: 'Available for booking' },
        { start: '15:00', end: '15:30', available: false, reason: 'Already booked' },
        { start: '15:30', end: '16:00', available: true, reason: 'Available for booking' },
        { start: '16:00', end: '16:30', available: true, reason: 'Available for booking' },
        { start: '16:30', end: '17:00', available: true, reason: 'Available for booking' }
      ],
      totalAvailableSlots: 8,
      workingHours: {
        start: '08:00',
        end: '18:00',
        breaks: [{ start: '12:00', end: '14:00', title: 'Lunch Break' }]
      }
    };
  }
}
