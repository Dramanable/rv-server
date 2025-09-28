# 🎨 Frontend Integration Examples

## 🎯 API INTEGRATION GUIDE FOR FRONTEND DEVELOPERS

**For Frontend Developers**: Ready-to-use examples for integrating with the NestJS + Fastify API.

### 🚀 **Quick Start**

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI JSON**: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)
- **Base URL**: `http://localhost:3000/api/v1`

### 📦 **TypeScript Type Generation**

```bash
# Install swagger-typescript-api globally
npm install -g swagger-typescript-api

# Generate TypeScript types from running API
swagger-typescript-api -p http://localhost:3000/api/docs-json -o ./types --name api-types.ts

# Or from downloaded OpenAPI spec
swagger-typescript-api -p ./openapi.json -o ./types --name api-types.ts
```

### 🔐 **Authentication Setup**

```typescript
// ✅ API Client with JWT Authentication
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = 'http://localhost:3000/api/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookie-based auth
    });

    // Auto-attach JWT from localStorage
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login or refresh token
          this.handleAuthError();
        }
        return Promise.reject(error);
      },
    );
  }

  private handleAuthError() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  // Generic request method
  async request<T>(config: any): Promise<T> {
    const response = await this.client(config);
    return response.data;
  }
}

const api = new ApiClient();
```

### 💼 **Services Management Integration**

```typescript
// ✅ Service-related types and interfaces
interface ServiceFilters {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  categoryId?: string;
  pricingType?: 'FIXED' | 'VARIABLE' | 'PACKAGE';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Service {
  id: string;
  name: string;
  description: string;
  pricingConfig: {
    type: 'FIXED' | 'VARIABLE' | 'PACKAGE';
    basePrice: {
      amount: number;
      currency: string;
    };
    visibility: 'PUBLIC' | 'PRIVATE';
  };
  categoryId: string;
  isActive: boolean;
  allowOnlineBooking: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ServiceResponse {
  success: boolean;
  data: Service[];
  meta: PaginationMeta;
}

// ✅ Services API Integration
class ServicesApi {
  // Search services with advanced filters
  static async searchServices(
    filters: ServiceFilters,
  ): Promise<ServiceResponse> {
    return api.request({
      method: 'POST',
      url: '/services/list',
      data: {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 20,
      },
    });
  }

  // Get service by ID
  static async getService(
    id: string,
  ): Promise<{ success: boolean; data: Service }> {
    return api.request({
      method: 'GET',
      url: `/services/${id}`,
    });
  }

  // Create new service
  static async createService(
    serviceData: Partial<Service>,
  ): Promise<{ success: boolean; data: Service }> {
    return api.request({
      method: 'POST',
      url: '/services',
      data: serviceData,
    });
  }

  // Update service
  static async updateService(
    id: string,
    updates: Partial<Service>,
  ): Promise<{ success: boolean; data: Service }> {
    return api.request({
      method: 'PUT',
      url: `/services/${id}`,
      data: updates,
    });
  }

  // Delete service
  static async deleteService(id: string): Promise<{ success: boolean }> {
    return api.request({
      method: 'DELETE',
      url: `/services/${id}`,
    });
  }
}
```

### 👥 **Staff Management Integration**

```typescript
// ✅ Staff-related types
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
  specializations: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StaffFilters {
  search?: string;
  role?: 'OWNER' | 'MANAGER' | 'EMPLOYEE';
  specialization?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ✅ Staff API Integration
class StaffApi {
  static async searchStaff(
    filters: StaffFilters,
  ): Promise<{ success: boolean; data: StaffMember[]; meta: PaginationMeta }> {
    return api.request({
      method: 'POST',
      url: '/staff/list',
      data: filters,
    });
  }

  static async getStaffMember(
    id: string,
  ): Promise<{ success: boolean; data: StaffMember }> {
    return api.request({
      method: 'GET',
      url: `/staff/${id}`,
    });
  }

  static async createStaffMember(
    staffData: Partial<StaffMember>,
  ): Promise<{ success: boolean; data: StaffMember }> {
    return api.request({
      method: 'POST',
      url: '/staff',
      data: staffData,
    });
  }
}
```

### 📅 **Appointments Integration**

