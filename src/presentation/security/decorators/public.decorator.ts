/**
 * 🔓 PUBLIC DECORATOR - Presentation Layer Security Decorator
 *
 * Décorateur pour marquer les routes qui ne nécessitent pas d'authentification
 * Couche présentation/sécurité - contrôle d'accès HTTP
 */

import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * 🔓 Décorateur @Public()
 *
 * Marque une route ou un contrôleur comme public (sans authentification requise)
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   async login(@Body() loginDto: LoginDto) {
 *     // Route publique - pas d'authentification requise
 *   }
 *
 *   @Post('profile')
 *   async getProfile() {
 *     // Route protégée - authentification requise
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
