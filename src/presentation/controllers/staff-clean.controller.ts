import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@presentation/security/guards/jwt-auth.guard";
import { GetUser } from "@presentation/security/decorators/get-user.decorator";
import { User } from "@domain/entities/user.entity";
import { Inject } from "@nestjs/common";
import { TOKENS } from "@shared/constants/injection-tokens";

// DTOs - Import staff DTOs
import {
  CreateStaffDto,
  UpdateStaffDto,
  ListStaffDto,
  CreateStaffResponseDto,
  UpdateStaffResponseDto,
  ListStaffResponseDto,
  GetStaffResponseDto,
  DeleteStaffResponseDto,
} from "@presentation/dtos/staff.dto";

// Use Cases
import { CreateStaffUseCase } from "@application/use-cases/staff/create-staff.use-case";
import { GetStaffUseCase } from "@application/use-cases/staff/get-staff.use-case";
import { UpdateStaffUseCase } from "@application/use-cases/staff/update-staff.use-case";
import { DeleteStaffUseCase } from "@application/use-cases/staff/delete-staff.use-case";
import { ListStaffUseCase } from "@application/use-cases/staff/list-staff.use-case";

@ApiTags("👨‍💼 Staff Management")
@Controller("staff")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(
    @Inject(TOKENS.CREATE_STAFF_USE_CASE)
    private readonly createStaffUseCase: CreateStaffUseCase,

    @Inject(TOKENS.GET_STAFF_USE_CASE)
    private readonly getStaffUseCase: GetStaffUseCase,

    @Inject(TOKENS.UPDATE_STAFF_USE_CASE)
    private readonly updateStaffUseCase: UpdateStaffUseCase,

    @Inject(TOKENS.DELETE_STAFF_USE_CASE)
    private readonly deleteStaffUseCase: DeleteStaffUseCase,

    @Inject(TOKENS.LIST_STAFF_USE_CASE)
    private readonly listStaffUseCase: ListStaffUseCase,
  ) {}

  @Post("list")
  @ApiOperation({
    summary: "🔍 Search staff with advanced filters",
    description: "Recherche avancée paginée du personnel avec filtres",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Staff found successfully",
    type: ListStaffResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async list(
    @Body() dto: ListStaffDto,
    @GetUser() user: User,
  ): Promise<ListStaffResponseDto> {
    // TODO: Structure ListStaffRequest avec pagination/sorting/filters
    const request = {
      requestingUserId: user.id,
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      sorting: {
        sortBy: dto.sortBy || "createdAt",
        sortOrder: dto.sortOrder || "desc",
      },
      filters: {
        search: dto.search,
        role: dto.role,
        isActive: dto.isActive,
        businessId: dto.businessId,
      },
    };

    const response = await this.listStaffUseCase.execute(request);

    return response as unknown as ListStaffResponseDto;
  }

  @Get(":id")
  @ApiOperation({
    summary: "📄 Get staff by ID",
    description: "Récupère un membre du personnel par son ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Staff found successfully",
    type: GetStaffResponseDto,
  })
  async findById(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GetStaffResponseDto> {
    const request = {
      staffId: id,
      requestingUserId: user.id,
    };

    const response = await this.getStaffUseCase.execute(request);

    return response as unknown as GetStaffResponseDto;
  }

  @Post()
  @ApiOperation({
    summary: "➕ Create new staff member",
    description: "Créer un nouveau membre du personnel",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Staff created successfully",
    type: CreateStaffResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateStaffDto,
    @GetUser() user: User,
  ): Promise<CreateStaffResponseDto> {
    const request = {
      requestingUserId: user.id,
      ...dto,
    };

    const response = await this.createStaffUseCase.execute(request);

    return response as unknown as CreateStaffResponseDto;
  }

  @Put(":id")
  @ApiOperation({
    summary: "✏️ Update staff member",
    description: "Mettre à jour un membre du personnel",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Staff updated successfully",
    type: UpdateStaffResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateStaffDto,
    @GetUser() user: User,
  ): Promise<UpdateStaffResponseDto> {
    // ✅ Structure avec updates - mapping simple
    const request = {
      staffId: id,
      requestingUserId: user.id,
      updates: dto as any, // TODO: Proper mapping with StaffProfile types
    };

    const response = await this.updateStaffUseCase.execute(request);

    return response as unknown as UpdateStaffResponseDto;
  }

  @Delete(":id")
  @ApiOperation({
    summary: "🗑️ Delete staff member",
    description: "Supprimer un membre du personnel",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Staff deleted successfully",
    type: DeleteStaffResponseDto,
  })
  async delete(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<DeleteStaffResponseDto> {
    const request = {
      staffId: id,
      requestingUserId: user.id,
    };

    const response = await this.deleteStaffUseCase.execute(request);

    return response as unknown as DeleteStaffResponseDto;
  }
}
