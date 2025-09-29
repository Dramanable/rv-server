import re

filepath = 'src/infrastructure/database/sql/postgresql/repositories/typeorm-business.repository.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Ajouter import InfrastructureException
if 'InfrastructureException' not in content:
    content = content.replace(
        'import { Repository } from \'typeorm\';',
        'import { Repository } from \'typeorm\';\nimport { InfrastructureException } from \'@shared/exceptions/shared.exceptions\';'
    )

# Remplacer throw new Error par InfrastructureException
content = content.replace('throw new Error(', 'throw new InfrastructureException(')

# Patterns avec template literal simple - ajouter code d'erreur
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'throw new InfrastructureException(`' in line and line.strip().endswith(');'):
        # Pattern simple sur une ligne - ajouter le code
        lines[i] = line.replace(');', ', "INFRASTRUCTURE_ERROR");')

content = '\n'.join(lines)

with open(filepath, 'w') as f:
    f.write(content)

print('typeorm-business.repository.ts traité avec succès')
