/**
 * 🎭 PRESENTATION MODULE - Couche de présentation avec services
 *
 * Contient les contrôleurs et services spécifiques à la couche présentation
 * (gestion HTTP, cookies, validation, sécurité)
 */

import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { PresentationCookieService } from './services/cookie.service';

@Module({
  controllers: [AuthController],
  providers: [PresentationCookieService],
  exports: [PresentationCookieService],
})
export class PresentationModule {}