```typescript
// ✅ Appointment-related types
interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceId: string;
  staffId: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFilters {
  staffId?: string;
  serviceId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// ✅ Appointments API Integration
class AppointmentsApi {
  // Get available time slots
  static async getAvailableSlots(params: {
    serviceId: string;
    staffId?: string;
    date: string; // YYYY-MM-DD
  }): Promise<{ success: boolean; data: TimeSlot[] }> {
    return api.request({
      method: 'GET',
      url: '/appointments/available-slots',
      params,
    });
  }

  // Book appointment
  static async bookAppointment(appointmentData: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    serviceId: string;
    staffId?: string;
    scheduledAt: string; // ISO string
    notes?: string;
  }): Promise<{ success: boolean; data: Appointment }> {
    return api.request({
      method: 'POST',
      url: '/appointments',
      data: appointmentData,
    });
  }

  // List appointments
  static async listAppointments(
    filters: AppointmentFilters,
  ): Promise<{ success: boolean; data: Appointment[]; meta: PaginationMeta }> {
    return api.request({
      method: 'POST',
      url: '/appointments/list',
      data: filters,
    });
  }
}
```

### ⚠️ **Error Handling**

```typescript
// ✅ Standardized error handling
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    timestamp: string;
    path: string;
    correlationId: string;
  };
}

class ApiErrorHandler {
  static handle(error: any): string {
    if (error.response?.data?.error) {
      const apiError = error.response.data as ApiError;

      // Handle specific error codes
      switch (apiError.error.code) {
        case 'SERVICE_NOT_FOUND':
          return "Le service demandé n'existe pas.";
        case 'INSUFFICIENT_PERMISSIONS':
          return "Vous n'avez pas les permissions nécessaires.";
        case 'SERVICE_NOT_BOOKABLE_ONLINE':
          return 'Ce service ne peut pas être réservé en ligne.';
        case 'INVALID_TIME_SLOT':
          return "Le créneau sélectionné n'est pas disponible.";
        default:
          return (
            apiError.error.message || "Une erreur inattendue s'est produite."
          );
      }
    }

    // Network or other errors
    return 'Erreur de connexion. Veuillez réessayer.';
  }
}

// Usage in components
try {
  const services = await ServicesApi.searchServices(filters);
  // Handle success
} catch (error) {
  const errorMessage = ApiErrorHandler.handle(error);
  // Show error to user
}
```

### 🎭 **React Integration Examples**

```typescript
// ✅ React Hook for Services
import { useState, useEffect } from 'react';

export const useServices = (filters: ServiceFilters) => {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = async (newFilters: ServiceFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ServicesApi.searchServices(newFilters);
      setServices(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(ApiErrorHandler.handle(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(filters);
  }, [JSON.stringify(filters)]);

  return {
    services,
    pagination,
    loading,
    error,
    refetch: () => loadServices(filters),
  };
};

// ✅ React Component Example
const ServicesPage: React.FC = () => {
  const [filters, setFilters] = useState<ServiceFilters>({
    page: 1,
    limit: 20,
    status: 'ACTIVE',
  });

  const { services, pagination, loading, error, refetch } = useServices(filters);

  const handleFilterChange = (newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div>
      <h1>Services ({pagination?.totalItems || 0})</h1>

      {/* Search Filter */}
      <input
        type="text"
        placeholder="Rechercher un service..."
        onChange={(e) => handleFilterChange({ search: e.target.value })}
      />

      {/* Services List */}
      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className="price">
              {service.pricingConfig.basePrice.amount}€
            </div>
            <div className="status">
              {service.isActive ? 'Actif' : 'Inactif'}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => handleFilterChange({ page: pagination.currentPage - 1 })}
          >
            Précédent
          </button>
          <span>
            Page {pagination.currentPage} sur {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => handleFilterChange({ page: pagination.currentPage + 1 })}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};
```

### 🎯 **Vue.js Integration Examples**

```typescript
// ✅ Vue 3 Composition API
import { ref, computed, watch } from 'vue';

export const useServices = (initialFilters: ServiceFilters) => {
  const services = ref<Service[]>([]);
  const pagination = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({ ...initialFilters });

  const loadServices = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await ServicesApi.searchServices(filters.value);
      services.value = response.data;
      pagination.value = response.meta;
    } catch (err) {
      error.value = ApiErrorHandler.handle(err);
    } finally {
      loading.value = false;
    }
  };

  // Watch filters for changes
  watch(filters, loadServices, { deep: true });

  const updateFilters = (newFilters: Partial<ServiceFilters>) => {
    filters.value = { ...filters.value, ...newFilters, page: 1 };
  };

  return {
    services: computed(() => services.value),
    pagination: computed(() => pagination.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    filters,
    updateFilters,
    refetch: loadServices,
  };
};
```

**Complete integration examples for seamless frontend development!**
