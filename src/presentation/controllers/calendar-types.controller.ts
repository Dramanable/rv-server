/**
 * 📅 CalendarTypesController - Gestion des types de calendrier
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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

import { User } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../security/auth.guard';
import { GetUser } from '../security/decorators/get-user.decorator';

@ApiTags('📅 Calendar Types Management')
@Controller('calendar-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarTypesController {
  constructor() {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '📅 Create Calendar Type' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Calendar type created successfully',
  })
  async create(@Body() dto: any, @GetUser() user: User) {
    return {
      success: true,
      message: 'Create calendar type - coming soon',
      data: { id: 'temp-id', ...dto },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '📋 Get Calendar Type by ID' })
  @ApiParam({ name: 'id', description: 'Calendar Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar type retrieved successfully',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return {
      success: true,
      message: 'Get calendar type by ID - coming soon',
      data: { id, name: 'Sample Calendar Type' },
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '✏️ Update Calendar Type' })
  @ApiParam({ name: 'id', description: 'Calendar Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar type updated successfully',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
    @GetUser() user: User,
  ) {
    return {
      success: true,
      message: 'Update calendar type - coming soon',
      data: { id, ...dto },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🗑️ Delete Calendar Type' })
  @ApiParam({ name: 'id', description: 'Calendar Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar type deleted successfully',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return {
      success: true,
      message: 'Delete calendar type - coming soon',
      data: { id },
    };
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '🔍 List Calendar Types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Calendar types retrieved successfully',
  })
  async list(@Body() dto: any, @GetUser() user: User) {
    return {
      success: true,
      message: 'List calendar types - coming soon',
      data: [],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}
