/**
 * 🔑 Script d'instructions pour créer un Super Admin de test
 *
 * Credentials qui seront créés:
 * Email: test@admin.com
 * Password: amadou
 * Role: PLATFORM_ADMIN
 */

// Afficher les instructions directement
console.log("🔑 CRÉATION D'UN SUPER ADMIN POUR TESTS");
console.log("=====================================\n");

console.log("📄 Pour créer l'utilisateur, exécutez le script SQL:");
console.log("   scripts/create-test-admin.sql\n");

console.log("🎯 Credentials qui seront créés:");
console.log("   Email: test@admin.com");
console.log("   Password: amadou");
console.log("   Role: PLATFORM_ADMIN\n");

console.log("💻 Instructions:");
console.log(
  "1. Démarrez la base de données: npm run start:dev ou docker-compose up",
);
console.log("2. Connectez-vous à pgAdmin (localhost:5050)");
console.log("3. Exécutez le contenu du fichier scripts/create-test-admin.sql");
console.log("4. Testez la connexion avec les credentials ci-dessus\n");

console.log("🧪 Ou utilisez psql directement:");
console.log(
  "   psql -h localhost -U admin -d nestjs_db -f scripts/create-test-admin.sql\n",
);
