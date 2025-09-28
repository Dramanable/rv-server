/**
 * 👤 CLIENT ENTITY - TEST TDD SIMPLE
 *
 * Tests unitaires pour l'entité Client en suivant une approche TDD stricte.
 * Focus sur les fonctionnalités essentielles avec structure simplifiée.
 */

import { Client } from '@domain/entities/client.entity';
import { ClientId } from '@domain/value-objects/client-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import {
  ClientValidationError,
  ClientBusinessRuleError,
} from '@domain/exceptions/client.exceptions';

describe('Client Entity - TDD Simple', () => {
  // Test data setup
  const validUserId = UserId.generate();
  const validClientId = ClientId.generate();
  const validBusinessId = BusinessId.generate();
  const validEmail = Email.create('client@example.com');
  const validPhone = Phone.create('+33123456789');

  // ✅ COMMON CLIENT DATA - Utilisé dans tous les tests
  const validClientData = {
    userId: validUserId,
    businessId: validBusinessId,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: validEmail,
    phone: validPhone,
    dateOfBirth: new Date('1985-06-15'),
    createdBy: validUserId.getValue(),
  };

  describe('🔴 RED - Client Creation', () => {
    it('should create a client with valid data', () => {
      // Act
      const client = Client.create(validClientData);

      // Assert
      expect(client).toBeDefined();
      expect(client.getId()).toBeDefined();
      expect(client.getUserId()).toBe(validUserId);
      expect(client.getBusinessId()).toBe(validBusinessId);
      expect(client.getFirstName()).toBe('Jean');
      expect(client.getLastName()).toBe('Dupont');
      expect(client.getEmail()).toBe(validEmail);
      expect(client.getPhone()).toBe(validPhone);
      expect(client.getDateOfBirth()).toEqual(new Date('1985-06-15'));
      expect(client.isActive()).toBe(true);
      expect(client.getCreatedBy()).toBe(validUserId.getValue());
      expect(client.getCreatedAt()).toBeInstanceOf(Date);
      expect(client.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw error for empty first name', () => {
      // Arrange
      const invalidData = { ...validClientData, firstName: '' };

      // Act & Assert
      expect(() => Client.create(invalidData)).toThrow(
        'Client first name cannot be empty',
      );
    });

    it('should throw error for empty last name', () => {
      // Arrange
      const invalidData = { ...validClientData, lastName: '' };

      // Act & Assert
      expect(() => Client.create(invalidData)).toThrow(
        'Client last name cannot be empty',
      );
    });
  });

  describe('🔴 RED - Client Business Rules', () => {
    it('should activate client correctly', () => {
      // Arrange
      const client = Client.create(validClientData);
      client.deactivate(validUserId.getValue());
      expect(client.isActive()).toBe(false);

      // Act
      client.activate(validUserId.getValue());

      // Assert
      expect(client.isActive()).toBe(true);
    });

    it('should deactivate client correctly', () => {
      // Arrange
      const client = Client.create(validClientData);
      expect(client.isActive()).toBe(true);

      // Act
      client.deactivate(validUserId.getValue());

      // Assert
      expect(client.isActive()).toBe(false);
    });

    it('should check if client has appointment history with business', () => {
      // Arrange
      const client = Client.create(validClientData);

      // Act & Assert
      expect(client.hasAppointmentHistoryWith(validBusinessId)).toBe(false); // No history yet
    });
  });

  describe('🔴 RED - Client Equality and Serialization', () => {
    it('should have meaningful string representation', () => {
      // Arrange
      const client = Client.create(validClientData);

      // Act
      const stringRep = client.toString();

      // Assert
      expect(stringRep).toContain('Client');
      expect(stringRep).toContain('Jean Dupont');
      expect(stringRep).toContain(client.getId().getValue());
      expect(stringRep).toContain(validBusinessId.getValue());
      expect(stringRep).toContain('client@example.com');
    });
  });
});
