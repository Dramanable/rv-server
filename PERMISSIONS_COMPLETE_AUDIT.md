# 🔒 AUDIT COMPLET DES PERMISSIONS - TOUTES RESSOURCES

## 🎯 **OBJECTIF CRITIQUE**

**⚠️ RÈGLE NON-NÉGOCIABLE** : TOUTE ressource DOIT être régie par des permissions strictes avec vérification des acteurs (Staff, Professionals, Users) avant exécution.

## 📋 **ÉTAT ACTUEL DES USE CASES AVEC PERMISSIONS**

### ✅ **SÉCURISÉS - TDD COMPLET**

#### 🎭 **RBAC (Role-Based Access Control)**

- ✅ `AssignRoleUseCase` - TDD complet + IPermissionService
- ✅ `CreateServiceUseCase` - TDD complet + IPermissionService
- ✅ `DeleteUserUseCase` - TDD complet + IPermissionService

#### 📊 **TOTAL SÉCURISÉ** : 3/73 Use Cases (4%)

---

## 🚨 **À SÉCURISER - PRIORITÉ CRITIQUE (70 Use Cases)**

### 👤 **GESTION UTILISATEURS (8 Use Cases)**

- ❌ `CreateUserUseCase` - **CRITIQUE** : Création utilisateur sans permissions
- ❌ `GetMeUseCase` - **CRITIQUE** : Accès profil sans validation
- ❌ `GetUserByIdUseCase` - **CRITIQUE** : Accès données utilisateur
- ❌ `GetUserUseCase` - **CRITIQUE** : Accès données utilisateur
- ❌ `ListUsersUseCase` - **CRITIQUE** : Liste utilisateurs
- ❌ `SearchUsersUseCase` - **CRITIQUE** : Recherche utilisateurs
- ❌ `UpdateUserUseCase` - **CRITIQUE** : Modification utilisateur

### 🏢 **GESTION ENTREPRISES (13 Use Cases)**

- ❌ `CreateBusinessUseCase` - **CRITIQUE** : Création entreprise
- ❌ `GetBusinessUseCase` - **CRITIQUE** : Accès données entreprise
- ❌ `ListBusinessUseCase` - **CRITIQUE** : Liste entreprises
- ❌ `UpdateBusinessUseCase` - **CRITIQUE** : Modification entreprise
- ❌ `UpdateBusinessSeoUseCase` - **CRITIQUE** : SEO entreprise
- ❌ `ManageBusinessHoursUseCase` - **CRITIQUE** : Horaires entreprise
- ❌ `CreateBusinessGalleryUseCase` - **CRITIQUE** : Galerie entreprise
- ❌ `GetBusinessGalleryUseCase` - **CRITIQUE** : Accès galerie
- ❌ `UpdateBusinessGalleryUseCase` - **CRITIQUE** : Modification galerie
- ❌ `DeleteBusinessGalleryUseCase` - **CRITIQUE** : Suppression galerie
- ❌ `AddImageToBusinessGalleryUseCase` - **CRITIQUE** : Ajout images
- ❌ `AddImageToGalleryUseCase` - **CRITIQUE** : Ajout images (duplicate?)
- ❌ `UploadBusinessImageUseCase` - **CRITIQUE** : Upload images

### 🏭 **SECTEURS D'ACTIVITÉ (4 Use Cases)**

- ❌ `CreateBusinessSectorUseCase` - **CRITIQUE** : Création secteur
- ❌ `DeleteBusinessSectorUseCase` - **CRITIQUE** : Suppression secteur
- ❌ `ListBusinessSectorsUseCase` - **MOYENNE** : Liste secteurs (lecture)
- ❌ `UpdateBusinessSectorUseCase` - **CRITIQUE** : Modification secteur

### 👨‍💼 **GESTION PERSONNEL (8 Use Cases)**

- ❌ `CreateStaffUseCase` - **CRITIQUE** : Création personnel
- ❌ `DeleteStaffUseCase` - **CRITIQUE** : Suppression personnel
- ❌ `GetStaffUseCase` - **CRITIQUE** : Accès données personnel
- ❌ `ListStaffUseCase` - **CRITIQUE** : Liste personnel
- ❌ `UpdateStaffUseCase` - **CRITIQUE** : Modification personnel
- ❌ `GetAvailableStaffUseCase` - **CRITIQUE** : Disponibilités personnel
- ❌ `GetStaffAvailabilityUseCase` - **CRITIQUE** : Accès disponibilités
- ❌ `SetStaffAvailabilityUseCase` - **CRITIQUE** : Définir disponibilités

