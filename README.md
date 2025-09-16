# 🏢 **API Backend - Gestion de Rendez-vous Enterprise**

<p align="center">
  <img src="https://nestjs.com/iPUT /admin/services/:id/timing      # Configuration durées service
```

## ⏰ **Gestion Horaires Complexes Enterprise**

### 🏢 **Horaires Variables par Jour**
- **Jours de fermeture** configurables (ex: fermé lundi/mardi)  
- **Horaires différents** par jour de la semaine
- **Périodes multiples** dans une journée (ex: 8h-12h puis 14h-18h)
- **Pauses variables** selon le jour et l'activité

### 👥 **Planning Personnel Flexible**
- **Horaires individuels** par employé et par site
- **Pauses personnelles** configurables par jour
- **Jours de congé** et disponibilités variables
- **Heures supplémentaires** avec limites configurables

### 📅 **Cas d'Usage Supportés**
```typescript
// Salon fermé lundi/mardi
{ dayOfWeek: MONDAY, isClosed: true }

// Médecin avec pauses spécialisées
{ personalBreaks: [
  { startTime: "10:30", breakType: "COFFEE", isFlexible: true },
  { startTime: "12:30", breakType: "LUNCH", canBeInterrupted: true }
]}

// Formation équipe le vendredi
{ breakType: "TRAINING", applicableDays: [FRIDAY], priority: HIGH }
```

## 🏛️ **Architecture Clean Architecture**ogo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <strong>API Backend Enterprise</strong> pour la gestion intelligente des rendez-vous<br/>
  Construite avec <strong>Clean Architecture</strong>, <strong>NestJS</strong> et <strong>TypeScript</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Clean%20Architecture-blue" alt="Clean Architecture" />
  <img src="https://img.shields.io/badge/Framework-NestJS-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tests-202%20Passing-green" alt="Tests" />
  <img src="https://img.shields.io/badge/SOLID-Compliant-brightgreen" alt="SOLID" />
  <img src="https://img.shields.io/badge/Type-API%20Backend-orange" alt="API Backend" />
</p>

---

## �️ **Architecture Séparée Frontend/Backend**

### 🎨 **Frontend Next.js** (Application Séparée)
- **Site web public SEO-optimisé** pour prise de rendez-vous internautes
- **Pages statiques générées** avec référencement optimal
- **Interface responsive** mobile-first
- **Core Web Vitals** optimisés pour Google
- **Schema.org markup** et rich snippets

### 🚀 **Backend NestJS** (Ce Projet)
- **API REST enterprise** avec authentification sécurisée
- **Gestion métier complète** des rendez-vous multi-sites
- **Dashboard administrateur** pour entreprises
- **Intégrations tierces** (email, SMS, calendriers)
- **Webhooks temps réel** pour synchronisation

---

## 🎯 **Vision Métier Backend**

API Backend permettant aux entreprises de :

- ✅ **Paramétrer leur système calendaire** via endpoints REST
- ✅ **Intégrer leur personnel** avec rôles spécialisés et plannings
- ✅ **Exposer les créneaux disponibles** aux applications frontend
- ✅ **Automatiser les notifications** email et SMS
- ✅ **Gérer intelligemment** les conflits et capacités multi-sites

## � **Endpoints API Publics - Frontend Next.js**

API REST optimisée pour consommation par le site web Next.js avec **cache-control** et **SEO-friendly responses**.

### 📍 **API Publique - Prise de Rendez-vous**

#### **🔍 Recherche & Disponibilités**
```http
GET /public/businesses              # Liste entreprises avec SEO data
GET /public/businesses/:id/services # Services disponibles + metadata SEO
GET /public/businesses/:id/locations # Sites/adresses de l'entreprise
GET /public/availability            # Créneaux disponibles (cache 5min)
```

#### **📅 Réservation Internautes**
```http
POST /public/appointments           # Création rendez-vous public
GET /public/appointments/:token     # Détails RDV (token public)
PUT /public/appointments/:token     # Modification RDV client
DELETE /public/appointments/:token  # Annulation RDV client
```

#### **👥 Réservations Tierces & Groupes**
```http
POST /public/appointments/third-party    # RDV pour proche/famille
POST /public/appointments/group          # RDV de groupe/famille
GET /public/family-relationships         # Types relations autorisées
```

### 🔒 **API Privée - Dashboard Entreprise**

#### **🏢 Gestion Entreprise**
```http
GET /admin/dashboard/stats          # KPIs et métriques
GET /admin/businesses/:id           # Config entreprise
PUT /admin/businesses/:id/settings  # Paramètres calendaire
```

#### **👨‍💼 Gestion Personnel**
```http
GET /admin/staff                    # Liste personnel avec plannings
POST /admin/staff                   # Ajout nouvel employé
PUT /admin/staff/:id/schedule       # Modification planning
```

#### **📊 Analytics & Rapports**
```http
GET /admin/analytics/appointments   # Stats RDV (CA, taux occupation)
GET /admin/analytics/capacity       # Optimisation capacités
GET /admin/reports/export           # Export données (PDF/Excel)
```

#### **⏰ Gestion Horaires & Créneaux**
```http
GET /admin/businesses/:id/hours     # Horaires d'ouverture par site
PUT /admin/businesses/:id/hours     # Modification horaires
GET /admin/staff/:id/schedule       # Planning personnel détaillé
PUT /admin/staff/:id/schedule       # Modification planning staff
GET /admin/services/:id/timing      # Durées et alignement créneaux
PUT /admin/services/:id/timing      # Configuration durées service
```

## �🏛️ **Architecture Clean Architecture**

Implémentation rigoureuse des **principes de Robert C. Martin** avec 4 couches :

```
🏛️ Domain Layer      → Entités métier et règles business
💼 Application Layer  → Use Cases et orchestration
🔧 Infrastructure    → Implémentations techniques
🎨 Presentation      → Controllers et APIs
```

### **✅ Principes SOLID Respectés**

- **S**ingle Responsibility : Une responsabilité par classe
- **O**pen/Closed : Extension via interfaces
- **L**iskov Substitution : Sous-types substituables
- **I**nterface Segregation : Interfaces spécialisées
- **D**ependency Inversion : Dépendances vers abstractions

## 🎭 **Types d'Utilisateurs**

### 🔴 **SUPER_ADMIN** - Propriétaire/Directeur

- Configuration globale du système calendaire
- Gestion complète du personnel et des services
- Accès aux analytics et rapports business

### 🟡 **MANAGER** - Chef d'équipe/Responsable

- Gestion de son équipe de personnel
- Validation des rendez-vous de son secteur
- Suivi des performances de son équipe

### 🟢 **STAFF** - Personnel/Employé

- Gestion de son planning personnel
- Prise en charge de ses rendez-vous assignés
- Communication avec les clients

### 🔵 **CLIENT** - Client enregistré

- Prise de rendez-vous en ligne
- Gestion de son historique et profil
- Réception des notifications personnalisées

### ⚪ **GUEST** - Internaute non inscrit

- Consultation des créneaux disponibles
- Prise de rendez-vous ponctuelle

## 🚀 **Fonctionnalités Principales**

### 🏢 **Gestion d'Entreprise**

- ✅ Configuration système calendaire et horaires d'ouverture
- ✅ Paramétrage des services proposés et tarification
- ✅ Gestion multi-site et personnalisation

### 👥 **Gestion du Personnel**

- ✅ Intégration employés avec spécialisations
- ✅ Planning individuel et gestion des disponibilités
- ✅ Gestion des congés et absences

### 📅 **Système de Rendez-vous**

- ✅ Prise de rendez-vous en ligne intelligente
- ✅ Validation automatique/manuelle
- ✅ Gestion des créneaux et évitement des conflits
- ✅ Reprogrammation et annulation gracieuse

### 📧 **Communication Multi-canaux**

- ✅ Notifications email automatisées
- 🔄 Notifications SMS (en développement)
- ✅ Rappels personnalisables (J-1, H-2, etc.)
- ✅ Templates personnalisés par événement

## 🛠️ **Installation et Développement**

### **Prérequis**

```bash
Node.js >= 18
Docker & Docker Compose
PostgreSQL 15+
MongoDB 7+
```

### **Installation**

```bash
# Cloner le repository
git clone <repository-url>
cd server

