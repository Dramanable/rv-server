import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { PermissionNotFoundError } from '@domain/exceptions/permission.exceptions';
import { IPermissionRepository } from '@domain/repositories/permission.repository';

/**
 * Get Permission By ID Use Case
 * Clean Architecture - Application Layer - Use Case
 * ✅ RESPECT COMPLET DES STANDARDS ENTERPRISE
 */

export interface GetPermissionByIdRequest {
  readonly permissionId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
  readonly clientIp?: string;
  readonly userAgent?: string;
}

export interface GetPermissionByIdResponse {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: string;
  readonly isSystemPermission: boolean;
  readonly isActive: boolean;
  readonly canBeDeleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class GetPermissionByIdUseCase {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly logger: Logger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
  ) {}

  async execute(
    request: GetPermissionByIdRequest,
  ): Promise<GetPermissionByIdResponse> {
    this.logger.info('🔍 Getting permission by ID', {
      permissionId: request.permissionId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      timestamp: request.timestamp,
      clientIp: request.clientIp,
      userAgent: request.userAgent,
    });

    try {
      // 1. Récupérer la permission par ID
      const permission = await this.permissionRepository.findById(
        request.permissionId,
      );

      // 2. Vérifier si la permission existe
      if (!permission) {
        this.logger.warn('❌ Permission not found', {
          permissionId: request.permissionId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        });

        throw new PermissionNotFoundError(
          this.i18n.translate('permission.errors.notFound', {
            id: request.permissionId,
          }),
          'id',
        );
      }

      this.logger.info('✅ Permission retrieved successfully', {
        permissionId: permission.getId(),
        permissionName: permission.getName(),
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });

      // 3. Retourner la permission au format JSON
      return permission.toJSON();
    } catch (error) {
      const actualError =
        error instanceof Error ? error : new Error(String(error));

      this.logger.error('💥 Failed to get permission by ID', actualError, {
        permissionId: request.permissionId,
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });
      throw error;
    }
  }
}
