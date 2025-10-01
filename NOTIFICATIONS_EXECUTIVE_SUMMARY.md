# 📋 RÉSUMÉ EXÉCUTIF - SYSTÈME DE NOTIFICATIONS MULTI-ACTEURS

## 🎯 Objectif

Implémenter un **système de notifications complet et professionnel** pour gérer la communication entre les 3 types d'acteurs de la plateforme AMRDV :

1. **🏢 Platform Admins** (NOUS - équipe SaaS)
2. **👨‍💼 Business Users** (Professionnels B2B)
3. **🌐 End Clients** (Clients finaux B2C)

---

## 🏗️ Architecture Proposée

### Stack Technique (Déjà en Place ✅)

- ✅ **NestJS 11** - Framework backend
- ✅ **TypeORM** - ORM avec PostgreSQL
- ✅ **BullMQ 5.59** - File d'attente asynchrone
- ✅ **IORedis 5.8** - Client Redis pour BullMQ
- ✅ **Handlebars 4.7** - Templates engine
- ✅ **Nodemailer 7.0** - Service email (backup)

### Stack à Ajouter ⚠️

- ⚠️ **@sendgrid/mail 8.1** - Service email principal
- ⚠️ **Twilio 4.20** - Service SMS
- ⚠️ **@nestjs/schedule 4.0** - Cron jobs automatiques
- ⚠️ **@nestjs/websockets 11** - Notifications temps réel

---

## 📊 Types de Notifications Par Acteur

### 1️⃣ Platform Admins (8 types)

- Nouvelle inscription business
- Upgrade/downgrade abonnement
- Échec paiement client
- Alertes système critiques
- Support tickets urgents
- Détection fraude
- Quotas dépassés
- Health monitoring

### 2️⃣ Business Users (15 types)

**Business Owners :**

- Nouveau rendez-vous réservé
- Annulation client
- Reprogrammation
- Paiement reçu
- Rapports journaliers/hebdomadaires
- Renouvellement abonnement
- Staff modifie disponibilités

**Staff/Practitioners :**

- Nouveau RDV assigné
- Rappel RDV dans 1h
- Client annule
- Client no-show
- Planning modifié
- Message client
- Début de shift

**Support Staff :**

- Demande RDV à confirmer
- Demande annulation
- Problème paiement
- Question client

### 3️⃣ End Clients (9 types)

- RDV confirmé par professionnel
- Rappel 24h avant RDV ⏰
- Rappel 1h avant RDV ⏰
- Business annule RDV
- RDV reprogrammé
- Confirmation paiement
- Demande avis après RDV
- Modification service
- Changement praticien

---

## 🔄 Flux de Traitement Asynchrone

