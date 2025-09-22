/**
 * @fileoverview Tests pour SendBulkNotificationDto
 * @module Presentation/DTOs/Tests
 * @version 1.0.0
 */

import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

import {
  SendBulkNotificationDto,
  BulkRecipientDto,
  SegmentationCriteriaDto,
} from '../../../../presentation/dtos/notification/send-bulk-notification.dto';

describe('SendBulkNotificationDto', () => {
  describe('validation', () => {
    it('should pass validation with minimal valid data', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with complete valid data', async () => {
      // Given
      const validData = {
        templateType: 'APPOINTMENT_CONFIRMATION',
        defaultChannel: 'EMAIL',
        priority: 'HIGH',
        campaignName: 'Campaign complet de test',
        segmentation: {
          userRole: ['CLIENT', 'STAFF'],
          businessId: ['550e8400-e29b-41d4-a716-446655440000'],
          lastActivityAfter: '2025-09-01T00:00:00.000Z',
          preferredChannel: 'EMAIL',
          includeInactive: false,
        },
        commonVariables: {
          businessName: 'Test Business',
          businessPhone: '+33 1 23 45 67 89',
        },
        batchSize: 50,
        rateLimitPerMinute: 100,
        scheduledAt: '2025-09-23T08:00:00.000Z',
        previewOnly: true,
      };

      const dto = plainToClass(SendBulkNotificationDto, validData);

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid templateType', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'INVALID_TEMPLATE',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('templateType');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid defaultChannel', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'INVALID_CHANNEL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('defaultChannel');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid priority', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'INVALID_PRIORITY',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with empty campaignName', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: '',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('campaignName');
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail validation with campaignName too long', async () => {
      // Given
      const longName = 'a'.repeat(101); // 101 caractères
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: longName,
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('campaignName');
      expect(errors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail validation with batchSize too small', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
        batchSize: 0,
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('batchSize');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation with batchSize too large', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
        batchSize: 1001,
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('batchSize');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation with invalid scheduledAt format', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
        scheduledAt: 'invalid-date',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('scheduledAt');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });
  });

  describe('required fields validation', () => {
    it('should fail validation when templateType is missing', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('templateType');
    });

    it('should fail validation when defaultChannel is missing', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        priority: 'NORMAL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('defaultChannel');
    });

    it('should fail validation when priority is missing', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        campaignName: 'Test Campaign',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
    });

    it('should fail validation when campaignName is missing', async () => {
      // Given
      const dto = plainToClass(SendBulkNotificationDto, {
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('campaignName');
    });
  });
});

describe('BulkRecipientDto', () => {
  describe('validation', () => {
    it('should pass validation with minimal valid data', async () => {
      // Given
      const dto = plainToClass(BulkRecipientDto, {
        recipientId: '550e8400-e29b-41d4-a716-446655440000',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with complete valid data', async () => {
      // Given
      const dto = plainToClass(BulkRecipientDto, {
        recipientId: '550e8400-e29b-41d4-a716-446655440000',
        variables: {
          clientName: 'Jean Dupont',
          appointmentDate: '23/09/2025',
        },
        channel: 'SMS',
        priority: 'HIGH',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid recipientId format', async () => {
      // Given
      const dto = plainToClass(BulkRecipientDto, {
        recipientId: 'invalid-uuid',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('recipientId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with invalid channel', async () => {
      // Given
      const dto = plainToClass(BulkRecipientDto, {
        recipientId: '550e8400-e29b-41d4-a716-446655440000',
        channel: 'INVALID_CHANNEL',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('channel');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid priority', async () => {
      // Given
      const dto = plainToClass(BulkRecipientDto, {
        recipientId: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'INVALID_PRIORITY',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});

describe('SegmentationCriteriaDto', () => {
  describe('validation', () => {
    it('should pass validation with empty criteria', async () => {
      // Given
      const dto = plainToClass(SegmentationCriteriaDto, {});

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid criteria', async () => {
      // Given
      const dto = plainToClass(SegmentationCriteriaDto, {
        userRole: ['CLIENT', 'STAFF'],
        businessId: ['550e8400-e29b-41d4-a716-446655440000'],
        lastActivityAfter: '2025-09-01T00:00:00.000Z',
        lastActivityBefore: '2025-09-22T23:59:59.999Z',
        preferredChannel: 'EMAIL',
        appointmentDateRange: {
          from: '2025-09-23T00:00:00.000Z',
          to: '2025-09-23T23:59:59.999Z',
        },
        includeInactive: false,
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid businessId format', async () => {
      // Given
      const dto = plainToClass(SegmentationCriteriaDto, {
        businessId: ['invalid-uuid'],
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('businessId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with invalid date format', async () => {
      // Given
      const dto = plainToClass(SegmentationCriteriaDto, {
        lastActivityAfter: 'invalid-date',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('lastActivityAfter');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation with invalid preferredChannel', async () => {
      // Given
      const dto = plainToClass(SegmentationCriteriaDto, {
        preferredChannel: 'INVALID_CHANNEL',
      });

      // When
      const errors = await validate(dto as object);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('preferredChannel');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
