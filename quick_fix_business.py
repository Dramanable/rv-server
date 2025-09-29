# Correction rapide des 8 patterns multi-lignes restants
filepath = 'src/infrastructure/database/sql/postgresql/repositories/typeorm-business.repository.ts'

with open(filepath, 'r') as f:
    lines = f.readlines()

# Patterns à corriger - ajouter le code d'erreur manquant
for i, line in enumerate(lines):
    if 'throw new InfrastructureException(' in line and i+2 < len(lines) and lines[i+2].strip() == ');':
        if 'Failed to find business by id:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to find business by name:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to find businesses by sector:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to search businesses:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to save business:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to delete business:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to check business name existence:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        elif 'Failed to get business statistics:' in lines[i+1]:
            lines[i+2] = '        "INFRASTRUCTURE_ERROR"\n      );\n'
        
        # Ajouter virgule à la fin de la ligne précédente si elle n'en a pas
        if not lines[i+1].rstrip().endswith(','):
            lines[i+1] = lines[i+1].rstrip() + ',\n'

with open(filepath, 'w') as f:
    f.writelines(lines)

print('8 patterns multi-lignes corrigés dans typeorm-business.repository.ts')
