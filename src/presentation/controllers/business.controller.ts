/**
 * 🏢 Business Controller - Clean Architecture + NestJS
 * Présentation layer pour la gestion des entreprises
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Business')
@Controller('business')
export class BusinessController {
  @Get()
  @ApiOperation({ summary: 'Get business list' })
  async getBusiness(): Promise<any[]> {
    // TODO: Implement business logic
    return Promise.resolve([]);
  }
}
