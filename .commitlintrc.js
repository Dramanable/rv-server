module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 🎉 Nouvelle fonctionnalité
        'fix', // 🐛 Correction de bug
        'docs', // 📚 Documentation
        'style', // 💄 Formatage, points-virgules, etc. (pas de changement de code)
        'refactor', // ♻️ Refactoring (ni fonctionnalité ni correction)
        'perf', // ⚡ Amélioration des performances
        'test', // ✅ Ajout/modification des tests
        'chore', // 🔧 Tâches de maintenance, outils, etc.
        'ci', // 🚀 Configuration CI/CD
        'revert', // ⏪ Annulation d'un commit précédent
        'security', // 🔐 Corrections de sécurité
        'i18n', // 🌐 Internationalisation
        'a11y', // ♿ Accessibilité
        'hotfix', // 🚨 Correction urgente en production
      ],
    ],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};
