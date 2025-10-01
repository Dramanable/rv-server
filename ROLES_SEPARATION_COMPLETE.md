# 🎭 **SÉPARATION COMPLÈTE DES RÔLES - ÉDITEUR vs TENANTS**

## 🏢 **VUE D'ENSEMBLE : 2 MONDES SÉPARÉS**

### **🎯 VOTRE ENTREPRISE ÉDITRICE (Publisher)**
```
🔑 SUPER_ADMIN       → Vous, le patron
👔 SALES_MANAGER     → Responsable commercial  
📞 SALES_REP         → Commerciaux terrain
```

### **🏪 VOS CLIENTS TENANTS (Business)**
```
👑 BUSINESS_OWNER    → Propriétaire du salon/cabinet
🛡️ ADMIN             → Manager/directeur
👨‍💼 STAFF            → Personnel (coiffeurs, esthéticiennes, etc.)
👥 PROFESSIONAL      → Prestataires externes
👤 CLIENT            → Clients finaux du salon
```

---

## 🔀 **SÉPARATION TECHNIQUE CLAIRE**

### **✅ RÔLES ÉDITEUR (Publisher) - NOUVEAUX**
```typescript
// 🆕 À AJOUTER à votre ActorType
export enum PublisherRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',         // ✅ Le patron (vous)
  SALES_MANAGER = 'SALES_MANAGER',     // ✅ Manager commercial
  SALES_REP = 'SALES_REP',             // ✅ Commercial terrain
}
```

### **✅ RÔLES TENANT (Business) - EXISTANTS**
```typescript
// 👍 DÉJÀ DANS VOTRE SYSTÈME
export enum TenantRoleEnum {
  BUSINESS_OWNER = 'BUSINESS_OWNER',   // 👑 Propriétaire salon
  ADMIN = 'ADMIN',                     // 🛡️ Manager salon
  STAFF = 'STAFF',                     // 👨‍💼 Personnel
  PROFESSIONAL = 'PROFESSIONAL',       // 👥 Prestataires
  CLIENT = 'CLIENT',                   // 👤 Clients finaux
}
```

---

## 🎯 **QUI FAIT QUOI - MATRICE COMPLÈTE**

### **🏢 CÔTÉ ÉDITEUR (Votre entreprise)**

| Rôle | Responsabilités | Accès |
|------|----------------|--------|
| **🔑 SUPER_ADMIN** | • Config plateforme globale<br>• Voir tous les tenants<br>• Analytics revenue<br>• Gestion équipe commerciale | **TOUT** |
| **👔 SALES_MANAGER** | • Gérer équipe commerciale<br>• Pipeline des ventes<br>• Analytics commerciales<br>• Affecter prospects | **Prospects + Analytics** |
| **📞 SALES_REP** | • Prospection<br>• Démos clients<br>• Suivi pipeline<br>• Closing deals | **Ses prospects uniquement** |

### **🏪 CÔTÉ TENANT (Vos clients)**

| Rôle | Responsabilités | Accès |
|------|----------------|--------|
| **👑 BUSINESS_OWNER** | • Gestion complète salon<br>• Staff & services<br>• Configuration business<br>• Analytics salon | **Son salon uniquement** |
| **🛡️ ADMIN** | • Gestion quotidienne<br>• Planning & rdv<br>• Staff management<br>• Clients | **Son salon uniquement** |
| **👨‍💼 STAFF** | • Ses rendez-vous<br>• Son planning<br>• Ses clients<br>• Ses services | **Ses données uniquement** |
| **👥 PROFESSIONAL** | • Services externes<br>• Planning partagé<br>• Facturation | **Ses prestations uniquement** |
| **👤 CLIENT** | • Prendre RDV<br>• Historique<br>• Profil | **Ses données uniquement** |

---

## 🔐 **ISOLATION DES DONNÉES**

### **📊 CONTEXTE ÉDITEUR**
```typescript
// Vos données internes
interface PublisherContext {
  publisherUserId: string;           // Votre utilisateur interne
  role: PublisherRoleEnum;           // SUPER_ADMIN | SALES_MANAGER | SALES_REP
  // PAS de businessId → accès multi-tenant
}

// Vos entités spécifiques
- Prospects (leads commerciaux)
- Sales Pipeline (tunnel de vente)
- Revenue Analytics (CA par tenant)
- Internal Users (équipe commerciale)
```

### **🏪 CONTEXTE TENANT**
```typescript
// Données de vos clients
interface TenantContext {
  userId: string;                    // Utilisateur du salon
  businessId: string;               // ✅ ISOLATION PAR businessId
  role: TenantRoleEnum;              // BUSINESS_OWNER | ADMIN | STAFF | etc.
}

// Entités existantes (déjà dans votre code)
- Users (isolés par businessId)
- Services (isolés par businessId) 
- Appointments (isolés par businessId)
- Staff (isolés par businessId)
```