# Installer les dépendances
npm install

# Configuration environment
cp .env.example .env
# Modifier les variables selon votre environnement
```

### **Développement avec Docker**

```bash
# Démarrer tous les services (base de données + application)
make start

# Ou démarrer uniquement les bases de données
make start-db

# Voir les logs
make logs

# Arrêter les services
make stop
```

### **Développement local**

```bash
# Mode développement avec hot reload
npm run start:dev

# Mode debug
npm run start:debug

# Build production
npm run build
npm run start:prod
```

## 🧪 **Tests et Qualité**

### **Tests (228 tests passants)**

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:cov

# Tests E2E
npm run test:e2e
```

### **Qualité de Code**

```bash
# Linting
npm run lint

# Formatage
npm run format

# Vérification architecture Clean
npm run lint:check
```

## 🏗️ **Architecture Technique**

### **Stack Technologique**

- **Backend** : NestJS + TypeScript (strict mode)
- **Base de données** : PostgreSQL 15 + TypeORM
- **Cache** : MongoDB (refresh tokens + métadonnées)
- **Authentification** : JWT avec rotation des tokens
- **Documentation** : OpenAPI/Swagger
- **Tests** : Jest avec TDD strict
- **Containerisation** : Docker + Docker Compose

### **Patterns Implementés**

