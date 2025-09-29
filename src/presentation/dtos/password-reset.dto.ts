import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la demande de réinitialisation de mot de passe
 */
export class RequestPasswordResetDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: "L'adresse email doit être valide" })
  @IsNotEmpty({ message: "L'adresse email est obligatoire" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email!: string;
}

/**
 * DTO pour la vérification du code de réinitialisation
 */
export class VerifyPasswordResetCodeDto {
  @ApiProperty({
    description: 'Code de vérification à 4 chiffres',
    example: '1234',
    pattern: '^[0-9]{4}$',
    minLength: 4,
    maxLength: 4,
  })
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @Length(4, 4, { message: 'Le code doit contenir exactement 4 chiffres' })
  @Matches(/^[0-9]{4}$/, {
    message: 'Le code doit contenir uniquement des chiffres',
  })
  code!: string;
}

/**
 * DTO pour la finalisation de la réinitialisation
 */
export class CompletePasswordResetDto {
  @ApiProperty({
    description:
      'Token de session temporaire obtenu après vérification du code',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Le token de session est obligatoire' })
  @IsNotEmpty({ message: 'Le token de session ne peut pas être vide' })
  sessionToken!: string;

  @ApiProperty({
    description:
      'Nouveau mot de passe (minimum 8 caractères, lettres et chiffres)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @Length(8, 128, {
    message: 'Le mot de passe doit contenir entre 8 et 128 caractères',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
  })
  newPassword!: string;
}

/**
 * DTO de réponse pour la demande de réinitialisation
 */
export class RequestPasswordResetResponseDto {
  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Un code de vérification a été envoyé à votre adresse email',
  })
  message!: string;

  @ApiProperty({
    description: "Succès de l'opération",
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Durée de validité du code en minutes',
    example: 15,
  })
  expiresInMinutes!: number;
}

/**
 * DTO de réponse pour la vérification du code
 */
export class VerifyPasswordResetCodeResponseDto {
  @ApiProperty({
    description:
      'Token de session temporaire pour finaliser la réinitialisation',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  sessionToken!: string;

  @ApiProperty({
    description: 'Temps restant pour utiliser le token (en secondes)',
    example: 300,
  })
  remainingTimeSeconds!: number;

  @ApiProperty({
    description: 'Message de succès',
    example: 'Code vérifié avec succès',
  })
  message!: string;
}

/**
 * DTO de réponse pour la finalisation de la réinitialisation
 */
export class CompletePasswordResetResponseDto {
  @ApiProperty({
    description: "Token d'accès JWT pour connexion automatique",
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Token de rafraîchissement',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Données utilisateur',
  })
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    description: 'Message de succès',
    example:
      'Mot de passe réinitialisé avec succès. Vous êtes maintenant connecté.',
  })
  message!: string;
}
