# 👥 RÔLES DÉTAILLÉS DES 3 ACTEURS - ARCHITECTURE SIMPLIFIÉE

## 📋 CONTEXTE TECHNIQUE

**Architecture Simplifiée** : Une seule base de données avec `businessId` comme identifiant tenant

- Chaque Business représente un **tenant** (client professionnel)
- Les données sont isolées par `businessId` dans chaque table
- Row-Level Security (RLS) assure l'isolation automatique

---

## 🏢 ACTEUR 1 : NOUS (L'ENTREPRISE ÉDITRICE)

### **🎯 IDENTITÉ ET MISSION**

**Qui sommes-nous** : L'équipe qui développe, commercialise et exploite la plateforme SaaS
**Mission** : Créer la solution de rendez-vous leader en Europe, maximiser l'ARR et la satisfaction client

### **👨‍💻 ÉQUIPE ET RÔLES**

#### **Direction & Stratégie**

- **CEO** : Vision produit, levées de fonds, partenariats stratégiques
- **CTO** : Architecture technique, choix technologiques, équipe dev
- **Head of Product** : Roadmap produit, priorisation features, UX/UI
- **Head of Sales** : Stratégie commerciale, pricing, canaux d'acquisition

#### **Équipe Technique**

- **Lead Developers** : Architecture, code review, mentoring équipe
- **Frontend Developers** : Interfaces B2B (admin) et B2C (booking)
- **Backend Developers** : APIs, business logic, optimisations performance
- **DevOps Engineers** : Infrastructure, CI/CD, monitoring, sécurité
- **QA Engineers** : Tests automatisés, validation fonctionnelle

#### **Équipe Business**

- **Account Managers** : Relation client B2B, upselling, retention
- **Customer Success** : Onboarding, formation, support premium
- **Marketing** : Acquisition leads, content marketing, événements
- **Support** : Tickets techniques, documentation, formation utilisateurs

### **💼 RESPONSABILITÉS OPÉRATIONNELLES**

#### **🏗️ Développement Plateforme**

```typescript
// Exemple : Features que NOUS développons
interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  targetMarket: 'STARTER' | 'PRO' | 'ENTERPRISE';
  developmentStatus: 'PLANNED' | 'IN_PROGRESS' | 'TESTING' | 'RELEASED';
  businessImpact: {
    revenueIncrease: number;
    churnReduction: number;
    acquisitionFacility: number;
  };
}

// NOUS décidons quelles features développer selon le ROI business
```

#### **📊 Analytics & Business Intelligence**

- **Platform-wide metrics** : ARR, MRR, churn rate, NPS global
- **Tenant analysis** : Usage patterns par business, feature adoption
- **End-user behavior** : Conversion booking, abandonment rates
- **Technical metrics** : Performance, uptime, erreurs API

#### **💰 Monétisation et Pricing**

- **Subscription management** : Plans tarifaires, upgrading/downgrading
- **Revenue optimization** : A/B tests pricing, bundling features
- **Billing automation** : Facturation, relances, dunning management
- **Commission tracking** : Revenus transactionnels (si applicable)

### **🔧 OUTILS ET INTERFACES**

#### **Super-Admin Dashboard**

```typescript
// Exemple interface NOUS utilisons
interface PlatformAdminDashboard {
  // Vue d'ensemble business
  globalMetrics: {
    totalTenants: number;
    activeEndUsers: number;
    monthlyRecurringRevenue: number;
    churnRate: number;
  };

  // Gestion tenants
  tenantManagement: {
    onboardNewTenant: (
      businessInfo: BusinessOnboardingInfo,
    ) => Promise<Business>;
    upgradeTenant: (
      businessId: string,
      newPlan: SubscriptionPlan,
    ) => Promise<void>;
    suspendTenant: (businessId: string, reason: string) => Promise<void>;
  };

  // Support et debugging
  supportTools: {
    viewTenantData: (businessId: string) => Promise<TenantDataView>;
    executeTenantCommand: (
      businessId: string,
      command: AdminCommand,
    ) => Promise<void>;
    generateSupportReport: (businessId: string) => Promise<SupportReport>;
  };
}
```

#### **Business Intelligence Tools**

