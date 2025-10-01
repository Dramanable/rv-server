# 🎯 **RÔLES ÉDITEUR SAAS SIMPLIFIÉS - COMMERCIAUX + SUPER-ADMIN**

## 🏢 **ARCHITECTURE SIMPLE POUR DÉMARRER**

### **✅ OBJECTIF : MINIMUM VIABLE**

Juste **3 rôles** pour votre entreprise éditrice :

1. **🔑 SUPER_ADMIN** : Patron/CTO - Accès total
2. **👔 SALES_MANAGER** : Responsable commercial
3. **📞 SALES_REP** : Commercial terrain

---

## 🎯 **DÉFINITION DES RÔLES**

### **🔑 SUPER_ADMIN (Patron/Direction)**

```typescript
interface SuperAdminPermissions {
  // 🏢 Gestion plateforme
  MANAGE_PLATFORM_SETTINGS: boolean;     // Config globale
  VIEW_ALL_CUSTOMERS: boolean;           // Tous les clients
  VIEW_REVENUE_ANALYTICS: boolean;       // Chiffre d'affaires
  MANAGE_SALES_TEAM: boolean;            // Gérer équipe commerciale
  
  // 💰 Business
  VIEW_FINANCIAL_REPORTS: boolean;       // Rapports financiers
  SET_PRICING_STRATEGY: boolean;         // Stratégie tarifaire
  APPROVE_CUSTOM_DEALS: boolean;         // Valider deals spéciaux
  
  // 🔧 Administration
  MANAGE_USERS: boolean;                 // Gérer utilisateurs internes
  ACCESS_SYSTEM_LOGS: boolean;           // Logs système
}
```

### **👔 SALES_MANAGER (Responsable Commercial)**

```typescript
interface SalesManagerPermissions {
  // 📊 Analytics commerciales
  VIEW_SALES_DASHBOARD: boolean;         // Dashboard ventes
  VIEW_TEAM_PERFORMANCE: boolean;        // Performance équipe
  VIEW_PIPELINE_REPORTS: boolean;        // Pipeline des ventes
  
  // 👥 Gestion équipe
  ASSIGN_PROSPECTS: boolean;             // Affecter prospects
  SET_SALES_TARGETS: boolean;            // Objectifs commerciaux
  VIEW_ALL_PROSPECTS: boolean;           // Tous les prospects
  
  // 💼 Actions commerciales
  APPROVE_DISCOUNTS: boolean;            // Valider remises
  CREATE_CUSTOM_PRICING: boolean;        // Tarifs spéciaux
}
```

### **📞 SALES_REP (Commercial Terrain)**

```typescript
interface SalesRepPermissions {
  // 🎯 Prospection
  VIEW_ASSIGNED_PROSPECTS: boolean;      // Ses prospects
  CREATE_PROSPECT: boolean;              // Créer prospect
  UPDATE_PROSPECT_STATUS: boolean;       // MAJ statut
  SCHEDULE_DEMO: boolean;                // Planifier démo
  
  // 📋 Actions commerciales
  CREATE_QUOTATION: boolean;             // Créer devis
  SEND_PROPOSAL: boolean;                // Envoyer proposition
  LOG_SALES_ACTIVITIES: boolean;         // Logger activités
  CLOSE_DEALS: boolean;                  // Finaliser vente
  
  // 📊 Reporting personnel
  VIEW_PERSONAL_METRICS: boolean;        // Ses métriques
  VIEW_PERSONAL_COMMISSION: boolean;     // Ses commissions
}
```

---

## 🏗️ **IMPLÉMENTATION SIMPLE**

### **🎯 Extension ActorType existant**

```typescript
// Ajouter à votre enum ActorType existant
export enum ActorTypeEnum {
  // ... vos rôles existants
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  
  // 🆕 NOUVEAUX RÔLES ÉDITEUR
  SUPER_ADMIN = 'SUPER_ADMIN',           // ✅ Le patron
  SALES_MANAGER = 'SALES_MANAGER',       // ✅ Manager commercial
  SALES_REP = 'SALES_REP',               // ✅ Commercial terrain
}
```

### **🎯 Entité Prospect Simple**

```typescript
export class Prospect {
  readonly id: ProspectId;
  readonly businessName: string;
  readonly contactEmail: Email;
  readonly contactPhone: Phone;
  readonly contactName: string;
  readonly status: ProspectStatus;       // LEAD, CONTACTED, DEMO, PROPOSAL, CLOSED_WON, CLOSED_LOST
  readonly assignedSalesRep: UserId;     // Commercial assigné
  readonly estimatedValue: Money;        // Valeur estimée
  readonly notes: string;                // Notes commerciales
  readonly source: string;               // Source du lead
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static create(params: CreateProspectParams): Prospect {
    return new Prospect(
      ProspectId.generate(),
      params.businessName,
      Email.create(params.contactEmail),
      Phone.create(params.contactPhone),
      params.contactName,
      ProspectStatus.LEAD,
      params.assignedSalesRep,
      params.estimatedValue,
      params.notes || '',
      params.source || 'DIRECT',
      new Date(),
      new Date()
    );
  }

  // Méthodes métier simples
  assignTo(salesRepId: UserId): void {
    this.assignedSalesRep = salesRepId;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: ProspectStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  addNote(note: string): void {
    this.notes += `\n${new Date().toISOString()}: ${note}`;
    this.updatedAt = new Date();
  }
}
```

