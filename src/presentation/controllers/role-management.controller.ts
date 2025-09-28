import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AssignRoleUseCase } from '@application/use-cases/role-management/assign-role.use-case';
import { User } from '@domain/entities/user.entity';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { RequireRoles } from '@presentation/security/decorators/roles.decorator';
import { RoleBasedGuard } from '@presentation/security/guards/role-based.guard';
import { TOKENS } from '@shared/constants/injection-tokens';
import { UserRole } from '@shared/enums/user-role.enum';

import {
  AssignRoleDto,
  AssignRoleResponseDto,
} from '@presentation/dtos/role-management/assign-role.dto';
import {
  ListRoleAssignmentsDto,
  ListRoleAssignmentsResponseDto,
} from '@presentation/dtos/role-management/list-role-assignments.dto';
import {
  BatchRevokeRolesDto,
  BatchRevokeRolesResponseDto,
  RevokeRoleDto,
  RevokeRoleResponseDto,
} from '@presentation/dtos/role-management/revoke-role.dto';

/**
 * 🎯 **Controller RBAC - Gestion des Rôles et Permissions**
 *
 * Endpoints pour la gestion granulaire des assignations de rôles dans le système RBAC.
 *
 * ## 🔐 **Sécurité et Autorisations**
 * - **JWT** : Authentification Bearer obligatoire
 * - **RBAC** : Permissions granulaires par action
 * - **Audit Trail** : Toutes les opérations sont auditées
 *
 * ## 📋 **Fonctionnalités**
 * - **Assignation** : Assigner des rôles avec contexte business
 * - **Révocation** : Révoquer des rôles individuels ou en lot
 * - **Recherche** : Filtrage avancé des assignations avec pagination
 * - **Audit** : Historique complet des modifications
 */
@ApiTags('👤 Role Management')
@Controller('role-assignments')
@ApiBearerAuth()
@UseGuards(RoleBasedGuard)
@RequireRoles(UserRole.SUPER_ADMIN)
export class RoleManagementController {
  private readonly logger = new Logger(RoleManagementController.name);

  constructor(
    @Inject(TOKENS.ASSIGN_ROLE_USE_CASE)
    private readonly assignRoleUseCase: AssignRoleUseCase,

    // TODO: Injecter d'autres use cases quand ils seront implémentés
    // @Inject(INJECTION_TOKENS.LIST_ROLE_ASSIGNMENTS_USE_CASE)
    // private readonly listRoleAssignmentsUseCase: ListRoleAssignmentsUseCase,
    //
    // @Inject(INJECTION_TOKENS.REVOKE_ROLE_USE_CASE)
    // private readonly revokeRoleUseCase: RevokeRoleUseCase,
  ) {}

