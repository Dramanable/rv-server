# 📢 Notifications System APIs - Swagger Documentation

## 📋 Overview

Le **système de notifications** permet l'envoi de messages multi-canaux avec support de planification avancée et métadonnées contextuelles. Conçu selon les principes de Clean Architecture avec TDD strict.

## 🏗️ Architecture Implementation Status

### ✅ **Notifications System - 100% Complete**

- **Domain** : ✅ Notification Entity + NotificationChannel/Priority/Status Value Objects + Repository Interface
- **Application** : ✅ SendNotificationUseCase with complete business rules and validation
- **Infrastructure** : ✅ NotificationOrmEntity + TypeOrmNotificationRepository + NotificationOrmMapper + Migration
- **Presentation** : ✅ NotificationController + All DTOs with comprehensive Swagger documentation

## 🎯 Notifications APIs

### **POST /api/v1/notifications/send**

**Description** : Envoie une notification via le canal spécifié avec support de planification  
**Security** : Requires JWT authentication  
**Content-Type** : `application/json`

#### **Request Body Examples**

##### 📧 **Email Immédiat**

```json
{
  "recipientId": "user_123e4567-e89b-12d3-a456-426614174000",
  "title": "Confirmation de rendez-vous",
  "content": "Votre rendez-vous du 23/09/2025 à 14h30 est confirmé. Merci de vous présenter 10 minutes avant l'heure prévue.",
  "channel": "EMAIL",
  "priority": "HIGH",
  "metadata": {
    "appointmentId": "appointment_123e4567-e89b-12d3-a456-426614174000",
    "businessId": "business_456e7890-e89b-12d3-a456-426614174001",
    "serviceId": "service_789e0123-e89b-12d3-a456-426614174002",
    "templateId": "appointment_confirmation",
    "correlationId": "batch_confirmation_001"
  }
}
```

##### 📱 **SMS Planifié**

```json
{
  "recipientId": "user_789e0123-e89b-12d3-a456-426614174002",
  "title": "Rappel RDV",
  "content": "RDV demain 14h30 - Cabinet Médical",
  "channel": "SMS",
  "priority": "NORMAL",
  "scheduledFor": "2025-09-23T10:00:00.000Z",
  "metadata": {
    "appointmentId": "appointment_456e7890-e89b-12d3-a456-426614174003",
    "originalEventType": "APPOINTMENT_REMINDER",
    "correlationId": "reminder_batch_001"
  }
}
```

##### 🚨 **Push Notification Urgente**

```json
{
  "recipientId": "user_012e3456-e89b-12d3-a456-426614174004",
  "title": "Annulation de rendez-vous",
  "content": "Votre rendez-vous de 15h00 a été annulé en raison d'un empêchement. Veuillez nous contacter au 01.23.45.67.89 pour reprogrammer.",
  "channel": "PUSH",
  "priority": "URGENT",
  "metadata": {
    "appointmentId": "appointment_789e0123-e89b-12d3-a456-426614174005",
    "businessId": "business_012e3456-e89b-12d3-a456-426614174006",
    "eventType": "APPOINTMENT_CANCELLED",
    "originalEventType": "SYSTEM_CANCELLATION"
  }
}
```

##### 📱 **Notification In-App**

```json
{
  "recipientId": "user_345e6789-e89b-12d3-a456-426614174007",
  "title": "Nouveau message du praticien",
  "content": "Dr. Martin a ajouté une note à votre dossier concernant votre dernière consultation. Vous pouvez la consulter dans votre espace patient.",
  "channel": "IN_APP",
  "priority": "NORMAL",
  "metadata": {
    "staffId": "staff_678e9012-e89b-12d3-a456-426614174008",
    "businessId": "business_901e2345-e89b-12d3-a456-426614174009",
    "patientRecordId": "record_234e5678-e89b-12d3-a456-426614174010",
    "templateId": "patient_message"
  }
}
```

#### **Success Response (200 OK)**

##### Envoi Immédiat Réussi

