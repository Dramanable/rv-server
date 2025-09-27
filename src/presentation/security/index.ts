/**
 * 🛡️ SECURITY INDEX - Presentation Layer Security Components
 *
 * Export centralisé de tous les composants de sécurité
 * de la couche présentation
 */

// Strategies
export { JwtStrategy } from "./strategies/jwt.strategy";
export { LocalStrategy } from "./strategies/local.strategy";
export type { LocalStrategyResult } from "./strategies/local.strategy";

// Guards
export { JwtAuthGuard } from "./guards/jwt-auth.guard";
export { LocalAuthGuard } from "./guards/local-auth.guard";

// Decorators
export { IS_PUBLIC_KEY, Public } from "./decorators/public.decorator";

// Security components
export { CustomThrottlerGuard } from "./throttler.guard";
export { SecurityValidationPipe } from "./validation.pipe";
