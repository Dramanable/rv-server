/**
 * 🔐 Passport Password Service - Service simplifié pour les Strategies Passport
 *
 * Version allégée du BcryptPasswordService spécifiquement pour les strategies Passport
 * Évite les dépendances circulaires et respecte la Clean Architecture
 */

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PassportPasswordService {
  /**
   * 🔍 Compare un mot de passe en clair avec son hash
   *
   * @param plainPassword - Mot de passe en clair
   * @param hashedPassword - Mot de passe hashé
   * @returns Promise<boolean> - true si les mots de passe correspondent
   */
  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch {
      return false;
    }
  }
}
