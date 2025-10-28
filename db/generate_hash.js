const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Generar hash para admin123
const adminHash = hashPassword('admin123');
console.log('Hash para admin123:', adminHash);

// También generar hash para un usuario de prueba
const userHash = hashPassword('user123');
console.log('Hash para user123:', userHash);