---

## 🎯 **ENDPOINTS SÉPARÉS**

### **🏢 ENDPOINTS ÉDITEUR**
```typescript
// Vos APIs internes
/api/v1/publisher/prospects          // Gestion prospects
/api/v1/publisher/sales/pipeline     // Pipeline commercial
/api/v1/publisher/analytics/revenue  // Revenue par tenant
/api/v1/publisher/team               // Équipe commerciale
/api/v1/publisher/tenants            // Vue globale tenants
```

### **🏪 ENDPOINTS TENANT**
```typescript
// APIs de vos clients (existantes)
/api/v1/businesses/:businessId/services    // Services du salon
/api/v1/businesses/:businessId/staff       // Staff du salon
/api/v1/businesses/:businessId/appointments // RDV du salon
/api/v1/businesses/:businessId/clients     // Clients du salon
```

---

## 🔄 **ARCHITECTURE HYBRIDE RECOMMANDÉE**

### **🎯 OPTION 1 : SÉPARATION COMPLÈTE**
```
📊 Base Publisher    📊 Base Tenant
┌─────────────────┐  ┌─────────────────┐
│ publisher_users │  │ users           │
│ prospects       │  │ businesses      │
│ sales_pipeline  │  │ services        │
│ revenue_reports │  │ appointments    │
└─────────────────┘  └─────────────────┘
```

### **🎯 OPTION 2 : TABLE UNIQUE AVEC FLAG**
```
📊 Table users unifiée
┌──────────────────────────┐
│ id, email, role          │
│ business_id (nullable)   │  ← NULL = publisher user
│ publisher_role (enum)    │  ← SUPER_ADMIN | SALES_* | NULL
│ tenant_role (enum)       │  ← BUSINESS_OWNER | ADMIN | NULL
└──────────────────────────┘
```

---

## 🚀 **IMPLÉMENTATION RECOMMANDÉE**

### **✅ ÉTAPE 1 : Extension ActorType**
```typescript
// Étendre votre enum existant
export enum ActorTypeEnum {
  // Rôles tenant existants (ne pas toucher)
  CLIENT = 'CLIENT',
  PROFESSIONAL = 'PROFESSIONAL', 
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',    // Déjà existant
  
  // 🆕 Nouveaux rôles éditeur
  SUPER_ADMIN = 'SUPER_ADMIN',           // Patron
  SALES_MANAGER = 'SALES_MANAGER',       // Manager commercial
  SALES_REP = 'SALES_REP',               // Commercial
}
```

### **✅ ÉTAPE 2 : Méthodes de distinction**
```typescript
export class ActorType {
  // Méthodes existantes...
  
  // 🆕 Nouvelles méthodes
  isPublisherRole(): boolean {
    return [
      ActorTypeEnum.SUPER_ADMIN,
      ActorTypeEnum.SALES_MANAGER, 
      ActorTypeEnum.SALES_REP
    ].includes(this._value);
  }
  
  isTenantRole(): boolean {
    return [
      ActorTypeEnum.CLIENT,
      ActorTypeEnum.PROFESSIONAL,
      ActorTypeEnum.STAFF,
      ActorTypeEnum.ADMIN,
      ActorTypeEnum.BUSINESS_OWNER
    ].includes(this._value);
  }
  
  isPlatformRole(): boolean {
    return this._value === ActorTypeEnum.PLATFORM_ADMIN;
  }
}
```

### **✅ ÉTAPE 3 : Guards de sécurité**
```typescript
// Guard pour vos APIs internes
@Injectable()
export class PublisherGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    const actorType = ActorType.fromString(user.role);
    
    // Seuls vos utilisateurs internes
    return actorType.isPublisherRole();
  }
}

// Guard pour APIs tenant (existant probablement)
@Injectable() 
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    const actorType = ActorType.fromString(user.role);
    
    // Utilisateurs des salons/cabinets
    return actorType.isTenantRole();
  }
}
```

---

## 💡 **RÉSUMÉ SIMPLE**

### **🏢 VOS 3 RÔLES INTERNES**
- **SUPER_ADMIN** : Vous (accès total)
- **SALES_MANAGER** : Manager commercial
- **SALES_REP** : Commerciaux

### **🏪 5 RÔLES DE VOS CLIENTS (déjà existants)**
- **BUSINESS_OWNER** : Propriétaire salon
- **ADMIN** : Manager salon  
- **STAFF** : Personnel salon
- **PROFESSIONAL** : Prestataires
- **CLIENT** : Clients finaux

**➡️ ISOLATION PARFAITE : Vos commerciaux voient les prospects, les salons voient leurs clients !**

Ça clarifie bien la séparation ? Je peux commencer par étendre votre `ActorType` existant ?