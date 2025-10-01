/**
 * ❤️ RV Project Frontend SDK - Service de Santé
 *
 * Monitoring et vérification de l'état des services
 */

import { RVProjectClient } from '../client';

export enum ServiceStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN',
}

export interface HealthCheckResponse {
  readonly status: ServiceStatus;
  readonly timestamp: string;
  readonly uptime: number;
  readonly version: string;
  readonly environment: string;
  readonly checks: HealthCheck[];
  readonly metadata?: Record<string, any>;
}

export interface HealthCheck {
  readonly name: string;
  readonly status: ServiceStatus;
  readonly responseTime?: number;
  readonly message?: string;
  readonly details?: Record<string, any>;
  readonly lastChecked: string;
}

export interface DatabaseHealth {
  readonly status: ServiceStatus;
  readonly connectionPool: {
    active: number;
    idle: number;
    total: number;
    max: number;
  };
  readonly responseTime: number;
  readonly lastQuery: string;
}

export interface CacheHealth {
  readonly status: ServiceStatus;
  readonly connections: number;
  readonly memory: {
    used: string;
    total: string;
    percentage: number;
  };
  readonly responseTime: number;
  readonly hitRate?: number;
}

export interface SystemHealth {
  readonly status: ServiceStatus;
  readonly cpu: {
    usage: number;
    load: number[];
  };
  readonly memory: {
    used: string;
    total: string;
    percentage: number;
  };
  readonly disk: {
    used: string;
    total: string;
    percentage: number;
  };
  readonly network: {
    received: string;
    sent: string;
  };
}

export interface DetailedHealthResponse {
  readonly overall: ServiceStatus;
  readonly timestamp: string;
  readonly uptime: number;
  readonly version: string;
  readonly environment: string;
  readonly database: DatabaseHealth;
  readonly cache: CacheHealth;
  readonly system: SystemHealth;
  readonly services: Array<{
    name: string;
    status: ServiceStatus;
    responseTime?: number;
    message?: string;
  }>;
}

export class HealthService {
  constructor(private client: RVProjectClient) {}

  /**
   * ❤️ Vérification basique de santé
   */
  async check(): Promise<HealthCheckResponse> {
    const response =
      await this.client.get<HealthCheckResponse>('/api/v1/health');
    return response.data;
  }

  /**
   * 🔍 Vérification détaillée de santé
   */
  async detailed(): Promise<DetailedHealthResponse> {
    const response = await this.client.get<DetailedHealthResponse>(
      '/api/v1/health/detailed',
    );
    return response.data;
  }

  /**
   * 🗄️ Santé de la base de données
   */
  async database(): Promise<DatabaseHealth> {
    const response = await this.client.get<DatabaseHealth>(
      '/api/v1/health/database',
    );
    return response.data;
  }

  /**
   * 🚀 Santé du cache
   */
  async cache(): Promise<CacheHealth> {
    const response = await this.client.get<CacheHealth>('/api/v1/health/cache');
    return response.data;
  }

  /**
   * 💻 Santé du système
   */
  async system(): Promise<SystemHealth> {
    const response = await this.client.get<SystemHealth>(
      '/api/v1/health/system',
    );
    return response.data;
  }

  /**
   * 🔄 Liveness probe (pour Kubernetes)
   */
  async liveness(): Promise<{ status: 'ok' }> {
    const response = await this.client.get<{ status: 'ok' }>(
      '/api/v1/health/liveness',
    );
    return response.data;
  }

  /**
   * ✅ Readiness probe (pour Kubernetes)
   */
  async readiness(): Promise<{
    status: 'ok' | 'not-ready';
    details?: string[];
  }> {
    const response = await this.client.get<{
      status: 'ok' | 'not-ready';
      details?: string[];
    }>('/api/v1/health/readiness');
    return response.data;
  }

