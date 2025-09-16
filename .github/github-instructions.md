# 🚀 Clean Architecture NestJS - Instructions de Développement

## 📋 **Aperçu du Projet**

Application **NestJS enterprise** implémentant la **Clean Architecture** avec :

- Architecture hexagonale stricte
- TDD (Test-Driven Development)
- TypeScript mode strict
- Docker pour le développement
- Pipeline de qualité automatisé

## 🐳 **Environnement Docker**

### **Services Disponibles**

```yaml
Services:
  - app: NestJS (Port 3000)
  - db: PostgreSQL 15 (Port 5432)
  - mongo: MongoDB 7 (Port 27017)
  - pgadmin: Interface web (Port 5050)
```

### **Commandes Docker**

```bash
# Démarrer l'environnement complet
make up

# Arrêter les services
make down

# Reconstruction complète
make rebuild

# Voir les logs
make logs

# Accéder au conteneur app
make shell

# Statut des services
make status
```

### **Accès aux Services**

- **Application**: http://localhost:3000
- **API Base URL**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050
  - Email: `admin@admin.com`
  - Mot de passe: `admin`
- **PostgreSQL**: localhost:5432
  - Base: `cleanarch_dev`
  - User: `postgres`
  - Mot de passe: `postgres`
- **MongoDB**: localhost:27017
  - Base: `cleanarch_mongo`

## 🔧 **Pipeline de Qualité**

### **Workflow Automatique**

Chaque commit déclenche automatiquement :

```bash
1. Format (Prettier) → 2. Lint (ESLint) → 3. Test (Jest) → 4. Commit
```

### **Commandes Manuelles**

```bash
# Formatage du code
npm run format

# Analyse ESLint
npm run lint

# Correction automatique ESLint
npm run lint:fix

# Tests complets
npm test

# Tests en mode watch
npm run test:watch

# Couverture de test
npm run test:cov
```

## 📝 **Standards de Commit**

### **Format Obligatoire**

```
type: description courte

Corps du message (optionnel)
Footer (optionnel)
```

### **Types Autorisés**

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de logique)
- `refactor`: Refactoring
- `perf`: Optimisation
- `test`: Tests
- `chore`: Maintenance
- `ci`: CI/CD
- `revert`: Annulation
- `security`: Sécurité
- `i18n`: Internationalisation
- `a11y`: Accessibilité
- `hotfix`: Correction urgente

### **Exemples Valides**

```bash
feat: add user authentication
fix: resolve email validation issue
docs: update API documentation
test: add login use case tests
chore: update dependencies
```

### **🚨 Résolution des Problèmes de Commit**

**Erreur de validation commitlint:**

Si vous obtenez des erreurs lors du commit, vérifiez le format :

```bash
# ❌ Incorrect
git commit -m "fix bug"
git commit -m "updated code"

# ✅ Correct
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update setup instructions"
```

**Hook Husky déprécié:**

Si vous voyez un warning Husky, c'est normal et n'affecte pas le fonctionnement :

```
husky - DEPRECATED
Please remove the following two lines from .husky/commit-msg:
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
```

**Bypass des hooks (à éviter):**

En cas d'urgence seulement :

```bash
# Bypass les hooks de pre-commit
git commit --no-verify -m "hotfix: emergency fix"
```

## 🏗️ **Architecture Clean**

### **Structure des Dossiers**

```
src/
├── domain/           # Entités et règles métier
├── application/      # Cas d'usage et services
├── infrastructure/   # Implémentations techniques
└── presentation/     # Controllers et DTOs
```

### **Principes de Développement**

1. **TDD**: Écrire les tests avant le code
2. **SOLID**: Respecter les 5 principes
3. **DRY**: Ne pas se répéter
4. **KISS**: Garder la simplicité
5. **YAGNI**: Pas de sur-ingénierie

## 🧪 **Tests**

### **Statistiques Actuelles**

- **202 tests** passent ✅
- **30 suites** de tests
- Couverture complète des cas d'usage
- Tests d'intégration et unitaires

