import { v4 as uuidv4 } from "uuid";

/**
 * ✅ OBLIGATOIRE - Utilitaire génération ID enterprise
 *
 * RÈGLES :
 * - UUID v4 pour uniqueness globale
 * - Format standardisé pour toutes les entités
 * - Performance optimisée
 * - Consistent avec architecture
 */

/**
 * 🆔 Génère un ID unique UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * 🔍 Valide qu'une string est un UUID v4 valide
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  // UUID v4 regex pattern
  const uuidV4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}

/**
 * 🔄 Génère un ID temporaire pour tests
 */
export function generateTestId(prefix = "test"): string {
  return `${prefix}-${uuidv4()}`;
}

/**
 * 📊 Génère des IDs en batch pour performance
 */
export function generateIds(count: number): string[] {
  return Array.from({ length: count }, () => generateId());
}
