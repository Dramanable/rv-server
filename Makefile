# 🚀 Clean Architecture NestJS - Makefile
# Commandes pour gérer l'environnement de développement Docker

.PHONY: help start start-build start-logs stop restart build test logs shell status health clean reset

# 📋 Aide par défaut
help:
	@echo "🚀 Clean Architecture NestJS - Commandes disponibles:"
	@echo ""
	@echo "🐳 Gestion Docker:"
	@echo "  start        - Démarrer l'environnement de développement"
	@echo "  start-build  - Démarrer avec reconstruction des images"
	@echo "  start-logs   - Démarrer avec affichage des logs"
	@echo "  start-memory - Démarrer avec optimisations mémoire"
	@echo "  stop         - Arrêter tous les services"
	@echo "  restart      - Redémarrer les services"
	@echo ""
	@echo "🏗️  Build & Test:"
	@echo "  build        - Construire l'image Docker"
	@echo "  test         - Exécuter les tests dans Docker"
	@echo ""
	@echo "🔍 Monitoring:"
	@echo "  logs         - Afficher les logs de l'application"
	@echo "  logs-db      - Afficher les logs de PostgreSQL"
	@echo "  logs-mongo   - Afficher les logs de MongoDB"
	@echo "  logs-redis   - Afficher les logs de Redis"
	@echo "  shell        - Ouvrir un shell dans le conteneur"
	@echo "  status       - Statut des services"
	@echo "  health       - Vérifier la santé de l'application"
	@echo "  health-all   - Vérifier la santé de tous les services"
	@echo "  memory       - Afficher l'utilisation mémoire"
	@echo ""
	@echo "🔌 Base de données:"
	@echo "  redis        - Connexion Redis CLI"
	@echo "  mongo        - Connexion MongoDB shell"
	@echo "  psql         - Connexion PostgreSQL shell"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean        - Nettoyer les ressources Docker"
	@echo "  reset        - Reset complet de l'environnement"
	@echo "  start-db     - Démarrer uniquement les bases de données"
	@echo ""
redis:
	docker exec -it redis redis-cli -a redis123

# Connexion MongoDB shell
mongo:
	@echo "🍃 Connexion MongoDB..."
	docker exec -it mongodb mongosh -u admin -p admin

# PostgreSQL shell
psql:
	@echo "🐘 Connexion PostgreSQL..."
	docker exec -it postgres psql -U postgres -d cleanarchi_dev
# ========================================
# 🐳 Commandes Docker Compose
# ========================================

# Démarrer l'environnement de développement
start:
	@echo "🚀 Démarrage de l'environnement de développement..."
	docker compose up -d

# Démarrer avec optimisations mémoire (utilise docker-compose.override.yml)
start-memory:
	@echo "🧠 Démarrage avec optimisations mémoire..."
	@echo "💾 Allocation mémoire optimisée: App(512MB) + DB(256MB) + Cache(128MB)"
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "✅ Services démarrés avec limites mémoire"
	@make memory

# Démarrer avec reconstruction des images
start-build:
	@echo "🔨 Reconstruction et démarrage..."
	docker compose up -d --build

# Démarrer avec affichage des logs
start-logs:
	@echo "📋 Démarrage avec logs..."
	docker compose up

# Arrêter tous les services
stop:
	@echo "⏹️  Arrêt des services..."
	docker compose down

# Redémarrer les services
restart:
	@echo "🔄 Redémarrage des services..."
	docker compose restart

# ========================================
# 🏗️ Construction & Tests
# ========================================

# Construire l'image Docker
build:
	@echo "🏗️  Construction de l'image..."
	docker compose build

# Exécuter les tests
test:
	@echo "🧪 Exécution des tests..."
	docker compose exec api npm test

# ========================================
# 🔍 Monitoring & Debug
# ========================================

# Afficher les logs de l'application
logs:
	@echo "📋 Logs de l'application..."
	docker compose logs -f api

# Logs de PostgreSQL
logs-db:
	@echo "📋 Logs de PostgreSQL..."
	docker compose logs -f postgres

# Logs de MongoDB
logs-mongo:
	@echo "📋 Logs de MongoDB..."
	docker compose logs -f mongodb

# Logs de pgAdmin
logs-pgadmin:
	@echo "📋 Logs de pgAdmin..."
	docker compose logs -f pgadmin

