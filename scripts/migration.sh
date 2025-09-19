#!/bin/bash

# 🔄 TypeORM Migration Helper Script
# ✅ Clean Architecture - Infrastructure Layer
# ✅ Node.js 24 compatible

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_DIR="src/infrastructure/database/sql/postgresql/migrations"
CONFIG_PATH="src/infrastructure/database/typeorm.config.ts"

echo -e "${BLUE}🔄 TypeORM Migration Helper${NC}"
echo "=================================="

# Help function
show_help() {
    echo -e "${YELLOW}Usage:${NC} $0 [command] [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  run              Run pending migrations"
    echo "  revert           Revert last migration"
    echo "  generate <name>  Generate new migration from entity changes"
    echo "  create <name>    Create empty migration file"
    echo "  show             Show migration status"
    echo "  status           Show migration status (alias for show)"
    echo "  reset            Drop schema and run all migrations"
    echo "  fresh            Alias for reset"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 run"
    echo "  $0 generate AddUserTable"
    echo "  $0 create AddIndexes"
    echo "  $0 revert"
    echo "  $0 show"
    echo ""
}

# Check if npm is available
check_dependencies() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found. Please install Node.js and npm.${NC}"
        exit 1
    fi
}

# Run migrations
run_migrations() {
    echo -e "${BLUE}🚀 Running pending migrations...${NC}"
    npm run migration:run
    echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
}

# Revert last migration
revert_migration() {
    echo -e "${YELLOW}⏪ Reverting last migration...${NC}"
    echo -e "${RED}⚠️  This will undo the last migration. Are you sure? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        npm run migration:revert
        echo -e "${GREEN}✅ Migration reverted successfully!${NC}"
    else
        echo -e "${YELLOW}❌ Migration revert cancelled.${NC}"
    fi
}

# Generate migration from entity changes
generate_migration() {
    local name="$1"
    if [ -z "$name" ]; then
        echo -e "${RED}❌ Migration name is required for generate command.${NC}"
        echo "Usage: $0 generate <MigrationName>"
        exit 1
    fi
    
    echo -e "${BLUE}🔧 Generating migration: $name${NC}"
    npm run migration:generate -- "$MIGRATION_DIR/$name"
    echo -e "${GREEN}✅ Migration generated successfully!${NC}"
}

# Create empty migration
create_migration() {
    local name="$1"
    if [ -z "$name" ]; then
        echo -e "${RED}❌ Migration name is required for create command.${NC}"
        echo "Usage: $0 create <MigrationName>"
        exit 1
    fi
    
    echo -e "${BLUE}📝 Creating empty migration: $name${NC}"
    npm run migration:create -- "$MIGRATION_DIR/$name"
    echo -e "${GREEN}✅ Empty migration created successfully!${NC}"
}

# Show migration status
show_status() {
    echo -e "${BLUE}📊 Migration Status:${NC}"
    npm run migration:show
}

# Reset database (drop and recreate)
reset_database() {
    echo -e "${RED}⚠️  This will DROP ALL DATA and recreate the database schema.${NC}"
    echo -e "${RED}Are you absolutely sure? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${YELLOW}🗑️  Dropping schema...${NC}"
        npm run schema:drop
        echo -e "${BLUE}🚀 Running all migrations...${NC}"
        npm run migration:run
        echo -e "${GREEN}✅ Database reset completed successfully!${NC}"
    else
        echo -e "${YELLOW}❌ Database reset cancelled.${NC}"
    fi
}

# Main command processing
main() {
    check_dependencies
    
    case "$1" in
        "run")
            run_migrations
            ;;
        "revert")
            revert_migration
            ;;
        "generate")
            generate_migration "$2"
            ;;
        "create")
            create_migration "$2"
            ;;
        "show"|"status")
            show_status
            ;;
        "reset"|"fresh")
            reset_database
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"