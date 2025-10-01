# 🎯 RV Project Frontend SDK - Documentation Finale

## 📋 **Vue d'ensemble**

Le **RV Project Frontend SDK** est un SDK TypeScript professionnel qui permet l'intégration complète avec l'API RV Project. Chaque client configure son propre `baseURL` selon son environnement.

## 🚀 **Installation**

```bash
npm install @rvproject/frontend-sdk
```

## ⚡ **Démarrage Rapide**

### Configuration Obligatoire du baseURL

**⚠️ IMPORTANT** : Le `baseURL` est **OBLIGATOIRE** et doit être défini par chaque client selon son environnement.

```typescript
import RVProjectSDK from '@rvproject/frontend-sdk';

// ✅ Configuration par le client - Production
const sdk = new RVProjectSDK({
  baseURL: 'https://api.rvproject.com/api/v1'
});

// ✅ Configuration par le client - Développement local
const sdkDev = new RVProjectSDK({
  baseURL: 'http://localhost:3000/api/v1'
});

// ✅ Configuration par le client - Staging
const sdkStaging = new RVProjectSDK({
  baseURL: 'https://staging-api.rvproject.com/api/v1'
});
```

## 🔧 **Configuration Avancée**

```typescript
const sdk = new RVProjectSDK({
  baseURL: 'https://mon-api.com/api/v1',  // ⚠️ OBLIGATOIRE
  timeout: 10000,                         // Optionnel (défaut: 5000ms)
  debug: true,                           // Optionnel (défaut: false)
  retryAttempts: 3,                      // Optionnel (défaut: 1)
  retryDelay: 1000                       // Optionnel (défaut: 500ms)
});
```

## 🌐 **Exemples par Environnement**

### 🏭 **Client Production**
```typescript
const prodSDK = new RVProjectSDK({
  baseURL: 'https://api.rvproject.com/api/v1',
  timeout: 15000
});
```

### 🔧 **Client Développement**
```typescript
const devSDK = new RVProjectSDK({
  baseURL: 'http://localhost:3000/api/v1',
  debug: true
});
```

### 🧪 **Client Testing/Staging**
```typescript
const testSDK = new RVProjectSDK({
  baseURL: 'https://test-api.monentreprise.com/api/v1',
  timeout: 8000
});
```

### ⚙️ **Client avec Port Personnalisé**
```typescript
const customSDK = new RVProjectSDK({
  baseURL: 'https://api.mondomaine.com:8080/api/v1'
});
```

## 🔐 **Authentification**

```typescript
// Connexion
const loginResult = await sdk.auth.login({
  email: 'utilisateur@example.com',
  password: 'motdepasse123'
});

if (loginResult.success) {
  // Token automatiquement configuré dans le SDK
  const user = loginResult.data.user;
  console.log('Connecté:', user.email);
}

// Obtenir l'utilisateur actuel
const currentUser = await sdk.auth.getCurrentUser();

// Déconnexion
await sdk.auth.logout();
```

## 🏢 **Gestion des Entreprises**

```typescript
// Rechercher des entreprises
const businesses = await sdk.business.searchBusinesses({
  search: 'coiffure',
  city: 'Paris',
  sector: 'BEAUTY',
  page: 1,
  limit: 10
});

// Obtenir une entreprise par ID
const business = await sdk.business.getBusinessById('business-id');

// Horaires d'ouverture
const hours = await sdk.business.getBusinessHours('business-id');

// Créneaux disponibles
const slots = await sdk.business.getAvailableSlots('business-id', '2025-01-15');
```

## 💼 **Gestion des Services**

```typescript
// Rechercher des services
const services = await sdk.services.searchServices({
  search: 'massage',
  category: 'WELLNESS',
  minPrice: 30,
  maxPrice: 100,
  page: 1,
  limit: 20
});

// Détails d'un service
const service = await sdk.services.getServiceById('service-id');

// Configuration tarifaire
const pricing = await sdk.services.getServicePricing('service-id');

// Calcul de prix avec options
const priceCalculation = await sdk.services.calculatePrice('service-id', {
  'Durée': '60 min',
  'Type': 'Premium'
});
```

## 📅 **Gestion des Rendez-vous**

```typescript
// Réserver un rendez-vous
const booking = await sdk.appointments.bookAppointment({
  serviceId: 'service-id',
  startTime: '2025-01-15T14:00:00Z',
  clientInfo: {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+33123456789'
  },
  selectedOptions: {
    'Durée': '60 min'
  }
});

// Créneaux disponibles pour un service
const availableSlots = await sdk.appointments.getAvailableSlots({
  serviceId: 'service-id',
  date: '2025-01-15'
});

// Mes rendez-vous
const myAppointments = await sdk.appointments.searchAppointments({
  status: 'CONFIRMED',
  page: 1,
  limit: 10
});

// Reprogrammer un rendez-vous
const reschedule = await sdk.appointments.rescheduleAppointment('appointment-id', {
  newStartTime: '2025-01-16T15:00:00Z'
});

// Annuler un rendez-vous
await sdk.appointments.cancelAppointment('appointment-id', {
  reason: 'Empêchement de dernière minute'
});
```

