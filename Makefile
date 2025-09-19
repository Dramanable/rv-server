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

clean:
	docker compose down
	docker system prune -f

reset:
	docker compose down -v
	docker system prune -a -f --volumes

.DEFAULT_GOAL := help
