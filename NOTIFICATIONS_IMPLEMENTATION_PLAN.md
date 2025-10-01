# 🚀 PLAN D'IMPLÉMENTATION - SYSTÈME DE NOTIFICATIONS COMPLET

## 📋 État Actuel vs Objectif

### ✅ Déjà en Place

- ✅ **Domain** : Notification Entity + Value Objects complets
- ✅ **Infrastructure** : Repositories et mappers notifications
- ✅ **Dependencies** : BullMQ (^5.59.0) et IORedis (^5.8.0) déjà installés
- ✅ **Presentation** : NotificationController basique
- ✅ **Database** : Table notifications en place

### ❌ À Implémenter

- ❌ **Services Email** : SendGrid ou Nodemailer (déjà installé)
- ❌ **Services SMS** : Twilio
- ❌ **BullMQ Processors** : Traitement asynchrone des notifications
- ❌ **Scheduler** : Rappels automatiques rendez-vous
- ❌ **Use Cases** : Logique métier notifications
- ❌ **Templates** : Email et SMS templates
- ❌ **WebSocket Gateway** : Notifications temps réel

---

## 📦 PHASE 1 : Installation Dépendances Manquantes

### Dépendances à Ajouter

```bash
# Dans le container Docker
docker compose exec app npm install --save \
  @sendgrid/mail@^8.1.0 \
  twilio@^4.20.0 \
  @nestjs/schedule@^4.0.0 \
  @nestjs/websockets@^11.0.0 \
  @nestjs/platform-socket.io@^11.0.0

# Types pour développement
docker compose exec app npm install --save-dev \
  @types/node-schedule@^2.1.0
```

### Variables d'Environnement à Ajouter

```bash
# Ajouter dans .env
# Redis (pour BullMQ)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxx_YOUR_API_KEY_HERE
SENDGRID_FROM_EMAIL=noreply@amrdv.com
SENDGRID_FROM_NAME="AMRDV Platform"

# Twilio (SMS)
TWILIO_ACCOUNT_SID=ACxxx_YOUR_ACCOUNT_SID
TWILIO_AUTH_TOKEN=xxx_YOUR_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+33123456789

# Notifications Config
NOTIFICATION_RATE_LIMIT=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=1000

# Rappels Rendez-vous
APPOINTMENT_REMINDER_24H_ENABLED=true
APPOINTMENT_REMINDER_1H_ENABLED=true
APPOINTMENT_REMINDER_EMAIL_ENABLED=true
APPOINTMENT_REMINDER_SMS_ENABLED=true

# URLs Frontend
FRONTEND_URL=http://localhost:3001
```

---

## 🏗️ PHASE 2 : Infrastructure - Services Email & SMS

### 2.1 Email Service (Port + Adapter)

**Fichiers à créer :**

```
src/application/ports/
└── email.port.ts                          ← Interface IEmailService

src/infrastructure/services/email/
├── email.module.ts                        ← Module NestJS
├── sendgrid-email.service.ts              ← Adapter SendGrid
├── nodemailer-email.service.ts            ← Adapter Nodemailer (backup)
└── templates/
    ├── appointment-reminder-24h.hbs       ← Template Handlebars
    ├── appointment-reminder-1h.hbs
    ├── appointment-confirmed.hbs
    ├── appointment-cancelled.hbs
    ├── new-appointment-staff.hbs
    └── daily-report-business.hbs
```

**Ordre d'implémentation :**

1. `email.port.ts` - Interface pure (Application layer)
2. `sendgrid-email.service.ts` - Implémentation SendGrid
3. Templates Handlebars de base
4. Module NestJS avec injection

### 2.2 SMS Service (Port + Adapter)

**Fichiers à créer :**

```
src/application/ports/
└── sms.port.ts                            ← Interface ISMSService

src/infrastructure/services/sms/
├── sms.module.ts                          ← Module NestJS
├── twilio-sms.service.ts                  ← Adapter Twilio
└── templates/
    └── sms-templates.ts                   ← Templates SMS statiques
```

**Ordre d'implémentation :**

1. `sms.port.ts` - Interface pure
2. `twilio-sms.service.ts` - Implémentation Twilio
3. Templates SMS (plus simples que email)
4. Module NestJS

---

## 🔄 PHASE 3 : BullMQ - Queues et Processors

### 3.1 Configuration des Queues

**Fichiers à créer :**

```
src/infrastructure/queues/
├── queue.module.ts                        ← Module BullMQ global
├── notification-queues.config.ts          ← Config queues
└── jobs/
    └── notification-job.types.ts          ← Types TypeScript jobs
```

### 3.2 Processors

**Fichiers à créer :**

```
src/infrastructure/queues/processors/
├── notification.processor.ts              ← Processor notifications générales
├── appointment-reminder.processor.ts      ← Processor rappels RDV
└── bulk-notification.processor.ts         ← Processor envois masse
```

**Logique Processor :**

