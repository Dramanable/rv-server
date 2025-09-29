import re

filepath = 'src/infrastructure/database/sql/postgresql/repositories/typeorm-calendar.repository.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Ajouter l'import si pas déjà présent
if 'InfrastructureException' not in content:
    import_pattern = r"import { Repository, QueryRunner, Brackets } from 'typeorm';"
    import_replacement = """import { Repository, QueryRunner, Brackets } from 'typeorm';
import { InfrastructureException } from '@shared/exceptions/shared.exceptions';"""
    content = re.sub(import_pattern, import_replacement, content)

# Correction des patterns throw new Error
patterns = [
    (r"throw new Error\('([^']+)'\);", r'throw new InfrastructureException("\1", "INFRASTRUCTURE_ERROR");'),
    (r'throw new Error\("([^"]+)"\);', r'throw new InfrastructureException("\1", "INFRASTRUCTURE_ERROR");'),
    (r"throw new Error\(`([^`]+)`\);", r'throw new InfrastructureException(`\1`, "INFRASTRUCTURE_ERROR");'),
    (r'throw new Error\(\s*`([^`]+)`\s*\);', r'throw new InfrastructureException(`\1`, "INFRASTRUCTURE_ERROR");')
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print('typeorm-calendar.repository.ts traité - 14 violations corrigées')
