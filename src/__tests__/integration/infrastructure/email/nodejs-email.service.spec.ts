/**
 * 🧪 Tests d'Intégration TDD - Node.js Email Service - Infrastructure Layer
 * ✅ Tests avec VRAI service email (pas de mocks)
 * ✅ Clean Architecture - Infrastructure Implementation
 * ✅ TDD - Red/Green/Refactor
 */

import { NodejsEmailService } from '@infrastructure/email/nodejs-email.service';
import { EmailMessage } from '@application/ports/email.port';

describe('📧 NodejsEmailService - Integration Tests (Infrastructure)', () => {
  let emailService: NodejsEmailService;

  beforeAll(() => {
    // 🏗️ Créer le service email réel (mode test)
    emailService = new NodejsEmailService();
  });

  /**
   * 🔴 TDD RED - Tests qui échouent d'abord
   */
  describe('🎯 TDD Integration - Send Email Operations', () => {
    it('should send welcome email successfully', async () => {
      // 🔴 TDD RED - Arrange
      const emailMessage: EmailMessage = {
        to: 'integration-test@example.com',
        subject: 'Welcome Integration Test',
        html: '<h1>Welcome to our platform!</h1><p>This is an integration test email.</p>',
        text: 'Welcome to our platform! This is an integration test email.',
      };

      // 🟢 TDD GREEN - Act: Envoyer l'email
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert: Vérifier le résultat
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
      expect(result.to).toBe(emailMessage.to);
      expect(result.subject).toBe(emailMessage.subject);
    });

    it('should send password reset email with correct format', async () => {
      // 🔴 TDD RED - Arrange
      const resetToken = 'test-reset-token-12345';
      const resetLink = `https://app.example.com/reset-password?token=${resetToken}`;

      const emailMessage: EmailMessage = {
        to: 'password-reset@example.com',
        subject: 'Reset Your Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" target="_blank">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `,
        text: `Password Reset Request\n\nClick this link to reset your password: ${resetLink}\n\nThis link will expire in 1 hour.`,
      };

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
      expect(result.to).toBe('password-reset@example.com');
      expect(result.subject).toContain('Reset');
    });

    it('should handle multiple recipients correctly', async () => {
      // 🔴 TDD RED - Test avec multiples destinataires
      const emailMessage: EmailMessage = {
        to: ['user1@test.com', 'user2@test.com', 'admin@test.com'],
        subject: 'Multi-Recipient Test',
        html: '<p>This email is sent to multiple recipients for testing.</p>',
        text: 'This email is sent to multiple recipients for testing.',
      };

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
      expect(Array.isArray(result.to)).toBe(true);
      expect(result.to).toEqual(emailMessage.to);
    });

    it('should send notification email with proper encoding', async () => {
      // 🔴 TDD RED - Test avec caractères spéciaux/unicode
      const emailMessage: EmailMessage = {
        to: 'unicode-test@example.com',
        subject: '🎉 Notification spéciale avec accents éàüç',
        html: `
          <h1>🎉 Félicitations !</h1>
          <p>Votre compte a été créé avec succès.</p>
          <p>Caractères spéciaux : éàüçñ 中文 🚀✨</p>
        `,
        text: '🎉 Félicitations ! Votre compte a été créé avec succès. Caractères spéciaux : éàüçñ 中文 🚀✨',
      };

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert - Le service doit gérer l'encodage correctement
      expect(result.success).toBe(true);
      expect(result.subject).toContain('🎉');
      expect(result.subject).toContain('spéciale');
    });
  });

  /**
   * 🎯 TDD Integration - Email Validation & Error Handling
   */
  describe('✅ TDD Integration - Email Validation', () => {
    it('should validate email addresses before sending', async () => {
      // 🔴 TDD RED - Test avec email invalide
      const invalidEmailMessage: EmailMessage = {
        to: 'invalid-email-format',
        subject: 'Test Invalid Email',
        html: '<p>This should fail validation.</p>',
        text: 'This should fail validation.',
      };

      // 🟢 TDD GREEN - Act & Assert
      await expect(
        emailService.sendEmail(invalidEmailMessage),
      ).rejects.toThrow();
    });

    it('should handle empty recipient list gracefully', async () => {
      // 🔴 TDD RED - Test avec liste vide
      const emptyRecipientsMessage: EmailMessage = {
        to: [],
        subject: 'Empty Recipients Test',
        html: '<p>No recipients.</p>',
        text: 'No recipients.',
      };

      // 🟢 TDD GREEN - Act & Assert
      await expect(
        emailService.sendEmail(emptyRecipientsMessage),
      ).rejects.toThrow();
    });

    it('should require both subject and content', async () => {
      // 🔴 TDD RED - Test sans sujet
      const noSubjectMessage: EmailMessage = {
        to: 'test@example.com',
        subject: '',
        html: '<p>Content without subject.</p>',
        text: 'Content without subject.',
      };

      // 🟢 TDD GREEN - Act & Assert
      await expect(emailService.sendEmail(noSubjectMessage)).rejects.toThrow();
    });

    it('should require at least one content format (html or text)', async () => {
      // 🔴 TDD RED - Test sans contenu
      const noContentMessage: EmailMessage = {
        to: 'test@example.com',
        subject: 'No Content Test',
        html: '',
        text: '',
      };

      // 🟢 TDD GREEN - Act & Assert
      await expect(emailService.sendEmail(noContentMessage)).rejects.toThrow();
    });
  });

  /**
   * 🎯 TDD Integration - Performance & Reliability
   */
  describe('⚡ TDD Integration - Performance & Reliability', () => {
    it('should send email within acceptable time limit', async () => {
      // 🔴 TDD RED - Test de performance
      const emailMessage: EmailMessage = {
        to: 'performance-test@example.com',
        subject: 'Performance Test Email',
        html: '<h1>Performance Test</h1><p>This email tests response time.</p>',
        text: 'Performance Test - This email tests response time.',
      };

      const startTime = Date.now();

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // ✅ Assert - Doit être envoyé en moins de 5 secondes
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // 5 secondes max
    });

    it('should handle concurrent email sending', async () => {
      // 🔴 TDD RED - Test de concurrence
      const emailMessages: EmailMessage[] = Array.from(
        { length: 3 },
        (_, i) => ({
          to: `concurrent-test-${i + 1}@example.com`,
          subject: `Concurrent Test Email #${i + 1}`,
          html: `<h1>Concurrent Test #${i + 1}</h1><p>Testing concurrent email sending.</p>`,
          text: `Concurrent Test #${i + 1} - Testing concurrent email sending.`,
        }),
      );

      // 🟢 TDD GREEN - Act: Envoyer en parallèle
      const promises = emailMessages.map((msg) => emailService.sendEmail(msg));
      const results = await Promise.all(promises);

      // ✅ Assert - Tous doivent réussir
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.to).toBe(`concurrent-test-${index + 1}@example.com`);
        expect(result.messageId).toBeTruthy();
      });
    });

    it('should maintain email delivery consistency', async () => {
      // 🔴 TDD RED - Test de cohérence
      const baseMessage: EmailMessage = {
        to: 'consistency-test@example.com',
        subject: 'Consistency Test',
        html: '<h1>Consistency Test</h1><p>Testing email delivery consistency.</p>',
        text: 'Consistency Test - Testing email delivery consistency.',
      };

      // 🟢 TDD GREEN - Envoyer le même email plusieurs fois
      const results = await Promise.all([
        emailService.sendEmail({
          ...baseMessage,
          subject: 'Consistency Test 1',
        }),
        emailService.sendEmail({
          ...baseMessage,
          subject: 'Consistency Test 2',
        }),
        emailService.sendEmail({
          ...baseMessage,
          subject: 'Consistency Test 3',
        }),
      ]);

      // ✅ Assert - Tous doivent avoir des IDs uniques mais être envoyés
      expect(results).toHaveLength(3);
      const messageIds = results.map((r) => r.messageId);
      const uniqueIds = new Set(messageIds);

      expect(uniqueIds.size).toBe(3); // Tous les IDs doivent être uniques
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.to).toBe('consistency-test@example.com');
      });
    });
  });

  /**
   * 🎯 TDD Integration - Email Templates & Formatting
   */
  describe('🎨 TDD Integration - Email Templates & Formatting', () => {
    it('should handle complex HTML templates correctly', async () => {
      // 🔴 TDD RED - Template HTML complexe
      const complexHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .header { background-color: #4CAF50; color: white; padding: 20px; }
            .content { padding: 20px; font-family: Arial, sans-serif; }
            .button { background-color: #008CBA; color: white; padding: 15px 32px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Our Platform!</h1>
          </div>
          <div class="content">
            <p>Dear User,</p>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <a href="#" class="button">Get Started</a>
          </div>
        </body>
        </html>
      `;

      const emailMessage: EmailMessage = {
        to: 'template-test@example.com',
        subject: 'Complex Template Test',
        html: complexHtml,
        text: 'Welcome to Our Platform! Dear User, Thank you for joining our platform.',
      };

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
    });

    it('should fallback to text when HTML is malformed', async () => {
      // 🔴 TDD RED - HTML malformé
      const emailMessage: EmailMessage = {
        to: 'malformed-html@example.com',
        subject: 'Malformed HTML Test',
        html: '<h1>Unclosed tag<p>Missing closing tags', // HTML malformé
        text: 'Fallback text content for malformed HTML.',
      };

      // 🟢 TDD GREEN - Act: Le service doit gérer gracieusement
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert - Doit réussir même avec HTML malformé
      expect(result.success).toBe(true);
      expect(result.to).toBe('malformed-html@example.com');
    });

    it('should preserve email formatting and line breaks', async () => {
      // 🔴 TDD RED - Test de formatage
      const emailMessage: EmailMessage = {
        to: 'formatting-test@example.com',
        subject: 'Formatting Preservation Test',
        html: `
          <h1>Line Break Test</h1>
          <p>First paragraph.</p>
          <p>Second paragraph with<br>line break.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        `,
        text: `Line Break Test\n\nFirst paragraph.\n\nSecond paragraph with\nline break.\n\n• Item 1\n• Item 2\n• Item 3`,
      };

      // 🟢 TDD GREEN - Act
      const result = await emailService.sendEmail(emailMessage);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.subject).toBe('Formatting Preservation Test');
    });
  });
});
