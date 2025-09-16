# 🎭 SYSTÈME DE RÔLES ET PERMISSIONS AMÉLIORÉ

## 📋 Vue d'Ensemble

Le système de rôles a été complètement repensé pour s'adapter aux besoins d'un système de gestion de rendez-vous professionnel multi-métier (avocats, dentistes, cliniques, centres de bien-être, etc.).

## 🎯 Changements Majeurs

### 🔄 Migration des Rôles

**AVANT** (3 rôles basiques) ➡️ **APRÈS** (14 rôles granulaires)

| Ancien Rôle | Nouveaux Rôles Équivalents |
|-------------|---------------------------|
| `SUPER_ADMIN` | `PLATFORM_ADMIN` |
| `MANAGER` | `BUSINESS_OWNER`, `BUSINESS_ADMIN`, `LOCATION_MANAGER`, `DEPARTMENT_HEAD` |
| `USER` | `REGULAR_CLIENT` + tous les autres selon le contexte |

### 🏗️ Architecture Hiérarchique

```
🔴 PLATFORM (Multi-tenant)
├── PLATFORM_ADMIN (1000)

🟠 BUSINESS (Entreprise)
├── BUSINESS_OWNER (900)
└── BUSINESS_ADMIN (800)

🟡 MANAGEMENT (Gestion)
├── LOCATION_MANAGER (700)
└── DEPARTMENT_HEAD (600)

🟢 OPÉRATIONNEL (Praticiens)
├── SENIOR_PRACTITIONER (500)
├── PRACTITIONER (400)
└── JUNIOR_PRACTITIONER (300)

🔵 SUPPORT (Personnel)
├── SCHEDULER (250)
├── RECEPTIONIST (200)
└── ASSISTANT (150)

🟣 CLIENTS (Externes)
├── CORPORATE_CLIENT (100)
├── VIP_CLIENT (80)
├── REGULAR_CLIENT (60)
└── GUEST_CLIENT (40)
```

## 🎭 Détail des Rôles

### 🔴 Niveau Platform

#### `PLATFORM_ADMIN`
- **Contexte**: Administrateur de la plateforme SaaS
- **Portée**: Multi-tenant, accès à tous les business
- **Permissions**: Toutes les permissions disponibles
- **Cas d'usage**: Support technique, maintenance système

### 🟠 Niveau Business

#### `BUSINESS_OWNER`
- **Contexte**: Propriétaire principal de l'entreprise
- **Portée**: Une entreprise complète
- **Permissions**: Configuration business, gestion staff, finances
- **Cas d'usage**: Directeur de clinique, propriétaire de cabinet

#### `BUSINESS_ADMIN`
- **Contexte**: Administrateur délégué
- **Portée**: Une entreprise, permissions limitées
- **Permissions**: Gestion opérationnelle sans accès finances critiques
- **Cas d'usage**: Directeur adjoint, manager général

### 🟡 Niveau Management

#### `LOCATION_MANAGER`
- **Contexte**: Gestionnaire d'un site spécifique
- **Portée**: Un lieu géographique
- **Permissions**: Gestion équipe et opérations du site
- **Cas d'usage**: Chef de site, responsable de succursale

#### `DEPARTMENT_HEAD`
- **Contexte**: Chef d'un département/service
- **Portée**: Une spécialité médicale/juridique
- **Permissions**: Gestion équipe spécialisée
- **Cas d'usage**: Chef de service dentaire, responsable contentieux

### 🟢 Niveau Opérationnel

#### `SENIOR_PRACTITIONER`
- **Contexte**: Praticien senior avec responsabilités
- **Portée**: Ses patients + mentorat junior
- **Permissions**: Agenda + supervision + formation
- **Cas d'usage**: Médecin senior, avocat associé

#### `PRACTITIONER`
- **Contexte**: Praticien standard certifié
- **Portée**: Ses patients assignés
- **Permissions**: Agenda personnel + consultations
- **Cas d'usage**: Médecin, dentiste, avocat

#### `JUNIOR_PRACTITIONER`
- **Contexte**: Praticien en formation/supervision
- **Portée**: Patients assignés sous supervision
- **Permissions**: Limitées, nécessite approbation
- **Cas d'usage**: Résident, stagiaire avocat

### 🔵 Niveau Support

#### `SCHEDULER`
- **Contexte**: Spécialiste de la planification
- **Portée**: Tous les agendas pour optimisation
- **Permissions**: Planification avancée, analytics
- **Cas d'usage**: Coordinateur RDV, gestionnaire planning

