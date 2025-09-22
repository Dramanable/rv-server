help:
	@echo "Clean Architecture NestJS - Makefile"
	@echo ""
	@echo "Docker:"
	@echo "  start       - Demarrer environnement"
	@echo "  start-dev   - Demarrer mode dev avec hot reload"
	@echo "  start-build - Demarrer avec build"
	@echo "  start-db    - Demarrer bases de donnees"
	@echo "  stop        - Arreter services"
	@echo "  build       - Construire image"
	@echo ""
	@echo "Tests:"
	@echo "  test        - Tous les tests"
	@echo "  test-unit   - Tests unitaires"
	@echo "  lint        - Linter le code"
	@echo "  format      - Formatter le code"
	@echo ""
	@echo "Debug:"
	@echo "  logs        - Logs application"
	@echo "  shell       - Shell dans conteneur"
	@echo "  status      - Statut services"
	@echo ""
	@echo "BDD:"
	@echo "  redis-cli   - Connexion Redis"
	@echo "  psql        - Connexion PostgreSQL"
	@echo ""
	@echo "Migrations:"
	@echo "  migration-run      - Executer migrations"
	@echo "  migration-revert   - Rollback derniere migration"
	@echo "  migration-test     - Test complet TDD des migrations"
	@echo "  migration-generate - Generer migration auto"
	@echo "  migration-create   - Creer migration vide"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean       - Nettoyer Docker"
	@echo "  reset       - Reset complet"

start:
	docker compose up -d

start-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

start-build:
	docker compose up -d --build

start-db:
	docker compose up -d postgres mongodb redis pgadmin

stop:
	docker compose down

build:
	docker compose build

test:
	npm test

test-unit:
	npm run test:unit

lint:
	npm run lint

format:
	npm run format

dev: start
	@echo "Environnement pret!"

logs:
	docker compose logs -f app

shell:
	docker compose exec app sh

status:
	docker compose ps

redis-cli:
	docker exec -it redis redis-cli -a redis123

psql:
	docker exec -it postgres psql -U postgres -d cleanarchi_dev

# 🗄️ Migrations TypeORM depuis le container
migration-run:
	@echo "🚀 Exécution des migrations TypeORM depuis le container..."
	docker compose exec app npm run migration:run

migration-revert:
	@echo "⏪ Rollback de la dernière migration depuis le container..."
	docker compose exec app npm run migration:revert

migration-generate:
	@echo "📝 Génération automatique de migration depuis le container..."
	@read -p "Nom de la migration: " name; \
	docker compose exec app npm run migration:generate -- src/infrastructure/database/sql/postgresql/migrations/$$name

migration-create:
	@echo "✨ Création d'une migration vide depuis le container..."
	@read -p "Nom de la migration: " name; \
	docker compose exec app npm run migration:create -- src/infrastructure/database/sql/postgresql/migrations/$$name

# 🧪 Test complet des migrations (TDD obligatoire)
migration-test:
	@echo "🧪 Test complet des migrations selon règles TDD..."
	@echo "1️⃣ Application de la migration..."
	docker compose exec app npm run migration:run
	@echo "2️⃣ Vérification du rollback..."
	docker compose exec app npm run migration:revert
	@echo "3️⃣ Re-application de la migration..."
	docker compose exec app npm run migration:run
	@echo "✅ Test de migration terminé avec succès!"

clean:
	docker compose down
	docker system prune -f

reset:
	docker compose down -v
	docker system prune -a -f --volumes

.DEFAULT_GOAL := help
