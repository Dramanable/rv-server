import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedUser } from '../security/types/guard.types';
import { CreateProspectDto } from '../dtos/prospects/create-prospect.dto';
import { UpdateProspectDto } from '../dtos/prospects/update-prospect.dto';
import { ListProspectsDto } from '../dtos/prospects/list-prospects.dto';
import { ProspectResponseDto } from '../dtos/prospects/prospect-response.dto';
import { ListProspectsResponseDto } from '../dtos/prospects/list-prospects-response.dto';
import {
  CreateProspectRequest,
  UpdateProspectRequest,
  ListProspectsRequest,
  ListProspectsResponse,
} from '../types/prospect.types';

export class ProspectDtoMapper {
  static toCreateProspectRequest(
    dto: CreateProspectDto,
    user: AuthenticatedUser,
  ): CreateProspectRequest {
    return {
      businessName: dto.businessName,
      contactEmail: dto.email,
      contactName: dto.contactName,
      contactPhone: dto.phone || '',
      estimatedValue: dto.estimatedValue || 0,
      currency: dto.estimatedValueCurrency || 'EUR',
      notes: dto.notes || '',
      source: dto.source || 'DIRECT',
      assignedSalesRep: dto.assignedSalesRep || user.id,
      requestingUserId: user.id,
      correlationId: uuidv4(),
      timestamp: new Date(),
    };
  }

  static toUpdateProspectRequest(
    prospectId: string,
    dto: UpdateProspectDto,
    user: AuthenticatedUser,
  ): UpdateProspectRequest {
    return {
      prospectId,
      businessName: dto.businessName,
      contactName: dto.contactName,
      estimatedValue: dto.estimatedValue,
      notes: dto.notes,
      status: dto.status,
      requestingUserId: user.id,
      correlationId: uuidv4(),
      timestamp: new Date(),
    };
  }

  static toListProspectsRequest(
    dto: ListProspectsDto,
    user: AuthenticatedUser,
  ): ListProspectsRequest {
    return {
      search: dto.search,
      status: dto.status,
      assignedSalesRep: dto.assignedSalesRep,
      source: dto.source,
      minEstimatedValue: dto.minEstimatedValue,
      sortBy: dto.sortBy as any,
      sortOrder: dto.sortOrder,
      page: dto.page,
      limit: dto.limit,
      requestingUserId: user.id,
      requestingUserRole: user.role, // Inclure le rôle utilisateur
      correlationId: uuidv4(),
      timestamp: new Date(),
    };
  }

  static toGetProspectRequest(
    prospectId: string,
    user: AuthenticatedUser,
  ): any {
    return {
      prospectId,
      requestingUserId: user.id,
      correlationId: uuidv4(),
      timestamp: new Date(),
    };
  }

  static toDeleteProspectRequest(
    prospectId: string,
    user: AuthenticatedUser,
  ): any {
    return {
      prospectId,
      requestingUserId: user.id,
      correlationId: uuidv4(),
      timestamp: new Date(),
    };
  }

  static toProspectResponse(response: any): ProspectResponseDto {
    return {
      id: response.id,
      businessName: response.businessName,
      contactName: response.contactName,
      email: response.contactEmail,
      phone: response.contactPhone || '',
      status: response.status,
      source: response.source,
      assignedSalesRep: response.assignedSalesRep,
      estimatedValue: response.estimatedValue?.amount || 0,
      estimatedValueCurrency: response.estimatedValue?.currency || 'EUR',
      proposedMonthlyPrice: response.estimatedMonthlyPrice?.amount || 0,
      proposedCurrency: response.estimatedMonthlyPrice?.currency || 'EUR',
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      description: response.notes || '',
      businessSize: response.businessSize,
      estimatedStaffCount: response.staffCount,
      lastContactDate: undefined,
      notes: response.notes || '',
      pricingProposal: undefined,
      expectedClosingDate: undefined,
      priorityScore: response.isHotProspect ? 8 : 5,
      interactionCount: 0,
      tags: [],
      customFields: {},
      createdBy: 'system',
      updatedBy: 'system',
    };
  }

  static toListProspectsResponse(
    response: ListProspectsResponse,
  ): ListProspectsResponseDto {
    return {
      success: true,
      data: response.data.map((prospect: any) => ({
        id: prospect.id,
        businessName: prospect.businessName,
        contactName: prospect.contactName,
        email: prospect.contactEmail,
        phone: '',
        status: prospect.status.value,
        source: prospect.source,
        assignedSalesRep: prospect.assignedSalesRep,
        estimatedValue: prospect.estimatedValue.amount,
        estimatedValueCurrency: prospect.estimatedValue.currency,
        proposedMonthlyPrice: prospect.estimatedMonthlyPrice.amount,
        proposedCurrency: prospect.estimatedMonthlyPrice.currency,
        createdAt: prospect.createdAt,
        updatedAt: prospect.updatedAt,
        description: '',
        businessSize: prospect.businessSize.value,
        estimatedStaffCount: prospect.staffCount,
        lastContactDate: undefined,
        notes: '',
        pricingProposal: undefined,
        expectedClosingDate: undefined,
        priorityScore: prospect.isHotProspect ? 8 : 5,
        interactionCount: 0,
        tags: [],
        customFields: {},
        createdBy: 'system',
        updatedBy: 'system',
      })),
      meta: response.meta,
    };
  }
}
