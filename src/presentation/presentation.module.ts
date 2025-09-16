/**
 * 🎭 PRESENTATION MODULE - Minimal Version
 */

import { Module } from '@nestjs/common';
import { AppointmentController } from './controllers/appointment.controller';

@Module({
  controllers: [
    AppointmentController,
  ],
  providers: [],
  exports: [],
})
export class PresentationModule {}
