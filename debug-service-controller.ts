/**
 * 🔍 Debug ServiceController - Temporary analysis
 */
import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// Simple test to validate decorators
@ApiTags('🔍 Debug Service')
@Controller('debug-services')
export class DebugServiceController {

  @Post('list')
  @ApiOperation({ summary: 'List services' })
  async list(@Body() dto: any): Promise<any> {
    return { message: 'List endpoint works' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return { message: 'Get endpoint works', id };
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  async create(@Body() dto: any): Promise<any> {
    return { message: 'Create endpoint works' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any): Promise<any> {
    return { message: 'Update endpoint works', id };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return { message: 'Delete endpoint works', id };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async health(): Promise<any> {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }
}