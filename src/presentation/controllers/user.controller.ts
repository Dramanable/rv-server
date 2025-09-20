/**
 * 👤 User Controller - Clean Architecture + NestJS
 * Présentation layer pour la gestion des utilisateurs avec pagination POST
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  ListUsersRequestDto,
  ListUsersResponseDto,
  UserListValidationErrorDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserResponseDto,
  DeleteUserResponseDto,
} from '../dtos/user.dto';
import {
  ValidationErrorDto,
  UnauthorizedErrorDto,
} from '@presentation/dtos/auth.dto';
import { ListUsersUseCase } from '@application/use-cases/users/list-users.use-case';
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { GetMeUseCase } from '@application/use-cases/users/get-me.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';
import { TOKENS } from '@shared/constants/injection-tokens';

@ApiTags('👥 User Management')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(
    @Inject(TOKENS.LIST_USERS_USE_CASE)
    private readonly listUsersUseCase: ListUsersUseCase,
    @Inject(TOKENS.CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(TOKENS.GET_USER_BY_ID_USE_CASE)
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    @Inject(TOKENS.GET_ME_USE_CASE)
    private readonly getMeUseCase: GetMeUseCase,
    @Inject(TOKENS.UPDATE_USER_USE_CASE)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(TOKENS.DELETE_USER_USE_CASE)
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: '👤 Get current user profile',
    description:
      'Retrieve the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: UnauthorizedErrorDto,
  })
  async getMe(): Promise<UserResponseDto> {
    // TODO: Implement GetMeUseCase with proper authentication
    return {
      id: 'temp-id',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'REGULAR_CLIENT' as any,
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📋 List users with advanced pagination and filters',
    description: `
    🎯 **POST Endpoint for Complex User Listing**
    
    This endpoint uses POST method instead of GET to support complex filtering and pagination:
    - 📄 **Pagination**: Page-based pagination with configurable limits
    - 🔍 **Search**: Full-text search across name, email, and other fields  
    - 🎭 **Role Filtering**: Filter by multiple user roles simultaneously
    - 📅 **Date Ranges**: Filter users by creation date ranges
    - ✅ **Status Filters**: Filter by active/inactive and verified/unverified status
    - 🔤 **Sorting**: Sort by multiple fields with ASC/DESC directions
    
    **🔐 Authorization**: Only PLATFORM_ADMIN users can access this endpoint.
    
    **📊 Response**: Returns paginated user list with comprehensive metadata including:
    - Total count, current page, total pages
    - Previous/next page availability
    - Applied filters for transparency
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ Users retrieved successfully with pagination metadata',
    type: ListUsersResponseDto,
  })
  @ApiBadRequestResponse({
    description: '❌ Invalid request parameters (validation errors)',
    type: UserListValidationErrorDto,
    examples: {
      validationError: {
        summary: 'Validation Error Example',
        value: {
          message: 'Invalid request parameters',
          error: [
            'pagination.page must be at least 1',
            'pagination.limit must not exceed 100',
            'filters.roles[0] must be a valid enum value',
          ],
          statusCode: 400,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '🔒 User not authenticated',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description:
      '🚫 Insufficient permissions - Only PLATFORM_ADMIN can list users',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Insufficient permissions to list users',
        },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 },
      },
    },
  })
  async listUsers(
    @Body() request: ListUsersRequestDto,
    @Request() req: any,
  ): Promise<ListUsersResponseDto> {
    // Extraction de l'utilisateur connecté depuis la requête
    // TODO: Implémenter l'extraction correcte du user ID depuis le JWT/session
    const requestingUserId = req.user?.id || 'temp-admin-id';

    // Appel du Use Case avec les paramètres de la requête
    const result = await this.listUsersUseCase.execute({
      requestingUserId,
      pagination: {
        page: request.pagination.page,
        limit: request.pagination.limit,
      },
      sort: request.sort
        ? {
            field: request.sort.field as any,
            direction: request.sort.direction,
          }
        : undefined,
      filters: request.filters
        ? {
            search: request.filters.search,
            email: request.filters.email,
            roles: request.filters.roles,
            isActive: request.filters.isActive,
            isVerified: request.filters.isVerified,
            createdAfter: request.filters.createdAfter,
            createdBefore: request.filters.createdBefore,
            userIds: request.filters.userIds,
          }
        : undefined,
    });

    // Construction de la réponse avec mapper
    return {
      data: result.data,
      meta: result.meta,
      message: 'Users retrieved successfully',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '👤 Create a new user',
    description: `
    🎯 **Create User Endpoint**
    
    Creates a new user in the system with the specified role and information.
    
    **🔐 Authorization**: 
    - PLATFORM_ADMIN: Can create any user
    - BUSINESS_OWNER: Can create business-level users (no PLATFORM_ADMIN)
    - BUSINESS_ADMIN: Can create location-level users only
    
    **📋 Business Rules**:
    - Email must be unique in the system
    - Role must be valid and within permissions
    - All required fields must be provided
    `,
  })
  @ApiResponse({
    status: 201,
    description: '✅ User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: '❌ Invalid request data or validation errors',
    type: ValidationErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: '🔒 User not authenticated',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description: '🚫 Insufficient permissions to create user',
  })
  async createUser(
    @Body() request: CreateUserRequestDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const requestingUserId = req.user?.id || 'temp-admin-id';

    const result = await this.createUserUseCase.execute({
      requestingUserId,
      email: request.email,
      name: `${request.firstName} ${request.lastName}`,
      role: request.role,
    });

    return {
      id: result.id,
      email: result.email,
      firstName: result.name.split(' ')[0] || '',
      lastName: result.name.split(' ').slice(1).join(' ') || '',
      role: result.role,
      phone: undefined, // TODO: Add phone support to use case
      isActive: result.isActive,
      isVerified: !result.requirePasswordChange, // Temporary mapping
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.createdAt.toISOString(), // Use createdAt as fallback
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '👤 Get user by ID',
    description: `
    🎯 **Get User by ID Endpoint**
    
    Retrieves a specific user by their unique ID.
    
    **🔐 Authorization**: 
    - Users can view their own profile
    - PLATFORM_ADMIN: Can view any user
    - BUSINESS_OWNER: Can view business users
    - BUSINESS_ADMIN: Can view operational users
    - LOCATION_MANAGER: Can view operational staff
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '✅ User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: '❌ User not found',
  })
  @ApiUnauthorizedResponse({
    description: '🔒 User not authenticated',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description: '🚫 Insufficient permissions to view user',
  })
  async getUserById(
    @Param('id') userId: string,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const requestingUserId = req.user?.id || 'temp-admin-id';

    const result = await this.getUserByIdUseCase.execute({
      requestingUserId,
      targetUserId: userId,
    });

    return {
      id: result.id,
      email: result.email,
      firstName: result.name.split(' ')[0] || '',
      lastName: result.name.split(' ').slice(1).join(' ') || '',
      role: result.role,
      phone: undefined, // TODO: Add phone support
      isActive: result.isActive,
      isVerified: true, // TODO: Add verification support
      createdAt: result.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: result.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✏️ Update user',
    description: `
    🎯 **Update User Endpoint**
    
    Updates an existing user's information.
    
    **🔐 Authorization**: 
    - Users can update their own limited profile fields
    - PLATFORM_ADMIN: Can update any user and change roles
    - BUSINESS_OWNER: Can update business users (no role elevation to PLATFORM_ADMIN)
    - BUSINESS_ADMIN: Can update operational users (no management roles)
    
    **📋 Business Rules**:
    - Users cannot change their own role
    - Email must remain unique if changed
    - Role changes must respect hierarchy
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '✅ User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: '❌ User not found',
  })
  @ApiBadRequestResponse({
    description: '❌ Invalid request data or validation errors',
    type: ValidationErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: '🔒 User not authenticated',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description: '🚫 Insufficient permissions to update user',
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() request: UpdateUserRequestDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const requestingUserId = req.user?.id || 'temp-admin-id';

    const nameUpdate =
      request.firstName || request.lastName
        ? `${request.firstName || ''} ${request.lastName || ''}`.trim()
        : undefined;

    const result = await this.updateUserUseCase.execute({
      requestingUserId,
      targetUserId: userId,
      updates: {
        name: nameUpdate,
        role: request.role,
        isActive: request.isActive,
      },
    });

    return {
      id: result.id,
      email: result.email,
      firstName: result.name.split(' ')[0] || '',
      lastName: result.name.split(' ').slice(1).join(' ') || '',
      role: result.role,
      phone: undefined, // TODO: Add phone support
      isActive: result.isActive,
      isVerified: !result.requirePasswordChange, // Temporary mapping
      createdAt: new Date().toISOString(), // TODO: Add createdAt to response
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🗑️ Delete user',
    description: `
    🎯 **Delete User Endpoint**
    
    Performs a soft delete of a user account.
    
    **🔐 Authorization**: 
    - PLATFORM_ADMIN: Can delete any user (except themselves)
    - BUSINESS_OWNER: Can delete business users (no PLATFORM_ADMIN or other BUSINESS_OWNER)
    - BUSINESS_ADMIN: Can delete operational users (no management roles)
    - LOCATION_MANAGER: Can delete operational staff (no management roles)
    
    **📋 Business Rules**:
    - Users cannot delete themselves
    - Soft delete preserves data for audit purposes
    - Deleted users cannot login but data remains
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '✅ User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiNotFoundResponse({
    description: '❌ User not found',
  })
  @ApiUnauthorizedResponse({
    description: '🔒 User not authenticated',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description:
      '🚫 Insufficient permissions to delete user or attempting self-deletion',
  })
  async deleteUser(
    @Param('id') userId: string,
    @Request() req: any,
  ): Promise<DeleteUserResponseDto> {
    const requestingUserId = req.user?.id || 'temp-admin-id';

    await this.deleteUserUseCase.execute({
      requestingUserId,
      targetUserId: userId,
    });

    return {
      message: 'User deleted successfully',
      deletedUserId: userId,
    };
  }
}
