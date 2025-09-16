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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffResponseDto,
  StaffListQueryDto,
  PaginatedStaffResponseDto,
} from '../dtos/staff/staff.dto';

/**
 * 👥 Staff Management Controller
 * 
 * Manages staff members within businesses including:
 * - Staff CRUD operations
 * - Role management and permissions
 * - Working hours configuration
 * - Service specialties assignment
 * - Staff performance analytics
 * - Profile image management
 * 
 * This controller is designed with frontend developers in mind:
 * - Consistent response structures
 * - Comprehensive error handling with i18n
 * - Detailed request/response examples
 * - Performance optimized endpoints
 * - File upload support for staff profiles
 * 
 * Frontend Integration Examples:
 * ```typescript
 * // Staff management service
 * class StaffService {
 *   async getStaffList(businessId: string, filters: StaffFilters) {
 *     const params = new URLSearchParams({
 *       businessId,
 *       ...filters,
 *       page: filters.page?.toString() || '1',
 *       limit: filters.limit?.toString() || '20'
 *     });
 *     
 *     const response = await api.get(`/staff?${params}`);
 *     return response.data; // PaginatedStaffResponseDto
 *   }
 *   
 *   async createStaff(staffData: CreateStaffDto) {
 *     const response = await api.post('/staff', staffData);
 *     return response.data; // StaffResponseDto
 *   }
 *   
 *   async uploadStaffAvatar(staffId: string, file: File) {
 *     const formData = new FormData();
 *     formData.append('files', file);
 *     
 *     return api.post(`/staff/${staffId}/upload`, formData, {
 *       headers: { 'Content-Type': 'multipart/form-data' },
 *       onUploadProgress: (progress) => {
 *         console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
 *       }
 *     });
 *   }
 * }
 * ```
 */
@ApiTags('Staff Management')
@Controller('staff')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when authentication is implemented
export class StaffController {
  // Inject use cases and services here when implementing
  // constructor(
  //   private readonly createStaffUseCase: CreateStaffUseCase,
  //   private readonly updateStaffUseCase: UpdateStaffUseCase,
  //   private readonly deleteStaffUseCase: DeleteStaffUseCase,
  //   private readonly getStaffUseCase: GetStaffUseCase,
  //   private readonly listStaffUseCase: ListStaffUseCase,
  //   private readonly staffAnalyticsUseCase: StaffAnalyticsUseCase,
  //   private readonly fileUploadService: FileUploadService,
  //   private readonly logger: Logger,
  //   private readonly i18n: I18nService
  // ) {}