### 👩‍⚕️ **GESTION PROFESSIONNELS (5 Use Cases)**

- ❌ `CreateProfessionalUseCase` - **CRITIQUE** : Création professionnel
- ❌ `DeleteProfessionalUseCase` - **CRITIQUE** : Suppression professionnel
- ❌ `GetProfessionalByIdUseCase` - **CRITIQUE** : Accès données professionnel
- ❌ `ListProfessionalsUseCase` - **CRITIQUE** : Liste professionnels
- ❌ `UpdateProfessionalUseCase` - **CRITIQUE** : Modification professionnel

### 🛠️ **GESTION SERVICES (4 Use Cases)**

- ❌ `DeleteServiceUseCase` - **CRITIQUE** : Suppression service
- ❌ `GetServiceUseCase` - **ÉLEVÉE** : Accès données service
- ❌ `ListServicesUseCase` - **ÉLEVÉE** : Liste services
- ❌ `UpdateServiceUseCase` - **CRITIQUE** : Modification service

### 🎯 **COMPÉTENCES (5 Use Cases)**

- ❌ `CreateSkillUseCase` - **CRITIQUE** : Création compétence
- ❌ `DeleteSkillUseCase` - **CRITIQUE** : Suppression compétence
- ❌ `GetSkillByIdUseCase` - **MOYENNE** : Accès compétence
- ❌ `ListSkillsUseCase` - **MOYENNE** : Liste compétences
- ❌ `UpdateSkillUseCase` - **CRITIQUE** : Modification compétence

### 📅 **RENDEZ-VOUS (7 Use Cases)**

- ❌ `BookAppointmentUseCase` - **CRITIQUE** : Réservation rendez-vous
- ❌ `CancelAppointmentUseCase` - **CRITIQUE** : Annulation rendez-vous
- ❌ `GetAppointmentByIdUseCase` - **CRITIQUE** : Accès données rendez-vous
- ❌ `GetAvailableSlotsSimpleUseCase` - **ÉLEVÉE** : Créneaux disponibles
- ❌ `ListAppointmentsUseCase` - **CRITIQUE** : Liste rendez-vous
- ❌ `UpdateAppointmentUseCase` - **CRITIQUE** : Modification rendez-vous

### 📆 **CALENDRIERS (8 Use Cases)**

- ❌ `CreateCalendarUseCase` - **CRITIQUE** : Création calendrier
- ❌ `DeleteCalendarUseCase` - **CRITIQUE** : Suppression calendrier
- ❌ `GetCalendarByIdUseCase` - **CRITIQUE** : Accès calendrier
- ❌ `ListCalendarsUseCase` - **CRITIQUE** : Liste calendriers
- ❌ `UpdateCalendarUseCase` - **CRITIQUE** : Modification calendrier

### 📋 **TYPES DE CALENDRIER (5 Use Cases)**

- ❌ `CreateCalendarTypeUseCase` - **CRITIQUE** : Création type calendrier
- ❌ `DeleteCalendarTypeUseCase` - **CRITIQUE** : Suppression type calendrier
- ❌ `GetCalendarTypeByIdUseCase` - **MOYENNE** : Accès type calendrier
- ❌ `ListCalendarTypesUseCase` - **MOYENNE** : Liste types calendrier
- ❌ `UpdateCalendarTypeUseCase` - **CRITIQUE** : Modification type calendrier

### 🔧 **TYPES DE SERVICE (5 Use Cases)**

- ❌ `CreateServiceTypeUseCase` - **CRITIQUE** : Création type service
- ❌ `DeleteServiceTypeUseCase` - **CRITIQUE** : Suppression type service
- ❌ `GetServiceTypeByIdUseCase` - **MOYENNE** : Accès type service
- ❌ `ListServiceTypesUseCase` - **MOYENNE** : Liste types service
- ❌ `UpdateServiceTypeUseCase` - **CRITIQUE** : Modification type service

### 📧 **NOTIFICATIONS (2 Use Cases)**

- ❌ `SendNotificationUseCase` - **CRITIQUE** : Envoi notification
- ❌ `SendBulkNotificationUseCase` - **CRITIQUE** : Envoi en masse

### 🔐 **AUTHENTIFICATION (4 Use Cases)**

