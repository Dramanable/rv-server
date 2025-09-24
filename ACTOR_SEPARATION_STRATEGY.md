# 🎯 STRATÉGIE DE SÉPARATION DES ACTEURS - ARCHITECTURE HYBRIDE

## 🏛️ **RECOMMANDATION : ARCHITECTURE HYBRIDE OPTIMISÉE**

### **✅ DÉCISION ARCHITECTURALE**

Après analyse approfondie du code existant et des besoins métier, je recommande une **approche hybride** qui :

1. **MAINTIENT** l'entité `User` unifiée pour l'authentification
2. **AJOUTE** des entités métier spécialisées pour chaque contexte d'acteur
3. **UTILISE** `businessId` comme clé de tenant isolation
4. **SÉPARE** les endpoints selon le contexte métier (mais pas l'auth)

---

## 🎯 **ARCHITECTURE CIBLE**

### **🏛️ ENTITÉ CENTRALE : User (EXISTANTE - À CONSERVER)**

```typescript
// ✅ MAINTENIR - Entité d'authentification unifiée
export class User {
  readonly id: UserId;
  readonly email: Email;
  readonly name: string;
  readonly role: UserRole;
  readonly businessId?: BusinessId; // Isolation tenant
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  // Méthodes d'authentification et permissions
  hasPermission(permission: Permission): boolean;
  isPlatformAdmin(): boolean;
  isBusinessOwner(): boolean;
  // ... autres méthodes de rôle
}
```

### **👨‍💼 ENTITÉS MÉTIER SPÉCIALISÉES**

#### **1️⃣ Staff (EXISTANTE - DÉJÀ CORRECTE)**

```typescript
// ✅ DÉJÀ IMPLÉMENTÉE - Parfaite pour le contexte professionnel
export class Staff {
  readonly id: UserId;
  readonly userId: UserId; // Référence vers User
  readonly businessId: BusinessId;
  readonly profile: StaffProfile;
  readonly role: StaffRole;
  readonly specializations: string[];
  readonly workingHours: StaffWorkingHours;
  readonly availability: StaffAvailability;

  // Méthodes métier professionnelles
  isAvailableAt(dateTime: Date): boolean;
  canProvideService(serviceId: string): boolean;
  getWorkingHoursForDay(day: DayOfWeek): WorkingHours;
}
```

#### **2️⃣ BusinessOwner (NOUVELLE - À CRÉER)**

```typescript
// 🆕 NOUVELLE ENTITÉ - Contexte propriétaire d'entreprise
export class BusinessOwner {
  readonly id: BusinessOwnerId;
  readonly userId: UserId; // Référence vers User
  readonly businessId: BusinessId;
  readonly subscriptionLevel: SubscriptionLevel;
  readonly permissions: BusinessPermission[];
  readonly billingInfo: BillingInformation;
  readonly analyticsPreferences: AnalyticsPreferences;

  // Méthodes métier business
  canConfigureBusiness(): boolean;
  hasAccessToAnalytics(): boolean;
  canManageStaff(): boolean;
  getBillingStatus(): BillingStatus;
}
```

#### **3️⃣ Client (NOUVELLE - À CRÉER)**

```typescript
// 🆕 NOUVELLE ENTITÉ - Contexte client final
export class Client {
  readonly id: ClientId;
  readonly userId: UserId; // Référence vers User
  readonly preferences: ClientPreferences;
  readonly appointmentHistory: AppointmentSummary[];
  readonly medicalInfo?: MedicalInformation;
  readonly communicationPreferences: CommunicationPreferences;

  // Méthodes métier client
  getUpcomingAppointments(): Appointment[];
  hasAppointmentWith(businessId: BusinessId): boolean;
  getPreferredStaff(): Staff[];
  canBookOnlineWith(businessId: BusinessId): boolean;
}
```

---

## 🚪 **STRATÉGIE D'ENDPOINTS CONTEXTUELS**

### **🔐 AUTHENTIFICATION : ENDPOINTS UNIFIÉS (GARDER ACTUELS)**

```typescript
// ✅ MAINTENIR - Endpoints d'auth partagés pour tous les acteurs
@Controller('auth')
export class AuthController {
  @Post('login')        // Tous les acteurs
  @Post('register')     // Tous les acteurs
  @Post('refresh')      // Tous les acteurs
  @Post('logout')       // Tous les acteurs
}

@Controller('users')
export class UserController {
  @Get('me')            // Profil de base tous acteurs
  @Put('profile')       // Mise à jour profil de base
}
```

### **👨‍💼 ENDPOINTS CONTEXTUELS PAR ACTEUR**

#### **Professionnels/Staff**

```typescript
@Controller('professionals')  // 🆕 NOUVEAU
export class ProfessionalController {
  @Get('dashboard')           // Tableau de bord pro
  @Get('appointments')        // Rendez-vous du pro
  @Put('availability')        // Gestion disponibilités
  @Get('earnings')           // Revenus/statistiques
  @Put('specializations')     // Compétences/spécialisations
}
```

#### **Propriétaires d'entreprise**

```typescript
@Controller('business-owners') // 🆕 NOUVEAU
export class BusinessOwnerController {
  @Get('dashboard')           // Analytics business
  @Put('business-settings')   // Configuration entreprise
  @Get('staff-management')    // Gestion équipe
  @Get('billing')            // Facturation/abonnements
  @Get('analytics')          // Rapports avancés
}
```

#### **Clients finaux**

```typescript
@Controller('clients')        // 🆕 NOUVEAU
export class ClientController {
  @Get('appointments')        // Mes rendez-vous
  @Post('book-appointment')   // Réserver
  @Get('favorites')          // Pros favoris
  @Put('preferences')        // Préférences de réservation
  @Get('history')           // Historique des RDV
}
```

---

## 🏗️ **PLAN D'IMPLÉMENTATION PROGRESSIF**

### **PHASE 1 : CRÉER LES NOUVELLES ENTITÉS (1-2 semaines)**

1. **BusinessOwner Entity + Value Objects**
2. **Client Entity + Value Objects**
3. **Repositories interfaces**
4. **Migrations TypeORM**

### **PHASE 2 : USE CASES CONTEXTUELS (1-2 semaines)**

1. **BusinessOwner Use Cases** (dashboard, settings, analytics)
2. **Client Use Cases** (booking, preferences, history)
3. **Tests unitaires complets**

### **PHASE 3 : PRESENTATION LAYER (1 semaine)**

1. **Controllers contextuels** (ProfessionalController, BusinessOwnerController, ClientController)
2. **DTOs spécialisés** pour chaque contexte
3. **Documentation Swagger** complète

### **PHASE 4 : MIGRATION PROGRESSIVE (1 semaine)**

1. **Migration des données existantes**
2. **Tests d'intégration E2E**
3. **Validation sur environnement de test**

---

## 🎯 **AVANTAGES DE CETTE APPROCHE**

### **✅ BÉNÉFICES ARCHITECTURAUX**

1. **🔐 Sécurité unifiée** : Un seul système d'auth pour tous
2. **📧 Email unique global** : Pas de doublons entre contextes
3. **🎯 Séparation métier claire** : Chaque acteur a ses entités dédiées
4. **⚡ Performance optimisée** : Requêtes ciblées par contexte
5. **🔄 Flexibilité des rôles** : Un utilisateur peut avoir plusieurs contextes
6. **🛡️ Isolation tenant** : businessId garantit la séparation des données

### **✅ BÉNÉFICES DÉVELOPPEMENT**

1. **📋 Code organisé** : Logique métier séparée par acteur
2. **🧪 Tests ciblés** : Tests unitaires spécifiques par contexte
3. **📚 Documentation claire** : APIs spécialisées par usage
4. **🔧 Maintenance facilitée** : Évolutions isolées par contexte
5. **👥 Équipe efficace** : Développement parallèle possible

---

## 🚨 **POINTS D'ATTENTION**

### **⚠️ COMPLEXITÉ À GÉRER**

1. **Mapping complexe** : User → Entités contextuelles
2. **Cohérence des données** : Synchronisation entre entités
3. **Permissions cross-context** : Un user peut avoir plusieurs contextes
4. **Migration progressive** : Transition sans interruption

### **✅ SOLUTIONS PROPOSÉES**

1. **Mappers dédiés** pour chaque transformation
2. **Event sourcing** pour synchronisation automatique
3. **Matrice de permissions** contextuelles
4. **Feature flags** pour migration progressive

---

## 🎯 **RECOMMANDATION FINALE**

**JE RECOMMANDE FORTEMENT cette approche hybride** car elle :

1. **Préserve l'investissement existant** (User, Auth, Staff)
2. **Apporte la spécialisation métier** requise
3. **Maintient la simplicité d'auth** (un seul login)
4. **Permet une évolution progressive** sans cassure
5. **Respecte les principes Clean Architecture**
6. **Optimise l'expérience utilisateur** par contexte

Cette architecture nous donne le meilleur des deux mondes : **simplicité technique ET spécialisation métier**.

Veux-tu que je commence par implémenter la première entité (BusinessOwner ou Client) pour valider cette approche ?