### **Patterns de Test**

```typescript
// Test unitaire d'entité
describe('User Entity', () => {
  it('should create valid user', () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(user.isValid()).toBe(true);
  });
});

// Test de cas d'usage
describe('LoginUseCase', () => {
  it('should authenticate valid user', async () => {
    const result = await loginUseCase.execute({
      email: 'user@test.com',
      password: 'password123',
    });
    expect(result.accessToken).toBeDefined();
  });
});
```

## 🔒 **Sécurité**

### **Fonctionnalités Implémentées**

- Authentification JWT avec refresh tokens
- Rotation automatique des tokens
- Hachage sécurisé des mots de passe (bcrypt)
- Validation stricte des données d'entrée
- Headers de sécurité (helmet)
- Rate limiting
- CORS configuré

### **Bonnes Pratiques**

- Jamais de mots de passe en clair
- Validation côté serveur obligatoire
- Logs des tentatives d'authentification
- Sessions expirantes
- Principe du moindre privilège

## 🌐 **Internationalisation (i18n)**

### **Configuration**

- Support anglais/français
- Messages d'erreur traduits
- Logs multilingues
- Validation des formats locaux

### **Utilisation**

```typescript
// Dans un service
constructor(private i18n: I18nService) {}

getMessage(key: string, lang = 'en') {
  return this.i18n.t(key, { lang });
}
```

## 📊 **Monitoring et Logs**

### **Logging avec Pino**

```typescript
logger.info('User created', { userId, email });
logger.error('Authentication failed', { email, error });
logger.debug('Database query', { query, duration });
```

### **Métriques**

- Temps de réponse des API
- Taux d'erreur par endpoint
- Utilisation des ressources
- Performance des requêtes DB

## 🚀 **Déploiement**

### **Environnements**

- **Development**: Docker Compose local
- **Staging**: Pipeline CI/CD
- **Production**: Container orchestration

### **Checklist Pré-déploiement**

- [ ] Tous les tests passent
- [ ] Code formaté et linté
- [ ] Documentation à jour
- [ ] Variables d'environnement configurées
- [ ] Migrations de base de données
- [ ] Monitoring opérationnel

## 📚 **Ressources**

### **Documentation Technique**

- [Clean Architecture (Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)

### **Patterns Utilisés**

- Repository Pattern
- Use Case Pattern
- Factory Pattern
- Dependency Injection
- Value Objects
- Domain Events

---

## 🆘 **Aide et Support**

### **Problèmes Courants**

**Docker ne démarre pas**

```bash
# Vérifier Docker
docker --version
make clean && make up
```

**Tests qui échouent**

```bash
# Nettoyer et relancer
npm run test:clean
npm test
```

**Problème de base de données**

```bash
# Reset complet
make down
docker volume prune
make up
```

### **🔐 Problèmes d'Authentification**

**Erreur 401 "Identifiants invalides"**

Si vous obtenez une erreur 401 lors de la connexion, vérifiez que l'utilisateur super admin existe :

```bash
# Vérifier si l'utilisateur existe
docker exec -i cleanarchi_postgres_dev psql -U postgres -d cleanarchi_dev -c "SELECT email, role FROM users WHERE email = 'admin@example.com';"

# Créer l'utilisateur super admin si nécessaire
docker exec -i cleanarchi_postgres_dev psql -U postgres -d cleanarchi_dev < scripts/create-superadmin.sql
```

**Credentials par défaut:**

- Email: `admin@example.com`
- Password: `superadmin`

**Test de connexion:**

```bash
# Tester l'API d'authentification
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "superadmin"}'
```

**URLs importantes:**

- API Base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/health`

### **Commandes de Debug**

```bash
# Logs détaillés
make logs app
make logs db

# Inspection des conteneurs
docker ps
docker exec -it nestjs-app bash

# État de la base
docker exec -it postgres psql -U postgres -d cleanarch_dev
```

**Dernière mise à jour**: $(date)
**Version**: 1.0.0
**Contact**: equipe-dev@company.com