- ⚠️ `LoginUseCase` - **PUBLIC** : Accès libre (point d'entrée)
- ⚠️ `LogoutUseCase` - **AUTHENTIFIÉ** : Utilisateur connecté uniquement
- ⚠️ `RefreshTokenUseCase` - **TOKEN** : Token valide uniquement
- ⚠️ `RegisterUseCase` - **PUBLIC** : Accès libre (inscription)

---

## 🎯 **PLAN D'ACTION PRIORITAIRE**

### **PHASE 1 - CRITIQUE (1-2 jours)**

**Use Cases à sécuriser immédiatement :**

1. **👤 User Management CRUD** (7 Use Cases prioritaires)
2. **🏢 Business Management** (Core CRUD - 4 Use Cases)
3. **👨‍💼 Staff Management** (Core CRUD - 5 Use Cases)
4. **📅 Appointments Core** (Book, Cancel, List - 3 Use Cases)

**TOTAL PHASE 1** : 19 Use Cases

### **PHASE 2 - ÉLEVÉE (2-3 jours)**

**Gestion des ressources sensibles :**

5. **👩‍⚕️ Professional Management** (5 Use Cases)
6. **🛠️ Services Management** (4 Use Cases restants)
7. **📆 Calendar Management** (8 Use Cases)
8. **📧 Notifications** (2 Use Cases)

**TOTAL PHASE 2** : 19 Use Cases

### **PHASE 3 - NORMALE (2 jours)**

**Complétion de l'audit :**

9. **🎯 Skills Management** (5 Use Cases)
10. **🏭 Business Sectors** (4 Use Cases)
11. **📋 Calendar Types** (5 Use Cases)
12. **🔧 Service Types** (5 Use Cases)
13. **🔐 Auth Enhancement** (Validation tokens, sessions)

**TOTAL PHASE 3** : 19 Use Cases

---

## 🛠️ **WORKFLOW STANDARDISÉ PAR USE CASE**

### **1️⃣ TDD - Test First (RED)**

```bash
# Créer le test TDD
touch src/__tests__/unit/application/use-cases/{domain}/{use-case}-permissions.use-case.spec.ts

# Template TDD standard
describe('🧪 TDD - {UseCase} Permission Enforcement', () => {
  it('🚨 RED - should require {PERMISSION} before {action}', async () => {
    // Given: Mock permission service to reject
    mockPermissionService.requirePermission.mockRejectedValueOnce(
      new InsufficientPermissionsError('Missing permission')
    );

    // When & Then: Expect permission error
    await expect(useCase.execute(request)).rejects.toThrow(InsufficientPermissionsError);
  });
});
```

### **2️⃣ REFACTOR - Use Case (GREEN)**

```typescript
// Injecter IPermissionService dans le constructeur
constructor(
  private readonly repository: I{Entity}Repository,
  private readonly permissionService: IPermissionService,
  private readonly logger: ILogger,
  private readonly i18n: I18nService,
) {}

// Ajouter validation permissions dans execute()
async execute(request: {Action}Request): Promise<{Action}Response> {
  // 🔒 OBLIGATOIRE - Vérifier permissions en PREMIER
  await this.permissionService.requirePermission(
    request.requestingUserId,
    '{PERMISSION_NAME}',
    { businessId: request.businessId }
  );

  // Suite de la logique métier...
}
```

### **3️⃣ DI - Module Update**

```typescript
// Ajouter IPermissionService aux providers du Use Case
{
  provide: TOKENS.{USE_CASE},
  useFactory: (repo, permissionService, logger, i18n) =>
    new {UseCase}(repo, permissionService, logger, i18n),
  inject: [
    TOKENS.{REPOSITORY},
    TOKENS.PERMISSION_SERVICE,
    TOKENS.LOGGER,
    TOKENS.I18N_SERVICE,
  ],
},
```

---

## 📊 **MÉTRIQUES TEMPS ESTIMÉ**

- **Phase 1** : 19 Use Cases × 30min = ~10h (1-2 jours)
- **Phase 2** : 19 Use Cases × 25min = ~8h (2 jours)
- **Phase 3** : 19 Use Cases × 20min = ~6h (1 jour)

**TOTAL ESTIMÉ** : 24 heures de travail (5-6 jours)

---

## ✅ **CRITÈRES DE SUCCÈS**

- [ ] **100% des Use Cases** ont des permissions TDD validées
- [ ] **0 Use Case** peut s'exécuter sans vérification de permissions
- [ ] **Tous les tests** passent (GREEN phase)
- [ ] **Build complet** sans erreur
- [ ] **Documentation** mise à jour pour chaque ressource

---

## 🚨 **PROCHAINE ÉTAPE IMMÉDIATE**

**Commencer PHASE 1 avec le Use Case le plus critique :**

```bash
# Sécuriser CreateUserUseCase en premier
src/application/use-cases/users/create-user.use-case.ts
```

**Règle** : Une fois qu'on commence un Use Case, on le termine complètement (TDD RED → GREEN → REFACTOR) avant de passer au suivant.
