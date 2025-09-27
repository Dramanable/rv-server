import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1695825600000 implements MigrationInterface {
  name = "InitialMigration1695825600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "username" character varying(50) NOT NULL,
        "hashed_password" character varying(255) NOT NULL,
        "role" character varying(50) NOT NULL DEFAULT 'USER',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_verified" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username")
      )
    `);

    // Create business_sectors table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "business_sectors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(100) NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" uuid NOT NULL,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_business_sectors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_business_sectors_code" UNIQUE ("code")
      )
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying(500) NOT NULL,
        "user_id" uuid NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token")
      )
    `);

    // Créer les index (sans CONCURRENTLY car dans une transaction)
    const emailIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexname = 'IDX_users_email'
    `);
    if (!emailIndexExists || emailIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_users_email" ON "users" ("email")`,
      );
    }

    const userCreatedAtIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexname = 'IDX_users_created_at'
    `);
    if (!userCreatedAtIndexExists || userCreatedAtIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_users_created_at" ON "users" ("created_at")`,
      );
    }

    const sectorCodeIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'business_sectors' AND indexname = 'IDX_business_sectors_code'
    `);
    if (!sectorCodeIndexExists || sectorCodeIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_business_sectors_code" ON "business_sectors" ("code")`,
      );
    }

    const sectorCreatedByIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'business_sectors' AND indexname = 'IDX_business_sectors_created_by'
    `);
    if (
      !sectorCreatedByIndexExists ||
      sectorCreatedByIndexExists.length === 0
    ) {
      await queryRunner.query(
        `CREATE INDEX "IDX_business_sectors_created_by" ON "business_sectors" ("created_by")`,
      );
    }

    const sectorCreatedAtIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'business_sectors' AND indexname = 'IDX_business_sectors_created_at'
    `);
    if (
      !sectorCreatedAtIndexExists ||
      sectorCreatedAtIndexExists.length === 0
    ) {
      await queryRunner.query(
        `CREATE INDEX "IDX_business_sectors_created_at" ON "business_sectors" ("created_at")`,
      );
    }

    const tokenUserIdIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'refresh_tokens' AND indexname = 'IDX_refresh_tokens_user_id'
    `);
    if (!tokenUserIdIndexExists || tokenUserIdIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`,
      );
    }

    const tokenExpiresAtIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'refresh_tokens' AND indexname = 'IDX_refresh_tokens_expires_at'
    `);
    if (!tokenExpiresAtIndexExists || tokenExpiresAtIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")`,
      );
    }

    const tokenCreatedAtIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'refresh_tokens' AND indexname = 'IDX_refresh_tokens_created_at'
    `);
    if (!tokenCreatedAtIndexExists || tokenCreatedAtIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_refresh_tokens_created_at" ON "refresh_tokens" ("created_at")`,
      );
    }

    // Add foreign key constraints only if they don't exist
    const hasBusinessSectorCreatedByFK = await queryRunner.hasColumn(
      "business_sectors",
      "created_by",
    );
    if (hasBusinessSectorCreatedByFK) {
      try {
        await queryRunner.query(`
          ALTER TABLE "business_sectors"
          ADD CONSTRAINT "FK_business_sectors_created_by"
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
      } catch (error) {
        // FK might already exist, ignore error
        console.log("FK_business_sectors_created_by might already exist");
      }
    }

    const hasBusinessSectorUpdatedByFK = await queryRunner.hasColumn(
      "business_sectors",
      "updated_by",
    );
    if (hasBusinessSectorUpdatedByFK) {
      try {
        await queryRunner.query(`
          ALTER TABLE "business_sectors"
          ADD CONSTRAINT "FK_business_sectors_updated_by"
          FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
        `);
      } catch (error) {
        // FK might already exist, ignore error
        console.log("FK_business_sectors_updated_by might already exist");
      }
    }

    const hasRefreshTokenUserFK = await queryRunner.hasColumn(
      "refresh_tokens",
      "user_id",
    );
    if (hasRefreshTokenUserFK) {
      try {
        await queryRunner.query(`
          ALTER TABLE "refresh_tokens"
          ADD CONSTRAINT "FK_refresh_tokens_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
      } catch (error) {
        // FK might already exist, ignore error
        console.log("FK_refresh_tokens_user_id might already exist");
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // WARNING: This will drop tables and lose data!
    // Only use in development environments

    // Drop foreign key constraints
    try {
      await queryRunner.query(
        `ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_refresh_tokens_user_id"`,
      );
      await queryRunner.query(
        `ALTER TABLE "business_sectors" DROP CONSTRAINT IF EXISTS "FK_business_sectors_updated_by"`,
      );
      await queryRunner.query(
        `ALTER TABLE "business_sectors" DROP CONSTRAINT IF EXISTS "FK_business_sectors_created_by"`,
      );
    } catch (error) {
      console.log("Some foreign keys might not exist");
    }

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_tokens_is_revoked"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_refresh_tokens_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_business_sectors_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_business_sectors_is_active"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_business_sectors_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);

    // Drop tables (WARNING: This will lose all data!)
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "business_sectors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
