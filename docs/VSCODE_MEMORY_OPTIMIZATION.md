# 🚀 Guide d'Optimisation Mémoire VS Code + Copilot

## ⚡ **Solutions Immédiates** (À faire MAINTENANT)

### 1️⃣ **Redémarrer VS Code Complètement**
```bash
# Fermer VS Code complètement, puis relancer
```

### 2️⃣ **Commandes VS Code** (Cmd+Shift+P)
```
Developer: Restart Extension Host
TypeScript: Restart TS Server  
GitHub Copilot: Restart Language Server
```

### 3️⃣ **Script de Nettoyage**
```bash
./scripts/clean-vscode-memory.sh
```

## 🔧 **Optimisations Appliquées**

✅ **Settings.json Optimisé** :
- Copilot limité aux fichiers TypeScript/JavaScript uniquement
- Désactivation semantic highlighting et bracket colorization
- Exclusion des dossiers lourds (node_modules, dist, logs)
- Réduction des suggestions TypeScript automatiques

✅ **TSConfig Optimisé** :
- `assumeChangesOnlyAffectDirectDependencies`: true
- `disableReferencedProjectLoad`: true
- Exclusion des fichiers de test du build principal

✅ **ESLint Optimisé** :
- Ignore étendu pour éviter l'analyse de fichiers inutiles
- Exclusion des dossiers temporaires

## 📊 **Monitoring Mémoire**

### **Vérifier l'usage mémoire VS Code**
1. Cmd+Shift+P → "Developer: Open Process Explorer"
2. Identifier les processus Copilot/TypeScript consommateurs
3. Redémarrer les services si nécessaire

### **Statistiques Recommandées**
- **Copilot** : < 200MB RAM
- **TypeScript Language Server** : < 500MB RAM
- **Extension Host** : < 300MB RAM

## 🚨 **Signaux d'Alerte Mémoire**

❌ **Symptômes** :
- VS Code devient lent
- Autocomplétion Copilot tardive
- Messages d'erreur TypeScript fréquents
- CPU à 100% sans raison

✅ **Actions** :
1. Lancer le script de nettoyage
2. Redémarrer Extension Host
3. Redémarrer TypeScript Server
4. En dernier recours : Redémarrer VS Code

## ⚙️ **Configuration Workspace**

Les optimisations sont sauvegardées dans :
- `.vscode/settings.json` - Paramètres optimisés
- `tsconfig.json` - Configuration TypeScript allégée
- `eslint.config.mjs` - ESLint avec exclusions étendues
- `scripts/clean-vscode-memory.sh` - Script de nettoyage automatique

## 🎯 **Utilisation Quotidienne**

### **Bonnes Pratiques** :
- Fermer les onglets inutiles
- Éviter d'ouvrir trop de fichiers simultanément
- Utiliser Cmd+P pour naviguer plutôt qu'ouvrir l'explorer
- Nettoyer régulièrement avec le script

### **Fréquence Recommandée** :
- **Quotidien** : Redémarrer TypeScript Server si lenteur
- **Hebdomadaire** : Lancer le script de nettoyage
- **Mensuel** : Nettoyer cache npm + redémarrer VS Code

✅ **Résultat Attendu** : Usage mémoire réduit de 30-50% et performances Copilot améliorées !