  /**
   * 📋 Get Staff List with Advanced Filtering
   * 
   * Retrieves a paginated list of staff members with comprehensive filtering options.
   * Supports search, role filtering, specialty filtering, and business context.
   * 
   * Use Cases:
   * - Display staff directory in admin dashboard
   * - Filter practitioners by specialty for appointment booking
   * - Search staff members by name or email
   * - Generate staff reports and analytics
   * 
   * Frontend Usage:
   * ```typescript
   * // Get all active practitioners in a business
   * const practitioners = await staffService.getStaffList({
   *   businessId: 'business-uuid',
   *   role: StaffRole.PRACTITIONER,
   *   isActive: true,
   *   page: 1,
   *   limit: 50
   * });
   * 
   * // Search staff members
   * const searchResults = await staffService.getStaffList({
   *   search: 'marie',
   *   businessId: 'business-uuid'
   * });
   * ```
   */
  @Get()
  @ApiOperation({
    summary: 'Get staff list with filtering',
    description: `
      Retrieve a paginated list of staff members with advanced filtering capabilities.
      
      **Key Features:**
      - Multi-criteria filtering (role, specialty, active status)
      - Full-text search across names and emails
      - Pagination with configurable page size
      - Sorting by various fields (name, role, creation date)
      - Business context isolation for multi-tenant safety
      
      **Performance Notes:**
      - Results are cached for 5 minutes to improve response time
      - Maximum 100 items per page to prevent performance issues
      - Database indexes optimize common filter combinations
      
      **Error Handling:**
      - Returns 400 for invalid filter parameters
      - Returns 403 if user lacks permission to view staff in specified business
      - Returns 404 if business doesn't exist
    `
  })
  @ApiQuery({ type: StaffListQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff list retrieved successfully',
    type: PaginatedStaffResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 'staff-uuid-123',
            businessId: 'business-uuid-456',
            userId: 'user-uuid-789',
            firstName: 'Marie',
            lastName: 'Dupont',
            displayName: 'Dr. Marie Dupont',
            role: 'PRACTITIONER',
            email: 'marie.dupont@clinique.fr',
            phone: '+33 1 23 45 67 89',
            specialties: ['DENTAL_SURGERY', 'ORTHODONTICS'],
            workingHours: {
              monday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } }
            },
            settings: { bookingBuffer: 15, maxAdvanceBooking: 60 },
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z'
          }
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 45,
          totalPages: 3,
          hasNext: true,
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
        message: 'validation.staff.business_id_invalid',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to view staff',
    schema: {
      example: {
        statusCode: 403,
        message: 'errors.staff.access_denied',
        error: 'Forbidden'
      }
    }
  })
  async getStaffList(@Query() query: StaffListQueryDto): Promise<PaginatedStaffResponseDto> {
    // TODO: Implement with actual use case
    // return this.listStaffUseCase.execute(query);
    
    // Mock response for development
    return {
      data: [
        {
          id: 'staff-uuid-123',
          businessId: query.businessId || 'business-uuid-456',
          userId: 'user-uuid-789',
          firstName: 'Marie',
          lastName: 'Dupont',
          displayName: 'Dr. Marie Dupont',
          role: 'PRACTITIONER' as any,
          email: 'marie.dupont@clinique.fr',
          phone: '+33 1 23 45 67 89',
          specialties: ['DENTAL_SURGERY', 'ORTHODONTICS'],
          workingHours: {
            monday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } }
          },
          settings: { bookingBuffer: 15, maxAdvanceBooking: 60 },
          isActive: true,
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
   * 👤 Get Individual Staff Member Details
   * 
   * Retrieves complete information for a specific staff member including
   * role details, specialties, working hours, and performance metrics.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get staff member by ID',
    description: `
      Retrieve detailed information for a specific staff member.
      
      **Includes:**
      - Complete profile information
      - Current role and permissions
      - Service specialties and certifications
      - Working hours and availability
      - Performance metrics (if authorized)
      - Recent activity summary
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: 'staff-uuid-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff member details retrieved successfully',
    type: StaffResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Staff member not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'errors.staff.not_found',
        error: 'Not Found'
      }
    }
  })
  async getStaffById(@Param('id', ParseUUIDPipe) id: string): Promise<StaffResponseDto> {
    // TODO: Implement with actual use case
    // return this.getStaffUseCase.execute({ staffId: id });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      userId: 'user-uuid-789',
      firstName: 'Marie',
      lastName: 'Dupont',
      displayName: 'Dr. Marie Dupont',
      role: 'PRACTITIONER' as any,
      email: 'marie.dupont@clinique.fr',
      phone: '+33 1 23 45 67 89',
      specialties: ['DENTAL_SURGERY', 'ORTHODONTICS'],
      workingHours: {
        monday: { start: '09:00', end: '17:00', break: { start: '12:00', end: '13:00' } }
      },
      settings: { bookingBuffer: 15, maxAdvanceBooking: 60 },
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-20T14:30:00Z')
    };
  }

  /**
   * ➕ Create New Staff Member
   * 
   * Adds a new staff member to a business with role assignment and configuration.
   * Automatically sets up default working hours and permissions based on role.
   */
  @Post()
  @ApiOperation({
    summary: 'Create new staff member',
    description: `
      Add a new staff member to a business with comprehensive configuration.
      
      **Process:**
      1. Validates business exists and user has permission
      2. Checks if user is already staff member in business
      3. Creates staff record with role-based defaults
      4. Sets up working hours template
      5. Configures permissions and access levels
      6. Sends welcome notification (if enabled)
      
      **Role-Based Defaults:**
      - PRACTITIONER: Full calendar access, client management
      - RECEPTIONIST: Booking management, limited client access  
      - MANAGER: Full business access, staff management
      - ASSISTANT: Limited support functions
    `
  })
  @ApiBody({ type: CreateStaffDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Staff member created successfully',
    type: StaffResponseDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid staff data or business constraints',
    schema: {
      example: {
        statusCode: 400,
        message: ['validation.staff.first_name_length', 'validation.staff.email_string'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already a staff member in this business',
    schema: {
      example: {
        statusCode: 409,
        message: 'errors.staff.already_exists',
        error: 'Conflict'
      }
    }
  })
  async createStaff(@Body() createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    // TODO: Implement with actual use case
    // return this.createStaffUseCase.execute(createStaffDto);
    
    // Mock response
    return {
      id: 'staff-uuid-new-123',
      businessId: createStaffDto.businessId,
      userId: createStaffDto.userId,
      firstName: createStaffDto.firstName,
      lastName: createStaffDto.lastName,
      displayName: `${createStaffDto.firstName} ${createStaffDto.lastName}`,
      role: createStaffDto.role,
      email: createStaffDto.email,
      phone: createStaffDto.phone,
      specialties: createStaffDto.specialties || [],
      workingHours: createStaffDto.workingHours || {},
      settings: createStaffDto.settings || {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * ✏️ Update Staff Member Information
   * 
   * Updates staff member details with partial data support.
   * Maintains audit trail of changes for compliance.
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update staff member',
    description: `
      Update staff member information with partial data support.
      
      **Updatable Fields:**
      - Personal information (name, email, phone)
      - Role and permissions (requires authorization)
      - Working hours and availability
      - Service specialties
      - Settings and preferences
      - Active status
      
      **Business Rules:**
      - Role changes require manager+ permissions
      - Cannot deactivate last manager in business
      - Working hours must respect business constraints
      - Email must be unique within business
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID to update',
    example: 'staff-uuid-123'
  })
  @ApiBody({ type: UpdateStaffDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff member updated successfully',
    type: StaffResponseDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Staff member not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions for this update'
  })
  async updateStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto
  ): Promise<StaffResponseDto> {
    // TODO: Implement with actual use case
    // return this.updateStaffUseCase.execute({ staffId: id, ...updateStaffDto });
    
    // Mock response
    return {
      id,
      businessId: 'business-uuid-456',
      userId: 'user-uuid-789',
      firstName: updateStaffDto.firstName || 'Marie',
      lastName: updateStaffDto.lastName || 'Dupont',
      displayName: 'Dr. Marie Dupont',
      role: updateStaffDto.role || ('PRACTITIONER' as any),
      email: updateStaffDto.email || 'marie.dupont@clinique.fr',
      phone: updateStaffDto.phone || '+33 1 23 45 67 89',
      specialties: updateStaffDto.specialties || ['DENTAL_SURGERY'],
      workingHours: updateStaffDto.workingHours || {},
      settings: updateStaffDto.settings || {},
      isActive: updateStaffDto.isActive !== undefined ? updateStaffDto.isActive : true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date()
    };
  }

  /**
   * 🗑️ Deactivate Staff Member
   * 
   * Performs soft deletion by deactivating staff member.
   * Preserves appointment history and audit trail.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Deactivate staff member',
    description: `
      Safely deactivate a staff member while preserving historical data.
      
      **Process:**
      1. Validates user has permission to manage staff
      2. Checks for active appointments (prevents deletion if any)
      3. Transfers or reassigns ongoing responsibilities
      4. Soft deletes staff record (sets isActive = false)
      5. Maintains appointment and audit history
      6. Sends deactivation notifications
      
      **Data Preservation:**
      - All appointment history is maintained
      - Audit logs remain accessible
      - Financial records stay linked
      - Can be reactivated if needed
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID to deactivate',
    example: 'staff-uuid-123'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff member deactivated successfully',
    schema: {
      example: {
        message: 'success.staff.deactivated',
        staffId: 'staff-uuid-123',
        deactivatedAt: '2024-01-25T15:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot deactivate staff with active appointments',
    schema: {
      example: {
        statusCode: 400,
        message: 'errors.staff.has_active_appointments',
        error: 'Bad Request',
        details: {
          activeAppointments: 5,
          nextAppointment: '2024-01-26T09:00:00Z'
        }
      }
    }
  })
  async deactivateStaff(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string; staffId: string; deactivatedAt: Date }> {
    // TODO: Implement with actual use case
    // return this.deleteStaffUseCase.execute({ staffId: id });
    
    // Mock response
    return {
      message: 'success.staff.deactivated',
      staffId: id,
      deactivatedAt: new Date()
    };
  }

  /**
   * 📤 Upload Staff Profile Images
   * 
   * Handles profile image uploads with multi-cloud storage support.
   * Automatically resizes and optimizes images for different use cases.
   */
  @Post(':id/upload')
  @ApiOperation({
    summary: 'Upload staff profile images',
    description: `
      Upload profile images for staff members with automatic processing.
      
      **Features:**
      - Multiple file upload support
      - Automatic image resizing (thumbnail, profile, full)
      - Format conversion to optimized web formats
      - Multi-cloud storage (AWS S3, Azure, GCP)
      - CDN integration for fast delivery
      - Virus scanning for security
      
      **Supported Formats:** JPG, PNG, WebP
      **Maximum Size:** 10MB per file
      **Generated Sizes:**
      - Thumbnail: 150x150px
      - Profile: 400x400px  
      - Full: 1200x1200px (max)
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: 'staff-uuid-123'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Images uploaded successfully',
    schema: {
      example: {
        message: 'success.staff.images_uploaded',
        staffId: 'staff-uuid-123',
        files: [
          {
            originalName: 'profile.jpg',
            url: 'https://cdn.example.com/staff/uuid/profile.webp',
            thumbnailUrl: 'https://cdn.example.com/staff/uuid/thumb.webp',
            size: 245760,
            format: 'webp'
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file format or size',
    schema: {
      example: {
        statusCode: 400,
        message: 'errors.upload.invalid_format',
        error: 'Bad Request'
      }
    }
  })
  async uploadStaffImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<{ message: string; staffId: string; files: any[] }> {
    // TODO: Implement with actual file upload service
    // return this.fileUploadService.uploadStaffImages(id, files);
    
    // Mock response
    return {
      message: 'success.staff.images_uploaded',
      staffId: id,
      files: files.map(file => ({
        originalName: file.originalname,
        url: `https://cdn.example.com/staff/${id}/${file.originalname}`,
        thumbnailUrl: `https://cdn.example.com/staff/${id}/thumb_${file.originalname}`,
        size: file.size,
        format: 'webp'
      }))
    };
  }

  /**
   * 📊 Get Staff Performance Analytics
   * 
   * Provides detailed analytics for staff member performance including
   * appointment metrics, revenue generation, and client satisfaction.
   */
  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get staff performance analytics',
    description: `
      Retrieve comprehensive performance analytics for a staff member.
      
      **Metrics Included:**
      - Appointment statistics (completed, cancelled, no-shows)
      - Revenue generation and trends
      - Client satisfaction scores
      - Utilization rates and efficiency
      - Service performance breakdown
      - Comparative benchmarks
      
      **Time Ranges:** Last 7/30/90 days, custom periods
      **Access Control:** Managers see all staff, practitioners see own data
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: 'staff-uuid-123'
  })
  @ApiQuery({
    name: 'period',
    description: 'Analysis period',
    required: false,
    enum: ['7d', '30d', '90d', 'custom'],
    example: '30d'
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Custom period start date (ISO format)',
    required: false,
    example: '2024-01-01T00:00:00Z'
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Custom period end date (ISO format)',
    required: false,
    example: '2024-01-31T23:59:59Z'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics data retrieved successfully',
    schema: {
      example: {
        staffId: 'staff-uuid-123',
        period: '30d',
        appointments: {
          total: 127,
          completed: 119,
          cancelled: 5,
          noShows: 3,
          completionRate: 0.937
        },
        revenue: {
          total: 12450.00,
          average: 104.62,
          trend: '+8.2%'
        },
        satisfaction: {
          averageRating: 4.7,
          totalReviews: 84,
          recommendationRate: 0.95
        },
        utilization: {
          hoursWorked: 152,
          hoursAvailable: 160,
          utilizationRate: 0.95
        }
      }
    }
  })
  async getStaffAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    // TODO: Implement with actual analytics use case
    // return this.staffAnalyticsUseCase.execute({ 
    //   staffId: id, 
    //   period, 
    //   startDate, 
    //   endDate 
    // });
    
    // Mock response
    return {
      staffId: id,
      period: period || '30d',
      appointments: {
        total: 127,
        completed: 119,
        cancelled: 5,
        noShows: 3,
        completionRate: 0.937
      },
      revenue: {
        total: 12450.00,
        average: 104.62,
        trend: '+8.2%'
      },
      satisfaction: {
        averageRating: 4.7,
        totalReviews: 84,
        recommendationRate: 0.95
      },
      utilization: {
        hoursWorked: 152,
        hoursAvailable: 160,
        utilizationRate: 0.95
      }
    };
  }
}
