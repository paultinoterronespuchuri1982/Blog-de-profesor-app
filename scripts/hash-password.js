// scripts/hash-password.js
// Prints a hash for ADMIN_PASSWORD_HASH. The password is read from stdin,
// so it does not end up in the shell history:
//   node scripts/hash-password.js < /dev/tty
const { hashPassword } = require('../src/utils/password');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const password = input.replace(/\r?\n$/, '');
  if (password.length < 8) {
    console.error('Use uma senha com pelo menos 8 caracteres.');
    process.exit(1);
  }
  console.log(hashPassword(password));
});
