export enum DatabaseType {
  SQL = "sql",
  NOSQL = "nosql",
}

export interface IDatabaseConfigService {
  getDatabaseType(): DatabaseType;
  isSqlMode(): boolean;
  isNoSqlMode(): boolean;
}

export const DATABASE_CONFIG_SERVICE = "IDatabaseConfigService";