```typescript
// Exemple : notification.processor.ts
@Processor(NotificationQueue.IMMEDIATE)
export class NotificationProcessor {
  @Process('send-notification')
  async handleNotification(job: Job<NotificationJobData>) {
    const { notificationId, channel } = job.data;

    // 1. Récupérer notification depuis DB
    // 2. Envoyer selon le canal (email/sms/in-app)
    // 3. Mettre à jour status en DB
    // 4. Retry automatique si échec
  }
}
```

---

## 💼 PHASE 4 : Application - Use Cases

### Use Cases à Créer

**Fichiers à créer :**

```
src/application/use-cases/notifications/
├── send-notification.use-case.ts          ← Envoyer notification simple
├── send-bulk-notifications.use-case.ts    ← Envoyer notifications en masse
├── schedule-notification.use-case.ts      ← Planifier notification
├── mark-notification-read.use-case.ts     ← Marquer comme lue
├── get-user-notifications.use-case.ts     ← Récupérer notifications user
├── cancel-notification.use-case.ts        ← Annuler notification
└── retry-failed-notification.use-case.ts  ← Retry notifications échouées
```

**Ordre de priorité :**

1. `send-notification.use-case.ts` (CRITIQUE)
2. `schedule-notification.use-case.ts` (pour rappels)
3. `mark-notification-read.use-case.ts`
4. `get-user-notifications.use-case.ts`
5. Les autres (nice to have)

---

## ⏰ PHASE 5 : Scheduler - Rappels Automatiques

### 5.1 Configuration Rappels

**Fichiers à créer :**

```
src/infrastructure/services/reminders/
├── appointment-reminder.scheduler.ts      ← Cron jobs rappels
├── appointment-reminder.config.ts         ← Config timing/canaux
└── appointment-reminder.service.ts        ← Service métier rappels
```

### 5.2 Logique Scheduler

**Cron Jobs à implémenter :**

```typescript
// appointment-reminder.scheduler.ts

@Injectable()
export class AppointmentReminderScheduler {
  // Toutes les 15 minutes : Planifier rappels
  @Cron('*/15 * * * *')
  async scheduleUpcomingReminders() {
    // 1. Récupérer RDV des prochaines 72h
    // 2. Pour chaque RDV, créer jobs BullMQ
    // 3. Jobs avec delay calculé (24h avant, 1h avant)
  }

  // Tous les jours à 2h : Cleanup
  @Cron('0 2 * * *')
  async cleanupExpiredReminders() {
    // Nettoyer jobs terminés > 7 jours
  }
}
```

---

## 🎨 PHASE 6 : Presentation - API & WebSocket

### 6.1 Controller HTTP

**Fichiers à modifier/créer :**

```
src/presentation/controllers/
└── notification.controller.ts             ← Compléter endpoints

src/presentation/dtos/notification/
├── send-notification.dto.ts
├── send-bulk-notification.dto.ts
├── schedule-notification.dto.ts
└── notification-response.dto.ts           ← Déjà existe
```

**Endpoints à implémenter :**

```typescript
// NotificationController
POST   /api/v1/notifications/send              // Envoyer notification
POST   /api/v1/notifications/send-bulk         // Envoi en masse
POST   /api/v1/notifications/schedule          // Planifier notification
GET    /api/v1/notifications/me                // Mes notifications
PATCH  /api/v1/notifications/:id/read          // Marquer comme lue
DELETE /api/v1/notifications/:id               // Supprimer notification
POST   /api/v1/notifications/:id/retry         // Retry notification échouée
```

### 6.2 WebSocket Gateway

**Fichiers à créer :**

```
src/presentation/gateways/
└── notification.gateway.ts                ← Real-time notifications
```

**Événements WebSocket :**

```typescript
// Client → Server
- 'subscribe' : S'abonner aux notifications
- 'mark-read' : Marquer comme lue

// Server → Client
- 'notification:new' : Nouvelle notification
- 'notification:read' : Notification lue
- 'notification:deleted' : Notification supprimée
```

---

## 🧪 PHASE 7 : Tests

### Tests à Créer

```
src/application/use-cases/notifications/__tests__/
├── send-notification.use-case.spec.ts
├── send-bulk-notifications.use-case.spec.ts
└── schedule-notification.use-case.spec.ts

src/infrastructure/services/email/__tests__/
├── sendgrid-email.service.spec.ts
└── email-templates.spec.ts

src/infrastructure/services/sms/__tests__/
└── twilio-sms.service.spec.ts

src/infrastructure/queues/processors/__tests__/
├── notification.processor.spec.ts
└── appointment-reminder.processor.spec.ts

test/e2e/
└── notifications.e2e-spec.ts              ← Tests E2E complets
```

---

## 📊 PHASE 8 : Monitoring & Dashboard

### 8.1 Métriques

**Endpoints monitoring :**

```typescript
GET / api / v1 / notifications / stats; // Stats générales
GET / api / v1 / notifications / health; // Santé système
GET / api / v1 / notifications / queue - status; // État des queues
```

### 8.2 Bull Board (Dashboard BullMQ)

