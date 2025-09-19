# 🚀 Guide NVM - Node.js 24 + NestJS Clean Architecture

## 📋 Configuration Environnement

### 🔧 Installation NVM (si nécessaire)

```bash
# Télécharger et installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Redémarrer le terminal ou recharger le profile
source ~/.bashrc
```

### 📦 Configuration Node.js 24 pour ce Projet

```bash
# 1. Naviguer vers le projet
cd /path/to/appointment-system-api

# 2. Installer Node.js 24 avec nvm
nvm install 24

# 3. Utiliser Node.js 24 (automatique avec .nvmrc)
nvm use

# 4. Définir Node.js 24 par défaut (optionnel)
nvm alias default 24
```

## 🎯 Utilisation Quotidienne

### ✅ Commandes Essentielles

```bash
# Vérifier la version active
node --version  # Devrait afficher v24.x.x
npm --version   # Devrait afficher 11.x.x

# Activer automatiquement la bonne version
nvm use         # Lit le fichier .nvmrc

# Installer les dépendances
npm install

# Lancer les tests
npm run test:unit

# Démarrer en développement
npm run start:dev
```

### 🔍 Vérification Configuration

```bash
# Lister toutes les versions Node.js installées
nvm ls

# Afficher la version active
nvm current

# Afficher les informations npm
npm config list
```

## 🛠️ Scripts Automatisés

### 📋 Scripts Disponibles

| Script                              | Description                             | Usage                               |
| ----------------------------------- | --------------------------------------- | ----------------------------------- |
| `./scripts/setup-nvm-env.sh`        | Configuration complète NVM + Node.js 24 | `./scripts/setup-nvm-env.sh`        |
| `./scripts/npm-cleanup-optimize.sh` | Nettoyage et optimisation npm           | `./scripts/npm-cleanup-optimize.sh` |

### 🚀 Configuration Rapide

```bash
# Configuration complète en une commande
./scripts/setup-nvm-env.sh
```

## ⚙️ Configuration VS Code

### 📂 Tâches VS Code Intégrées

Le workspace VS Code inclut des tâches optimisées pour nvm :

- **🚀 Setup NVM Environment** - Configuration initiale
- **📦 NPM Install** - Installation avec nvm
- **🧪 Run Tests with NVM** - Tests avec la bonne version Node.js
- **🔧 Lint with NVM** - Linting avec nvm

### 🎯 Utilisation des Tâches

1. **Ctrl+Shift+P** → `Tasks: Run Task`
2. Sélectionner la tâche souhaitée
3. La bonne version Node.js sera automatiquement utilisée

## 📊 Optimisations Configurées

### 🧠 Mémoire et Performance

- **`.npmrc`** : Configuration optimisée pour npm 11.x
- **legacy-peer-deps** : Résolution des conflits de dépendances
- **prefer-offline** : Installation plus rapide
- **no-audit/no-fund** : Désactivation des vérifications lentes

### 🔒 Versions Verrouillées

- **`.nvmrc`** : Force Node.js 24
- **`package.json`** : Engines spécifie Node.js 24.x
- **`package-lock.json`** : Versions exactes des dépendances

## 🚨 Dépannage

### ⚠️ Problèmes Courants

#### **1. nvm command not found**

```bash
# Solution
source ~/.bashrc
# ou
source ~/.zshrc  # si vous utilisez zsh
```

#### **2. Version Node.js incorrecte**

```bash
# Forcer l'utilisation de Node.js 24
nvm use 24
# ou utiliser .nvmrc
nvm use
```

#### **3. Conflits de dépendances**

```bash
# Nettoyer et réinstaller
./scripts/npm-cleanup-optimize.sh
```

#### **4. npm warnings**

```bash
# Les warnings suivants sont normaux et sans impact :
# - "Unknown project config" (npm 11 ignore certaines options)
# - "deprecated" packages (versions héritées, mais fonctionnelles)
```

### 🔍 Diagnostic

```bash
# Vérification complète de l'environnement
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "nvm: $(nvm --version)"
echo "Projet NVM: $(cat .nvmrc)"
echo "Version active: $(nvm current)"
```

## 📈 Avantages de cette Configuration

### ✅ Bénéfices

1. **🚀 Node.js 24** - Dernières fonctionnalités et optimisations
2. **🔄 Isolation** - Version dédiée au projet
3. **👥 Équipe** - Configuration partagée via `.nvmrc`
4. **⚡ Performance** - npm 11.x + optimisations mémoire
5. **🛡️ Stabilité** - Versions verrouillées et testées

### 🎯 Recommandations

- **Toujours utiliser `nvm use`** avant de travailler sur le projet
- **Vérifier la version** avec `node --version` régulièrement
- **Utiliser les scripts fournis** pour la maintenance
- **Redémarrer VS Code** après changement de version Node.js

## 🔗 Liens Utiles

- [NVM GitHub](https://github.com/nvm-sh/nvm)
- [Node.js 24 Release Notes](https://nodejs.org/en/blog/release/v24.0.0)
- [npm 11 Documentation](https://docs.npmjs.com/)
- [NestJS Documentation](https://nestjs.com/)

---

**✨ Configuration optimisée pour le développement NestJS avec Clean Architecture !**
