/**
 * 🛡️ PASSPORT LOCAL GUARD - Guard Passport.js Local avec Clean Architecture
 *
 * Guard d'authentification utilisant Passport.js et Local Strategy
 * Pour l'authentification par email/password
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any) {
    // Passport.js a déjà validé l'utilisateur via LocalStrategy.validate()
    // L'utilisateur est automatiquement injecté dans req.user
    if (err || !user) {
      throw err || new Error('Invalid credentials');
    }
    return user;
  }
}
