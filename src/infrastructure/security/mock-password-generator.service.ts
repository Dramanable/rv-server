/**
 * 🔐 MOCK PASSWORD GENERATOR - Infrastructure Implementation
 *
 * Mock du générateur de mots de passe pour tests et développement
 * Implémente le port défini dans l'Application Layer
 */

import { Injectable } from '@nestjs/common';
import { IPasswordGenerator } from '../../application/ports/password-generator.port';

@Injectable()
export class MockPasswordGenerator implements IPasswordGenerator {
  private readonly generatedPasswords: Array<{
    password: string;
    timestamp: Date;
    type: 'temporary' | 'reset';
  }> = [];

  async generateTemporaryPassword(): Promise<string> {
    // Génération d'un mot de passe temporaire sécurisé
    const adjectives = ['Quick', 'Brave', 'Calm', 'Smart', 'Bold'];
    const nouns = ['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear'];
    const numbers = Math.floor(Math.random() * 999) + 100;

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const temporaryPassword = `${adjective}${noun}${numbers}!`;

    // Stockage pour audit
    this.generatedPasswords.push({
      password: temporaryPassword,
      timestamp: new Date(),
      type: 'temporary',
    });

    // Simulation délai de génération
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log(`🔐 TEMPORARY PASSWORD GENERATED: ${temporaryPassword}`);

    return temporaryPassword;
  }

  async generateResetToken(): Promise<string> {
    // Génération d'un token de réinitialisation
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Stockage pour audit
    this.generatedPasswords.push({
      password: token,
      timestamp: new Date(),
      type: 'reset',
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log(`🔑 RESET TOKEN GENERATED: ${token.substring(0, 8)}...`);

    return token;
  }

  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    feedback: string[];
  }> {
    // Simulation de validation de force du mot de passe
    const feedback: string[] = [];
    let score = 0;

    // Critères de validation
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Password should contain uppercase letters');
    }

    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Password should contain lowercase letters');
    }

    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push('Password should contain numbers');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Password should contain special characters');
    }

    const isValid = score >= 60; // Au moins 3 critères sur 5

    await new Promise((resolve) => setTimeout(resolve, 30));

    console.log(
      `🔍 PASSWORD STRENGTH VALIDATION: ${password} -> Score: ${score}/100, Valid: ${isValid}`,
    );

    return {
      isValid,
      score,
      feedback,
    };
  }

  async hashPassword(password: string): Promise<string> {
    // Mock de hachage - en réalité utiliserait bcrypt
    const mockHash = `$2b$12$${Buffer.from(password).toString('base64').substring(0, 22)}mockHashSuffix`;

    await new Promise((resolve) => setTimeout(resolve, 30));

    return mockHash;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    // Mock de validation - en réalité utiliserait bcrypt.compare
    const expectedHash = await this.hashPassword(password);

    return hash === expectedHash;
  }

  // 🧪 Méthodes utilitaires pour les tests
  getGeneratedPasswordsCount(): number {
    return this.generatedPasswords.length;
  }

  getLastGeneratedPassword(): string | null {
    const last = this.generatedPasswords[this.generatedPasswords.length - 1];
    return last ? last.password : null;
  }

  clearGeneratedPasswords(): void {
    this.generatedPasswords.length = 0;
  }

  getPasswordHistory(): Array<{
    password: string;
    timestamp: Date;
    type: 'temporary' | 'reset';
  }> {
    return [...this.generatedPasswords];
  }
}
