/**
 * 🔄 AutoMapper Configuration - Presentation Layer
 * ✅ Configuration pour le mapping entre DTOs et entités
 * ✅ Clean Architecture - Mapping dans la couche présentation
 */

import { createMap, createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import type { User } from '../../domain/entities/user.entity';

// DTO pour la couche présentation
export interface UserResponseDto {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly createdAt: string;
}

export interface LoginResponseDto {
  readonly user: UserResponseDto;
  readonly tokens: {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
  };
  readonly message: string;
}

// Configuration du mapper
export const mapper = createMapper({
  strategyInitializer: classes(),
});

// Mapping User Entity -> UserResponseDto
createMap(
  mapper,
  'User', // Source (entity)
  'UserResponseDto', // Destination (DTO)
  // Mapping personnalisé si nécessaire
);

export class PresentationMapper {
  static userToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static loginResponseToDto(loginResponse: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    message: string;
  }): LoginResponseDto {
    return {
      user: this.userToDto(loginResponse.user),
      tokens: loginResponse.tokens,
      message: loginResponse.message,
    };
  }
}
