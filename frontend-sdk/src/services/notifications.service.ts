/**
 * 📢 RV Project Frontend SDK - Service de Notifications
 *
 * Gestion des notifications multi-canaux (Email, SMS, Push, In-App)
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface Notification {
  readonly id: string;
  readonly recipientId: string;
  readonly title: string;
  readonly content: string;
  readonly channel: NotificationChannel;
  readonly priority: NotificationPriority;
  readonly status: NotificationStatus;
  readonly scheduledFor?: string;
  readonly sentAt?: string;
  readonly deliveredAt?: string;
  readonly readAt?: string;
  readonly metadata?: Record<string, any>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SendNotificationRequest {
  readonly recipientId: string;
  readonly title: string;
  readonly content: string;
  readonly channel: NotificationChannel;
  readonly priority?: NotificationPriority;
  readonly scheduledFor?: string;
  readonly metadata?: Record<string, any>;
}

export interface ListNotificationsRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly channel?: NotificationChannel;
  readonly priority?: NotificationPriority;
  readonly status?: NotificationStatus;
  readonly recipientId?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export class NotificationService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📤 Envoyer une notification
   */
  async send(request: SendNotificationRequest): Promise<Notification> {
    const response = await this.client.post<Notification>(
      '/api/v1/notifications/send',
      request,
    );
    return response.data;
  }

  /**
   * 📤 Envoi rapide de notification
   */
  async quickSend(
    recipientId: string,
    title: string,
    content: string,
    channel: NotificationChannel = NotificationChannel.EMAIL,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ): Promise<Notification> {
    return this.send({
      recipientId,
      title,
      content,
      channel,
      priority,
    });
  }

  /**
   * 📨 Envoyer une notification par email
   */
  async sendEmail(
    recipientId: string,
    title: string,
    content: string,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ): Promise<Notification> {
    return this.send({
      recipientId,
      title,
      content,
      channel: NotificationChannel.EMAIL,
      priority,
    });
  }

  /**
   * 📱 Envoyer une notification SMS
   */
  async sendSMS(
    recipientId: string,
    content: string,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ): Promise<Notification> {
    return this.send({
      recipientId,
      title: 'SMS Notification',
      content,
      channel: NotificationChannel.SMS,
      priority,
    });
  }

  /**
   * 📋 Lister les notifications avec filtres
   */
  async list(
    request: ListNotificationsRequest = {},
  ): Promise<PaginatedResponse<Notification>> {
    const response = await this.client.post<PaginatedResponse<Notification>>(
      '/api/v1/notifications/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir une notification par ID
   */
  async getById(id: string): Promise<Notification> {
    const response = await this.client.get<Notification>(
      `/api/v1/notifications/${id}`,
    );
    return response.data;
  }

  /**
   * ✅ Marquer une notification comme lue
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await this.client.patch<Notification>(
      `/api/v1/notifications/${id}/read`,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer une notification
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/notifications/${id}`);
  }

  /**
   * 📬 Obtenir les notifications non lues d'un utilisateur
   */
  async getUnread(
    recipientId: string,
    limit: number = 50,
  ): Promise<readonly Notification[]> {
    const response = await this.list({
      recipientId,
      status: NotificationStatus.SENT,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return response.data;
  }

  /**
   * 🔄 Réessayer une notification échouée
   */
  async retry(id: string): Promise<Notification> {
    const response = await this.client.post<Notification>(
      `/api/v1/notifications/${id}/retry`,
    );
    return response.data;
  }

  /**
   * ❌ Annuler une notification programmée
   */
  async cancel(id: string): Promise<void> {
    await this.client.post(`/api/v1/notifications/${id}/cancel`);
  }

  /**
   * 🏃‍♂️ Envoyer une notification de rappel de rendez-vous
   */
  async sendAppointmentReminder(
    recipientId: string,
    appointmentId: string,
    appointmentDate: Date,
    businessName: string,
    channel: NotificationChannel = NotificationChannel.EMAIL,
  ): Promise<Notification> {
    const title = `Rappel de rendez-vous - ${businessName}`;
    const content = `Votre rendez-vous est prévu le ${appointmentDate.toLocaleDateString()} à ${appointmentDate.toLocaleTimeString()}.`;

    return this.send({
      recipientId,
      title,
      content,
      channel,
      priority: NotificationPriority.HIGH,
      metadata: {
        type: 'appointment_reminder',
        appointmentId,
        businessName,
        appointmentDate: appointmentDate.toISOString(),
      },
    });
  }

  /**
   * 🎉 Envoyer une notification de confirmation de rendez-vous
   */
  async sendAppointmentConfirmation(
    recipientId: string,
    appointmentId: string,
    appointmentDate: Date,
    businessName: string,
    serviceName: string,
  ): Promise<Notification> {
    const title = `Confirmation de rendez-vous - ${businessName}`;
    const content = `Votre rendez-vous pour ${serviceName} est confirmé le ${appointmentDate.toLocaleDateString()} à ${appointmentDate.toLocaleTimeString()}.`;

    return this.send({
      recipientId,
      title,
      content,
      channel: NotificationChannel.EMAIL,
      priority: NotificationPriority.NORMAL,
      metadata: {
        type: 'appointment_confirmation',
        appointmentId,
        businessName,
        serviceName,
        appointmentDate: appointmentDate.toISOString(),
      },
    });
  }

  /**
   * 📬 Send bulk notifications (Campaign)
   * Endpoint: POST /api/v1/notifications/bulk
   */
  async sendBulkNotifications(request: {
    title: string;
    content: string;
    channel: NotificationChannel;
    priority?: NotificationPriority;
    recipientIds?: string[];
    recipientFilters?: {
      businessId?: string;
      userRole?: string;
      location?: string;
      tags?: string[];
    };
    scheduledAt?: string; // ISO date
    metadata?: Record<string, any>;
  }): Promise<{
    campaignId: string;
    estimatedRecipients: number;
    status: 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
  }> {
    const response = await this.client.post<{
      campaignId: string;
      estimatedRecipients: number;
      status: 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
      createdAt: string;
    }>('/api/v1/notifications/bulk', request);
    return response.data;
  }

  /**
   * 📊 Get campaign status
   * Endpoint: GET /api/v1/notifications/campaigns/{campaignId}/status
   */
  async getCampaignStatus(campaignId: string): Promise<{
    campaignId: string;
    status: 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    title: string;
    channel: NotificationChannel;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    startedAt?: string;
    completedAt?: string;
    estimatedCompletion?: string;
    errorMessage?: string;
  }> {
    const response = await this.client.get<{
      campaignId: string;
      status: 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
      title: string;
      channel: NotificationChannel;
      totalRecipients: number;
      sentCount: number;
      deliveredCount: number;
      failedCount: number;
      startedAt?: string;
      completedAt?: string;
      estimatedCompletion?: string;
      errorMessage?: string;
    }>(`/api/v1/notifications/campaigns/${campaignId}/status`);
    return response.data;
  }

  /**
   * 🛑 Cancel campaign
   * Endpoint: DELETE /api/v1/notifications/campaigns/{campaignId}
   */
  async cancelCampaign(campaignId: string): Promise<{
    success: boolean;
    message: string;
    campaignId: string;
    cancelledAt: string;
  }> {
    const response = await this.client.delete<{
      success: boolean;
      message: string;
      campaignId: string;
      cancelledAt: string;
    }>(`/api/v1/notifications/campaigns/${campaignId}`);
    return response.data;
  }

  /**
   * 📈 Get notification analytics
   * Endpoint: GET /api/v1/notifications/analytics
   */
  async getAnalytics(filters?: {
    businessId?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    channel?: NotificationChannel;
    status?: NotificationStatus;
  }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    byChannel: Record<
      NotificationChannel,
      {
        sent: number;
        delivered: number;
        failed: number;
        deliveryRate: number;
      }
    >;
    byDate: Array<{
      date: string;
      sent: number;
      delivered: number;
      failed: number;
    }>;
    topFailureReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    averageDeliveryTime: number; // in seconds
    campaignSummary: {
      totalCampaigns: number;
      activeCampaigns: number;
      completedCampaigns: number;
      failedCampaigns: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (filters?.businessId) queryParams.set('businessId', filters.businessId);
    if (filters?.startDate) queryParams.set('startDate', filters.startDate);
    if (filters?.endDate) queryParams.set('endDate', filters.endDate);
    if (filters?.channel) queryParams.set('channel', filters.channel);
    if (filters?.status) queryParams.set('status', filters.status);

    const url = `/api/v1/notifications/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await this.client.get<{
      totalSent: number;
      totalDelivered: number;
      totalFailed: number;
      deliveryRate: number;
      byChannel: Record<
        NotificationChannel,
        {
          sent: number;
          delivered: number;
          failed: number;
          deliveryRate: number;
        }
      >;
      byDate: Array<{
        date: string;
        sent: number;
        delivered: number;
        failed: number;
      }>;
      topFailureReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
      }>;
      averageDeliveryTime: number;
      campaignSummary: {
        totalCampaigns: number;
        activeCampaigns: number;
        completedCampaigns: number;
        failedCampaigns: number;
      };
    }>(url);
    return response.data;
  }
}

export default NotificationService;