- **Mixpanel/Amplitude** : User behavior analytics
- **ChartMogul** : Subscription analytics et cohorts
- **Intercom** : Customer support et messaging
- **Stripe Dashboard** : Revenus, failed payments, metrics financiers

---

## 👨‍💼 ACTEUR 2 : LES PROFESSIONNELS (B2B TENANTS)

### **🎯 IDENTITÉ ET MISSION**

**Qui sont-ils** : Entreprises clientes qui paient pour utiliser notre plateforme
**Mission** : Optimiser leurs opérations, augmenter leur chiffre d'affaires, satisfaire leurs clients

### **🏪 TYPES DE BUSINESSES (TENANTS)**

#### **Secteurs Cibles**

- **Santé** : Cabinets médicaux, dentistes, kinésithérapeutes, psychologues
- **Beauté** : Salons de coiffure, instituts de beauté, spas, barbiers
- **Juridique** : Cabinets d'avocats, notaires, experts-comptables
- **Consulting** : Consultants, coachs, formateurs, thérapeutes
- **Services** : Garages, réparateurs, artisans, services à domicile

#### **Tailles d'Entreprises**

- **Solo** : 1 professionnel (plan Starter)
- **Petite équipe** : 2-5 professionnels (plan Starter/Pro)
- **PME** : 6-20 professionnels (plan Pro/Enterprise)
- **Groupe** : 21+ professionnels, multi-sites (plan Enterprise)

### **👥 HIÉRARCHIE ET RÔLES UTILISATEURS**

#### **Business Owner**

```typescript
interface BusinessOwner {
  role: 'BUSINESS_OWNER';
  permissions: [
    'MANAGE_BUSINESS_SETTINGS',
    'MANAGE_STAFF',
    'MANAGE_SERVICES',
    'VIEW_ANALYTICS',
    'MANAGE_BILLING',
    'CONFIGURE_INTEGRATIONS',
  ];
  responsibilities: [
    'Configuration générale du business',
    'Embauche et gestion du staff',
    'Définition des services et tarifs',
    'Suivi performance et ROI',
    'Relation avec notre support',
  ];
}
```

#### **Business Admin**

```typescript
interface BusinessAdmin {
  role: 'BUSINESS_ADMIN';
  permissions: [
    'MANAGE_SERVICES',
    'MANAGE_STAFF_SCHEDULES',
    'VIEW_REPORTS',
    'MANAGE_CLIENT_DATA',
    'CONFIGURE_NOTIFICATIONS',
  ];
  responsibilities: [
    'Administration quotidienne',
    'Gestion planning et ressources',
    'Supervision équipe terrain',
    'Reporting managérial',
  ];
}
```

#### **Staff Member (Practitioner)**

```typescript
interface StaffMember {
  role: 'STAFF_MEMBER';
  permissions: [
    'MANAGE_OWN_SCHEDULE',
    'VIEW_OWN_APPOINTMENTS',
    'UPDATE_APPOINTMENT_STATUS',
    'ACCESS_CLIENT_NOTES',
  ];
  responsibilities: [
    'Gestion de son planning personnel',
    'Mise à jour statuts rendez-vous',
    'Saisie notes clients',
    'Respect procédures métier',
  ];
}
```

### **💼 BESOINS FONCTIONNELS DÉTAILLÉS**

#### **🏗️ Configuration Business**

```typescript
// Ce que les PROFESSIONNELS configurent dans leur tenant
interface BusinessConfiguration {
  // Informations entreprise
  businessInfo: {
    name: string;
    sector: BusinessSector;
    address: Address;
    contact: ContactInfo;
    branding: BrandingConfig;
  };

  // Configuration opérationnelle
  operationalSettings: {
    workingHours: WeeklySchedule;
    bookingRules: BookingRules;
    cancellationPolicy: CancellationPolicy;
    paymentSettings: PaymentConfig;
  };

  // Gestion équipe
  teamManagement: {
    staffMembers: StaffMember[];
    roles: CustomRole[];
    schedules: StaffSchedule[];
    skills: SkillMatrix[];
  };
}
```

#### **📅 Gestion Planning et Ressources**

