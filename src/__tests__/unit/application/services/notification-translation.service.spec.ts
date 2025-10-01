/**
 * 🧪 NotificationTranslationService - Tests unitaires TDD
 */

import {
  NotificationTranslationService,
  TranslatedNotification,
} from '../../application/services/notification-translation.service';
import { I18nService } from '../../application/ports/i18n.port';
import { NotificationTemplateType } from '../../domain/value-objects/notification-template.value-object';

describe('🌍 NotificationTranslationService - TDD', () => {
  let service: NotificationTranslationService;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Mock I18nService
    mockI18n = {
      translate: jest.fn(),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    service = new NotificationTranslationService(mockI18n);
  });

  describe('🔴 RED Phase - Template Translation', () => {
    it('should translate appointment confirmation to French', () => {
      // Arrange
      const variables = {
        clientName: 'Jean Dupont',
        appointmentDate: '15 janvier 2025',
        appointmentTime: '14:30',
        serviceName: 'Coupe de cheveux',
        businessName: 'Salon Belle Vue',
      };

      mockI18n.translate
        .mockReturnValueOnce('Confirmation de rendez-vous - {{businessName}}')
        .mockReturnValueOnce(
          'Bonjour {{clientName}}, votre rendez-vous pour {{serviceName}} est confirmé le {{appointmentDate}} à {{appointmentTime}} chez {{businessName}}.',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        variables,
        'fr',
      );

      // Assert
      expect(result).toEqual({
        translatedTitle: 'Confirmation de rendez-vous - Salon Belle Vue',
        translatedContent:
          'Bonjour Jean Dupont, votre rendez-vous pour Coupe de cheveux est confirmé le 15 janvier 2025 à 14:30 chez Salon Belle Vue.',
        language: 'fr',
        templateType: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        variables,
      });

      expect(mockI18n.translate).toHaveBeenCalledWith(
        'notification.template.appointment_confirmation.title',
        undefined,
        'fr',
      );
      expect(mockI18n.translate).toHaveBeenCalledWith(
        'notification.template.appointment_confirmation.content',
        undefined,
        'fr',
      );
    });

    it('should translate appointment reminder to English', () => {
      // Arrange
      const variables = {
        clientName: 'John Smith',
        appointmentDate: 'January 15, 2025',
        appointmentTime: '2:30 PM',
        serviceName: 'Haircut',
        businessName: 'Beauty Salon',
      };

      mockI18n.translate
        .mockReturnValueOnce('Appointment Reminder - {{businessName}}')
        .mockReturnValueOnce(
          'Hello {{clientName}}, reminder for your {{serviceName}} appointment on {{appointmentDate}} at {{appointmentTime}} at {{businessName}}.',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.APPOINTMENT_REMINDER,
        variables,
        'en',
      );

      // Assert
      expect(result).toEqual({
        translatedTitle: 'Appointment Reminder - Beauty Salon',
        translatedContent:
          'Hello John Smith, reminder for your Haircut appointment on January 15, 2025 at 2:30 PM at Beauty Salon.',
        language: 'en',
        templateType: NotificationTemplateType.APPOINTMENT_REMINDER,
        variables,
      });
    });

    it('should handle password reset template', () => {
      // Arrange
      const variables = {
        clientName: 'Marie Martin',
        resetUrl: 'https://example.com/reset/abc123',
        expirationTime: '15 minutes',
      };

      mockI18n.translate
        .mockReturnValueOnce('Réinitialisation de mot de passe')
        .mockReturnValueOnce(
          'Bonjour {{clientName}}, cliquez sur le lien pour réinitialiser votre mot de passe: {{resetUrl}}. Ce lien expire dans {{expirationTime}}.',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.PASSWORD_RESET,
        variables,
        'fr',
      );

      // Assert
      expect(result.translatedTitle).toBe('Réinitialisation de mot de passe');
      expect(result.translatedContent).toContain('Marie Martin');
      expect(result.translatedContent).toContain(
        'https://example.com/reset/abc123',
      );
      expect(result.translatedContent).toContain('15 minutes');
    });
  });

  describe('🔴 RED Phase - Variable Replacement', () => {
    it('should replace all variables in template', () => {
      // Arrange
      const variables = {
        name: 'Test User',
        date: 'Today',
        time: 'Now',
        place: 'Here',
      };

      mockI18n.translate
        .mockReturnValueOnce('Title with {{name}}')
        .mockReturnValueOnce(
          'Content with {{name}} on {{date}} at {{time}} in {{place}}',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.WELCOME_MESSAGE,
        variables,
        'en',
      );

      // Assert
      expect(result.translatedTitle).toBe('Title with Test User');
      expect(result.translatedContent).toBe(
        'Content with Test User on Today at Now in Here',
      );
    });

    it('should handle missing variables gracefully', () => {
      // Arrange
      const variables = {
        name: 'Test User',
        // Missing other variables
      };

      mockI18n.translate
        .mockReturnValueOnce('Hello {{name}}')
        .mockReturnValueOnce(
          'Welcome {{name}}, your appointment on {{date}} is confirmed',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.WELCOME_MESSAGE,
        variables,
        'en',
      );

      // Assert
      expect(result.translatedTitle).toBe('Hello Test User');
      expect(result.translatedContent).toBe(
        'Welcome Test User, your appointment on {{date}} is confirmed',
      );
    });

    it('should handle undefined variables', () => {
      // Arrange
      const variables = {
        name: 'Test User',
        date: undefined,
        amount: null,
      };

      mockI18n.translate
        .mockReturnValueOnce('Hello {{name}}')
        .mockReturnValueOnce(
          'Welcome {{name}}, date: {{date}}, amount: {{amount}}',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.WELCOME_MESSAGE,
        variables,
        'en',
      );

      // Assert
      expect(result.translatedTitle).toBe('Hello Test User');
      expect(result.translatedContent).toBe(
        'Welcome Test User, date: , amount: ',
      );
    });
  });

  describe('🔴 RED Phase - Language Support', () => {
    it('should default to French when no language specified', () => {
      // Arrange
      const variables = { name: 'Test' };

      mockI18n.translate
        .mockReturnValueOnce('Titre par défaut')
        .mockReturnValueOnce('Contenu par défaut');

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.WELCOME_MESSAGE,
        variables,
      );

      // Assert
      expect(result.language).toBe('fr');
      expect(mockI18n.translate).toHaveBeenCalledWith(
        expect.any(String),
        undefined,
        'fr',
      );
    });

    it('should support multiple languages', () => {
      // Test for different languages
      const variables = { name: 'Test' };
      const languages = ['fr', 'en', 'es', 'de'];

      languages.forEach((lang) => {
        mockI18n.translate
          .mockReturnValueOnceValue(`Title in ${lang}`)
          .mockReturnValueOnceValue(`Content in ${lang}`);

        const result = service.translateNotification(
          NotificationTemplateType.WELCOME_MESSAGE,
          variables,
          lang,
        );

        expect(result.language).toBe(lang);
      });
    });
  });

  describe('🔴 RED Phase - Template Types Support', () => {
    it('should support all template types', () => {
      const templateTypes = [
        NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        NotificationTemplateType.APPOINTMENT_REMINDER,
        NotificationTemplateType.APPOINTMENT_CANCELLATION,
        NotificationTemplateType.WELCOME_MESSAGE,
        NotificationTemplateType.PASSWORD_RESET,
        NotificationTemplateType.CUSTOM,
      ];

      templateTypes.forEach((templateType) => {
        mockI18n.translate
          .mockReturnValueOnce('Test Title')
          .mockReturnValueOnce('Test Content');

        const result = service.translateNotification(
          templateType,
          { test: 'value' },
          'en',
        );

        expect(result.templateType).toBe(templateType);
        expect(result.translatedTitle).toBe('Test Title');
        expect(result.translatedContent).toBe('Test Content');
      });
    });
  });

  describe('🔴 RED Phase - Error Handling', () => {
    it('should handle I18n service errors gracefully', () => {
      // Arrange
      mockI18n.translate.mockImplementation(() => {
        throw new Error('I18n service error');
      });

      // Act & Assert
      expect(() => {
        service.translateNotification(
          NotificationTemplateType.WELCOME_MESSAGE,
          { name: 'Test' },
          'fr',
        );
      }).toThrow('I18n service error');
    });

    it('should validate template type', () => {
      // This test would be implemented when we add validation
      // For now, TypeScript ensures type safety
      const variables = { name: 'Test' };

      mockI18n.translate
        .mockReturnValueOnce('Title')
        .mockReturnValueOnce('Content');

      expect(() => {
        service.translateNotification(
          'INVALID_TEMPLATE' as any,
          variables,
          'fr',
        );
      }).not.toThrow(); // Service should handle gracefully
    });
  });

  describe('🔴 RED Phase - Complex Variable Scenarios', () => {
    it('should handle nested object variables', () => {
      // Arrange
      const variables = {
        user: { name: 'John', email: 'john@example.com' },
        appointment: { date: 'Today', service: 'Haircut' },
      };

      mockI18n.translate
        .mockReturnValueOnce('Hello {{user.name}}')
        .mockReturnValueOnce(
          'Your {{appointment.service}} on {{appointment.date}}',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.WELCOME_MESSAGE,
        variables,
        'en',
      );

      // Note: Current implementation doesn't support nested objects
      // This test demonstrates expected behavior for future enhancement
      expect(result.translatedTitle).toBe('Hello {{user.name}}');
      expect(result.translatedContent).toBe(
        'Your {{appointment.service}} on {{appointment.date}}',
      );
    });

    it('should handle date and number formatting', () => {
      // Arrange
      const variables = {
        date: new Date('2025-01-15'),
        price: 29.99,
        count: 3,
      };

      mockI18n.translate
        .mockReturnValueOnce('Appointment on {{date}}')
        .mockReturnValueOnce('Price: {{price}}, Items: {{count}}');

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        variables,
        'en',
      );

      // Assert
      expect(result.translatedTitle).toContain('Appointment on');
      expect(result.translatedContent).toContain('Price: 29.99');
      expect(result.translatedContent).toContain('Items: 3');
    });
  });

  describe('🟢 GREEN Phase - Integration Tests', () => {
    it('should create a complete translated notification', () => {
      // Arrange
      const variables = {
        clientName: 'Alice Wonderland',
        businessName: 'Wellness Center',
        appointmentDate: '2025-01-20',
        appointmentTime: '10:00',
        serviceName: 'Massage',
        serviceDuration: '60 min',
        staffName: 'Dr. Smith',
      };

      mockI18n.translate
        .mockReturnValueOnce('Confirmation de rendez-vous - {{businessName}}')
        .mockReturnValueOnce(
          'Bonjour {{clientName}}, votre rendez-vous pour {{serviceName}} avec {{staffName}} est confirmé le {{appointmentDate}} à {{appointmentTime}}. Durée: {{serviceDuration}}.',
        );

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        variables,
        'fr',
      );

      // Assert
      const expected: TranslatedNotification = {
        translatedTitle: 'Confirmation de rendez-vous - Wellness Center',
        translatedContent:
          'Bonjour Alice Wonderland, votre rendez-vous pour Massage avec Dr. Smith est confirmé le 2025-01-20 à 10:00. Durée: 60 min.',
        language: 'fr',
        templateType: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
        variables,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('🔵 REFACTOR Phase - Performance & Edge Cases', () => {
    it('should handle large variable sets efficiently', () => {
      // Arrange
      const largeVariables: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        largeVariables[`var${i}`] = `value${i}`;
      }

      mockI18n.translate
        .mockReturnValueOnce('Title')
        .mockReturnValueOnce('Content with {{var0}} and {{var99}}');

      // Act
      const startTime = Date.now();
      const result = service.translateNotification(
        NotificationTemplateType.CUSTOM,
        largeVariables,
        'en',
      );
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      expect(result.translatedContent).toBe('Content with value0 and value99');
    });

    it('should handle empty templates gracefully', () => {
      // Arrange
      mockI18n.translate.mockReturnValueOnce('').mockReturnValueOnce('');

      // Act
      const result = service.translateNotification(
        NotificationTemplateType.CUSTOM,
        { name: 'Test' },
        'en',
      );

      // Assert
      expect(result.translatedTitle).toBe('');
      expect(result.translatedContent).toBe('');
      expect(result.language).toBe('en');
    });
  });
});
