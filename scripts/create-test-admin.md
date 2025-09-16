# 🔑 Création d'un Super Admin pour Tests

## 📋 Credentials qui seront créés

- **Email:** `test@admin.com`
- **Password:** `amadou`
- **Role:** `SUPER_ADMIN`

## 🚀 Instructions de création

### Option 1: Via pgAdmin (Recommandé)

1. **Démarrez la base de données:**
   ```bash
   npm run start:dev
   # ou
   docker-compose up
   ```

2. **Connectez-vous à pgAdmin:**
   - URL: http://localhost:5050
   - Email: admin@admin.com
   - Password: admin

3. **Exécutez le script SQL:**
   - Ouvrez une nouvelle requête SQL
   - Copiez-collez le contenu du fichier `scripts/create-test-admin.sql`
   - Exécutez la requête

### Option 2: Via psql en ligne de commande

```bash
# Assurez-vous que PostgreSQL est démarré
psql -h localhost -U admin -d nestjs_db -f scripts/create-test-admin.sql
```

## 🧪 Test de connexion

Une fois l'utilisateur créé, vous pouvez tester la connexion avec:

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "test@admin.com",
  "password": "amadou"
}
```

**Exemple avec curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@admin.com","password":"amadou"}'
```

## ✅ Vérification

Le script SQL inclut une requête de vérification qui affichera les détails de l'utilisateur créé.

## 🔐 Sécurité

⚠️ **Important:** Ces credentials sont uniquement pour les tests en développement. Ne jamais utiliser en production !

## 📁 Fichiers

- `scripts/create-test-admin.sql` - Script SQL principal
- `scripts/create-test-admin.md` - Ce fichier d'instructions
