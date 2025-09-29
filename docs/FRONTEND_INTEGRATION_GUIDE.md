# 🎨 Frontend Integration Guide - Appointment Management API

## 📋 Quick Start Integration

### 🚀 Setup & Configuration

#### Environment Variables

```env
# .env.local (React) or .env (Vue/Angular)
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_DOCS=http://localhost:3000/api/docs
REACT_APP_ENVIRONMENT=development
```

#### TypeScript Types (Auto-generated from API)

```typescript
// types/api.types.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role:
    | 'PLATFORM_ADMIN'
    | 'BUSINESS_OWNER'
    | 'BUSINESS_ADMIN'
    | 'PRACTITIONER'
    | 'CLIENT';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  website?: string;
  address: Address;
  settings: BusinessSettings;
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number;
  category: string;
  pricingConfig: PricingConfig;
  packages?: ServicePackage[];
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  clientInfo: ClientInfo;
  startTime: string;
  endTime: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  totalAmount: Money;
  notes?: string;
  createdAt: string;
}

export interface PricingConfig {
  type: 'FREE' | 'FIXED' | 'VARIABLE' | 'HIDDEN' | 'ON_DEMAND';
  visibility: 'PUBLIC' | 'AUTHENTICATED' | 'PRIVATE' | 'HIDDEN';
  basePrice: Money;
  variablePricing?: VariablePricing;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
    version: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    field?: string;
    timestamp: string;
    path: string;
  };
}
```

## 🔐 Authentication Integration

### React Authentication Hook

```typescript
// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: (logoutAllDevices?: boolean) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, rememberMe })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }

    const data = await response.json();
    setUser(data.data.user);
  };

  const logout = async (logoutAllDevices = false) => {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ logoutAllDevices })
    });
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Vue 3 Authentication Store (Pinia)

```typescript
// stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role);

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    try {
      const response = await $fetch('/auth/login', {
        method: 'POST',
        body: credentials,
        credentials: 'include',
      });
      user.value = response.data.user;
      return response.data;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (logoutAllDevices = false) => {
    await $fetch('/auth/logout', {
      method: 'POST',
      body: { logoutAllDevices },
      credentials: 'include',
    });
    user.value = null;
  };

  const checkAuth = async () => {
    try {
      const response = await $fetch('/auth/me', {
        credentials: 'include',
      });
      user.value = response.data.user;
    } catch {
      user.value = null;
    }
  };

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,
    userRole,
    login,
    logout,
    checkAuth,
  };
});
```

## 🏢 Business Management Components

### React Business List Component

```typescript
// components/BusinessList.tsx
import React, { useState, useEffect } from 'react';
import { Business } from '../types/api.types';