```
┌─────────────────────────────────────────────────────────────┐
│  Événement Métier (ex: Appointment Booked)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Use Case: SendNotificationUseCase                           │
│  - Créer Notification Entity en base                         │
│  - Envoyer job à BullMQ avec notificationId                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Redis/BullMQ: Queue avec priorité + retry logic            │
│  - IMMEDIATE (priorité haute, retry 3x)                      │
│  - SCHEDULED (différé avec delay)                            │
│  - CRITICAL (retry 5x, priorité max)                         │
│  - BULK (rate limited pour campagnes)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Processor: NotificationProcessor                            │
│  - Récupérer notification depuis DB                          │
│  - Router selon canal (EMAIL/SMS/IN_APP)                     │
│  - Appeler service externe (SendGrid/Twilio)                 │
│  - Update status en DB (sent/delivered/failed)               │
│  - Retry automatique si échec                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Services Externes                                           │
│  - SendGrid: Envoi email avec templates                      │
│  - Twilio: Envoi SMS formaté                                 │
│  - WebSocket: Push temps réel in-app                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Callback/Webhook (optionnel)                                │
│  - SendGrid: Événements open/click/bounce                    │
│  - Twilio: Statut délivrance SMS                             │
│  - Mise à jour analytics en base                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⏰ Rappels Automatiques de Rendez-vous

### Mécanisme de Planification

```typescript
// Cron Job : Toutes les 15 minutes
@Cron('*/15 * * * *')
async scheduleUpcomingReminders() {
  // 1. Récupérer RDV des prochaines 72h sans rappels planifiés
  const appointments = await appointmentRepo.findUpcoming({
    startDate: now,
    endDate: now + 72h,
    hasRemindersScheduled: false
  });

  // 2. Pour chaque RDV, créer jobs BullMQ avec delay
  for (const appt of appointments) {
    // Job rappel 24h avant
    await reminderQueue.add('24h-reminder', {
      appointmentId: appt.id,
      channels: ['EMAIL', 'SMS']
    }, {
      delay: calculateDelay(appt.dateTime, 24 * 60 * 60 * 1000)
    });

    // Job rappel 1h avant
    await reminderQueue.add('1h-reminder', {
      appointmentId: appt.id,
      channels: ['SMS']
    }, {
      delay: calculateDelay(appt.dateTime, 1 * 60 * 60 * 1000)
    });
  }
}
```

### Configuration Par Business

Chaque business peut configurer :

- ✅ Activer/désactiver rappels
- ✅ Timing personnalisé (24h, 1h, custom)
- ✅ Canaux préférés (Email, SMS, les deux)
- ✅ Templates personnalisés
- ✅ Langue et timezone

---

## 💰 Coûts Estimés

### SendGrid (Email)

- **Plan** : Essentials - $19.95/mois
- **Volume** : 100 000 emails/mois inclus
- **Coût additionnel** : $0.20/1000 au-delà
- **Estimé pour 1000 users actifs** : ~$30/mois

### Twilio (SMS)

- **Coût par SMS France** : ~$0.08 (0.075€)
- **Volume estimé** :
  - 1000 RDV/jour × 2 SMS (24h + 1h) = 2000 SMS/jour
  - 60 000 SMS/mois = ~€4500/mois
- **Optimisation** :
  - SMS uniquement pour rappel 1h (urgent)
  - Email pour rappel 24h
  - → Réduction à 1000 SMS/jour = ~€2250/mois

### Total Estimé

- **Email** : ~€30/mois
- **SMS** : ~€2250/mois (optimisé)
- **Redis** : €0 (déjà inclus Docker)
- **TOTAL** : **~€2280/mois** pour 1000 RDV/jour

**Note** : Coûts facturables aux clients business dans les plans Premium/Enterprise.

---

## 🚀 Plan d'Implémentation (4 Semaines)

### Semaine 1 : Infrastructure

- **Lundi-Mardi** : Email & SMS services
- **Mercredi-Jeudi** : BullMQ queues & processors
- **Vendredi** : Tests unitaires services

### Semaine 2 : Use Cases & Scheduler

- **Lundi-Mardi** : Use cases notifications
- **Mercredi-Jeudi** : Scheduler rappels automatiques
- **Vendredi** : Tests unitaires + intégration

### Semaine 3 : Presentation & Tests

- **Lundi-Mardi** : Controllers HTTP + DTOs
- **Mercredi** : WebSocket Gateway
- **Jeudi-Vendredi** : Tests E2E complets

### Semaine 4 : Monitoring & Documentation

- **Lundi-Mardi** : Dashboard monitoring + métriques
- **Mercredi-Jeudi** : Documentation Swagger complète
- **Vendredi** : Review & optimisations

---

## ✅ Critères de Succès

### Fonctionnels

- ✅ Notifications persistées en base avec historique
- ✅ Envoi asynchrone avec retry automatique
- ✅ Multi-canal (Email, SMS, In-App)
- ✅ Rappels automatiques 24h et 1h avant RDV
- ✅ Templates personnalisables par business
- ✅ WebSocket pour notifications temps réel

### Non-Fonctionnels

- ✅ Taux de délivrabilité > 98% (email) et > 95% (SMS)
- ✅ Temps de traitement < 5s par notification
- ✅ Rate limiting pour prévenir spam
- ✅ Monitoring et alertes opérationnels
- ✅ Coverage tests > 80%

### Sécurité

- ✅ Permissions granulaires par acteur
- ✅ Rate limiting anti-spam
- ✅ Audit trail complet
- ✅ Variables sensibles sécurisées
- ✅ Validation inputs stricte

---

## 🎯 Livrables

### Code

1. **Services Email/SMS** avec adapters (SendGrid, Twilio)
2. **BullMQ Queues** avec processors et retry logic
3. **Use Cases** notifications (send, schedule, bulk)
4. **Scheduler** rappels automatiques avec cron jobs
5. **Controllers HTTP** + DTOs validés
6. **WebSocket Gateway** pour temps réel
7. **Tests** unitaires + E2E (>80% coverage)

### Documentation

1. **Architecture complète** (✅ déjà créé)
2. **Plan d'implémentation** (✅ déjà créé)
3. **Documentation Swagger** API complète
4. **Guide configuration** (variables env, templates)
5. **Runbook opérationnel** (monitoring, troubleshooting)

### Infrastructure

1. **Variables environnement** configurées
2. **Dashboard BullMQ** accessible
3. **Monitoring** et alertes configurés
4. **Templates** email/SMS de base créés

---

## ⚠️ Risques & Mitigation

### Risque 1 : Coûts SMS Élevés

**Mitigation** :

- Limiter SMS aux rappels urgents (1h avant)
- Email pour rappels anticipés (24h)
- Configuration par business (opt-out SMS)
- Monitoring coûts en temps réel avec alertes

### Risque 2 : Délivrabilité Email

**Mitigation** :

- Utiliser SendGrid (réputation établie)
- Configurer SPF, DKIM, DMARC
- Monitoring bounce rate
- Fallback vers Nodemailer si SendGrid down

### Risque 3 : Charge Redis/BullMQ

**Mitigation** :

- Rate limiting sur queues
- Monitoring queue size avec alertes
- Cleanup jobs terminés (retention 7 jours)
- Scalabilité horizontale Redis si nécessaire

### Risque 4 : Spam Utilisateurs

**Mitigation** :

- Rate limiting strict (100 notif/h/user)
- Préférences utilisateur (opt-in/opt-out)
- Consolidation notifications (digest)
- Unsubscribe link dans tous les emails

---

## 🔐 Sécurité & Conformité

### RGPD

- ✅ Consentement explicite pour notifications SMS/Email
- ✅ Unsubscribe/opt-out disponible
- ✅ Données notifications anonymisées après 90 jours
- ✅ Export données utilisateur inclut historique notifications

### Sécurité

- ✅ Variables sensibles (API keys) dans secrets manager
- ✅ Rate limiting anti-spam
- ✅ Validation stricte inputs (XSS, injection)
- ✅ Audit trail complet (qui envoie quoi à qui)
- ✅ Encryption données sensibles en base

---

## 📞 Points de Décision Requis

### Décision 1 : Service Email Principal

**Options** :

- A) SendGrid (recommandé) - $19.95/mois, réputation établie
- B) Nodemailer + SMTP (gratuit mais gestion serveur)
- C) AWS SES (pay-as-you-go, intégration AWS)

**Recommandation** : **SendGrid** pour simplicité et délivrabilité.

### Décision 2 : Service SMS

**Options** :

- A) Twilio (recommandé) - Fiable, documentation excellente
- B) OVH SMS - Moins cher, Europe-focused
- C) Multiple providers avec fallback

**Recommandation** : **Twilio** pour fiabilité et SDK complet.

### Décision 3 : Stratégie Rappels SMS

**Options** :

- A) SMS pour tous rappels (24h + 1h) - Coût élevé
- B) SMS uniquement rappel 1h - Coût optimisé (recommandé)
- C) Email seulement - Gratuit mais moins urgent

**Recommandation** : **Option B** (SMS 1h, Email 24h).

### Décision 4 : WebSocket Temps Réel

**Options** :

- A) Implémenter maintenant - Expérience utilisateur premium
- B) Phase 2 - Focus MVP d'abord

**Recommandation** : **Implémenter maintenant** (Sprint 3) car dépendances déjà présentes.

---

## ✅ VALIDATION REQUISE

**Avant de commencer l'implémentation, merci de valider :**

1. ✅ Architecture proposée approuvée
2. ✅ Budget SMS/Email accepté (~€2280/mois estimé)
3. ✅ Planning 4 semaines réaliste
4. ✅ Choix SendGrid + Twilio confirmé
5. ✅ Stratégie rappels (SMS 1h + Email 24h) validée
6. ✅ Priorités fonctionnalités confirmées
7. ✅ Ressources équipe disponibles

---

**Prêt à démarrer dès validation ! 🚀**

**Contact** : Confirmez via message et je commence immédiatement par la création des services Email et SMS avec leurs ports/adapters selon Clean Architecture.
