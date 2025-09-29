import re

filepath = 'src/infrastructure/database/sql/postgresql/repositories/business-sector.repository.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Ajouter l'import si pas déjà présent
if 'InfrastructureException' not in content:
    # Chercher le premier import
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import '):
            lines.insert(i+1, 'import { InfrastructureException } from \'@shared/exceptions/shared.exceptions\';')
            break
    content = '\n'.join(lines)

# Correction des patterns throw new Error
patterns = [
    (r"throw new Error\('([^']+)'\);", r'throw new InfrastructureException("\1", "INFRASTRUCTURE_ERROR");'),
    (r'throw new Error\("([^"]+)"\);', r'throw new InfrastructureException("\1", "INFRASTRUCTURE_ERROR");'),
    (r"throw new Error\(`([^`]+)`\);", r'throw new InfrastructureException(`\1`, "INFRASTRUCTURE_ERROR");')
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print('business-sector.repository.ts traité - 1 violation corrigée')
