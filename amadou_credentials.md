# 🔐 Informations de Connexion - Amadou

## 👤 Identifiants de Connexion
- **Email** : `am@live.fr`
- **Mot de passe** : `Amadou@123!`
- **Rôle** : `ADMIN`
- **User ID** : `e4b05561-b0f9-4d91-832c-12b538ff2770`

## 🍪 Fichiers de Cookies Disponibles
- **cookies_amadou_login.txt** : Cookies actifs avec tokens valides (créé le 01/10/2025)
- **cookies_amadou.txt** : Ancien fichier de cookies (peut être expiré)

## 🔑 Commande de Connexion
```bash
# Connexion et sauvegarde des cookies
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "am@live.fr",
    "password": "Amadou@123!"
  }' \
  -c cookies_amadou_login.txt
```

## 🧪 Tests avec Cookies
```bash
# Tester un endpoint authentifié
curl -X GET "http://localhost:3000/api/v1/prospects/test" \
  -b cookies_amadou_login.txt

# Créer un prospect (endpoint public temporairement)
curl -X POST "http://localhost:3000/api/v1/prospects" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Company",
    "contactName": "Test Contact",
    "email": "test@company.com",
    "businessSize": "MEDIUM"
  }' \
  -b cookies_amadou_login.txt
```

## 📅 Validité des Tokens
- **Access Token** : Expire dans 1 heure
- **Refresh Token** : Expire dans 30 jours
- **Dernière connexion** : 01/10/2025 à 11:20:14 GMT

## 🔄 Refresh Token si Nécessaire
```bash
# Si le token expire, utiliser le refresh token
curl -X POST "http://localhost:3000/api/v1/auth/refresh" \
  -b cookies_amadou_login.txt \
  -c cookies_amadou_login.txt
```

---
**Note** : Gardez ce fichier sécurisé et ne le partagez pas.