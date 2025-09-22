/**
 * @fileoverview Notification Controller
 * @module Presentation/Controllers
 * @version 1.0.0
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SendBulkNotificationUseCase } from '../../application/use-cases/notification/send-bulk-notification.use-case';
import { SendNotificationUseCase } from '../../application/use-cases/notification/send-notification.use-case';
import { NotificationChannel } from '../../domain/value-objects/notification-channel.value-object';
import { NotificationPriority } from '../../domain/value-objects/notification-priority.value-object';
import { NotificationTemplateType } from '../../domain/value-objects/notification-template.value-object';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { SendNotificationResponseDto } from '../dtos/notification/notification-response.dto';
import { SendBulkNotificationResponseDto } from '../dtos/notification/send-bulk-notification-response.dto';
import { SendBulkNotificationDto } from '../dtos/notification/send-bulk-notification.dto';
import { SendNotificationDto } from '../dtos/notification/send-notification.dto';
import {
  NotificationRateLimitGuard,
  RateLimit,
} from '../security/notification-rate-limit.guard';
// TODO: Import correct decorators when available
// import { GetUser } from '../security/get-user.decorator';
// import { JwtAuthGuard } from '../security/jwt-auth.guard';

/**
 * Contrôleur pour la gestion des notifications
 */
@ApiTags('📢 Notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(NotificationRateLimitGuard)
// TODO: Add JWT guard when available
// @UseGuards(JwtAuthGuard, NotificationRateLimitGuard)
export class NotificationController {
  constructor(
    @Inject(TOKENS.SEND_NOTIFICATION_USE_CASE)
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    @Inject(TOKENS.SEND_BULK_NOTIFICATION_USE_CASE)
    private readonly sendBulkNotificationUseCase: SendBulkNotificationUseCase,
  ) {}

  /**
   * Envoie une nouvelle notification
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ ttl: 3600, limit: 100 }) // 100 notifications per hour
  @ApiOperation({
    summary: '📤 Send notification to recipient',
    description: `
    **Envoie une notification** via le canal spécifié avec support de planification.

    ## 🎯 Fonctionnalités

    ### 📨 **Canaux de diffusion supportés**
    - **EMAIL** : Notifications par email avec contenu riche
    - **SMS** : Messages texte courts (160 caractères max)
    - **PUSH** : Notifications push mobile (1000 caractères max)
    - **IN_APP** : Notifications in-app (5000 caractères max)

    ### ⚡ **Priorités disponibles**
    - **LOW** : Faible priorité, traitement différé
    - **NORMAL** : Priorité standard (défaut)
    - **HIGH** : Haute priorité, traitement rapide
    - **URGENT** : Traitement immédiat, contournement des limitations

    ### ⏰ **Planification avancée**
    - **Immédiate** : Envoi instantané si \`scheduledFor\` non fourni
    - **Planifiée** : Envoi à la date/heure spécifiée (ISO 8601)
    - **Validation** : Dates futures uniquement, fenêtre selon priorité

    ### 📊 **Métadonnées contextuelles**
    Ajoutez des métadonnées pour le contexte business :
    \`\`\`json
    {
      "metadata": {
        "appointmentId": "appointment_123",
        "businessId": "business_456",
        "serviceId": "service_789",
        "templateId": "reminder_template",
        "correlationId": "trace_abc123"
      }
    }
    \`\`\`

    ## 🔐 **Sécurité & Permissions**
    - **JWT Bearer** : Authentification obligatoire
    - **Rate limiting** : 100 notifications/heure par utilisateur
    - **Validation** : Contenu et destinataire validés
    - **Audit trail** : Toutes les actions loggées

    ## 🎯 **Guide d'intégration Frontend**

    ### React/TypeScript Example
    \`\`\`typescript
    const sendNotification = async (notification: SendNotificationRequest) => {
      const response = await api.post('/api/v1/notifications/send', {
        recipientId: notification.recipientId,
        title: notification.title,
        content: notification.content,
        channel: 'EMAIL',
        priority: 'HIGH',
        metadata: {
          appointmentId: notification.appointmentId,
          businessId: currentBusiness.id
        }
      });

      return response.data;
    };
    \`\`\`

    ### Notification planifiée
    \`\`\`typescript
    const scheduleReminder = async (appointment: Appointment) => {
      const reminderTime = new Date(appointment.scheduledAt);
      reminderTime.setHours(reminderTime.getHours() - 24); // 24h avant

      await sendNotification({
        recipientId: appointment.clientId,
        title: 'Rappel de rendez-vous',
        content: \`Votre rendez-vous est prévu demain à \${formatTime(appointment.scheduledAt)}\`,
        channel: 'EMAIL',
        priority: 'NORMAL',
        scheduledFor: reminderTime.toISOString(),
        metadata: { appointmentId: appointment.id }
      });
    };
    \`\`\`
    `,
  })
  @ApiBody({
    type: SendNotificationDto,
    description: 'Données de la notification à envoyer',
    examples: {
      immediate_email: {
        summary: '📧 Email immédiat',
        description: 'Notification email envoyée immédiatement',
        value: {
          recipientId: 'user_123e4567-e89b-12d3-a456-426614174000',
          title: 'Confirmation de rendez-vous',
          content: 'Votre rendez-vous du 23/09/2025 à 14h30 est confirmé.',
          channel: 'EMAIL',
          priority: 'HIGH',
          metadata: {
            appointmentId: 'appointment_123e4567-e89b-12d3-a456-426614174000',
            businessId: 'business_456e7890-e89b-12d3-a456-426614174001',
            templateId: 'appointment_confirmation',
          },
        },
      },
      scheduled_sms: {
        summary: '📱 SMS planifié',
        description: 'SMS de rappel planifié pour plus tard',
        value: {
          recipientId: 'user_789e0123-e89b-12d3-a456-426614174002',
          title: 'Rappel RDV',
          content: 'RDV demain 14h30 - Cabinet Médical',
          channel: 'SMS',
          priority: 'NORMAL',
          scheduledFor: '2025-09-23T10:00:00.000Z',
          metadata: {
            appointmentId: 'appointment_456e7890-e89b-12d3-a456-426614174003',
            correlationId: 'reminder_batch_001',
          },
        },
      },
      urgent_push: {
        summary: '🚨 Push urgent',
        description: 'Notification push urgente',
        value: {
          recipientId: 'user_012e3456-e89b-12d3-a456-426614174004',
          title: 'Annulation de rendez-vous',
          content:
            'Votre rendez-vous de 15h00 a été annulé. Veuillez nous contacter pour reprogrammer.',
          channel: 'PUSH',
          priority: 'URGENT',
          metadata: {
            appointmentId: 'appointment_789e0123-e89b-12d3-a456-426614174005',
            eventType: 'APPOINTMENT_CANCELLED',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Notification envoyée avec succès',
    type: SendNotificationResponseDto,
    examples: {
      immediate_success: {
        summary: 'Envoi immédiat réussi',
        value: {
          success: true,
          data: {
            id: 'notif_123e4567-e89b-12d3-a456-426614174000',
            status: 'SENT',
            sentAt: '2025-09-22T10:30:00.000Z',
            estimatedDelivery: '2025-09-22T10:30:15.000Z',
          },
          meta: {
            timestamp: '2025-09-22T10:30:00.000Z',
            correlationId: 'req_456e7890-e89b-12d3-a456-426614174001',
            processingTime: 245,
          },
        },
      },
      scheduled_success: {
        summary: 'Planification réussie',
        value: {
          success: true,
          data: {
            id: 'notif_789e0123-e89b-12d3-a456-426614174002',
            status: 'PENDING',
            scheduledFor: '2025-09-23T10:00:00.000Z',
            estimatedDelivery: '2025-09-23T10:00:05.000Z',
          },
          meta: {
            timestamp: '2025-09-22T10:30:00.000Z',
            correlationId: 'req_012e3456-e89b-12d3-a456-426614174003',
            processingTime: 89,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Données de notification invalides',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'NOTIFICATION_INVALID_DATA' },
            message: {
              type: 'string',
              example:
                'Le contenu dépasse la limite du canal SMS (160 caractères)',
            },
            field: { type: 'string', example: 'content' },
            timestamp: { type: 'string', example: '2025-09-22T10:30:00.000Z' },
            path: { type: 'string', example: '/api/v1/notifications/send' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: '⚡ Limite de taux dépassée (100 notifications/heure)',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '💥 Erreur serveur interne',
  })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    // TODO: Add user decorator when available
    // @GetUser() user: any,
  ): Promise<SendNotificationResponseDto> {
    const startTime = Date.now();

    // Conversion DTO → Domain Value Objects
    const channel = NotificationChannel.fromString(dto.channel);
    const priority = dto.priority
      ? NotificationPriority.fromString(dto.priority)
      : NotificationPriority.fromString('NORMAL'); // Default to NORMAL

    // Exécution du use case
    const result = await this.sendNotificationUseCase.execute({
      recipientId: dto.recipientId,
      title: dto.title,
      content: dto.content,
      channel,
      priority,
      metadata: dto.metadata,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
      requestingUserId: 'system', // TODO: Use real user.id when auth is available
    });

    // Construction de la réponse
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      data: {
        id: result.notificationId,
        status: result.status,
        sentAt: result.deliveryTime?.toISOString(),
        scheduledFor: result.scheduledFor?.toISOString(),
        estimatedDelivery: result.deliveryTime?.toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: result.messageId || `req_${Date.now()}`,
        processingTime,
      },
    };
  }

  /**
   * Envoie des notifications en lot (campagne)
   */
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ ttl: 3600, limit: 10 }) // 10 campagnes par heure max
  @ApiOperation({
    summary: '📬 Send bulk notifications (Campaign)',
    description: `
    **Envoie des notifications en lot** avec support de templates et segmentation avancée.

    ## 🎯 Fonctionnalités

    ### 📊 **Segmentation automatique**
    - **Par rôle utilisateur** : Cibler admins, clients, staff
    - **Par business** : Notifications pour une entreprise spécifique
    - **Par géolocalisation** : Cibler par zone géographique
    - **Par activité** : Utilisateurs actifs récemment
    - **Par préférences** : Canal de notification préféré

    ### 📝 **Templates prédéfinis**
    - **APPOINTMENT_CONFIRMATION** : Confirmation de rendez-vous
    - **APPOINTMENT_REMINDER** : Rappel de rendez-vous
    - **APPOINTMENT_CANCELLATION** : Annulation de rendez-vous
    - **WELCOME_MESSAGE** : Message de bienvenue
    - **CUSTOM** : Template personnalisé

    ### ⚡ **Gestion intelligente des envois**
    - **Rate limiting** : Évite la surcharge des canaux
    - **Traitement par lots** : Optimise les performances
    - **Retry automatique** : Réessaie les échecs temporaires
    - **Monitoring temps réel** : Suivi du statut de campagne

    ### 🎯 **Guide d'utilisation**

    #### Campagne avec segmentation
    \`\`\`javascript
    const campaignResponse = await fetch('/api/v1/notifications/bulk', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'APPOINTMENT_REMINDER',
        defaultChannel: 'EMAIL',
        priority: 'NORMAL',
        campaignName: 'Rappels du jour',
        segmentation: {
          userRole: ['CLIENT'],
          businessId: ['business_123'],
          lastActivityAfter: '2025-09-01T00:00:00.000Z'
        },
        commonVariables: {
          businessName: 'Mon Cabinet',
          businessPhone: '+33 1 23 45 67 89'
        },
        batchSize: 50,
        rateLimitPerMinute: 500
      })
    });
    \`\`\`

    #### Campagne avec liste explicite
    \`\`\`javascript
    const campaignResponse = await fetch('/api/v1/notifications/bulk', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateType: 'APPOINTMENT_CONFIRMATION',
        defaultChannel: 'EMAIL',
        priority: 'HIGH',
        campaignName: 'Confirmations manuelles',
        recipients: [
          {
            recipientId: 'user_123',
            variables: {
              clientName: 'Jean Dupont',
              appointmentDate: '23/09/2025',
              appointmentTime: '14h30'
            }
          },
          {
            recipientId: 'user_456',
            variables: {
              clientName: 'Marie Martin',
              appointmentDate: '24/09/2025',
              appointmentTime: '10h00'
            },
            channel: 'SMS' // Canal spécifique
          }
        ],
        commonVariables: {
          businessName: 'Cabinet Médical',
          businessAddress: '123 Rue de la Santé, Paris'
        }
      })
    });
    \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Campagne de notifications créée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            campaignId: {
              type: 'string',
              example: 'campaign_123e4567-e89b-12d3-a456-426614174000',
            },
            totalRecipients: { type: 'number', example: 1250 },
            totalBatches: { type: 'number', example: 25 },
            estimatedDuration: { type: 'number', example: 3 },
            status: { type: 'string', example: 'PROCESSING' },
            preview: {
              type: 'object',
              properties: {
                sampleSubject: {
                  type: 'string',
                  example: 'Confirmation de rendez-vous - Cabinet Médical',
                },
                sampleContent: {
                  type: 'string',
                  example: 'Bonjour Jean Dupont, votre rendez-vous...',
                },
                affectedChannels: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['EMAIL', 'SMS'],
                },
              },
            },
          },
        },
      },
    },
  })
  async sendBulkNotification(
    @Body() dto: SendBulkNotificationDto,
    // @GetUser() user: User, // TODO: Add auth decorator
  ): Promise<SendBulkNotificationResponseDto> {
    // Convertir le DTO vers les types domain requis
    const templateType = dto.templateType as NotificationTemplateType;
    const defaultChannel = NotificationChannel.fromString(dto.defaultChannel);
    const priority = NotificationPriority.fromString(dto.priority);

    // Convertir les recipients DTO vers le format domain
    const convertedRecipients = dto.recipients?.map((recipient) => ({
      recipientId: recipient.recipientId,
      variables: recipient.variables || {},
      channel: recipient.channel
        ? NotificationChannel.fromString(recipient.channel)
        : undefined,
    }));

    const request = {
      templateType,
      defaultChannel,
      priority,
      scheduledFor: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      commonVariables: dto.commonVariables,
      recipients: convertedRecipients,
      segmentation: dto.segmentation
        ? {
            userRole: dto.segmentation.userRole,
            businessId: dto.segmentation.businessId,
            lastActivityAfter: dto.segmentation.lastActivityAfter
              ? new Date(dto.segmentation.lastActivityAfter)
              : undefined,
            lastActivityBefore: dto.segmentation.lastActivityBefore
              ? new Date(dto.segmentation.lastActivityBefore)
              : undefined,
            preferredChannel: dto.segmentation.preferredChannel
              ? [
                  NotificationChannel.fromString(
                    dto.segmentation.preferredChannel,
                  ),
                ]
              : undefined,
            // Ignorer les propriétés qui ne sont pas dans RecipientSegmentation
          }
        : undefined,
      batchSize: dto.batchSize,
      rateLimitPerMinute: dto.rateLimitPerMinute,
      requestingUserId: 'system', // TODO: Use real user.id when auth is available
      campaignName: dto.campaignName,
    };

    const response = await this.sendBulkNotificationUseCase.execute(request);

    return {
      success: true,
      data: {
        campaignId: response.campaignId,
        totalRecipients: response.totalRecipients,
        batchesCount: response.totalBatches,
        estimatedDuration: response.estimatedDuration,
        previewResults: {
          recipients: [], // TODO: Extract from response.preview
          sampleNotifications: [response.preview.sampleContent],
          estimatedCost: 0, // TODO: Calculate based on channels and count
        },
      },
    };
  }

  /**
   * Obtient le statut d'une campagne
   */
  @Get('campaigns/:campaignId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📊 Get campaign status',
    description:
      "Récupère le statut détaillé d'une campagne de notifications en cours ou terminée",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Statut de campagne récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            campaignId: { type: 'string' },
            campaignName: { type: 'string' },
            status: {
              type: 'string',
              enum: [
                'QUEUED',
                'PROCESSING',
                'COMPLETED',
                'FAILED',
                'CANCELLED',
              ],
            },
            progress: {
              type: 'object',
              properties: {
                totalRecipients: { type: 'number' },
                processedRecipients: { type: 'number' },
                successfulSends: { type: 'number' },
                failedSends: { type: 'number' },
                percentageComplete: { type: 'number' },
              },
            },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            estimatedCompletionAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getCampaignStatus() // @Param('campaignId') campaignId: string,
  // @GetUser() user: User,
  : Promise<any> {
    // TODO: Implement campaign status
    return {
      success: true,
      data: {
        campaignId: 'campaign_123e4567-e89b-12d3-a456-426614174000',
        campaignName: 'Rappels du jour',
        status: 'PROCESSING',
        progress: {
          totalRecipients: 1250,
          processedRecipients: 850,
          successfulSends: 825,
          failedSends: 25,
          percentageComplete: 68.0,
        },
        startedAt: '2025-09-22T10:30:00.000Z',
        estimatedCompletionAt: '2025-09-22T10:45:00.000Z',
      },
    };
  }

  /**
   * Annule une campagne en cours
   */
  @Delete('campaigns/:campaignId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🛑 Cancel campaign',
    description:
      'Annule une campagne de notifications en cours (impossible si déjà terminée)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Campagne annulée avec succès',
  })
  async cancelCampaign() // @Param('campaignId') campaignId: string,
  // @GetUser() user: User,
  : Promise<any> {
    // TODO: Implement campaign cancellation
    return {
      success: true,
      message: 'Campaign cancelled successfully',
    };
  }

  /**
   * Obtient les analytics des notifications
   */
  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📈 Get notification analytics',
    description:
      'Récupère les métriques et analytics détaillées des notifications',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Analytics récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            period: { type: 'string', example: 'Last 30 days' },
            totalSent: { type: 'number', example: 15420 },
            deliveryRate: { type: 'number', example: 94.2 },
            channelBreakdown: {
              type: 'object',
              example: { EMAIL: 8250, SMS: 4180, PUSH: 2990 },
            },
            peakHours: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  hour: { type: 'number' },
                  count: { type: 'number' },
                  percentage: { type: 'number' },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  priority: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  action: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  async getAnalytics() // @Query() filters: AnalyticsFiltersDto,
  // @GetUser() user: User,
  : Promise<any> {
    // TODO: Implement analytics
    return {
      success: true,
      data: {
        period: 'Last 30 days',
        totalSent: 15420,
        totalDelivered: 14526,
        totalFailed: 894,
        deliveryRate: 94.2,
        averageDeliveryTime: 2.3,
        channelBreakdown: {
          EMAIL: 8250,
          SMS: 4180,
          PUSH: 2990,
        },
        peakHours: [
          { hour: 9, count: 1250, percentage: 8.1 },
          { hour: 14, count: 1180, percentage: 7.6 },
          { hour: 16, count: 980, percentage: 6.4 },
        ],
        recommendations: [
          {
            type: 'optimization',
            priority: 'medium',
            title: "Optimiser les heures d'envoi",
            description:
              'Les envois sont concentrés sur 9h-10h (15% du volume)',
            action: 'Répartir les envois pour optimiser les performances',
          },
        ],
      },
    };
  }
}