# Logs de Redis
logs-redis:
	@echo "📋 Logs de Redis..."
	docker compose logs -f redis

# Ouvrir un shell dans le conteneur
shell:
	@echo "🐚 Ouverture du shell..."
	docker compose exec api sh

# Statut des services
status:
	@echo "📊 Statut des services:"
	docker compose ps

# Vérifier la santé de l'application
health:
	@echo "🏥 Vérification de la santé..."
	@curl -f http://localhost:3000/health 2>/dev/null && echo "✅ Service en bonne santé" || echo "❌ Service non disponible"

# Vérifier l'état de tous les services
health-all:
	@echo "🏥 Vérification de tous les services..."
	@echo "📡 API:"
	@curl -f http://localhost:3000/health 2>/dev/null && echo "  ✅ API en bonne santé" || echo "  ❌ API non disponible"
	@echo "🗄️ PostgreSQL:"
	@docker exec postgres pg_isready -U postgres 2>/dev/null && echo "  ✅ PostgreSQL en bonne santé" || echo "  ❌ PostgreSQL non disponible"
	@echo "🍃 MongoDB:"
	@docker exec mongodb mongosh --eval "db.runCommand('ping').ok" --quiet 2>/dev/null && echo "  ✅ MongoDB en bonne santé" || echo "  ❌ MongoDB non disponible"
	@echo "🔴 Redis:"
	@docker exec redis redis-cli -a redis123 ping 2>/dev/null && echo "  ✅ Redis en bonne santé" || echo "  ❌ Redis non disponible"

# Afficher l'utilisation mémoire des conteneurs
memory:
	@echo "💾 Utilisation mémoire des conteneurs:"
	@echo ""
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null || echo "❌ Aucun conteneur en cours d'exécution"
	@echo ""
	@echo "📊 Limites mémoire configurées (docker-compose.override.yml):"
	@echo "  🏗️  App:        512MB (limit) / 256MB (reservation)"
	@echo "  🐘 PostgreSQL: 256MB (limit) / 128MB (reservation)"  
	@echo "  🍃 MongoDB:    256MB (limit) / 128MB (reservation)"
	@echo "  🔴 Redis:      128MB (limit) / 64MB  (reservation)"
	@echo "  🔧 pgAdmin:    128MB (limit) / 64MB  (reservation)"
	@echo "  📊 TOTAL:      ~1.28GB optimisé pour développement"

# ========================================
# 🧹 Nettoyage & Maintenance
# ========================================

# Nettoyer les ressources Docker inutiles
clean:
	@echo "🧹 Nettoyage des ressources Docker..."
	docker compose down
	docker system prune -f
	docker volume prune -f

# Reset complet de l'environnement
reset:
	@echo "🔄 Reset complet de l'environnement..."
	docker compose down -v
	docker system prune -a -f --volumes
	@echo "✅ Reset terminé. Utilisez 'make start-build' pour redémarrer"

# Démarrer uniquement les bases de données
start-db:
	@echo "📊 Démarrage des bases de données uniquement..."
	docker compose up -d postgres mongodb redis

# ========================================
# 🎯 Raccourcis Utiles
# ========================================

# Installation des dépendances
install:
	@echo "📦 Installation des dépendances..."
	docker compose exec api npm install

# Mode développement complet
dev: start
	@echo "💻 Environnement de développement prêt!"
	@echo "🌐 Application: http://localhost:3000"
	@echo "📚 Documentation: http://localhost:3000/api/docs"
	@echo "💊 Health Check: http://localhost:3000/health"

# Affichage des URLs utiles
urls:
	@echo "🔗 URLs disponibles:"
	@echo "  🌐 Application:     http://localhost:3000"
	@echo "  📚 Documentation:   http://localhost:3000/api/docs"
	@echo "  💊 Health Check:    http://localhost:3000/health"
	@echo "  🔗 API Base:        http://localhost:3000/api/v1"
	@echo "  🗄️ PostgreSQL:      localhost:5432"
	@echo "  🍃 MongoDB:         localhost:27017"
	@echo "  🔧 pgAdmin:         http://localhost:5050"
	@echo ""
	@echo "🔑 Identifiants pgAdmin:"
	@echo "  📧 Email:           admin@cleanarchi.dev"
	@echo "  🔐 Mot de passe:    admin123"

 
