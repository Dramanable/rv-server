/**
 * 💼 USE CASES MODULE - Infrastructure Layer
 *
 * Module simple qui expose les Use Cases comme classes
 * ✅ CORRECT : Infrastructure layer peut dépendre de NestJS
 * ✅ RESPECT Clean Architecture : L'inversion de dépendances se fait dans Presentation
 */

import { Module } from '@nestjs/common';

// 💼 Use Cases - Imports depuis Application Layer (TypeScript pur)

// Auth Use Cases
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from '@application/use-cases/auth/register.use-case';

// User Use Cases
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';
import { GetMeUseCase } from '@application/use-cases/users/get-me.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';

// Business Sector Use Cases
import { CreateBusinessSectorUseCase } from '@application/use-cases/business-sectors/create-business-sector.use-case';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';

// 🌩️ AWS S3 Image Management Use Cases
import { AddImageToBusinessGalleryUseCase } from '@application/use-cases/business/add-image-to-gallery.use-case';
import { UpdateBusinessSeoProfileUseCase } from '@application/use-cases/business/update-business-seo.use-case';
import { UploadBusinessImageUseCase } from '@application/use-cases/business/upload-business-image.use-case';

/**
 * 🏗️ USE CASES MODULE
 *
 * Module simple qui expose les Use Cases classes
 * L'inversion de dépendances se fait dans PresentationModule
 */
@Module({
  providers: [
    // Auth Use Cases
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RegisterUseCase,

    // User Use Cases
    GetMeUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // Business Sector Use Cases
    CreateBusinessSectorUseCase,
    ListBusinessSectorsUseCase,
    UpdateBusinessSectorUseCase,
    DeleteBusinessSectorUseCase,

    // 🌩️ AWS S3 Image Management Use Cases
    AddImageToBusinessGalleryUseCase,
    UpdateBusinessSeoProfileUseCase,
    UploadBusinessImageUseCase,
  ],
  exports: [
    // Auth Use Cases
    LoginUseCase,
    LogoutUseCase,
    RefreshTokenUseCase,
    RegisterUseCase,

    // User Use Cases
    GetMeUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    // Business Sector Use Cases
    CreateBusinessSectorUseCase,
    ListBusinessSectorsUseCase,
    UpdateBusinessSectorUseCase,
    DeleteBusinessSectorUseCase,

    // 🌩️ AWS S3 Image Management Use Cases
    AddImageToBusinessGalleryUseCase,
    UpdateBusinessSeoProfileUseCase,
    UploadBusinessImageUseCase,
  ],
})
export class UseCasesModule {}
