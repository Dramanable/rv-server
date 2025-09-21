/**
 * 💊 Health Controller - Infrastructure Layer
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../security/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public() // 🔓 Route publique - pas d'authentification requise
  @Get()
  @ApiOperation({ summary: 'Health check' })
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return Promise.resolve({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  }
}