  /**
   * 📊 Métriques de performance
   */
  async metrics(): Promise<{
    requests: {
      total: number;
      successful: number;
      failed: number;
      avgResponseTime: number;
    };
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    uptime: number;
    timestamp: string;
  }> {
    const response = await this.client.get<{
      requests: {
        total: number;
        successful: number;
        failed: number;
        avgResponseTime: number;
      };
      memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
      };
      uptime: number;
      timestamp: string;
    }>('/api/v1/health/metrics');
    return response.data;
  }

  /**
   * 🏢 Santé spécifique à un business
   */
  async businessHealth(businessId: string): Promise<{
    status: ServiceStatus;
    services: number;
    appointments: number;
    staff: number;
    lastActivity: string;
    issues?: string[];
  }> {
    const response = await this.client.get<{
      status: ServiceStatus;
      services: number;
      appointments: number;
      staff: number;
      lastActivity: string;
      issues?: string[];
    }>(`/api/v1/health/business/${businessId}`);
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour la santé
   */
  static getStatusColor(status: ServiceStatus): string {
    const colors: Record<ServiceStatus, string> = {
      [ServiceStatus.HEALTHY]: '#10B981', // Vert
      [ServiceStatus.DEGRADED]: '#F59E0B', // Orange
      [ServiceStatus.UNHEALTHY]: '#EF4444', // Rouge
      [ServiceStatus.UNKNOWN]: '#6B7280', // Gris
    };
    return colors[status];
  }

  static getStatusIcon(status: ServiceStatus): string {
    const icons: Record<ServiceStatus, string> = {
      [ServiceStatus.HEALTHY]: '✅',
      [ServiceStatus.DEGRADED]: '⚠️',
      [ServiceStatus.UNHEALTHY]: '❌',
      [ServiceStatus.UNKNOWN]: '❓',
    };
    return icons[status];
  }

  static getStatusText(status: ServiceStatus): string {
    const texts: Record<ServiceStatus, string> = {
      [ServiceStatus.HEALTHY]: 'En bonne santé',
      [ServiceStatus.DEGRADED]: 'Performance dégradée',
      [ServiceStatus.UNHEALTHY]: 'Non opérationnel',
      [ServiceStatus.UNKNOWN]: 'État inconnu',
    };
    return texts[status];
  }

  static formatUptime(uptimeSeconds: number): string {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static formatMemory(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  static formatResponseTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(0)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    } else {
      return `${(milliseconds / 60000).toFixed(2)}m`;
    }
  }

  static calculateOverallStatus(checks: HealthCheck[]): ServiceStatus {
    if (checks.length === 0) return ServiceStatus.UNKNOWN;

    const hasUnhealthy = checks.some(
      (check) => check.status === ServiceStatus.UNHEALTHY,
    );
    const hasDegraded = checks.some(
      (check) => check.status === ServiceStatus.DEGRADED,
    );

    if (hasUnhealthy) return ServiceStatus.UNHEALTHY;
    if (hasDegraded) return ServiceStatus.DEGRADED;

    return ServiceStatus.HEALTHY;
  }

  static isHealthy(status: ServiceStatus): boolean {
    return status === ServiceStatus.HEALTHY;
  }

  static isDegraded(status: ServiceStatus): boolean {
    return status === ServiceStatus.DEGRADED;
  }

  static isUnhealthy(status: ServiceStatus): boolean {
    return status === ServiceStatus.UNHEALTHY;
  }

  static sortChecksByStatus(checks: HealthCheck[]): HealthCheck[] {
    const statusOrder: Record<ServiceStatus, number> = {
      [ServiceStatus.UNHEALTHY]: 0,
      [ServiceStatus.DEGRADED]: 1,
      [ServiceStatus.UNKNOWN]: 2,
      [ServiceStatus.HEALTHY]: 3,
    };

    return [...checks].sort((a, b) => {
      const orderA = statusOrder[a.status];
      const orderB = statusOrder[b.status];
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }

  static getHealthSummary(response: HealthCheckResponse): {
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
    total: number;
  } {
    const summary = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0,
      total: response.checks.length,
    };

    response.checks.forEach((check) => {
      switch (check.status) {
        case ServiceStatus.HEALTHY:
          summary.healthy++;
          break;
        case ServiceStatus.DEGRADED:
          summary.degraded++;
          break;
        case ServiceStatus.UNHEALTHY:
          summary.unhealthy++;
          break;
        case ServiceStatus.UNKNOWN:
          summary.unknown++;
          break;
      }
    });

    return summary;
  }
}

export default HealthService;
