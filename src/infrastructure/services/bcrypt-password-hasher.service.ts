/**
 * 🔐 Bcrypt Password Hasher Adapter
 * ✅ Clean Architecture - Infrastructure Layer
 * ✅ Implémentation concrète avec bcrypt
 * ✅ Respecte le port IPasswordHasher
 */

import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/ports/password-hasher.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private static readonly BCRYPT_ROUNDS = 10; // Équilibre sécurité/performance
  private static readonly BCRYPT_PATTERN = /^\$2[abxy]\$\d{1,2}\$.{53,}$/;

  /**
   * Hache un mot de passe avec bcrypt
   */
  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Plain password cannot be empty');
    }

    const salt = await bcrypt.genSalt(BcryptPasswordHasher.BCRYPT_ROUNDS);
    return await bcrypt.hash(plainPassword, salt);
  }

  /**
   * Vérifie un mot de passe avec bcrypt
   */
  async verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      return false;
    }

    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      // Log error en production mais retourne false pour sécurité
      return false;
    }
  }

  /**
   * Valide le format bcrypt
   */
  isValidHashFormat(hash: string): boolean {
    if (!hash || hash.trim().length === 0) {
      return false;
    }

    return BcryptPasswordHasher.BCRYPT_PATTERN.test(hash);
  }

  /**
   * Factory pour tests - crée un hash faible (plus rapide)
   */
  async hashForTesting(plainPassword: string): Promise<string> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new Error('Plain password cannot be empty');
    }

    const salt = await bcrypt.genSalt(4); // Rounds faibles pour tests
    return await bcrypt.hash(plainPassword, salt);
  }
}