- **Vue calendrier multi-professionnels** avec code couleur par staff
- **Gestion disponibilités** : congés, absences, créneaux exceptionnels
- **Optimisation ressources** : salles, équipements, matériel
- **Planning automatique** : suggestions créneaux optimaux
- **Gestion conflicts** : alertes double-booking, indisponibilités

#### **💰 Gestion Services et Tarification**

```typescript
// Services que les PROFESSIONNELS définissent
interface BusinessService {
  // Méta-données service
  id: string;
  businessId: string; // 🔑 Clé tenant
  name: string;
  description: string;
  category: ServiceCategory;

  // Configuration métier
  duration: Duration;
  requiredSkills: Skill[];
  requiredEquipment: Equipment[];

  // Tarification flexible
  pricingConfig: {
    type: 'FIXED' | 'VARIABLE' | 'PACKAGE' | 'ON_DEMAND';
    basePrice: Money;
    discounts: DiscountRule[];
    seasonalPricing: SeasonalPricing[];
  };

  // Règles booking
  bookingRules: {
    advanceBooking: Duration;
    cancellationDeadline: Duration;
    allowOnlineBooking: boolean;
    requiresApproval: boolean;
  };
}
```

#### **📊 Analytics et Reporting**

- **Dashboard performance** : CA, marge, taux remplissage
- **Analyse clientèle** : clients récurrents, nouveaux, perdus
- **Performance staff** : productivité, satisfaction client
- **Optimisation planning** : créneaux vides, heures de pointe
- **ROI marketing** : sources acquisition, coût client

### **🔧 INTERFACES UTILISATEUR**

#### **Admin Dashboard (B2B Interface)**

```typescript
interface BusinessAdminInterface {
  // Navigation principale
  navigation: {
    dashboard: DashboardView;
    appointments: AppointmentManagement;
    clients: ClientDatabase;
    staff: StaffManagement;
    services: ServiceCatalog;
    analytics: ReportsAndMetrics;
    settings: BusinessSettings;
  };

  // Widgets temps réel
  realTimeWidgets: {
    todayAppointments: TodayAppointmentsWidget;
    revenueTracker: RevenueWidget;
    teamStatus: TeamStatusWidget;
    clientNotifications: NotificationWidget;
  };
}
```

---

## 🌐 ACTEUR 3 : LES CLIENTS FINAUX (B2C END-USERS)

### **🎯 IDENTITÉ ET MISSION**

**Qui sont-ils** : Internautes cherchant à réserver des services professionnels
**Mission** : Trouver et réserver facilement des services, avoir une expérience fluide

### **👤 PROFILS UTILISATEURS**

#### **Particuliers**

```typescript
interface IndividualEndUser {
  profile: {
    personalInfo: PersonalInfo;
    preferences: ServicePreferences;
    bookingHistory: AppointmentHistory[];
    loyaltyPrograms: LoyaltyMembership[];
  };

  needs: [
    'Réservation rapide et intuitive',
    'Choix professionnel/créneau optimal',
    'Rappels et notifications',
    'Gestion facile de ses RDV',
    'Historique et récurrence',
  ];
}
```

#### **Familles**

```typescript
interface FamilyEndUser extends IndividualEndUser {
  familyManagement: {
    dependents: FamilyMember[];
    sharedCalendar: SharedCalendarView;
    budgetTracking: FamilyBudgetTracker;
    preferredProviders: BusinessFavorites[];
  };
}
```

#### **Entreprises B2B2C**

```typescript
interface CorporateEndUser {
  corporateInfo: {
    companyId: string;
    employeeBenefits: ServiceCategory[];
    budgetLimits: BudgetConstraints;
    approvalWorkflow: ApprovalProcess;
  };
}
```

### **🎯 PARCOURS UTILISATEUR DÉTAILLÉ**

#### **1️⃣ Découverte & Recherche**

```typescript
interface ServiceDiscovery {
  searchMethods: {
    // Recherche géographique
    locationBased: {
      currentLocation: GeoLocation;
      radius: number;
      transport: 'WALKING' | 'DRIVING' | 'PUBLIC_TRANSPORT';
    };

    // Recherche par critères
    criteriaFilter: {
      serviceType: ServiceCategory;
      priceRange: PriceRange;
      availability: TimeSlot;
      rating: number;
      certifications: Certification[];
    };

    // Recherche intelligente
    aiRecommendation: {
      basedOnHistory: AppointmentHistory[];
      similarUsers: UserSimilarity;
      trendingServices: TrendingService[];
    };
  };
}
```

