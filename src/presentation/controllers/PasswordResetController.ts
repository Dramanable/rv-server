import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';

// DTOs
import {
  RequestPasswordResetDto,
  RequestPasswordResetResponseDto,
  VerifyPasswordResetCodeDto,
  VerifyPasswordResetCodeResponseDto,
  CompletePasswordResetDto,
  CompletePasswordResetResponseDto,
} from '../dtos/password-reset.dto';

// Use Cases - Types only for typing
import { RequestPasswordResetUseCase } from '../../application/use-cases/password-reset/request-password-reset.use-case';
import { VerifyPasswordResetCodeUseCase } from '../../application/use-cases/password-reset/verify-password-reset-code.use-case';
import { CompletePasswordResetUseCase } from '../../application/use-cases/password-reset/complete-password-reset.use-case';

// Domain Errors
import { ValidationError } from '../../domain/exceptions/domain.error';

// Injection Tokens
import { APPLICATION_TOKENS } from '../../shared/constants/injection-tokens';

/**
 * Contrôleur pour la gestion de la réinitialisation de mot de passe
 *
 * Endpoints:
 * - POST /auth/password-reset/request - Demander un code de réinitialisation
 * - POST /auth/password-reset/verify - Vérifier le code reçu par email
 * - POST /auth/password-reset/complete - Finaliser avec nouveau mot de passe
 */
@ApiTags('Authentication - Password Reset')
@Controller('auth/password-reset')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PasswordResetController {
  constructor(
    @Inject(APPLICATION_TOKENS.REQUEST_PASSWORD_RESET_USE_CASE)
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    @Inject(APPLICATION_TOKENS.VERIFY_PASSWORD_RESET_CODE_USE_CASE)
    private readonly verifyPasswordResetCodeUseCase: VerifyPasswordResetCodeUseCase,
    @Inject(APPLICATION_TOKENS.COMPLETE_PASSWORD_RESET_USE_CASE)
    private readonly completePasswordResetUseCase: CompletePasswordResetUseCase,
  ) {}

  /**
   * Demander la réinitialisation du mot de passe
   * Envoie un code à 4 chiffres par email
   */
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demander la réinitialisation du mot de passe',
    description:
      'Envoie un code de vérification à 4 chiffres par email. Le code expire après 15 minutes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Code de réinitialisation envoyé avec succès',
    type: RequestPasswordResetResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email invalide ou données manquantes',
  })
  @ApiTooManyRequestsResponse({
    description: 'Trop de tentatives, veuillez patienter',
  })
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<RequestPasswordResetResponseDto> {
    try {
      await this.requestPasswordResetUseCase.execute({ email: dto.email });

      return {
        message: 'Un code de vérification a été envoyé à votre adresse email',
        success: true,
        expiresInMinutes: 15,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError((error as Error).message);
      }
      throw error;
    }
  }

  /**
   * Vérifier le code de réinitialisation
   * Retourne un token de session temporaire
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérifier le code de réinitialisation',
    description:
      'Vérifie le code à 4 chiffres et retourne un token de session temporaire.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Code vérifié avec succès',
    type: VerifyPasswordResetCodeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Code invalide, expiré ou déjà utilisé',
  })
  @ApiUnauthorizedResponse({
    description: 'Code non trouvé ou utilisateur non trouvé',
  })
  async verifyPasswordResetCode(
    @Body() dto: VerifyPasswordResetCodeDto,
  ): Promise<VerifyPasswordResetCodeResponseDto> {
    try {
      const result = await this.verifyPasswordResetCodeUseCase.execute({
        code: dto.code,
      });

      return {
        sessionToken: result.sessionToken!,
        remainingTimeSeconds: (result.remainingTimeMinutes || 5) * 60,
        message: 'Code vérifié avec succès',
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError((error as Error).message);
      }
      throw error;
    }
  }

  /**
   * Finaliser la réinitialisation du mot de passe
   * Connecte automatiquement l'utilisateur
   */
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finaliser la réinitialisation du mot de passe',
    description:
      "Définit le nouveau mot de passe et connecte automatiquement l'utilisateur.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe réinitialisé avec succès, utilisateur connecté',
    type: CompletePasswordResetResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Token invalide ou mot de passe faible',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de session expiré ou invalide',
  })
  async completePasswordReset(
    @Body() dto: CompletePasswordResetDto,
  ): Promise<CompletePasswordResetResponseDto> {
    try {
      const result = await this.completePasswordResetUseCase.execute({
        sessionToken: dto.sessionToken,
        newPassword: dto.newPassword,
      });

      return {
        accessToken: result.accessToken!,
        refreshToken: result.refreshToken!,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          firstName: result.user!.name.split(' ')[0] || '',
          lastName: result.user!.name.split(' ')[1] || '',
        },
        message:
          'Mot de passe réinitialisé avec succès. Vous êtes maintenant connecté.',
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError((error as Error).message);
      }
      throw error;
    }
  }
}
