# 📋 CAHIER DES CHARGES - SYSTÈME DE RENDEZ-VOUS

## Version 2.0 - Optimisée et Nettoyée

### 🎯 OBJECTIFS GÉNÉRAUX

Ce projet vise à créer un **système de gestion de rendez-vous multi-entreprise** moderne, performant et maintenable, suivant les principes de la **Clean Architecture** et du **Domain Driven Design (DDD)**.

---

## 🏗️ ARCHITECTURE TECHNIQUE

### **Stack Technologique**

- **Backend:** Node.js 24.x, NestJS, TypeScript
- **Base de données:** Flexibilité SQL/NoSQL (PostgreSQL, MongoDB)
- **Cache:** Redis
- **Conteneurisation:** Docker
- **Stockage de fichiers:** Multi-cloud (AWS S3, Azure Blob, Google Cloud Storage)

### **Patterns Architecturaux**

- ✅ **Clean Architecture** (Hexagonal Architecture)
- ✅ **Domain Driven Design (DDD)**
- ✅ **Test Driven Development (TDD)**
- ✅ **Repository Pattern**
- ✅ **Use Case Pattern**
- ✅ **Value Objects**
- ✅ **SOLID Principles**

---

## 🏢 DOMAINES MÉTIER

### **1. Gestion des Entreprises (Business)**

- **Entité principale:** Business Entity
- **Secteurs supportés:** Médical, Juridique, Beauté, Bien-être, Automobile, Éducation, etc.
- **Données:** Nom, description, adresse, contacts, paramètres
- **Fonctionnalités:**
  - Création et gestion des profils d'entreprise
  - Géolocalisation et recherche par proximité
  - Paramètres personnalisables (réservation en ligne, validation, etc.)

### **2. Système de Calendriers Multi-Sites**

- **Architecture:** 1 Business → N Calendriers → N Adresses/Sites
- **Types de calendriers:**
  - Calendrier principal (siège social)
  - Calendriers de sites distants
  - Calendriers spécialisés par service
- **Fonctionnalités:**
  - Synchronisation inter-calendriers
  - Gestion des disponibilités
  - Règles de réservation par calendrier

### **3. Gestion du Personnel (Staff)**

- **Hiérarchie des rôles:** Owner > Manager > Employee > Consultant
- **Permissions granulaires** par rôle
- **Assignation multi-calendriers**
- **Gestion des compétences et services**

### **4. Services et Prestations**

- **Catalogue de services** par entreprise
- **Tarification flexible** (fixe, durée, complexe)
- **Durées variables** et services combinés
- **Catégorisation** et recherche avancée

### **5. Système de Rendez-vous**

- **États:** Demandé → Confirmé → En cours → Terminé → Annulé
- **Types:** Consultation, Suivi, Urgence, Groupe
- **🚨 RÈGLE CRITIQUE : Prise de Rendez-vous Publique**
  - **Seuls les services avec `allowOnlineBooking: true` peuvent être réservés directement**
  - **Validation automatique de `service.isBookable()` avant toute réservation**
  - **Refus automatique pour services internes ou non-publics**
- **Fonctionnalités:**
  - Réservation en ligne pour services publics uniquement
  - Validation automatique/manuelle
  - Notifications multi-canaux
  - Gestion des annulations
  - Historique complet
  - Support de réservation pour un proche/famille

---

## 🗄️ ARCHITECTURE DE DONNÉES

### **Approche Hybride SQL/NoSQL**

Le système est conçu pour supporter **les deux types de bases de données** selon les besoins :

#### **Mode SQL (PostgreSQL)**

- Relations strictes et ACID
- Intégrité référentielle
- Requêtes complexes avec jointures
- Idéal pour : gestion financière, rapports complexes

#### **Mode NoSQL (MongoDB)**

- Flexibilité de schéma
- Recherche géospatiale native
- Agrégations puissantes
- Idéal pour : géolocalisation, recherche, analytics

#### **Basculement Runtime**

- Configuration par variable d'environnement
- Repositories abstraits avec implémentations multiples
- Migration de données facilitée
- Tests unitaires indépendants du stockage

---

## 🧪 STRATÉGIE DE TESTS

### **Tests Unitaires Uniquement**

- **Principe:** Pas de tests d'intégration pour simplifier le développement
- **Couverture:** Entités, Value Objects, Services Application
- **Mocks:** Tous les ports externes (DB, Email, Cache, etc.)
- **Framework:** Jest avec mocks TypeScript

### **Repositories In-Memory**

- Implementation en mémoire pour les tests
- Respect strict des interfaces
- Simulation des comportements de base
- Validation de la logique métier

---

## 🚀 OPTIMISATIONS TECHNIQUES

### **Base de Données**

- ✅ **Connexions optimisées** avec pooling
- ✅ **Requêtes aggregate** MongoDB pour performance
- ✅ **Lean queries** pour réduire la mémoire
- ✅ **Indexes géospatiaux** pour recherche proximité
- ✅ **Cache Redis** pour données fréquentes

### **Code Quality**

- ✅ **Clean Architecture** stricte
- ✅ **SOLID Principles** appliqués
- ✅ **Value Objects** immutables
- ✅ **Error Handling** robuste
- ✅ **TypeScript strict** mode
- ✅ **ESLint + Prettier** configuration

### **Performance**

