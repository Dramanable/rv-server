help:
	@echo "Clean Architecture NestJS - Makefile"
	@echo "start - Demarrer Docker"
	@echo "stop  - Arreter Docker"
	@echo "test  - Lancer tests"

start:
	docker compose up -d

stop:
	docker compose down

test:
	npm test

dev: start
	@echo "Environnement pret!"

.DEFAULT_GOAL := help
