/**
 * 🛡️ LOCAL AUTH GUARD - NestJS Passport Guard
 *
 * Guard Local pour l'authentification par email/password
 * Respecte les principes Clean Architecture
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔑 Local Authentication Guard
 *
 * Utilise la stratégie Local de Passport pour valider email/password
 * Utilisé principalement pour l'endpoint de login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
