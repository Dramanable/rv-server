/**
 * 🧪 NotificationTranslationService - Tests unitaires simplifiés
 */

import { NotificationTranslationService } from '../../../../application/services/notification-translation.service';
import { I18nService } from '../../../../application/ports/i18n.port';
import { NotificationTemplateType } from '../../../../domain/value-objects/notification-template.value-object';

describe('🌍 NotificationTranslationService - Simple Tests', () => {
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

  describe('Basic Translation', () => {
    it('should translate simple text', () => {
      // Arrange
      mockI18n.translate.mockReturnValue('Texte traduit');

      // Act
      const result = service.translateNotification(
        'Simple text',
        'Content to translate',
        'fr',
      );

      // Assert
      expect(result.title).toBe('Simple text');
      expect(result.content).toBe('Content to translate');
      expect(result.language).toBe('fr');
    });

    it('should use template translation when templateType provided', () => {
      // Arrange
      mockI18n.translate
        .mockReturnValueOnce('Confirmation de rendez-vous')
        .mockReturnValueOnce('Votre rendez-vous est confirmé');

      // Act
      const result = service.translateNotification(
        'Appointment Confirmation',
        'Your appointment is confirmed',
        'fr',
        {
          templateType: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
          variables: { clientName: 'Jean' },
        },
      );

      // Assert
      expect(result.title).toBe('Confirmation de rendez-vous');
      expect(result.content).toBe('Votre rendez-vous est confirmé');
      expect(result.language).toBe('fr');
      expect(mockI18n.translate).toHaveBeenCalledWith(
        'notifications.templates.appointment_confirmation.title',
        { clientName: 'Jean' },
        'fr',
      );
    });

    it('should replace variables in text', () => {
      // Arrange & Act
      const result = service.translateNotification(
        'Hello {{name}}',
        'Welcome {{name}}, your appointment is on {{date}}',
        'en',
        {
          variables: { name: 'John', date: 'Monday' },
        },
      );

      // Assert
      expect(result.title).toBe('Hello John');
      expect(result.content).toBe(
        'Welcome John, your appointment is on Monday',
      );
    });
  });

  describe('Language Support', () => {
    it('should return supported languages', () => {
      const languages = service.getSupportedLanguages();
      expect(languages).toEqual(['fr', 'en']);
    });

    it('should check if language is supported', () => {
      expect(service.isLanguageSupported('fr')).toBe(true);
      expect(service.isLanguageSupported('en')).toBe(true);
      expect(service.isLanguageSupported('es')).toBe(false);
    });

    it('should return default language', () => {
      expect(service.getDefaultLanguage()).toBe('fr');
    });
  });
});