```json
{
  "success": true,
  "data": {
    "id": "notif_123e4567-e89b-12d3-a456-426614174000",
    "status": "sent",
    "sentAt": "2025-09-22T10:30:00.000Z",
    "estimatedDelivery": "2025-09-22T10:30:15.000Z"
  },
  "meta": {
    "timestamp": "2025-09-22T10:30:00.000Z",
    "correlationId": "req_456e7890-e89b-12d3-a456-426614174001",
    "processingTime": 245
  }
}
```

##### Planification Réussie

```json
{
  "success": true,
  "data": {
    "id": "notif_789e0123-e89b-12d3-a456-426614174002",
    "status": "scheduled",
    "scheduledFor": "2025-09-23T10:00:00.000Z",
    "estimatedDelivery": "2025-09-23T10:00:05.000Z"
  },
  "meta": {
    "timestamp": "2025-09-22T10:30:00.000Z",
    "correlationId": "req_012e3456-e89b-12d3-a456-426614174003",
    "processingTime": 89
  }
}
```

## 🚨 Error Responses

### **400 Bad Request - Données invalides**

```json
{
  "success": false,
  "error": {
    "code": "NOTIFICATION_INVALID_DATA",
    "message": "Le contenu dépasse la limite du canal SMS (160 caractères)",
    "field": "content",
    "timestamp": "2025-09-22T10:30:00.000Z",
    "path": "/api/v1/notifications/send",
    "correlationId": "req_error_123"
  }
}
```

### **401 Unauthorized - Authentification requise**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Token JWT manquant ou invalide",
    "timestamp": "2025-09-22T10:30:00.000Z",
    "path": "/api/v1/notifications/send"
  }
}
```

### **429 Too Many Requests - Rate limiting**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 100 notifications par heure dépassée",
    "timestamp": "2025-09-22T10:30:00.000Z",
    "path": "/api/v1/notifications/send",
    "retryAfter": 3600
  }
}
```

## 🔐 Authentication & Authorization

- **Type** : JWT Bearer Token
- **Header** : `Authorization: Bearer <token>`
- **Permissions** : `SEND_NOTIFICATIONS` ou rôle système approprié
- **Rate Limiting** : 100 notifications/heure par utilisateur

## 📊 Validation Rules

### **Champs Obligatoires**

- `recipientId` : ID utilisateur valide (string, non vide)
- `title` : 1-200 caractères, texte simple
- `content` : 1-5000 caractères (limite selon canal)
- `channel` : Enum `['EMAIL', 'SMS', 'PUSH', 'IN_APP']`

### **Champs Optionnels**

- `priority` : Enum `['LOW', 'NORMAL', 'HIGH', 'URGENT']` (défaut: NORMAL)
- `scheduledFor` : Date ISO 8601 future uniquement
- `metadata` : Objet JSON avec métadonnées contextuelles

### **Limites par Canal**

- **EMAIL** : Contenu illimité, supporte HTML
- **SMS** : 160 caractères maximum, texte simple uniquement
- **PUSH** : 1000 caractères maximum, supporte émojis
- **IN_APP** : 5000 caractères maximum, supporte markdown

## 🎯 Business Rules

### **Règles de Planification**

- Date future obligatoire pour `scheduledFor`
- Fenêtre de planification selon priorité :
  - **LOW** : Jusqu'à 30 jours à l'avance
  - **NORMAL** : Jusqu'à 7 jours à l'avance
  - **HIGH** : Jusqu'à 24 heures à l'avance
  - **URGENT** : Immédiat uniquement

### **Règles de Retry**

- Échecs temporaires : 3 tentatives max avec backoff exponentiel
- Échecs permanents : Marquage FAILED immédiat
- Intervalle retry : 1min, 5min, 30min

### **Règles de Validation**

- Destinataire doit exister dans le système
- Canal doit être activé pour l'utilisateur
- Contenu doit respecter les limites du canal

## 📈 Performance & Scalability

### **Pagination & Filtering**

