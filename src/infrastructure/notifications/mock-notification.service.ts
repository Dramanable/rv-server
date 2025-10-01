import { Injectable } from '@nestjs/common';
import { Logger } from '../../application/ports/logger.port';
import {
  BulkNotificationResult,
  INotificationService,
  NotificationChannel,
  NotificationMessage,
  NotificationPriority,
  NotificationResult,
  NotificationStatus,
  NotificationTemplate,
  NotificationType,
  TemplateValidationResult,
} from '../../application/ports/notification.port';

@Injectable()
export class MockNotificationService implements INotificationService {
  private readonly notificationsLog: Array<{
    timestamp: Date;
    notificationId: string;
    message: NotificationMessage;
    result: NotificationResult;
  }> = [];

  constructor(private readonly logger: Logger) {}

  async sendNotification(
    notification: NotificationMessage,
  ): Promise<NotificationResult> {
    await this.simulateDelay(100, 300);

    const notificationId = notification.id || this.generateNotificationId();
    const sentAt = new Date();

    const result: NotificationResult = {
      success: true,
      notificationId,
      sentAt,
      channel: notification.channel,
      deliveryId: `delivery-${notificationId}`,
    };

    this.notificationsLog.push({
      timestamp: sentAt,
      notificationId,
      message: notification,
      result,
    });

    this.logger.info('Mock Notification Sent', {
      recipientId: notification.recipientId,
      type: notification.type,
      channel: notification.channel,
      notificationId,
      totalNotificationsSent: this.notificationsLog.length,
    });

    return result;
  }

  async sendBulkNotifications(
    notifications: NotificationMessage[],
  ): Promise<BulkNotificationResult> {
    const processedAt = new Date();
    const batchId = `batch-${Date.now()}`;
    const results: NotificationResult[] = [];

    for (const notification of notifications) {
      try {
        const result = await this.sendNotification(notification);
        results.push(result);
      } catch (error) {
        const failedResult: NotificationResult = {
          success: false,
          notificationId: notification.id || this.generateNotificationId(),
          sentAt: new Date(),
          channel: notification.channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        results.push(failedResult);
      }
    }

    const totalSent = results.filter((r) => r.success).length;
    const totalFailed = results.filter((r) => !r.success).length;

    this.logger.info('Mock Bulk Notifications Sent', {
      batchId,
      totalSent,
      totalFailed,
      totalNotifications: notifications.length,
    });

    return {
      totalSent,
      totalFailed,
      results,
      batchId,
      processedAt,
    };
  }

  async getNotificationStatus(
    notificationId: string,
  ): Promise<NotificationStatus> {
    const logEntry = this.notificationsLog.find(
      (entry) => entry.notificationId === notificationId,
    );

    if (!logEntry) {
      return {
        notificationId,
        status: 'FAILED',
        error: 'Notification not found',
        attempts: 0,
      };
    }

    return {
      notificationId,
      status: logEntry.result.success ? 'DELIVERED' : 'FAILED',
      sentAt: logEntry.result.sentAt,
      deliveredAt: logEntry.result.success ? logEntry.result.sentAt : undefined,
      error: logEntry.result.error,
      attempts: 1,
      lastAttemptAt: logEntry.result.sentAt,
    };
  }

  async cancelNotification(notificationId: string): Promise<void> {
    const logEntry = this.notificationsLog.find(
      (entry) => entry.notificationId === notificationId,
    );

    if (
      logEntry &&
      logEntry.message.scheduledAt &&
      logEntry.message.scheduledAt > new Date()
    ) {
      this.logger.info('Mock Notification Cancelled', { notificationId });
    } else {
      this.logger.warn(
        'Cannot cancel notification - not found or already sent',
        { notificationId },
      );
    }
  }

  async validateTemplate(
    template: NotificationTemplate,
  ): Promise<TemplateValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingVariables: string[] = [];

    // Validation basique du template
    if (!template.content || template.content.trim().length === 0) {
      errors.push('Template content cannot be empty');
    }

    if (template.variables.length === 0) {
      warnings.push('Template has no variables defined');
    }

    // Vérifier les variables dans le contenu
    for (const variable of template.variables) {
      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      if (!variablePattern.test(template.content)) {
        missingVariables.push(variable);
      }
    }

    const isValid = errors.length === 0;

    this.logger.info('Mock Template Validation', {
      templateId: template.id,
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      missingVariablesCount: missingVariables.length,
    });

    return {
      isValid,
      errors,
      warnings,
      missingVariables,
    };
  }

