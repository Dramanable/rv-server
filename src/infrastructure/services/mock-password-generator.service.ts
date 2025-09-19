/**
 * 🔧 Mock Password Generator Service
 * Simple implementation for testing and development
 */

import { Injectable } from '@nestjs/common';
import { IPasswordGenerator } from '../../application/ports/password-generator.port';

@Injectable()
export class MockPasswordGenerator implements IPasswordGenerator {
  async generateTemporaryPassword(length: number = 12, includeSpecialChars: boolean = true): Promise<string> {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    let charset = letters + numbers;
    if (includeSpecialChars) {
      charset += special;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  async generateResetToken(length: number = 32): Promise<string> {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return token;
  }

  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    feedback: string[];
  }> {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (password.length < 8) feedback.push('Password should be at least 8 characters');
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
    if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
    if (!/[0-9]/.test(password)) feedback.push('Add numbers');
    if (!/[!@#$%^&*]/.test(password)) feedback.push('Add special characters');

    return {
      isValid: score >= 4,
      score: Math.min(score, 4),
      feedback
    };
  }
}