- Pas applicable pour l'envoi (endpoint unique)
- Logs et métriques disponibles via endpoints dédiés (à implémenter)

### **Cache Strategy**

- Templates de notification : Redis 1h
- Préférences utilisateur : Redis 30min
- Limitations rate : Redis avec TTL

### **Monitoring**

- Métriques envoi par canal/statut
- Temps de traitement par priorité
- Taux d'échec et causes

## 🔧 Swagger Integration

### **URLs Swagger**

- **Swagger UI** : http://localhost:3000/api/docs
- **OpenAPI JSON** : http://localhost:3000/api/docs-json
- **OpenAPI YAML** : http://localhost:3000/api/docs-yaml

### **Features Swagger Activées**

- ✅ Documentation interactive complète
- ✅ Exemples de requêtes/réponses détaillés
- ✅ Validation des schémas en temps réel
- ✅ Tests API directement depuis l'interface
- ✅ Export collections Postman/Insomnia
- ✅ Génération de clients SDK TypeScript

## 🎯 Guide d'intégration Frontend

### **React/TypeScript Example**

```typescript
import axios from 'axios';

interface NotificationRequest {
  recipientId: string;
  title: string;
  content: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledFor?: string; // ISO 8601
  metadata?: Record<string, any>;
}

interface NotificationResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    sentAt?: string;
    scheduledFor?: string;
    estimatedDelivery?: string;
  };
  meta: {
    timestamp: string;
    correlationId: string;
    processingTime: number;
  };
}

class NotificationService {
  private client = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
      Authorization: `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  async sendNotification(
    request: NotificationRequest,
  ): Promise<NotificationResponse> {
    try {
      const response = await this.client.post<NotificationResponse>(
        '/notifications/send',
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `Notification failed: ${error.response.data.error.message}`,
        );
      }
      throw error;
    }
  }

  // Méthodes utilitaires
  async sendAppointmentConfirmation(
    appointmentId: string,
    clientId: string,
  ): Promise<NotificationResponse> {
    return this.sendNotification({
      recipientId: clientId,
      title: 'Confirmation de rendez-vous',
      content: 'Votre rendez-vous a été confirmé.',
      channel: 'EMAIL',
      priority: 'HIGH',
      metadata: { appointmentId },
    });
  }

  async scheduleReminder(
    appointmentId: string,
    clientId: string,
    reminderTime: Date,
  ): Promise<NotificationResponse> {
    return this.sendNotification({
      recipientId: clientId,
      title: 'Rappel de rendez-vous',
      content: "N'oubliez pas votre rendez-vous de demain.",
      channel: 'SMS',
      priority: 'NORMAL',
      scheduledFor: reminderTime.toISOString(),
      metadata: { appointmentId, type: 'reminder' },
    });
  }

  private getAuthToken(): string {
    // Implémentation selon votre système d'auth
    return localStorage.getItem('auth_token') || '';
  }
}

export const notificationService = new NotificationService();
```

### **Vue.js 3 Composition API Example**

```typescript
import { ref, reactive } from 'vue';

export const useNotifications = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const sendNotification = async (request: NotificationRequest) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }

      return await response.json();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    sendNotification,
  };
};
```

## 🚀 Deployment & Environment

### **Environment Variables**

```bash
# Notifications Configuration
NOTIFICATION_RATE_LIMIT=100          # Notifications per hour per user
NOTIFICATION_RETRY_ATTEMPTS=3        # Max retry attempts
NOTIFICATION_RETRY_DELAY=60000        # Initial retry delay (ms)

# Email Provider (example: SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS Provider (example: Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890

# Push Notifications (example: Firebase)
PUSH_PROVIDER=firebase
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key
```

### **Production Considerations**

- ✅ Rate limiting par IP et utilisateur
- ✅ Queue système pour notifications planifiées
- ✅ Monitoring des taux d'échec par provider
- ✅ Backup des templates critiques
- ✅ Audit trail complet des envois

Cette documentation complète assure une intégration fluide et une utilisation optimale du système de notifications !
