import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBusinessTable1695826000000 implements MigrationInterface {
  name = "CreateBusinessTable1695826000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "businesses",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: false,
          },
          {
            name: "slogan",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "sector",
            type: "enum",
            enum: [
              "LEGAL",
              "MEDICAL",
              "HEALTH",
              "BEAUTY",
              "CONSULTING",
              "FINANCE",
              "EDUCATION",
              "WELLNESS",
              "AUTOMOTIVE",
              "OTHER",
            ],
            default: "'OTHER'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"],
            default: "'PENDING_VERIFICATION'",
          },
          {
            name: "primary_email",
            type: "varchar",
            length: "300",
            isNullable: false,
          },
          {
            name: "primary_phone",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "address",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "contact_info",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "branding",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "settings",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "logo_url",
            type: "varchar",
            length: "500",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_businesses_name" ON "businesses" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_businesses_status" ON "businesses" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_businesses_sector" ON "businesses" ("sector")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_businesses_created_at" ON "businesses" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_businesses_primary_email" ON "businesses" ("primary_email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("businesses");
  }
}
