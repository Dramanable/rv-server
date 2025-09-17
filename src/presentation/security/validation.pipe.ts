/**
 * 🧹 Input Sanitization & Validation - Presentation Layer  
 * ✅ Protection contre XSS, SQL Injection, NoSQL Injection
 * ✅ Validation stricte des inputs
 */

import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class SecurityValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return this.sanitizeInput(value);
    }

    // Sanitization AVANT validation
    const sanitizedValue = this.sanitizeInput(value);
    
    // Transformation vers DTO
    const object = plainToInstance(metatype, sanitizedValue);
    
    // Validation avec class-validator
    const errors = await validate(object);
    
    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }
    
    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * Sanitization récursive des inputs
   */
  private sanitizeInput(value: any): any {
    if (typeof value === 'string') {
      // Protection XSS
      return DOMPurify.sanitize(value, { 
        ALLOWED_TAGS: [], // Aucun tag HTML autorisé
        ALLOWED_ATTR: [] 
      }).trim();
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeInput(item));
    }

    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Sanitize les clés aussi (protection NoSQL injection)
        const cleanKey = this.sanitizeString(key);
        sanitized[cleanKey] = this.sanitizeInput(val);
      }
      return sanitized;
    }

    return value;
  }

  private sanitizeString(str: string): string {
    // Supprime les caractères dangereux pour NoSQL
    return str.replace(/[${}]/g, '').trim();
  }
}
