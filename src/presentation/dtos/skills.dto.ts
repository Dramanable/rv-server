/**
 * ✅ OBLIGATOIRE - DTOs pour Skills (version compatible TypeScript 5+)
 *
 * Ces DTOs utilisent une approche compatible pour éviter les problèmes
 * de décorateurs TypeScript 5+.
 */

// ➕ CREATE SKILL
export class CreateSkillDto {
  businessId!: string;
  name!: string;
  category!: string;
  description?: string;
  isCritical?: boolean;
  // Context obligatoire
  requestingUserId!: string;
  correlationId!: string;
  clientIp?: string;
  userAgent?: string;
}

export class CreateSkillResponseDto {
  success!: boolean;
  data!: {
    id: string;
    businessId: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
    isCritical: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// 📄 GET SKILL
export class GetSkillResponseDto {
  success!: boolean;
  data!: {
    id: string;
    businessId: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
    isCritical: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// ✏️ UPDATE SKILL
export class UpdateSkillDto {
  name?: string;
  category?: string;
  description?: string;
  isCritical?: boolean;
  isActive?: boolean;
  // Context obligatoire
  requestingUserId!: string;
  correlationId!: string;
  clientIp?: string;
  userAgent?: string;
}

export class UpdateSkillResponseDto {
  success!: boolean;
  data!: {
    id: string;
    businessId: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
    isCritical: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// 🔍 LIST SKILLS
export class ListSkillsDto {
  // Pagination
  page?: number = 1;
  limit?: number = 10;
  sortBy?: 'name' | 'category' | 'createdAt' | 'updatedAt' = 'name';
  sortOrder?: 'asc' | 'desc' = 'asc';

  // Filtres
  search?: string;
  category?: string;
  isActive?: boolean;
  isCritical?: boolean;

  // Context obligatoire
  requestingUserId!: string;
  correlationId!: string;
}

export class ListSkillsResponseDto {
  success!: boolean;
  data!: Array<{
    id: string;
    businessId: string;
    name: string;
    category: string;
    description?: string;
    isActive: boolean;
    isCritical: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  meta!: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// 🗑️ DELETE SKILL
export class DeleteSkillResponseDto {
  success!: boolean;
  message!: string;
}