- ✅ **Clean Architecture** (4 layers)
- ✅ **Domain-Driven Design** (DDD)
- ✅ **Test-Driven Development** (TDD)
- ✅ **Repository Pattern** avec interfaces
- ✅ **Use Case Pattern** pour la logique métier
- ✅ **Value Objects** pour la validation
- ✅ **RBAC** (Role-Based Access Control)

### **Structure du Projet**

```
src/
├── 🏛️ domain/           # Entités, Value Objects, Règles métier
├── 💼 application/      # Use Cases, Ports, Services applicatifs
├── 🔧 infrastructure/   # Implémentations techniques, BDD, APIs
├── 🎨 presentation/     # Controllers, DTOs, Validation
└── 🔗 shared/           # Types, Enums, Utilities partagés
```

## 📚 **Documentation**

- 📋 **[BUSINESS_SCOPE.md](./BUSINESS_SCOPE.md)** - Périmètre fonctionnel détaillé
- 🏛️ **[CLEAN_ARCHITECTURE_REPORT.md](./CLEAN_ARCHITECTURE_REPORT.md)** - Analyse architecture
- 🚀 **[IMPROVEMENT_ROADMAP.md](./IMPROVEMENT_ROADMAP.md)** - Plan d'évolution
- 🔐 **[PASSPORT_INTEGRATION.md](./PASSPORT_INTEGRATION.md)** - Intégration Passport
- 📊 **[FINAL_STATUS_REPORT.md](./FINAL_STATUS_REPORT.md)** - État du projet

## 🔄 **Workflows de Développement**

### **Commits Sémantiques (Obligatoire)**

```bash
# Types autorisés avec émojis
🎉 feat: nouvelle fonctionnalité
🐛 fix: correction de bug
📚 docs: documentation
♻️ refactor: refactoring
✅ test: ajout/modification tests
🔧 chore: maintenance, outils
🔐 security: corrections sécurité
```

### **Processus de Qualité**

```bash
# Pipeline complet
npm run format    # Formatage Prettier
npm run lint      # ESLint (0 erreurs tolérées)
npm test          # 228 tests (100% passants)
npm run build     # Build TypeScript
```

## 🚀 **Roadmap de Développement**

### **Phase 1 : Fondations** ⏳

- ✅ Architecture Clean + SOLID
- ✅ Système d'authentification JWT
- ✅ Gestion des utilisateurs avec RBAC
- ✅ Tests unitaires complets (228 tests)

### **Phase 2 : Métier Core** 🔄

- 🔄 Entités métier (Business, Staff, Appointment)
- 🔄 Use Cases de réservation
- 🔄 Système de calendrier intelligent
- 🔄 Gestion des disponibilités

### **Phase 3 : Communication** 📋

- 📋 Notifications multi-canaux (Email/SMS)
- 📋 Templates personnalisables
- 📋 Système de rappels automatiques
- 📋 Intégration services externes

### **Phase 4 : Interfaces** 📋

- 📋 API REST complète avec OpenAPI
- 📋 Interface client (portail public)
- 📋 Dashboard administrateur
- 📋 Application mobile (optionnel)

## 🎯 **Métriques de Qualité**

### **Standards Maintenus**

- ✅ **228 tests** passants (34 suites)
- ✅ **Clean Architecture** respectée
- ✅ **SOLID principles** appliqués
- ✅ **Type Safety** à 100% (zéro `any`)
- ✅ **Security first** avec JWT + RBAC
- ✅ **TDD strict** sur toute la logique métier

### **Performance Targets**

- 🎯 Temps de réponse API < 200ms
- 🎯 Disponibilité système > 99.5%
- 🎯 Couverture de tests > 90%
- 🎯 Taux de conversion RDV > 85%

## 🤝 **Contribution**

Ce projet suit les **meilleures pratiques enterprise** :

- **Clean Architecture** de Robert C. Martin
- **Principes SOLID** appliqués rigoureusement
- **TDD** avec Jest pour toute nouvelle fonctionnalité
- **TypeScript strict** (zero tolerance pour `any`)
- **Commits sémantiques** obligatoires

## 📄 **License**

Projet sous licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.
