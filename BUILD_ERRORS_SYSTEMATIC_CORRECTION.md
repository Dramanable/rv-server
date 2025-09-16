# 🛠️ CORRECTION SYSTÉMATIQUE DES ERREURS DE BUILD

## État actuel
**Date**: $(date)
**Erreurs TypeScript**: ~21 dans 2 fichiers principaux

## Corrections réalisées ✅

### 1. Use Case Staff
- ✅ Correction logger.error arguments
- ✅ Conversion AppContext vers Record<string, unknown>

### 2. Domain Repositories Index  
- ✅ Ajout imports types manquants
- ✅ Correction constantes DOMAIN_REPOSITORIES

### 3. Entités TypeORM
- ✅ Export default ajouté à UserOrmEntity et RefreshTokenOrmEntity
- ✅ Index des entités TypeORM corrigé avec export *

### 4. Mapper Business (en cours)
- ✅ Correction accès propriétés Address via getters
- ✅ Correction structure ContactInfo (primaryEmail/primaryPhone)
- ✅ Utilisation Business.create au lieu de createFromData
- ⚠️ **PROBLÈME**: Incompatibilité entre classes Email différentes

## Erreurs critiques restantes 🔴

### A. Décorateurs TypeORM (17 erreurs)
**Fichier**: `business.entity.ts`
**Problème**: Signature des décorateurs TypeORM incompatible
**Cause**: Possiblement version TypeScript vs TypeORM
**Solution**: Vérifier tsconfig.json experimentalDecorators

### B. Email Value Objects incompatibles (2 erreurs)
**Fichier**: `typeorm-business.mapper.ts`
**Problème**: Deux classes Email différentes
- `email.vo.ts` (utilisé dans Business entity)  
- `email.value-object.ts` (utilisé dans mappers)
**Solution**: Harmoniser sur email.vo.ts partout

### C. BusinessSector enum manquant (1 erreur)
**Fichier**: `typeorm-business.mapper.ts`
**Solution**: Créer ou corriger le chemin d'import

### D. Business.create signature incorrecte (1 erreur)
**Problème**: 'id' n'existe pas dans les paramètres create
**Solution**: Vérifier la signature de Business.create

## Plan de correction prioritaire 📋

**PRIORITÉ 1** - Correction Email Value Objects
1. Standardiser sur email.vo.ts dans tous les mappers
2. Vérifier les méthodes disponibles (getValue vs value)

**PRIORITÉ 2** - Décorateurs TypeORM  
1. Vérifier tsconfig.json pour experimentalDecorators
2. Éventuellement downgrade TypeORM ou upgrade TypeScript

**PRIORITÉ 3** - Business mapper
1. Corriger import BusinessSector
2. Adapter signature Business.create
3. Harmoniser les structures de données

**PRIORITÉ 4** - Autres erreurs mineures
1. Calendar mapper
2. Migrations TypeORM
3. Tests unitaires

L'objectif est d'atteindre **0 erreur de build** pour avoir une application fonctionnelle ✨