## 🛡️ **Validation et Gestion d'Erreurs**

Le SDK valide automatiquement le `baseURL` :

```typescript
// ❌ ERREUR : baseURL manquant
try {
  const sdk = new RVProjectSDK({});
} catch (error) {
  console.log(error.message);
  // "Configuration invalide : baseURL est obligatoire et ne peut pas être vide"
}

// ❌ ERREUR : baseURL invalide
try {
  const sdk = new RVProjectSDK({ baseURL: 'invalid-url' });
} catch (error) {
  console.log(error.message);
  // "Configuration invalide : baseURL doit être une URL valide"
}

// ✅ Gestion des erreurs API
const result = await sdk.auth.login({ email: 'test', password: 'wrong' });
if (!result.success) {
  console.log('Erreur:', result.error.message);
  console.log('Code:', result.error.code);
}
```

## 🔧 **Intégration avec les Frameworks**

### React
```typescript
import { useEffect, useState } from 'react';
import RVProjectSDK from '@rvproject/frontend-sdk';

function useRVProject() {
  const [sdk] = useState(() => new RVProjectSDK({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'
  }));

  return sdk;
}

// Dans un composant
function MyComponent() {
  const sdk = useRVProject();
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    sdk.business.searchBusinesses({ page: 1, limit: 10 })
      .then(result => {
        if (result.success) {
          setBusinesses(result.data.data);
        }
      });
  }, [sdk]);

  return <div>{/* Interface utilisateur */}</div>;
}
```

### Vue.js
```typescript
import { ref, onMounted } from 'vue';
import RVProjectSDK from '@rvproject/frontend-sdk';

export default {
  setup() {
    const sdk = new RVProjectSDK({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
    });

    const businesses = ref([]);

    onMounted(async () => {
      const result = await sdk.business.searchBusinesses({ page: 1, limit: 10 });
      if (result.success) {
        businesses.value = result.data.data;
      }
    });

    return { businesses };
  }
};
```

### Angular
```typescript
import { Injectable } from '@angular/core';
import RVProjectSDK from '@rvproject/frontend-sdk';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RVProjectService {
  private sdk = new RVProjectSDK({
    baseURL: environment.apiUrl
  });

  async getBusinesses() {
    const result = await this.sdk.business.searchBusinesses({ page: 1, limit: 10 });
    return result.success ? result.data.data : [];
  }
}
```

## 📊 **Types TypeScript**

Le SDK fournit des types TypeScript complets :

```typescript
import {
  RVProjectConfig,
  User,
  Business,
  Service,
  Appointment,
  APIResponse
} from '@rvproject/frontend-sdk';

// Configuration typée
const config: RVProjectConfig = {
  baseURL: 'https://api.example.com/api/v1',
  timeout: 10000
};

// Réponses typées
const businessResult: APIResponse<Business[]> = await sdk.business.searchBusinesses({});
```

## 🎯 **Fonctionnalités Avancées**

### Gestion des Tokens
```typescript
// Configurer manuellement un token
sdk.setAuthToken('your-jwt-token');

// Supprimer le token
sdk.clearAuthToken();
```

### Santé de l'API
```typescript
const health = await sdk.healthCheck();
console.log('API Status:', health.status); // 'ok' | 'error'
```

### Mise à jour de Configuration
```typescript
sdk.updateConfig({
  timeout: 15000,
  debug: false
});
```

## 📦 **Formats de Distribution**

Le SDK est disponible en plusieurs formats :

- **ESM** : `import RVProjectSDK from '@rvproject/frontend-sdk'`
- **CommonJS** : `const { RVProjectSDK } = require('@rvproject/frontend-sdk')`
- **Types** : Définitions TypeScript complètes incluses

## 🎯 **Points Clés**

1. **baseURL Obligatoire** : Chaque client configure son propre `baseURL`
2. **Validation Stricte** : Le SDK valide automatiquement la configuration
3. **TypeScript First** : Types complets pour une expérience de développement optimale
4. **Multi-framework** : Compatible React, Vue, Angular, Vanilla JS
5. **Production Ready** : Gestion d'erreurs, retry, timeout configurables

## 📋 **Configuration Environnements Types**

```bash
# .env.production
REACT_APP_API_URL=https://api.rvproject.com/api/v1

# .env.development
REACT_APP_API_URL=http://localhost:3000/api/v1

# .env.staging
REACT_APP_API_URL=https://staging-api.rvproject.com/api/v1
```

## 🚀 **Prêt pour la Production**

Le SDK est maintenant **complet et prêt pour la production** avec :

- ✅ Validation stricte du `baseURL` défini par le client
- ✅ 4 services complets (Auth, Business, Services, Appointments)
- ✅ 700+ lignes de types TypeScript
- ✅ Gestion d'erreurs professionnelle
- ✅ Support multi-framework
- ✅ Documentation complète avec exemples
- ✅ Build dual ESM/CJS optimisé
