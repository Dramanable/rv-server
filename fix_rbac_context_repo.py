filepath = 'src/infrastructure/database/sql/postgresql/repositories/typeorm-rbac-business-context.repository.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Ajouter import InfrastructureException
if 'InfrastructureException' not in content:
    content = content.replace(
        'import { Injectable } from \'@nestjs/common\';',
        'import { Injectable } from \'@nestjs/common\';\nimport { InfrastructureException } from \'@shared/exceptions/shared.exceptions\';'
    )

# Remplacer throw new Error par InfrastructureException
content = content.replace('throw new Error(', 'throw new InfrastructureException(')

# Ajouter code d'erreur pour les patterns avec translate
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.saveError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.saveError\'), \'RBAC_SAVE_ERROR\');'
)
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.findError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.findError\'), \'RBAC_FIND_ERROR\');'
)
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.findAllError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.findAllError\'), \'RBAC_FIND_ALL_ERROR\');'
)
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.existsError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.existsError\'), \'RBAC_EXISTS_ERROR\');'
)
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.deleteError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.deleteError\'), \'RBAC_DELETE_ERROR\');'
)
content = content.replace(
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.statsError\'));',
    'throw new InfrastructureException(this.i18n.translate(\'rbac.businessContext.statsError\'), \'RBAC_STATS_ERROR\');'
)

with open(filepath, 'w') as f:
    f.write(content)

print('typeorm-rbac-business-context.repository.ts traité avec succès')
