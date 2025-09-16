/**
 * 🔌 USE CASE ADAPTERS MODULE
 * ✅ NestJS Module pour les adapters Use Case
 * ✅ Clean Architecture - Framework isolation
 * ✅ Provider configuration
 */

import { Module } from '@nestjs/common';
import { USE_CASE_ADAPTERS } from './use-cases';

/**
 * Module contenant tous les adapters Use Case pour NestJS
 * Permet l'injection des Use Cases purs via des wrappers NestJS
 */
@Module({
  providers: [...USE_CASE_ADAPTERS],
  exports: [...USE_CASE_ADAPTERS],
})
export class UseCaseAdaptersModule {}

export { USE_CASE_ADAPTERS };
