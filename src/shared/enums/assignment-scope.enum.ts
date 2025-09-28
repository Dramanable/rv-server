/**
 * 🎯 Énumération des étendues d'assignation pour RBAC
 * Définit le niveau hiérarchique où s'applique un rôle
 */
export enum AssignmentScope {
  /**
   * Niveau Business : Rôle s'applique à tout le business
   */
  BUSINESS = 'BUSINESS',

  /**
   * Niveau Location : Rôle s'applique uniquement à une location spécifique
   */
  LOCATION = 'LOCATION',

  /**
   * Niveau Department : Rôle s'applique uniquement à un département spécifique
   */
  DEPARTMENT = 'DEPARTMENT',
}

/**
 * 🎯 Type union pour les étendues d'assignation
 */
export type AssignmentScopeType = keyof typeof AssignmentScope;

/**
 * 🎯 Hiérarchie des étendues (du plus large au plus restreint)
 */
export const ASSIGNMENT_SCOPE_HIERARCHY = [
  AssignmentScope.BUSINESS,
  AssignmentScope.LOCATION,
  AssignmentScope.DEPARTMENT,
] as const;

/**
 * 🎯 Vérifier si une étendue est plus large qu'une autre
 */
export function isScopeBroader(
  scope1: AssignmentScope,
  scope2: AssignmentScope,
): boolean {
  const hierarchy = ASSIGNMENT_SCOPE_HIERARCHY;
  return hierarchy.indexOf(scope1) < hierarchy.indexOf(scope2);
}

/**
 * 🎯 Obtenir la description d'une étendue
 */
export function getAssignmentScopeDescription(scope: AssignmentScope): string {
  const descriptions = {
    [AssignmentScope.BUSINESS]: 'Accès complet au business',
    [AssignmentScope.LOCATION]: 'Accès limité à la location',
    [AssignmentScope.DEPARTMENT]: 'Accès limité au département',
  };

  return descriptions[scope];
}
