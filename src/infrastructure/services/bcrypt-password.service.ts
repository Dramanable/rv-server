/**
 * 🔐 Bcrypt Password Service - Implementation
 *
 * Service de hachage et vérification des mots de passe avec bcrypt
 * Implémentation concrète pour la couche Infrastructure
 */

import { IPasswordService } from "@application/ports/password.service.interface";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly logger = new Logger(BcryptPasswordService.name);

  constructor(private readonly configService: ConfigService) {}

  async hash(plainPassword: string): Promise<string> {
    const saltRounds = this.configService.get<number>("BCRYPT_ROUNDS", 12);

    try {
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      this.logger.debug("Password hashed successfully");
      return hashedPassword;
    } catch (error) {
      this.logger.error(
        `Failed to hash password: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
      throw new Error("Password hashing failed");
    }
  }

  async verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      this.logger.debug(
        `Password verification: ${isValid ? "success" : "failed"}`,
      );
      return isValid;
    } catch (error) {
      this.logger.error(
        `Failed to verify password: ${error instanceof Error ? error.message : "Unknown error"}`,
        error,
      );
      return false;
    }
  }
}
