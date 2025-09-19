/**
 * 👤 User Controller - Clean Architecture + NestJS
 * Présentation layer pour la gestion des utilisateurs
 */

import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// Imports simplifiés pour éviter les erreurs de build
// TODO: Implémenter les décorateurs et guards manquants
import { UserResponseDto } from '../dtos/auth.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  async getMe(): Promise<UserResponseDto> {
    // TODO: Implement GetMeUseCase with proper authentication
    return {
      id: 'temp-id',
      email: 'user@example.com',
      name: 'Test User',
      role: 'CLIENT',
      createdAt: new Date().toISOString(),
    };
  }
}
