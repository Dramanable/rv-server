/**
 * 🌐 RV Project Frontend SDK - HTTP Client avec Cookie Authentication
 * 
 * Client HTTP utilisant fetch avec support des cookies HttpOnly
 * Conforme à l'API qui utilise des cookies sécurisés pour l'authentification
 */

import {
  RVProjectSDKError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  NetworkError,
  TimeoutError,
  ApiResponse
} from './types';

export interface RVProjectClientConfig {
  baseURL: string;
  timeout?: number;
  debug?: boolean;
  onAuthenticationError?: () => void;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Client HTTP principal pour l'API RV Project
 * Utilise fetch avec credentials: 'include' pour les cookies HttpOnly
 */
export class RVProjectClient {
  private baseURL: string;
  private config: RVProjectClientConfig & {
    timeout: number;
    debug: boolean;
    onAuthenticationError: () => void;
  };

  constructor(config: RVProjectClientConfig) {
    // 🚨 Validation obligatoire du baseURL
    if (!config.baseURL || config.baseURL.trim() === '') {
      throw new RVProjectSDKError(
        'Configuration invalide : baseURL est obligatoire et ne peut pas être vide',
        'INVALID_CONFIG'
      );
    }

    // Validation du format de l'URL
    try {
      new URL(config.baseURL);
    } catch (error) {
      throw new RVProjectSDKError(
        `Configuration invalide : baseURL doit être une URL valide. Reçu: ${config.baseURL}`,
        'INVALID_BASE_URL'
      );
    }

    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.config = {
      timeout: 10000,
      debug: false,
      onAuthenticationError: () => {},
      ...config,
    };
  }

  /**
   * Requête HTTP générique avec gestion des cookies
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout || this.config.timeout
    );

    const fetchConfig: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: 'include', // 🍪 CRITICAL: Required for HttpOnly cookies
      signal: controller.signal,
    };

    if (options.body && options.method !== 'GET') {
      fetchConfig.body = JSON.stringify(options.body);
    }

    try {
      if (this.config.debug) {
        console.log('🚀 RV Project SDK Request:', {
          method: fetchConfig.method,
          url,
          headers,
          body: options.body,
        });
      }

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      if (this.config.debug) {
        console.log('✅ RV Project SDK Response:', {
          status: response.status,
          statusText: response.statusText,
          url,
        });
      }

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError('Request timeout');
      }

      if (error instanceof RVProjectSDKError) {
        throw error;
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  /**
   * Gestion des réponses d'erreur
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parsing errors
    }

    const { status } = response;
    const message = errorData?.message || errorData?.error?.message || `HTTP ${status}`;

    switch (status) {
      case 400:
        throw new ValidationError(
          message,
          errorData?.error?.field,
          errorData?.error?.details
        );
      
      case 401:
        // Déclencher callback d'erreur d'authentification
        this.config.onAuthenticationError();
        throw new AuthenticationError(message);
      
      case 403:
        throw new AuthorizationError(message);
      
      case 404:
        throw new NotFoundError(message);
      
      case 409:
        throw new ConflictError(message, errorData?.error?.details);
      
      default:
        throw new RVProjectSDKError(
          message,
          errorData?.error?.code || 'UNKNOWN_ERROR',
          status,
          errorData?.error?.details
        );
    }
  }

  /**
   * Requête GET
   */
  public async get<T = any>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Requête POST
   */
  public async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * Requête PUT
   */
  public async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * Requête PATCH
   */
  public async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * Requête DELETE
   */
  public async delete<T = any>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload de fichier
   */
  public async uploadFile<T = any>(
    endpoint: string,
    files: { fieldName: string; file: File | Blob; fileName?: string }[],
    additionalData?: Record<string, any>,
    _onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Ajouter les fichiers
    files.forEach(({ fieldName, file, fileName }) => {
      formData.append(fieldName, file, fileName);
    });

    // Ajouter les données supplémentaires
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      if (this.config.debug) {
        console.log('📤 RV Project SDK File Upload:', {
          endpoint,
          files: files.map(f => ({ fieldName: f.fieldName, fileName: f.fileName })),
          additionalData,
        });
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // 🍪 Required for cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();

      if (this.config.debug) {
        console.log('✅ RV Project SDK Upload Success:', data);
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError('Upload timeout');
      }

      if (error instanceof RVProjectSDKError) {
        throw error;
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Upload failed'
      );
    }
  }

  /**
   * Test de connexion à l'API
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      if (this.config.debug) {
        console.error('❌ RV Project SDK Connection Test Failed:', error);
      }
      return false;
    }
  }

  /**
   * Activer/désactiver le mode debug
   */
  public setDebugMode(enabled: boolean): void {
    (this.config as any).debug = enabled;
  }

  /**
   * Obtenir la configuration actuelle
   */
  public getConfig(): Readonly<RVProjectClientConfig> {
    return { ...this.config };
  }

  /**
   * Obtenir l'URL de base
   */
  public getBaseURL(): string {
    return this.baseURL;
  }
}

/**
 * Factory function pour créer un client RV Project
 */
export function createRVProjectClient(config: RVProjectClientConfig): RVProjectClient {
  return new RVProjectClient(config);
}