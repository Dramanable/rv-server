# 🔔 ARCHITECTURE COMPLÈTE DU SYSTÈME DE NOTIFICATIONS

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Acteurs et Notifications](#acteurs-et-notifications)
3. [Architecture Technique](#architecture-technique)
4. [BullMQ - File d'Attente](#bullmq---file-dattente)
5. [Notifications Email](#notifications-email)
6. [Notifications SMS](#notifications-sms)
7. [Rappels de Rendez-vous](#rappels-de-rendez-vous)
8. [Implémentation Complète](#implémentation-complète)

---

## 🎯 Vue d'Ensemble

### **Contexte**

Le système de notifications doit gérer **3 types d'acteurs distincts** avec des besoins de communication spécifiques :

1. **🏢 Platform Admins (NOUS)** - Équipe de la plateforme SaaS
2. **👨‍💼 Business Users (B2B)** - Professionnels et staff des entreprises clientes
3. **🌐 End Clients (B2C)** - Clients finaux prenant des rendez-vous

### **Objectifs Système**

- ✅ **Notifications persistées en base** pour traçabilité et historique
- ✅ **Traitement asynchrone** avec BullMQ pour performance et résilience
- ✅ **Multi-canal** : In-App, Email, SMS, Push (future)
- ✅ **Rappels automatiques** pour rendez-vous à venir (configurable)
- ✅ **Retry logic** avec exponential backoff
- ✅ **Rate limiting** pour prévenir spam et surcharge
- ✅ **Templates personnalisables** par business et langue
- ✅ **Analytics et monitoring** des notifications envoyées

---

## 👥 Acteurs et Notifications

### **1️⃣ Platform Admins (NOUS)**

#### **Notifications Reçues**

| Événement                 | Description                      | Priorité | Canaux                |
| ------------------------- | -------------------------------- | -------- | --------------------- |
| `NEW_BUSINESS_SIGNUP`     | Nouvelle entreprise inscrite     | HIGH     | Email, Dashboard      |
| `SUBSCRIPTION_UPGRADED`   | Client upgrade son plan          | MEDIUM   | Email, Slack          |
| `PAYMENT_FAILED`          | Échec de paiement client         | HIGH     | Email, SMS, Slack     |
| `BUSINESS_CHURN_RISK`     | Client à risque de désabonnement | HIGH     | Email, Dashboard      |
| `SUPPORT_TICKET_CRITICAL` | Ticket support urgent            | CRITICAL | Email, SMS, Slack     |
| `SYSTEM_HEALTH_ALERT`     | Problème infrastructure          | CRITICAL | Email, SMS, PagerDuty |
| `QUOTA_EXCEEDED`          | Limite quota dépassée            | HIGH     | Email, Dashboard      |
| `FRAUD_DETECTION`         | Activité suspecte détectée       | CRITICAL | Email, SMS, Dashboard |

#### **Actions de Notifications**

- Envoi d'emails de bienvenue aux nouveaux clients
- Campagnes marketing pour upgrade
- Alertes système et monitoring
- Notifications de billing et facturation

---

### **2️⃣ Business Users (B2B Clients)**

#### **👔 Business Owners**

| Événement                    | Description                  | Priorité | Canaux             |
| ---------------------------- | ---------------------------- | -------- | ------------------ |
| `APPOINTMENT_BOOKED`         | Nouveau rendez-vous réservé  | MEDIUM   | Email, In-App, SMS |
| `APPOINTMENT_CANCELLED`      | Client annule rendez-vous    | HIGH     | Email, In-App, SMS |
| `APPOINTMENT_RESCHEDULED`    | Rendez-vous reprogrammé      | MEDIUM   | Email, In-App      |
| `STAFF_AVAILABILITY_CHANGED` | Staff modifie disponibilités | MEDIUM   | In-App, Email      |
| `PAYMENT_RECEIVED`           | Paiement client reçu         | LOW      | In-App, Email      |
| `DAILY_REPORT`               | Résumé journalier activité   | LOW      | Email              |
| `WEEKLY_ANALYTICS`           | Analytics hebdomadaires      | LOW      | Email              |
| `SUBSCRIPTION_RENEWAL`       | Renouvellement abonnement    | HIGH     | Email, In-App      |
| `QUOTA_WARNING`              | Limite quota atteinte (80%)  | MEDIUM   | Email, In-App      |

#### **👨‍💼 Staff/Practitioners**

| Événement                    | Description                 | Priorité | Canaux             |
| ---------------------------- | --------------------------- | -------- | ------------------ |
| `NEW_APPOINTMENT_ASSIGNED`   | Nouveau RDV assigné         | HIGH     | Email, In-App, SMS |
| `APPOINTMENT_REMINDER_STAFF` | Rappel RDV dans 1h          | HIGH     | Email, SMS, In-App |
| `CLIENT_CANCELLED`           | Client annule son RDV       | HIGH     | Email, In-App, SMS |
| `CLIENT_NO_SHOW`             | Client absent sans prévenir | MEDIUM   | In-App             |
| `SCHEDULE_UPDATED`           | Planning modifié par admin  | MEDIUM   | Email, In-App      |
| `CLIENT_MESSAGE`             | Message client reçu         | HIGH     | Email, In-App, SMS |
| `SHIFT_REMINDER`             | Rappel début de service     | MEDIUM   | In-App, SMS        |

#### **📋 Support Staff (Secrétaires)**

| Événement              | Description                  | Priorité | Canaux             |
| ---------------------- | ---------------------------- | -------- | ------------------ |
| `APPOINTMENT_REQUEST`  | Demande RDV à confirmer      | HIGH     | Email, In-App, SMS |
| `CANCELLATION_REQUEST` | Demande annulation à traiter | HIGH     | In-App, Email      |
| `PAYMENT_ISSUE`        | Problème paiement client     | HIGH     | In-App, Email      |
| `CLIENT_INQUIRY`       | Question client              | MEDIUM   | In-App, Email      |

---

### **3️⃣ End Clients (B2C)**

| Événement                           | Description                    | Priorité | Canaux             |
| ----------------------------------- | ------------------------------ | -------- | ------------------ |
| `APPOINTMENT_CONFIRMED`             | RDV confirmé par professionnel | HIGH     | Email, SMS, In-App |
| `APPOINTMENT_REMINDER_24H`          | Rappel 24h avant RDV           | HIGH     | Email, SMS         |
| `APPOINTMENT_REMINDER_1H`           | Rappel 1h avant RDV            | CRITICAL | SMS, Push          |
| `APPOINTMENT_CANCELLED_BY_BUSINESS` | Business annule RDV            | CRITICAL | Email, SMS, In-App |
| `APPOINTMENT_RESCHEDULED`           | RDV reprogrammé                | HIGH     | Email, SMS, In-App |
| `PAYMENT_CONFIRMATION`              | Confirmation paiement          | MEDIUM   | Email, In-App      |
| `REVIEW_REQUEST`                    | Demande avis après RDV         | LOW      | Email, In-App      |
| `SERVICE_UPDATE`                    | Modification service réservé   | MEDIUM   | Email, In-App      |
| `PRACTITIONER_CHANGED`              | Changement de praticien        | HIGH     | Email, SMS         |

---

## 🏗️ Architecture Technique

### **Stack Technologique**

```typescript
// Dependencies à ajouter
{
  "dependencies": {
    "@nestjs/bull": "^10.0.1",        // BullMQ integration
    "bull": "^4.12.0",                 // Job queue
    "ioredis": "^5.3.2",               // Redis client
    "@sendgrid/mail": "^8.1.0",        // Email service
    "twilio": "^4.20.0",               // SMS service
    "nodemailer": "^6.9.7",            // Alternative email
    "handlebars": "^4.7.8",            // Template engine
    "@nestjs/schedule": "^4.0.0"       // Cron jobs
  }
}
```

### **Architecture en Couches**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  - NotificationController (HTTP/WebSocket)                   │
│  - NotificationGateway (Real-time updates)                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  - SendNotificationUseCase                                   │
│  - ScheduleReminderUseCase                                   │
│  - ProcessNotificationQueueUseCase                           │
│  - SendBulkNotificationsUseCase                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER                               │
│  - Notification Entity                                       │
│  - NotificationTemplate Entity                               │
│  - NotificationRule Value Object                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Repositories   │  │   Queues        │                   │
│  │  - PostgreSQL   │  │   - BullMQ      │                   │
│  │  - TypeORM      │  │   - Redis       │                   │
│  └─────────────────┘  └─────────────────┘                   │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Email Service  │  │   SMS Service   │                   │
│  │  - SendGrid     │  │   - Twilio      │                   │
│  │  - Templates    │  │   - Templates   │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 BullMQ - File d'Attente

### **Queues Définies**

```typescript
// src/infrastructure/queues/notification-queues.config.ts

export enum NotificationQueue {
  // Queue principale pour notifications immédiates
  IMMEDIATE = 'notifications:immediate',

  // Queue pour notifications différées (scheduled)
  SCHEDULED = 'notifications:scheduled',

  // Queue pour rappels de rendez-vous
  APPOINTMENT_REMINDERS = 'notifications:appointment-reminders',

  // Queue pour envois en masse (campagnes)
  BULK = 'notifications:bulk',

  // Queue pour notifications critiques (retry rapide)
  CRITICAL = 'notifications:critical',

  // Dead Letter Queue pour échecs répétés
  FAILED = 'notifications:failed',
}

export const QUEUE_CONFIG = {
  [NotificationQueue.IMMEDIATE]: {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000, // 1s, 2s, 4s
      },
      removeOnComplete: 100, // Garder 100 derniers jobs
      removeOnFail: 1000, // Garder 1000 derniers échecs
    },
    limiter: {
      max: 100, // Max 100 jobs
      duration: 1000, // Par seconde
    },
  },

  [NotificationQueue.CRITICAL]: {
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 500, // 0.5s, 1s, 2s, 4s, 8s
      },
      priority: 1, // Priorité maximale
    },
    limiter: {
      max: 200,
      duration: 1000,
    },
  },

  [NotificationQueue.APPOINTMENT_REMINDERS]: {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000, // Retry toutes les 5s
      },
    },
  },

  [NotificationQueue.BULK]: {
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
    },
    limiter: {
      max: 50, // Limiter pour éviter spam
      duration: 1000,
    },
  },
};
```

### **Job Types**

```typescript
// src/infrastructure/queues/jobs/notification-job.types.ts

export interface NotificationJobData {
  readonly notificationId: string;
  readonly recipientId: string;
  readonly channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly metadata: {
    readonly businessId?: string;
    readonly appointmentId?: string;
    readonly templateId?: string;
    readonly locale?: string;
    readonly timezone?: string;
  };
}

export interface AppointmentReminderJobData {
  readonly appointmentId: string;
  readonly businessId: string;
  readonly clientId: string;
  readonly staffId: string;
  readonly scheduledFor: Date;
  readonly reminderType: '24H' | '1H' | 'CUSTOM';
  readonly channels: Array<'EMAIL' | 'SMS'>;
}

export interface BulkNotificationJobData {
  readonly campaignId: string;
  readonly businessId: string;
  readonly recipientIds: string[];
  readonly template: string;
  readonly variables: Record<string, unknown>;
  readonly scheduledFor?: Date;
}
```

---

## 📧 Notifications Email

### **Configuration SendGrid**

```typescript
// src/infrastructure/services/email/sendgrid.service.ts

import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import Handlebars from 'handlebars';

export interface SendEmailOptions {
  readonly to: string;
  readonly from?: string;
  readonly subject: string;
  readonly templateId?: string;
  readonly dynamicTemplateData?: Record<string, unknown>;
  readonly html?: string;
  readonly text?: string;
  readonly attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

@Injectable()
export class SendGridEmailService {
  private readonly logger = new Logger(SendGridEmailService.name);
  private readonly defaultFrom: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY must be defined');
    }

    sgMail.setApiKey(apiKey);
    this.defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@amrdv.com';
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const message = {
        to: options.to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        ...(options.templateId && {
          templateId: options.templateId,
          dynamicTemplateData: options.dynamicTemplateData || {},
        }),
        ...(options.html && { html: options.html }),
        ...(options.text && { text: options.text }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      await sgMail.send(message);

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendBulkEmails(
    recipients: string[],
    options: Omit<SendEmailOptions, 'to'>,
  ): Promise<void> {
    try {
      const messages = recipients.map((to) => ({
        to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        ...(options.templateId && {
          templateId: options.templateId,
          dynamicTemplateData: options.dynamicTemplateData || {},
        }),
        ...(options.html && { html: options.html }),
        ...(options.text && { text: options.text }),
      }));

      await sgMail.send(messages);

      this.logger.log(`Bulk email sent to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      throw error;
    }
  }
}
```

### **Templates Email**

```typescript
// src/infrastructure/services/email/templates/appointment-reminder.template.ts

export const APPOINTMENT_REMINDER_24H_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rappel de Rendez-vous</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">📅 Rappel de Rendez-vous</h1>
    
    <p>Bonjour {{clientName}},</p>
    
    <p>Nous vous rappelons votre rendez-vous prévu <strong>demain</strong> :</p>
    
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>📍 Avec :</strong> {{practitionerName}}</p>
      <p style="margin: 5px 0;"><strong>🏢 Chez :</strong> {{businessName}}</p>
      <p style="margin: 5px 0;"><strong>🕐 Le :</strong> {{appointmentDate}} à {{appointmentTime}}</p>
      <p style="margin: 5px 0;"><strong>📍 Adresse :</strong> {{businessAddress}}</p>
      <p style="margin: 5px 0;"><strong>⏱️ Durée :</strong> {{duration}} minutes</p>
    </div>
    
    {{#if appointmentNotes}}
    <p><strong>📝 Notes :</strong> {{appointmentNotes}}</p>
    {{/if}}
    
    <div style="margin: 30px 0;">
      <a href="{{confirmationUrl}}" 
         style="background-color: #10b981; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; display: inline-block;">
        ✅ Confirmer ma présence
      </a>
      
      <a href="{{rescheduleUrl}}" 
         style="background-color: #f59e0b; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; display: inline-block; margin-left: 10px;">
        📅 Modifier le rendez-vous
      </a>
      
      <a href="{{cancelUrl}}" 
         style="background-color: #ef4444; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 6px; display: inline-block; margin-left: 10px;">
        ❌ Annuler
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
      Si vous ne pouvez pas vous présenter, merci de nous prévenir au moins 24h à l'avance.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px;">
      {{businessName}}<br>
      {{businessPhone}} | {{businessEmail}}<br>
      <a href="{{unsubscribeUrl}}" style="color: #9ca3af;">Se désabonner</a>
    </p>
  </div>
</body>
</html>
`;

export const APPOINTMENT_REMINDER_1H_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>⏰ Rappel Urgent - Rendez-vous dans 1h</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
      <h1 style="color: #f59e0b; margin: 0;">⏰ Rappel Urgent</h1>
    </div>
    
    <p>Bonjour {{clientName}},</p>
    
    <p style="font-size: 18px; font-weight: bold; color: #f59e0b;">
      Votre rendez-vous est dans <strong>1 heure</strong> !
    </p>
    
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>🕐 Heure :</strong> {{appointmentTime}}</p>
      <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> {{businessAddress}}</p>
      <p style="margin: 5px 0;"><strong>👨‍💼 Avec :</strong> {{practitionerName}}</p>
    </div>
    
    {{#if directions}}
    <p><a href="{{directions}}" style="color: #2563eb;">📍 Voir l'itinéraire</a></p>
    {{/if}}
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
      En cas d'empêchement de dernière minute, contactez-nous au {{businessPhone}}
    </p>
  </div>
</body>
</html>
`;
```

---

## 📱 Notifications SMS

### **Configuration Twilio**

```typescript
// src/infrastructure/services/sms/twilio.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

export interface SendSMSOptions {
  readonly to: string;
  readonly body: string;
  readonly from?: string;
  readonly mediaUrl?: string[];
}

@Injectable()
export class TwilioSMSService {
  private readonly logger = new Logger(TwilioSMSService.name);
  private readonly client: Twilio;
  private readonly defaultFrom: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('TWILIO credentials must be defined');
    }

    this.client = new Twilio(accountSid, authToken);
    this.defaultFrom = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendSMS(options: SendSMSOptions): Promise<string> {
    try {
      // Validation du numéro (format E.164)
      const phoneNumber = this.formatPhoneNumber(options.to);

      const message = await this.client.messages.create({
        body: options.body,
        from: options.from || this.defaultFrom,
        to: phoneNumber,
        ...(options.mediaUrl && { mediaUrl: options.mediaUrl }),
      });

      this.logger.log(
        `SMS sent successfully to ${phoneNumber}, SID: ${message.sid}`,
      );

      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}`, error);
      throw error;
    }
  }

  async sendBulkSMS(recipients: string[], body: string): Promise<string[]> {
    const results = await Promise.allSettled(
      recipients.map((to) => this.sendSMS({ to, body })),
    );

    const successfulSids = results
      .filter(
        (result): result is PromiseFulfilledResult<string> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);

    this.logger.log(
      `Bulk SMS sent: ${successfulSids.length}/${recipients.length} successful`,
    );

    return successfulSids;
  }

  private formatPhoneNumber(phone: string): string {
    // Nettoyer et formatter au format E.164
    let cleaned = phone.replace(/\D/g, '');

    // Ajouter le préfixe international si nécessaire
    if (!cleaned.startsWith('33') && cleaned.length === 9) {
      cleaned = '33' + cleaned; // France par défaut
    }

    return '+' + cleaned;
  }

  async getDeliveryStatus(messageSid: string): Promise<string> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      this.logger.error(`Failed to fetch SMS status for ${messageSid}`, error);
      throw error;
    }
  }
}
```

### **Templates SMS**

```typescript
// src/infrastructure/services/sms/templates/sms-templates.ts

export class SMSTemplates {
  static appointmentReminder24H(data: {
    clientName: string;
    businessName: string;
    appointmentDate: string;
    appointmentTime: string;
    confirmUrl: string;
  }): string {
    return `
Bonjour ${data.clientName},

Rappel : RDV demain à ${data.appointmentTime} chez ${data.businessName}.

Confirmer : ${data.confirmUrl}

Pour annuler ou modifier, répondez STOP.
    `.trim();
  }

  static appointmentReminder1H(data: {
    clientName: string;
    appointmentTime: string;
    businessAddress: string;
  }): string {
    return `
⏰ URGENT : RDV dans 1h à ${data.appointmentTime}

📍 ${data.businessAddress}

En cas d'empêchement, contactez-nous immédiatement.
    `.trim();
  }

  static appointmentConfirmed(data: {
    businessName: string;
    appointmentDate: string;
    appointmentTime: string;
  }): string {
    return `
✅ RDV confirmé !

${data.businessName}
📅 ${data.appointmentDate} à ${data.appointmentTime}

À bientôt !
    `.trim();
  }

  static appointmentCancelled(data: {
    businessName: string;
    appointmentDate: string;
  }): string {
    return `
❌ RDV du ${data.appointmentDate} annulé.

Contactez ${data.businessName} pour reprogrammer.

Merci.
    `.trim();
  }

  static newAppointmentForStaff(data: {
    staffName: string;
    clientName: string;
    appointmentTime: string;
    service: string;
  }): string {
    return `
🆕 Nouveau RDV assigné

👤 Client : ${data.clientName}
🕐 ${data.appointmentTime}
💼 Service : ${data.service}

Consultez votre planning pour plus de détails.
    `.trim();
  }
}
```

---

## ⏰ Rappels de Rendez-vous

### **Configuration des Rappels**

```typescript
// src/infrastructure/services/reminders/appointment-reminder.config.ts

export interface ReminderConfig {
  readonly enabled: boolean;
  readonly channels: Array<'EMAIL' | 'SMS' | 'PUSH'>;
  readonly timing: number; // En heures avant le RDV
  readonly template: string;
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const DEFAULT_REMINDER_CONFIG: Record<string, ReminderConfig> = {
  // Rappel 24h avant
  '24H_BEFORE': {
    enabled: true,
    channels: ['EMAIL', 'SMS'],
    timing: 24,
    template: 'APPOINTMENT_REMINDER_24H',
    priority: 'HIGH',
  },

  // Rappel 1h avant
  '1H_BEFORE': {
    enabled: true,
    channels: ['SMS'],
    timing: 1,
    template: 'APPOINTMENT_REMINDER_1H',
    priority: 'CRITICAL',
  },

  // Rappel 48h avant (optionnel, configurable par business)
  '48H_BEFORE': {
    enabled: false,
    channels: ['EMAIL'],
    timing: 48,
    template: 'APPOINTMENT_REMINDER_48H',
    priority: 'MEDIUM',
  },

  // Rappel le jour même (matin)
  SAME_DAY_MORNING: {
    enabled: false,
    channels: ['EMAIL', 'SMS'],
    timing: 4, // 4h avant (ex: 8h pour RDV à 12h)
    template: 'APPOINTMENT_REMINDER_SAME_DAY',
    priority: 'HIGH',
  },
};

// Configuration par business (override des defaults)
export interface BusinessReminderSettings {
  readonly businessId: string;
  readonly reminders: Record<string, ReminderConfig>;
  readonly timezone: string;
  readonly locale: string;
}
```

### **Scheduler de Rappels**

```typescript
// src/infrastructure/services/reminders/appointment-reminder.scheduler.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AppointmentRepository } from '@domain/repositories/appointment.repository.interface';
import { NotificationQueue } from '../queues/notification-queues.config';

@Injectable()
export class AppointmentReminderScheduler {
  private readonly logger = new Logger(AppointmentReminderScheduler.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    @InjectQueue(NotificationQueue.APPOINTMENT_REMINDERS)
    private readonly reminderQueue: Queue,
  ) {}

  /**
   * CRON : Toutes les 15 minutes
   * Planifie les rappels pour les rendez-vous à venir
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async scheduleUpcomingReminders(): Promise<void> {
    this.logger.log('🔄 Starting reminder scheduling job...');

    try {
      // 1. Récupérer les RDV des prochaines 72h qui n'ont pas encore de rappels
      const upcomingAppointments =
        await this.appointmentRepository.findUpcoming({
          startDate: new Date(),
          endDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // +72h
          hasRemindersScheduled: false,
        });

      this.logger.log(
        `Found ${upcomingAppointments.length} appointments to schedule`,
      );

      // 2. Pour chaque RDV, planifier les rappels configurés
      for (const appointment of upcomingAppointments) {
        await this.scheduleRemindersForAppointment(appointment.getId());
      }

      this.logger.log('✅ Reminder scheduling job completed');
    } catch (error) {
      this.logger.error('❌ Error in reminder scheduling job', error);
    }
  }

  /**
   * Planifie tous les rappels pour un rendez-vous donné
   */
  private async scheduleRemindersForAppointment(
    appointmentId: string,
  ): Promise<void> {
    try {
      const appointment =
        await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found`);
        return;
      }

      const business = await this.businessRepository.findById(
        appointment.getBusinessId(),
      );

      // Récupérer la config de rappels du business (ou défaut)
      const reminderConfig =
        business?.getReminderSettings() || DEFAULT_REMINDER_CONFIG;

      const appointmentDateTime = appointment.getDateTime();

      // Pour chaque rappel activé
      for (const [key, config] of Object.entries(reminderConfig)) {
        if (!config.enabled) continue;

        // Calculer la date d'envoi du rappel
        const reminderTime = new Date(
          appointmentDateTime.getTime() - config.timing * 60 * 60 * 1000,
        );

        // Ne pas planifier des rappels dans le passé
        if (reminderTime <= new Date()) {
          this.logger.warn(
            `Skipping past reminder ${key} for appointment ${appointmentId}`,
          );
          continue;
        }

        // Ajouter le job à la queue avec delay
        const delay = reminderTime.getTime() - Date.now();

        await this.reminderQueue.add(
          'send-appointment-reminder',
          {
            appointmentId: appointment.getId(),
            businessId: appointment.getBusinessId(),
            clientId: appointment.getClientId(),
            staffId: appointment.getStaffId(),
            reminderType: key,
            channels: config.channels,
            scheduledFor: reminderTime,
          },
          {
            delay,
            jobId: `reminder-${appointmentId}-${key}`,
            removeOnComplete: true,
          },
        );

        this.logger.log(
          `Scheduled ${key} reminder for appointment ${appointmentId} at ${reminderTime.toISOString()}`,
        );
      }

      // Marquer l'appointment comme ayant des rappels planifiés
      await this.appointmentRepository.markRemindersScheduled(appointmentId);
    } catch (error) {
      this.logger.error(
        `Failed to schedule reminders for appointment ${appointmentId}`,
        error,
      );
    }
  }

  /**
   * CRON : Tous les jours à 2h du matin
   * Nettoie les jobs de rappels expirés
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredReminders(): Promise<void> {
    this.logger.log('🧹 Cleaning up expired reminder jobs...');

    try {
      const jobs = await this.reminderQueue.getCompleted();
      const cleaned = await this.reminderQueue.clean(
        7 * 24 * 60 * 60 * 1000, // 7 jours
        'completed',
      );

      this.logger.log(`Cleaned ${cleaned.length} expired reminder jobs`);
    } catch (error) {
      this.logger.error('Error cleaning up expired reminders', error);
    }
  }
}
```

---

## 🛠️ Implémentation Complète

### **📁 Structure de Fichiers**

```
src/
├── domain/
│   ├── entities/
│   │   ├── notification.entity.ts                    ✅ Existe
│   │   └── notification-template.entity.ts           ✅ Existe
│   ├── repositories/
│   │   ├── notification.repository.interface.ts      ✅ Existe
│   │   └── notification-template.repository.interface.ts
│   └── value-objects/
│       ├── notification-channel.value-object.ts      ✅ Existe
│       ├── notification-priority.value-object.ts     ✅ Existe
│       └── notification-status.value-object.ts       ✅ Existe
│
├── application/
│   ├── use-cases/
│   │   └── notifications/
│   │       ├── send-notification.use-case.ts         ❌ À créer
│   │       ├── schedule-reminder.use-case.ts         ❌ À créer
│   │       ├── send-bulk-notifications.use-case.ts   ❌ À créer
│   │       ├── mark-notification-read.use-case.ts    ❌ À créer
│   │       └── get-user-notifications.use-case.ts    ❌ À créer
│   └── ports/
│       ├── email.port.ts                             ❌ À créer
│       ├── sms.port.ts                               ❌ À créer
│       └── notification.port.ts                      ✅ Existe
│
├── infrastructure/
│   ├── services/
│   │   ├── email/
│   │   │   ├── sendgrid.service.ts                   ❌ À créer
│   │   │   └── templates/
│   │   │       ├── appointment-reminder.template.ts  ❌ À créer
│   │   │       ├── appointment-confirmed.template.ts ❌ À créer
│   │   │       └── appointment-cancelled.template.ts ❌ À créer
│   │   ├── sms/
│   │   │   ├── twilio.service.ts                     ❌ À créer
│   │   │   └── templates/
│   │   │       └── sms-templates.ts                  ❌ À créer
│   │   └── reminders/
│   │       ├── appointment-reminder.scheduler.ts     ❌ À créer
│   │       └── appointment-reminder.config.ts        ❌ À créer
│   ├── queues/
│   │   ├── notification-queues.config.ts             ❌ À créer
│   │   ├── processors/
│   │   │   ├── notification.processor.ts             ❌ À créer
│   │   │   ├── appointment-reminder.processor.ts     ❌ À créer
│   │   │   └── bulk-notification.processor.ts        ❌ À créer
│   │   └── jobs/
│   │       └── notification-job.types.ts             ❌ À créer
│   └── modules/
│       ├── notification.module.ts                    ❌ À créer
│       └── queue.module.ts                           ❌ À créer
│
└── presentation/
    ├── controllers/
    │   └── notification.controller.ts                ✅ Existe (à compléter)
    ├── dtos/
    │   └── notification/
    │       ├── send-notification.dto.ts              ❌ À créer
    │       └── bulk-notification.dto.ts              ❌ À créer
    └── gateways/
        └── notification.gateway.ts                   ❌ À créer (WebSocket)
```

---

## 📋 Plan d'Implémentation

### **Phase 1 : Infrastructure de Base (Jours 1-2)**

1. ✅ Installation dépendances (BullMQ, SendGrid, Twilio)
2. ✅ Configuration Redis et queues BullMQ
3. ✅ Création des ports Email et SMS
4. ✅ Implémentation SendGrid service
5. ✅ Implémentation Twilio service

### **Phase 2 : Use Cases et Processors (Jours 3-4)**

6. ✅ Use Cases de notifications (send, bulk, schedule)
7. ✅ Processors BullMQ pour chaque queue
8. ✅ Gestion des erreurs et retry logic
9. ✅ Tests unitaires des use cases

### **Phase 3 : Rappels Automatiques (Jours 5-6)**

10. ✅ Scheduler de rappels avec @nestjs/schedule
11. ✅ Processor de rappels d'appointments
12. ✅ Configuration des templates email/SMS
13. ✅ Tests d'intégration des rappels

### **Phase 4 : API et WebSocket (Jour 7)**

14. ✅ Controller HTTP pour notifications
15. ✅ Gateway WebSocket pour real-time
16. ✅ DTOs et validation
17. ✅ Documentation Swagger

### **Phase 5 : Monitoring et Analytics (Jour 8)**

18. ✅ Dashboard de monitoring BullMQ
19. ✅ Métriques et analytics
20. ✅ Alertes et logging avancé

---

## 🔐 Variables d'Environnement

```bash
# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@amrdv.com
SENDGRID_FROM_NAME="AMRDV - Plateforme de Rendez-vous"

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+33123456789

# Notifications
NOTIFICATION_RATE_LIMIT=100  # Max notifications par heure/user
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=1000  # ms

# Rappels
APPOINTMENT_REMINDER_24H_ENABLED=true
APPOINTMENT_REMINDER_1H_ENABLED=true
APPOINTMENT_REMINDER_EMAIL_ENABLED=true
APPOINTMENT_REMINDER_SMS_ENABLED=true

# URLs frontend
FRONTEND_URL=https://app.amrdv.com
FRONTEND_CONFIRM_URL=${FRONTEND_URL}/appointments/confirm
FRONTEND_CANCEL_URL=${FRONTEND_URL}/appointments/cancel
FRONTEND_RESCHEDULE_URL=${FRONTEND_URL}/appointments/reschedule
```

---

## 📊 Métriques et Monitoring

### **Métriques à Suivre**

- Nombre de notifications envoyées (par canal)
- Taux de délivrabilité (email/SMS)
- Taux d'ouverture (email)
- Taux de clics (email)
- Temps de traitement des queues
- Taux d'échec et retry
- Coût par notification
- Performance par canal

### **Alertes Critiques**

- Échec d'envoi > 5% sur 1h
- Queue size > 10 000 jobs
- Retry count > 3 pour un job
- Coût SMS > budget mensuel
- API externe down (SendGrid/Twilio)

---

## 🎯 Prochaines Étapes

Souhaitez-vous que je commence l'implémentation de ces composants ? Je recommande de commencer par :

1. **Configuration BullMQ et Redis**
2. **Services Email et SMS**
3. **Use Cases de base**
4. **Scheduler de rappels**

Confirmez-vous cette approche ?