### **🎯 Use Cases Simples**

```typescript
// ✅ SIMPLE : Créer un prospect
export class CreateProspectUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: ILogger,
  ) {}

  async execute(request: CreateProspectRequest): Promise<ProspectResponse> {
    // 1. Vérifier permissions (SALES_REP ou SALES_MANAGER)
    const userRole = await this.permissionService.getUserRole(request.requestingUserId);
    if (!['SALES_REP', 'SALES_MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      throw new InsufficientPermissionsError('Seuls les commerciaux peuvent créer des prospects');
    }

    // 2. Créer le prospect
    const prospect = Prospect.create({
      businessName: request.businessName,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      contactName: request.contactName,
      assignedSalesRep: request.assignedSalesRep || request.requestingUserId,
      estimatedValue: Money.create(request.estimatedValue, 'EUR'),
      notes: request.notes,
      source: request.source,
    });

    // 3. Sauvegarder
    const savedProspect = await this.prospectRepository.save(prospect);

    this.logger.info('Prospect créé', {
      prospectId: savedProspect.getId(),
      businessName: request.businessName,
      assignedTo: prospect.assignedSalesRep,
    });

    return ProspectMapper.toResponse(savedProspect);
  }
}

// ✅ SIMPLE : Lister prospects
export class ListProspectsUseCase {
  async execute(request: ListProspectsRequest): Promise<ListProspectsResponse> {
    // 1. Permissions selon rôle
    const userRole = await this.permissionService.getUserRole(request.requestingUserId);
    
    let prospects: Prospect[];
    if (userRole === 'SALES_REP') {
      // Commercial : seulement ses prospects
      prospects = await this.prospectRepository.findByAssignedSalesRep(request.requestingUserId);
    } else {
      // Manager/Super-admin : tous les prospects
      prospects = await this.prospectRepository.findAll(request.filters);
    }

    return {
      prospects: prospects.map(ProspectMapper.toResponse),
      total: prospects.length,
    };
  }
}
```

---

## 🔐 **PERMISSIONS SIMPLIFIÉES**

### **🎯 Matrice Simple**

| Action | SUPER_ADMIN | SALES_MANAGER | SALES_REP |
|--------|-------------|---------------|-----------|
| Créer prospect | ✅ | ✅ | ✅ |
| Voir tous prospects | ✅ | ✅ | ❌ |
| Voir ses prospects | ✅ | ✅ | ✅ |
| Modifier prospect | ✅ | ✅ | ✅ (siens) |
| Analytics équipe | ✅ | ✅ | ❌ |
| Gérer utilisateurs | ✅ | ❌ | ❌ |
| Config plateforme | ✅ | ❌ | ❌ |

---

## 📱 **ENDPOINTS MINIMALISTES**

```typescript
// 🎯 Prospects
@Controller('sales/prospects')
export class ProspectController {
  @Post()                              // ✅ Créer prospect
  @Get()                               // ✅ Lister prospects
  @Get(':id')                          // ✅ Détail prospect
  @Put(':id')                          // ✅ Modifier prospect
  @Put(':id/status')                   // ✅ Changer statut
  @Post(':id/notes')                   // ✅ Ajouter note
}

// 🎯 Analytics simples
@Controller('sales/analytics')
export class SalesAnalyticsController {
  @Get('dashboard')                    // ✅ Dashboard commercial
  @Get('my-performance')               // ✅ Mes performances
  @Get('team-performance')             // ✅ Performance équipe (manager+)
}

// 🎯 Admin super simple
@Controller('admin')
export class AdminController {
  @Get('users')                        // ✅ Liste utilisateurs internes
  @Post('users')                       // ✅ Créer utilisateur interne
  @Put('users/:id/role')               // ✅ Changer rôle
}
```

---

## 🚀 **PLAN D'IMPLÉMENTATION RAPIDE**

### **📅 SEMAINE 1 : BASE**
1. Étendre `ActorType` avec les 3 nouveaux rôles
2. Créer entité `Prospect` simple
3. Repository et mapper de base

### **📅 SEMAINE 2 : USE CASES**
1. `CreateProspectUseCase`
2. `ListProspectsUseCase`
3. `UpdateProspectUseCase`

### **📅 SEMAINE 3 : CONTROLLERS**
1. `ProspectController` avec CRUD
2. Permissions simples intégrées
3. Tests de base

### **📅 SEMAINE 4 : ANALYTICS**
1. Dashboard simple avec métriques
2. Performance commerciale basique
3. Déploiement

---

## 💡 **DONNÉES EXEMPLE**

```typescript
// Utilisateurs internes
const superAdmin = {
  email: 'patron@votre-entreprise.com',
  role: 'SUPER_ADMIN',
  name: 'Le Patron'
};

const salesManager = {
  email: 'manager@votre-entreprise.com',
  role: 'SALES_MANAGER',
  name: 'Manager Commercial'
};

const salesRep1 = {
  email: 'commercial1@votre-entreprise.com',
  role: 'SALES_REP',
  name: 'Commercial Paris'
};
```

**C'est tout ! Simple, efficace, et vous pouvez commencer la prospection dès que c'est développé.**

Ça vous va cette approche minimaliste ? Je peux commencer l'implémentation si vous voulez !