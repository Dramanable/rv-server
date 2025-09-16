#!/bin/bash

# 🧹 CLEAN APPLICATION LAYER FROM NESTJS DEPENDENCIES
# ✅ Remove all @Injectable and @Inject decorators
# ✅ Remove NestJS imports from domain and application layers
# ✅ Maintain Clean Architecture principles

echo "🧹 Cleaning NestJS dependencies from Domain & Application layers..."

# Function to clean a single file
clean_file() {
    local file="$1"
    echo "  📄 Processing: $file"
    
    # Remove NestJS imports
    sed -i "/import.*from '@nestjs\/common'/d" "$file"
    sed -i "/import.*{ Inject, Injectable }/d" "$file"
    sed -i "/import.*{ Injectable }/d" "$file"
    sed -i "/import.*{ Inject }/d" "$file"
    
    # Remove @Injectable() decorator
    sed -i "/@Injectable()/d" "$file"
    
    # Remove @Inject() decorators (keep the parameter)
    sed -i "s/@Inject([^)]*)[[:space:]]*//g" "$file"
    
    # Clean up empty lines
    sed -i '/^[[:space:]]*$/N;/^\n$/d' "$file"
}

# Clean all Use Cases
echo "🎯 Cleaning Use Cases..."
find src/application/use-cases -name "*.ts" -type f | while read -r file; do
    clean_file "$file"
done

# Clean Application Services
echo "🔧 Cleaning Application Services..."
find src/application/services -name "*.ts" -type f | while read -r file; do
    clean_file "$file"
done

# Clean Domain entities and repositories (should be clean but double-check)
echo "🏛️ Verifying Domain layer..."
find src/domain -name "*.ts" -type f | while read -r file; do
    if grep -q "@Injectable\|@Inject\|@nestjs" "$file"; then
        echo "  ⚠️  Found NestJS dependency in domain: $file"
        clean_file "$file"
    fi
done

echo "✅ Clean Architecture compliance restored!"
echo "📋 Summary:"
echo "   - Removed @Injectable decorators"
echo "   - Removed @Inject decorators"
echo "   - Removed NestJS imports"
echo "   - Preserved constructor injection via interfaces"

# Verify no NestJS dependencies remain
echo ""
echo "🔍 Verification - Searching for remaining violations..."
nestjs_violations=$(find src/application src/domain -name "*.ts" -exec grep -l "@Injectable\|@Inject\|@nestjs" {} \; 2>/dev/null | wc -l)

if [ "$nestjs_violations" -eq 0 ]; then
    echo "✅ Perfect! No NestJS dependencies found in Domain/Application layers"
else
    echo "⚠️  Found $nestjs_violations files with remaining NestJS dependencies:"
    find src/application src/domain -name "*.ts" -exec grep -l "@Injectable\|@Inject\|@nestjs" {} \; 2>/dev/null
fi