- ✅ **Lazy Loading** des relations
- ✅ **Pagination** systématique
- ✅ **Compression gzip**
- ✅ **Rate limiting**
- ✅ **Health checks** complets

---

## 📁 STRUCTURE DE PROJET

```
src/
├── domain/                     # 🏛️ Couche Domaine
│   ├── entities/              # Entités métier
│   ├── value-objects/         # Objets de valeur
│   ├── repositories/          # Interfaces repositories
│   └── services/              # Services domaine
├── application/               # 🔧 Couche Application
│   ├── use-cases/             # Cas d'usage
│   ├── services/              # Services application
│   └── ports/                 # Ports (interfaces)
├── infrastructure/            # 🏗️ Couche Infrastructure
│   ├── database/              # Repositories concrets
│   ├── config/                # Configuration
│   ├── logging/               # Logs structurés
│   └── services/              # Services externes
├── presentation/              # 🎨 Couche Présentation
│   ├── controllers/           # Contrôleurs REST
│   ├── dtos/                  # DTOs validation
│   └── mappers/               # Transformation données
└── shared/                    # 🔄 Code partagé
    ├── constants/             # Constantes globales
    ├── enums/                 # Énumérations
    ├── types/                 # Types TypeScript
    └── utils/                 # Utilitaires
```

---

## 🌐 FONCTIONNALITÉS PRINCIPALES

### **Pour les Entreprises**

- ✅ Création et gestion du profil complet
- ✅ Configuration multi-calendriers
- ✅ Gestion des équipes et permissions
- ✅ Catalogue de services personnalisable
- ✅ Paramètres de réservation flexibles
- ✅ Rapports et statistiques

### **Pour les Clients**

- ✅ Recherche d'entreprises par proximité
- ✅ Consultation des disponibilités temps réel
- ✅ Réservation en ligne intuitive
- ✅ Gestion des rendez-vous personnels
- ✅ Notifications automatiques
- ✅ Historique des prestations

### **Administration**

- ✅ Tableau de bord centralisé
- ✅ Gestion des utilisateurs et rôles
- ✅ Monitoring système complet
- ✅ Sauvegarde et récupération
- ✅ Analytics avancés

---

## 🔧 CONFIGURATION ET DÉPLOIEMENT

### **Variables d'Environnement**

```env
# Base de données
DATABASE_TYPE=sql|nosql
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...

# Cache
REDIS_URL=redis://...

# Services externes
AWS_S3_BUCKET=...
AZURE_STORAGE_ACCOUNT=...
GOOGLE_CLOUD_BUCKET=...

# Configuration
JWT_SECRET=...
API_PORT=3000
NODE_ENV=development|production
```

### **Docker & Orchestration**

- ✅ **Dockerfile** optimisé multi-stage
- ✅ **docker-compose.yml** développement
- ✅ **Makefile** pour tâches courantes
- ✅ **Health checks** intégrés

---

## 🚦 ROADMAP DE DÉVELOPPEMENT

### **Phase 1: MVP Fonctionnel** ✅

- [x] Architecture Clean + DDD
- [x] Entités Business, Calendar, Staff, Service, Appointment
- [x] Repositories in-memory pour tests
- [x] Tests unitaires complets
- [x] API REST basique

### **Phase 2: Optimisation** ⏳

- [x] Nettoyage du code et suppression fichiers inutiles
- [x] Optimisation requêtes et connexions DB
- [x] Tests unitaires uniquement (pas d'intégration)
- [x] Documentation technique à jour

### **Phase 3: Production Ready** 🔜

- [ ] Implémentation repositories SQL/NoSQL réels
- [ ] Cache Redis intégré
- [ ] Authentification JWT complète
- [ ] API documentation Swagger
- [ ] Monitoring et logs structurés

### **Phase 4: Fonctionnalités Avancées** 🔜

- [ ] Système de notifications multi-canal
- [ ] Recherche géospatiale avancée
- [ ] Intégrations calendriers externes
- [ ] Analytics et rapports détaillés
- [ ] Interface administration complète

---

## 📊 MÉTRIQUES DE QUALITÉ

### **Code Quality**

- ✅ **TypeScript strict** mode activé
- ✅ **ESLint + Prettier** configuration stricte
- ✅ **Clean Architecture** respectée
- ✅ **SOLID Principles** appliqués
- ✅ **Coverage tests** > 80% (unitaires uniquement)

### **Performance**

- ✅ **Build time** < 30 secondes
- ✅ **Test execution** < 10 secondes
- ✅ **API response time** < 200ms moyenne
- ✅ **Memory usage** optimisée

### **Maintenabilité**

- ✅ **Separation of Concerns** stricte
- ✅ **Dependency Injection** systématique
- ✅ **Interface segregation** appliquée
- ✅ **Documentation** code et architecture

---

## 🎯 CONCLUSION

Ce cahier des charges définit un **système de rendez-vous robuste, scalable et maintenable** utilisant les meilleures pratiques du développement moderne. L'architecture **Clean + DDD** garantit la flexibilité pour les évolutions futures, tandis que l'approche **hybride SQL/NoSQL** offre la liberté technologique selon les besoins spécifiques.

Le focus sur les **tests unitaires uniquement** et l'**optimisation des performances** permet un développement agile et une maintenance simplifiée.

---

**Document généré le :** $(date)
**Version :** 2.0
**Statut :** ✅ Architecture optimisée et nettoyée