#### `RECEPTIONIST`
- **Contexte**: Accueil et front office
- **Portée**: Toutes les réservations clients
- **Permissions**: Réservation, paiement, communication
- **Cas d'usage**: Réceptionniste, secrétaire

#### `ASSISTANT`
- **Contexte**: Support aux praticiens
- **Portée**: Praticiens assignés
- **Permissions**: Support administratif
- **Cas d'usage**: Assistant médical, secrétaire juridique

### 🟣 Niveau Client

#### `CORPORATE_CLIENT`
- **Contexte**: Entreprise cliente
- **Portée**: Employés de l'entreprise
- **Permissions**: Réservation pour équipes
- **Cas d'usage**: RH d'entreprise, médecine du travail

#### `VIP_CLIENT`
- **Contexte**: Client privilégié
- **Portée**: Famille élargie
- **Permissions**: Priorité, services premium
- **Cas d'usage**: Client fidèle, patient VIP

#### `REGULAR_CLIENT`
- **Contexte**: Client particulier standard
- **Portée**: Lui-même + famille proche
- **Permissions**: Réservation de base
- **Cas d'usage**: Patient individuel, client standard

#### `GUEST_CLIENT`
- **Contexte**: Visiteur sans compte
- **Portée**: Une consultation ponctuelle
- **Permissions**: Très limitées
- **Cas d'usage**: Premier contact, urgence

## 🔐 Système de Permissions

### 📊 Domaines Fonctionnels

#### 🏢 Business Management
- `CONFIGURE_BUSINESS_SETTINGS`
- `MANAGE_BUSINESS_LOCATIONS` 
- `MANAGE_BUSINESS_BRANDING`
- `VIEW_BUSINESS_ANALYTICS`
- `MANAGE_BILLING_SETTINGS`

#### 👥 Staff Management
- `MANAGE_ALL_STAFF`
- `HIRE_STAFF` / `FIRE_STAFF`
- `ASSIGN_ROLES`
- `VIEW_STAFF_PERFORMANCE`
- `APPROVE_STAFF_LEAVE`

#### 📅 Calendar Management
- `CONFIGURE_BUSINESS_CALENDAR`
- `MANAGE_CALENDAR_RULES`
- `OVERRIDE_CALENDAR_RULES`
- `BLOCK_TIME_SLOTS`
- `MANAGE_HOLIDAYS`
- `VIEW_ALL_CALENDARS`

#### 🛎️ Service Management
- `MANAGE_SERVICE_CATALOG`
- `CREATE_SERVICES`
- `UPDATE_SERVICE_PRICING`
- `MANAGE_SERVICE_PACKAGES`
- `ASSIGN_SERVICES_TO_STAFF`

#### 📞 Appointment Management
- `BOOK_ANY_APPOINTMENT`
- `BOOK_FOR_OTHERS`
- `RESCHEDULE_ANY_APPOINTMENT`
- `CANCEL_ANY_APPOINTMENT`
- `CONFIRM_APPOINTMENTS`
- `VIEW_ALL_APPOINTMENTS`
- `MANAGE_WAITING_LIST`

#### 👤 Client Management
- `MANAGE_ALL_CLIENTS`
- `VIEW_CLIENT_HISTORY`
- `CREATE_CLIENT_ACCOUNTS`
- `EXPORT_CLIENT_DATA`
- `MANAGE_CLIENT_NOTES`

### 🎯 Permissions Contextuelles

Le système prend en compte le **type d'entreprise** pour ajuster les permissions :

```typescript
// Exemple pour une clinique médicale
const medicalPermissions = RoleUtils.getEffectivePermissions(
  UserRole.PRACTITIONER,
  BusinessType.MEDICAL_CLINIC
);
// Ajoute automatiquement : VIEW_CLIENT_HISTORY, MANAGE_CLIENT_NOTES
```

## 🛠️ Utilisation Pratique

### 🎛️ API RoleUtils

```typescript
import { RoleUtils, UserRole, Permission, BusinessType } from '@/shared/enums/user-role.enum';

// Vérifier une permission
const canManageStaff = RoleUtils.hasPermission(
  UserRole.BUSINESS_OWNER, 
  Permission.MANAGE_ALL_STAFF
); // true

// Vérifier la hiérarchie
const canAct = RoleUtils.canActOnRole(
  UserRole.BUSINESS_OWNER,
  UserRole.PRACTITIONER
); // true

// Obtenir les rôles assignables
const assignableRoles = RoleUtils.getAssignableRoles(UserRole.LOCATION_MANAGER);
// Retourne les rôles de niveau inférieur

// Permissions effectives selon le contexte
const permissions = RoleUtils.getEffectivePermissions(
  UserRole.PRACTITIONER,
  BusinessType.DENTAL_OFFICE
);
```