  /**
   * 🎯 Génère un ID de corrélation unique pour traçabilité
   */
  private generateCorrelationId(): string {
    return `role-mgmt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 🎯 **Assigner un rôle à un utilisateur**
   *
   * Assigne un rôle spécifique à un utilisateur dans un contexte business déterminé.
   *
   * ## ✅ **Règles Métier**
   * - Seuls les **SUPER_ADMIN**, **BUSINESS_OWNER**, **LOCATION_MANAGER** peuvent assigner des rôles
   * - Un utilisateur peut avoir plusieurs rôles dans différents contextes
   * - Les assignations peuvent avoir une date d'expiration
   *
   * ## 🔒 **Permissions Requises**
   * - `MANAGE_ROLES` dans le contexte business concerné
   *
   * @param dto Données d'assignation du rôle
   * @param requestingUser Utilisateur authentifié qui effectue l'assignation
   * @returns Confirmation de l'assignation avec détails complets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🎯 Assigner un rôle à un utilisateur',
    description: `
    Assigne un rôle spécifique à un utilisateur dans un contexte business déterminé.

    ## ✅ **Fonctionnalités**
    - **Validation automatique** des permissions et contexte
    - **Audit trail** complet de l'assignation
    - **Gestion des expirations** avec dates flexibles
    - **Scoping granulaire** par business/location/département

    ## 🔐 **Sécurité**
    - Vérification des permissions de l'utilisateur assigneur
    - Validation de l'existence du contexte business
    - Contrôle des rôles autorisés selon la hiérarchie

    ## 📊 **Exemples d'Usage**

    ### Assigner un Manager de Location
    \`\`\`json
    {
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "role": "LOCATION_MANAGER",
      "businessContextId": "987fcdeb-51a2-43d7-8c9f-123456789abc",
      "scope": "LOCATION",
      "expiresAt": "2025-01-15T10:30:00Z",
      "notes": "Promotion temporaire pour Q1 2024"
    }
    \`\`\`

    ### Assigner un Technicien
    \`\`\`json
    {
      "userId": "456e7890-e12b-34c5-a678-901234567890",
      "role": "STAFF_MEMBER",
      "businessContextId": "654fedcb-21a9-87d6-4c3f-987654321cba",
      "scope": "DEPARTMENT",
      "notes": "Assignation permanente équipe technique"
    }
    \`\`\`
    `,
  })
  @ApiBody({
    description: "Données d'assignation du rôle",
    type: AssignRoleDto,
    examples: {
      locationManager: {
        summary: 'Assigner Manager de Location',
        value: {
          userId: '123e4567-e89b-12d3-a456-426614174000',
          role: UserRole.LOCATION_MANAGER,
          businessContextId: '987fcdeb-51a2-43d7-8c9f-123456789abc',
          scope: 'LOCATION',
          expiresAt: '2025-01-15T10:30:00Z',
          notes: 'Promotion temporaire pour Q1 2024',
        },
      },
      staffMember: {
        summary: 'Assigner Membre du Personnel',
        value: {
          userId: '456e7890-e12b-34c5-a678-901234567890',
          role: UserRole.ASSISTANT,
          businessContextId: '654fedcb-21a9-87d6-4c3f-987654321cba',
          scope: 'DEPARTMENT',
          notes: 'Assignation permanente équipe technique',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Rôle assigné avec succès',
    type: AssignRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Données d'assignation invalides",
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'ROLE_ASSIGNMENT_INVALID_DATA' },
            message: {
              type: 'string',
              example: "Les données d'assignation sont invalides",
            },
            field: { type: 'string', example: 'businessContextId' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes pour assigner des rôles',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Utilisateur ou contexte business introuvable',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "⚠️ L'utilisateur a déjà ce rôle dans ce contexte",
  })
  async assignRole(
    @Body() dto: AssignRoleDto,
    @GetUser() requestingUser: User,
  ): Promise<AssignRoleResponseDto> {
    this.logger.log(`Assigning role ${dto.role} to user ${dto.userId}`, {
      requestingUserId: requestingUser.id,
      targetUserId: dto.userId,
      role: dto.role,
      businessId: dto.businessId,
      assignmentScope: dto.assignmentScope,
    });

    try {
      const result = await this.assignRoleUseCase.execute({
        userId: dto.userId,
        role: dto.role,
        context: {
          businessId: dto.businessId,
          locationId: dto.locationId,
          departmentId: dto.departmentId,
        },
        assignedBy: requestingUser.id,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        notes: dto.notes,
        correlationId: this.generateCorrelationId(),
      });

      this.logger.log(`Role ${dto.role} assigned successfully`, {
        assignmentId: result.roleAssignmentId,
        userId: dto.userId,
        role: dto.role,
      });

      return {
        success: result.success,
        data: {
          assignmentId: result.roleAssignmentId!,
          userId: dto.userId,
          role: dto.role,
          businessId: dto.businessId,
          locationId: dto.locationId,
          departmentId: dto.departmentId,
          assignmentScope: dto.assignmentScope,
          assignedAt: new Date().toISOString(),
          isActive: true,
          notes: dto.notes,
          metadata: dto.metadata,
        },
      };
    } catch (error) {
      this.logger.error('Failed to assign role', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestingUserId: requestingUser.id,
        targetUserId: dto.userId,
        role: dto.role,
        businessId: dto.businessId,
      });
      throw error;
    }
  }

  /**
   * 🔍 **Rechercher les assignations de rôles avec filtrage avancé**
   *
   * TODO: À implémenter quand ListRoleAssignmentsUseCase sera créé
   */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 Rechercher les assignations de rôles',
    description:
      'Recherche avancée avec pagination et filtrage des assignations de rôles',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Liste des assignations trouvées',
    type: ListRoleAssignmentsResponseDto,
  })
  async listRoleAssignments(
    @Body() dto: ListRoleAssignmentsDto,
    @GetUser() requestingUser: User,
  ): Promise<ListRoleAssignmentsResponseDto> {
    // TODO: Implémenter quand le use case sera créé
    this.logger.log('Listing role assignments - TODO: Implement use case', {
      requestingUserId: requestingUser.id,
      filters: dto,
    });

    throw new Error('ListRoleAssignmentsUseCase not implemented yet');
  }

  /**
   * 🗑️ **Révoquer une assignation de rôle**
   *
   * TODO: À implémenter quand RevokeRoleUseCase sera créé
   */
  @Delete(':assignmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🗑️ Révoquer une assignation de rôle',
    description: 'Révoque une assignation de rôle spécifique avec audit trail',
  })
  @ApiParam({
    name: 'assignmentId',
    description: "ID de l'assignation à révoquer",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Assignation révoquée avec succès',
    type: RevokeRoleResponseDto,
  })
  async revokeRoleAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RevokeRoleDto,
    @GetUser() requestingUser: User,
  ): Promise<RevokeRoleResponseDto> {
    // TODO: Implémenter quand le use case sera créé
    this.logger.log('Revoking role assignment - TODO: Implement use case', {
      assignmentId,
      requestingUserId: requestingUser.id,
      reason: dto.reason,
    });

    throw new Error('RevokeRoleUseCase not implemented yet');
  }

  /**
   * 🗑️ **Révoquer des assignations de rôles en lot**
   *
   * TODO: À implémenter quand BatchRevokeRolesUseCase sera créé
   */
  @Post('batch-revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🗑️ Révoquer des assignations en lot',
    description:
      'Révoque plusieurs assignations de rôles simultanément avec rapport détaillé',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Révocations en lot traitées',
    type: BatchRevokeRolesResponseDto,
  })
  async batchRevokeRoles(
    @Body() dto: BatchRevokeRolesDto,
    @GetUser() requestingUser: User,
  ): Promise<BatchRevokeRolesResponseDto> {
    // TODO: Implémenter quand le use case sera créé
    this.logger.log(
      'Batch revoking role assignments - TODO: Implement use case',
      {
        assignmentCount: dto.assignmentIds.length,
        requestingUserId: requestingUser.id,
        reason: dto.reason,
      },
    );

    throw new Error('BatchRevokeRolesUseCase not implemented yet');
  }
}