```typescript
// main.ts ou module dédié
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';

const serverAdapter = new FastifyAdapter();
createBullBoard({
  queues: [
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(reminderQueue),
  ],
  serverAdapter,
});

// Accessible sur : http://localhost:3000/admin/queues
```

---

## 🔐 PHASE 9 : Sécurité & Permissions

### Règles de Permissions

```typescript
// Permissions à vérifier dans les use cases

// Envoyer notification
SEND_NOTIFICATION:
  - PLATFORM_ADMIN → tous acteurs
  - BUSINESS_OWNER → ses clients et staff
  - STAFF → ses clients assignés
  - CLIENT → jamais (read-only)

// Lire notifications
READ_NOTIFICATIONS:
  - PLATFORM_ADMIN → toutes
  - BUSINESS_OWNER → son business
  - STAFF → ses notifications
  - CLIENT → ses notifications

// Gérer rappels
MANAGE_REMINDERS:
  - PLATFORM_ADMIN → tous
  - BUSINESS_OWNER → son business
  - STAFF → non
  - CLIENT → non
```

---

## 📅 PLANNING ESTIMÉ

### Sprint 1 (Semaine 1) - Infrastructure

- **Jour 1-2** : Email & SMS services (ports + adapters)
- **Jour 3-4** : BullMQ queues & processors
- **Jour 5** : Tests unitaires services

### Sprint 2 (Semaine 2) - Use Cases & Scheduler

- **Jour 1-2** : Use cases notifications
- **Jour 3-4** : Scheduler rappels automatiques
- **Jour 5** : Tests unitaires use cases

### Sprint 3 (Semaine 3) - Presentation & Tests

- **Jour 1-2** : Controllers HTTP + DTOs
- **Jour 3** : WebSocket Gateway
- **Jour 4-5** : Tests E2E complets

### Sprint 4 (Semaine 4) - Monitoring & Documentation

- **Jour 1-2** : Dashboard monitoring + métriques
- **Jour 3-4** : Documentation Swagger complète
- **Jour 5** : Review & optimisations

---

## 🎯 CHECKLIST FINALE

### Infrastructure

- [ ] Email service configuré et testé
- [ ] SMS service configuré et testé
- [ ] BullMQ queues créées et connectées à Redis
- [ ] Processors implémentés avec retry logic
- [ ] Templates email/SMS créés

### Application

- [ ] Use cases notifications implémentés
- [ ] Tests unitaires > 80% coverage
- [ ] Gestion erreurs robuste
- [ ] Logging complet

### Scheduler

- [ ] Cron jobs rappels fonctionnels
- [ ] Configuration par business
- [ ] Tests planification automatique

### Presentation

- [ ] Endpoints HTTP complets
- [ ] WebSocket gateway fonctionnel
- [ ] Documentation Swagger
- [ ] Tests E2E passants

### Monitoring

- [ ] Dashboard BullMQ accessible
- [ ] Métriques exposées
- [ ] Alertes configurées
- [ ] Logs centralisés

### Sécurité

- [ ] Permissions vérifiées partout
- [ ] Rate limiting activé
- [ ] Variables sensibles sécurisées
- [ ] Audit trail complet

---

## 🚀 COMMANDE DE DÉMARRAGE

Une fois tout implémenté, démarrer le système :

```bash
# 1. Démarrer Redis
docker compose up -d redis

# 2. Démarrer l'application
docker compose exec app npm run start:dev

# 3. Vérifier les queues
curl http://localhost:3000/admin/queues

# 4. Tester envoi notification
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user-123",
    "title": "Test Notification",
    "content": "Ceci est un test",
    "channel": "EMAIL",
    "priority": "HIGH"
  }'

# 5. Monitor les logs
docker compose logs -f app | grep -i notification
```

---

## 📞 SUPPORT & RESSOURCES

### Documentation Externe

- **BullMQ** : https://docs.bullmq.io/
- **SendGrid** : https://docs.sendgrid.com/
- **Twilio** : https://www.twilio.com/docs/
- **NestJS Schedule** : https://docs.nestjs.com/techniques/task-scheduling

### Contacts Techniques

- **Lead Backend** : Pour architecture et décisions critiques
- **DevOps** : Pour Redis, monitoring, alertes
- **Product** : Pour templates et règles métier notifications

---

## ✅ VALIDATION & GO LIVE

### Critères de Mise en Production

1. ✅ Tous les tests passent (unit + E2E)
2. ✅ Coverage > 80% sur use cases critiques
3. ✅ Load testing 1000 notifications/min OK
4. ✅ Monitoring et alertes configurés
5. ✅ Documentation complète Swagger
6. ✅ Variables prod sécurisées
7. ✅ Plan de rollback défini
8. ✅ Support équipe formé

### Métriques de Succès

- Taux de délivrabilité email > 98%
- Taux de délivrabilité SMS > 95%
- Temps de traitement < 5s par notification
- Coût par notification < 0.02€
- Uptime queues > 99.9%

---

**Prêt à démarrer l'implémentation ? 🚀**

Confirmez et je commence par créer les services Email et SMS !
