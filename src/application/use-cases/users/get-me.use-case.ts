/**
 * 👤 Get Me Use Case - Clean Architecture
 * Récupère les informations de l'utilisateur connecté
 */

import { User } from "../../../domain/entities/user.entity";

export class GetMeUseCase {
  constructor() {
    // TODO: Inject user repository
  }

  async execute(): Promise<User | null> {
    // TODO: Implement user retrieval logic
    return null;
  }
}