#### **2️⃣ Sélection Professionnel**

```typescript
interface ProfessionalSelection {
  businessProfile: {
    businessInfo: PublicBusinessInfo;
    staffProfiles: PublicStaffProfile[];
    servicesCatalog: PublicService[];
    reviews: CustomerReview[];
    photos: BusinessImage[];
    certifications: ProfessionalCertification[];
  };

  decisionFactors: {
    proximity: number;
    availability: AvailabilityScore;
    price: PriceCompetitiveness;
    reputation: ReputationScore;
    specializations: SpecializationMatch[];
  };
}
```

#### **3️⃣ Processus de Réservation**

```typescript
interface BookingProcess {
  steps: {
    // Sélection service
    serviceSelection: {
      availableServices: PublicService[];
      selectedService: PublicService;
      addOns: AdditionalService[];
      estimatedTotal: Money;
    };

    // Choix créneau
    timeSlotSelection: {
      availableSlots: TimeSlot[];
      preferredTimes: UserPreference[];
      alternativeOptions: AlternativeSlot[];
    };

    // Informations personnelles
    customerInfo: {
      contactDetails: ContactInfo;
      specialRequests: string;
      medicalInfo?: SensitiveInfo; // Si secteur santé
      preferences: ServicePreferences;
    };

    // Paiement
    payment: {
      paymentMethods: PaymentMethod[];
      pricing: {
        basePrice: Money;
        addOns: Money;
        discounts: Money;
        taxes: Money;
        total: Money;
      };
      securePayment: PaymentProcessor;
    };

    // Confirmation
    confirmation: {
      appointmentDetails: BookingConfirmation;
      calendarIntegration: CalendarExport;
      notifications: NotificationPreferences;
    };
  };
}
```

### **📱 INTERFACES ET POINTS DE CONTACT**

#### **Site Web Responsive (Primary)**

```typescript
interface PublicWebsite {
  // Landing pages par secteur
  sectorPages: {
    healthcare: HealthcareProvidersDirectory;
    beauty: BeautyServicesDirectory;
    legal: LegalServicesDirectory;
    consulting: ConsultingServicesDirectory;
  };

  // Fonctionnalités principales
  coreFeatures: {
    search: AdvancedSearchInterface;
    booking: BookingFlowInterface;
    account: UserAccountInterface;
    support: CustomerSupportInterface;
  };
}
```

#### **Progressive Web App (PWA)**

- **Installation** : Add to Home Screen sur mobile
- **Offline** : Consultation historique sans connexion
- **Push notifications** : Rappels rendez-vous
- **Quick actions** : Raccourcis rebooking

#### **Applications Mobiles Natives** (Future)

- **iOS App** : App Store, intégration Apple Pay, Siri Shortcuts
- **Android App** : Play Store, Google Pay, Assistant Google

### **🔄 DONNÉES ET INTERACTIONS**

#### **Données Utilisateur (Anonymous/Registered)**

```typescript
interface EndUserData {
  // Données anonymes (tracking)
  anonymous: {
    sessionId: string;
    geolocation: GeoLocation;
    searchHistory: SearchQuery[];
    pageViews: PageView[];
    deviceInfo: DeviceFingerprint;
  };

  // Données enregistrées (compte)
  registered: {
    userId: string;
    profile: UserProfile;
    bookingHistory: Appointment[];
    preferences: UserPreferences;
    loyaltyPoints: LoyaltyAccount;
    paymentMethods: SavedPaymentMethod[];
  };
}
```

#### **Interactions avec les Tenants**

```typescript
// Comment les END-USERS interagissent avec chaque BUSINESS (tenant)
interface EndUserBusinessInteraction {
  businessId: string; // 🔑 Clé tenant

  // Historique avec ce business spécifique
  relationship: {
    firstVisit: Date;
    totalAppointments: number;
    totalSpent: Money;
    lastAppointment: Date;
    loyaltyStatus: LoyaltyTier;
    preferences: BusinessSpecificPreferences;
  };

  // Communications
  communications: {
    notifications: NotificationHistory[];
    reviews: ReviewsGiven[];
    complaints: ComplaintHistory[];
    recommendations: RecommendationRequests[];
  };
}
```

