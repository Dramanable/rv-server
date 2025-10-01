# 🎯 amRDV Frontend SDK

[![npm version](https://badge.fury.io/js/%40amrdv%2Ffrontend-sdk.svg)](https://badge.fury.io/js/%40amrdv%2Ffrontend-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

SDK TypeScript moderne pour l'intégration avec l'API amRDV. Prend en charge l'authentification JWT, la gestion des rendez-vous, des entreprises et des services avec une validation côté client complète.

## 📦 Installation

```bash
npm install @amrdv/frontend-sdk
# ou
yarn add @amrdv/frontend-sd## 📞 Support et Contribution

- **Issues**: [GitHub Issues](https://github.com/amrdv/frontend-sdk/issues)
- **Documentation**: [Documentation complète](https://docs.amrdv.com)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 📄 Licence

MIT © amRDV Team

---

**🎯 SDK développé avec ❤️ pour simplifier l'intégration avec l'API amRDV**dd @amrdv/frontend-sdk
```

## 🚀 Démarrage Rapide

### Configuration Obligatoire

⚠️ **IMPORTANT** : Le `baseURL` est **obligatoire** et doit pointer vers votre instance de l'API amRDV.

```typescript
import AmRDVSDK from '@amrdv/frontend-sdk';

// ✅ Configuration minimale requise
const sdk = new AmRDVSDK({
  baseURL: 'https://your-api-domain.com/api/v1', // 🚨 OBLIGATOIRE
});

// ✅ Configuration complète recommandée
const sdk = new AmRDVSDK({
  baseURL: 'https://your-api-domain.com/api/v1', // 🚨 OBLIGATOIRE
  timeout: 30000,        // Optionnel (défaut: 10000ms)
  debug: true,           // Optionnel (défaut: false)
  apiKey: 'your-api-key' // Optionnel pour authentification par clé API
});
```

### ❌ Erreurs de Configuration Courantes

```typescript
// ❌ ERREUR : baseURL manquant
const sdk = new AmRDVSDK({
  timeout: 30000
}); // → Erreur: "baseURL est obligatoire"

// ❌ ERREUR : baseURL vide
const sdk = new AmRDVSDK({
  baseURL: ''
}); // → Erreur: "baseURL ne peut pas être vide"

// ❌ ERREUR : baseURL invalide
const sdk = new AmRDVSDK({
  baseURL: 'not-a-valid-url'
}); // → Erreur: "baseURL doit être une URL valide"
```

### ✅ Exemples de baseURL Valides

```typescript
// Production
const sdk = new AmRDVSDK({
  baseURL: 'https://api.amrdv.com/api/v1'
});

// Développement local
const sdk = new AmRDVSDK({
  baseURL: 'http://localhost:3000/api/v1'
});

// Staging
const sdk = new AmRDVSDK({
  baseURL: 'https://staging-api.amrdv.com/api/v1'
});

// Avec port personnalisé
const sdk = new AmRDVSDK({
  baseURL: 'https://my-api.example.com:8080/api/v1'
});
```

## 🔐 Authentification

### Connexion

```typescript
// Connexion avec email/mot de passe
const authResult = await sdk.auth.login({
  email: 'user@example.com',
  password: 'motdepasse123'
});

console.log('Utilisateur connecté:', authResult.user);
console.log('Token d\'accès:', authResult.accessToken);

// Connexion rapide avec identifiants mémorisés
const quickAuth = await sdk.auth.quickLogin('user@example.com');
```

### Gestion des Tokens

```typescript
// Le SDK gère automatiquement le refresh des tokens
// Mais vous pouvez aussi les définir manuellement
sdk.setAuthToken('votre-jwt-token');

// Ou les supprimer
sdk.clearAuthToken();
```

## 🏢 Gestion des Entreprises

### Recherche d'Entreprises

```typescript
// Recherche avec géolocalisation
const businesses = await sdk.business.searchBusinesses({
  search: 'coiffeur',
  location: {
    lat: 48.8566,
    lng: 2.3522
  },
  radius: 10, // km
  limit: 20
});

// Recherche par secteur d'activité
const businesses = await sdk.business.searchBusinesses({
  sectorId: 'uuid-du-secteur',
  isActive: true
});
```

### CRUD Entreprises

```typescript
// Créer une entreprise
const newBusiness = await sdk.business.createBusiness({
  name: 'Mon Salon de Coiffure',
  sectorId: 'uuid-secteur-coiffure',
  address: {
    street: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France'
  },
  contactInfo: {
    phone: '+33123456789',
    email: 'contact@monsalon.fr'
  }
});

// Mettre à jour une entreprise
const updated = await sdk.business.updateBusiness('business-id', {
  name: 'Nouveau Nom du Salon'
});
```

## 💼 Gestion des Services

### Services avec Pricing Flexible

```typescript
// Créer un service avec tarification fixe
const service = await sdk.services.createService({
  businessId: 'uuid-business',
  name: 'Coupe Classique',
  description: 'Coupe de cheveux classique',
  duration: 30, // minutes
  pricingConfig: {
    type: 'FIXED',
    visibility: 'PUBLIC',
    basePrice: {
      amount: 25.00,
      currency: 'EUR'
    }
  }
});

// Service avec tarification variable
const variableService = await sdk.services.createService({
  businessId: 'uuid-business',
  name: 'Coloration',
  pricingConfig: {
    type: 'VARIABLE',
    visibility: 'PUBLIC',
    basePrice: {
      amount: 50.00,
      currency: 'EUR'
    },
    variablePricing: {
      factors: [
        {
          name: 'Longueur de cheveux',
          options: [
            { label: 'Courts', priceModifier: 0 },
            { label: 'Mi-longs', priceModifier: 15 },
            { label: 'Longs', priceModifier: 30 }
          ]
        }
      ]
    }
  }
});

// Calculer le prix d'un service
const price = sdk.services.calculateServicePrice(variableService, {
  selectedOptions: {
    'Longueur de cheveux': 'Longs'
  }
}); // Prix: 80.00 EUR (50 + 30)
```

## 📅 Système de Rendez-vous

### Réserver un Rendez-vous

```typescript
// Vérifier les créneaux disponibles
const availableSlots = await sdk.appointments.getAvailableSlots({
  businessId: 'uuid-business',
  serviceId: 'uuid-service',
  date: '2024-01-15'
});

// Réserver un créneau
const appointment = await sdk.appointments.bookAppointment({
  businessId: 'uuid-business',
  serviceId: 'uuid-service',
  scheduledAt: '2024-01-15T14:30:00Z',
  clientInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+33123456789'
  },
  notes: 'Première visite'
});
```

### Gestion des Rendez-vous

```typescript
// Obtenir les rendez-vous d'un client
const clientAppointments = await sdk.appointments.getClientAppointments(
  'john.doe@example.com'
);

// Annuler un rendez-vous
await sdk.appointments.cancelAppointment(
  'appointment-id',
  'Empêchement de dernière minute'
);

// Reprogrammer un rendez-vous
await sdk.appointments.rescheduleAppointment(
  'appointment-id',
  '2024-01-16T10:00:00Z'
);
```

## 🧩 Intégration avec les Frameworks

### React + Hooks

```typescript
import { useState, useEffect } from 'react';
import AmRDVSDK from '@amrdv/frontend-sdk';

const sdk = new AmRDVSDK({
  baseURL: process.env.REACT_APP_API_URL // Variable d'environnement
});

function useAppointments(businessId: string) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const result = await sdk.appointments.getTodayAppointments(businessId);
        setAppointments(result);
      } catch (error) {
        console.error('Erreur lors de la récupération:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [businessId]);

  return { appointments, loading };
}

// Composant
function AppointmentsList({ businessId }: { businessId: string }) {
  const { appointments, loading } = useAppointments(businessId);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {appointments.map(appointment => (
        <div key={appointment.id}>
          <h3>{sdk.appointments.getClientFullName(appointment)}</h3>
          <p>{sdk.appointments.formatAppointmentDateTime(appointment)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue 3 + Composition API

```typescript
import { ref, onMounted } from 'vue';
import AmRDVSDK from '@amrdv/frontend-sdk';

const sdk = new AmRDVSDK({
  baseURL: import.meta.env.VITE_API_URL // Variable d'environnement Vite
});

export function useAuth() {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const login = async (email: string, password: string) => {
    try {
      const result = await sdk.auth.login({ email, password });
      user.value = result.user;
      isAuthenticated.value = true;
      return result;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = async () => {
    await sdk.auth.logout();
    user.value = null;
    isAuthenticated.value = false;
  };

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    login,
    logout
  };
}
```

### Angular + Services

```typescript
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import AmRDVSDK from '@amrdv/frontend-sdk';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AmRDVService {
  private sdk = new AmRDVSDK({
    baseURL: environment.apiUrl,
    debug: !environment.production
  });

  searchBusinesses(query: string): Observable<Business[]> {
    return from(this.sdk.business.searchBusinesses({ search: query }));
  }

  bookAppointment(appointmentData: BookAppointmentRequest): Observable<Appointment> {
    return from(this.sdk.appointments.bookAppointment(appointmentData));
  }
}
```

## ⚙️ Configuration Avancée

### Variables d'Environnement

```typescript
// .env.local (Next.js)
NEXT_PUBLIC_API_URL=https://api.amrdv.com/api/v1

// .env (React)
REACT_APP_API_URL=https://api.amrdv.com/api/v1

// .env (Vue/Vite)
VITE_API_URL=https://api.amrdv.com/api/v1

// Utilisation
const sdk = new AmRDVSDK({
  baseURL: process.env.NEXT_PUBLIC_API_URL ||
           process.env.REACT_APP_API_URL ||
           import.meta.env.VITE_API_URL
});
```

### Gestion des Erreurs

```typescript
import { AmRDVSDKError } from '@amrdv/frontend-sdk';

try {
  await sdk.auth.login({ email: 'test@example.com', password: 'wrong' });
} catch (error) {
  if (error instanceof AmRDVSDKError) {
    console.log('Code d\'erreur:', error.code);
    console.log('Message:', error.message);
    console.log('Détails:', error.details);
  }
}
```

### Intercepteurs et Hooks

```typescript
const sdk = new AmRDVSDK({
  baseURL: 'https://api.amrdv.com/api/v1',
  onTokenRefresh: (tokens) => {
    // Sauvegarder les nouveaux tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
  onAuthenticationError: () => {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }
});
```

## 🛠️ Utilitaires Intégrés

### Formatage et Validation

```typescript
// Formatage de prix
const formattedPrice = sdk.services.formatPrice(25.50, 'EUR'); // "25,50 €"

// Formatage de durée
const duration = sdk.services.formatDuration(90); // "1h 30min"

// Validation d'email
const isValid = sdk.auth.validateEmail('test@example.com'); // true

// Formatage de dates
const dateTime = sdk.appointments.formatAppointmentDateTime(appointment, 'fr-FR');
// "lundi 15 janvier 2024 à 14:30"
```

### Statistiques et Analytics

```typescript
// Statistiques des rendez-vous
const appointments = await sdk.appointments.getTodayAppointments('business-id');
const stats = sdk.appointments.getAppointmentStats(appointments);

console.log('Total aujourd\'hui:', stats.total);
console.log('Confirmés:', stats.byStatus.CONFIRMED);
console.log('En attente:', stats.byStatus.PENDING);
```

## 📊 Types TypeScript

Le SDK est entièrement typé avec TypeScript. Les types principaux incluent :

```typescript
import type {
  User,
  Business,
  Service,
  Appointment,
  AmRDVConfig,
  ApiResponse,
  PaginatedResponse
} from '@amrdv/frontend-sdk';
```

## 🔄 Migration et Compatibilité

### Compatibilité des Versions

- **Node.js**: ≥16.0.0
- **TypeScript**: ≥5.0.0
- **Browsers**: ES2020+ (Chrome 80+, Firefox 75+, Safari 13.1+)

### Support ESM/CJS

```typescript
// ESM (recommandé)
import AmRDVSDK from '@amrdv/frontend-sdk';

// CommonJS
const AmRDVSDK = require('@amrdv/frontend-sdk');
```

## 🐛 Débogage

### Mode Debug

```typescript
const sdk = new AmRDVSDK({
  baseURL: 'https://api.amrdv.com/api/v1',
  debug: true // Active les logs détaillés
});
```

### Vérification de Santé de l'API

```typescript
const health = await sdk.healthCheck();
console.log('API Status:', health.status); // 'ok' ou 'error'
```

## � Services Disponibles Complets

### 🔐 AuthService
- `login(credentials)` - Connexion utilisateur avec cookies sécurisés
- `me()` - Profil utilisateur connecté
- `logout()` - Déconnexion et nettoyage session

### 🏢 BusinessService
- `list(params)` - Liste des entreprises avec filtres
- `getById(id)` - Détails d'une entreprise
- `create(data)` - Créer une entreprise
- `update(id, data)` - Modifier une entreprise
- `delete(id)` - Supprimer une entreprise

### 💼 ServicesService
- `list(params)` - Liste des services avec pagination
- `getById(id)` - Détails d'un service
- `create(data)` - Créer un service
- `update(id, data)` - Modifier un service
- `delete(id)` - Supprimer un service

### 📅 AppointmentsService
- `list(params)` - Liste des rendez-vous
- `getById(id)` - Détails d'un rendez-vous
- `book(data)` - Réserver un rendez-vous
- `update(id, data)` - Modifier un rendez-vous
- `cancel(id)` - Annuler un rendez-vous
- `reschedule(id, data)` - Reprogrammer un rendez-vous
- `getAvailableSlots(params)` - Créneaux disponibles

### 👥 StaffService *(Nouveau)*
- `list(params)` - Liste du personnel avec filtres avancés
- `getById(id)` - Détails d'un membre du personnel
- `create(data)` - Ajouter un nouveau membre
- `update(id, data)` - Modifier un membre
- `delete(id)` - Supprimer un membre
- `updateAvailability(id, data)` - Gérer les disponibilités
- `getStats(businessId)` - Statistiques du personnel
- `getByBusiness(businessId)` - Personnel par entreprise

### 🎭 RolesService *(Nouveau)*
- `list(params)` - Liste des rôles d'entreprise
- `getById(id)` - Détails d'un rôle
- `create(data)` - Créer un nouveau rôle
- `update(id, data)` - Modifier un rôle
- `delete(id)` - Supprimer un rôle
- `assignToUser(userId, roleId)` - Assigner rôle à utilisateur
- `getUserRoles(userId)` - Rôles d'un utilisateur

### 🔒 PermissionsService *(Nouveau)*
- `check(userId, permission)` - Vérifier une permission
- `getUserPermissions(userId)` - Permissions d'un utilisateur
- `getRolePermissions(roleId)` - Permissions d'un rôle
- `grant(userId, permission)` - Accorder une permission
- `revoke(userId, permission)` - Révoquer une permission
- `bulk(operations)` - Opérations en lot

### 🔔 NotificationsService *(Nouveau)*
- `list(params)` - Liste des notifications
- `send(data)` - Envoyer une notification
- `markAsRead(id)` - Marquer comme lu
- `markAllAsRead(userId)` - Tout marquer comme lu
- `scheduleReminder(data)` - Programmer un rappel
- `getTemplates()` - Templates de notifications
- `getStats(businessId)` - Statistiques d'envoi

### 📅 CalendarsService *(Nouveau)*
- `list(params)` - Liste des calendriers
- `getById(id)` - Détails d'un calendrier
- `create(data)` - Créer un nouveau calendrier
- `update(id, data)` - Modifier un calendrier
- `delete(id)` - Supprimer un calendrier
- `getAvailableSlots(params)` - Créneaux libres
- `getCalendarView(id, start, end)` - Vue calendrier complète
- `syncWithExternal(id, externalId)` - Sync calendrier externe

### 📋 CalendarTypesService *(Nouveau)*
- `list(params)` - Types de calendriers
- `create(data)` - Créer un type de calendrier
- `update(id, data)` - Modifier un type
- `delete(id)` - Supprimer un type
- `setDefault(id)` - Définir comme défaut
- `reorder(businessId, orders)` - Réorganiser l'ordre
- `duplicate(id, newName)` - Dupliquer un type

### 🛠️ ServiceTypesService *(Nouveau)*
- `list(params)` - Types de services avec filtres
- `create(data)` - Créer un type de service
- `update(id, data)` - Modifier un type
- `delete(id)` - Supprimer un type
- `getByCategory(businessId, category)` - Par catégorie
- `addTag(id, tag)` - Ajouter un tag
- `removeTag(id, tag)` - Supprimer un tag
- `export(businessId, format)` - Exporter types
- `import(businessId, file)` - Importer types

### 🖼️ GalleryService *(Nouveau)*
- `list(params)` - Images de la galerie
- `upload(data)` - Télécharger une image
- `getById(id)` - Détails d'une image
- `update(id, data)` - Modifier les métadonnées
- `delete(id)` - Supprimer une image
- `getByCategory(category)` - Images par catégorie
- `bulkUpload(files)` - Upload multiple
- `generateThumbnails(id)` - Générer miniatures

### 🏢 BusinessImageService *(Nouveau)*
- `list(businessId)` - Images d'une entreprise
- `upload(data)` - Télécharger image entreprise
- `getById(id)` - Détails d'une image
- `update(id, data)` - Modifier image
- `delete(id)` - Supprimer image
- `setAsLogo(id)` - Définir comme logo
- `setAsCover(id)` - Définir comme couverture
- `reorder(businessId, orders)` - Réorganiser galerie

### ⏰ BusinessHoursService *(Nouveau)*
- `get(businessId)` - Horaires d'ouverture actuels
- `update(businessId, data)` - Modifier les horaires
- `addSpecialHours(businessId, data)` - Ajouter horaires spéciaux
- `removeSpecialHours(id)` - Supprimer horaires spéciaux
- `isOpen(businessId, datetime)` - Vérifier si ouvert
- `getNextOpeningTime(businessId)` - Prochaine ouverture
- `validateSchedule(schedule)` - Valider planning

### ❤️ HealthService *(Nouveau)*
- `check()` - Vérification santé globale de l'API
- `getMetrics()` - Métriques système en temps réel
- `getDatabaseStatus()` - État de la base de données
- `getCacheStatus()` - État du cache Redis
- `getSystemInfo()` - Informations système détaillées
- `ping()` - Test de connectivité simple

## �📞 Support et Contribution

- **Issues**: [GitHub Issues](https://github.com/rvproject/frontend-sdk/issues)
- **Documentation**: [Documentation complète](https://docs.rvproject.com)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 📄 Licence

MIT © RV Project Team

---

**🎯 SDK développé avec ❤️ pour simplifier l'intégration avec l'API RV Project**