export const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
    page: 1,
    limit: 20
  });

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/businesses/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(filters)
      });

      if (!response.ok) throw new Error('Failed to fetch businesses');

      const data = await response.json();
      setBusinesses(data.data.businesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  return (
    <div className="business-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search businesses..."
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading businesses...</div>
      ) : (
        <div className="business-grid">
          {businesses.map((business) => (
            <div key={business.id} className="business-card">
              <h3>{business.name}</h3>
              <p>{business.description}</p>
              <div className="business-contact">
                <span>📧 {business.email}</span>
                <span>📞 {business.phone}</span>
              </div>
              <div className="business-address">
                📍 {business.address.street}, {business.address.city}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Vue 3 Service Management Component

```vue
<!-- components/ServiceManager.vue -->
<template>
  <div class="service-manager">
    <div class="service-header">
      <h2>Service Management</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        ➕ Add New Service
      </button>
    </div>

    <div class="service-filters">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search services..."
        class="search-input"
      />
      <select v-model="selectedCategory" class="filter-select">
        <option value="">All Categories</option>
        <option value="MEDICAL">Medical</option>
        <option value="WELLNESS">Wellness</option>
        <option value="BEAUTY">Beauty</option>
        <option value="FITNESS">Fitness</option>
      </select>
    </div>

    <div class="service-list">
      <div v-if="loading" class="loading">Loading services...</div>
      <div v-else class="service-grid">
        <div
          v-for="service in filteredServices"
          :key="service.id"
          class="service-card"
        >
          <div class="service-header">
            <h3>{{ service.name }}</h3>
            <span class="service-category">{{ service.category }}</span>
          </div>
          <p class="service-description">{{ service.description }}</p>

          <div class="service-pricing">
            <span class="price">
              {{ formatPrice(service.pricingConfig) }}
            </span>
            <span class="duration">{{ service.duration }} min</span>
          </div>

          <div class="service-actions">
            <button @click="editService(service)" class="btn-secondary">
              ✏️ Edit
            </button>
            <button @click="toggleServiceStatus(service)" class="btn-warning">
              {{ service.isActive ? '⏸️ Deactivate' : '▶️ Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Service Modal -->
    <ServiceCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleServiceCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Service } from '../types/api.types';
import ServiceCreateModal from './ServiceCreateModal.vue';

const services = ref<Service[]>([]);
const loading = ref(false);
const searchTerm = ref('');
const selectedCategory = ref('');
const showCreateModal = ref(false);

const filteredServices = computed(() => {
  let filtered = services.value;

  if (searchTerm.value) {
    filtered = filtered.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        service.description
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase()),
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(
      (service) => service.category === selectedCategory.value,
    );
  }

  return filtered;
});

const fetchServices = async () => {
  loading.value = true;
  try {
    const response = await $fetch('/api/v1/services/list', {
      method: 'POST',
      body: {
        page: 1,
        limit: 100,
        filters: {
          businessId: 'current-business-id', // Get from auth store
        },
      },
      credentials: 'include',
    });
    services.value = response.data.services;
  } catch (error) {
    console.error('Error fetching services:', error);
  } finally {
    loading.value = false;
  }
};

const formatPrice = (pricingConfig: any) => {
  if (pricingConfig.type === 'FREE') return 'Free';
  if (pricingConfig.type === 'ON_DEMAND') return 'Quote';
  if (pricingConfig.type === 'HIDDEN') return 'Contact us';

  const price = pricingConfig.basePrice;
  return `${price.amount}€`;
};

const editService = (service: Service) => {
  // Implementation for editing service
  console.log('Editing service:', service.id);
};

const toggleServiceStatus = async (service: Service) => {
  try {
    await $fetch(`/api/v1/services/${service.id}`, {
      method: 'PATCH',
      body: { isActive: !service.isActive },
      credentials: 'include',
    });

    // Update local state
    const index = services.value.findIndex((s) => s.id === service.id);
    if (index !== -1) {
      services.value[index].isActive = !service.isActive;
    }
  } catch (error) {
    console.error('Error toggling service status:', error);
  }
};

const handleServiceCreated = (newService: Service) => {
  services.value.unshift(newService);
  showCreateModal.value = false;
};

onMounted(() => {
  fetchServices();
});
</script>
```

## 📅 Appointment Booking Widget

### React Appointment Booking Component

```typescript
// components/AppointmentBooking.tsx
import React, { useState, useEffect } from 'react';
import { Service, Staff, Appointment } from '../types/api.types';

interface AppointmentBookingProps {
  businessId: string;
  onBooked?: (appointment: Appointment) => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  businessId,
  onBooked
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, [businessId]);

  // Fetch staff when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchStaff();
    }
  }, [selectedService]);

  // Fetch available slots when staff and date are selected
  useEffect(() => {
    if (selectedStaff && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedStaff, selectedDate]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/v1/services/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filters: {
            businessId,
            allowOnlineBooking: true,
            isActive: true
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      setServices(data.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/v1/staff/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filters: {
            businessId,
            canProvideService: selectedService?.id,
            isActive: true
          }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch staff');

      const data = await response.json();
      setStaff(data.data.staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/v1/appointments/available-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessId,
          serviceId: selectedService?.id,
          staffId: selectedStaff?.id,
          date: selectedDate,
          duration: selectedService?.duration
        })
      });

      if (!response.ok) throw new Error('Failed to fetch available slots');

      const data = await response.json();
      setAvailableSlots(data.data.slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedSlot || !clientInfo.email) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const startTime = new Date(`${selectedDate}T${selectedSlot}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          staffId: selectedStaff?.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          clientInfo,
          notes: clientInfo.notes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Booking failed');
      }

      const data = await response.json();
      onBooked?.(data.data);

      // Reset form
      setSelectedService(null);
      setSelectedStaff(null);
      setSelectedDate('');
      setSelectedSlot('');
      setClientInfo({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: ''
      });

      alert('Appointment booked successfully!');
    } catch (error) {
      alert(`Booking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-booking">
      <h2>📅 Book an Appointment</h2>

      {/* Step 1: Select Service */}
      <div className="booking-step">
        <h3>1. Select Service</h3>
        <div className="service-selection">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
              onClick={() => setSelectedService(service)}
            >
              <h4>{service.name}</h4>
              <p>{service.description}</p>
              <div className="service-details">
                <span>{service.duration} min</span>
                <span>{service.pricingConfig.basePrice.amount}€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Select Staff (optional) */}
      {selectedService && staff.length > 1 && (
        <div className="booking-step">
          <h3>2. Select Practitioner (Optional)</h3>
          <div className="staff-selection">
            <div
              className={`staff-option ${!selectedStaff ? 'selected' : ''}`}
              onClick={() => setSelectedStaff(null)}
            >
              <span>No preference</span>
            </div>
            {staff.map((staffMember) => (
              <div
                key={staffMember.id}
                className={`staff-option ${selectedStaff?.id === staffMember.id ? 'selected' : ''}`}
                onClick={() => setSelectedStaff(staffMember)}
              >
                <span>{staffMember.firstName} {staffMember.lastName}</span>
                <small>{staffMember.title}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {selectedService && (
        <div className="booking-step">
          <h3>3. Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
        </div>
      )}

      {/* Step 4: Select Time */}
      {availableSlots.length > 0 && (
        <div className="booking-step">
          <h3>4. Select Time</h3>
          <div className="time-slots">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Client Information */}
      {selectedSlot && (
        <div className="booking-step">
          <h3>5. Your Information</h3>
          <div className="client-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="First Name *"
                value={clientInfo.firstName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Last Name *"
                value={clientInfo.lastName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="email"
                placeholder="Email *"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <textarea
              placeholder="Additional notes (optional)"
              value={clientInfo.notes}
              onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <button
            className="book-button"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Booking...' : '✅ Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
};
```

## 📊 Data Management Hooks

### React Data Fetching Hook with Caching

```typescript
// hooks/useApiData.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiDataOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: any;
  dependencies?: any[];
  enabled?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
}

const cache = new Map<
  string,
  { data: any; timestamp: number; duration: number }
>();

export function useApiData<T>({
  endpoint,
  method = 'GET',
  body,
  dependencies = [],
  enabled = true,
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
}: UseApiDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      const isExpired = Date.now() - cached.timestamp > cached.duration;

      if (!isExpired) {
        setData(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : {},
        credentials: 'include',
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const responseData = result.data || result;

      setData(responseData);

      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, {
          data: responseData,
          timestamp: Date.now(),
          duration: cacheDuration,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [
    endpoint,
    method,
    body,
    enabled,
    cacheKey,
    cacheDuration,
    ...dependencies,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache before refetching
    if (cacheKey) {
      cache.delete(cacheKey);
    }
    fetchData();
  }, [fetchData, cacheKey]);

  return { data, loading, error, refetch };
}

// Usage examples:
export const useBusinesses = (filters = {}) =>
  useApiData<Business[]>({
    endpoint: '/api/v1/businesses/list',
    method: 'POST',
    body: { page: 1, limit: 20, ...filters },
    dependencies: [filters],
    cacheKey: `businesses-${JSON.stringify(filters)}`,
    cacheDuration: 2 * 60 * 1000, // 2 minutes for business data
  });

export const useServices = (businessId: string) =>
  useApiData<Service[]>({
    endpoint: '/api/v1/services/list',
    method: 'POST',
    body: { filters: { businessId } },
    dependencies: [businessId],
    enabled: !!businessId,
    cacheKey: `services-${businessId}`,
  });

export const useAppointments = (filters = {}) =>
  useApiData<Appointment[]>({
    endpoint: '/api/v1/appointments/list',
    method: 'POST',
    body: { page: 1, limit: 50, ...filters },
    dependencies: [filters],
    cacheKey: `appointments-${JSON.stringify(filters)}`,
    cacheDuration: 1 * 60 * 1000, // 1 minute for real-time data
  });
```

## 🛡️ Error Boundary & Global Error Handling

### React Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>🚨 Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global API Error Handler
export const handleApiError = (error: any): string => {
  if (error?.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
    return 'Authentication required';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to perform this action';
  }

  if (error?.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return error?.response?.data?.error?.message || error?.message || 'An error occurred';
};
```

## 📱 Mobile-First Responsive Components

### CSS for Mobile-First Design

```css
/* Global styles for API integration components */
.appointment-booking {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.booking-step {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.booking-step h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.service-selection {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.service-option {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.service-option:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.service-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.time-slot {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.time-slot:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.time-slot.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.client-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .service-selection {
    grid-template-columns: 1fr;
  }

  .time-slots {
    grid-template-columns: repeat(3, 1fr);
  }
}

.book-button {
  width: 100%;
  padding: 1rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.book-button:hover:not(:disabled) {
  background: #059669;
}

.book-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Loading states */
.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.loading::after {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-left: 0.5rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error states */
.error-message {
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  margin: 1rem 0;
}

.error-boundary {
  text-align: center;
  padding: 2rem;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  margin: 1rem;
}
```

This comprehensive integration guide provides everything needed to build a modern frontend application that seamlessly integrates with the Appointment Management API. The examples cover authentication, business management, appointment booking, and responsive design patterns that work across all modern frameworks.
