/**
 * 🛠️ Migration Utilities
 * ✅ Clean Architecture - Infrastructure Layer
 * ✅ Environment Variables Support
 */

/**
 * Récupère le nom du schéma depuis les variables d'environnement
 * @returns Le nom du schéma configuré ou 'public' par défaut
 */
export function getSchemaName(): string {
  return process.env.DB_SCHEMA || 'public';
}

/**
 * Récupère le nom de la base de données depuis les variables d'environnement
 * @returns Le nom de la base de données configurée
 */
export function getDatabaseName(): string {
  return process.env.DATABASE_NAME || process.env.DB_NAME || 'rvproject_app';
}

/**
 * Créer une requête avec schéma qualifié
 * @param tableName Nom de la table
 * @param query Requête SQL
 * @returns Requête SQL avec schéma qualifié si nécessaire
 */
export function withSchema(tableName: string, query?: string): string {
  const schema = getSchemaName();
  const qualifiedTableName =
    schema !== 'public' ? `"${schema}"."${tableName}"` : `"${tableName}"`;

  if (query) {
    return query.replace(new RegExp(`"${tableName}"`, 'g'), qualifiedTableName);
  }

  return qualifiedTableName;
}

/**
 * Vérifier si une table existe dans le schéma configuré
 * @param tableName Nom de la table
 * @returns Requête SQL pour vérifier l'existence de la table
 */
export function tableExistsQuery(tableName: string): string {
  const schema = getSchemaName();
  return `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = '${schema}' 
      AND table_name = '${tableName}'
    );
  `;
}

/**
 * Vérifier si un index existe dans le schéma configuré
 * @param tableName Nom de la table
 * @param indexName Nom de l'index
 * @returns Requête SQL pour vérifier l'existence de l'index
 */
export function indexExistsQuery(tableName: string, indexName: string): string {
  const schema = getSchemaName();
  return `
    SELECT EXISTS (
      SELECT FROM pg_indexes 
      WHERE schemaname = '${schema}' 
      AND tablename = '${tableName}' 
      AND indexname = '${indexName}'
    );
  `;
}