---

## 🔄 INTERACTIONS ENTRE ACTEURS

### **🏢 NOUS ↔ 👨‍💼 PROFESSIONNELS**

#### **Cycle de Vie Client B2B**

```typescript
interface B2BCustomerLifecycle {
  // Acquisition
  acquisition: {
    leadGeneration: LeadSource[];
    demoRequest: DemoSession;
    trialPeriod: TrialExperience;
    conversion: ConversionEvent;
  };

  // Onboarding
  onboarding: {
    businessSetup: BusinessConfiguration;
    teamTraining: TrainingSession[];
    dataImport: DataMigration;
    goLive: LaunchSupport;
  };

  // Utilisation
  usage: {
    featureAdoption: FeatureUsageMetrics;
    supportTickets: SupportInteraction[];
    performanceOptimization: OptimizationRecommendations;
  };

  // Expansion/Rétention
  growth: {
    upselling: UpsellOpportunity[];
    referralProgram: ReferralTracking;
    renewalManagement: RenewalProcess;
  };
}
```

### **👨‍💼 PROFESSIONNELS ↔ 🌐 CLIENTS FINAUX**

#### **Relation Service Provider ↔ Customer**

```typescript
interface ProviderCustomerRelation {
  businessId: string; // 🔑 Tenant context

  // Service delivery
  serviceExperience: {
    bookingExperience: BookingJourney;
    serviceDelivery: ServiceExecution;
    postServiceFollowup: FollowupProcess;
    customerSatisfaction: SatisfactionMetrics;
  };

  // Business intelligence
  businessInsights: {
    customerSegmentation: CustomerSegment[];
    servicePerformance: ServiceMetrics;
    revenueOptimization: RevenueInsights;
    marketPositioning: CompetitiveAnalysis;
  };
}
```

---

## 🎯 SYNTHÈSE : BUSINESSID COMME TENANT IDENTIFIER

### **🔑 Architecture Simplifiée**

Dans notre approche simplifiée avec une seule base de données :

```typescript
// Toutes les entités principales ont un businessId
interface TenantAwareEntity {
  businessId: string; // 🔑 Identifiant tenant
  // ... autres propriétés
}

// Exemples concrets
interface Staff {
  id: string;
  businessId: string; // ← Détermine quel tenant
  name: string;
  // ...
}

interface Service {
  id: string;
  businessId: string; // ← Même tenant que Staff
  name: string;
  // ...
}

interface Appointment {
  id: string;
  businessId: string; // ← Scoped au tenant
  serviceId: string;
  staffId: string;
  // ...
}
```

### **🛡️ Isolation et Sécurité**

#### **Row-Level Security (RLS)**

```sql
-- Exemple policy PostgreSQL
CREATE POLICY tenant_isolation_policy ON appointments
    FOR ALL TO app_user
    USING (business_id = current_setting('app.current_business_id')::uuid);

-- Middleware automatique injection context
SET app.current_business_id = '123e4567-e89b-12d3-a456-426614174000';
```

#### **Repository Pattern Tenant-Aware**

```typescript
@TenantScoped()
export class TypeOrmAppointmentRepository implements IAppointmentRepository {
  async findAll(businessId: string): Promise<Appointment[]> {
    // Toutes les requêtes automatiquement scopées
    return this.repository.find({
      where: { businessId }, // ← Isolation automatique
    });
  }
}
```

Cette architecture simplifiée avec `businessId` comme identifiant tenant permet :

- ✅ **Isolation complète** des données par tenant
- ✅ **Simplicité** de développement et maintenance
- ✅ **Performance** optimale avec indexation appropriée
- ✅ **Évolutivité** vers une architecture multi-schema future
- ✅ **Sécurité** via RLS et validation applicative

**Chaque acteur opère dans son périmètre défini, avec des interfaces et permissions adaptées à son rôle dans l'écosystème !** 🎯
