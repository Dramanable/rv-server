/**
 * 🔄 Professional Mapper - Domain ↔ Presentation Layer
 *
 * Mapper pour conversion entre entités Professional Domain et DTOs Presentation
 * avec gestion complète des types et erreurs.
 */

import { Professional } from "@domain/entities/professional.entity";

import { CreateProfessionalResponseDto } from "../dtos/professionals/create-professional.dto";
import { DeleteProfessionalResponseDto } from "../dtos/professionals/delete-professional.dto";
import { GetProfessionalResponseDto } from "../dtos/professionals/get-professional.dto";
import { ListProfessionalsResponseDto } from "../dtos/professionals/list-professionals.dto";
import { UpdateProfessionalResponseDto } from "../dtos/professionals/update-professional.dto";

export class ProfessionalMapper {
  /**
   * 📄 Convert Professional Domain entity to Create Response DTO
   */
  static toCreateResponseDto(
    professional: Professional,
    correlationId: string,
  ): CreateProfessionalResponseDto {
    return {
      success: true,
      data: {
        id: professional.getId().getValue(),
        businessId: professional.getBusinessId().getValue(),
        firstName: professional.getFirstName(),
        lastName: professional.getLastName(),
        email: professional.getEmail().getValue(),
        phone: professional.getPhone(),
        specialization: professional.getSpeciality(),
        licenseNumber: professional.getLicenseNumber(),
        biography: professional.getBio(),
        profileImageUrl: professional.getProfileImage(),
        isAvailable: professional.isActive(),
        createdAt: professional.getCreatedAt().toISOString(),
        updatedAt: professional.getUpdatedAt().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  /**
   * 📄 Convert Professional Domain entity to Get Response DTO
   */
  static toGetResponseDto(
    professional: Professional,
    correlationId: string,
  ): GetProfessionalResponseDto {
    return {
      success: true,
      data: {
        id: professional.getId().getValue(),
        businessId: professional.getBusinessId().getValue(),
        firstName: professional.getFirstName(),
        lastName: professional.getLastName(),
        email: professional.getEmail().getValue(),
        phone: professional.getPhone(),
        specialization: professional.getSpeciality(),
        licenseNumber: professional.getLicenseNumber(),
        biography: professional.getBio(),
        profileImageUrl: professional.getProfileImage(),
        isAvailable: professional.isActive(),
        createdAt: professional.getCreatedAt().toISOString(),
        updatedAt: professional.getUpdatedAt().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  /**
   * ✏️ Convert Professional Domain entity to Update Response DTO
   */
  static toUpdateResponseDto(
    professional: Professional,
    correlationId: string,
  ): UpdateProfessionalResponseDto {
    return {
      success: true,
      data: {
        id: professional.getId().getValue(),
        businessId: professional.getBusinessId().getValue(),
        firstName: professional.getFirstName(),
        lastName: professional.getLastName(),
        email: professional.getEmail().getValue(),
        phone: professional.getPhone(),
        specialization: professional.getSpeciality(),
        licenseNumber: professional.getLicenseNumber(),
        biography: professional.getBio(),
        profileImageUrl: professional.getProfileImage(),
        isAvailable: professional.isActive(),
        createdAt: professional.getCreatedAt().toISOString(),
        updatedAt: professional.getUpdatedAt().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  /**
   * 🗑️ Convert to Delete Response DTO
   */
  static toDeleteResponseDto(
    deletedId: string,
    correlationId: string,
    message: string,
  ): DeleteProfessionalResponseDto {
    return {
      success: true,
      message,
      deletedId,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  /**
   * 📋 Convert Professional Domain entities array to List Response DTO
   */
  static toListResponseDto(
    professionals: Professional[],
    totalItems: number,
    currentPage: number,
    itemsPerPage: number,
    correlationId: string,
  ): ListProfessionalsResponseDto {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      success: true,
      data: professionals.map((professional) => ({
        id: professional.getId().getValue(),
        businessId: professional.getBusinessId().getValue(),
        firstName: professional.getFirstName(),
        lastName: professional.getLastName(),
        email: professional.getEmail().getValue(),
        phone: professional.getPhone(),
        specialization: professional.getSpeciality(),
        licenseNumber: professional.getLicenseNumber(),
        biography: professional.getBio(),
        profileImageUrl: professional.getProfileImage(),
        isAvailable: professional.isActive(),
        createdAt: professional.getCreatedAt().toISOString(),
        updatedAt: professional.getUpdatedAt().toISOString(),
      })),
      meta: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }

  /**
   * 📄 Convert Use Case Response to Get Response DTO
   */
  static fromUseCaseToGetResponseDto(
    useCaseResponse: {
      readonly success: true;
      readonly data: {
        readonly id: string;
        readonly businessId: string;
        readonly firstName: string;
        readonly lastName: string;
        readonly email: string;
        readonly phone?: string;
        readonly speciality: string;
        readonly licenseNumber: string;
        readonly experience?: string;
        readonly bio?: string;
        readonly isActive: boolean;
        readonly profileImageUrl?: string;
        readonly createdBy: string;
        readonly createdAt: Date;
        readonly updatedBy: string;
        readonly updatedAt: Date;
      };
    },
    correlationId: string,
  ): GetProfessionalResponseDto {
    return {
      success: true,
      data: {
        id: useCaseResponse.data.id,
        businessId: useCaseResponse.data.businessId,
        firstName: useCaseResponse.data.firstName,
        lastName: useCaseResponse.data.lastName,
        email: useCaseResponse.data.email,
        phone: useCaseResponse.data.phone,
        specialization: useCaseResponse.data.speciality, // Mapping speciality -> specialization
        licenseNumber: useCaseResponse.data.licenseNumber,
        biography: useCaseResponse.data.bio, // Mapping bio -> biography
        profileImageUrl: useCaseResponse.data.profileImageUrl,
        isAvailable: useCaseResponse.data.isActive, // Mapping isActive -> isAvailable
        createdAt: useCaseResponse.data.createdAt.toISOString(), // Date -> string
        updatedAt: useCaseResponse.data.updatedAt.toISOString(), // Date -> string
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId,
      },
    };
  }
}
