/**
 * 👤 Get Me Use Case - Clean Architecture
 * Récupère les informations de l'utilisateur connecté
 */

import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';

export interface GetMeRequest {
  readonly requestingUserId: string;
}

export interface GetMeResponse {
  readonly user: User;
}

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetMeRequest): Promise<GetMeResponse> {
    const user = await this.userRepository.findById(request.requestingUserId);

    if (!user) {
      throw new Error(`User with ID ${request.requestingUserId} not found`);
    }

    return {
      user,
    };
  }
}