### 🏥 Intégration avec l'Entité User

```typescript
import { User } from '@/domain/entities/user.entity';

const doctor = new User(email, 'Dr. Smith', UserRole.PRACTITIONER);

// Nouvelles méthodes disponibles
doctor.isPractitioner(); // true
doctor.isManager(); // false
doctor.isClient(); // false
doctor.getRoleLevel(); // 400

// Logique métier mise à jour
const patient = new User(patientEmail, 'John Doe', UserRole.REGULAR_CLIENT);
doctor.canActOnUser(patient); // true (niveau supérieur)
```

### 📋 Mapping avec StaffRole

```typescript
import { StaffRole, StaffRoleUtils } from '@/shared/enums/staff-role.enum';

// Conversion automatique pour les permissions
const staffRole = StaffRole.DOCTOR;
const userRole = StaffRoleUtils.toUserRole(staffRole); // UserRole.PRACTITIONER

// Informations sur le rôle
StaffRoleUtils.isPractitionerRole(StaffRole.DOCTOR); // true
StaffRoleUtils.requiresLicense(StaffRole.DOCTOR); // true
StaffRoleUtils.getSeniorityLevel(StaffRole.SENIOR_DOCTOR); // SeniorityLevel.SENIOR
```

## 🔄 Migration et Compatibilité

### 📦 Mise à Jour des Tests

Les tests existants ont été mis à jour pour utiliser les nouveaux rôles :

```typescript
// AVANT
const user = new User(email, 'User', UserRole.USER);
const manager = new User(email, 'Manager', UserRole.MANAGER);

// APRÈS
const client = new User(email, 'Client', UserRole.REGULAR_CLIENT);
const owner = new User(email, 'Owner', UserRole.BUSINESS_OWNER);
```

### 🔧 Points de Compatibilité

1. **Entité User** : ✅ Mise à jour avec nouvelles méthodes
2. **Tests** : ✅ Migration complète
3. **Permissions** : ✅ Système granulaire
4. **Documentation** : ✅ Guide complet

## 🎯 Avantages du Nouveau Système

### ✨ Flexibilité
- **Multi-métier** : Adapté à tous types de professionnels
- **Granularité** : Permissions précises par contexte
- **Évolutivité** : Ajout facile de nouveaux rôles

### 🔒 Sécurité
- **Hiérarchie claire** : Prévient les escalades non autorisées
- **Principe du moindre privilège** : Permissions minimales nécessaires
- **Contexte métier** : Permissions adaptées au secteur

### 🏗️ Architecture
- **Clean Architecture** : Respecte les principes Domain-Driven
- **Type Safety** : Typage TypeScript complet
- **Testabilité** : Utilitaires facilement testables

### 🚀 Performance
- **Cache intelligent** : Permissions pré-calculées
- **Validation rapide** : Hiérarchie numérique
- **Évite les requêtes DB** : Logique en mémoire

## 📈 Cas d'Usage Métier

### 🏥 Clinique Médicale
```
BUSINESS_OWNER (Directeur)
├── DEPARTMENT_HEAD (Chef service cardio)
├── SENIOR_PRACTITIONER (Cardiologue senior)
├── PRACTITIONER (Cardiologue)
├── JUNIOR_PRACTITIONER (Interne)
├── RECEPTIONIST (Accueil)
└── REGULAR_CLIENT (Patient)
```

### ⚖️ Cabinet d'Avocat
```
BUSINESS_OWNER (Associé principal)
├── SENIOR_PRACTITIONER (Avocat associé)
├── PRACTITIONER (Avocat)
├── JUNIOR_PRACTITIONER (Collaborateur)
├── ASSISTANT (Secrétaire juridique)
└── CORPORATE_CLIENT (Entreprise cliente)
```

### 💄 Salon de Beauté
```
BUSINESS_OWNER (Propriétaire)
├── LOCATION_MANAGER (Chef salon)
├── SENIOR_PRACTITIONER (Styliste senior)
├── PRACTITIONER (Styliste)
├── RECEPTIONIST (Accueil)
└── VIP_CLIENT (Client fidèle)
```

Ce système offre maintenant la flexibilité et la granularité nécessaires pour gérer efficacement tous types d'entreprises de services professionnels ! 🎉