  async sendAppointmentBookedNotification(
    recipientId: string,
    appointmentData: {
      appointmentId: string;
      clientName: string;
      serviceName: string;
      appointmentDate: string;
      appointmentTime: string;
    },
  ): Promise<NotificationResult> {
    return this.sendNotification({
      recipientId,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      channel: NotificationChannel.IN_APP,
      content: `Nouveau rendez-vous réservé par ${appointmentData.clientName} pour ${appointmentData.serviceName} le ${appointmentData.appointmentDate} à ${appointmentData.appointmentTime}`,
      priority: NotificationPriority.HIGH,
      subject: 'Nouveau rendez-vous',
      metadata: appointmentData,
    });
  }

  async sendAppointmentConfirmedNotification(
    recipientId: string,
    appointmentData: {
      appointmentId: string;
      serviceName: string;
      appointmentDate: string;
      appointmentTime: string;
    },
  ): Promise<NotificationResult> {
    return this.sendNotification({
      recipientId,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      channel: NotificationChannel.IN_APP,
      content: `Votre rendez-vous ${appointmentData.serviceName} du ${appointmentData.appointmentDate} à ${appointmentData.appointmentTime} a été confirmé`,
      priority: NotificationPriority.NORMAL,
      subject: 'Rendez-vous confirmé',
      metadata: appointmentData,
    });
  }

  async sendAppointmentCancelledNotification(
    recipientId: string,
    appointmentData: {
      appointmentId: string;
      serviceName: string;
      appointmentDate: string;
      appointmentTime: string;
      reason?: string;
    },
  ): Promise<NotificationResult> {
    return this.sendNotification({
      recipientId,
      type: NotificationType.APPOINTMENT_CANCELLATION,
      channel: NotificationChannel.IN_APP,
      content: `Votre rendez-vous ${appointmentData.serviceName} du ${appointmentData.appointmentDate} à ${appointmentData.appointmentTime} a été annulé${appointmentData.reason ? `. Motif: ${appointmentData.reason}` : ''}`,
      priority: NotificationPriority.HIGH,
      subject: 'Rendez-vous annulé',
      metadata: appointmentData,
    });
  }

  async sendAppointmentRescheduledNotification(
    recipientId: string,
    appointmentData: {
      appointmentId: string;
      serviceName: string;
      oldDate: string;
      oldTime: string;
      newDate: string;
      newTime: string;
    },
  ): Promise<NotificationResult> {
    return this.sendNotification({
      recipientId,
      type: NotificationType.APPOINTMENT_RESCHEDULE,
      channel: NotificationChannel.IN_APP,
      content: `Votre rendez-vous ${appointmentData.serviceName} a été reprogrammé du ${appointmentData.oldDate} à ${appointmentData.oldTime} vers le ${appointmentData.newDate} à ${appointmentData.newTime}`,
      priority: NotificationPriority.NORMAL,
      subject: 'Rendez-vous reprogrammé',
      metadata: appointmentData,
    });
  }

  async sendAppointmentReminderNotification(
    recipientId: string,
    appointmentData: {
      appointmentId: string;
      serviceName: string;
      appointmentDate: string;
      appointmentTime: string;
      practitionerName: string;
    },
  ): Promise<NotificationResult> {
    return this.sendNotification({
      recipientId,
      type: NotificationType.APPOINTMENT_REMINDER,
      channel: NotificationChannel.IN_APP,
      content: `Rappel: Vous avez rendez-vous demain pour ${appointmentData.serviceName} à ${appointmentData.appointmentTime} avec ${appointmentData.practitionerName}`,
      priority: NotificationPriority.NORMAL,
      subject: 'Rappel de rendez-vous',
      metadata: appointmentData,
    });
  }

  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private generateNotificationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `notif-${timestamp}-${random}`;
  }

  // Méthodes utilitaires pour les tests
  getSentNotifications(): Array<{
    timestamp: Date;
    notificationId: string;
    message: NotificationMessage;
    result: NotificationResult;
  }> {
    return [...this.notificationsLog];
  }

  getNotificationsForRecipient(recipientId: string): Array<{
    timestamp: Date;
    notificationId: string;
    message: NotificationMessage;
    result: NotificationResult;
  }> {
    return this.notificationsLog.filter(
      (entry) => entry.message.recipientId === recipientId,
    );
  }

  clearSentNotifications(): void {
    this.notificationsLog.length = 0;
    this.logger.info('Mock Notification Log cleared');
  }

  getSentNotificationsCount(): number {
    return this.notificationsLog.length;
  }
}
