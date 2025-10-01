const bcrypt = require('bcrypt');

async function updatePassword() {
  const newPassword = 'Amadou@123!';
  const saltRounds = 12;

  console.log('Generating hash for password:', newPassword);
  const hash = await bcrypt.hash(newPassword, saltRounds);
  console.log('New hash:', hash);

  // Vérification que le hash fonctionne
  const isValid = await bcrypt.compare(newPassword, hash);
  console.log('Hash verification:', isValid);
}

updatePassword().catch(console.error);
