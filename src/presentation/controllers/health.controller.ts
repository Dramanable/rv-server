/**
 * 💊 Health Controller - Infrastructure Layer
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../security/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public() // 🔓 Route publique - pas d'authentification requise
  @ApiOperation({ summary: 'Health check' })
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
